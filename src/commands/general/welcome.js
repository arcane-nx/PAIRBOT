/**
 * Modularized by Antigravity
 */
const { handleWelcome } = require('../../lib/welcome')

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

// ── .welcome command (called from main.js switch) ─────────────────────────────
async function welcomeCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { text: '❌ This command is for groups only.' })
        return
    }
    const text = message.message?.conversation ||
                 message.message?.extendedTextMessage?.text || ''
    const matchText = text.split(' ').slice(1).join(' ')
    await handleWelcome(sock, chatId, message, matchText)
}

// ── Called from main.js handleGroupParticipantUpdate on "add" ─────────────────
async function sendWelcomeGreeting(sock, groupId, participantJid, groupMetadata, customMessage) {
    try {
        const groupName   = groupMetadata.subject || 'this group'
        const rawDesc     = groupMetadata.desc || ''
        const groupDesc   = rawDesc.length > 0
            ? rawDesc.substring(0, 130) + (rawDesc.length > 130 ? '...' : '')
            : null
        const memberCount = groupMetadata.participants?.length || 0

        // Safely get plain JID string
        const jidStr  = typeof participantJid === 'string'
            ? participantJid
            : (participantJid?.id || participantJid?.jid || String(participantJid))
        const userNum = jidStr.split('@')[0]

        // Build text
        const welcomeText = customMessage
            ? customMessage
                .replace(/\{user\}/gi,  `@${userNum}`)
                .replace(/\{group\}/gi, groupName)
                .replace(/\{count\}/gi, String(memberCount))
            : buildDefaultWelcome(userNum, groupName, groupDesc, memberCount)

        // Try group profile picture first, then member picture
        let imgUrl = null
        try { imgUrl = await sock.profilePictureUrl(groupId, 'image') } catch (_e) {}
        if (!imgUrl) {
            try { imgUrl = await sock.profilePictureUrl(jidStr, 'image') } catch (_e) {}
        }

        const extra = {
            mentions: [jidStr],
            ...CH
        }

        if (imgUrl) {
            try {
                await sock.sendMessage(groupId, {
                    image: { url: imgUrl },
                    caption: welcomeText,
                    ...extra
                })
                return
            } catch (_e) { /* fall through */ }
        }

        await sock.sendMessage(groupId, { text: welcomeText, ...extra })

    } catch (err) {
        console.error('sendWelcomeGreeting error:', err.message)
    }
}

function buildDefaultWelcome(userNum, groupName, groupDesc, memberCount) {
    const now  = new Date()
    const time = now.toLocaleString('en-US', {
        month: '2-digit', day: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    })

    let msg =
        `╔══════════════════════╗\n` +
        `║  🎊  *WELCOME!*  🎊  ║\n` +
        `╚══════════════════════╝\n\n` +
        `👋 Hello @${userNum}!\n` +
        `You've just joined *${groupName}* 🥳\n` +
        `We're glad to have you here!\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📜 *GROUP RULES*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `1️⃣  Be respectful to everyone\n` +
        `2️⃣  Respect all admins\n` +
        `3️⃣  No spamming or flooding\n` +
        `4️⃣  No insults or hate speech\n` +
        `5️⃣  No unsolicited links or ads\n` +
        `6️⃣  Read the group description\n\n`

    if (groupDesc) msg += `📝 *About:* _${groupDesc}_\n\n`

    msg +=
        `👥 You are member *#${memberCount}*\n` +
        `🕐 Joined: ${time}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🤖 _Powered by *EmmyHenz Bot v3.5*_\n` +
        `📲 _wa.me/2349125042727_`

    return msg
}

// main.js imports: const { welcomeCommand, sendWelcomeGreeting } = require("./commands/welcome")
const originalCommand = { welcomeCommand, sendWelcomeGreeting }

module.exports = {
    name: 'welcome',
    async exec(sock, chatId, msg, args, rawText) {
        if (typeof originalCommand === 'function') {
            return originalCommand(sock, chatId, msg, args, rawText);
        } else if (typeof originalCommand === 'object' && originalCommand !== null) {
            const func = originalCommand.exec || Object.values(originalCommand).find(v => typeof v === 'function');
            if (func) return func(sock, chatId, msg, args, rawText);
        }
    }
};