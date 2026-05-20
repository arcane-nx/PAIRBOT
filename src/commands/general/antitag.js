const { setAntitag, getAntitag, removeAntitag } = require('../../lib/index');

async function handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '```For Group Admins Only!```' },{quoted :message});
            return;
        }

        const args = userMessage.toLowerCase().trim().split(' ');
        const action = args[1]; // .antitag [action]

        if (!action) {
            await sock.sendMessage(chatId, {
                text: `🛡️ *Antitag System*\n\nUsage: .antitag on/off\nStatus: ${getAntitag(chatId) ? 'ON' : 'OFF'}`
            }, { quoted: message });
            return;
        }

        if (action === 'on') {
            setAntitag(chatId);
            await sock.sendMessage(chatId, { text: '✅ Antitag has been enabled for this group.' }, { quoted: message });
        } else if (action === 'off') {
            removeAntitag(chatId);
            await sock.sendMessage(chatId, { text: '❌ Antitag has been disabled for this group.' }, { quoted: message });
        }
    } catch (error) {
        console.error('Error in antitag command:', error);
    }
}

async function handleTagDetection(sock, chatId, message, senderId) {
    try {
        if (!getAntitag(chatId)) return;

        const userMessage = (
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption ||
            ""
        ).toLowerCase();

        if (userMessage.includes('@everyone') || userMessage.includes('@here') || userMessage.includes('@all')) {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;
            const isSenderAdmin = participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));

            if (!isSenderAdmin) {
                // Kick logic
                const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const isBotAdmin = participants.some(p => p.id === botId && (p.admin === 'admin' || p.admin === 'superadmin'));

                if (isBotAdmin) {
                    await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                    await sock.sendMessage(chatId, {
                        text: `🚫 *Antitag Detected!*\n\n@${senderId.split('@')[0]} has been kicked for tagging all members.`,
                        mentions: [senderId]
                    }, { quoted: message });
                }
            }
        }
    } catch (error) {
        console.error('Error in tag detection:', error);
    }
}

module.exports = {
    name: 'antitag',
    handleTagDetection,
    async exec(sock, chatId, msg, args, rawText) {
        // Need to check admin status for the command
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        const isSenderAdmin = participants.some(p => p.id === (msg.key.participant || msg.key.remoteJid) && (p.admin === 'admin' || p.admin === 'superadmin'));
        
        return handleAntitagCommand(sock, chatId, rawText, msg.key.participant || msg.key.remoteJid, isSenderAdmin || msg.key.fromMe, msg);
    }
};