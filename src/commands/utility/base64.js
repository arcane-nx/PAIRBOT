/**
 * Modularized by Antigravity (Clean Recovery)
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const isAdmin = require('../../lib/isAdmin');

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363410694173688@newsletter',
            newsletterName: '❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥',
            serverMessageId: -1
        }
    }
};

async function base64Command(sock, chatId, msg, args) {
    try {
        if (!args || args.length < 2) {
            await sock.sendMessage(chatId, {
                text: '🔤 Usage:\n• .base64 encode [text]\n• .base64 decode [base64]',
                ...channelInfo
            });
            return;
        }

        const action = args[0].toLowerCase();
        const text = args.slice(1).join(' ');

        if (action === 'encode') {
            const encoded = Buffer.from(text).toString('base64');
            await sock.sendMessage(chatId, {
                text: `🔤 *BASE64 ENCODER*\n\nOriginal: ${text}\nEncoded: \`${encoded}\``,
                ...channelInfo
            });
        } else if (action === 'decode') {
            try {
                const decoded = Buffer.from(text, 'base64').toString('utf8');
                await sock.sendMessage(chatId, {
                    text: `🔤 *BASE64 DECODER*\n\nEncoded: ${text}\nDecoded: ${decoded}`,
                    ...channelInfo
                });
            } catch (_) {
                await sock.sendMessage(chatId, {
                    text: '❌ Invalid base64 string.',
                    ...channelInfo
                });
            }
        } else {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid action. Use "encode" or "decode".',
                ...channelInfo
            });
        }

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Base64 error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'base64',
    async exec(sock, chatId, msg, args, rawText) {
        return base64Command(sock, chatId, msg, args, rawText);
    }
};