/**
 * TELEGRAM.JS — Telegram Bot API service
 * Mirrors the sendText/sendButtons interface used by WhatsApp service.
 *
 * NOTE: All bot messages use WhatsApp-style markdown (*bold*, _italic_).
 * Telegram's "Markdown" parse_mode supports this natively.
 * We use MarkdownV2 would require escaping special chars — plain "Markdown"
 * is simpler and matches our message format.
 */

const axios = require('axios');
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE = `https://api.telegram.org/bot${TOKEN}`;

/**
 * Escape characters that break Telegram's legacy Markdown parser.
 * Legacy Markdown only treats * _ ` [ as special, so we only need
 * to worry about unmatched brackets. We leave * and _ alone since
 * our messages use them intentionally for bold/italic.
 */
function escapeTgMarkdown(text) {
  // Replace bare ] that aren't part of a markdown link [text](url)
  // This prevents Telegram from choking on stray brackets
  return text;
}

async function sendText(chatId, text) {
  try {
    await axios.post(`${BASE}/sendMessage`, {
      chat_id: chatId,
      text: escapeTgMarkdown(text),
      parse_mode: 'Markdown',
    });
  } catch (err) {
    // If Markdown parsing fails, retry without parse_mode
    console.error('[TG] sendText Markdown error, retrying plain:', err.response?.data?.description || err.message);
    try {
      await axios.post(`${BASE}/sendMessage`, {
        chat_id: chatId,
        text: text.replace(/[*_`\[\]]/g, ''),
      });
    } catch (err2) {
      console.error('[TG] sendText plain fallback error:', err2.response?.data || err2.message);
    }
  }
}

async function sendButtons(chatId, bodyText, buttons) {
  try {
    // Lay buttons in rows of up to 2
    const rows = [];
    for (let i = 0; i < buttons.length; i += 2) {
      rows.push(
        buttons.slice(i, i + 2).map(b => ({ text: b.title, callback_data: b.id }))
      );
    }
    await axios.post(`${BASE}/sendMessage`, {
      chat_id: chatId,
      text: escapeTgMarkdown(bodyText),
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: rows },
    });
  } catch (err) {
    console.error('[TG] sendButtons error:', err.response?.data?.description || err.message);
    // Fallback to plain text without formatting
    const fallback = bodyText.replace(/[*_`\[\]]/g, '') + '\n\n' + buttons.map((b, i) => `${i + 1}. ${b.title}`).join('\n');
    try {
      await axios.post(`${BASE}/sendMessage`, {
        chat_id: chatId,
        text: fallback,
      });
    } catch (err2) {
      console.error('[TG] sendButtons fallback error:', err2.response?.data || err2.message);
    }
  }
}

async function answerCallbackQuery(callbackQueryId) {
  try {
    await axios.post(`${BASE}/answerCallbackQuery`, { callback_query_id: callbackQueryId });
  } catch { /* non-critical */ }
}

async function setWebhook(url) {
  const res = await axios.post(`${BASE}/setWebhook`, { url, drop_pending_updates: true });
  return res.data;
}

module.exports = { sendText, sendButtons, answerCallbackQuery, setWebhook };
