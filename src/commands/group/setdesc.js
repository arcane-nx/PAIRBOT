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

async function setdescCommand(sock, chatId, msg, args) {
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

        if (!adminStatus.isBotAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, {
                text: '❌ Bot must be an admin to change group description.',
                ...channelInfo
            });
            return;
        }

        if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a new group description.\n\n*Usage:* .setdesc New group description here',
                ...channelInfo
            });
            return;
        }

        const newDesc = args.join(' ');
        await sock.groupUpdateDescription(chatId, newDesc);
        
        await sock.sendMessage(chatId, {
            text: `✅ Group description updated successfully!`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Failed to change group description: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'setdesc',
    async exec(sock, chatId, msg, args, rawText) {
        return setdescCommand(sock, chatId, msg, args, rawText);
    }
};