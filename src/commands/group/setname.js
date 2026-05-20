const isAdmin = require('../../lib/isAdmin');

module.exports = {
    name: 'setname',
    category: 'group',
    desc: 'Change group name',
    async exec(sock, chatId, msg, args) {
        try {
            const isGroup = chatId.endsWith('@g.us');
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' });
                return;
            }

            const senderId = msg.key.participant || msg.key.remoteJid;
            const adminStatus = await isAdmin(sock, chatId, senderId, msg);

            if (!adminStatus.isBotAdmin && !msg.key.fromMe) {
                await sock.sendMessage(chatId, { text: '❌ Bot must be an admin to change group name.' });
                return;
            }

            if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
                await sock.sendMessage(chatId, { text: '❌ Only group admins can use this command.' });
                return;
            }

            if (!args || args.length === 0) {
                await sock.sendMessage(chatId, { text: '❌ Please provide a new group name.' });
                return;
            }

            const newName = args.join(' ');
            await sock.groupUpdateSubject(chatId, newName);
            await sock.sendMessage(chatId, { text: `✅ Group name changed to: *${newName}*` });

        } catch (error) {
            await sock.sendMessage(chatId, { text: '❌ Failed to change group name: ' + error.message });
        }
    }
};
