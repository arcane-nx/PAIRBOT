/**
 * Modularized by Antigravity
 */
const originalCommand = /**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/

const { 
    downloadMediaMessage, 
    prepareWAMessageMedia, 
    generateWAMessageFromContent 
} = require('@whiskeysockets/baileys');
const pino = require('pino');

async function gcstatus(sock, chatId, message, args) {
    const from = chatId;
    const m = message;
    const reply = (text) => sock.sendMessage(from, { text }, { quoted: m });

    if (!from.endsWith('@g.us')) return reply("❌ This command is for Groups only.");

    // 1. Identify Content Type (Reply or Direct)
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.message;
    if (!quoted) return reply("❌ **Usage:** Reply to media or type text.");

    const isImage = quoted.imageMessage;
    const isVideo = quoted.videoMessage;
    const isAudio = quoted.audioMessage;
    const text = args.join(" ");

    if (!isImage && !isVideo && !isAudio && !text) {
        return reply("❌ **Usage:** Reply to media or type text.\nExamples:\n.gcstatus (reply to image)\n.gcstatus Hello Group");
    }

    await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

    try {
        let messagePayload = {};

        // 2. Prepare MEDIA (Image/Video/Audio)
        if (isImage || isVideo || isAudio) {
            
            // A. Download Buffer
            const mediaBuffer = await downloadMediaMessage(
                { key: m.message?.extendedTextMessage?.contextInfo?.stanzaId ? { remoteJid: m.key.remoteJid, id: m.message.extendedTextMessage.contextInfo.stanzaId, participant: m.message.extendedTextMessage.contextInfo.participant } : m.key, message: quoted },
                'buffer',
                {},
                { logger: pino({ level: 'silent' }) }
            );

            // B. Construct Options Object
            let mediaOptions = {};
            if (isImage) mediaOptions = { image: mediaBuffer, caption: text };
            else if (isVideo) mediaOptions = { video: mediaBuffer, caption: text };
            else if (isAudio) mediaOptions = { audio: mediaBuffer, mimetype: 'audio/mp4', ptt: false };

            // C. Upload & Prepare
            const preparedMedia = await prepareWAMessageMedia(
                mediaOptions, 
                { upload: sock.waUploadToServer }
            );

            // D. Construct the Inner Message
            let finalMediaMsg = {};
            if (isImage) finalMediaMsg = { imageMessage: preparedMedia.imageMessage };
            else if (isVideo) finalMediaMsg = { videoMessage: preparedMedia.videoMessage };
            else if (isAudio) finalMediaMsg = { audioMessage: preparedMedia.audioMessage };

            messagePayload = {
                groupStatusMessageV2: {
                    message: finalMediaMsg
                }
            };
        } 
        // 3. Prepare TEXT
        else {
            const randomHex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
            messagePayload = {
                groupStatusMessageV2: {
                    message: {
                        extendedTextMessage: {
                            text: text,
                            backgroundArgb: 0xFF000000 + parseInt(randomHex, 16),
                            font: 2
                        }
                    }
                }
            };
        }

        // 4. Generate & Relay
        const msg = generateWAMessageFromContent(
            from, 
            messagePayload, 
            { userJid: sock.user.id }
        );

        await sock.relayMessage(from, msg.message, { messageId: msg.key.id });
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("[GC STATUS ERROR]", e);
        reply(`🌺 Error: ${e.message}`);
    }
}

gcstatus;

module.exports = {
    name: 'gcstatus',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};