/**
 * Created By EmmyHenz
 * Contact Me on wa.me/2349125042727
 *
 * Anti-Badword — FIXED to match main.js call signatures:
 *
 *   handleAntiBadwordCommand(sock, chatId, message, match)        ← .antibadword command
 *   handleBadwordDetection(sock, chatId, message, userMessage, senderId)  ← auto detection
 *
 * Features:
 *   • Detects bad words → deletes message → warns user
 *   • Auto-kick after 3 warnings
 *   • Admins are exempt
 */

const fs   = require('fs')
const path = require('path')

const DATA_PATH   = path.join(__dirname, '..', 'data', 'antibadword.json')
const MAX_WARNINGS = 3

const DEFAULT_WORDS = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard',
    'damn', 'crap', 'dick', 'pussy', 'nigga',
    'whore', 'slut', 'cunt', 'motherfucker', 'idiot'
]

// Ensure data dir
const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

// ── Data helpers ──────────────────────────────────────────────────────────────
function loadData() {
    try {
        if (!fs.existsSync(DATA_PATH)) {
            fs.writeFileSync(DATA_PATH, JSON.stringify({}, null, 2))
        }
        return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
    } catch (_e) {
        return {}
    }
}

function saveData(data) {
    try { fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2)) } catch (_e) {}
}

function getGroupData(chatId) {
    const data = loadData()
    if (!data[chatId]) {
        data[chatId] = { enabled: false, words: [...DEFAULT_WORDS], warns: {} }
        saveData(data)
    }
    return data[chatId]
}

function setGroupData(chatId, gData) {
    const data = loadData()
    data[chatId] = gData
    saveData(data)
}

// ── Check if a user is admin ──────────────────────────────────────────────────
async function isUserAdmin(sock, chatId, userId) {
    try {
        const meta = await sock.groupMetadata(chatId)
        const p    = meta.participants.find(p =>
            p.id === userId ||
            p.id.split('@')[0] === userId.split('@')[0]
        )
        return p?.admin === 'admin' || p?.admin === 'superadmin'
    } catch (_e) {
        return false
    }
}

// ── .antibadword command ──────────────────────────────────────────────────────
// main.js calls: handleAntiBadwordCommand(sock, chatId, message, match)
// match = everything after ".antibadword" e.g. "on", "add fuck kill", "list"
async function handleAntiBadwordCommand(sock, chatId, message, match) {
    const senderId = message.key.participant || message.key.remoteJid
    const args     = (match || '').trim()
    const parts    = args.split(/[\s,]+/).filter(Boolean)
    const subCmd   = parts[0]?.toLowerCase()
    const rest     = parts.slice(1).join(' ')
    const gData    = getGroupData(chatId)

    // ── No args → show help ───────────────────────────────────────────────
    if (!args || !subCmd) {
        const status = gData.enabled ? '✅ Enabled' : '❌ Disabled'
        return await sock.sendMessage(chatId, {
            text: `╭━━━〔 🤬 *ANTI-BADWORD* 〕━━━⬣\n` +
                  `┃ Status: *${status}*\n` +
                  `┃ Auto-Kick: After *${MAX_WARNINGS}* warnings\n` +
                  `┃\n` +
                  `┃ *Usage:*\n` +
                  `┃➤ .antibadword on\n` +
                  `┃➤ .antibadword off\n` +
                  `┃➤ .antibadword add word1, word2\n` +
                  `┃➤ .antibadword remove word\n` +
                  `┃➤ .antibadword list\n` +
                  `┃➤ .antibadword reset\n` +
                  `┃\n` +
                  `┃ Bad words are deleted + warned.\n` +
                  `┃ After ${MAX_WARNINGS} warnings, user is kicked.\n` +
                  `╰━━━━━━━━━━━━━━━━━━━━⬣`
        }, { quoted: message })
    }

    // All modifying commands need admin
    const modifying = ['on', 'off', 'enable', 'disable', 'add', 'remove', 'reset']
    if (modifying.includes(subCmd)) {
        const isAdmin = await isUserAdmin(sock, chatId, senderId)
        if (!isAdmin && !message.key.fromMe) {
            return await sock.sendMessage(chatId, {
                text: '❌ *Admin only!* Only admins can change antibadword settings.'
            }, { quoted: message })
        }
    }

    if (subCmd === 'on' || subCmd === 'enable') {
        gData.enabled = true
        setGroupData(chatId, gData)
        return await sock.sendMessage(chatId, {
            text: `╭━━━〔 🤬 *ANTI-BADWORD ON* 〕━━━⬣\n` +
                  `┃ ✅ *Enabled!*\n` +
                  `┃ 📋 Words tracked: *${gData.words.length}*\n` +
                  `┃ 👢 Auto-kick after ${MAX_WARNINGS} warnings\n` +
                  `╰━━━━━━━━━━━━━━━━━━━━⬣`
        }, { quoted: message })
    }

    if (subCmd === 'off' || subCmd === 'disable') {
        gData.enabled = false
        setGroupData(chatId, gData)
        return await sock.sendMessage(chatId, {
            text: `╭━━━〔 🤬 *ANTI-BADWORD OFF* 〕━━━⬣\n` +
                  `┃ ❌ *Disabled.* Words no longer filtered.\n` +
                  `╰━━━━━━━━━━━━━━━━━━━━⬣`
        }, { quoted: message })
    }

    if (subCmd === 'add') {
        if (!rest) {
            return await sock.sendMessage(chatId, {
                text: `❌ Provide words to add.\nExample: *.antibadword add fuck, kill, idiot*`
            }, { quoted: message })
        }
        const newWords = rest.split(/[,\s]+/).map(w => w.toLowerCase().trim()).filter(Boolean)
        const added    = newWords.filter(w => !gData.words.includes(w))
        added.forEach(w => gData.words.push(w))
        setGroupData(chatId, gData)
        return await sock.sendMessage(chatId, {
            text: added.length
                ? `✅ Added *${added.length}* word(s): _${added.join(', ')}_\n📋 Total: *${gData.words.length}*`
                : `⚠️ All words already in list.`
        }, { quoted: message })
    }

    if (subCmd === 'remove') {
        if (!rest) {
            return await sock.sendMessage(chatId, {
                text: `❌ Provide word(s) to remove.\nExample: *.antibadword remove fuck*`
            }, { quoted: message })
        }
        const toRemove = rest.split(/[,\s]+/).map(w => w.toLowerCase().trim()).filter(Boolean)
        const removed  = []
        toRemove.forEach(w => {
            const i = gData.words.indexOf(w)
            if (i !== -1) { gData.words.splice(i, 1); removed.push(w) }
        })
        setGroupData(chatId, gData)
        return await sock.sendMessage(chatId, {
            text: removed.length
                ? `✅ Removed: _${removed.join(', ')}_\n📋 Words left: *${gData.words.length}*`
                : `⚠️ Word(s) not found in list.`
        }, { quoted: message })
    }

    if (subCmd === 'list') {
        const status   = gData.enabled ? '✅ Enabled' : '❌ Disabled'
        const wordList = gData.words.map((w, i) => `${i + 1}. ${w}`).join('\n┃ ')
        return await sock.sendMessage(chatId, {
            text: `╭━━━〔 🤬 *BADWORD LIST* 〕━━━⬣\n` +
                  `┃ Status: *${status}*\n` +
                  `┃ Total : *${gData.words.length}* words\n` +
                  `┃\n` +
                  `┃ ${wordList}\n` +
                  `╰━━━━━━━━━━━━━━━━━━━━⬣`
        }, { quoted: message })
    }

    if (subCmd === 'reset') {
        gData.words = [...DEFAULT_WORDS]
        gData.warns = {}
        setGroupData(chatId, gData)
        return await sock.sendMessage(chatId, {
            text: `✅ *Badword list reset* to defaults.\n📋 *${DEFAULT_WORDS.length}* words restored, all warnings cleared.`
        }, { quoted: message })
    }

    await sock.sendMessage(chatId, {
        text: `❌ Unknown: \`.antibadword ${subCmd}\`\n\nValid: on | off | add | remove | list | reset`
    }, { quoted: message })
}

// ── Auto-detection ────────────────────────────────────────────────────────────
// main.js calls: handleBadwordDetection(sock, chatId, message, userMessage, senderId)
async function handleBadwordDetection(sock, chatId, message, userMessage, senderId) {
    try {
        if (!chatId || !chatId.endsWith('@g.us')) return
        if (message.key.fromMe) return
        if (!userMessage) return

        const gData = getGroupData(chatId)
        if (!gData.enabled || !gData.words.length) return

        // Skip admins
        const senderIsAdmin = await isUserAdmin(sock, chatId, senderId)
        if (senderIsAdmin) return

        // Check for bad word
        const msgLower = userMessage.toLowerCase()
        const found    = gData.words.find(w => msgLower.includes(w.toLowerCase()))
        if (!found) return

        // Delete the message
        try {
            await sock.sendMessage(chatId, { delete: message.key })
        } catch (_e) {
            console.error('[ANTIBADWORD] Delete failed:', _e.message)
        }

        // Increment warning
        if (!gData.warns) gData.warns = {}
        gData.warns[senderId] = (gData.warns[senderId] || 0) + 1
        const warnCount = gData.warns[senderId]
        setGroupData(chatId, gData)

        const senderNum = senderId.split('@')[0]

        // Kick after MAX_WARNINGS
        if (warnCount >= MAX_WARNINGS) {
            try {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove')
                // Reset warnings
                delete gData.warns[senderId]
                setGroupData(chatId, gData)
                await sock.sendMessage(chatId, {
                    text: `👢 @${senderNum} has been *kicked* for using bad words ${MAX_WARNINGS} times! 🚫`,
                    mentions: [senderId]
                })
            } catch (_kickErr) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ Couldn't kick @${senderNum} — make sure I'm an admin.\n⚠️ Warnings: *${warnCount}/${MAX_WARNINGS}*`,
                    mentions: [senderId]
                })
            }
            return
        }

        // Warn message
        const warningsLeft = MAX_WARNINGS - warnCount
        await sock.sendMessage(chatId, {
            text: `🤬 *Bad Word Detected!*\n\n` +
                  `@${senderNum}, watch your language!\n` +
                  `The word *"${found}"* is not allowed here.\n\n` +
                  `📊 Warnings: *${warnCount}/${MAX_WARNINGS}*\n` +
                  `⚠️ *${warningsLeft}* more warning(s) before kick.`,
            mentions: [senderId]
        })

    } catch (err) {
        console.error('[ANTIBADWORD DETECT]', err.message)
    }
}

module.exports = { handleAntiBadwordCommand, handleBadwordDetection }
