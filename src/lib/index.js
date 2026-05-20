/**
 * Created By EmmyHenz — lib/index.js
 * Central data store for all bot features
 * Fixed: antitag added, sudo added, exports cleaned up
*/
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../data/userGroupData.json');

function loadData() {
    try {
        if (!fs.existsSync(DATA_PATH)) {
            const def = { antibadword:{}, antilink:{}, antitag:{}, welcome:{}, goodbye:{}, chatbot:{}, warnings:{}, sudo:[] };
            const dir = path.dirname(DATA_PATH);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(DATA_PATH, JSON.stringify(def, null, 2));
            return def;
        }
        const d = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
        // Ensure all keys exist
        if (!d.antitag) d.antitag = {};
        if (!d.sudo) d.sudo = [];
        if (!d.antibadword) d.antibadword = {};
        if (!d.antilink) d.antilink = {};
        return d;
    } catch (e) {
        console.error('loadData error:', e.message);
        return { antibadword:{}, antilink:{}, antitag:{}, welcome:{}, goodbye:{}, chatbot:{}, warnings:{}, sudo:[] };
    }
}

function saveData(data) {
    try {
        const dir = path.dirname(DATA_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch (e) { console.error('saveData error:', e.message); return false; }
}

// ── Antilink ──────────────────────────────────────────────────────────────
async function setAntilink(groupId, type, action) {
    const d = loadData(); if (!d.antilink) d.antilink = {};
    d.antilink[groupId] = { enabled: type === 'on', action: action || 'delete' };
    return saveData(d);
}
async function getAntilink(groupId, type) {
    const d = loadData();
    return (type === 'on' && d.antilink?.[groupId]) ? d.antilink[groupId] : null;
}
async function removeAntilink(groupId) {
    const d = loadData(); if (d.antilink?.[groupId]) { delete d.antilink[groupId]; saveData(d); } return true;
}

// ── Antitag ───────────────────────────────────────────────────────────────
async function setAntitag(groupId, type, action) {
    const d = loadData(); if (!d.antitag) d.antitag = {};
    d.antitag[groupId] = { enabled: type === 'on', action: action || 'delete' };
    return saveData(d);
}
async function getAntitag(groupId, type) {
    const d = loadData();
    return (type === 'on' && d.antitag?.[groupId]) ? d.antitag[groupId] : null;
}
async function removeAntitag(groupId) {
    const d = loadData(); if (d.antitag?.[groupId]) { delete d.antitag[groupId]; saveData(d); } return true;
}

// ── AntiBadword ───────────────────────────────────────────────────────────
async function setAntiBadword(groupId, type, action) {
    const d = loadData(); if (!d.antibadword) d.antibadword = {};
    d.antibadword[groupId] = { enabled: type === 'on', action: action || 'delete' };
    return saveData(d);
}
async function getAntiBadword(groupId, type) {
    const d = loadData();
    return (type === 'on' && d.antibadword?.[groupId]) ? d.antibadword[groupId] : null;
}
async function removeAntiBadword(groupId) {
    const d = loadData(); if (d.antibadword?.[groupId]) { delete d.antibadword[groupId]; saveData(d); } return true;
}

// ── Warnings ──────────────────────────────────────────────────────────────
async function incrementWarningCount(groupId, userId) {
    const d = loadData();
    if (!d.warnings) d.warnings = {};
    if (!d.warnings[groupId]) d.warnings[groupId] = {};
    if (!d.warnings[groupId][userId]) d.warnings[groupId][userId] = 0;
    d.warnings[groupId][userId]++;
    saveData(d);
    return d.warnings[groupId][userId];
}
async function resetWarningCount(groupId, userId) {
    const d = loadData();
    if (d.warnings?.[groupId]?.[userId]) { d.warnings[groupId][userId] = 0; saveData(d); }
    return true;
}

// ── Welcome / Goodbye ─────────────────────────────────────────────────────
async function addWelcome(jid, enabled, message) {
    const d = loadData(); if (!d.welcome) d.welcome = {};
    d.welcome[jid] = { enabled, message: message || null };
    return saveData(d);
}
async function delWelcome(jid) {
    const d = loadData(); if (d.welcome?.[jid]) { delete d.welcome[jid]; saveData(d); } return true;
}
async function isWelcomeOn(jid) {
    const d = loadData(); return !!(d.welcome?.[jid]?.enabled);
}
async function getWelcome(jid) {
    const d = loadData(); return d.welcome?.[jid]?.message || null;
}
async function addGoodbye(jid, enabled, message) {
    const d = loadData(); if (!d.goodbye) d.goodbye = {};
    d.goodbye[jid] = { enabled, message: message || null };
    return saveData(d);
}
async function delGoodBye(jid) {
    const d = loadData(); if (d.goodbye?.[jid]) { delete d.goodbye[jid]; saveData(d); } return true;
}
async function isGoodByeOn(jid) {
    const d = loadData(); return !!(d.goodbye?.[jid]?.enabled);
}
async function getGoodbye(jid) {
    const d = loadData(); return d.goodbye?.[jid]?.message || null;
}

// ── Chatbot ───────────────────────────────────────────────────────────────
async function setChatbot(groupId, enabled) {
    const d = loadData(); if (!d.chatbot) d.chatbot = {};
    d.chatbot[groupId] = { enabled }; return saveData(d);
}
async function getChatbot(groupId) {
    const d = loadData(); return d.chatbot?.[groupId] || null;
}
async function removeChatbot(groupId) {
    const d = loadData(); if (d.chatbot?.[groupId]) { delete d.chatbot[groupId]; saveData(d); } return true;
}

// ── Sudo ──────────────────────────────────────────────────────────────────
async function isSudo(userId) {
    const d = loadData(); return Array.isArray(d.sudo) && d.sudo.includes(userId);
}
async function addSudo(userJid) {
    const d = loadData(); if (!d.sudo) d.sudo = [];
    if (!d.sudo.includes(userJid)) { d.sudo.push(userJid); saveData(d); } return true;
}
async function removeSudo(userJid) {
    const d = loadData(); if (!d.sudo) d.sudo = [];
    d.sudo = d.sudo.filter(u => u !== userJid); saveData(d); return true;
}
async function getSudoList() {
    const d = loadData(); return Array.isArray(d.sudo) ? d.sudo : [];
}

module.exports = {
    setAntilink, getAntilink, removeAntilink,
    setAntitag, getAntitag, removeAntitag,
    setAntiBadword, getAntiBadword, removeAntiBadword,
    incrementWarningCount, resetWarningCount,
    addWelcome, delWelcome, isWelcomeOn, getWelcome,
    addGoodbye, delGoodBye, isGoodByeOn, getGoodbye,
    setChatbot, getChatbot, removeChatbot,
    isSudo, addSudo, removeSudo, getSudoList,
};
