const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../../../data/autotyping.json');

function isAutoTypingEnabled() {
    try {
        const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        return data.enabled;
    } catch (e) {
        return false;
    }
}

async function handleAutoTyping(sock, chatId) {
    try {
        if (isAutoTypingEnabled()) {
            await sock.sendPresenceUpdate('composing', chatId);
        }
    } catch (e) {}
}

async function autotypingCommand(sock, chatId, msg, args) {
    const action = args[0]?.toLowerCase();
    if (action === 'on') {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify({ enabled: true }));
        await sock.sendMessage(chatId, { text: '✅ Auto-typing enabled.' });
    } else if (action === 'off') {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify({ enabled: false }));
        await sock.sendMessage(chatId, { text: '❌ Auto-typing disabled.' });
    } else {
        await sock.sendMessage(chatId, { text: `🛡️ *Auto-typing*\nStatus: ${isAutoTypingEnabled() ? 'ON' : 'OFF'}\nUse .autotyping on/off` });
    }
}

module.exports = {
    name: 'autotyping',
    handleAutoTyping,
    isAutoTypingEnabled,
    async exec(sock, chatId, msg, args) {
        return autotypingCommand(sock, chatId, msg, args);
    }
};
