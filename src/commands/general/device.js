/**
 * Modularized by Antigravity
 */
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

async function deviceCommand(sock, chatId, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo;

        if (!quoted || !quoted.quotedMessage) {
            await sock.sendMessage(chatId, {
                text: '❌ *Reply to someone\'s message to detect their device!*\n\n_Example: Reply to a message and type .device_',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const quotedId = quoted.stanzaId;
        const quotedSender = quoted.participant || quoted.remoteJid;
        const number = quotedSender.replace('@s.whatsapp.net', '');

        const device = quotedId.length === 20
            ? '🍎 *iPhone (iOS)*'
            : '🤖 *Android*';

        await sock.sendMessage(chatId, {
            text: `╔══[❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥]══╗
║➽ 📱 *𝗗𝗘𝗩𝗜𝗖𝗘 𝗗𝗘𝗧𝗘𝗖𝗧𝗢𝗥*
║➽ 👤 *𝗨𝗦𝗘𝗥:* @${number}
║➽ 📲 *𝗗𝗘𝗩𝗜𝗖𝗘:* ${device}
╚═══════➽🫟-🫟═══════╝`,
            mentions: [quotedSender],
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in device command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error detecting device: ' + error.message,
            ...channelInfo
        }, { quoted: message });
    }
}

const originalCommand = deviceCommand;

module.exports = {
    name: 'device',
    async exec(sock, chatId, msg, args, rawText) {
        if (typeof originalCommand === 'function') {
            return originalCommand(sock, chatId, msg, args, rawText);
        } else if (typeof originalCommand === 'object' && originalCommand !== null) {
            const func = originalCommand.exec || Object.values(originalCommand).find(v => typeof v === 'function');
            if (func) return func(sock, chatId, msg, args, rawText);
        }
    }
};