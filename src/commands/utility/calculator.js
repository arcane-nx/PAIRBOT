/**
 * Modularized by Antigravity (Clean Recovery)
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
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

async function calculatorCommand(sock, chatId, msg, args) {
    try {
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '🧮 *CALCULATOR*\n\nUsage: .calculator [expression]\n\nExamples:\n• .calculator 2+2\n• .calculator 15*8/4\n• .calculator sqrt(64)\n• .calculator sin(90)',
                ...channelInfo
            });
            return;
        }

        const expression = args.join('');
        
        // Basic security check
        if (/[a-zA-Z]/.test(expression.replace(/sin|cos|tan|sqrt|log|abs|ceil|floor|round|pi|e/g, ''))) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid expression. Use only numbers and math operators.',
                ...channelInfo
            });
            return;
        }

        try {
            // Replace common math functions
            const mathExpression = expression
                .replace(/sqrt/g, 'Math.sqrt')
                .replace(/sin/g, 'Math.sin')
                .replace(/cos/g, 'Math.cos')
                .replace(/tan/g, 'Math.tan')
                .replace(/log/g, 'Math.log')
                .replace(/abs/g, 'Math.abs')
                .replace(/ceil/g, 'Math.ceil')
                .replace(/floor/g, 'Math.floor')
                .replace(/round/g, 'Math.round')
                .replace(/pi/g, 'Math.PI')
                .replace(/e/g, 'Math.E');

            const result = eval(mathExpression);

            await sock.sendMessage(chatId, {
                text: `🧮 *CALCULATOR RESULT*\n\nExpression: ${expression}\nResult: ${result}`,
                ...channelInfo
            });

        } catch (_) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid mathematical expression.',
                ...channelInfo
            });
        }

    } catch (error) {
        await sock.sendMessage(chatId, {
            text: '❌ Calculator error: ' + error.message,
            ...channelInfo
        });
    }
}

module.exports = {
    name: 'calculator',
    async exec(sock, chatId, msg, args, rawText) {
        return calculatorCommand(sock, chatId, msg, args, rawText);
    }
};