/**
 * Modularized by Antigravity
 */
const originalCommand = /**
 * Created By EmmyHenz
 * Contact Me on wa.me/2349125042727
*/

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

async function imagineCommand(sock, chatId, message) {
    try {
        const prompt = message.message?.conversation?.trim() ||
                      message.message?.extendedTextMessage?.text?.trim() || '';

        // Support .imagine, .flux and .dalle prefixes
        const imagePrompt = prompt.replace(/^\.(imagine|flux|dalle)\s*/i, '').trim();

        if (!imagePrompt) {
            await sock.sendMessage(chatId, {
                text: `🎨 *AI Image Generator*\n\nProvide a prompt to generate an image!\n\n*Usage:*\n.imagine a beautiful sunset over mountains\n.flux a futuristic city at night\n.dalle a cute cat wearing a crown\n\n_Powered by MagicStudio AI_`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, {
            text: `_🎨 Generating image for: "${imagePrompt}"..._\n_Please wait, this may take a few seconds._`,
            ...channelInfo
        }, { quoted: message });

        // Call the MagicStudio API - returns image directly
        const apiUrl = `https://api-toxxic.zone.id/api/ai/magicstudio?prompt=${encodeURIComponent(imagePrompt)}`;

        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: { 'accept': '*/*' }
        });

        const imageBuffer = Buffer.from(response.data);

        // Validate we got an actual image back (not an error JSON)
        if (imageBuffer.length < 1000) {
            throw new Error('API returned invalid image data');
        }

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `🎨 *Generated Image*\n\n📝 *Prompt:* ${imagePrompt}\n\n❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥`,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in imagine command:', error.message);
        await sock.sendMessage(chatId, {
            text: `❌ *Failed to generate image!*\n\nError: ${error.message}\n\nPlease try again with a different prompt.`,
            ...channelInfo
        }, { quoted: message });
    }
}

imagineCommand;


module.exports = {
    name: 'imagine',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};