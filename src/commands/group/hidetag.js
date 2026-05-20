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

async function hidetagCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        const senderId = msg.key.participant || msg.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);

        if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a message to send.\n\n*Usage:* .hidetag Your message here',
                ...channelInfo
            });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants.map(p => p.id);
        const message = args.join(' ');

        await sock.sendMessage(chatId, {
            text: message,
            mentions: participants,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Failed to send hidetag message: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'hidetag',
    async exec(sock, chatId, msg, args, rawText) {
        return hidetagCommand(sock, chatId, msg, args, rawText);
    }
};