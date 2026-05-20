/**
 * Modularized by Antigravity
 */
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../../../data/messageCount.json');

function loadMessageCounts() {
    if (fs.existsSync(dataFilePath)) {
        try {
            return JSON.parse(fs.readFileSync(dataFilePath));
        } catch (e) {
            return {};
        }
    }
    return {};
}

function saveMessageCounts(messageCounts) {
    fs.writeFileSync(dataFilePath, JSON.stringify(messageCounts, null, 2));
}

function incrementMessageCount(groupId, userId) {
    const messageCounts = loadMessageCounts();
    if (!messageCounts[groupId]) messageCounts[groupId] = {};
    if (!messageCounts[groupId][userId]) messageCounts[groupId][userId] = 0;
    messageCounts[groupId][userId] += 1;
    saveMessageCounts(messageCounts);
}

function topMembers(sock, chatId, isGroup) {
    if (!isGroup) {
        sock.sendMessage(chatId, { text: 'This command is only available in group chats.' });
        return;
    }
    const messageCounts = loadMessageCounts();
    const groupCounts = messageCounts[chatId] || {};
    const sortedMembers = Object.entries(groupCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    if (sortedMembers.length === 0) {
        sock.sendMessage(chatId, { text: 'No message activity recorded yet.' });
        return;
    }

    let message = '🏆 Top Members Based on Message Count:\n\n';
    sortedMembers.forEach(([userId, count], index) => {
        message += `${index + 1}. @${userId.split('@')[0]} - ${count} messages\n`;
    });
    sock.sendMessage(chatId, { text: message, mentions: sortedMembers.map(([userId]) => userId) });
}

module.exports = {
    name: 'topmembers',
    async exec(sock, chatId, msg, args, rawText) {
        const isGroup = chatId.endsWith('@g.us');
        return topMembers(sock, chatId, isGroup);
    },
    incrementMessageCount
};