const crypto = require('crypto');
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

async function hashCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🔢 Usage: .hash [text]\n\nGenerates MD5, SHA1, and SHA256 hashes of the text.',
                ...channelInfo
            });
            return;
        }

        const text = args.join(' ');
        const md5 = crypto.createHash('md5').update(text).digest('hex');
        const sha1 = crypto.createHash('sha1').update(text).digest('hex');
        const sha256 = crypto.createHash('sha256').update(text).digest('hex');

        await sock.sendMessage(chatId, {
            text: `🔢 *HASH GENERATOR*\n\nText: ${text}\n\nMD5: \`${md5}\`\n\nSHA1: \`${sha1}\`\n\nSHA256: \`${sha256}\``,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Hash generation error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'hash',
    async exec(sock, chatId, msg, args, rawText) {
        return hashCommand(sock, chatId, msg, args, rawText);
    }
};