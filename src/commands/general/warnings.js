/**
 * Modularized by Antigravity
 */
const fs = require('fs');
const path = require('path');

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

const warningsFilePath = path.join(process.cwd(), 'data', 'warnings.json');

function loadWarnings() {
    try {
        if (!fs.existsSync(warningsFilePath)) return {};
        return JSON.parse(fs.readFileSync(warningsFilePath, 'utf8'));
    } catch (_e) { return {}; }
}

async function warningsCommand(sock, chatId, mentionedJidList) {
    const warnings = loadWarnings();

    if (!mentionedJidList || mentionedJidList.length === 0) {
        return await sock.sendMessage(chatId, {
            text: '⚠️ Mention a user to check their warnings.\n\nExample: .warnings @user',
            ...channelInfo
        });
    }

    const userToCheck = mentionedJidList[0];
    const userDisplay = userToCheck.split('@')[0].split(':')[0];

    // Check warnings for this group
    const groupWarnings = warnings[chatId] || {};
    const warningCount = groupWarnings[userToCheck] || 0;

    await sock.sendMessage(chatId, {
        text: `⚠️ *Warning Check*\n\n👤 *User:* @${userDisplay}\n🔢 *Warnings:* ${warningCount}/3`,
        mentions: [userToCheck],
        ...channelInfo
    });
}

const originalCommand = warningsCommand;

module.exports = {
    name: 'warnings',
    async exec(sock, chatId, msg, args, rawText) {
        if (typeof originalCommand === 'function') {
            return originalCommand(sock, chatId, msg, args, rawText);
        } else if (typeof originalCommand === 'object' && originalCommand !== null) {
            const func = originalCommand.exec || Object.values(originalCommand).find(v => typeof v === 'function');
            if (func) return func(sock, chatId, msg, args, rawText);
        }
    }
};