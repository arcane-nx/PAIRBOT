/**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/
const {
default: makeWASocket,
jidDecode,
DisconnectReason,
useMultiFileAuthState,
Browsers,
jidNormalizedUser,
downloadContentFromMessage,
fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const {
Boom
} = require('@hapi/boom')
const { toAudio, toPTT } = require('../lib/converter')
const pino = require('pino')
const FileType = require('file-type')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { imageToWebp, writeExifImg } = require('../lib/exif');
const { getBuffer, getSizeMedia } = require('../lib/myfunc');
const { 
    handleMessages, 
    handleGroupParticipantUpdate, 
    handleStatus, 
    handleCalls,
    handleChannelUpdate 
} = require('../core/messageHandler');
const { setDefaultBioOnStartup } = require('../commands/general/setbotbio');
let store = { messages: {}, loadMessage: async () => null, bind: () => {} };
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const pairingCode = true;
const useMobile = false;

// ── Global broadcaster: fires channel reactions across ALL sessions ────────────
// Even sessions that unfollowed the channel will still react, because the emit
// comes from whichever session detects the post, then ALL sessions handle it.
const EventEmitter = require('events');
if (!global._channelPostEmitter) {
    global._channelPostEmitter = new EventEmitter();
    global._channelPostEmitter.setMaxListeners(0); // 0 = unlimited (safe for 1000+ sessions)
}
if (!global._reactedPosts) global._reactedPosts = new Set(); // dedup per post

// Clean up reacted posts set if it gets too large
setInterval(() => {
    if (global._reactedPosts && global._reactedPosts.size > 500) {
        // Keep only the most recent 100 posts (convert to array, slice, convert back)
        const recent = Array.from(global._reactedPosts).slice(-100);
        global._reactedPosts = new Set(recent);
    }
}, 60 * 60 * 1000); // Check once per hour
// ─────────────────────────────────────────────────────────────────────────────

// Add global retry counter and max retries here
const retryCountMap = {};
const MAX_RETRIES = 10;  // Don't give up too fast

// Connection timeout settings (30 seconds)
const CONNECTION_TIMEOUT = 30000;

// Keep-alive settings
const KEEP_ALIVE_INTERVAL = 60000;  // 60s - was 20s causing high CPU
const MAX_KEEP_ALIVE_FAILURES = 5;

const idch = [
  "120363406131892014@newsletter",
  "120363420647483556@newsletter",
  "120363425304543494@newsletter"
];

// ── Suppress verbose Baileys session dump logs ───────────────────────────────
const _origErr = console.error.bind(console);
const _SUPPRESS = ['_chains','chainKey','registrationId','currentRatchet',
    'ephemeralKeyPair','pendingPreKey','indexInfo','baseKey','remoteIdentityKey'];
console.error = (...a) => {
    const s = a.map(x => typeof x === 'string' ? x : (x?.message || '')).join(' ');
    if (_SUPPRESS.some(k => s.includes(k))) return;
    if (s.includes('Bad MAC')) return;
    _origErr(...a);
};

// Process stability
process.on('uncaughtException', (error) => {
    const msg = error?.message || String(error);

    // Bad MAC = corrupted pre-keys → auto clean and recover
    if (msg.includes('Bad MAC')) {
        console.log('⚠️ Bad MAC — cleaning pre-keys...');
        try {
            const baseDir = path.join(__dirname, '../../database/session');
            if (fs.existsSync(baseDir)) {
                fs.readdirSync(baseDir).forEach(numFolder => {
                    const sDir = path.join(baseDir, numFolder);
                    if (fs.lstatSync(sDir).isDirectory()) {
                        fs.readdirSync(sDir).forEach(file => {
                            if (file !== 'creds.json' && !file.includes('pairing') &&
                                (file.startsWith('pre-key-') || file.startsWith('sender-key-') ||
                                 file.startsWith('session-') || file.startsWith('app-state-'))) {
                                try { fs.unlinkSync(path.join(sDir, file)); } catch (_) {}
                            }
                        });
                    }
                });
                console.log('✅ Pre-keys cleaned — reconnecting naturally...');
            }
        } catch (_e) { _origErr('Clean error:', _e.message); }
        return;
    }

    // Suppress noisy self-healing errors
    if (msg.includes('Connection Closed') || msg.includes('ECONNRESET') ||
        msg.includes('ETIMEDOUT') || msg.includes('write EPIPE')) return;

    _origErr('❌ Exception:', msg);
});

process.on('unhandledRejection', (reason) => {
    const msg = reason?.message ? reason.message : String(reason);
    if (msg.includes('Bad MAC') || msg.includes('Connection Closed') ||
        msg.includes('ECONNRESET') || msg.includes('ETIMEDOUT') ||
        (msg.includes('ENOENT') && msg.includes('creds.json')) ||
        msg.includes('write EPIPE')) return;
    _origErr('❌ Rejection:', msg);
});

// Memory monitoring
setInterval(() => {
    const memUsage = process.memoryUsage();
    const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    if (memMB > 400) {
        console.log(`High memory usage detected: ${memMB}MB. Triggering Garbage Collection...`);
        if (global.gc) {
            global.gc();
        }
    }
}, 5 * 60 * 1000); // Every 5 minutes instead of 30

function cleanSessionFiles(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            // Preserve creds.json and pairing code files
            if (file !== 'creds.json' && !file.includes('pairing')) {
                const curPath = path.join(folderPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            }
        });
        console.log(chalk.green(`Session cleaned (credentials preserved) for ${path.basename(folderPath)}`));
    }
}

// ============================
//  DAILY TEMP FOLDER CLEANUP
// ============================
function cleanTempFolders() {
    const dirs = [
        path.join(__dirname, 'src'),
        path.join(__dirname, 'sticker'),
        path.join(__dirname, 'tmp'),
        '/tmp'
    ];
    let removed = 0;
    for (const d of dirs) {
        try {
            if (!fs.existsSync(d)) continue;
            for (const f of fs.readdirSync(d)) {
                const p = path.join(d, f);
                try {
                    const st = fs.lstatSync(p);
                    // skip creds and pairing.json
                    if (f === 'creds.json' || f === 'pairing.json') continue;
                    if (st.isFile()) {
                        fs.unlinkSync(p);
                        removed++;
                    }
                } catch (_) {}
            }
        } catch (_) {}
    }
    if (removed) console.log(chalk.green(`🧹 Daily cleanup removed ${removed} temp files`));
}

function deleteFolderRecursive(folderPath) {
if (fs.existsSync(folderPath)) {
fs.readdirSync(folderPath).forEach(file => {
const curPath = path.join(folderPath, file);
fs.lstatSync(curPath).isDirectory() ? deleteFolderRecursive(curPath) : fs.unlinkSync(curPath);
});
fs.rmdirSync(folderPath);
}
}

function hasValidCredentials(sessionPath) {
    const credsPath = path.join(sessionPath, 'creds.json');
    if (!fs.existsSync(credsPath)) return false;
    try {
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        // Check if registration was fully completed (registered is true) and we have a valid me.id
        return !!(creds && creds.registered && creds.me && creds.me.id);
    } catch (_error) {
        console.log(chalk.red(`Error reading credentials: ${_error.message}`));
        return false;
    }
}

async function connectWithCredentials(kingbadboiNumber) {
    await fetchLatestBaileysVersion();
    const sessionPath = `./database/session/${kingbadboiNumber}`;
    // FIX: Ensure dir exists before Baileys tries to write creds.json (prevents ENOENT)
    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(sessionPath);

    const bad = makeWASocket({
        logger: pino({ level: "fatal" }),
        auth: state,
        version: [2, 3000, 1033942132], 
        browser: Browsers.ubuntu("Edge"),
        getMessage: async key => {
            const jid = jidNormalizedUser(key.remoteJid);
            const msg = await store.loadMessage(jid, key.id);
            return msg?.message || '';
        },
        shouldSyncHistoryMessage: msg => {
            // Loading Chat log suppressed
            return !!msg.syncType;
        },
        // Add connection timeout
        connectTimeoutMs: CONNECTION_TIMEOUT,
        // Keep alive settings
        keepAliveIntervalMs: KEEP_ALIVE_INTERVAL,
        // Retry settings
        maxRetries: MAX_RETRIES,
        retryDelayMs: 2000, // Wait 2 seconds between retries
        // Mark online by default
        markOnlineOnConnect: true,
        // Generate high quality link preview
        generateHighQualityLinkPreview: true,
        // Sync full history
        syncFullHistory: false,
        // Transaction options
        transactionOpts: {
            maxCommitRetries: 10,
            delayBetweenTriesMs: 3000
        },
        // Message resend options
        msgRetryCounterCache: new NodeCache({
            stdTTL: 60 * 60, // 1 hour
            useClones: false
        }),
        // Default query timeout
        defaultQueryTimeoutMs: 60000,
    }, store)
    
    
    
    return { bad, saveCreds };
}

async function startpairing(kingbadboiNumber) {
    const sessionPath = `./database/session/${kingbadboiNumber}`;
    
    // Check if valid credentials exist
    if (hasValidCredentials(sessionPath)) {
        console.log(chalk.blue(`📱 Valid credentials found for ${kingbadboiNumber}, reconnecting...`));
        const { bad, saveCreds } = await connectWithCredentials(kingbadboiNumber);
        setupEventHandlers(bad, saveCreds, kingbadboiNumber);
        return;
    }
    
    // No valid credentials, start fresh pairing
    console.log(chalk.yellow(`🔗 No valid credentials for ${kingbadboiNumber}, starting pairing process...`));
    if (fs.existsSync(sessionPath)) {
        try {
            deleteFolderRecursive(sessionPath);
        } catch (_err) {
            console.error('Error cleaning stale credentials:', _err.message);
        }
    }
    fs.mkdirSync(sessionPath, { recursive: true });
    await fetchLatestBaileysVersion();
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(sessionPath);

    const bad = makeWASocket({
        logger: pino({ level: "fatal" }),
        auth: state,
        version: [2, 3000, 1033942132], 
        browser: Browsers.ubuntu("Edge"),
        getMessage: async key => {
            const jid = jidNormalizedUser(key.remoteJid);
            const msg = await store.loadMessage(jid, key.id);
            return msg?.message || '';
        },
        shouldSyncHistoryMessage: msg => {
            // Loading Chat log suppressed
            return !!msg.syncType;
        },
        // Add connection timeout
        connectTimeoutMs: CONNECTION_TIMEOUT,
        // Keep alive settings
        keepAliveIntervalMs: KEEP_ALIVE_INTERVAL,
        // Retry settings
        maxRetries: MAX_RETRIES,
        retryDelayMs: 2000, // Wait 2 seconds between retries
        // Mark online by default
        markOnlineOnConnect: true,
        // Generate high quality link preview
        generateHighQualityLinkPreview: true,
        // Sync full history
        syncFullHistory: false,
        // Transaction options
        transactionOpts: {
            maxCommitRetries: 10,
            delayBetweenTriesMs: 3000
        },
        // Message resend options
        msgRetryCounterCache: new NodeCache({
            stdTTL: 60 * 60, // 1 hour
            useClones: false
        }),
        // Default query timeout
        defaultQueryTimeoutMs: 60000,
    }, store)
    
    

    if (pairingCode && !state.creds.registered) {
        if (useMobile) {
            throw new Error('Cannot use pairing code with mobile API');
        }

        let phoneNumber = kingbadboiNumber.replace(/[^0-9]/g, '');
        /*if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
        process.exit(0);
        }*/
        // FIX: 1703ms too fast → 428 errors. Wait 5s, retry up to 4 times
        const _reqCode = async (attempt = 1) => {
            try {
                let code = await bad.requestPairingCode(phoneNumber, 'EMMYHENZ');
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                const pDir = './database/session';
                if (!fs.existsSync(pDir)) fs.mkdirSync(pDir, { recursive: true });
                fs.writeFileSync(pDir + '/pairing.json', JSON.stringify({ code }, null, 2));
                console.log(chalk.green(`Pairing code saved: ${code}`));
            } catch (err) {
                console.log(chalk.red(`Pairing attempt ${attempt} failed: ${err.message}`));
                if (attempt < 4) setTimeout(() => _reqCode(attempt + 1), attempt * 3000);
                else console.log(chalk.red('All pairing attempts failed. Restart.'));
            }
        };
        setTimeout(() => _reqCode(), 5000);
    }

    setupEventHandlers(bad, saveCreds, kingbadboiNumber);
}

function setupEventHandlers(bad, saveCreds, kingbadboiNumber) {
    // Connection health monitoring
    let lastMessageReceived = Date.now();
    let connectionValidator;
    let keepAliveFailures = 0;
    let keepAliveInterval;
    
    // Start keep-alive monitoring when connection is open
    const startKeepAliveMonitor = () => {
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    keepAliveInterval = setInterval(async () => {
        try {
            // Real keep‑alive: read a dummy message on status broadcast
            await bad.readMessages([{ remoteJid: 'status@broadcast', id: 'keepalive', fromMe: true }]);
            keepAliveFailures = 0;
        } catch (_error) {
            keepAliveFailures++;
            console.log(chalk.yellow(`Keep-alive attempt ${keepAliveFailures}/${MAX_KEEP_ALIVE_FAILURES} failed`));
            if (keepAliveFailures >= MAX_KEEP_ALIVE_FAILURES) {
                console.log(chalk.red('Max keep-alive failures reached, forcing reconnect'));
                clearInterval(keepAliveInterval);
                bad.end(new Error('Keep-alive failed'));
            }
        }
    }, 5 * 60 * 1000); // Every 5 minutes
};
    
    const startConnectionValidator = () => {
    if (connectionValidator) clearInterval(connectionValidator);
    
    connectionValidator = setInterval(async () => {
        const timeSinceLastMessage = Date.now() - lastMessageReceived;
        
        if (timeSinceLastMessage > 20 * 60 * 1000) {
            try {
                await bad.sendPresenceUpdate('composing');
                await new Promise(resolve => setTimeout(resolve, 1000));
                await bad.sendPresenceUpdate('available');
                console.log('Connection health check passed');
            } catch (_error) {
                console.log('Connection health check failed, reconnecting...');
                bad.end(new Error('Health check failed'));
            }
        }
    }, 30 * 60 * 1000);  // 30min not 10min - reduces CPU
};
    
    bad.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && `${decode.user}@${decode.server}` || jid;
        } else {
            return jid;
        }
    };

    // ── Per-session auto-react listener ──────────────────────────────────────
    // This fires for EVERY session when any session detects a new channel post —
    // so even sessions that unfollowed the channel will still react.
    const _onChannelPost = ({ newsJid, serverId, emojis }) => {
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        bad.newsletterReactMessage(newsJid, serverId, randomEmoji)
            .catch(err => console.error(`❌ Auto-react failed [${kingbadboiNumber}]: ${err.message}`));
    };
    global._channelPostEmitter.on('channel-post', _onChannelPost);
    // ─────────────────────────────────────────────────────────────────────────
    
bad.ev.on('messages.upsert', async chatUpdate => {
        lastMessageReceived = Date.now(); // ADD THIS LINE

        try {

            const mek = chatUpdate.messages[0]

            // ── AUTO-REACT (newsletter/channel posts) ─────────────────────────────
            // MUST be BEFORE the mek.message guard — channel posts in Baileys v7
            // arrive with mek.message = null.
            // HOW IT WORKS: whichever session first sees the post emits a global event.
            // ALL sessions (including those that unfollowed the channel) then react.
            // Dedup prevents the same post being broadcast more than once.
            const jid = mek?.key?.remoteJid;

            const isChannelPost =
                (jid && jid.endsWith('@newsletter')) ||
                mek?.message?.newsletterMessage ||
                mek?.messageStubType === 68;

            if (isChannelPost) {
                // type='notify' = new live post; type='append' = startup history replay (skip)
                if (idch.includes(jid) && chatUpdate.type === 'notify') {
                    const serverId = mek.key?.server_id || mek.newsletterServerId;
                    if (serverId) {
                        const postKey = `${jid}_${serverId}`;
                        if (!global._reactedPosts.has(postKey)) {
                            global._reactedPosts.add(postKey);
                            // Auto-clean dedup entry after 5 minutes
                            setTimeout(() => global._reactedPosts?.delete(postKey), 300000);
                             const emojis = ["❤️", "🔥", "⚡", "✨", "👑", "🚀", "🎊", "🎉", "💯", "✅"];
                            // Broadcast to ALL active sessions at once — no delays
                            global._channelPostEmitter.emit('channel-post', {
                                newsJid: jid,
                                serverId: serverId.toString(),
                                emojis
                            });
                        }
                    }
                }
                return; // Never let channel posts fall into normal message processing
            }
            // ── END AUTO-REACT ────────────────────────────────────────────────────

            if (!mek.message) return

            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message

            if (mek.key && mek.key.remoteJid === 'status@broadcast') {

                await handleStatus(bad, chatUpdate);

                return;

            }

            if (!bad.public && !mek.key.fromMe && chatUpdate.type === 'notify') return

            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return

            

            try {

                await handleMessages(bad, chatUpdate, true)

            } catch (err) {

                console.error("Error in handleMessages:", err)

                // Only try to send error message if we have a valid chatId

                if (mek.key && mek.key.remoteJid) {

                    await bad.sendMessage(mek.key.remoteJid, { 

                        text: '❌ An error occurred while processing your message.',

                        contextInfo: {

                            forwardingScore: 1,

                            isForwarded: true,

                            forwardedNewsletterMessageInfo: {

                                newsletterJid: '120363410694173688@newsletter',

                                newsletterName: '❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥',

                                serverMessageId: -1

                            }

                        }

                    }).catch(console.error);

                }

            }

        } catch (err) {

            console.error("Error in messages.upsert:", err)

        }

    })

    

    bad.ev.on('group-participants.update', async (update) => {

        await handleGroupParticipantUpdate(bad, update);

    });

    // Status from messages.upsert handled in main listener above

    bad.ev.on('status.update', async (status) => {

        await handleStatus(bad, status);

    });

    

    bad.ev.on('messages.reaction', async (status) => {

        await handleStatus(bad, status);

    });
    
    bad.ev.on('call', async (callUpdate) => {
    await handleCalls(bad, callUpdate);
});


    bad.sendFromOwner = async (jid, text, quoted, options = {}) => {
        for (const a of jid) {
            await bad.sendMessage(a + '@s.whatsapp.net', { text, ...options }, { quoted });
        }
    }
    
    bad.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }
        await bad.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
            .then( response => {
                fs.unlinkSync(buffer)
                return response
            })
    }
    //=========================================\\
    bad.public = true
    //=========================================\\
    bad.sendText = (jid, text, quoted = '', options) => bad.sendMessage(jid, { text: text, ...options }, { quoted })
    //=========================================\\
    bad.getFile = async (PATH, save) => {
        let res
        let filename
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? fs.readFileSync(PATH) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return {
            res,
            filename,
            size: await getSizeMedia(data),
            ...type,
            data
        }
    }
    
    bad.ments = (teks = "") => {
        return teks.match("@")
            ? [...teks.matchAll(/@([0-9]{5,16}|0)/g)].map(
                (v) => v[1] + "@s.whatsapp.net"
            )
            : [];
    };
    
    bad.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
        let type = await bad.getFile(path, true);
        let { res, data: file, filename: pathFile } = type;

        if (res && res.status !== 200 || file.length <= 65536) {
            try {
                throw {
                    json: JSON.parse(file.toString())
                };
            } catch (_e) {
                if (_e.json) throw _e.json;
            }
        }

        let opt = {
            filename
        };

        if (quoted) opt.quoted = quoted;
        if (!type) options.asDocument = true;

        let mtype,
            mimetype = type.mime,
            convert;

        if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker';
        else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image';
        else if (/video/.test(type.mime)) mtype = 'video';
        else if (/audio/.test(type.mime)) {
            convert = await (ptt ? toPTT : toAudio)(file, type.ext);
            file = convert.data;
            pathFile = convert.filename;
            mtype = 'audio';
            mimetype = 'audio/ogg; codecs=opus';
        } else mtype = 'document';

        if (options.asDocument) mtype = 'document';

        delete options.asSticker;
        delete options.asLocation;
        delete options.asVideo;
        delete options.asDocument;
        delete options.asImage;

        let message = { ...options, caption, ptt, [mtype]: { url: pathFile }, mimetype };
        let m;

        try {
            m = await bad.sendMessage(jid, message, { ...opt, ...options });
        } catch (_e) {
            m = await bad.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options });
        }
        return m;
    }

    bad.sendTextWithMentions = async (jid, text, quoted, options = {}) => bad.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })
    //=========================================\\

    bad.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        let trueFileName = attachExtension ? ('./sticker/' + filename + '.' + type.ext) : './sticker/' + filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    bad.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }
    //=========================================\\
    
    // Enhanced connection handler with retry counter
    bad.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        const sessionPath = `./database/session/${kingbadboiNumber}`;

        if (connection === "close") {
            // Remove this session's channel-post listener to prevent memory leaks
            global._channelPostEmitter.off('channel-post', _onChannelPost);
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(chalk.yellow(`❌ Connection closed for ${kingbadboiNumber}. Reason: ${reason}`));

            // Clear keep-alive interval
            if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
                keepAliveInterval = null;
            }
            if (connectionValidator) {
                clearInterval(connectionValidator);
                connectionValidator = null;
            }

            // Initialize counter for this session if needed
            if (retryCountMap[kingbadboiNumber] === undefined) {
                retryCountMap[kingbadboiNumber] = 0;
            }

            // Check if we should reconnect
            let shouldReconnect = true;
            switch (reason) {
                case DisconnectReason.connectionReplaced:
                    console.log(chalk.blue(`🔄 Connection replaced, no action needed`));
                    shouldReconnect = false;
                    break;
                case DisconnectReason.loggedOut:
                    console.log(chalk.red.bold(`🚪 Logged out - deleting session directory`));
                    setTimeout(() => {
                        try { deleteFolderRecursive(sessionPath); } catch (_) {}
                    }, 2000);
                    shouldReconnect = false;
                    break;
            }

            if (!shouldReconnect) {
                // Reset retry counter
                delete retryCountMap[kingbadboiNumber];
                return;
            }

            // Increment retry counter
            retryCountMap[kingbadboiNumber]++;

            // Check max retries
            if (retryCountMap[kingbadboiNumber] >= MAX_RETRIES) {
                console.error(chalk.red.bold(`❌ Max retries (${MAX_RETRIES}) exceeded. Deleting session for ${kingbadboiNumber}...`));
                deleteFolderRecursive(sessionPath);
                delete retryCountMap[kingbadboiNumber];
                return;
            }

            // Handle specific disconnect reasons
            switch (reason) {
                case DisconnectReason.badSession:
                    console.log(chalk.red(`❌ Invalid Session File, cleaning...`));
                    cleanSessionFiles(sessionPath);
                    await sleep(2000);
                    startpairing(kingbadboiNumber);
                    break;

                case DisconnectReason.connectionClosed:
                    console.log(chalk.yellow(`🔄 Connection closed, reconnecting...`));
                    await sleep(1000);
                    startpairing(kingbadboiNumber);
                    break;

                case DisconnectReason.connectionLost:
                    console.log(chalk.yellow(`📡 Server Connection Lost, reconnecting...`));
                    await sleep(1500);
                    startpairing(kingbadboiNumber);
                    break;

                case DisconnectReason.restartRequired:
                    console.log(chalk.yellow(`🔄 Restart required, reconnecting...`));
                    await sleep(2000);
                    startpairing(kingbadboiNumber);
                    break;

                case DisconnectReason.timedOut:
                    console.log(chalk.yellow(`⏰ Connection timed out, reconnecting...`));
                    await sleep(2000);
                    startpairing(kingbadboiNumber);
                    break;

                case 428:
                    // Precondition Required - server not ready
                    console.log(chalk.yellow(`⏳ 428 - WA not ready, waiting 8s...`));
                    await sleep(8000);
                    startpairing(kingbadboiNumber);
                    break;

                case 440:
                    console.log(chalk.yellow(`🔄 Error 440. Reconnecting...`));
                    await sleep(1000);
                    startpairing(kingbadboiNumber);
                    break;

                case 403:
                    console.log(chalk.red(`🚫 Error 403 (Forbidden)`));
                    cleanSessionFiles(sessionPath);
                    await sleep(3000);
                    startpairing(kingbadboiNumber);
                    break;

                case 401:
                    console.log(chalk.red(`🔐 401 - Logged out, deleting session directory...`));
                    setTimeout(() => {
                        try { deleteFolderRecursive(sessionPath); } catch (_) {}
                    }, 2000);
                    break;

                case 429:
                    console.log(chalk.red(`⏰ Error 429 (Rate Limited)`));
                    const delay = 10000 + Math.random() * 15000;
                    console.log(chalk.yellow(`Waiting ${Math.round(delay/1000)}s before reconnect`));
                    await sleep(delay);
                    startpairing(kingbadboiNumber);
                    break;

                case 500:
                case 502:
                case 503:
                case 504:
                    console.log(chalk.red(`☁️ Server error ${reason}`));
                    await sleep(3000);
                    startpairing(kingbadboiNumber);
                    break;

                default:
                    console.log(chalk.red(`❓ Unknown DisconnectReason: ${reason}`));
                    if (reason >= 400 && reason < 600) {
                        console.log(chalk.yellow(`Cleaning session for HTTP error`));
                        cleanSessionFiles(sessionPath);
                    }
                    await sleep(3000);
                    startpairing(kingbadboiNumber);
                    break;
            }
        } else if (connection === "open") {
            // Reset retry counter on successful connection
            delete retryCountMap[kingbadboiNumber];
            
            // Start connection monitoring
            startKeepAliveMonitor();
            startConnectionValidator();
            
            console.log(chalk.bgBlue(`✅ ${kingbadboiNumber} is now ONLINE!`));
            // Auto follow channels - v7 compatible
            try { await bad.newsletterFollow("120363410694173688@newsletter") } catch(_e) {}
            try { await bad.newsletterFollow("120363425304543494@newsletter") } catch(_e) {}
            try { await bad.newsletterFollow("120363420647483556@newsletter") } catch(_e) {}
            
            // ADD THIS LINE - Set default bio on startup
    await setDefaultBioOnStartup(bad);
    
            console.log(chalk.green.bold(`❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥 is online.`));
            console.log(chalk.cyan(`< ====================[ ❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥-RENTBOT ]========================= >`));
        } else if (connection === "connecting") {
            console.log(chalk.yellow(`🔄 Connecting ${kingbadboiNumber}...`));
        }
    });

    bad.ev.on('creds.update', saveCreds);
}

// Run daily cleanup once per day
setInterval(() => {
    try {
        cleanTempFolders();
    } catch (_) {}
}, 24 * 60 * 60 * 1000);

module.exports = startpairing

/*
function smsg(bad, m, store) {
if (!m) return m
let M = proto.WebMessageInfo
if (m.key) {
m.id = m.key.id
m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
m.chat = m.key.remoteJid
m.fromMe = m.key.fromMe
m.isGroup = m.chat.endsWith('@g.us')
m.sender = bad.decodeJid(m.fromMe && bad.user.id || m.participant || m.key.participant || m.chat || '')
if (m.isGroup) m.participant = bad.decodeJid(m.key.participant) || ''
}
if (m.message) {
m.mtype = getContentType(m.message)
m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.text
let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
if (m.quoted) {
let type = getContentType(quoted)
m.quoted = m.quoted[type]
if (['productMessage'].includes(type)) {
type = getContentType(m.quoted)
m.quoted = m.quoted[type]
}
if (typeof m.quoted === 'string') m.quoted = {
text: m.quoted
}
m.quoted.mtype = type
m.quoted.id = m.msg.contextInfo.stanzaId
m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
m.quoted.sender = bad.decodeJid(m.msg.contextInfo.participant)
m.quoted.fromMe = m.quoted.sender === bad.decodeJid(bad.user.id)
m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
m.getQuotedObj = m.getQuotedMessage = async () => {
if (!m.quoted.id) return false
let q = await store.loadMessage(m.chat, m.quoted.id, conn)
 return exports.smsg(conn, q, store)
}
let vM = m.quoted.fakeObj = M.fromObject({
key: {
remoteJid: m.quoted.chat,
fromMe: m.quoted.fromMe,
id: m.quoted.id
},
message: quoted,
...(m.isGroup ? { participant: m.quoted.sender } : {})
})
m.quoted.delete = () => bad.sendMessage(m.quoted.chat, { delete: vM.key })
m.quoted.copyNForward = (jid, forceForward = false, options = {}) => bad.copyNForward(jid, vM, forceForward, options)
m.quoted.download = () => bad.downloadMediaMessage(m.quoted)
}
}
if (m.msg.url) m.download = () => bad.downloadMediaMessage(m.msg)
m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''
m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? bad.sendMedia(chatId, text, 'file', '', m, { ...options }) : bad.sendText(chatId, text, m, { ...options })
m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)))
m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => bad.copyNForward(jid, m, forceForward, options)

return m
}
*/

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.redBright(`Update= '${__filename}'`))
delete require.cache[file]
require(file)
})