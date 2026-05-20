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

async function translateCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length < 2) {
            await sock.sendMessage(chatId, {
                text: '❌ Usage: .translate [language] [text]\n\n*Examples:*\n.translate es Hello world\n.translate fr Good morning\n.translate de Thank you\n\n*Common codes:* es=Spanish, fr=French, de=German, it=Italian, pt=Portuguese, ru=Russian, ja=Japanese, ko=Korean, zh=Chinese',
                ...channelInfo
            });
            return;
        }

        const targetLang = args[0].toLowerCase();
        const text = args.slice(1).join(' ');

        await sock.sendMessage(chatId, {
            text: '🌐 Translating...',
            ...channelInfo
        });

        try {
            const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`;
            const response = await axios.get(translateUrl);
            
            if (response.data && response.data.responseData) {
                const translatedText = response.data.responseData.translatedText;
                
                await sock.sendMessage(chatId, {
                    text: `🌐 *Translation Result*\n\n*Original:* ${text}\n*Translated:* ${translatedText}\n*To Language:* ${targetLang.toUpperCase()}`,
                    ...channelInfo
                });
            } else {
                throw new Error('Translation failed');
            }

        } catch (_) {
            await sock.sendMessage(chatId, {
                text: '❌ Translation failed. Please check the language code and try again.',
                ...channelInfo
            });
        }

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Translation error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'translate',
    async exec(sock, chatId, msg, args, rawText) {
        return translateCommand(sock, chatId, msg, args, rawText);
    }
};