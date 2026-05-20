/**
 * Modularized by Antigravity
 */
const originalCommand = /**
 * Created By EmmyHenz
 * Contact Me on wa.me/2349125042727
*/

const fs = require('fs');
const path = require('path');
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

const databaseDir = path.join(process.cwd(), 'data');
const warningsPath = path.join(databaseDir, 'warnings.json');

function initializeWarningsFile() {
    if (!fs.existsSync(databaseDir)) fs.mkdirSync(databaseDir, { recursive: true });
    if (!fs.existsSync(warningsPath)) fs.writeFileSync(warningsPath, JSON.stringify({}), 'utf8');
}

async function warnCommand(sock, chatId, senderId, mentionedJids, message) {
    try {
        initializeWarningsFile();

        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo });
        }

        const isOwner = message?.key?.fromMe || false;
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin && !isOwner) {
            return await sock.sendMessage(chatId, {
                text: '🛑 Bot must be an admin to use this command.',
                ...channelInfo
            });
        }

        if (!isSenderAdmin && !isOwner) {
            return await sock.sendMessage(chatId, {
                text: '🛑 Only group admins can use the warn command.',
                ...channelInfo
            });
        }

        let userToWarn;
        if (mentionedJids && mentionedJids.length > 0) {
            userToWarn = mentionedJids[0];
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToWarn = message.message.extendedTextMessage.contextInfo.participant;
        }

        if (!userToWarn) {
            return await sock.sendMessage(chatId, {
                text: '🛑 Please mention the user or reply to their message to warn!',
                ...channelInfo
            });
        }

        let warnings = {};
        try { warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8')); } catch (_e) { warnings = {}; }

        if (!warnings[chatId]) warnings[chatId] = {};
        if (!warnings[chatId][userToWarn]) warnings[chatId][userToWarn] = 0;
        warnings[chatId][userToWarn]++;
        fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));

        const count = warnings[chatId][userToWarn];
        const senderDisplay = senderId.split('@')[0].split(':')[0];
        const userDisplay = userToWarn.split('@')[0].split(':')[0];

        await sock.sendMessage(chatId, {
            text: `*『 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 𝐀𝐋𝐄𝐑𝐓 』*\n\n` +
                  `👤 *Warned User:* @${userDisplay}\n` +
                  `⚠️ *Warning Count:* ${count}/3\n` +
                  `👑 *Warned By:* @${senderDisplay}\n\n` +
                  `📅 *Date:* ${new Date().toLocaleString()}`,
            mentions: [userToWarn, senderId],
            ...channelInfo
        });

        if (count >= 3) {
            await new Promise(r => setTimeout(r, 1000));
            await sock.groupParticipantsUpdate(chatId, [userToWarn], 'remove');
            delete warnings[chatId][userToWarn];
            fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));

            await sock.sendMessage(chatId, {
                text: `*『 𝐀𝐔𝐓𝐎-𝐊𝐈𝐂𝐊 』*\n\n@${userDisplay} has been removed after 3 warnings! ⚠️`,
                mentions: [userToWarn],
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Warn error:', error.message);
        await sock.sendMessage(chatId, {
            text: error.data === 429
                ? '🛑 Rate limit reached. Please try again in a few seconds.'
                : '🛑 Failed to warn user: ' + error.message,
            ...channelInfo
        });
    }
}

warnCommand;


module.exports = {
    name: 'warn',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};