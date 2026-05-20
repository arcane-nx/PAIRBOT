const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

const commandFiles = getAllFiles(path.join(process.cwd(), 'src/commands'));

commandFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Fix missing originalCommand assignment
    if (content.includes('typeof originalCommand ===') && !content.includes('const originalCommand =')) {
        // Try to find the main function
        const funcMatch = content.match(/async function (\w+)Command/);
        if (funcMatch) {
            const funcName = funcMatch[1] + 'Command';
            content = content.replace(`async function ${funcName}`, `const originalCommand = ${funcName};\nasync function ${funcName}`);
            changed = true;
        } else {
            // Check for handle...Command
            const handleMatch = content.match(/async function handle(\w+)Command/);
            if (handleMatch) {
                const funcName = 'handle' + handleMatch[1] + 'Command';
                content = content.replace(`async function ${funcName}`, `const originalCommand = ${funcName};\nasync function ${funcName}`);
                changed = true;
            }
        }
    }

    // 2. Fix missing imports in antilink/antitag
    if (filePath.endsWith('antilink.js') && !content.includes('getAntilink')) {
        content = content.replace("const isAdmin = require('../../lib/isAdmin');", "const isAdmin = require('../../lib/isAdmin');\nconst { getAntilink, setAntilink, removeAntilink } = require('../../lib');");
        changed = true;
    }
    if (filePath.endsWith('antitag.js') && !content.includes('getAntitag')) {
        content = content.replace("const isAdmin = require('../../lib/isAdmin');", "const isAdmin = require('../../lib/isAdmin');\nconst { getAntitag, setAntitag, removeAntitag } = require('../../lib');");
        changed = true;
    }

    // 3. Fix crypto in hash.js
    if (filePath.endsWith('hash.js') && !content.includes("require('crypto')")) {
        content = "const crypto = require('crypto');\n" + content;
        changed = true;
    }

    // 4. Define channelInfo if missing but used
    if (content.includes('...channelInfo') && !content.includes('const channelInfo =')) {
        const channelInfoDef = `
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
`;
        content = content.replace("const isAdmin =", channelInfoDef + "\nconst isAdmin =");
        changed = true;
    }

    // 5. Remove unused imports (Simple version)
    const imports = ['axios', 'fs', 'path', 'isAdmin', 'channelInfo'];
    imports.forEach(imp => {
        const requireLine = new RegExp(`const ${imp} = require\\(['"].*['"]\\);?\\n?`, 'g');
        const channelLine = new RegExp(`const channelInfo = \\{[\\s\\S]*?\\};\\n?`, 'g');
        
        // Check if actually used elsewhere
        const searchPattern = new RegExp(`\\b${imp}\\b`, 'g');
        const matches = content.match(searchPattern) || [];
        
        if (matches.length === 1) { // Only the definition
            if (imp === 'channelInfo') {
                content = content.replace(channelLine, '');
            } else {
                content = content.replace(requireLine, '');
            }
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Cleaned up ${filePath}`);
    }
});

console.log('Final cleanup completed.');
