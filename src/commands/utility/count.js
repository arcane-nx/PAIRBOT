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

async function countCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '📊 Usage: .count [text]\n\nCounts characters, words, and lines.',
                ...channelInfo
            });
            return;
        }

        const text = args.join(' ');
        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, '').length;
        const words = text.trim().split(/\s+/).length;
        const lines = text.split('\n').length;

        await sock.sendMessage(chatId, {
            text: `📊 *TEXT ANALYSIS*\n\nText: "${text}"\n\nCharacters: ${characters}\nCharacters (no spaces): ${charactersNoSpaces}\nWords: ${words}\nLines: ${lines}`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Count error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'count',
    async exec(sock, chatId, msg, args, rawText) {
        return countCommand(sock, chatId, msg, args, rawText);
    }
};