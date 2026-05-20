/**
 * Created By EmmyHenz
 * isOwner.js — supports both sync and async usage, handles @lid format in groups
*/
const settings = require('../config/settings');

async function isOwnerOrSudo(senderId, sock, chatId) {
    const ownerNum = String(settings.ownerNumber || '').replace(/[^0-9]/g,'');
    const ownerJid = ownerNum + '@s.whatsapp.net';
    const senderNum = senderId.split(':')[0].split('@')[0];

    // Direct match
    if (senderId === ownerJid || senderNum === ownerNum) return true;

    // fromMe is always owner
    // (caller passes message.key.fromMe check separately)

    // LID check in groups
    if (sock && chatId && chatId.endsWith('@g.us') && senderId.includes('@lid')) {
        try {
            const meta = await sock.groupMetadata(chatId);
            const p = meta.participants.find(p => p.lid === senderId || p.id === senderId);
            if (p) {
                const pNum = (p.id || '').split(':')[0].split('@')[0];
                if (pNum === ownerNum) return true;
            }
        } catch {}
    }

    // Sudo check
    try {
        const { isSudo } = require('./index');
        return await isSudo(senderId);
    } catch { return false; }
}

// Also export sync version for legacy code
function isOwner(senderId) {
    const ownerNum = String(settings.ownerNumber || '').replace(/[^0-9]/g,'');
    const ownerJid = ownerNum + '@s.whatsapp.net';
    const senderNum = senderId.split(':')[0].split('@')[0];
    return senderId === ownerJid || senderNum === ownerNum;
}

module.exports = isOwnerOrSudo;
module.exports.isOwner = isOwner;
