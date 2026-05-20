/**
 * Modularized by Antigravity
 */
const FLIRTS = [
    "If you were a vegetable, you'd be a cute-cumber. 🥒",
    "Are you a magician? Because whenever I look at you, everyone else disappears. ✨",
    "Do you have a map? I keep getting lost in your eyes. 🗺️",
    "Is your name Google? Because you have everything I've been searching for. 🔍",
    "If I could rearrange the alphabet, I'd put U and I together. 💌",
    "Are you a parking ticket? Because you've got 'fine' written all over you. 😏",
    "Do you believe in love at first text, or should I send another message? 💬",
    "Are you a star? Because you light up every room you walk into. ⭐",
    "If beauty were time, you'd be an eternity. ♾️",
    "Are you a bank loan? Because you have my interest. 💰",
    "I must be a snowflake, because I've fallen for you. ❄️",
    "Is your dad a chef? Because you look delicious. 😋",
    "You must be tired, because you've been running through my mind all day. 🏃",
    "If you were words on a page, you'd be fine print. 📄",
    "Are you a camera? Every time I look at you, I smile. 📸",
    "My love for you is like dividing by zero — it cannot be defined. 📐",
    "Are you made of copper and tellurium? Because you're CuTe. 🧪",
    "If kisses were snowflakes, I'd send you a blizzard. ❄️💋",
    "Are you a Wi-Fi signal? Because I'm feeling a connection. 📶",
    "You must be a broom, because you swept me off my feet. 🧹",
    "If you were a fruit, you'd be a fine-apple. 🍍",
    "I'm not a photographer, but I can picture us together. 📷",
    "Are you a dictionary? You add meaning to my life. 📖",
    "If I had a star for every time you brightened my day, I'd have a galaxy. 🌌",
    "Do you have a band-aid? I scraped my knee falling for you. 🩹",
    "Is your name Bluetooth? Because I feel a connection between us. 📡",
    "You're like a fine wine — you get better every time I think about you. 🍷",
    "If you were a song, you'd be the best track on the album. 🎵",
    "My heart skips a beat every time I see your name. 💓",
    "Are you lightning? Because you electrify everything around you. ⚡",
    "If hugs were leaves, I'd give you a forest. 🌳",
    "You make my heart race faster than my WiFi. 💨",
    "I was going to say something sweet, but you already are. 🍯",
    "Even the stars are jealous of how much you shine. 🌟",
    "You're not just good-looking — you're the whole package. 📦",
    "If beauty was a crime, you'd be serving a life sentence. ⚖️",
    "I told my friends about you and they said I was dreaming. Prove them right. 😴",
    "You're the reason I check my phone every five seconds. 📱",
    "If I was a cat, I'd spend all nine lives with you. 🐱",
    "Someone told me happiness starts with H. But mine starts with U. 😊",
    "You must be a magnet, because I find myself drawn to you constantly. 🧲",
    "If I were a superhero, my power would be attracting you. 🦸",
    "You're the missing piece in my puzzle. 🧩",
    "Every love song suddenly makes sense when I think of you. 🎶",
];

const originalCommand = flirtCommand;
async function flirtCommand(sock, chatId, message) {
    try {
        const flirt = FLIRTS[Math.floor(Math.random() * FLIRTS.length)];
        await sock.sendMessage(chatId, { text: flirt }, { quoted: message });
    } catch (error) {
        console.error('Flirt command error:', error.message);
        await sock.sendMessage(chatId, { text: '❌ Something went wrong. Try again!' }, { quoted: message });
    }
}

{ flirtCommand };

module.exports = {
    name: 'flirt',
    async exec(sock, chatId, msg, args, rawText) {
        if (typeof originalCommand === 'function') {
            return originalCommand(sock, chatId, msg, args, rawText);
        } else if (typeof originalCommand === 'object' && originalCommand !== null) {
            const func = originalCommand.exec || Object.values(originalCommand).find(v => typeof v === 'function');
            if (func) return func(sock, chatId, msg, args, rawText);
        }
    }
};