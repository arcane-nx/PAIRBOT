/**
 * Modularized by Antigravity
 */
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
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

async function getMediaBufferAndExt(message) {
    const m = message.message || {};
    if (m.imageMessage) {
        const stream = await downloadContentFromMessage(m.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return { buffer: Buffer.concat(chunks), ext: '.jpg', mime: 'image/jpeg' };
    }
    if (m.videoMessage) {
        const stream = await downloadContentFromMessage(m.videoMessage, 'video');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return { buffer: Buffer.concat(chunks), ext: '.mp4', mime: 'video/mp4' };
    }
    if (m.audioMessage) {
        const stream = await downloadContentFromMessage(m.audioMessage, 'audio');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return { buffer: Buffer.concat(chunks), ext: '.mp3', mime: 'audio/mpeg' };
    }
    if (m.documentMessage) {
        const stream = await downloadContentFromMessage(m.documentMessage, 'document');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const fileName = m.documentMessage.fileName || 'file.bin';
        const ext = path.extname(fileName) || '.bin';
        return { buffer: Buffer.concat(chunks), ext, mime: 'application/octet-stream' };
    }
    if (m.stickerMessage) {
        const stream = await downloadContentFromMessage(m.stickerMessage, 'sticker');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return { buffer: Buffer.concat(chunks), ext: '.webp', mime: 'image/webp' };
    }
    return null;
}

async function getQuotedMediaBufferAndExt(message) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
    if (!quoted) return null;
    return getMediaBufferAndExt({ message: quoted });
}

// Upload to file.io (works for all file types, free, no key needed)
async function uploadToFileIO(filePath, fileName) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), fileName);

    const response = await axios.post('https://file.io/?expires=1d', formData, {
        headers: formData.getHeaders(),
        timeout: 60000
    });

    if (response.data?.success && response.data?.link) {
        return response.data.link;
    }
    throw new Error('Upload failed: ' + JSON.stringify(response.data));
}

// Upload to tmpfiles.org (free, no key, good uptime)
async function uploadToTmpFiles(filePath, fileName) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), fileName);

    const response = await axios.post('https://tmpfiles.org/api/v1/upload', formData, {
        headers: formData.getHeaders(),
        timeout: 60000
    });

    if (response.data?.status === 'success') {
        // Convert from tmpfiles.org/XXXX to tmpfiles.org/dl/XXXX for direct link
        const url = response.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
        return url;
    }
    throw new Error('Upload failed');
}

async function urlCommand(sock, chatId, message) {
    try {
        let media = await getMediaBufferAndExt(message);
        if (!media) media = await getQuotedMediaBufferAndExt(message);

        if (!media) {
            await sock.sendMessage(chatId, {
                text: '📁 *Media URL Generator*\n\nPlease send or reply to any media file (image, video, audio, sticker, or document) to get a download link.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, {
            text: '_⏳ Uploading your file, please wait..._',
            ...channelInfo
        }, { quoted: message });

        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileName = `emmyhenz_${timestamp}_${randomStr}${media.ext}`;
        const tempPath = path.join(tempDir, fileName);

        fs.writeFileSync(tempPath, media.buffer);

        let url = '';
        let uploadService = '';

        try {
            // Try tmpfiles.org first (most reliable, no key needed)
            url = await uploadToTmpFiles(tempPath, fileName);
            uploadService = 'tmpfiles.org';
        } catch (e1) {
            console.log('tmpfiles failed, trying file.io:', e1.message);
            try {
                // Fallback to file.io
                url = await uploadToFileIO(tempPath, fileName);
                uploadService = 'file.io';
            } catch (e2) {
                throw new Error('All upload services failed. Please try again later.', { cause: e2 });
            }
        }

        // Cleanup temp file
        setTimeout(() => {
            try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch (_e) { /* ignore error */ }
        }, 5000);

        await sock.sendMessage(chatId, {
            text: `✅ *File Uploaded Successfully!*\n\n🔗 *Link:* ${url}\n\n📦 *Service:* ${uploadService}\n⚠️ *Note:* Link expires in 24 hours\n\n❤️‍🔥𝓟𝓻𝓸𝓬𝓮𝓼𝓼𝓮𝓭 𝓑𝔂 ❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥`,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('[URL UPLOAD] error:', error?.message || error);
        await sock.sendMessage(chatId, {
            text: `⚠️ *Upload Failed*\n\nCould not upload your file.\nError: ${error.message}\n\nPlease try again.`,
            ...channelInfo
        }, { quoted: message });
    }
}

const originalCommand = urlCommand;

module.exports = {
    name: 'catbox',
    async exec(sock, chatId, msg, args, rawText) {
        if (typeof originalCommand === 'function') {
            return originalCommand(sock, chatId, msg, args, rawText);
        } else if (typeof originalCommand === 'object' && originalCommand !== null) {
            const func = originalCommand.exec || Object.values(originalCommand).find(v => typeof v === 'function');
            if (func) return func(sock, chatId, msg, args, rawText);
        }
    }
};