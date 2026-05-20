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

async function coinCommand(sock, chatId) {
    try {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const emoji = result === 'Heads' ? '👑' : '🪙';

        await sock.sendMessage(chatId, {
            text: `🪙 *COIN FLIP*\n\n${emoji} Result: **${result}**`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Coin flip error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'coin',
    async exec(sock, chatId, msg, args, rawText) {
        return coinCommand(sock, chatId, msg, args, rawText);
    }
};