const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} = require("@whiskeysockets/baileys");
const P = require("pino");
const path = require("path");
const fs = require("fs");

async function connectToWhatsApp(onMessage, onConnectionUpdate, onCredsUpdate) {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, "../../database/session"));
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: P({ level: "silent" }),
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: "silent" })),
        },
        browser: ["EMMYHENZ-V3.1", "Safari", "3.0"],
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("connection closed due to ", lastDisconnect.error, ", reconnecting ", shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp(onMessage, onConnectionUpdate, onCredsUpdate);
            }
        } else if (connection === "open") {
            console.log("opened connection");
        }
        if (onConnectionUpdate) onConnectionUpdate(update);
    });

    sock.ev.on("creds.update", async () => {
        await saveCreds();
        if (onCredsUpdate) onCredsUpdate();
    });

    sock.ev.on("messages.upsert", async (messageUpdate) => {
        if (onMessage) await onMessage(sock, messageUpdate);
    });

    return sock;
}

module.exports = { connectToWhatsApp };
