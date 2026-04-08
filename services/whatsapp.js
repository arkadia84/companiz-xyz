const axios = require('axios');
const { WA_TOKEN, WA_PHONE_NUMBER_ID } = require('../config');

const BASE_URL = `https://graph.facebook.com/v19.0/${WA_PHONE_NUMBER_ID}/messages`;

const headers = () => ({
  Authorization: `Bearer ${WA_TOKEN}`,
  'Content-Type': 'application/json',
});

// ── Channel overrides ─────────────────────────────────────────
// _collector: webchat mode — pushes responses into an array
// _override:  other channels (Telegram etc) — custom send fns
let _collector = null;
let _override  = null;
function setCollector(arr) { _collector = arr; }
function clearCollector()  { _collector = null; }
function setOverride(fns)  { _override  = fns; }
function clearOverride()   { _override  = null; }
// ─────────────────────────────────────────────────────────────

/**
 * Send a plain text message to a WhatsApp number.
 * @param {string} to - Recipient phone number (e.g. "6512345678")
 * @param {string} text - Message body
 */
async function sendText(to, text) {
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body: text, preview_url: false },
  };

  if (_override)  return _override.sendText(to, text);
  if (_collector) { _collector.push({ type: 'text', text }); return { ok: true }; }
  try {
    const res = await axios.post(BASE_URL, payload, { headers: headers() });
    return res.data;
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error('[WA] sendText error:', JSON.stringify(detail, null, 2));
    throw err;
  }
}

/**
 * Send a message with quick-reply buttons (max 3 options).
 * @param {string} to
 * @param {string} bodyText - Main message text
 * @param {Array<{id: string, title: string}>} buttons - Max 3
 */
async function sendButtons(to, bodyText, buttons) {
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.map((b) => ({
          type: 'reply',
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  };

  if (_override)  return _override.sendButtons(to, bodyText, buttons);
  if (_collector) { _collector.push({ type: 'buttons', text: bodyText, buttons }); return { ok: true }; }
  try {
    const res = await axios.post(BASE_URL, payload, { headers: headers() });
    return res.data;
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error('[WA] sendButtons error:', JSON.stringify(detail, null, 2));
    // Fallback to plain text if buttons fail
    const fallback =
      bodyText +
      '\n\n' +
      buttons.map((b, i) => `${i + 1}. ${b.title}`).join('\n');
    return sendText(to, fallback);
  }
}

/**
 * Mark an incoming message as read (shows blue ticks).
 * @param {string} messageId
 */
async function markRead(messageId) {
  const payload = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  };
  try {
    await axios.post(BASE_URL, payload, { headers: headers() });
  } catch {
    // Non-critical, swallow error
  }
}

/**
 * Extract message content from a WhatsApp webhook payload.
 * Returns null if not a supported message type.
 */
function parseWebhookMessage(body) {
  try {
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value?.messages?.length) return null;

    const msg = value.messages[0];
    const contact = value.contacts?.[0];
    const from = msg.from; // phone number string
    const messageId = msg.id;
    const name = contact?.profile?.name || from;

    let text = null;

    if (msg.type === 'text') {
      text = msg.text?.body?.trim();
    } else if (msg.type === 'interactive') {
      // Button reply
      text = msg.interactive?.button_reply?.id || msg.interactive?.button_reply?.title;
    }

    if (!text) return null;

    return { from, messageId, name, text };
  } catch (err) {
    console.error('[WA] parseWebhookMessage error:', err.message);
    return null;
  }
}

module.exports = { sendText, sendButtons, markRead, parseWebhookMessage, setCollector, clearCollector, setOverride, clearOverride };
