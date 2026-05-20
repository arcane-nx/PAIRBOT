/**
 * Modularized by Antigravity
 */
const fetch = require('node-fetch');

const originalCommand = goodnightCommand;
async function goodnightCommand(sock, chatId, message) {
    try {
        const shizokeys = '❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥';
        const res = await fetch(`https://api.shizo.top/api/quote/gnsd?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const goodnightMessage = json.result;

        // Send the goodnight message
        await sock.sendMessage(chatId, { text: goodnightMessage }, { quoted: message });
    } catch (error) {
        console.error('Error in goodnight command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get goodnight message. Please try again later!' }, { quoted: message });
    }
}

{ goodnightCommand };

module.exports = {
    name: 'goodnight',
    async exec(sock, chatId, msg, args, rawText) {
        if (typeof originalCommand === 'function') {
            return originalCommand(sock, chatId, msg, args, rawText);
        } else if (typeof originalCommand === 'object' && originalCommand !== null) {
            const func = originalCommand.exec || Object.values(originalCommand).find(v => typeof v === 'function');
            if (func) return func(sock, chatId, msg, args, rawText);
        }
    }
};