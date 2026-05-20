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

async function binaryCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🔢 Usage: .binary [text]\n\nConverts text to binary representation.',
                ...channelInfo
            });
            return;
        }

        const text = args.join(' ');
        const binary = text.split('').map(char => 
            char.charCodeAt(0).toString(2).padStart(8, '0')
        ).join(' ');

        await sock.sendMessage(chatId, {
            text: `🔢 *BINARY CONVERTER*\n\nText: ${text}\nBinary: \`${binary}\``,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Binary conversion error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'binary',
    async exec(sock, chatId, msg, args, rawText) {
        return binaryCommand(sock, chatId, msg, args, rawText);
    }
};