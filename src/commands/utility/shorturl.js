const axios = require('axios');

module.exports = {
    name: 'shorturl',
    alias: ['shorten'],
    category: 'utility',
    desc: 'Shorten a long URL',
    async exec(sock, chatId, msg, args) {
        try {
            if (!args || args.length === 0) {
                await sock.sendMessage(chatId, { text: '❌ Please provide a URL to shorten.' });
                return;
            }

            const url = args[0];
            const shortUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`;
            const response = await axios.get(shortUrl);
            
            if (response.data && !response.data.includes('Error')) {
                await sock.sendMessage(chatId, {
                    text: `🔗 *URL Shortened*\n\n*Original:* ${url}\n*Shortened:* ${response.data}`
                });
            } else {
                throw new Error('Invalid URL or API error');
            }

        } catch (error) {
            await sock.sendMessage(chatId, { text: '❌ URL shortener error: ' + error.message });
        }
    }
};
