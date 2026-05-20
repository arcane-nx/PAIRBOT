const path = require('path');
const fs = require('fs');

// Load config and settings
require('./config/config');
const settings = require('./config/settings');

// Initialize globals (keeping compatibility)
global.packname = settings.packname;
global.author = settings.author;
global.channelLink = "https://whatsapp.com/channel/0029Vb9AcCa0rGiD0eJYsQ1n";
global.ytch = "EMMYHENZTECHINFO";

const { connectToWhatsApp } = require('./core/connection');
const { handleMessages } = require('./core/messageHandler');
const { loadCommands } = require('./lib/commandLoader');

// Initialize modular command system
const commands = loadCommands(path.join(__dirname, 'commands'));
console.log(`🚀 Loaded ${commands.size} commands`);

// Start the bot
async function start() {
    console.log("Starting EMMYHENZ-V3.1...");
    
    // Connect to WhatsApp
    const sock = await connectToWhatsApp(
        (sock, messageUpdate) => handleMessages(sock, messageUpdate, commands),
        (update) => { /* handle connection update if needed */ },
        () => { /* handle creds update if needed */ }
    );

    // Start web server (server.js)
    try {
        const startServer = require('./web/server');
        // If server.js exports a function, call it. If not, it might start on require.
        if (typeof startServer === 'function') startServer();
    } catch (error) {
        console.error("Failed to start web server:", error.message);
    }
}

start();
