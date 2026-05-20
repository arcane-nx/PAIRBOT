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

async function reminderCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length < 2) {
            await sock.sendMessage(chatId, {
                text: '❌ Usage: .reminder [minutes] [message]\n\nExample: .reminder 30 Meeting with team',
                ...channelInfo
            });
            return;
        }

        const minutes = parseInt(args[0]);
        if (isNaN(minutes) || minutes <= 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a valid number of minutes.',
                ...channelInfo
            });
            return;
        }

        const message = args.slice(1).join(' ');
        const senderId = msg.key.participant || msg.key.remoteJid;

        await sock.sendMessage(chatId, {
            text: `⏰ Reminder set for ${minutes} minute(s): "${message}"`,
            ...channelInfo
        });

        setTimeout(async () => {
            await sock.sendMessage(chatId, {
                text: `🔔 *REMINDER*\n\n${message}\n\n_Set ${minutes} minute(s) ago_`,
                mentions: [senderId],
                ...channelInfo
            });
        }, minutes * 60 * 1000);

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Reminder error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'reminder',
    async exec(sock, chatId, msg, args, rawText) {
        return reminderCommand(sock, chatId, msg, args, rawText);
    }
};