/**
 * Modularized by Antigravity
 * Created By EmmyHenz
 * Contact Me on wa.me/2349125042727
 * commands/goodbye.js
 * → Goes in: commands/goodbye.js
 *
 * main.js imports this as DEFAULT:
 *   const goodbyeCommand = require("./commands/goodbye")
 * So we must export the function as default (goodbyeCommand)
 */

const { handleGoodbye } = require('../../lib/welcome')

const CH = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid:  '120363410694173688@newsletter',
            newsletterName: '❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.5🎊❤️‍🔥',
            serverMessageId: -1
        }
    }
}

// ── .goodbye command (called from main.js switch) ─────────────────────────────
async function goodbyeCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { text: '❌ This command is for groups only.' })
        return
    }
    const text = message.message?.conversation ||
                 message.message?.extendedTextMessage?.text || ''
    const matchText = text.split(' ').slice(1).join(' ')
    await handleGoodbye(sock, chatId, message, matchText)
}

// ── Called from main.js handleGroupParticipantUpdate on "remove" ──────────────
async function sendGoodbyeGreeting(sock, groupId, participantJid, groupMetadata, customMessage) {
    try {
        const groupName   = groupMetadata.subject || 'this group'
        const memberCount = groupMetadata.participants?.length || 0

        const jidStr  = typeof participantJid === 'string'
            ? participantJid
            : (participantJid?.id || participantJid?.jid || String(participantJid))
        const userNum = jidStr.split('@')[0]

        const goodbyeText = customMessage
            ? customMessage
                .replace(/\{user\}/gi,  `@${userNum}`)
                .replace(/\{group\}/gi, groupName)
                .replace(/\{count\}/gi, String(memberCount))
            : buildDefaultGoodbye(userNum, groupName, memberCount)

        // Try group picture first, then the leaving member's picture
        let imgUrl = null
        try { imgUrl = await sock.profilePictureUrl(groupId, 'image') } catch (_) { /* ignore */ }
        if (!imgUrl) {
            try { imgUrl = await sock.profilePictureUrl(jidStr, 'image') } catch (_) { /* ignore */ }
        }

        const extra = { mentions: [jidStr], ...CH }

        if (imgUrl) {
            try {
                await sock.sendMessage(groupId, {
                    image: { url: imgUrl },
                    caption: goodbyeText,
                    ...extra
                })
                return
            } catch (_) { /* fall through */ }
        }

        await sock.sendMessage(groupId, { text: goodbyeText, ...extra })

    } catch (err) {
        console.error('sendGoodbyeGreeting error:', err.message)
    }
}

function buildDefaultGoodbye(userNum, groupName, memberCount) {
    return (
        `╔══════════════════════╗\n` +
        `║  👋  *GOODBYE!*  😢  ║\n` +
        `╚══════════════════════╝\n\n` +
        `😔 @${userNum} has left *${groupName}*\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🕊️ We'll miss you!\n` +
        `💬 Thanks for being part of us.\n\n` +
        `👥 Members remaining: *${memberCount}*\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🤖 _Powered by *EmmyHenz Bot v3.5*_\n` +
        `📲 _wa.me/2349125042727_`
    )
}

// main.js imports as DEFAULT: const goodbyeCommand = require("./commands/goodbye")
// So we attach sendGoodbyeGreeting to the function so main.js can also destructure it
goodbyeCommand.sendGoodbyeGreeting = sendGoodbyeGreeting

const originalCommand = goodbyeCommand

module.exports = {
    name: 'goodbye',
    async exec(sock, chatId, msg, args, rawText) {
        if (typeof originalCommand === 'function') {
            return originalCommand(sock, chatId, msg, args, rawText);
        } else if (typeof originalCommand === 'object' && originalCommand !== null) {
            const func = originalCommand.exec || Object.values(originalCommand).find(v => typeof v === 'function');
            if (func) return func(sock, chatId, msg, args, rawText);
        }
    }
};