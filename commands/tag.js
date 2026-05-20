/**
 * Created By EmmyHenz
 * Contact Me on wa.me/2349125042727
*/

const isAdmin = require('../lib/isAdmin');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

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

async function downloadMediaMessage(message, mediaType) {
    const stream = await downloadContentFromMessage(message, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    const tempDir = path.join(__dirname, '../temp/');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const filePath = path.join(tempDir, `${Date.now()}.${mediaType}`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

async function tagCommand(sock, chatId, senderId, messageText, replyMessage, msg) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        // Allow bot owner to bypass bot admin check
        const isOwner = msg?.key?.fromMe || false;

        if (!isBotAdmin && !isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ ❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥 𝑯𝒂𝒔 𝑻𝒐 𝑩𝒆 𝑨𝒏 𝑨𝒅𝒎𝒊𝒏.',
                ...channelInfo
            });
            return;
        }

        if (!isSenderAdmin && !isOwner) {
            const stickerPath = './assets/sticktag.webp';
            if (fs.existsSync(stickerPath)) {
                const stickerBuffer = fs.readFileSync(stickerPath);
                await sock.sendMessage(chatId, { sticker: stickerBuffer });
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ Only group admins can use this command.',
                    ...channelInfo
                });
            }
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        const mentionedJidList = participants.map(p => p.id);

        if (replyMessage) {
            let messageContent = {};

            if (replyMessage.imageMessage) {
                const filePath = await downloadMediaMessage(replyMessage.imageMessage, 'image');
                messageContent = {
                    image: { url: filePath },
                    caption: messageText || replyMessage.imageMessage.caption || '',
                    mentions: mentionedJidList
                };
            } else if (replyMessage.videoMessage) {
                const filePath = await downloadMediaMessage(replyMessage.videoMessage, 'video');
                messageContent = {
                    video: { url: filePath },
                    caption: messageText || replyMessage.videoMessage.caption || '',
                    mentions: mentionedJidList
                };
            } else if (replyMessage.conversation || replyMessage.extendedTextMessage) {
                messageContent = {
                    text: messageText || replyMessage.conversation || replyMessage.extendedTextMessage?.text || '',
                    mentions: mentionedJidList
                };
            } else if (replyMessage.documentMessage) {
                const filePath = await downloadMediaMessage(replyMessage.documentMessage, 'document');
                messageContent = {
                    document: { url: filePath },
                    fileName: replyMessage.documentMessage.fileName,
                    caption: messageText || '',
                    mentions: mentionedJidList
                };
            } else {
                // Fallback: send text with mentions
                messageContent = {
                    text: messageText || '📢 Tagged all members!',
                    mentions: mentionedJidList
                };
            }

            if (Object.keys(messageContent).length > 0) {
                await sock.sendMessage(chatId, messageContent);
            }
        } else {
            await sock.sendMessage(chatId, {
                text: messageText || '📢 Tagged all members!',
                mentions: mentionedJidList
            });
        }
    } catch (error) {
        console.error('Tag command error:', error.message);
        await sock.sendMessage(chatId, {
            text: '❌ Tag command failed: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = tagCommand;
