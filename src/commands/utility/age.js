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

async function ageCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🎂 Usage: .age [YYYY-MM-DD]\n\nExample: .age 1995-06-15',
                ...channelInfo
            });
            return;
        }

        const dateString = args[0];
        const birthDate = new Date(dateString);
        const today = new Date();

        if (isNaN(birthDate.getTime())) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid date format. Use YYYY-MM-DD',
                ...channelInfo
            });
            return;
        }

        const ageMs = today - birthDate;
        const ageDate = new Date(ageMs);
        const years = ageDate.getUTCFullYear() - 1970;
        const months = ageDate.getUTCMonth();
        const days = ageDate.getUTCDate() - 1;

        await sock.sendMessage(chatId, {
            text: `🎂 *AGE CALCULATOR*\n\nBirth Date: ${birthDate.toDateString()}\nAge: ${years} years, ${months} months, ${days} days\nTotal Days: ${Math.floor(ageMs / (1000 * 60 * 60 * 24))}`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Age calculation error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'age',
    async exec(sock, chatId, msg, args, rawText) {
        return ageCommand(sock, chatId, msg, args, rawText);
    }
};