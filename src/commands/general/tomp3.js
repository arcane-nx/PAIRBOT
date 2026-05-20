/**
 * Modularized by Antigravity
 */
const originalCommand = /**
 * Created By EmmyHenz
 * Contact Me on wa.me/2349125042727
*/

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

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

const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

async function tomp3Command(sock, chatId, msg) {
    try {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const currentMsg = msg.message;

        // Check current or quoted message for video
        const videoMsg = currentMsg?.videoMessage || quoted?.videoMessage || null;

        if (!videoMsg) {
            return await sock.sendMessage(chatId, {
                text: '🎵 *Video to Audio Converter*\n\nSend a video or reply to a video with *.tomp3*\n\nExample: Reply to any video → .tomp3',
                ...channelInfo
            }, { quoted: msg });
        }

        await sock.sendMessage(chatId, {
            text: '_⏳ Converting video to audio, please wait..._',
            ...channelInfo
        }, { quoted: msg });

        // Download video
        const stream = await downloadContentFromMessage(videoMsg, 'video');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const videoBuffer = Buffer.concat(chunks);

        const id = Date.now();
        const videoPath = path.join(tempDir, `video_${id}.mp4`);
        const audioPath = path.join(tempDir, `audio_${id}.mp3`);

        fs.writeFileSync(videoPath, videoBuffer);

        // Convert with ffmpeg
        await execAsync(`ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -q:a 2 "${audioPath}" -y`);

        const audioBuffer = fs.readFileSync(audioPath);

        // Get duration for display
        let duration = videoMsg.seconds || 0;

        await sock.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            ...channelInfo
        }, { quoted: msg });

        // Also send caption message
        await sock.sendMessage(chatId, {
            text: `✅ *Video converted to audio!*\n\n⏱️ Duration: ${duration}s\n\n❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥`,
            ...channelInfo
        });

        // Cleanup
        setTimeout(() => {
            try { fs.unlinkSync(videoPath); } catch (_) { /* ignore */ }
            try { fs.unlinkSync(audioPath); } catch (_) { /* ignore */ }
        }, 3000);

    } catch (error) {
        console.error('tomp3 error:', error.message);
        await sock.sendMessage(chatId, {
            text: `❌ *Failed to convert video to audio!*\n\nError: ${error.message}`,
            ...channelInfo
        }, { quoted: msg });
    }
}

{ tomp3Command };


module.exports = {
    name: 'tomp3',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};