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

async function timestampCommand(sock, chatId) {
    try {
        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000);

        await sock.sendMessage(chatId, {
            text: `⏰ *CURRENT TIMESTAMP*\n\nDate: ${now.toDateString()}\nTime: ${now.toTimeString()}\nTimestamp: ${timestamp}\nISO: ${now.toISOString()}`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Timestamp error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'timestamp',
    async exec(sock, chatId, msg, args, rawText) {
        return timestampCommand(sock, chatId, msg, args, rawText);
    }
};