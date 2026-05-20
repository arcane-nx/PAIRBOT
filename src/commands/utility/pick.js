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

async function pickCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length < 2) {
            await sock.sendMessage(chatId, {
                text: '🎯 Usage: .pick [option1] [option2] [option3]...\n\nExample: .pick pizza burger tacos',
                ...channelInfo
            });
            return;
        }

        const options = args;
        const chosen = options[Math.floor(Math.random() * options.length)];

        await sock.sendMessage(chatId, {
            text: `🎯 *RANDOM PICKER*\n\nOptions: ${options.join(', ')}\nChosen: **${chosen}**`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Pick command error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'pick',
    async exec(sock, chatId, msg, args, rawText) {
        return pickCommand(sock, chatId, msg, args, rawText);
    }
};