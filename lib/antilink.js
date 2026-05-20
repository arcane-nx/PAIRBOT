/**
 * Created By EmmyHenz
  lib/antilink.js — Antilink auto-detection (called from main.js for every group message)
 * Fixed: uses isAdmin from lib/isAdmin (handles v7 LID), no missing isAdmin import
*/
const { isJidGroup } = require('@whiskeysockets/baileys');
const { getAntilink, incrementWarningCount, resetWarningCount, isSudo } = require('./index');
const isAdmin = require('./isAdmin');

const WARN_COUNT = 3;

function containsURL(str) {
    const urlRegex = /(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?/i;
    return urlRegex.test(str);
}

async function Antilink(msg, sock) {
    const jid = msg.key.remoteJid;
    if (!isJidGroup(jid)) return;

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    if (!text || typeof text !== 'string') return;

    const sender = msg.key.participant;
    if (!sender) return;

    // Skip if sender is admin
    try {
        const { isSenderAdmin } = await isAdmin(sock, jid, sender);
        if (isSenderAdmin) return;
    } catch {}

    // Skip if sudo
    if (await isSudo(sender)) return;

    if (!containsURL(text.trim())) return;

    const cfg = await getAntilink(jid, 'on');
    if (!cfg?.enabled) return;

    const action = cfg.action || 'delete';

    try {
        await sock.sendMessage(jid, { delete: msg.key });
    } catch (e) {
        console.error('[Antilink] delete error:', e.message);
        return;
    }

    switch (action) {
        case 'delete':
            await sock.sendMessage(jid, {
                text: `\`\`\`@${sender.split('@')[0]} links are not allowed here\`\`\``,
                mentions: [sender]
            });
            break;
        case 'kick':
            await sock.groupParticipantsUpdate(jid, [sender], 'remove');
            await sock.sendMessage(jid, {
                text: `\`\`\`@${sender.split('@')[0]} has been kicked for sending links\`\`\``,
                mentions: [sender]
            });
            break;
        case 'warn':
            const count = await incrementWarningCount(jid, sender);
            if (count >= WARN_COUNT) {
                await sock.groupParticipantsUpdate(jid, [sender], 'remove');
                await resetWarningCount(jid, sender);
                await sock.sendMessage(jid, {
                    text: `\`\`\`@${sender.split('@')[0]} kicked after ${WARN_COUNT} warnings for links\`\`\``,
                    mentions: [sender]
                });
            } else {
                await sock.sendMessage(jid, {
                    text: `\`\`\`@${sender.split('@')[0]} warning ${count}/${WARN_COUNT} for sending links\`\`\``,
                    mentions: [sender]
                });
            }
            break;
    }
}

module.exports = { Antilink };
