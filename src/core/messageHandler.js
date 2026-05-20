const fs = require('fs');
const path = require('path');
const { isBanned } = require('../lib/isBanned');
const { Antilink } = require('../lib/antilink');
const { handleBadwordDetection } = require('../lib/antibadword');
const { handleTagDetection } = require('../commands/general/antitag');
const { handleChatbotResponse } = require('../commands/general/chatbot');
const { handleTicTacToeMove } = require('../commands/general/tictactoe');
const { handleMessageRevocation, storeMessage } = require('../commands/general/antidelete');
const { handleAutoTyping, isAutoTypingEnabled } = require('../commands/general/autotyping');
const { handleAutoRecording, isAutoRecordingEnabled } = require('../commands/general/autorecording');
const { incrementMessageCount } = require('../commands/general/topmembers');
const { handleMoviePick } = require('../commands/general/movie');
const isAdmin = require('../lib/isAdmin');

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: false,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363410694173688@newsletter",
            newsletterName: "❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥",
            serverMessageId: -1,
        },
    },
};

async function handleMessages(sock, messageUpdate, commands) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== "notify") return;

        const message = messages[0];
        const chatId = message.key.remoteJid;
        if (!message?.message) return;

        // Handle message revocation
        if (message.message?.protocolMessage?.type === 0) {
            await handleMessageRevocation(sock, message);
            return;
        }

        // Store message for antidelete
        if (message.message && message.key?.id) {
            try { storeMessage(message); } catch(e) {}
        }

        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith("@g.us");

        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            ""
        ).toLowerCase().trim();

        const rawText = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            ""
        );

        // Auto Typing/Recording
        if (userMessage && isAutoTypingEnabled()) await handleAutoTyping(sock, chatId);
        if (userMessage && isAutoRecordingEnabled()) await handleAutoRecording(sock, chatId);

        // Ban check
        if (isBanned(senderId) && !userMessage.startsWith(".unban")) {
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, { text: "❌ You are banned from using the bot.", ...channelInfo });
            }
            return;
        }

        // Games (TicTacToe)
        if (/^[1-9]$/.test(userMessage) || userMessage === "surrender") {
            await handleTicTacToeMove(sock, chatId, senderId, userMessage);
            return;
        }

        if (!message.key.fromMe) incrementMessageCount(chatId, senderId);

        // Group Security
        if (isGroup && userMessage) {
            await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
        }

        // Command Routing
        if (!userMessage.startsWith(".")) {
            // Non-command logic
            if (isGroup) {
                await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                await Antilink(message, sock);
                await handleTagDetection(sock, chatId, message, senderId);
            }
            // Handle movie pick button/number
            const _isBtn = !!message.message?.buttonsResponseMessage;
            const _isList = !!message.message?.listResponseMessage;
            const _isNumber = /^\d+$/.test(userMessage);
            if (_isBtn || _isList || _isNumber) {
                const movieHandled = await handleMoviePick(sock, chatId, message, userMessage, senderId);
                if (movieHandled) return;
            }
            return;
        }

        // Modular Command Execution
        const args = rawText.split(' ');
        const commandName = args.shift().slice(1).toLowerCase();
        const command = commands.get(commandName);

        if (command) {
            console.log(`📝 Command used: ${commandName} in ${isGroup ? "group" : "private"}`);
            
            // Re-implement the switch-case specific logic if any, or just call exec
            // For now, most switch logic was just calling the function
            await command.exec(sock, chatId, message, args, rawText);
        }

    } catch (error) {
        console.error("Error in message handler:", error);
    }
}

module.exports = { handleMessages };
