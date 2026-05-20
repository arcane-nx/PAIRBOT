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

async function passwordCommand(sock, chatId, msg, args) {
    try {
        const length = parseInt(args[0]) || 12;
        if (length < 4 || length > 50) {
            await sock.sendMessage(chatId, {
                text: '❌ Password length must be between 4 and 50 characters.',
                ...channelInfo
            });
            return;
        }

        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        await sock.sendMessage(chatId, {
            text: `🔐 *GENERATED PASSWORD*\n\nLength: ${length} characters\nPassword: \`${password}\`\n\n_Keep this secure!_`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Password generation error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'password',
    async exec(sock, chatId, msg, args, rawText) {
        return passwordCommand(sock, chatId, msg, args, rawText);
    }
};