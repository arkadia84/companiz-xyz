/**
 * INDEX.JS — Express Webhook Server
 *
 * Receives WhatsApp Cloud API events from Meta and routes them to the bot.
 *
 * Endpoints:
 *   GET  /webhook  — Meta webhook verification (one-time setup)
 *   POST /webhook  — Incoming WhatsApp messages
 *   GET  /health   — Health check
 */

require('dotenv').config();
const express = require('express');
const { PORT, WA_VERIFY_TOKEN } = require('./config');
const { parseWebhookMessage, markRead, setCollector, clearCollector, setOverride, clearOverride } = require('./services/whatsapp');
const tg = require('./services/telegram');
const { handleMessage } = require('./bot');

const path = require('path');
const app = express();
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'companiz-wa-agent', ts: new Date().toISOString() });
});

// ─────────────────────────────────────────────
// WEBHOOK VERIFICATION (GET)
// Meta sends this once when you register the webhook in the dashboard
// ─────────────────────────────────────────────
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WA_VERIFY_TOKEN) {
    console.log('[Webhook] Verification successful.');
    return res.status(200).send(challenge);
  }

  console.warn('[Webhook] Verification failed — token mismatch.');
  res.sendStatus(403);
});

// ─────────────────────────────────────────────
// INCOMING MESSAGES (POST)
// ─────────────────────────────────────────────
app.post('/webhook', async (req, res) => {
  // Always respond 200 immediately — Meta will retry if it doesn't get a fast ack
  res.sendStatus(200);

  try {
    const parsed = parseWebhookMessage(req.body);
    if (!parsed) return; // Not a message event (could be status update, etc.)

    const { from, messageId, name, text } = parsed;

    console.log(`[Bot] ← ${from} (${name}): "${text}"`);

    // Mark message as read (blue ticks)
    await markRead(messageId);

    // Process message through state machine
    await handleMessage({ from, text, name });
  } catch (err) {
    console.error('[Webhook] Unhandled error:', err.message, err.stack);
  }
});

// ─────────────────────────────────────────────
// TELEGRAM WEBHOOK
// ─────────────────────────────────────────────
app.post('/telegram/webhook', async (req, res) => {
  res.sendStatus(200); // always ack immediately

  try {
    const update = req.body;
    let chatId, text, name;

    if (update.message) {
      chatId = String(update.message.chat.id);
      text   = update.message.text || '';
      name   = update.message.from?.first_name || 'User';
      // Treat /start and /reset as a fresh greeting
      if (text === '/start' || text === '/reset') text = 'hi';
    } else if (update.callback_query) {
      chatId = String(update.callback_query.message.chat.id);
      text   = update.callback_query.data;
      name   = update.callback_query.from?.first_name || 'User';
      await tg.answerCallbackQuery(update.callback_query.id);
    }

    if (!chatId || !text) return;

    console.log(`[TG] ← ${chatId} (${name}): "${text}"`);

    setOverride({
      sendText:    (_, t, b)  => tg.sendText(chatId, t),
      sendButtons: (_, t, b)  => tg.sendButtons(chatId, t, b),
    });

    await handleMessage({ from: 'tg_' + chatId, text, name });
  } catch (err) {
    console.error('[Telegram] Error:', err.message);
  } finally {
    clearOverride();
  }
});

// ─────────────────────────────────────────────
// WEB CHAT — API endpoint
// ─────────────────────────────────────────────
app.post('/webchat/message', async (req, res) => {
  const { phone = 'web_tester', text, name = 'Tester' } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });

  const collector = [];
  setCollector(collector);
  try {
    await handleMessage({ from: phone, text, name });
  } catch (err) {
    console.error('[WebChat] Error:', err.message);
  } finally {
    clearCollector();
  }
  res.json({ messages: collector });
});

// ─────────────────────────────────────────────
// WEB BOT — Branded chat for non-Telegram users
// ─────────────────────────────────────────────
app.get('/bot', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'webbot.html'));
});

// ─────────────────────────────────────────────
// WEB CHAT — Legacy test UI
// ─────────────────────────────────────────────
app.get('/webchat', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Companiz Agent — Test Chat</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f0f2f5;display:flex;flex-direction:column;height:100vh}
  header{background:#075e54;color:#fff;padding:14px 20px;font-size:17px;font-weight:600;display:flex;align-items:center;gap:10px}
  header span.dot{width:10px;height:10px;background:#25d366;border-radius:50%;display:inline-block}
  #chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
  .bubble{max-width:75%;padding:10px 14px;border-radius:12px;line-height:1.5;font-size:14.5px;white-space:pre-wrap;word-break:break-word}
  .bot{background:#fff;border-radius:12px 12px 12px 0;align-self:flex-start;box-shadow:0 1px 2px rgba(0,0,0,.1)}
  .user{background:#dcf8c6;border-radius:12px 12px 0 12px;align-self:flex-end}
  .btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;align-self:flex-start}
  .btn{background:#fff;border:1.5px solid #075e54;color:#075e54;padding:7px 16px;border-radius:20px;cursor:pointer;font-size:13.5px;font-weight:500}
  .btn:hover{background:#075e54;color:#fff}
  .typing{background:#fff;padding:10px 16px;border-radius:12px;align-self:flex-start;box-shadow:0 1px 2px rgba(0,0,0,.1);color:#999;font-style:italic;font-size:13px}
  footer{padding:12px 16px;background:#f0f2f5;border-top:1px solid #ddd;display:flex;gap:10px}
  #input{flex:1;padding:10px 16px;border-radius:24px;border:1px solid #ccc;font-size:14.5px;outline:none}
  #input:focus{border-color:#075e54}
  #send{background:#075e54;color:#fff;border:none;border-radius:50%;width:44px;height:44px;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center}
  #send:hover{background:#128c7e}
  #reset{background:transparent;border:1px solid #ccc;border-radius:20px;padding:6px 14px;cursor:pointer;font-size:12px;color:#666;white-space:nowrap}
  #reset:hover{border-color:#e74c3c;color:#e74c3c}
</style>
</head>
<body>
<header><span class="dot"></span>Companiz Agent <span style="font-weight:300;font-size:13px;margin-left:4px">· Test Mode</span></header>
<div id="chat"></div>
<footer>
  <input id="input" placeholder="Type a message…" autocomplete="off"/>
  <button id="send">➤</button>
  <button id="reset">Reset</button>
</footer>
<script>
const chat = document.getElementById('chat');
const input = document.getElementById('input');
const phone = 'web_' + Math.random().toString(36).slice(2,8);

function addBubble(text, cls) {
  const d = document.createElement('div');
  d.className = 'bubble ' + cls;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
  return d;
}

function addButtons(text, buttons) {
  addBubble(text, 'bot');
  const row = document.createElement('div');
  row.className = 'btns';
  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = b.title;
    btn.onclick = () => send(b.id);
    row.appendChild(btn);
  });
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

function addTyping() {
  const d = document.createElement('div');
  d.className = 'typing';
  d.id = 'typing';
  d.textContent = 'Agent is typing…';
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

async function send(text) {
  const msg = text || input.value.trim();
  if (!msg) return;
  input.value = '';
  addBubble(msg, 'user');
  addTyping();

  try {
    const res = await fetch('/webchat/message', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ phone, text: msg, name: 'Tester' })
    });
    const data = await res.json();
    document.getElementById('typing')?.remove();
    data.messages.forEach(m => {
      if (m.type === 'buttons') addButtons(m.text, m.buttons);
      else addBubble(m.text, 'bot');
    });
    if (!data.messages.length) addBubble('(no response — check server logs)', 'bot');
  } catch(e) {
    document.getElementById('typing')?.remove();
    addBubble('Error: ' + e.message, 'bot');
  }
}

document.getElementById('send').onclick = () => send();
input.addEventListener('keydown', e => { if(e.key==='Enter') send(); });
document.getElementById('reset').onclick = async () => {
  await fetch('/webchat/message', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ phone, text: 'RESET', name: 'Tester' })
  });
  chat.innerHTML = '';
  send('hi');
};

// Auto-start
send('hi');
</script>
</body>
</html>`);
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`✅ Companiz WA Agent running on port ${PORT}`);
  console.log(`   Webhook: https://companiz-wa-agent-production.up.railway.app/webhook`);
  console.log(`   WebChat: https://companiz-wa-agent-production.up.railway.app/webchat`);

  // Auto-register Telegram webhook on startup
  if (process.env.TELEGRAM_BOT_TOKEN) {
    try {
      const result = await tg.setWebhook(
        'https://companiz-wa-agent-production.up.railway.app/telegram/webhook'
      );
      console.log('[TG] Webhook registered:', result.description);
    } catch (e) {
      console.error('[TG] Webhook registration failed:', e.message);
    }
  }
});
