/**
 * Created By EmmyHenz — commands/vv2.js
 * FIXED: Uses RAM buffer (no disk writes = no ENOSPC ever)
 * Sends view once media to OWNER DM (private) like save command
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
    const chunks = []; 
    for await (const c of stream) chunks.push(c); 
    return Buffer.concat(chunks);
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

async function vv2Command(sock, chatId, message) {
    // Send reaction first (like save command)
    try {
        await sock.sendMessage(chatId, {
            react: {
                text: "📤",
                key: message.key
            }
        });
    } catch (_reactError) {
        // Continue if reaction fails
    }

    try {
        // Check if message is a reply to view once
        const resolved = resolveViewOnce(message);
        
        if (!resolved) {
            await sock.sendMessage(chatId, {
                text: "*🍁 Please Reply To A View Once Media!*",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Get owner JID (like save command)
        const ownerJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const senderNumber = (message.key.participant || message.key.remoteJid).split('@')[0];

        // Send confirmation to user in chat (like save command)
        await sock.sendMessage(chatId, {
            text: '✅ View Once media forwarded to owner privately!',
            ...channelInfo
        }, { quoted: message });

        const { type, media } = resolved;
        const caption = media.caption || '';
        const stream = await downloadContentFromMessage(media, type);
        const buffer = await streamToBuffer(stream);
        const label = type === 'image' ? '📸 Image' : '📹 Video';

        // Send to OWNER's DM (private) - like save command
        await sock.sendMessage(ownerJid, {
            [type]: buffer,
            caption: `*❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥*\n\n*VIEW ONCE REVEALED* ${label}\n\n*From:* +${senderNumber}\n*Time:* ${new Date().toLocaleString()}\n${caption ? `*Caption:* ${caption}` : ''}`,
            ...channelInfo
        });

        // Send success reaction (like save command)
        await sock.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        }).catch(() => {});

    } catch (error) {
        console.error('vv2 error:', error.message);
        
        // Send error message in chat (like save command)
        await sock.sendMessage(chatId, {
            text: `❌ *Failed to reveal view once!*\n\nError: ${error.message}`,
            ...channelInfo
        }, { quoted: message });
        
        // Send error reaction
        await sock.sendMessage(chatId, {
            react: { text: '❌', key: message.key }
        }).catch(() => {});
    }
}

module.exports = vv2Command;