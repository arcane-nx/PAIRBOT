const axios = require('axios');

module.exports = {
    name: 'translate',
    alias: ['tr'],
    category: 'utility',
    desc: 'Translate text to another language',
    async exec(sock, chatId, msg, args) {
        try {
            if (!args || args.length < 2) {
                await sock.sendMessage(chatId, { text: '❌ Usage: .translate [language] [text]\nExample: .translate es Hello world' });
                return;
            }

            const targetLang = args[0].toLowerCase();
            const text = args.slice(1).join(' ');

            const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`;
            const response = await axios.get(translateUrl);
            
            if (response.data && response.data.responseData) {
                const translatedText = response.data.responseData.translatedText;
                await sock.sendMessage(chatId, {
                    text: `🌐 *Translation*\n\n*Original:* ${text}\n*Translated:* ${translatedText}\n*To:* ${targetLang.toUpperCase()}`
                });
            } else {
                throw new Error('Translation failed');
            }

        } catch (error) {
            await sock.sendMessage(chatId, { text: '❌ Translation error: ' + error.message });
        }
    }
};
