/**
 * Modularized by Antigravity
 */
const originalCommand = /**
 * Created By EmmyHenz
 * Contact Me on wa.me/2349125042727
*/

const axios = require('axios');

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

const processedMessages = new Set();

async function tiktokCommand(sock, chatId, message) {
    try {
        if (processedMessages.has(message.key.id)) return;
        processedMessages.add(message.key.id);
        setTimeout(() => processedMessages.delete(message.key.id), 5 * 60 * 1000);

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const url = text?.split(' ').slice(1).join(' ').trim();

        if (!url) {
            return await sock.sendMessage(chatId, {
                text: '🎵 *TikTok Downloader*\n\n*Usage:* .tiktok <link>\n\nExample:\n.tiktok https://vt.tiktok.com/ZSuLKUbVn/',
                ...channelInfo
            }, { quoted: message });
        }

        const tiktokPatterns = [
            /https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\//,
            /https?:\/\/(?:www\.)?tiktok\.com\/@/,
            /https?:\/\/(?:www\.)?tiktok\.com\/t\//
        ];

        if (!tiktokPatterns.some(p => p.test(url))) {
            return await sock.sendMessage(chatId, {
                text: '❌ That is not a valid TikTok link.',
                ...channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            react: { text: '⏳', key: message.key }
        });

        const response = await axios.get(`https://apis.prexzyvilla.site/download/tiktok?url=${encodeURIComponent(url)}`, {
            timeout: 30000
        });

        const data = response.data;

        if (!data.status || !data.data) {
            return await sock.sendMessage(chatId, {
                text: '❌ Failed to fetch TikTok video. Please try again.',
                ...channelInfo
            }, { quoted: message });
        }

        const video = data.data;

        // Use no-watermark (play) URL preferably
        const videoUrl = video.play || video.hdplay || video.wmplay;

        if (!videoUrl) {
            return await sock.sendMessage(chatId, {
                text: '❌ Could not find download URL for this video.',
                ...channelInfo
            }, { quoted: message });
        }

        const title = video.title || 'TikTok Video';
        const author = video.author?.nickname || 'Unknown';
        const duration = video.duration || 0;
        const plays = video.play_count?.toLocaleString() || '0';
        const likes = video.digg_count?.toLocaleString() || '0';

        await sock.sendMessage(chatId, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: `🎵 *TikTok Video*\n\n📝 *Title:* ${title.slice(0, 100)}\n👤 *Author:* ${author}\n⏱️ *Duration:* ${duration}s\n▶️ *Views:* ${plays}\n❤️ *Likes:* ${likes}\n\n❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥`,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('TikTok error:', error.message);
        await sock.sendMessage(chatId, {
            text: `❌ *TikTok download failed!*\n\nError: ${error.message}`,
            ...channelInfo
        }, { quoted: message });
    }
}

tiktokCommand;


module.exports = {
    name: 'tiktok',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};