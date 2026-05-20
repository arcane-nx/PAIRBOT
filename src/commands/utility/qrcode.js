const axios = require('axios');

module.exports = {
    name: 'qrcode',
    alias: ['qr'],
    category: 'utility',
    desc: 'Generate a QR code from text',
    async exec(sock, chatId, msg, args) {
        try {
            if (!args || args.length === 0) {
                await sock.sendMessage(chatId, { text: '❌ Please provide text to generate QR code.' });
                return;
            }

            const text = args.join(' ');
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
            
            const response = await axios.get(qrUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data);

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: `🔲 *QR Code Generated*\n\nText: ${text}`
            });

        } catch (error) {
            await sock.sendMessage(chatId, { text: '❌ QR code error: ' + error.message });
        }
    }
};
