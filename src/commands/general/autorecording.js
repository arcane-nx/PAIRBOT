/**
 * Modularized by Antigravity (Clean Recovery)
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

const configPath = path.join(__dirname, '../../../database/auth.json');

function isAutoRecordingEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return !!config.autoRecordingEnabled;
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
    try {
        // Check if sender is owner
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ 𝐓𝐡𝐢𝐬 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐂𝐚𝐧 𝐁𝐞 𝐔𝐬𝐞𝐝 𝐎𝐧𝐥𝐲 𝐁𝐲 𝐌𝐲 𝐎𝐰𝐧𝐞𝐫 𝐎𝐧𝐥𝐲!',
                ...channelInfo
            });
            return;
        }

        // Read current config
        let config = JSON.parse(fs.readFileSync(configPath));

        // Get action from arguments
        const action = args.join(' ').toLowerCase();

        // If no arguments, show usage
        if (!action) {
            const status = config.autoRecordingEnabled ? 'enabled' : 'disabled';
            await sock.sendMessage(chatId, { 
                text: `🎤 *𝐀𝐔𝐓𝐎-𝐑𝐄𝐂𝐎𝐑𝐃𝐈𝐍𝐆 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒*\n\nCurrent status: ${status}\n\n*Usage:* .autorecording on | off\n\n*Example:* .autorecording on`,
                ...channelInfo
            });
            return;
        }

        let responseText;

        // Handle on/off commands
        if (action === 'on') {
            config.autoRecordingEnabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            responseText = '✅ *Auto-recording is now enabled*\n\nBot will automatically show recording indicator when processing voice messages.';
        } else if (action === 'off') {
            config.autoRecordingEnabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            responseText = '❌ *Auto-recording is now disabled*\n\nBot will no longer show recording indicator automatically.';
        } else {
            responseText = `❌ Invalid option!\n\n*Usage:* .autorecording on | off\n\n*Example:* .autorecording on`;
        }

        await sock.sendMessage(chatId, { 
            text: responseText,
            ...channelInfo
        });

    } catch (error) {
        console.error('Error in autorecording command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error occurred while managing auto-recording settings!\n' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'autorecording',
    async exec(sock, chatId, msg, args, rawText) {
        return autorecordingCommand(sock, chatId, msg, args, rawText);
    },
    isAutoRecordingEnabled,
    handleAutoRecording
};