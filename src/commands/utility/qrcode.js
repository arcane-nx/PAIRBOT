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

async function qrcodeCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide text to generate QR code.\n\n*Usage:* .qrcode Your text here',
                ...channelInfo
            });
            return;
        }

        const text = args.join(' ');
        
        await sock.sendMessage(chatId, {
            text: '🔲 Generating QR code...',
            ...channelInfo
        });

        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
            
            const response = await axios.get(qrUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data);

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: `🔲 *QR Code Generated*\n\nText: ${text}\nScan to view content`,
                ...channelInfo
            });

        } catch (_) {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to generate QR code. Please try again.',
                ...channelInfo
            });
        }

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ QR code error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'qrcode',
    async exec(sock, chatId, msg, args, rawText) {
        return qrcodeCommand(sock, chatId, msg, args, rawText);
    }
};