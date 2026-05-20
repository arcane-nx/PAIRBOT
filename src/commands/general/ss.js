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

async function handleSsCommand(sock, chatId, message, match) {
    if (!match) {
        await sock.sendMessage(chatId, {
            text: `📸 *WEBSITE SCREENSHOT*\n\n*Usage:*\n.ss <url>\n.ssweb <url>\n.screenshot <url>\n\n*Example:*\n.ss https://google.com`,
            ...channelInfo
        }, { quoted: message });
        return;
    }

    let url = match.trim();

    // Auto-add https:// if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    try {
        await sock.sendMessage(chatId, {
            text: `_📸 Taking screenshot of ${url}, please wait..._`,
            ...channelInfo
        }, { quoted: message });

        // Your free screenshot API
        const apiUrl = `https://arcane-nx-cipher-pol.hf.space/api/tools/ss?url=${encodeURIComponent(url)}&type=desktop`;
        
        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.data || response.data.byteLength < 1000) {
            throw new Error('Screenshot returned empty or invalid data');
        }

        const imageBuffer = Buffer.from(response.data);

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `📸 *Screenshot of:* ${url}\n\n❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥`,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('❌ SS command error:', error.message);
        await sock.sendMessage(chatId, {
            text: `❌ *Failed to take screenshot!*\n\nPossible reasons:\n• Website is blocking screenshots\n• Website is down\n• Invalid URL\n• Screenshot service is busy\n\nPlease try again later.\n\nError: ${error.message}`,
            ...channelInfo
        }, { quoted: message });
    }
}

{ handleSsCommand };

module.exports = {
    name: 'ss',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};