/**
 * Modularized by Antigravity
 */
const originalCommand = /**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/

const fetch = require('node-fetch');

async function simpCommand(sock, chatId, quotedMsg, mentionedJid, sender) {
    try {
        // Determine the target user
        let who = quotedMsg 
            ? quotedMsg.sender 
            : mentionedJid && mentionedJid[0] 
                ? mentionedJid[0] 
                : sender;

        // Get the profile picture URL
        let avatarUrl;
        try {
            avatarUrl = await sock.profilePictureUrl(who, 'image');
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            avatarUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'; // Default avatar
        }

        // Fetch the simp card from the API
        const apiUrl = `https://some-random-api.com/canvas/misc/simpcard?avatar=${encodeURIComponent(avatarUrl)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        // Get the image buffer
        const imageBuffer = await response.buffer();

        // Send the image with caption
        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: '*your religion is simping*',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '@newsletter',
                    newsletterName: '𝐉ᴜɴᴇ 𝐌ᴅ',
                    serverMessageId: -1
                }
            }
        });

    } catch (error) {
        console.error('Error in simp command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Sorry, I couldn\'t generate the simp card. Please try again later!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '@newsletter',
                    newsletterName: '❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥',
                    serverMessageId: -1
                }
            }
        });
    }
}

{ simpCommand };


module.exports = {
    name: 'simp',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};