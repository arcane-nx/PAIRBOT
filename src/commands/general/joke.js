/**
 * Modularized by Antigravity
 */
const originalCommand = /**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/

const axios = require('axios');

async function (sock, chatId) {
    try {
        const response = await axios.get('https://icanhazdadjoke.com/', {
            headers: { Accept: 'application/json' }
        });
        const joke = response.data.joke;
        await sock.sendMessage(chatId, { text: joke });
    } catch (error) {
        console.error('Error fetching joke:', error);
        await sock.sendMessage(chatId, { text: 'Sorry, I could not fetch a joke right now.' });
    }
};


module.exports = {
    name: 'joke',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};