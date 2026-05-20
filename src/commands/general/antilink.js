const { setAntilink, getAntilink, removeAntilink } = require('../../lib/index');

async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '```𝐅𝐨𝐫 𝐆𝐫𝐨𝐮𝐩 𝐀𝐝𝐦𝐢𝐧𝐬 𝐎𝐧𝐥𝐲```' });
            return;
        }

        const args = userMessage.toLowerCase().trim().split(' ');
        const action = args[1]; // .antilink [action]

        if (!action) {
            const usage = `\`\`\`𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 𝐌𝐎𝐃𝐄\n\n.antilink on\n.antilink set delete | kick | warn\n.antilink off\n\`\`\``;
            await sock.sendMessage(chatId, { text: usage });
            return;
        }

        switch (action) {
            case 'on':
                const result = await setAntilink(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, { 
                    text: result ? '*_𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 𝐇𝐀𝐒 𝐁𝐄𝐄𝐍 𝐀𝐂𝐓𝐈𝐕𝐀𝐓𝐄𝐃_*' : '*_Failed to turn on Antilink_*' 
                });
                break;
            case 'off':
                await removeAntilink(chatId, 'on');
                await sock.sendMessage(chatId, { text: '*_𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 𝐇𝐀𝐒 𝐁𝐄𝐄𝐍 𝐃𝐄𝐀𝐂𝐓𝐈𝐕𝐀𝐓𝐄𝐃_*' });
                break;
            case 'set':
                const setAction = args[2];
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await sock.sendMessage(chatId, { text: '*_Invalid action. Choose delete, kick, or warn._*' });
                    return;
                }
                const setResult = await setAntilink(chatId, 'on', setAction);
                await sock.sendMessage(chatId, { text: setResult ? `*_Antilink action set to ${setAction}_*` : '*_Failed to set Antilink action_*' });
                break;
            default:
                await sock.sendMessage(chatId, { text: `*_Use .antilink for usage._*` });
        }
    } catch (error) {
        console.error('Error in antilink command:', error);
    }
}

module.exports = {
    name: 'antilink',
    handleAntilinkCommand,
    async exec(sock, chatId, msg, args, rawText) {
        const groupMetadata = await sock.groupMetadata(chatId);
        const isSenderAdmin = groupMetadata.participants.some(p => p.id === (msg.key.participant || msg.key.remoteJid) && (p.admin === 'admin' || p.admin === 'superadmin'));
        return handleAntilinkCommand(sock, chatId, rawText, msg.key.participant || msg.key.remoteJid, isSenderAdmin || msg.key.fromMe);
    }
};