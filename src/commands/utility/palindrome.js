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

async function palindromeCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🪞 Usage: .palindrome [text]\n\nChecks if text reads the same forwards and backwards.',
                ...channelInfo
            });
            return;
        }

        const text = args.join(' ');
        const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, '');
        const reversed = cleaned.split('').reverse().join('');
        const isPalindrome = cleaned === reversed;

        await sock.sendMessage(chatId, {
            text: `🪞 *PALINDROME CHECKER*\n\nText: ${text}\nCleaned: ${cleaned}\nIs Palindrome: ${isPalindrome ? '✅ YES' : '❌ NO'}`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Palindrome check error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'palindrome',
    async exec(sock, chatId, msg, args, rawText) {
        return palindromeCommand(sock, chatId, msg, args, rawText);
    }
};