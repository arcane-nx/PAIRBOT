const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} = require("@whiskeysockets/baileys");
const P = require("pino");
const path = require("path");
const fs = require("fs");

function hasValidCredentials(sessionPath) {
    try {
        const credsPath = path.join(sessionPath, 'creds.json');
        if (!fs.existsSync(credsPath)) return false;
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
        return creds && creds.registered === true;
    } catch (_) {
        return false;
    }
}

function cleanMainSession(sessionPath) {
    if (!fs.existsSync(sessionPath)) return;
    try {
        const files = fs.readdirSync(sessionPath);
        for (const file of files) {
            const filePath = path.join(sessionPath, file);
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            }
        }
    } catch (_err) {
        console.error('Error cleaning main session files:', _err.message);
    }
}

async function connectToWhatsApp(onMessage, onConnectionUpdate, onCredsUpdate) {
    const sessionPath = path.join(__dirname, "../../database/session");

    if (!hasValidCredentials(sessionPath)) {
        console.log("ℹ️ No valid main bot credentials found in database/session. Skipping main bot connection.");
        return null;
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: P({ level: "silent" }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: "silent" })),
        },
        browser: ["EMMYHENZ-V3.1", "Safari", "3.0"],
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const statusCode = lastDisconnect.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== 408;
            console.log("connection closed due to ", lastDisconnect.error, ", reconnecting ", shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp(onMessage, onConnectionUpdate, onCredsUpdate);
            } else if (statusCode === DisconnectReason.loggedOut) {
                console.log("🚪 Logged out - cleaning main session credentials");
                cleanMainSession(sessionPath);
            }
        } else if (connection === "open") {
            console.log("opened connection");
        }
        if (onConnectionUpdate) onConnectionUpdate(update);
    });

    sock.ev.on("creds.update", async () => {
        await saveCreds();
        if (onCredsUpdate) onCredsUpdate();
    });

    sock.ev.on("messages.upsert", async (messageUpdate) => {
        if (onMessage) await onMessage(sock, messageUpdate);
    });

    return sock;
}

module.exports = { connectToWhatsApp };
