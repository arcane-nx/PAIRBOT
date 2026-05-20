/**
 * Created By EmmyHenz
 * Contact Me on wa.me/2349125042727
*/

const isAdmin = require('../lib/isAdmin');

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

async function unmuteCommand(sock, chatId, msg) {
    try {
        const isOwner = msg?.key?.fromMe || false;
        const senderId = msg?.key?.participant || msg?.key?.remoteJid;
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin && !isOwner) {
            return await sock.sendMessage(chatId, {
                text: '❌ Bot must be an admin to unmute the group.',
                ...channelInfo
            });
        }

        if (!isSenderAdmin && !isOwner) {
            return await sock.sendMessage(chatId, {
                text: '❌ Only group admins can unmute the group.',
                ...channelInfo
            });
        }

        await sock.groupSettingUpdate(chatId, 'not_announcement');
        await sock.sendMessage(chatId, {
            text: '🔓 *Group Unmuted!*\n\nAll members can now send messages.',
            ...channelInfo
        });
    } catch (error) {
        console.error('Unmute error:', error.message);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to unmute group: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = unmuteCommand;
