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

async function shorturlCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a URL to shorten.\n\n*Usage:* .shorturl https://google.com',
                ...channelInfo
            });
            return;
        }

        const url = args[0];
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a valid URL starting with http:// or https://',
                ...channelInfo
            });
            return;
        }

        await sock.sendMessage(chatId, {
            text: '🔗 Shortening URL...',
            ...channelInfo
        });

        try {
            const shortUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`;
            const response = await axios.get(shortUrl);
            
            if (response.data && !response.data.includes('Error')) {
                await sock.sendMessage(chatId, {
                    text: `🔗 *URL Shortened Successfully*\n\n*Original:* ${url}\n\n*Shortened:* ${response.data}`,
                    ...channelInfo
                });
            } else {
                throw new Error('Invalid URL or API error');
            }

        } catch (_) {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to shorten URL. Please check the URL and try again.',
                ...channelInfo
            });
        }

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ URL shortener error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'shorturl',
    async exec(sock, chatId, msg, args, rawText) {
        return shorturlCommand(sock, chatId, msg, args, rawText);
    }
};