const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) process.exit(1);

const files = fs.readdirSync(dir);

for (const file of files) {
    if (file.endsWith('.js')) {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Simple heuristic to detect old format
        if (content.includes('module.exports =') && !content.includes('name:')) {
            const name = path.basename(file, '.js');
            const newContent = content.replace(/module\.exports\s*=\s*/, `module.exports = {\n    name: '${name}',\n    async exec(sock, chatId, msg, args) {\n        const func = `) + `\n        return func(sock, chatId, msg, args);\n    }\n};`;
            
            // This is a bit risky, let's try a cleaner approach
            // We'll wrap the exported function
            const wrapped = `/**
 * Modularized by Antigravity
 */
const originalCommand = ${content.replace(/module\.exports\s*=\s*/, '')}

module.exports = {
    name: '${name}',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};`;
            fs.writeFileSync(filePath, wrapped);
        }
    }
}
