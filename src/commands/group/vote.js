/**
 * Modularized by Antigravity (Clean Recovery)
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const isAdmin = require('../../lib/isAdmin');

const POLLS_FILE = path.join(__dirname, '../../../data/polls.json');

function readJsonFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) return {};
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        return {};
    }
}

function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('Error writing JSON file:', e);
    }
}

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

async function voteCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        if (!args || args.length < 2) {
            await sock.sendMessage(chatId, {
                text: '🗳️ Usage: .vote [poll_id] [option_number]\n\nExample: .vote 123456789 2',
                ...channelInfo
            });
            return;
        }

        const pollId = args[0];
        const optionNumber = parseInt(args[1]);
        const voterId = msg.key.participant || msg.key.remoteJid;
        
        const pollsData = readJsonFile(POLLS_FILE);
        
        if (!pollsData[chatId] || !pollsData[chatId][pollId]) {
            await sock.sendMessage(chatId, {
                text: '❌ Poll not found.',
                ...channelInfo
            });
            return;
        }

        const poll = pollsData[chatId][pollId];
        
        if (optionNumber < 1 || optionNumber > poll.options.length) {
            await sock.sendMessage(chatId, {
                text: `❌ Invalid option. Choose between 1 and ${poll.options.length}.`,
                ...channelInfo
            });
            return;
        }

        poll.votes[voterId] = optionNumber;
        writeJsonFile(POLLS_FILE, pollsData);

        await sock.sendMessage(chatId, {
            text: `✅ Your vote for "${poll.options[optionNumber - 1]}" has been recorded!`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Voting error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'vote',
    async exec(sock, chatId, msg, args, rawText) {
        return voteCommand(sock, chatId, msg, args, rawText);
    }
};