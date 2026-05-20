/**
 * Modularized by Antigravity
 */
const originalCommand = /**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/

const fetch = require('node-fetch');

async function truthCommand(sock, chatId, message) {
    try {
        const shizokeys = 'knightbot';
        const res = await fetch(`https://api.shizo.top/api/quote/truth?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const truthMessage = json.result;

        // Send the truth message
        await sock.sendMessage(chatId, { text: truthMessage }, { quoted: message });
    } catch (error) {
        console.error('Error in truth command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get truth. Please try again later!' }, { quoted: message });
    }
}

{ truthCommand };


module.exports = {
    name: 'truth',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};