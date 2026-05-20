/**
 * Modularized by Antigravity
 */
const originalCommand = /**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/

const isAdmin = require('../lib/isAdmin');

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

// Leave Group Command
async function leavegcCommand(sock, chatId, msg) {
    try {
        // Check if sender is owner
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ 𝐓𝐡𝐢𝐬 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐂𝐚𝐧 𝐁𝐞 𝐔𝐬𝐞𝐝 𝐎𝐧𝐥𝐲 𝐁𝐲 𝐌𝐲 𝐎𝐰𝐧𝐞𝐫 𝐎𝐧𝐥𝐲!',
                ...channelInfo
            });
            return;
        }

        try {
            // Send goodbye message before leaving
            await sock.sendMessage(chatId, {
                text: '👋 *Bot is leaving the group*\n\nGoodbye everyone! Thanks for using ❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥.\n\nFor support, contact the owner.',
                ...channelInfo
            });

            // Wait a moment before leaving
            setTimeout(async () => {
                await sock.groupLeave(chatId);
            }, 2000);

        } catch (leaveError) {
            console.error('Error leaving group:', leaveError);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to leave the group. Please try again.\n\nError: ' + leaveError.message,
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error in leavegc command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ An error occurred while leaving the group!\n' + error.message,
            ...channelInfo
        });
    }
}

// Add Member Command
async function addCommand(sock, chatId, msg, args) {
    try {
        // Check if it's a group
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        // Get sender ID
        const senderId = msg.key.participant || msg.key.remoteJid;

        // Check admin permissions
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);
        const isSenderAdmin = adminStatus.isSenderAdmin;
        const isBotAdmin = adminStatus.isBotAdmin;

        // Check if bot is admin
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: '❌ ❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥 must be an admin to add members.',
                ...channelInfo
            });
            return;
        }

        // Check if sender has permission (admin or owner)
        if (!isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins or bot owner can use this command.',
                ...channelInfo
            });
            return;
        }

        // Get user to add
        let users;
        
        // Check for quoted message
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quotedMessage) {
            users = msg.message.extendedTextMessage.contextInfo.participant;
        }
        // Check for text input (phone number)
        else if (args.length > 0) {
            const text = args.join(' ');
            users = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        }
        else {
            await sock.sendMessage(chatId, {
                text: '❌ Please specify a user to add!\n\n*Usage:*\n- Reply to a message\n- Use phone number: .add 1234567890',
                ...channelInfo
            });
            return;
        }

        try {
            // Add the user to the group
            const addResult = await sock.groupParticipantsUpdate(chatId, [users], 'add');
            
            // Get user number for display
            const userNumber = users.split('@')[0];
            
            // Check the result
            if (addResult && addResult[0] && addResult[0].status === '200') {
                await sock.sendMessage(chatId, {
                    text: `✅ *Member added successfully*\n\nUser: +${userNumber}\nStatus: Added to group`,
                    ...channelInfo
                });
            } else if (addResult && addResult[0] && addResult[0].status === '403') {
                await sock.sendMessage(chatId, {
                    text: `❌ *Cannot add member*\n\nUser: +${userNumber}\nReason: User's privacy settings don't allow being added to groups.\n\n💡 *Tip:* Send them the group invite link instead.`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *Add attempt completed*\n\nUser: +${userNumber}\nStatus: ${addResult[0]?.status || 'Unknown'}\n\nThey may need to accept the group invitation.`,
                    ...channelInfo
                });
            }

        } catch (addError) {
            console.error('Error adding member:', addError);
            const userNumber = users.split('@')[0];
            await sock.sendMessage(chatId, {
                text: `❌ Failed to add member +${userNumber}\n\nPossible reasons:\n- User blocked the bot\n- User's privacy settings\n- User already in group\n- Network issues\n\nError: ${addError.message}`,
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error in add command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ An error occurred while adding member!\n' + error.message,
            ...channelInfo
        });
    }
}

{
    leavegcCommand,
    addCommand
};

module.exports = {
    name: 'groupmanage',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};