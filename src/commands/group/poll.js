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

async function pollCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        if (!args || args.length < 3) {
            await sock.sendMessage(chatId, {
                text: '📊 Usage: .poll [question] [option1] [option2] [option3]...\n\nExample: .poll "Favorite color?" red blue green yellow',
                ...channelInfo
            });
            return;
        }

        const question = args[0];
        const options = args.slice(1);

        if (options.length < 2 || options.length > 10) {
            await sock.sendMessage(chatId, {
                text: '❌ Poll must have between 2 and 10 options.',
                ...channelInfo
            });
            return;
        }

        const pollId = Date.now().toString();
        const pollsData = readJsonFile(POLLS_FILE);
        
        pollsData[chatId] = pollsData[chatId] || {};
        pollsData[chatId][pollId] = {
            question,
            options,
            votes: {},
            created: Date.now(),
            creator: msg.key.participant || msg.key.remoteJid
        };

        writeJsonFile(POLLS_FILE, pollsData);

        let pollText = `📊 *POLL CREATED*\n\nQuestion: ${question}\n\nOptions:\n`;
        options.forEach((option, index) => {
            pollText += `${index + 1}. ${option}\n`;
        });
        pollText += `\nTo vote, use: .vote ${pollId} [option number]`;

        await sock.sendMessage(chatId, {
            text: pollText,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Poll creation error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'poll',
    async exec(sock, chatId, msg, args, rawText) {
        return pollCommand(sock, chatId, msg, args, rawText);
    }
};