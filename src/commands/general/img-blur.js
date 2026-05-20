/**
 * Modularized by Antigravity
 */
const originalCommand = /**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');

async function blurCommand(sock, chatId, message, quotedMessage) {
    try {
        // Get the image to blur
        let imageBuffer;
        
        if (quotedMessage) {
            // If replying to a message
            if (!quotedMessage.imageMessage) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Please reply to an image message' 
                });
                return;
            }
            
            const quoted = {
                message: {
                    imageMessage: quotedMessage.imageMessage
                }
            };
            
            imageBuffer = await downloadMediaMessage(
                quoted,
                'buffer',
                { },
                { }
            );
        } else if (message.message?.imageMessage) {
            // If image is in current message
            imageBuffer = await downloadMediaMessage(
                message,
                'buffer',
                { },
                { }
            );
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Please reply to an image or send an image with caption .blur' 
            });
            return;
        }

        // Resize and optimize image
        const resizedImage = await sharp(imageBuffer)
            .resize(800, 800, { // Resize to max 800x800
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
            .toBuffer();

        // Apply blur effect directly using sharp
        const blurredImage = await sharp(resizedImage)
            .blur(10) // Blur radius of 10
            .toBuffer();

        // Send the blurred image
        await sock.sendMessage(chatId, {
            image: blurredImage,
            caption: '*[ ✔ ] Image Blurred Successfully*',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   '120363410694173688@newsletter',
                    newsletterName: '❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥',
                    serverMessageId: -1
                }
            }
        });

    } catch (error) {
        console.error('Error in blur command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to blur image. Please try again later.' 
        });
    }
}

blurCommand;


module.exports = {
    name: 'img-blur',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};