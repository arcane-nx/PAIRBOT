/**
 * Modularized by Antigravity
 */
const DARES = [
    "Send a voice note singing any song for 30 seconds. 🎤",
    "Change your WhatsApp status to 'I lost a dare' for 1 hour. 😅",
    "Send a funny selfie making the weirdest face you can. 🤪",
    "Text your most recent contact 'I love you' and screenshot their reply. 💬",
    "Post a baby photo of yourself in this chat. 👶",
    "Send a voice note saying a tongue twister as fast as you can. 👅",
    "Write a poem about the last food you ate and post it here. 🍕",
    "Do 20 jumping jacks and send a voice note of you counting out loud. 🏋️",
    "Change your profile picture to a cartoon character for 30 minutes. 🎨",
    "Send a voice note of you speaking in an accent for 1 minute. 🗣️",
    "Type a message using only emojis and make others guess it. 🧩",
    "Send a screenshot of your current WhatsApp wallpaper. 📱",
    "Write a 5-sentence story that includes: a cat, a spaceship, and pizza. 🚀🍕🐱",
    "Send the most embarrassing song in your playlist. 🎵",
    "Do your best impression of a famous person via voice note. 🎭",
    "Send a 15-second video of you dancing right now. 💃",
    "Call a friend and say 'I need to tell you something' then stay silent for 10 seconds. 📞",
    "Send the 5th photo in your gallery right now, no edits. 📷",
    "Write your name using only emojis. 🌟",
    "Send a voice note of you speaking backwards for 30 seconds. 🔄",
    "Post your honest opinion of the last movie you watched. 🎬",
    "Send a screenshot of your most used app. 📊",
    "Do your best robot walk and send a video. 🤖",
    "Write a haiku about Monday mornings. 📝",
    "Send a picture of the view from your window right now. 🌅",
    "Tell us your most embarrassing childhood story in 3 sentences. 😳",
    "Send a GIF that perfectly describes your current mood. 😂",
    "Write a fake advertisement for the nearest object to you. 📦",
    "Send a 10-second voice note of you speaking like a news anchor. 📺",
    "Describe yourself using only 3 emojis and explain your choice. 🤔",
    "Send a voice note of you whistling your favourite song. 🎶",
    "Post a screenshot of your last Google search (if it's safe!). 🔍",
    "Write a motivational quote but make it about food. 🍔",
    "Send a voice note counting backwards from 20 as fast as possible. ⏳",
    "Post a picture of your shoes right now. 👟",
    "Send a voice note of you saying the alphabet backwards. 🔡",
    "Make up a new emoji using two existing ones and explain what it means. 🆕",
    "Write a 3-word life philosophy and explain it. 💭",
    "Send a voice note of you giving a dramatic weather forecast. ⛈️",
    "Post the oldest meme you still have saved. 😂",
    "Send a voice note pretending to be a cooking show host for 30 seconds. 👨‍🍳",
    "Type the first 3 words that come to mind when you see the colour purple. 🟣",
    "Share the weirdest fact you know. 🤓",
    "Send a voice note of you reading a WhatsApp message in a dramatic movie trailer voice. 🎥",
];

const originalCommand = dareCommand;
async function dareCommand(sock, chatId, message) {
    try {
        const dare = DARES[Math.floor(Math.random() * DARES.length)];
        await sock.sendMessage(chatId, { text: `🎯 *DARE:*\n\n${dare}` }, { quoted: message });
    } catch (error) {
        console.error('Dare command error:', error.message);
        await sock.sendMessage(chatId, { text: '❌ Something went wrong. Try again!' }, { quoted: message });
    }
}

{ dareCommand };

module.exports = {
    name: 'dare',
    async exec(sock, chatId, msg, args, rawText) {
        if (typeof originalCommand === 'function') {
            return originalCommand(sock, chatId, msg, args, rawText);
        } else if (typeof originalCommand === 'object' && originalCommand !== null) {
            const func = originalCommand.exec || Object.values(originalCommand).find(v => typeof v === 'function');
            if (func) return func(sock, chatId, msg, args, rawText);
        }
    }
};