/**
 * Modularized by Antigravity
 */
const originalCommand = /**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/

const fetch = require('node-fetch');

async function quoteCommand(sock, chatId, message) {
    try {
        const shizokeys = 'knightbot';
        const res = await fetch(`https://api.shizo.top/api/quote/quotes?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const quoteMessage = json.result;

        // Send the quote message
        await sock.sendMessage(chatId, { text: quoteMessage }, { quoted: message });
    } catch (error) {
        console.error('Error in quote command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get quote. Please try again later!' }, { quoted: message });
    }
};


module.exports = {
    name: 'quote',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};