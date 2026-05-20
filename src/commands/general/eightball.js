/**
 * Modularized by Antigravity
 */
const originalCommand = /**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/

const eightBallResponses = [
    "Yes, definitely!",
    "No way!",
    "Ask again later.",
    "It is certain.",
    "Very doubtful.",
    "Without a doubt.",
    "My reply is no.",
    "Signs point to yes."
];

async function eightBallCommand(sock, chatId, question) {
    if (!question) {
        await sock.sendMessage(chatId, { text: 'Please ask a question!' });
        return;
    }

    const randomResponse = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
    await sock.sendMessage(chatId, { text: `🎱 ${randomResponse}` });
}

{ eightBallCommand };


module.exports = {
    name: 'eightball',
    async exec(sock, chatId, msg, args) {
        return originalCommand(sock, chatId, msg, args);
    }
};