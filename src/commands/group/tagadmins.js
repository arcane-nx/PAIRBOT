module.exports = {
    name: 'tagadmins',
    alias: ['tagadmin'],
    category: 'group',
    desc: 'Tag all group admins',
    async exec(sock, chatId, msg, args) {
        try {
            const isGroup = chatId.endsWith('@g.us');
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' });
                return;
            }

            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;
            const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');

            if (admins.length === 0) {
                await sock.sendMessage(chatId, { text: '❌ No admins found in this group.' });
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
                mentions: adminMentions
            });

        } catch (error) {
            await sock.sendMessage(chatId, { text: '❌ Failed to tag admins: ' + error.message });
        }
    }
};
