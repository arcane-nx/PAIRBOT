/**
 * Modularized by Antigravity
 */
const isAdmin = require('../../lib/isAdmin');

async function deleteCommand(sock, chatId, message, senderId) {
    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

    if (!isBotAdmin) {
        await sock.sendMessage(chatId, { text: 'I need to be an admin to delete messages.' });
        return;
    }

    if (!isSenderAdmin) {
        await sock.sendMessage(chatId, { text: 'Only admins can use the .delete command.' });
        return;
    }

    const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.stanzaId;
    const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

    if (quotedMessage) {
        await sock.sendMessage(chatId, { delete: { remoteJid: chatId, fromMe: false, id: quotedMessage, participant: quotedParticipant } });
    } else {
        await sock.sendMessage(chatId, { text: '𝐑𝐞𝐩𝐥𝐲 𝐀 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐘𝐨𝐮 𝐖𝐚𝐧𝐭 𝐓𝐨 𝐃𝐞𝐥𝐞𝐭𝐞.' });
    }
}

const originalCommand = deleteCommand;

module.exports = {
    name: 'delete',
    async exec(sock, chatId, msg, args, rawText) {
        if (typeof originalCommand === 'function') {
            return originalCommand(sock, chatId, msg, args, rawText);
        } else if (typeof originalCommand === 'object' && originalCommand !== null) {
            const func = originalCommand.exec || Object.values(originalCommand).find(v => typeof v === 'function');
            if (func) return func(sock, chatId, msg, args, rawText);
        }
    }
};