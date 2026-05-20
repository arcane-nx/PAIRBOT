const isAdmin = require('../../lib/isAdmin');

module.exports = {
    name: 'hidetag',
    alias: ['htag'],
    category: 'group',
    desc: 'Tag all members silently',
    async exec(sock, chatId, msg, args) {
        try {
            const isGroup = chatId.endsWith('@g.us');
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' });
                return;
            }

            const senderId = msg.key.participant || msg.key.remoteJid;
            const adminStatus = await isAdmin(sock, chatId, senderId, msg);

            if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
                await sock.sendMessage(chatId, { text: '❌ Only group admins can use this command.' });
                return;
            }

            if (!args || args.length === 0) {
                await sock.sendMessage(chatId, { text: '❌ Please provide a message to send.' });
                return;
            }

            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants.map(p => p.id);
            const message = args.join(' ');

            await sock.sendMessage(chatId, {
                text: message,
                mentions: participants
            });

        } catch (error) {
            await sock.sendMessage(chatId, { text: '❌ Failed to send hidetag message: ' + error.message });
        }
    }
};
