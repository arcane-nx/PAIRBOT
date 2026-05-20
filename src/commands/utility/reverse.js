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

async function reverseCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🔄 Usage: .reverse [text]',
                ...channelInfo
            });
            return;
        }

        const text = args.join(' ');
        const reversed = text.split('').reverse().join('');

        await sock.sendMessage(chatId, {
            text: `🔄 *TEXT REVERSER*\n\nOriginal: ${text}\nReversed: ${reversed}`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Reverse error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'reverse',
    async exec(sock, chatId, msg, args, rawText) {
        return reverseCommand(sock, chatId, msg, args, rawText);
    }
};