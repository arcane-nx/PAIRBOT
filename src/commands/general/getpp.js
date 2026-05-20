/**
 * Modularized by Antigravity
 */
const originalCommand = /**
 * Created By EmmyHenz
 * Contact Me on wa.me/2349125042727
 */

async function getppCommand(sock, from, m, args, reply) {
    try {
        let targetJid = null;

        // Priority 1: Replied-to message participant
        if (m.message?.extendedTextMessage?.contextInfo?.participant) {
            targetJid = m.message.extendedTextMessage.contextInfo.participant;
        }
        // Priority 2: Mentioned JID (@tag)
        else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
            targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Priority 3: Number typed in args
        else if (args.length) {
            const num = args.join('').replace(/[^0-9]/g, '');
            if (num.length >= 7) targetJid = `${num}@s.whatsapp.net`;
        }

        if (!targetJid) {
            return reply(
                '🩸 *Usage:* `.getpp @user` or reply to a message\n' +
                'Or type: `.getpp 2349012345678`'
            );
        }

        await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

        try {
            const ppUrl = await sock.profilePictureUrl(targetJid, 'image');

            await sock.sendMessage(from, {
                image: { url: ppUrl },
                caption: `🖼️ *Profile Picture*\n👤 @${targetJid.split('@')[0]}`,
                mentions: [targetJid]
            }, { quoted: m });

            await sock.sendMessage(from, { react: { text: '✅', key: m.key } });

        } catch {
            await sock.sendMessage(from, { react: { text: '❌', key: m.key } });
            reply('🩸 No profile picture found or user has hidden their DP.');
        }

    } catch (error) {
        console.error('GetPP Error:', error.message);
        reply('❌ An error occurred. Please try again later.');
    }
}

getppCommand;

module.exports = {
    name: 'getpp',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};