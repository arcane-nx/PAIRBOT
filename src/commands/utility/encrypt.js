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

async function encryptCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🔒 Usage: .encrypt [text]\n\nExample: .encrypt Hello World',
                ...channelInfo
            });
            return;
        }

        const text = args.join(' ');
        const encrypted = Buffer.from(text).toString('base64');
        
        await sock.sendMessage(chatId, {
            text: `🔒 *ENCRYPTED MESSAGE*\n\nOriginal: ${text}\nEncrypted: \`${encrypted}\`\n\n_Use .decrypt to decode this message_`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Encryption error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'encrypt',
    async exec(sock, chatId, msg, args, rawText) {
        return encryptCommand(sock, chatId, msg, args, rawText);
    }
};