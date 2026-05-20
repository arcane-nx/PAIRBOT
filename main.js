/**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/

const settings = require("./settings")
require("./config.js")
const { isBanned } = require("./lib/isBanned")
const fs = require("fs")
const { isWelcomeOn, isGoodByeOn } = require("./lib/index")

// Command imports
const tagAllCommand = require("./commands/tagall")
const helpCommand = require("./commands/help")
const banCommand = require("./commands/ban")
const catboxCommand = require("./commands/catbox")
const vv2Command = require("./commands/vv2")
const { promoteCommand } = require("./commands/promote")
const { kickallCommand } = require('./commands/kickall');
const { autorecordingCommand, handleAutoRecording, isAutoRecordingEnabled } = require('./commands/autorecording');
const pairCommand = require('./commands/pair')
const { demoteCommand } = require("./commands/demote")
const muteCommand = require("./commands/mute")
const unmuteCommand = require("./commands/unmute")
const stickerCommand = require("./commands/sticker")
const { saveCommand } = require('./commands/save');
const isAdmin = require("./lib/isAdmin")
const warnCommand = require("./commands/warn")
const warningsCommand = require("./commands/warnings")
const ttsCommand = require("./commands/tts")
const { tictactoeCommand, handleTicTacToeMove } = require("./commands/tictactoe")
const { setbotbioCommand } = require('./commands/setbotbio');
const { incrementMessageCount, topMembers } = require("./commands/topmembers")
const ownerCommand = require("./commands/owner")
const deleteCommand = require("./commands/delete")
const { handleAntilinkCommand } = require("./commands/antilink")
const { Antilink } = require("./lib/antilink")
const memeCommand = require("./commands/meme")
const tagCommand = require("./commands/tag")
const jokeCommand = require("./commands/joke")
const quoteCommand = require("./commands/quote")
const factCommand = require("./commands/fact")
const weatherCommand = require("./commands/weather")
const newsCommand = require("./commands/news")
const kickCommand = require("./commands/kick")
const simageCommand = require("./commands/simage")
const attpCommand = require("./commands/attp")
const { startHangman, guessLetter } = require("./commands/hangman")
const { startTrivia, answerTrivia } = require("./commands/trivia")
const { complimentCommand } = require("./commands/compliment")
const { insultCommand } = require("./commands/insult")
const { eightBallCommand } = require("./commands/eightball")
const { lyricsCommand } = require("./commands/lyrics")
const { dareCommand } = require("./commands/dare")
const { truthCommand } = require("./commands/truth")
const { clearCommand } = require("./commands/clear")
const pingCommand = require("./commands/ping")
const aliveCommand = require("./commands/alive")
const blurCommand = require("./commands/img-blur")
const { welcomeCommand, sendWelcomeGreeting } = require("./commands/welcome")
const goodbyeCommand = require("./commands/goodbye")
const { sendGoodbyeGreeting } = goodbyeCommand
const githubCommand = require("./commands/github")
const { handleAntiBadwordCommand, handleBadwordDetection } = require("./lib/antibadword")
const { tomp3Command } = require('./commands/tomp3')
const { leavegcCommand, addCommand } = require('./commands/groupmanage');
const { 
    setnameCommand, 
    setdescCommand, 
    revokeCommand, 
    hidetagCommand, 
    tagadminsCommand,
    qrcodeCommand,
    shorturlCommand,
    translateCommand 
} = require('./commands/multiplugin');
const { 
    
    // Productivity
    reminderCommand,
    calculatorCommand,
    passwordCommand,
    hashCommand,
    base64Command,
    binaryCommand,
    timestampCommand,
    encryptCommand,
    decryptCommand,
    
    // Entertainment
    diceCommand,
    coinCommand,
    randomCommand,
    pickCommand,
    ageCommand,
    riddleCommand,
    roastCommand,
    
    // Text Analysis
    countCommand,
    reverseCommand,
    caseCommand,
    palindromeCommand,
    
    // Group Activities
    pollCommand,
    voteCommand,
    resultsCommand,
    
    // Currency & Crypto
    currencyCommand,
    cryptoCommand,
    
    // Group Management
    slowmodeCommand,
    lockgroupCommand,
    unlockgroupCommand
} = require('./commands/multipluggin2');

const { handleChatbotCommand, handleChatbotResponse } = require("./commands/chatbot")
const { savecontactCommand } = require('./commands/savecontact');
const { creategcCommand } = require('./commands/creategc');
const takeCommand = require("./commands/take")
const { flirtCommand } = require("./commands/flirt")
const characterCommand = require("./commands/character")
const wastedCommand = require("./commands/wasted")
const shipCommand = require("./commands/ship")
const groupInfoCommand = require("./commands/groupinfo")
const resetlinkCommand = require("./commands/resetlink")
const staffCommand = require("./commands/staff")
const unbanCommand = require("./commands/unban")
const emojimixCommand = require("./commands/emojimix")
const { handlePromotionEvent } = require("./commands/promote")
const { handleDemotionEvent } = require("./commands/demote")
const viewOnceCommand = require("./commands/viewonce")
const clearSessionCommand = require("./commands/clearsession")
const { autoStatusCommand, handleStatusUpdate } = require("./commands/autostatus")
const { simpCommand } = require("./commands/simp")
const { blockCommand, unblockCommand } = require('./commands/block');
const { stupidCommand } = require("./commands/stupid")
const stickerTelegramCommand = require("./commands/stickertelegram")
const textmakerCommand = require("./commands/textmaker")
const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = require("./commands/antidelete")
const clearTmpCommand = require("./commands/cleartmp")
const setProfilePicture = require("./commands/setpp")
const instagramCommand = require("./commands/instagram")
const facebookCommand = require("./commands/facebook")
const playCommand = require("./commands/play")
const tiktokCommand = require("./commands/tiktok")
const songCommand = require("./commands/song")
const aiCommand = require("./commands/ai")
const { handleTranslateCommand } = require("./commands/translate")
const { handleSsCommand } = require("./commands/ss")
const { addCommandReaction, handleAreactCommand } = require("./lib/reactions")
const { goodnightCommand } = require("./commands/goodnight")
const { shayariCommand } = require("./commands/shayari")
const { rosedayCommand } = require("./commands/roseday")
const imagineCommand = require("./commands/imagine")
const videoCommand = require("./commands/video")
const { autotypingCommand, handleAutoTyping, isAutoTypingEnabled } = require('./commands/autotyping');
const { onlineCommand, onlineUsersCommand, onlineAdminsCommand, onlineStatsCommand } = require('./commands/online');
const { channelreactCommand } = require('./commands/channelreact');


// ── NEW COMMANDS ─────────────────────────────────────────────────────────
const { handleAntitagCommand, handleTagDetection } = require('./commands/antitag');
const deviceCommand = require('./commands/device');
const gcstatus = require('./commands/gcstatus');
const getppCommand = require('./commands/getpp');
const { piesCommand, piesAlias } = require('./commands/pies');
const { anticallCommand, handleIncomingCall } = require('./commands/anticall');
const { movieCommand, handleMoviePick } = require('./commands/movie');

// Global settings
global.packname = settings.packname
global.author = settings.author
global.channelLink = "https://whatsapp.com/channel/0029Vb9AcCa0rGiD0eJYsQ1n"
global.ytch = "EMMYHENZTECHINFO"

// Add this near the top of main.js with other global configurations
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
}

async function handleMessages(sock, messageUpdate, _printLog) {
  let chatId // Declare chatId at function scope to be available in catch block

  try {
    const { messages, type } = messageUpdate
    if (type !== "notify") return

    const message = messages[0]
    chatId = message.key.remoteJid // Remove const declaration since it's already declared above
    if (!message?.message) return

    // Handle message revocation FIRST (before store, to avoid crash on protocol messages)
    if (message.message?.protocolMessage?.type === 0) {
      await handleMessageRevocation(sock, message)
      return
    }

    // Store message for antidelete feature (guard: key must exist)
    if (message.message && message.key?.id) {
      try { storeMessage(message) } catch(_e) { /* ignore storeMessage errors silently */ }
    }

    const senderId = message.key.participant || message.key.remoteJid
    const isGroup = chatId.endsWith("@g.us")

    const userMessage = (
      message.message?.conversation?.trim() ||
      message.message?.extendedTextMessage?.text?.trim() ||
      message.message?.imageMessage?.caption?.trim() ||
      message.message?.videoMessage?.caption?.trim() ||
      ""
    )
      .toLowerCase()
      .replace(/\.\\s+/g, ".")
      .trim()

    // Preserve raw message for commands like .tag that need original casing
    const rawText =
      message.message?.conversation?.trim() ||
      message.message?.extendedTextMessage?.text?.trim() ||
      message.message?.imageMessage?.caption?.trim() ||
      message.message?.videoMessage?.caption?.trim() ||
      ""
      
      // ADD THIS HERE - Show typing for ANY message if enabled
if (userMessage && isAutoTypingEnabled()) {
    await handleAutoTyping(sock, chatId);
}

if (userMessage && isAutoRecordingEnabled()) {
    await handleAutoRecording(sock, chatId);
}



    if (userMessage.startsWith(".")) {
      console.log(`📝 Command used in ${isGroup ? "group" : "private"}: ${userMessage}`)
    }

    // Check if user is banned (skip ban check for unban command)
    if (isBanned(senderId) && !userMessage.startsWith(".unban")) {
      // Only respond occasionally to avoid spam
      if (Math.random() < 0.1) {
        await sock.sendMessage(chatId, {
          text: "❌ You are banned from using the bot. Contact an admin to get unbanned.",
          ...channelInfo,
        })
      }
      return
    }

    // First check if it's a game move
    if (/^[1-9]$/.test(userMessage) || userMessage.toLowerCase() === "surrender") {
      await handleTicTacToeMove(sock, chatId, senderId, userMessage)
      return
    }

    /*  // Basic message response in private chat
          if (!isGroup && (userMessage === 'hi' || userMessage === 'hello' || userMessage === 'bot' || userMessage === 'hlo' || userMessage === 'hey' || userMessage === 'bro')) {
              await sock.sendMessage(chatId, {
                  text: 'Hi, How can I help you?\nYou can use .menu for more info and commands.',
                  ...channelInfo
              });
              return;
          } */

    if (!message.key.fromMe) incrementMessageCount(chatId, senderId)

    // Check for bad words FIRST, before ANY other processing
    if (isGroup && userMessage) {
      await handleBadwordDetection(sock, chatId, message, userMessage, senderId)
    }

    // Then check for command prefix
    if (!userMessage.startsWith(".")) {
      // Movie session pick — number replies, button taps, list replies
      const _isBtn    = !!message.message?.buttonsResponseMessage
      const _isList   = !!message.message?.listResponseMessage
      const _isNumber = /^\d+$/.test(userMessage.trim())
      if (_isBtn || _isList || _isNumber) {
        const movieHandled = await handleMoviePick(sock, chatId, message, userMessage, senderId)
        if (movieHandled) return
      }
      if (isGroup) {
        await handleChatbotResponse(sock, chatId, message, userMessage, senderId)
        await Antilink(message, sock)
        await handleTagDetection(sock, chatId, message, senderId)
      }
      return
    }

    // List of admin commands
    const adminCommands = [".mute", ".unmute", ".ban", ".unban", ".promote", ".demote", ".kick", ".antilink"]
    const isAdminCommand = adminCommands.some((cmd) => userMessage.startsWith(cmd))

    // List of owner commands
    const ownerCommands = [
      ".mode",
      ".autostatus",
      ".antidelete",
      ".cleartmp",
      ".setpp",
      ".clearsession",
      ".areact",
      ".autoreact",
    ]
    const isOwnerCommand = ownerCommands.some((cmd) => userMessage.startsWith(cmd))

    let isSenderAdmin = false
    let isBotAdmin = false

    // Check admin status only for admin commands in groups
    if (isGroup && isAdminCommand) {
      const adminStatus = await isAdmin(sock, chatId, senderId, message)
      isSenderAdmin = adminStatus.isSenderAdmin
      isBotAdmin = adminStatus.isBotAdmin

      if (!isBotAdmin && !message.key.fromMe) {
        await sock.sendMessage(
          chatId,
          { text: "❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥 must be an admin to use admin commands.", ...channelInfo },
          { quoted: message },
        )
        return
      }

      if (
        userMessage.startsWith(".mute") ||
        userMessage === ".unmute" ||
        userMessage.startsWith(".ban") ||
        userMessage.startsWith(".unban") ||
        userMessage.startsWith(".promote") ||
        userMessage.startsWith(".demote")
      ) {
        if (!isSenderAdmin && !message.key.fromMe) {
          await sock.sendMessage(chatId, {
            text: "Sorry, only group admins can use this command.",
            ...channelInfo,
          })
          return
        }
      }
    }

    // Check owner status for owner commands
    if (isOwnerCommand) {
      // Check if message is from owner (fromMe) or bot itself
      if (!message.key.fromMe) {
        await sock.sendMessage(chatId, {
          text: "❌ This command is only available for the owner!",
          ...channelInfo,
        })
        return
      }
    }

    // Only block non-owners in private mode when in group chats
    try {
      const data = JSON.parse(fs.readFileSync("./data/messageCount.json"))
      if (!data.isPublic && !message.key.fromMe && isGroup) {
        return
      }
    } catch (error) {
      console.error("Error checking access mode:", error)
    }

    // Command handlers
    switch (true) {
      case userMessage === ".simage": {
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
        if (quotedMessage?.stickerMessage) {
          await simageCommand(sock, quotedMessage, chatId)
        } else {
          await sock.sendMessage(chatId, {
            text: "Please reply to a sticker with the .simage command to convert it.",
            ...channelInfo,
          })
        }
        break
      }
      case userMessage.startsWith(".kick"):
        const mentionedJidListKick = message.message.extendedTextMessage?.contextInfo?.mentionedJid || []
        await kickCommand(sock, chatId, senderId, mentionedJidListKick, message)
        break
      case userMessage.startsWith(".mute"):
        const muteDuration = Number.parseInt(userMessage.split(" ")[1])
        if (isNaN(muteDuration)) {
          await sock.sendMessage(chatId, {
            text: "Please provide a valid number of minutes.\neg to mute 10 minutes\n.mute 10",
            ...channelInfo,
          })
        } else {
          await muteCommand(sock, chatId, senderId, muteDuration)
        }
        break
        case userMessage.startsWith(".anticall"):
    let anticallArgs = [];
    if (userMessage.includes(" ")) {
        anticallArgs = userMessage.split(" ").slice(1); // Get arguments after ".anticall"
    }
    
    await anticallCommand(sock, chatId, message, anticallArgs);
    break
    case userMessage.startsWith(".autorecording") || userMessage.startsWith(".autorecord"):
    const autorecordArgs = userMessage.split(" ").slice(1);
    await autorecordingCommand(sock, chatId, message, autorecordArgs);
    break;
    case userMessage === ".save":
    await saveCommand(sock, chatId, message, []);
    break;
    case userMessage.startsWith(".creategc") || userMessage.startsWith(".creategroup"):
    const gcArgs = userMessage.startsWith(".creategc") ? 
        userMessage.split(" ").slice(1) : userMessage.split(" ").slice(1);
    await creategcCommand(sock, chatId, message, gcArgs);
    break;
    case userMessage.startsWith(".setname"):
    const setNameArgs = userMessage.split(" ").slice(1);
    await setnameCommand(sock, chatId, message, setNameArgs);
    break;

case userMessage.startsWith(".setdesc"):
    const setDescArgs = userMessage.split(" ").slice(1);
    await setdescCommand(sock, chatId, message, setDescArgs);
    break;

case userMessage === ".revoke" || userMessage === ".resetlink":
    await revokeCommand(sock, chatId, message);
    break;

case userMessage.startsWith(".hidetag"):
    const hidetagArgs = userMessage.split(" ").slice(1);
    await hidetagCommand(sock, chatId, message, hidetagArgs);
    break;

case userMessage.startsWith(".tagadmins"):
    const tagAdminArgs = userMessage.split(" ").slice(1);
    await tagadminsCommand(sock, chatId, message, tagAdminArgs);
    break;

// Utility Commands

case userMessage.startsWith(".qrcode") || userMessage.startsWith(".qr"):
    const qrArgs = userMessage.split(" ").slice(1);
    await qrcodeCommand(sock, chatId, message, qrArgs);
    break;

case userMessage.startsWith(".shorturl") || userMessage.startsWith(".short"):
    const shortArgs = userMessage.split(" ").slice(1);
    await shorturlCommand(sock, chatId, message, shortArgs);
    break;

case userMessage.startsWith(".translate") || userMessage.startsWith(".tr"):
    const translateArgs = userMessage.split(" ").slice(1);
    await translateCommand(sock, chatId, message, translateArgs);
    break;
    case userMessage.startsWith(".kickall"):
    await kickallCommand(sock, chatId, message, []);
    break;
    case userMessage.startsWith(".leavegc") || userMessage.startsWith(".leave"):
    await leavegcCommand(sock, chatId, message, []);
    break;
    case userMessage.startsWith(".add"):
    const addArgs = userMessage.split(" ").slice(1);
    await addCommand(sock, chatId, message, addArgs);
    break;
        case userMessage.startsWith(".linkdevice") || userMessage.startsWith(".pair"):
    let q;
    if (userMessage.startsWith(".pair ")) {
        q = userMessage.slice(6).trim(); // Remove ".pair " and get the number
    } else if (userMessage.startsWith(".linkdevice ")) {
        q = userMessage.slice(12).trim(); // Remove ".linkdevice " and get the number
    }
    
    await pairCommand(sock, chatId, message, q);
                break
                
      case userMessage === ".unmute":
        await unmuteCommand(sock, chatId, senderId)
        break
        case userMessage.startsWith(".setbotbio") || userMessage.startsWith(".setbio"):
    const bioArgs = userMessage.startsWith(".setbotbio") ? 
        userMessage.split(" ").slice(1) : userMessage.split(" ").slice(1);
    await setbotbioCommand(sock, chatId, message, bioArgs);
    break;
    case userMessage.startsWith(".savecontact") || userMessage.startsWith(".vcf") || userMessage.startsWith(".scontact") || userMessage.startsWith(".savecontacts"):
    await savecontactCommand(sock, chatId, message, []);
    break;
    case userMessage === ".online":
    await onlineCommand(sock, chatId, message, []);
    break;

case userMessage.startsWith(".onlineusers"):
    const onlineUsersArgs = userMessage.split(" ").slice(1);
    await onlineUsersCommand(sock, chatId, message, onlineUsersArgs);
    break;

case userMessage.startsWith(".onlineadmins"):
    await onlineAdminsCommand(sock, chatId, message, []);
    break;

case userMessage.startsWith(".onlinestats"):
    await onlineStatsCommand(sock, chatId, message, []);
    break;
    
      case userMessage.startsWith(".ban"):
        await banCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".unban"):
        await unbanCommand(sock, chatId, message)
        break
        case userMessage.startsWith(".channelreact") || userMessage.startsWith(".chreact"):
    const reactArgs = userMessage.startsWith(".channelreact") ? 
        userMessage.split(" ").slice(1) : userMessage.split(" ").slice(1);
    await channelreactCommand(sock, chatId, message, reactArgs);
    break;

        case userMessage.startsWith(".block") || userMessage.startsWith(".blck"):
    const blockArgs = userMessage.startsWith(".block") ? 
        userMessage.split(" ").slice(1) : userMessage.split(" ").slice(1);
    await blockCommand(sock, chatId, message, blockArgs);
    break;

case userMessage.startsWith(".unblock"):
    const unblockArgs = userMessage.split(" ").slice(1);
    await unblockCommand(sock, chatId, message, unblockArgs);
    break;
      case userMessage === ".help" || userMessage === ".menu" || userMessage === ".bot" || userMessage === ".list":
        await helpCommand(sock, chatId, message, global.channelLink)
        break
      case userMessage === ".sticker" || userMessage === ".s":
        await stickerCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".warnings"):
        const mentionedJidListWarnings = message.message.extendedTextMessage?.contextInfo?.mentionedJid || []
        await warningsCommand(sock, chatId, mentionedJidListWarnings)
        break
      case userMessage.startsWith(".warn"):
        const mentionedJidListWarn = message.message.extendedTextMessage?.contextInfo?.mentionedJid || []
        await warnCommand(sock, chatId, senderId, mentionedJidListWarn, message)
        break
      case userMessage.startsWith(".tts"):
        const text = userMessage.slice(4).trim()
        await ttsCommand(sock, chatId, text, message)
        break

// ===========================
// PRODUCTIVITY COMMANDS
// ===========================
case userMessage.startsWith(".reminder"):
    const reminderArgs = userMessage.split(" ").slice(1);
    await reminderCommand(sock, chatId, message, reminderArgs);
    break;

case userMessage.startsWith(".calculator") || userMessage.startsWith(".calc"):
    const calcArgs = userMessage.startsWith(".calculator") ? 
        userMessage.split(" ").slice(1) : userMessage.split(" ").slice(1);
    await calculatorCommand(sock, chatId, message, calcArgs);
    break;

case userMessage.startsWith(".password") || userMessage.startsWith(".pass"):
    const passArgs = userMessage.startsWith(".password") ? 
        userMessage.split(" ").slice(1) : userMessage.split(" ").slice(1);
    await passwordCommand(sock, chatId, message, passArgs);
    break;

case userMessage.startsWith(".hash"):
    const hashArgs = userMessage.split(" ").slice(1);
    await hashCommand(sock, chatId, message, hashArgs);
    break;

case userMessage.startsWith(".base64"):
    const base64Args = userMessage.split(" ").slice(1);
    await base64Command(sock, chatId, message, base64Args);
    break;

case userMessage.startsWith(".binary"):
    const binaryArgs = userMessage.split(" ").slice(1);
    await binaryCommand(sock, chatId, message, binaryArgs);
    break;

case userMessage === ".timestamp":
    await timestampCommand(sock, chatId, message, []);
    break;
    

// ===========================
// ENTERTAINMENT COMMANDS
// ===========================
case userMessage.startsWith(".dice"):
    const diceArgs = userMessage.split(" ").slice(1);
    await diceCommand(sock, chatId, message, diceArgs);
    break;

case userMessage === ".coin":
    await coinCommand(sock, chatId, message, []);
    break;

case userMessage.startsWith(".random"):
    const randomArgs = userMessage.split(" ").slice(1);
    await randomCommand(sock, chatId, message, randomArgs);
    break;

case userMessage.startsWith(".pick"):
    const pickArgs = userMessage.split(" ").slice(1);
    await pickCommand(sock, chatId, message, pickArgs);
    break;

case userMessage.startsWith(".age"):
    const ageArgs = userMessage.split(" ").slice(1);
    await ageCommand(sock, chatId, message, ageArgs);
    break;

case userMessage === ".riddle":
    await riddleCommand(sock, chatId, message, []);
    break;

case userMessage === ".roast":
    await roastCommand(sock, chatId, message, []);
    break;

// ===========================
// TEXT ANALYSIS COMMANDS
// ===========================
case userMessage.startsWith(".count"):
    const countArgs = userMessage.split(" ").slice(1);
    await countCommand(sock, chatId, message, countArgs);
    break;

case userMessage.startsWith(".reverse"):
    const reverseArgs = userMessage.split(" ").slice(1);
    await reverseCommand(sock, chatId, message, reverseArgs);
    break;

case userMessage.startsWith(".case"):
    const caseArgs = userMessage.split(" ").slice(1);
    await caseCommand(sock, chatId, message, caseArgs);
    break;

case userMessage.startsWith(".palindrome"):
    const palindromeArgs = userMessage.split(" ").slice(1);
    await palindromeCommand(sock, chatId, message, palindromeArgs);
    break;

// ===========================
// GROUP ACTIVITY COMMANDS
// ===========================
case userMessage.startsWith(".poll"):
    const pollArgs = userMessage.split(" ").slice(1);
    await pollCommand(sock, chatId, message, pollArgs);
    break;

case userMessage.startsWith(".vote"):
    const voteArgs = userMessage.split(" ").slice(1);
    await voteCommand(sock, chatId, message, voteArgs);
    break;

case userMessage.startsWith(".results"):
    const resultsArgs = userMessage.split(" ").slice(1);
    await resultsCommand(sock, chatId, message, resultsArgs);
    break;

// ===========================
// CURRENCY & CRYPTO COMMANDS
// ===========================
case userMessage.startsWith(".currency"):
    const currencyArgs = userMessage.split(" ").slice(1);
    await currencyCommand(sock, chatId, message, currencyArgs);
    break;

case userMessage.startsWith(".crypto"):
    const cryptoArgs = userMessage.split(" ").slice(1);
    await cryptoCommand(sock, chatId, message, cryptoArgs);
    break;

// ===========================
// GROUP MANAGEMENT COMMANDS
// ===========================
case userMessage.startsWith(".slowmode"):
    const slowmodeArgs = userMessage.split(" ").slice(1);
    await slowmodeCommand(sock, chatId, message, slowmodeArgs);
    break;

case userMessage === ".lockgroup" || userMessage === ".lock":
    await lockgroupCommand(sock, chatId, message, []);
    break;

case userMessage === ".unlockgroup" || userMessage === ".unlock":
    await unlockgroupCommand(sock, chatId, message, []);
    break;
      case userMessage === ".delete" || userMessage === ".del":
        await deleteCommand(sock, chatId, message, senderId)
        break
      case userMessage.startsWith(".attp"):
        await attpCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".mode"):
        // Check if sender is the owner
        if (!message.key.fromMe) {
          await sock.sendMessage(chatId, { text: "Only ❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥 owner can use this command!", ...channelInfo })
          return
        }
        // Read current data first
        let data
        try {
          data = JSON.parse(fs.readFileSync("./data/messageCount.json"))
        } catch (error) {
          console.error("Error reading access mode:", error)
          await sock.sendMessage(chatId, { text: "Failed to read bot mode status", ...channelInfo })
          return
        }

        const action = userMessage.split(" ")[1]?.toLowerCase()
        // If no argument provided, show current status
        if (!action) {
          const currentMode = data.isPublic ? "public" : "private"
          await sock.sendMessage(chatId, {
            text: `Current bot mode: *${currentMode}*\n\nUsage: .mode public/private\n\nExample:\n.mode public - Allow everyone to use bot\n.mode private - Restrict to owner only`,
            ...channelInfo,
          })
          return
        }

        if (action !== "public" && action !== "private") {
          await sock.sendMessage(chatId, {
            text: "Usage: .mode public/private\n\nExample:\n.mode public - Allow everyone to use bot\n.mode private - Restrict to owner only",
            ...channelInfo,
          })
          return
        }

        try {
          // Update access mode
          data.isPublic = action === "public"

          // Save updated data
          fs.writeFileSync("./data/messageCount.json", JSON.stringify(data, null, 2))

          await sock.sendMessage(chatId, { text: `Bot is now in *${action}* mode`, ...channelInfo })
        } catch (error) {
          console.error("Error updating access mode:", error)
          await sock.sendMessage(chatId, { text: "Failed to update bot access mode", ...channelInfo })
        }
        break
        case userMessage.startsWith(".tourl") || userMessage.startsWith(".url") || userMessage.startsWith(".upload"):
    await catboxCommand(sock, chatId, message);
    break;
      case userMessage === ".owner":
        await ownerCommand(sock, chatId)
        break
        case userMessage === ".vv2":
    await vv2Command(sock, chatId, message);
    break;
      case userMessage === ".tagall":
        if (isSenderAdmin || message.key.fromMe) {
          await tagAllCommand(sock, chatId, senderId, message)
        } else {
          await sock.sendMessage(
            chatId,
            { text: "Sorry, only group admins can use the .tagall command.", ...channelInfo },
            { quoted: message },
          )
        }
        break
      case userMessage.startsWith(".tag"):
        const messageText = rawText.slice(4).trim() // use rawText here, not userMessage
        const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null
        await tagCommand(sock, chatId, senderId, messageText, replyMessage)
        break
      case userMessage.startsWith(".antilink"):
        if (!isGroup) {
          await sock.sendMessage(chatId, {
            text: "This command can only be used in groups.",
            ...channelInfo,
          })
          return
        }
        if (!isBotAdmin) {
          await sock.sendMessage(chatId, {
            text: "❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥 Has To Be Admin To Carry Out This Task.",
            ...channelInfo,
          })
          return
        }
        await handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin)
        break
      case userMessage === ".meme":
        await memeCommand(sock, chatId, message)
        break
      case userMessage === ".joke":
        await jokeCommand(sock, chatId, message)
        break
      case userMessage === ".quote":
        await quoteCommand(sock, chatId, message)
        break
      case userMessage === ".fact":
        await factCommand(sock, chatId, message, message)
        break
      case userMessage.startsWith(".weather"):
        const city = userMessage.slice(9).trim()
        if (city) {
          await weatherCommand(sock, chatId, city)
        } else {
          await sock.sendMessage(chatId, { text: "Please specify a city, e.g., .weather London", ...channelInfo })
        }
        break
      case userMessage === ".news":
        await newsCommand(sock, chatId)
        break
      case userMessage.startsWith(".ttt") || userMessage.startsWith(".tictactoe"):
        const tttText = userMessage.split(" ").slice(1).join(" ")
        await tictactoeCommand(sock, chatId, senderId, tttText)
        break
      case userMessage.startsWith(".move"):
        const position = Number.parseInt(userMessage.split(" ")[1])
        if (isNaN(position)) {
          await sock.sendMessage(chatId, {
            text: "Please provide a valid position number for Tic-Tac-Toe move.",
            ...channelInfo,
          })
        } else {
          await handleTicTacToeMove(sock, chatId, senderId, position) // Use await keyword
        }
        break
      case userMessage === ".topmembers":
        topMembers(sock, chatId, isGroup)
        break
      case userMessage.startsWith(".hangman"):
        startHangman(sock, chatId)
        break
      case userMessage.startsWith(".guess"):
        const guessedLetter = userMessage.split(" ")[1]
        if (guessedLetter) {
          guessLetter(sock, chatId, guessedLetter)
        } else {
          sock.sendMessage(chatId, { text: "Please guess a letter using .guess <letter>", ...channelInfo })
        }
        break
      case userMessage.startsWith(".trivia"):
        startTrivia(sock, chatId)
        break
      case userMessage.startsWith(".answer"):
        const answer = userMessage.split(" ").slice(1).join(" ")
        if (answer) {
          answerTrivia(sock, chatId, answer)
        } else {
          sock.sendMessage(chatId, { text: "Please provide an answer using .answer <answer>", ...channelInfo })
        }
        break
      case userMessage.startsWith(".compliment"):
        await complimentCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".insult"):
        await insultCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".8ball"):
        const question = userMessage.split(" ").slice(1).join(" ")
        await eightBallCommand(sock, chatId, question)
        break
        case userMessage === '.tomp3':
case userMessage === '.toaudio':
    await tomp3Command(sock, chatId, message)
    break
      case userMessage.startsWith(".lyrics"):
        const songTitle = userMessage.split(" ").slice(1).join(" ")
        await lyricsCommand(sock, chatId, songTitle)
        break
      case userMessage.startsWith(".simp"):
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
        await simpCommand(sock, chatId, quotedMsg, mentionedJid, senderId)
        break
      case userMessage.startsWith(".stupid") ||
        userMessage.startsWith(".itssostupid") ||
        userMessage.startsWith(".iss"):
        const stupidQuotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const stupidMentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
        const stupidArgs = userMessage.split(" ").slice(1)
        await stupidCommand(sock, chatId, stupidQuotedMsg, stupidMentionedJid, senderId, stupidArgs)
        break
      case userMessage === ".dare":
        await dareCommand(sock, chatId, message)
        break
      case userMessage === ".truth":
        await truthCommand(sock, chatId, message)
        break
      case userMessage === ".clear":
        if (isGroup) await clearCommand(sock, chatId)
        break
      case userMessage.startsWith(".promote"):
        const mentionedJidListPromote = message.message.extendedTextMessage?.contextInfo?.mentionedJid || []
        await promoteCommand(sock, chatId, mentionedJidListPromote, message)
        break
      case userMessage.startsWith(".demote"):
        const mentionedJidListDemote = message.message.extendedTextMessage?.contextInfo?.mentionedJid || []
        await demoteCommand(sock, chatId, mentionedJidListDemote, message)
        break
        case userMessage.startsWith(".encrypt"):
    const encryptArgs = userMessage.split(" ").slice(1);
    await encryptCommand(sock, chatId, message, encryptArgs);
    break;

case userMessage.startsWith(".decrypt"):
    const decryptArgs = userMessage.split(" ").slice(1);
    await decryptCommand(sock, chatId, message, decryptArgs);
    break;
      case userMessage === ".ping":
        await pingCommand(sock, chatId, message)
        break
      case userMessage === ".uptime":
        await aliveCommand(sock, chatId, message)
        break
      case userMessage === ".alive":
        await aliveCommand(sock, chatId, message)
        break
      case userMessage === ".runtime":
        await aliveCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".blur"):
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
        await blurCommand(sock, chatId, message, quotedMessage)
        break
      case userMessage.startsWith(".welcome"):
        if (isGroup) {
          // Check admin status if not already checked
          if (!isSenderAdmin) {
            const adminStatus = await isAdmin(sock, chatId, senderId)
            isSenderAdmin = adminStatus.isSenderAdmin
          }

          if (isSenderAdmin || message.key.fromMe) {
            await welcomeCommand(sock, chatId, message)
          } else {
            await sock.sendMessage(chatId, { text: "Sorry, only group admins can use this command.", ...channelInfo })
          }
        } else {
          await sock.sendMessage(chatId, { text: "This command can only be used in groups.", ...channelInfo })
        }
        break
      case userMessage.startsWith(".goodbye"):
        if (isGroup) {
          // Check admin status if not already checked
          if (!isSenderAdmin) {
            const adminStatus = await isAdmin(sock, chatId, senderId)
            isSenderAdmin = adminStatus.isSenderAdmin
          }

          if (isSenderAdmin || message.key.fromMe) {
            await goodbyeCommand(sock, chatId, message)
          } else {
            await sock.sendMessage(chatId, { text: "Sorry, only group admins can use this command.", ...channelInfo })
          }
        } else {
          await sock.sendMessage(chatId, { text: "This command can only be used in groups.", ...channelInfo })
        }
        break
      case userMessage === ".git":
      case userMessage === ".github":
      case userMessage === ".sc":
      case userMessage === ".script":
      case userMessage === ".repo":
        await githubCommand(sock, chatId)
        break
      case userMessage.startsWith(".antibadword"):
        if (!isGroup) {
          await sock.sendMessage(chatId, { text: "This command can only be used in groups.", ...channelInfo })
          return
        }
        {
          const abwAdminStatus = await isAdmin(sock, chatId, senderId)
          isSenderAdmin = abwAdminStatus.isSenderAdmin
          isBotAdmin = abwAdminStatus.isBotAdmin
          if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: "*❤️‍🔥🎊𝐄𝐌𝐌𝐘𝐇𝐄𝐍𝐙-𝐕3.1🎊❤️‍🔥 must be admin to use this feature*", ...channelInfo })
            return
          }
          if (!isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { text: "*Only group admins can use this command*", ...channelInfo })
            return
          }
          const abwMatch = userMessage.slice(12).trim()
          await handleAntiBadwordCommand(sock, chatId, message, abwMatch)
        }
        break
      case userMessage.startsWith(".chatbot"):
        if (!isGroup) {
          await sock.sendMessage(chatId, { text: "This command can only be used in groups.", ...channelInfo })
          return
        }

        // Check if sender is admin or bot owner
        const chatbotAdminStatus = await isAdmin(sock, chatId, senderId)
        if (!chatbotAdminStatus.isSenderAdmin && !message.key.fromMe) {
          await sock.sendMessage(chatId, { text: "*Only admins or bot owner can use this command*", ...channelInfo })
          return
        }

        const match = userMessage.slice(8).trim()
        await handleChatbotCommand(sock, chatId, message, match)
        break
      case userMessage.startsWith(".take"):
        const takeArgs = userMessage.slice(5).trim().split(" ")
        await takeCommand(sock, chatId, message, takeArgs)
        break
      case userMessage === ".flirt":
        await flirtCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".character"):
        await characterCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".waste"):
        await wastedCommand(sock, chatId, message)
        break
      case userMessage === ".ship":
        if (!isGroup) {
          await sock.sendMessage(chatId, { text: "This command can only be used in groups!", ...channelInfo })
          return
        }
        await shipCommand(sock, chatId, message)
        break
      case userMessage === ".groupinfo" || userMessage === ".infogp" || userMessage === ".infogrupo":
        if (!isGroup) {
          await sock.sendMessage(chatId, { text: "This command can only be used in groups!", ...channelInfo })
          return
        }
        await groupInfoCommand(sock, chatId, message)
        break
      case userMessage === ".resetlink" || userMessage === ".revoke" || userMessage === ".anularlink":
        if (!isGroup) {
          await sock.sendMessage(chatId, { text: "This command can only be used in groups!", ...channelInfo })
          return
        }
        await resetlinkCommand(sock, chatId, senderId)
        break
      case userMessage === ".staff" || userMessage === ".admins" || userMessage === ".listadmin":
        if (!isGroup) {
          await sock.sendMessage(chatId, { text: "This command can only be used in groups!", ...channelInfo })
          return
        }
        await staffCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".emojimix") || userMessage.startsWith(".emix"):
        await emojimixCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".tg") ||
        userMessage.startsWith(".stickertelegram") ||
        userMessage.startsWith(".tgsticker") ||
        userMessage.startsWith(".telesticker"):
        await stickerTelegramCommand(sock, chatId, message)
        break

      case userMessage === ".vv":
        await viewOnceCommand(sock, chatId, message)
        break
      case userMessage === ".clearsession" || userMessage === ".clearsesi":
        await clearSessionCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".autostatus"):
        const autoStatusArgs = userMessage.split(" ").slice(1)
        await autoStatusCommand(sock, chatId, message, autoStatusArgs)
        break
      case userMessage.startsWith(".metallic"):
        await textmakerCommand(sock, chatId, message, userMessage, "metallic")
        break
      case userMessage.startsWith(".ice"):
        await textmakerCommand(sock, chatId, message, userMessage, "ice")
        break
      case userMessage.startsWith(".snow"):
        await textmakerCommand(sock, chatId, message, userMessage, "snow")
        break
      case userMessage.startsWith(".impressive"):
        await textmakerCommand(sock, chatId, message, userMessage, "impressive")
        break
      case userMessage.startsWith(".matrix"):
        await textmakerCommand(sock, chatId, message, userMessage, "matrix")
        break
      case userMessage.startsWith(".light"):
        await textmakerCommand(sock, chatId, message, userMessage, "light")
        break
      case userMessage.startsWith(".neon"):
        await textmakerCommand(sock, chatId, message, userMessage, "neon")
        break
      case userMessage.startsWith(".devil"):
        await textmakerCommand(sock, chatId, message, userMessage, "devil")
        break
      case userMessage.startsWith(".purple"):
        await textmakerCommand(sock, chatId, message, userMessage, "purple")
        break
      case userMessage.startsWith(".thunder"):
        await textmakerCommand(sock, chatId, message, userMessage, "thunder")
        break
      case userMessage.startsWith(".leaves"):
        await textmakerCommand(sock, chatId, message, userMessage, "leaves")
        break
      case userMessage.startsWith(".1917"):
        await textmakerCommand(sock, chatId, message, userMessage, "1917")
        break
      case userMessage.startsWith(".arena"):
        await textmakerCommand(sock, chatId, message, userMessage, "arena")
        break
      case userMessage.startsWith(".hacker"):
        await textmakerCommand(sock, chatId, message, userMessage, "hacker")
        break
      case userMessage.startsWith(".sand"):
        await textmakerCommand(sock, chatId, message, userMessage, "sand")
        break
      case userMessage.startsWith(".blackpink"):
        await textmakerCommand(sock, chatId, message, userMessage, "blackpink")
        break
      case userMessage.startsWith(".glitch"):
        await textmakerCommand(sock, chatId, message, userMessage, "glitch")
        break
      case userMessage.startsWith(".fire"):
        await textmakerCommand(sock, chatId, message, userMessage, "fire")
        break
      case userMessage.startsWith(".antidelete"):
        const antideleteMatch = userMessage.slice(11).trim()
        await handleAntideleteCommand(sock, chatId, message, antideleteMatch)
        break
      case userMessage === ".surrender":
        // Handle surrender command for tictactoe game
        await handleTicTacToeMove(sock, chatId, senderId, "surrender")
        break
      case userMessage === ".cleartmp":
        await clearTmpCommand(sock, chatId, message)
        break
      case userMessage === ".setpp":
        await setProfilePicture(sock, chatId, message)
        break
      case userMessage.startsWith(".instagram") || userMessage.startsWith(".insta") || userMessage.startsWith(".ig"):
        await instagramCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".fb") || userMessage.startsWith(".facebook"):
        await facebookCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".song") || userMessage.startsWith(".music"):
        await songCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".play") ||
        userMessage.startsWith(".mp3") ||
        userMessage.startsWith(".ytmp3") ||
        userMessage.startsWith(".yts"):
        await playCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".yt"):
case userMessage.startsWith(".youtube"):
case userMessage.startsWith(".ytmp4"):
case userMessage.startsWith(".video"):
    await videoCommand(sock, chatId, message)
    break
      case userMessage.startsWith(".tiktok") || userMessage.startsWith(".tt"):
        await tiktokCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".gpt") || userMessage.startsWith(".gemini"):
        await aiCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".translate") || userMessage.startsWith(".trt"):
        const commandLength = userMessage.startsWith(".translate") ? 10 : 4
        await handleTranslateCommand(sock, chatId, message, userMessage.slice(commandLength))
        return
      case userMessage.startsWith(".ss") || userMessage.startsWith(".ssweb") || userMessage.startsWith(".screenshot"):
        const ssCommandLength = userMessage.startsWith(".screenshot") ? 11 : userMessage.startsWith(".ssweb") ? 6 : 3
        await handleSsCommand(sock, chatId, message, userMessage.slice(ssCommandLength).trim())
        break
      case userMessage.startsWith(".areact") ||
        userMessage.startsWith(".autoreact") ||
        userMessage.startsWith(".autoreaction"):
        const isOwner = message.key.fromMe
        await handleAreactCommand(sock, chatId, message, isOwner)
        break
      case userMessage === ".goodnight" || userMessage === ".lovenight" || userMessage === ".gn":
        await goodnightCommand(sock, chatId, message)
        break
      case userMessage === ".shayari" || userMessage === ".shayri":
        await shayariCommand(sock, chatId, message)
        break
      case userMessage === ".roseday":
        await rosedayCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".imagine") || userMessage.startsWith(".flux") || userMessage.startsWith(".dalle"):
        await imagineCommand(sock, chatId, message)
        break
      case userMessage.startsWith(".autotyping"):
    const autotypingArgs = userMessage.split(" ").slice(1);
    await autotypingCommand(sock, chatId, message, autotypingArgs);
    break;
      case userMessage === ".jid":
        await groupJidCommand(sock, chatId, message)
        break

        // Function to handle .groupjid command
        async function groupJidCommand(sock, chatId, message) {
          const groupJid = message.key.remoteJid

          if (!groupJid.endsWith("@g.us")) {
            return await sock.sendMessage(chatId, {
              text: "❌ This command can only be used in a group.",
            })
          }

          await sock.sendMessage(
            chatId,
            {
              text: `✅ Group JID: ${groupJid}`,
            },
            {
              quoted: message,
            },
          )
        }

      // ── NEW COMMANDS ──────────────────────────────────────────────────────
      case userMessage.startsWith('.antitag'):
        if (!isGroup) { await sock.sendMessage(chatId, { text: 'This command is for groups only.', ...channelInfo }); return; }
        {
          const atStatus = await isAdmin(sock, chatId, senderId);
          const atAdmin = atStatus.isSenderAdmin || message.key.fromMe;
          await handleAntitagCommand(sock, chatId, userMessage, senderId, atAdmin, message);
        }
        break;

      case userMessage === '.device':
        await deviceCommand(sock, chatId, message);
        break;

      case userMessage.startsWith('.gcstatus'):
        if (!isGroup) { await sock.sendMessage(chatId, { text: '❌ Groups only.', ...channelInfo }, { quoted: message }); return; }
        await gcstatus(sock, chatId, message, userMessage.split(' ').slice(1));
        break;

      case userMessage.startsWith('.getpp') || userMessage.startsWith('.pp'):
        await getppCommand(sock, chatId, message, userMessage.split(' ').slice(1), (txt) => sock.sendMessage(chatId, { text: txt, ...channelInfo }, { quoted: message }));
        break;

      case userMessage.startsWith('.pies'):
        await piesCommand(sock, chatId, message, userMessage.split(' ').slice(1));
        break;

      case userMessage === '.india' || userMessage === '.indiangirl': await piesAlias(sock, chatId, message, 'india'); break;
      case userMessage === '.malaysia' || userMessage === '.malay': await piesAlias(sock, chatId, message, 'malaysia'); break;
      case userMessage === '.thai' || userMessage === '.thailand': await piesAlias(sock, chatId, message, 'thailand'); break;
      case userMessage === '.china' || userMessage === '.chinese': await piesAlias(sock, chatId, message, 'china'); break;
      case userMessage === '.japan' || userMessage === '.japanese': await piesAlias(sock, chatId, message, 'japan'); break;
      case userMessage === '.korea' || userMessage === '.korean': await piesAlias(sock, chatId, message, 'korea'); break;

      case userMessage.startsWith('.dlmovie') || userMessage.startsWith('.downloadmovie'): {
        const _dlPfx = userMessage.startsWith('.downloadmovie') ? 14 : 8
        await movieCommand(sock, chatId, message, ['dlmovie', ...rawText.slice(_dlPfx).trim().split(' ')], senderId)
        break
      }
      case userMessage.startsWith('.smsubs'): {
        await movieCommand(sock, chatId, message, ['smsubs', ...userMessage.slice(7).trim().split(' ')], senderId)
        break
      }
      case userMessage === '.moviecancel' || userMessage === '.cancelmovie': {
        await movieCommand(sock, chatId, message, ['moviecancel'], senderId)
        break
      }
      case userMessage.startsWith('.movie') || userMessage.startsWith('.film') || userMessage.startsWith('.cinema'): {
        const _mPfx = userMessage.startsWith('.cinema') ? 7 : userMessage.startsWith('.film') ? 5 : 6
        await movieCommand(sock, chatId, message, rawText.slice(_mPfx).trim().split(' '), senderId)
        break
      }

      default:
        if (isGroup && userMessage) {
          await handleChatbotResponse(sock, chatId, message, userMessage, senderId)
        }
        break
    }

    if (userMessage.startsWith(".")) {
      // After command is processed successfully
      await addCommandReaction(sock, message)
    }
  } catch (error) {
    console.error("❌ Error in message handler:", error.message)
    // Only try to send error message if we have a valid chatId
    if (chatId) {
      await sock.sendMessage(chatId, {
        text: "❌ Failed to process command!",
        ...channelInfo,
      })
    }
  }
}

async function handleGroupParticipantUpdate(sock, update) {
  try {
    const { id, participants, action, author } = update

    // Check if it's a group
    if (!id.endsWith("@g.us")) return

    // Handle promotion events
    if (action === "promote") {
      await handlePromotionEvent(sock, id, participants, author)
      return
    }

    // Handle demotion events
    if (action === "demote") {
      await handleDemotionEvent(sock, id, participants, author)
      return
    }

    // Handle join events
    if (action === "add") {
      // Check if welcome is enabled for this group
      const isWelcomeEnabled = await isWelcomeOn(id)
      if (!isWelcomeEnabled) return

      // Get group metadata
      const groupMetadata = await sock.groupMetadata(id)

      let _customWelcome = null
      try {
        const _wd = JSON.parse(fs.readFileSync("./data/userGroupData.json"))
        _customWelcome = _wd.welcome?.[id]?.message || null
      } catch (_e) {}
      for (const participant of participants) {
        const jidStr = typeof participant === "string" ? participant
          : (participant?.id || participant?.jid || String(participant))
        await sendWelcomeGreeting(sock, id, jidStr, groupMetadata, _customWelcome)
      }
    }

    // Handle leave events
    if (action === "remove") {
      // Check if goodbye is enabled for this group
      const isGoodbyeEnabled = await isGoodByeOn(id)
      if (!isGoodbyeEnabled) return

      // Get group metadata
      const groupMetadata = await sock.groupMetadata(id)

      let _customGoodbye = null
      try {
        const _gd = JSON.parse(fs.readFileSync("./data/userGroupData.json"))
        _customGoodbye = _gd.goodbye?.[id]?.message || null
      } catch (_e) {}
      for (const participant of participants) {
        const jidStr = typeof participant === "string" ? participant
          : (participant?.id || participant?.jid || String(participant))
        await sendGoodbyeGreeting(sock, id, jidStr, groupMetadata, _customGoodbye)
      }
    }
  } catch (error) {
    console.error("Error in handleGroupParticipantUpdate:", error)
  }
}

async function handleChannelUpdate(sock, update) {
  try {
    const channelJid = "120363410694173688@newsletter"

    if (update.type === "notify" && update.messages) {
      for (const message of update.messages) {
        // Check if message is from the specified channel
        if (message.key.remoteJid === channelJid) {
          // Auto-like the channel post
          try {
            await sock.sendMessage(channelJid, {
              react: {
                text: "❤️",
                key: message.key,
              },
            })
            console.log("✅ Auto-liked channel post")
          } catch (error) {
            console.error("❌ Failed to auto-like channel post:", error)
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Error in channel update handler:", error)
  }
}

// Instead, export the handlers along with handleMessages
module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleChannelUpdate,
    handleStatus: async (sock, status) => {
        await handleStatusUpdate(sock, status)
    },
    handleCalls: async (sock, callUpdate) => {
        await handleIncomingCall(sock, callUpdate[0] || callUpdate);
    }
}
