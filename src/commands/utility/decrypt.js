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

async function decryptCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🔓 Usage: .decrypt [encrypted_text]\n\nExample: .decrypt SGVsbG8gV29ybGQ=',
                ...channelInfo
            });
            return;
        }

        const encrypted = args.join(' ');
        
        try {
            const decrypted = Buffer.from(encrypted, 'base64').toString('utf8');
            
            await sock.sendMessage(chatId, {
                text: `🔓 *DECRYPTED MESSAGE*\n\nEncrypted: ${encrypted}\nDecrypted: ${decrypted}`,
                ...channelInfo
            });
        } catch (_) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid encrypted text. Make sure it\'s properly encoded.',
                ...channelInfo
            });
        }

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Decryption error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'decrypt',
    async exec(sock, chatId, msg, args, rawText) {
        return decryptCommand(sock, chatId, msg, args, rawText);
    }
};