/**
 * Modularized by Antigravity
 */
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const channelInfo = {
    contextInfo: { forwardingScore: 1, isForwarded: false,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363410694173688@newsletter',
            newsletterName: '❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥',
            serverMessageId: -1
        }
    }
};

async function streamToBuffer(stream) {
    const chunks = []; for await (const c of stream) chunks.push(c); return Buffer.concat(chunks);
}

function resolveViewOnce(message) {
    const ctx = message.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    const candidates = [
        quoted?.viewOnceMessage?.message,
        quoted?.viewOnceMessageV2?.message,
        quoted?.viewOnceMessageV2Extension?.message,
        message.message?.viewOnceMessage?.message,
        message.message?.viewOnceMessageV2?.message,
    ].filter(Boolean);
    for (const m of candidates) {
        if (m?.imageMessage) return { type: 'image', media: m.imageMessage };
        if (m?.videoMessage) return { type: 'video', media: m.videoMessage };
    }
    if (quoted?.imageMessage?.viewOnce) return { type: 'image', media: quoted.imageMessage };
    if (quoted?.videoMessage?.viewOnce) return { type: 'video', media: quoted.videoMessage };
    return null;
}

async function viewOnceCommand(sock, chatId, message) {
    try {
        const resolved = resolveViewOnce(message);
        if (!resolved) {
            await sock.sendMessage(chatId, { text: '🥸 _Reply to a View Once image or video first!_', ...channelInfo }, { quoted: message });
            return;
        }
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } }).catch(() => {});
        const { type, media } = resolved;
        const caption = media.caption || '';
        const stream = await downloadContentFromMessage(media, type);
        const buffer = await streamToBuffer(stream);
        const label = type === 'image' ? '📸 Image' : '📹 Video';
        await sock.sendMessage(chatId, {
            [type]: buffer,
            caption: `*❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥*\n\n*𝐕𝐈𝐄𝐖 𝐎𝐍𝐂𝐄 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃 😎* ${label}\n${caption ? `*Caption:* ${caption}` : ''}`,
            ...channelInfo
        }, { quoted: message });
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } }).catch(() => {});
    } catch(e) {
        console.error('viewonce error:', e.message);
        await sock.sendMessage(chatId, { text: '🛑 Error: ' + e.message, ...channelInfo }, { quoted: message });
    }
}
const originalCommand = viewOnceCommand;

module.exports = {
    name: 'viewonce',
    async exec(sock, chatId, msg, args, rawText) {
        if (typeof originalCommand === 'function') {
            return originalCommand(sock, chatId, msg, args, rawText);
        } else if (typeof originalCommand === 'object' && originalCommand !== null) {
            const func = originalCommand.exec || Object.values(originalCommand).find(v => typeof v === 'function');
            if (func) return func(sock, chatId, msg, args, rawText);
        }
    }
};