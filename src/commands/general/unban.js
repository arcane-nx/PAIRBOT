/**
 * Modularized by Antigravity
 */
const originalCommand = /**
 * Created By EmmyHenz
 * Contact Me on wa.me/2349125042727
*/

const fs = require('fs');
const path = require('path');

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

const bannedPath = path.join(process.cwd(), 'data', 'banned.json');

function loadBanned() {
    try {
        if (!fs.existsSync(bannedPath)) return [];
        return JSON.parse(fs.readFileSync(bannedPath, 'utf8'));
    } catch (_e) { return []; }
}

async function unbanCommand(sock, chatId, message) {
    // Owner only
    if (!message.key.fromMe) {
        return await sock.sendMessage(chatId, {
            text: '❌ Only the bot owner can use this command.',
            ...channelInfo
        });
    }

    let userToUnban;
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToUnban = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToUnban = message.message.extendedTextMessage.contextInfo.participant;
    }

    if (!userToUnban) {
        return await sock.sendMessage(chatId, {
            text: '❌ Please mention the user or reply to their message to unban!',
            ...channelInfo
        });
    }

    try {
        let bannedUsers = loadBanned();
        const userDisplay = userToUnban.split('@')[0].split(':')[0];

        // Match by number to handle @lid vs @s.whatsapp.net
        const userNumber = userDisplay;
        const index = bannedUsers.findIndex(u => u.split('@')[0].split(':')[0] === userNumber);

        if (index > -1) {
            bannedUsers.splice(index, 1);
            fs.writeFileSync(bannedPath, JSON.stringify(bannedUsers, null, 2));

            await sock.sendMessage(chatId, {
                text: `✅ *User Unbanned*\n\n👤 @${userDisplay} has been unbanned successfully!`,
                mentions: [userToUnban],
                ...channelInfo
            });
        } else {
            await sock.sendMessage(chatId, {
                text: `⚠️ @${userDisplay} is not in the banned list.`,
                mentions: [userToUnban],
                ...channelInfo
            });
        }
    } catch (error) {
        console.error('Unban error:', error.message);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to unban user: ' + error.message,
            ...channelInfo
        });
    }
}

unbanCommand;


module.exports = {
    name: 'unban',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};