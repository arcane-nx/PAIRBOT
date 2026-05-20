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

async function randomCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length < 2) {
            await sock.sendMessage(chatId, {
                text: '🎲 Usage: .random [min] [max]\n\nExample: .random 1 100',
                ...channelInfo
            });
            return;
        }

        const min = parseInt(args[0]);
        const max = parseInt(args[1]);

        if (isNaN(min) || isNaN(max)) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide valid numbers.',
                ...channelInfo
            });
            return;
        }

        if (min >= max) {
            await sock.sendMessage(chatId, {
                text: '❌ Minimum must be less than maximum.',
                ...channelInfo
            });
            return;
        }

        const result = Math.floor(Math.random() * (max - min + 1)) + min;

        await sock.sendMessage(chatId, {
            text: `🎲 *RANDOM NUMBER*\n\nRange: ${min} - ${max}\nResult: **${result}**`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Random number error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'random',
    async exec(sock, chatId, msg, args, rawText) {
        return randomCommand(sock, chatId, msg, args, rawText);
    }
};