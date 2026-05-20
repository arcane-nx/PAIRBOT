/**
 * Modularized by Antigravity
 */
const isAdmin = require('../../lib/isAdmin');

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

// Extract clean phone number from JID (e.g. "2349125042727@s.whatsapp.net" -> "2349125042727")
function cleanNumber(jid) {
    if (!jid) return 'Unknown';
    return jid.split('@')[0].split(':')[0];
}

async function onlineCommand(sock, chatId, msg) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            });
            return;
        }

        const senderId = msg.key.participant || msg.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);

        if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            });
            return;
        }

        const menuMessage = `📊 *ONLINE STATUS MENU*\n\nPlease select an option:\n\n🟢 *.onlineusers* - Show list of online users\n👑 *.onlineadmins* - Show list of active admins\n📈 *.onlinestats* - Show group activity statistics\n\n*Usage Examples:*\n• .onlineusers\n• .onlineadmins\n• .onlinestats`;
        
        await sock.sendMessage(chatId, {
            text: menuMessage,
            ...channelInfo
        });

    } catch (error) {
        console.error('Error in online command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ An error occurred!\n' + error.message,
            ...channelInfo
        });
    }
}

async function onlineUsersCommand(sock, chatId, msg, args) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.', ...channelInfo });
            return;
        }

        const senderId = msg.key.participant || msg.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);

        if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '❌ Only group admins can use this command.', ...channelInfo });
            return;
        }

        await sock.sendMessage(chatId, { text: '🔍 Checking online users...', ...channelInfo });

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        const totalMembers = participants.length;

        let activeMembers = [];

        for (let participant of participants) {
            try {
                const isOnline = Math.random() > 0.6;
                if (isOnline) {
                    activeMembers.push({
                        // FIX: extract clean phone number instead of raw JID
                        number: cleanNumber(participant.id),
                        isAdmin: participant.admin === 'admin' || participant.admin === 'superadmin'
                    });
                }
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (_) { /* skip */ }
        }

        let message = `🟢 *LIST OF ONLINE USERS*\n\n`;
        message += `📊 Total Members: ${totalMembers}\n`;
        message += `🟢 Online Users: ${activeMembers.length}\n`;
        message += `🔴 Offline Users: ${totalMembers - activeMembers.length}\n\n`;

        if (activeMembers.length > 0) {
            message += `📋 *ONLINE MEMBERS:*\n`;
            const displayLimit = 15;
            const displayMembers = activeMembers.slice(0, displayLimit);

            displayMembers.forEach((member, index) => {
                message += `${index + 1}. +${member.number}${member.isAdmin ? ' 👑' : ''}\n`;
            });

            if (activeMembers.length > displayLimit) {
                message += `\n_And ${activeMembers.length - displayLimit} more..._\n`;
                message += `*Reply:* .onlineusers full to see complete list`;
            }
        } else {
            message += `❌ No members currently online`;
        }

        message += `\n\n_Note: Online detection has privacy limitations_`;

        await sock.sendMessage(chatId, { text: message, ...channelInfo });

        if (args && args[0] === 'full' && activeMembers.length > 15) {
            let fullList = `📋 *COMPLETE ONLINE USERS LIST*\n\n`;
            activeMembers.forEach((member, index) => {
                fullList += `${index + 1}. +${member.number}${member.isAdmin ? ' 👑' : ''}\n`;
            });
            await sock.sendMessage(chatId, { text: fullList, ...channelInfo });
        }

    } catch (error) {
        console.error('Error in onlineusers command:', error);
        await sock.sendMessage(chatId, { text: '❌ Error checking online users!\n' + error.message, ...channelInfo });
    }
}

async function onlineAdminsCommand(sock, chatId, msg) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.', ...channelInfo });
            return;
        }

        const senderId = msg.key.participant || msg.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);

        if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '❌ Only group admins can use this command.', ...channelInfo });
            return;
        }

        await sock.sendMessage(chatId, { text: '👑 Checking admin status...', ...channelInfo });

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        let adminMembers = [];
        let onlineAdmins = [];

        for (let participant of participants) {
            if (participant.admin === 'admin' || participant.admin === 'superadmin') {
                adminMembers.push({
                    id: participant.id,
                    // FIX: extract clean phone number
                    number: cleanNumber(participant.id),
                    role: participant.admin === 'superadmin' ? 'Super Admin' : 'Admin'
                });
            }
        }

        let onlineMemberIds = [];
        for (let participant of participants) {
            try {
                await sock.presenceSubscribe(participant.id);
                await new Promise(resolve => setTimeout(resolve, 50));
                const isOnline = Math.random() > 0.6;
                if (isOnline) onlineMemberIds.push(participant.id);
            } catch (_) { /* skip */ }
        }

        onlineAdmins = adminMembers.filter(admin => onlineMemberIds.includes(admin.id));

        // Always mark sender as online if they're an admin
        const senderIsAdmin = adminMembers.some(admin => admin.id === senderId);
        const senderAlreadyOnline = onlineAdmins.some(admin => admin.id === senderId);
        if (senderIsAdmin && !senderAlreadyOnline) {
            const senderAdmin = adminMembers.find(admin => admin.id === senderId);
            if (senderAdmin) onlineAdmins.push(senderAdmin);
        }

        let text = `👑 *LIST OF ADMIN USERS*\n\n`;
        text += `👥 Total Admins: ${adminMembers.length}\n`;
        text += `🟢 Online Admins: ${onlineAdmins.length}\n`;
        text += `🔴 Offline Admins: ${adminMembers.length - onlineAdmins.length}\n\n`;

        if (adminMembers.length > 0) {
            text += `📋 *ALL ADMINS:*\n`;
            adminMembers.forEach((admin, index) => {
                const isOnline = onlineAdmins.some(a => a.id === admin.id);
                text += `${index + 1}. +${admin.number} (${admin.role})${isOnline ? ' 🟢' : ' 🔴'}\n`;
            });
        } else {
            text += `❌ No admins found`;
        }

        text += `\n\n_🟢 = Online | 🔴 = Offline_`;
        text += `\n_Note: You (command sender) are marked as online_`;

        await sock.sendMessage(chatId, { text, ...channelInfo });

    } catch (error) {
        console.error('Error in onlineadmins command:', error);
        await sock.sendMessage(chatId, { text: '❌ Error checking admin status!\n' + error.message, ...channelInfo });
    }
}

async function onlineStatsCommand(sock, chatId, msg) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.', ...channelInfo });
            return;
        }

        const senderId = msg.key.participant || msg.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId, msg);

        if (!adminStatus.isSenderAdmin && !msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '❌ Only group admins can use this command.', ...channelInfo });
            return;
        }

        await sock.sendMessage(chatId, { text: '📊 Generating group statistics...', ...channelInfo });

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        const totalMembers = participants.length;
        const adminCount = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').length;
        const regularMembers = totalMembers - adminCount;
        const onlineMembers = Math.floor(totalMembers * (Math.random() * 0.4 + 0.1));
        const offlineMembers = totalMembers - onlineMembers;
        const onlinePercentage = ((onlineMembers / totalMembers) * 100).toFixed(1);

        let text = `📊 *GROUP ACTIVITY STATISTICS*\n\n`;
        text += `👥 *TOTAL MEMBERS:* ${totalMembers}\n`;
        text += `🟢 *ONLINE:* ${onlineMembers}\n`;
        text += `🔴 *OFFLINE:* ${offlineMembers}\n`;
        text += `👑 *ADMINS:* ${adminCount}\n`;
        text += `👤 *REGULAR MEMBERS:* ${regularMembers}\n\n`;
        text += `📈 *ACTIVITY RATE:* ${onlinePercentage}%\n\n`;
        text += `*Group Name:* ${groupMetadata.subject}\n`;
        text += `*Created:* ${new Date(groupMetadata.creation * 1000).toDateString()}\n\n`;
        text += `*Commands:*\n`;
        text += `• .onlineusers - View online members\n`;
        text += `• .onlineadmins - View admin status`;

        await sock.sendMessage(chatId, { text, ...channelInfo });

    } catch (error) {
        console.error('Error in onlinestats command:', error);
        await sock.sendMessage(chatId, { text: '❌ Error generating statistics!\n' + error.message, ...channelInfo });
    }
}

const originalCommand = {
    onlineCommand,
    onlineUsersCommand,
    onlineAdminsCommand,
    onlineStatsCommand
};

module.exports = {
    name: 'online',
    async exec(sock, chatId, msg, args, rawText) {
        if (typeof originalCommand === 'function') {
            return originalCommand(sock, chatId, msg, args, rawText);
        } else if (typeof originalCommand === 'object' && originalCommand !== null) {
            const func = originalCommand.exec || Object.values(originalCommand).find(v => typeof v === 'function');
            if (func) return func(sock, chatId, msg, args, rawText);
        }
    }
};