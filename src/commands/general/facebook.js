/**
 * Modularized by Antigravity
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

async function facebookCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const url = text?.split(' ').slice(1).join(' ').trim();

        if (!url) {
            return await sock.sendMessage(chatId, {
                text: `📘 *Facebook Video Downloader*\n\n*Usage:* .fb <facebook video link>\n\n*Example:*\n.fb https://www.facebook.com/share/r/xxxxx`,
                ...channelInfo
            }, { quoted: message });
        }

        if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
            return await sock.sendMessage(chatId, {
                text: '❌ That is not a valid Facebook link.',
                ...channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            react: { text: '⏳', key: message.key }
        });

        await sock.sendMessage(chatId, {
            text: '_📘 Fetching Facebook video..._',
            ...channelInfo
        }, { quoted: message });

        const response = await axios.get(`https://apis.prexzyvilla.site/download/facebook?url=${encodeURIComponent(url)}`, {
            timeout: 30000
        });

        const data = response.data;

        if (!data.status || !data.data) {
            return await sock.sendMessage(chatId, {
                text: '❌ Failed to fetch Facebook video. Make sure the video is public.',
                ...channelInfo
            }, { quoted: message });
        }

        const fb = data.data;

        // Prefer HD, fallback to SD
        const videoUrl = fb.hd || fb.sd;

        if (!videoUrl) {
            return await sock.sendMessage(chatId, {
                text: '❌ No downloadable video found. Make sure the video is public.',
                ...channelInfo
            }, { quoted: message });
        }

        // Decode HTML entities in title
        const title = (fb.title || 'Facebook Video').replace(/&#x[\da-f]+;/gi, '').trim() || 'Facebook Video';
        const quality = fb.hd ? 'HD' : 'SD';

        await sock.sendMessage(chatId, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: `📘 *Facebook Video*\n\n📝 *Title:* ${title}\n📊 *Quality:* ${quality}\n\n❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥`,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Facebook error:', error.message);
        await sock.sendMessage(chatId, {
            text: `❌ *Facebook download failed!*\n\nError: ${error.message}\n\nMake sure the video is public.`,
            ...channelInfo
        }, { quoted: message });
    }
}

const originalCommand = facebookCommand;

module.exports = {
    name: 'facebook',
    async exec(sock, chatId, msg, args, rawText) {
        if (typeof originalCommand === 'function') {
            return originalCommand(sock, chatId, msg, args, rawText);
        } else if (typeof originalCommand === 'object' && originalCommand !== null) {
            const func = originalCommand.exec || Object.values(originalCommand).find(v => typeof v === 'function');
            if (func) return func(sock, chatId, msg, args, rawText);
        }
    }
};