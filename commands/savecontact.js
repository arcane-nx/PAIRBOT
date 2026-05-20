/**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/

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

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function savecontactCommand(sock, chatId, msg) {
    try {
        // Check if it's a group
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command is for groups only.',
                ...channelInfo
            });
            return;
        }

        // Check if sender is owner
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ 𝐓𝐡𝐢𝐬 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐂𝐚𝐧 𝐁𝐞 𝐔𝐬𝐞𝐝 𝐎𝐧𝐥𝐲 𝐁𝐲 𝐌𝐲 𝐎𝐰𝐧𝐞𝐫 𝐎𝐧𝐥𝐲!',
                ...channelInfo
            });
            return;
        }

        try {
            // Get group metadata
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;
            
            if (!participants || participants.length === 0) {
                await sock.sendMessage(chatId, {
                    text: '❌ Unable to fetch group participants.',
                    ...channelInfo
                });
                return;
            }

            // Create VCF content with actual WhatsApp names
            let vcard = '';
            
            for (let participant of participants) {
                const phoneNumber = participant.id.split("@")[0];
                let contactName;
                
                try {
                    // Get the contact info including push name
                    const contactInfo = await sock.getBusinessProfile(participant.id).catch(() => null);
                    
                    // Try different methods to get the actual name
                    if (participant.pushname && participant.pushname !== phoneNumber) {
                        contactName = participant.pushname;
                    } else if (participant.notify && participant.notify !== phoneNumber) {
                        contactName = participant.notify;
                    } else if (participant.verifiedName) {
                        contactName = participant.verifiedName;
                    } else if (contactInfo && contactInfo.business_name) {
                        contactName = contactInfo.business_name;
                    } else {
                        contactName = phoneNumber; // Use just number if no name found
                    }
                    
                } catch (_) {
                    contactName = phoneNumber;
                }
                
                // Clean the contact name
                if (contactName && contactName.trim() !== '' && contactName !== phoneNumber) {
                    contactName = contactName.replace(/[^\w\s+.\-()]/g, '').trim();
                } else {
                    contactName = phoneNumber;
                }
                
                // Use the simpler VCF format like your friend's
                vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:+${phoneNumber}\nEMAIL:null\nEND:VCARD\n\n`;
            }

            // Create file path in temp directory
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            const filePath = path.join(tempDir, `contacts_${Date.now()}.vcf`);
            
            // Send processing message
            await sock.sendMessage(chatId, {
                text: `📞 Saving ${participants.length} participants contact...`,
                ...channelInfo
            });

            // Write VCF file
            fs.writeFileSync(filePath, vcard.trim());
            await sleep(2000);

            // Send the VCF file
            await sock.sendMessage(chatId, {
                document: fs.readFileSync(filePath), 
                mimetype: 'text/vcard', 
                fileName: 'EMMYHENZ-CONTACTS.vcf', 
                caption: `✅ *Done saving contacts!*\n\n📱 Group Name: *${groupMetadata.subject}*\n👥 Contacts: *${participants.length}*\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥 👑`,
                ...channelInfo
            }, { 
                quoted: msg 
            });

            // Clean up the file after sending
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

        } catch (processingError) {
            console.error('Error processing contacts:', processingError);
            await sock.sendMessage(chatId, {
                text: '❌ Error occurred while processing group contacts!\n\n' + processingError.message,
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error in savecontact command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ An error occurred while saving contacts!\n' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    savecontactCommand
};