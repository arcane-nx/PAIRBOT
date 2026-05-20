/**
 * Modularized by Antigravity (Clean Recovery)
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const isAdmin = require('../../lib/isAdmin');

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

async function caseCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length < 2) {
            await sock.sendMessage(chatId, {
                text: '🔤 Usage: .case [upper/lower/title] [text]\n\nExamples:\n• .case upper hello world\n• .case lower HELLO WORLD\n• .case title hello world',
                ...channelInfo
            });
            return;
        }

        const caseType = args[0].toLowerCase();
        const text = args.slice(1).join(' ');
        let result;

        switch (caseType) {
            case 'upper':
                result = text.toUpperCase();
                break;
            case 'lower':
                result = text.toLowerCase();
                break;
            case 'title':
                result = text.replace(/\w\S*/g, (txt) => 
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
                break;
            default:
                await sock.sendMessage(chatId, {
                    text: '❌ Invalid case type. Use: upper, lower, or title',
                    ...channelInfo
                });
                return;
        }

        await sock.sendMessage(chatId, {
            text: `🔤 *CASE CONVERTER*\n\nOriginal: ${text}\n${caseType.toUpperCase()}: ${result}`,
            ...channelInfo
        });

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Case conversion error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'case',
    async exec(sock, chatId, msg, args, rawText) {
        return caseCommand(sock, chatId, msg, args, rawText);
    }
};