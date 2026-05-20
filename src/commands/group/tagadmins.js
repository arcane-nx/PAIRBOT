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

async function tagadminsCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');

        if (admins.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ No admins found in this group.',
                ...channelInfo
            });
            return;
        }

        const message = args.length > 0 ? args.join(' ') : 'Admin attention required!';
        const adminMentions = admins.map(admin => admin.id);
        
        let tagText = `📢 *ADMIN ALERT*\n\n${message}\n\n*Admins:*\n`;
        admins.forEach((admin, index) => {
            tagText += `${index + 1}. @${admin.id.split('@')[0]}\n`;
        });

        await sock.sendMessage(chatId, {
            text: tagText,
            mentions: adminMentions,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Failed to tag admins: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'tagadmins',
    async exec(sock, chatId, msg, args, rawText) {
        return tagadminsCommand(sock, chatId, msg, args, rawText);
    }
};