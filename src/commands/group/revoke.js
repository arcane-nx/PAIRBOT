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

async function revokeCommand(sock, chatId, msg) {
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
                text: '❌ Bot must be an admin to revoke invite link.',
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

        await sock.groupRevokeInvite(chatId);
        
        await sock.sendMessage(chatId, {
            text: '✅ Group invite link has been revoked and reset!',
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Failed to revoke invite link: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'revoke',
    async exec(sock, chatId, msg, args, rawText) {
        return revokeCommand(sock, chatId, msg, args, rawText);
    }
};