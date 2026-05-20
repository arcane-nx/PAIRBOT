/**
 * Modularized by Antigravity
 */
const settings = require('../../config/settings');
const fs = require('fs');
const path = require('path');

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

async function helpCommand(sock, chatId, message) {
        const start = Date.now();
        await sock.sendMessage(chatId, { text: '_❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.5🎊❤️‍🔥 𝕻𝖗𝖔𝖈𝖊𝖘𝖘𝖎𝖓𝖌❤️‍🔥..._' }, { quoted: message });
        const end = Date.now();
        const ping = Math.round((end - start) / 2);

        const uptimeInSeconds = process.uptime();
        const uptimeFormatted = formatTime(uptimeInSeconds);  // FIX: was ${uptime}, variable is uptimeFormatted

    const helpMessage = `
    
╔════════◇◆◇═══════╗
├▢❤️‍🔥 *𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.5* ❤️‍🔥
├▢👑 Owner: *${settings.botOwner}*
├▢🕐 *${new Date().toLocaleString()}*
├▢⏱️ Uptime: *${uptimeFormatted}*
├▢📶 Ping: *${ping}ms*
├▢🔖 Version: *v${settings.version}*
├▢🌐 *Free Bot:*
bot-connect.emmyhenztech.site
╚════════◇◆◇═══════╝

╔══════════════════╗
    👬 *GROUP MANAGER*
╠──────────────────╣
║ *.ban* <ban a user>
║ *.unban* <remove ban>
║ *.promote* <make admin>
║ *.demote* <remove admin>
║ *.kick* <remove member>
║ *.mute* <disable chat>
║ *.unmute* <enable chat>
║ *.add* <add member>
║ *.kickall* <kick everyone>
║ *.leavegc* <bot leaves>
║ *.creategc* <create group>
║ *.setname* <rename group>
║ *.setdesc* <set description>
║ *.revoke* <reset invite link>
║ *.welcome* <join message>
║ *.goodbye* <leave message>
║ *.tagall* <mention everyone>
║ *.tag* <tag with message>
║ *.hidetag* <silent tag all>
║ *.tagadmins* <tag admins>
║ *.staff* <list admins>
║ *.groupinfo* <group details>
║ *.gcstatus* <set gc status>
║ *.jid* <show group JID>
║ *.topmembers* <most active>
╚══════════════════╝

╔══════════════════╗
    🛡️ *SECURITY*
╠──────────────────╣
║ *.antilink* <block links>
║ *.antitag* <block tag spam>
║ *.antibadword* <filter words>
║ *.antidelete* <recover msgs>
║ *.anticall* <block calls>
║ *.slowmode* <slow messages>
║ *.lockgroup* <admins only>
║ *.unlockgroup* <open group>
║ *.warn* <warn a member>
║ *.warnings* <check warns>
╚══════════════════╝

╔══════════════════╗
    ⚙️ *SETTINGS*
╠──────────────────╣
║ *.mode* <public/private>
║ *.autostatus* <view status>
║ *.autotyping* <show typing>
║ *.autorecording* <show rec>
║ *.autoreact* <auto react>
║ *.channelreact* <react posts>
║ *.setpp* <change bot pic>
║ *.setbotbio* <set bot bio>
║ *.clearsession* <clear session>
║ *.cleartmp* <delete temp>
╚══════════════════╝

╔══════════════════╗
     🤖 *AI MENU*
╠──────────────────╣
║ *.gpt* <chat with GPT>
║ *.gemini* <chat Gemini>
║ *.imagine* <AI image>
║ *.flux* <Flux image>
║ *.dalle* <DALL·E image>
╚══════════════════╝

╔══════════════════╗
    📥 *DOWNLOADER*
╠──────────────────╣
║ *.play* <download audio>
║ *.song / .music* <find song>
║ *.ytmp3 / .mp3* <YT to MP3>
║ *.video / .ytmp4* <YT to MP4>
║ *.instagram* <download IG>
║ *.tiktok / .tt* <download TT>
║ *.facebook / .fb* <download FB>
║ *.tomp3* <video to audio>
╚═══════════════════╝

╔══════════════════╗
  🛠️ *UTILITY & TOOLS*
╠──────────────────╣
║ *.ss / .ssweb* <screenshot>
║ *.translate* <translate text>
║ *.tts* <text to speech>
║ *.qrcode / .qr* <make QR>
║ *.shorturl* <shorten link>
║ *.tourl* <upload file>
║ *.hash* <hash string>
║ *.base64* <encode/decode>
║ *.binary* <text to binary>
║ *.encrypt* <encrypt text>
║ *.decrypt* <decrypt text>
║ *.calculator* <do math>
║ *.reminder* <set reminder>
║ *.password* <gen password>
║ *.timestamp* <unix time>
║ *.currency* <convert money>
║ *.crypto* <crypto price>
║ *.weather* <city weather>
║ *.news* <latest headlines>
║ *.pair* <link WhatsApp>
║ *.save* <save message>
║ *.savecontact* <save contact>
║ *.delete* <delete message>
║ *.vv* <view once reveal>
║ *.vv2* <bypass view once>
║ *.block* <block contact>
║ *.unblock* <unblock contact>
║ *.device* <device info>
║ *.getpp* <profile picture>
╚══════════════════╝

╔══════════════════╗
   🎨 *STICKER & IMAGE*
╠──────────────────╣
║ *.sticker / .s* <img to sticker>
║ *.simage* <sticker to img>
║ *.blur* <blur image>
║ *.attp* <text to sticker>
║ *.take* <set sticker name>
║ *.emojimix* <mix 2 emojis>
║ *.tgsticker* <TG sticker>
║ *.meme* <random meme>
╚══════════════════╝

╔══════════════════╗
        🖼️ *PIES*
╠──────────────────╣
║ *.pies* <browse country>
║ *.india* *.china* *.japan*
║ *.korea* *.thai* *.malaysia*
╚══════════════════╝

╔══════════════════╗
       🎮 *GAMES*
╠──────────────────╣
║ *.tictactoe* <play ttt>
║ *.hangman* <play hangman>
║ *.trivia* <trivia game>
║ *.truth* <truth question>
║ *.dare* <dare challenge>
║ *.poll* <create poll>
║ *.vote* <vote on poll>
║ *.results* <poll results>
╚═════════════════╝

╔═════════════════╗
    📝 *TEXT TOOLS*
╠─────────────────╣
║ *.count* <count chars
║ *.reverse* <reverse text>
║ *.case* <change case>
║ *.palindrome* <check palindrome>
║ *.lyrics* <find lyrics>
╚═════════════════╝

╔═════════════════╗
 🔤 *DESIGN / TEXTMAKER*
╠─────────────────╣
║ *.metallic* *.ice* *.snow*
║ *.impressive* *.matrix* *.neon*
║ *.light* *.devil* *.purple*
║ *.thunder* *.leaves* *.1917*
║ *.arena* *.hacker* *.sand*
║ *.blackpink* *.glitch* *.fire*
║ _<styled text effects>_
╚═════════════════╝

╔═════════════════╗
    🎯 *FUN & SOCIAL*
╠─────────────────╣
║ *.compliment* <compliment user>
║ *.insult* <roast a user>
║ *.flirt* <send a flirt>
║ *.roast* <random roast>
║ *.8ball* <magic answer>
║ *.dice* <roll dice>
║ *.coin* <flip coin>
║ *.random* <random number>
║ *.pick* <pick option>
║ *.age* <calculate age>
║ *.riddle* <get riddle>
║ *.ship* <ship two users>
║ *.simp* <simp rating>
║ *.stupid* <stupidity rate>
║ *.character* <anime char>
║ *.wasted* <wasted effect>
║ *.shayari* <romantic poem>
║ *.goodnight* <night message>
║ *.roseday* <rose day msg>
╚══════════════════╝

╔══════════════════╗
    🌐 *ONLINE STATUS*
╠──────────────────╣
║ *.online* <status menu>
║ *.onlineusers* <who's online>
║ *.onlineadmins* <online admins>
║ *.onlinestats* <group stats>
╚══════════════════╝

╔══════════════════╗
    💻 *BOT INFO*
╠──────────────────╣
║ *.github / .git* <source code>
║ *.owner* <contact owner>
║ *.ping* <response speed>
║ *.alive* <bot status>
║ *.chatbot* <toggle AI chat>
╚══════════════════╝

╔══════════════════╗
        *ABOUT US*
╠──────────────────╣
 *MultiDevice WhatsApp Bot ❤️‍🔥*
  Creator: *EmmyHenz*
  📺 t.me/emmyhenztech
  💻 github.com/emmyhenz
 Thanks For Using Our Bot🙏 
╚══════════════════╝`;

    try {
        const imagePath = path.join(__dirname, '../assets/menu_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid:   '120363410694173688@newsletter',
                        newsletterName: '❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.5🎊❤️‍🔥',
                        serverMessageId: -1
                    }
                }
            },{ quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid:   '120363410694173688@newsletter',
                        newsletterName: '❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.5🎊❤️‍🔥',
                        serverMessageId: -1
                    } 
                }
            });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

const originalCommand = helpCommand;

module.exports = {
    name: 'help',
    async exec(sock, chatId, msg, args, rawText) {
        if (typeof originalCommand === 'function') {
            return originalCommand(sock, chatId, msg, args, rawText);
        } else if (typeof originalCommand === 'object' && originalCommand !== null) {
            const func = originalCommand.exec || Object.values(originalCommand).find(v => typeof v === 'function');
            if (func) return func(sock, chatId, msg, args, rawText);
        }
    }
};