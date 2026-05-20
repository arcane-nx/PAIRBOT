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

async function diceCommand(sock, chatId, msg, args) {
    try {
        const sides = parseInt(args[0]) || 6;
        if (sides < 2 || sides > 100) {
            await sock.sendMessage(chatId, {
                text: '❌ Dice sides must be between 2 and 100.',
                ...channelInfo
            });
            return;
        }

        const result = Math.floor(Math.random() * sides) + 1;
        const diceEmoji = sides === 6 ? ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][result - 1] : '🎲';

        await sock.sendMessage(chatId, {
            text: `🎲 *DICE ROLL*\n\n${diceEmoji} You rolled: **${result}**\nDice type: ${sides}-sided`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Dice roll error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'dice',
    async exec(sock, chatId, msg, args, rawText) {
        return diceCommand(sock, chatId, msg, args, rawText);
    }
};