/**
 * Modularized by Antigravity
 */
const originalCommand = /**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/

const fetch = require('node-fetch');

async function aiCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: "Please provide a question after .gpt or .gemini\n\nExample: .gpt write a basic html code"
            });
        }

        const parts = text.split(' ');
        const command = parts[0].toLowerCase();
        const query = parts.slice(1).join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, { 
                text: "Please provide a question after .gpt or .gemini"
            });
        }

        await sock.sendMessage(chatId, {
            react: { text: '🤖', key: message.key }
        });

        if (command === '.gpt') {
            // Toxxic API — response shape: { creator, result, data }
            // From screenshot: GET /api/ai/chatgpt?prompt=<text>
            const apis = [
                `https://api-toxxic.zone.id/api/ai/chatgpt?prompt=${encodeURIComponent(query)}`,
                `https://api.siputzx.my.id/api/ai/gpt4?content=${encodeURIComponent(query)}`,
                `https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&q=${encodeURIComponent(query)}`,
                `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(query)}`
            ];

            let answered = false;
            for (const api of apis) {
                try {
                    const response = await fetch(api, { timeout: 15000 });
                    const data = await response.json();

                    // Handle various response shapes
                    const answer = data.data || data.result || data.message || data.answer ||
                                   data.response || (data.result === true ? null : data.result);

                    if (answer && typeof answer === 'string' && answer.length > 0) {
                        await sock.sendMessage(chatId, { text: answer }, { quoted: message });
                        answered = true;
                        break;
                    }
                } catch {
                    continue;
                }
            }

            if (!answered) {
                await sock.sendMessage(chatId, {
                    text: "❌ GPT API is currently unavailable. Please try again later."
                }, { quoted: message });
            }

        } else if (command === '.gemini') {
            const apis = [
                `https://api-toxxic.zone.id/api/ai/gemini?prompt=${encodeURIComponent(query)}`,
                `https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`,
                `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`,
                `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(query)}`,
                `https://api.dreaded.site/api/gemini2?text=${encodeURIComponent(query)}`,
                `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`,
                `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(query)}`
            ];

            let answered = false;
            for (const api of apis) {
                try {
                    const response = await fetch(api, { timeout: 15000 });
                    const data = await response.json();

                    const answer = data.data || data.message || data.answer || data.result ||
                                   data.response || data.text;

                    if (answer && typeof answer === 'string' && answer.length > 0) {
                        await sock.sendMessage(chatId, { text: answer }, { quoted: message });
                        answered = true;
                        break;
                    }
                } catch {
                    continue;
                }
            }

            if (!answered) {
                await sock.sendMessage(chatId, {
                    text: "❌ Gemini API is currently unavailable. Please try again later."
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('AI Command Error:', error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred. Please try again later."
        });
    }
}

aiCommand;


module.exports = {
    name: 'ai',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};