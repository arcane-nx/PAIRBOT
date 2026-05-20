const fs = require('fs');
const path = require('path');

function loadCommands(dir) {
    const commands = new Map();
    const files = fs.readdirSync(dir, { recursive: true });

    for (const file of files) {
        if (file.endsWith('.js')) {
            const fullPath = path.join(dir, file);
            try {
                const command = require(fullPath);
                if (command.name) {
                    commands.set(command.name.toLowerCase(), command);
                    if (command.alias && Array.isArray(command.alias)) {
                        for (const alias of command.alias) {
                            commands.set(alias.toLowerCase(), command);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error loading command ${file}:`, error);
            }
        }
    }
    return commands;
}

module.exports = { loadCommands };
