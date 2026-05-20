/**
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

async function playCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const searchQuery = text?.split(' ').slice(1).join(' ').trim();

        if (!searchQuery) {
            return await sock.sendMessage(chatId, {
                text: `🎵 *Music Player*\n\n*Usage:* .play <title or artist>\n\nExample:\n.play Burna Boy Last Last\n.play Wizkid Essence`,
                ...channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: `_🔍 Searching for "${searchQuery}"..._`,
            ...channelInfo
        }, { quoted: message });

        // Step 1: Search YouTube using yt-search package
        const searchResults = await yts(searchQuery);
        
        if (!searchResults || !searchResults.videos.length) {
            return await sock.sendMessage(chatId, {
                text: '❌ No results found. Try a different search.',
                ...channelInfo
            }, { quoted: message });
        }

        // Get the first video result
        const topResult = searchResults.videos[0];
        const videoUrl = topResult.url;
        const title = topResult.title;
        const thumbnail = topResult.thumbnail;

        // Step 2: Send the YouTube URL to David Cyril API
        const dlApiUrl = `https://apis.davidcyril.name.ng/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;
        const dlRes = await axios.get(dlApiUrl, { timeout: 30000 });

        if (!dlRes.data?.success || !dlRes.data?.result) {
            return await sock.sendMessage(chatId, {
                text: '❌ Failed to process the audio. Please try again.',
                ...channelInfo
            }, { quoted: message });
        }

        const { download_url } = dlRes.data.result;

        // Send thumbnail with info
        await sock.sendMessage(chatId, {
            image: { url: thumbnail },
            caption: `🎵 *${title}*\n\n_⏳ Sending audio..._`,
            ...channelInfo
        }, { quoted: message });

        // Send audio directly using the download URL
        await sock.sendMessage(chatId, {
            audio: { url: download_url },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            ptt: false,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Play command error:', error.message);
        
        let errorMessage = '❌ *Download failed!*\n\n';
        if (error.code === 'ECONNABORTED') {
            errorMessage += 'Request timed out. Please try again.';
        } else if (error.response?.status === 404) {
            errorMessage += 'Audio not found. Try a different query.';
        } else if (error.message.includes('timeout')) {
            errorMessage += 'Server timeout. Please try again.';
        } else {
            errorMessage += `Error: ${error.message}\n\nPlease try again.`;
        }
        
        await sock.sendMessage(chatId, {
            text: errorMessage,
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = playCommand;