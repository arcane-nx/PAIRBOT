const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../../../data/autorecording.json');

function isAutoRecordingEnabled() {
    try {
        const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        return data.enabled;
    } catch (e) {
        return false;
    }
}

async function handleAutoRecording(sock, chatId) {
    try {
        if (isAutoRecordingEnabled()) {
            await sock.sendPresenceUpdate('recording', chatId);
        }
    } catch (e) {}
}

async function autorecordingCommand(sock, chatId, msg, args) {
    const action = args[0]?.toLowerCase();
    if (action === 'on') {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify({ enabled: true }));
        await sock.sendMessage(chatId, { text: '✅ Auto-recording enabled.' });
    } else if (action === 'off') {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify({ enabled: false }));
        await sock.sendMessage(chatId, { text: '❌ Auto-recording disabled.' });
    } else {
        await sock.sendMessage(chatId, { text: `🛡️ *Auto-recording*\nStatus: ${isAutoRecordingEnabled() ? 'ON' : 'OFF'}\nUse .autorecording on/off` });
    }
}

module.exports = {
    name: 'autorecording',
    handleAutoRecording,
    isAutoRecordingEnabled,
    async exec(sock, chatId, msg, args) {
        return autorecordingCommand(sock, chatId, msg, args);
    }
};
