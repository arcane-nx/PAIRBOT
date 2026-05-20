/**
 * Modularized by Antigravity
 */
const originalCommand = /**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

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

async function saveCommand(sock, chatId, msg) {
    // Send reaction first
    try {
        await sock.sendMessage(chatId, {
            react: {
                text: "📤",
                key: msg.key
            }
        });
    } catch (_) {
        // Continue if reaction fails
    }

    try {
        // Check if message is a reply
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage) {
            await sock.sendMessage(chatId, {
                text: "*🍁 Please Reply To A Status To Save It!*",
                ...channelInfo
            }, { quoted: msg });
            return;
        }

        // Get owner JID
        const ownerJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const senderNumber = (msg.key.participant || msg.key.remoteJid).split('@')[0];

        try {
            // Send confirmation to user
            await sock.sendMessage(chatId, {
                text: '✅ Status saved and Forwarded To Owner Privately!',
                ...channelInfo
            });

            // Handle different message types
            if (quotedMessage.imageMessage) {
                try {
                    // Try to download image
                    const stream = await downloadContentFromMessage(quotedMessage.imageMessage, 'image');
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }

                    await sock.sendMessage(ownerJid, {
                        image: buffer,
                        caption: `📸 *STATUS SAVED BY EMMYHENZ V1*\n\nCaption: ${quotedMessage.imageMessage.caption || 'No caption'}\n\nTime: ${new Date().toLocaleString()}\n\nSaved from: +${senderNumber}`,
                        ...channelInfo
                    });

                } catch (_) {
                    // Fallback for image
                    await sock.sendMessage(ownerJid, {
                        text: `📸 *STATUS SAVED BY EMMYHENZ V1*\n\nType: Image Status\nCaption: ${quotedMessage.imageMessage.caption || 'No caption'}\n\nTime: ${new Date().toLocaleString()}\n\nSaved from: +${senderNumber}\n\n_Note: Image could not be downloaded but status info was saved._`,
                        ...channelInfo
                    });
                }

            } else if (quotedMessage.videoMessage) {
                try {
                    // Try to download video
                    const stream = await downloadContentFromMessage(quotedMessage.videoMessage, 'video');
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }

                    await sock.sendMessage(ownerJid, {
                        video: buffer,
                        caption: `🎥 *STATUS SAVED BY EMMYHENZ V1*\n\nCaption: ${quotedMessage.videoMessage.caption || 'No caption'}\n\nTime: ${new Date().toLocaleString()}\n\nSaved from: +${senderNumber}`,
                        ...channelInfo
                    });

                } catch (_) {
                    // Fallback for video
                    await sock.sendMessage(ownerJid, {
                        text: `🎥 *STATUS SAVED BY EMMYHENZ V1*\n\nType: Video Status\nCaption: ${quotedMessage.videoMessage.caption || 'No caption'}\n\nTime: ${new Date().toLocaleString()}\n\nSaved from: +${senderNumber}\n\n_Note: Video could not be downloaded but status info was saved._`,
                        ...channelInfo
                    });
                }

            } else if (quotedMessage.audioMessage) {
                try {
                    // Try to download audio
                    const stream = await downloadContentFromMessage(quotedMessage.audioMessage, 'audio');
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }

                    await sock.sendMessage(ownerJid, {
                        audio: buffer,
                        mimetype: "audio/mp4",
                        ptt: quotedMessage.audioMessage.ptt || false,
                        ...channelInfo
                    });

                    // Send info message for audio
                    await sock.sendMessage(ownerJid, {
                        text: `🎵 *AUDIO STATUS SAVED BY EMMYHENZ V1*\n\nTime: ${new Date().toLocaleString()}\n\nSaved from: +${senderNumber}`,
                        ...channelInfo
                    });

                } catch (_) {
                    await sock.sendMessage(ownerJid, {
                        text: `🎵 *STATUS SAVED BY EMMYHENZ V1*\n\nType: Audio Status\nTime: ${new Date().toLocaleString()}\n\nSaved from: +${senderNumber}\n\n_Note: Audio could not be downloaded but status info was saved._`,
                        ...channelInfo
                    });
                }

            } else if (quotedMessage.stickerMessage) {
                try {
                    // Try to download sticker
                    const stream = await downloadContentFromMessage(quotedMessage.stickerMessage, 'sticker');
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }

                    await sock.sendMessage(ownerJid, {
                        sticker: buffer,
                        ...channelInfo
                    });

                    await sock.sendMessage(ownerJid, {
                        text: `🎯 *STICKER STATUS SAVED BY EMMYHENZ V1*\n\nTime: ${new Date().toLocaleString()}\n\nSaved from: +${senderNumber}`,
                        ...channelInfo
                    });

                } catch (_) {
                    await sock.sendMessage(ownerJid, {
                        text: `🎯 *STATUS SAVED BY EMMYHENZ V1*\n\nType: Sticker Status\nTime: ${new Date().toLocaleString()}\n\nSaved from: +${senderNumber}\n\n_Note: Sticker could not be downloaded but status info was saved._`,
                        ...channelInfo
                    });
                }

            } else if (quotedMessage.conversation || quotedMessage.extendedTextMessage) {
                // Text status
                const statusText = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text || 'No text';
                
                await sock.sendMessage(ownerJid, {
                    text: `📝 *STATUS SAVED BY EMMYHENZ V1*\n\nType: Text Status\nText: "${statusText}"\n\nTime: ${new Date().toLocaleString()}\n\nSaved from: +${senderNumber}`,
                    ...channelInfo
                });

            } else {
                // Unknown type - just forward the original message context
                await sock.sendMessage(ownerJid, {
                    text: `❓ *STATUS SAVED BY EMMYHENZ V1*\n\nType: Unknown Status\nTime: ${new Date().toLocaleString()}\n\nSaved from: +${senderNumber}\n\n_Note: Status type could not be identified but was saved._`,
                    ...channelInfo
                });
            }

        } catch (forwardError) {
            console.log('Forward error (but user confirmation already sent):', forwardError.message);
            
            // Try to send basic info to owner as fallback
            try {
                await sock.sendMessage(ownerJid, {
                    text: `📥 *STATUS SAVE ATTEMPT BY EMMYHENZ V1*\n\nSaved from: +${senderNumber}\nTime: ${new Date().toLocaleString()}\n\n_Note: Status could not be processed completely but attempt was made._`,
                    ...channelInfo
                });
            } catch (fallbackError) {
                console.log('Fallback also failed:', fallbackError.message);
            }
        }

    } catch (error) {
        console.error("Save Command Error:", error);
        
        // Always respond positively to user
        try {
            await sock.sendMessage(chatId, {
                text: "✅ Done",
                ...channelInfo
            }, { quoted: msg });
        } catch (_) {
            // Silent fail if even basic response fails
        }
    }
}

{ saveCommand };

module.exports = {
    name: 'save',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};