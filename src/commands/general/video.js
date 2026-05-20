/**
 * Modularized by Antigravity
 */
const originalCommand = /**
 * Created By EmmyHenz
 * Contact Me on wa.me/2349125042727
*/

const axios = require('axios');
const yts = require('yt-search');

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

async function videoCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const searchQuery = text?.split(' ').slice(1).join(' ').trim();

        if (!searchQuery) {
            return await sock.sendMessage(chatId, {
                text: `🎬 *YouTube Video Downloader*\n\n*Usage:*\n.video <title or YouTube link>\n.yt <title or YouTube link>\n.youtube <title or YouTube link>\n\n*Example:*\n.yt Davido Fall\n.video https://youtu.be/xxxxx`,
                ...channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            react: { text: '⏳', key: message.key }
        });

        // Determine YouTube URL
        let videoUrl = '';
        const ytRegex = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/i;

        if (ytRegex.test(searchQuery)) {
            videoUrl = searchQuery;
        } else {
            // Search YouTube
            await sock.sendMessage(chatId, {
                text: `_🔍 Searching YouTube for: "${searchQuery}"..._`,
                ...channelInfo
            }, { quoted: message });

            const { videos } = await yts(searchQuery);
            if (!videos || videos.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: '❌ No videos found for that search.',
                    ...channelInfo
                }, { quoted: message });
            }
            videoUrl = videos[0].url;
        }

        await sock.sendMessage(chatId, {
            text: `_⏬ Fetching video info..._`,
            ...channelInfo
        });

        // Call prexzyvilla API
        const response = await axios.get(`https://apis.prexzyvilla.site/download/ytdl?url=${encodeURIComponent(videoUrl)}`, {
            timeout: 30000
        });

        const data = response.data;

        if (!data.status || !data.formats || data.formats.length === 0) {
            return await sock.sendMessage(chatId, {
                text: '❌ Failed to fetch video. Please try again.',
                ...channelInfo
            }, { quoted: message });
        }

        const info = data.info;
        const formats = data.formats;

        // Pick best video: prefer 360p or 480p to avoid huge file
        const videoFormats = formats.filter(f => f.type === 'video' && f.format === 'mp4');
        const preferred = ['360p', '480p', '240p', '720p', '144p'];
        let chosen = null;
        for (const q of preferred) {
            chosen = videoFormats.find(f => f.quality === q);
            if (chosen) break;
        }
        if (!chosen) chosen = videoFormats[0];

        if (!chosen) {
            return await sock.sendMessage(chatId, {
                text: '❌ No downloadable video format found.',
                ...channelInfo
            }, { quoted: message });
        }

        const durationMin = Math.floor(info.duration / 60);
        const durationSec = info.duration % 60;
        const fileSizeMB = chosen.fileSize ? (chosen.fileSize / 1024 / 1024).toFixed(1) : '?';

        await sock.sendMessage(chatId, {
            video: { url: chosen.url },
            mimetype: 'video/mp4',
            fileName: chosen.filename,
            caption: `🎬 *${info.title}*\n\n👤 *Channel:* ${info.author}\n⏱️ *Duration:* ${durationMin}:${String(durationSec).padStart(2,'0')}\n📊 *Quality:* ${chosen.quality}\n💾 *Size:* ${fileSizeMB} MB\n\n❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥`,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Video command error:', error.message);
        await sock.sendMessage(chatId, {
            text: `❌ *YouTube download failed!*\n\nError: ${error.message}`,
            ...channelInfo
        }, { quoted: message });
    }
}

videoCommand;


module.exports = {
    name: 'video',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};