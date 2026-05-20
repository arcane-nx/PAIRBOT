/**
 * Modularized by Antigravity
 */
const isAdmin = require('../../lib/isAdmin');

async function kickCommand(sock, chatId, senderId, mentionedJids, message) {
    // Check if user is owner
    const isOwner = message.key.fromMe;
    if (!isOwner) {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥 ℎ𝑎𝑠 𝑡𝑜 𝑏𝑒 𝑎𝑛 𝑎𝑑𝑚𝑖𝑛 𝑓𝑖𝑟𝑠𝑡.' }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '𝑂𝑛𝑙𝑦 𝐺𝑟𝑜𝑢𝑝 𝐴𝑑𝑚𝑖𝑛𝑠 𝐶𝑎𝑛 𝑈𝑠𝑒 𝑇ℎ𝑖𝑠 𝐶𝑜𝑚𝑚𝑎𝑛𝑑.' }, { quoted: message });
            return;
        }
    }

    let usersToKick = [];
    
    // Check for mentioned users
    if (mentionedJids && mentionedJids.length > 0) {
        usersToKick = mentionedJids;
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        usersToKick = [message.message.extendedTextMessage.contextInfo.participant];
    }
    
    // If no user found through either method
    if (usersToKick.length === 0) {
        await sock.sendMessage(chatId, { 
            text: '𝑀𝑒𝑛𝑡𝑖𝑜𝑛 𝑂𝑟 𝑅𝑒𝑝𝑙𝑦 𝑇𝑜 𝐴 𝑈𝑠𝑒𝑟 𝑀𝑒𝑠𝑠𝑎𝑔𝑒 𝑇𝑜 𝐾𝑖𝑐𝑘 𝐻𝑖𝑚..😉!'
        }, { quoted: message });
        return;
    }

    // Get bot's ID
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    // Check if any of the users to kick is the bot itself
    if (usersToKick.includes(botId)) {
        await sock.sendMessage(chatId, { 
            text: "𝐼 𝐶𝑎𝑛𝑡 𝐾𝑖𝑐𝑘 𝑀𝑦𝑠𝑒𝑙𝑓 𝐼𝑑𝑖𝑜𝑡! 🤖"
        }, { quoted: message });
        return;
    }

    try {
        await sock.groupParticipantsUpdate(chatId, usersToKick, "remove");
        
        // Get usernames for each kicked user
        const usernames = await Promise.all(usersToKick.map(async jid => {
            return `@${jid.split('@')[0]}`;
        }));
        
        await sock.sendMessage(chatId, { 
            text: `${usernames.join(', ')} has been kicked successfully!`,
            mentions: usersToKick
        });
    } catch (error) {
        console.error('Error in kick command:', error);
        await sock.sendMessage(chatId, { 
            text: 'Failed to kick user(s)!'
        });
    }
}

const originalCommand = kickCommand;

module.exports = {
    name: 'kick',
    async exec(sock, chatId, msg, args, rawText) {
        if (typeof originalCommand === 'function') {
            return originalCommand(sock, chatId, msg, args, rawText);
        } else if (typeof originalCommand === 'object' && originalCommand !== null) {
            const func = originalCommand.exec || Object.values(originalCommand).find(v => typeof v === 'function');
            if (func) return func(sock, chatId, msg, args, rawText);
        }
    }
};