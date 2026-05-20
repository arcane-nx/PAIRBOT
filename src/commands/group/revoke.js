const isAdmin = require('../../lib/isAdmin');

module.exports = {
    name: 'revoke',
    category: 'group',
    desc: 'Revoke group invite link',
    async exec(sock, chatId, msg) {
        try {
            const isGroup = chatId.endsWith('@g.us');
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' });
                return;
            }

            const senderId = msg.key.participant || msg.key.remoteJid;
            const adminStatus = await isAdmin(sock, chatId, senderId, msg);

            if (!adminStatus.isBotAdmin && !msg.key.fromMe) {
                await sock.sendMessage(chatId, { text: '❌ Bot must be an admin to revoke invite link.' });
                return;
            }

            if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
                await sock.sendMessage(chatId, { text: '❌ Only group admins can use this command.' });
                return;
            }

            await sock.groupRevokeInvite(chatId);
            await sock.sendMessage(chatId, { text: '✅ Group invite link has been revoked and reset!' });

        } catch (error) {
            await sock.sendMessage(chatId, { text: '❌ Failed to revoke invite link: ' + error.message });
        }
    }
};
