/**
 * BOT.JS — Main State Machine Orchestrator (v4)
 *
 * Unified pipeline:
 *   Phase 1 — Profiling       (4 questions, partner-agnostic)
 *   Phase 2 — Matching        (show top corpsec + fintech matches, user confirms)
 *   Phase 3 — Application     (collect company + KYC data)
 *   Phase 4 — Elephants Offer (optional: add global financial account)
 *   Phase 5 — Submit          (save to Supabase, notify admin)
 *
 * PERSONALITY: Smart, friendly CorpSec advisor — not a form.
 * We grab the user's first name from their messaging profile and
 * store it as `user_name` for personalized prompts throughout.
 *
 * NOTE: formation.js is now legacy. The unified flow handles everything
 * through profiling → matching → application → elephants offer → submit.
 */

const { sendText, sendButtons } = require('./services/whatsapp');
const { getOrCreateSession, updateSession, mergeSessionData, resetSession, saveApplication } = require('./services/supabase');
const profiling = require('./flows/profiling');
const application = require('./flows/application');
const elephants = require('./flows/elephants');
const { matchPartners, formatMatchMessage } = require('./knowledge/matcher');
const { ADMIN_PHONE } = require('./config');

// ─────────────────────────────────────────────────────────────
// STATE ROUTING
// ─────────────────────────────────────────────────────────────

const PROFILING_STATES = new Set([
  'WELCOME', 'CONFIRM_START',
  'COLLECT_COUNTRY',
  'COLLECT_ENTITY_PREF', 'COLLECT_BUSINESS_TYPE', 'COLLECT_BANKING_NEED',
  'COLLECT_US_PERSONS',
]);

const MATCHING_STATE = 'SHOW_MATCHES';

const APPLICATION_STATES = new Set([
  'CONFIRM_MATCH',
  'COLLECT_COMPANY_NAME_1', 'COLLECT_COMPANY_NAME_2', 'COLLECT_COMPANY_NAME_3',
  'COLLECT_BUSINESS_PURPOSE', 'COLLECT_EIN',
  'COLLECT_DOB', 'COLLECT_PASSPORT_NUMBER', 'COLLECT_PASSPORT_EXPIRY',
  'COLLECT_RESIDENTIAL_ADDRESS', 'COLLECT_SOURCE_OF_FUNDS',
  'CONFIRM_APPLICATION',
]);

const ELEPHANTS_STATES = new Set([
  'ELEPHANTS_OFFER',
]);

// ─────────────────────────────────────────────────────────────
// SEND PROMPT
// ─────────────────────────────────────────────────────────────

async function sendPrompt(phone, state, data) {
  let message = null;
  let buttons = null;

  if (PROFILING_STATES.has(state)) {
    message = profiling.getPrompt(state, data);
    buttons = profiling.getButtons(state);
  } else if (APPLICATION_STATES.has(state)) {
    message = application.getPrompt(state, data);
    buttons = application.getButtons(state, data);
  } else if (ELEPHANTS_STATES.has(state)) {
    message = elephants.getPrompt(state, data);
    buttons = elephants.getButtons(state);
  }

  if (!message) return;

  if (buttons && buttons.length > 0) {
    await sendButtons(phone, message, buttons);
  } else {
    await sendText(phone, message);
  }
}

// ─────────────────────────────────────────────────────────────
// MATCHING PHASE — compute and display recommendations
// ─────────────────────────────────────────────────────────────

async function handleShowMatches(phone, data) {
  const profile = {
    country: (data.country || '').toLowerCase(),
    entityPreference: data.entity_preference || 'recommend',
    businessType: data.business_type || 'other',
    bankingNeed: data.banking_need || 'all',
    hasUSPersons: data.has_us_persons || false,
    monthlyRevenue: data.monthly_revenue || 'pre-revenue',
  };

  const matchResult = matchPartners(profile);

  await mergeSessionData(phone, {
    match_result: {
      top_corpsec: matchResult.corpsec[0]?.partner.id || null,
      top_fintech: matchResult.fintech[0]?.partner.id || null,
      top_corpsec_2: matchResult.corpsec[1]?.partner.id || null,
      top_fintech_2: matchResult.fintech[1]?.partner.id || null,
    },
  });

  const matchMsg = formatMatchMessage(matchResult, data.user_name);
  await sendButtons(phone, matchMsg, [
    { id: 'confirm_match', title: 'Yes, looks good' },
    { id: 'edit_match', title: 'Adjust preferences' },
  ]);

  await updateSession(phone, { state: 'CONFIRM_MATCH' });
}

// ─────────────────────────────────────────────────────────────
// SUBMISSION
// ─────────────────────────────────────────────────────────────

async function handleSubmitting(phone, data) {
  try {
    await sendText(phone, 'Submitting everything now — one moment...');

    await saveApplication(phone, data);

    // Admin notification
    if (ADMIN_PHONE) {
      const corpsecPartner = data.match_result?.top_corpsec || 'TBD';
      const fintechPartner = data.match_result?.top_fintech || 'TBD';
      const elephantsStatus = data.elephants_opted_in ? 'YES' : 'No';
      const adminMsg =
        `New Companiz Application\n\n` +
        `${phone} | ${data.user_name || 'Unknown'}\n` +
        `${data.country || '—'}\n` +
        `Entity: ${data.entity_preference} | Biz: ${data.business_type}\n` +
        `Corpsec: ${corpsecPartner}\n` +
        `Fintech: ${fintechPartner}\n` +
        `Elephants: ${elephantsStatus}\n` +
        `Check Supabase wa_applications for full details.`;
      await sendText(ADMIN_PHONE, adminMsg).catch(() => {});
    }

    await updateSession(phone, { state: 'COMPLETE' });

    const firstName = data.user_name || 'there';
    const corpsecName = data.match_result?.top_corpsec || 'your formation provider';
    const fintechName = data.match_result?.top_fintech || 'your financial account provider';
    const elephantsNote = data.elephants_opted_in
      ? `\n\n*Elephants* — your global financial account application has been submitted too. Referral code PROPEX applied. Approval usually takes 2–5 business days.`
      : '';

    await sendText(
      phone,
      `Done, ${firstName}!\n\n` +
      `Here's what happens next:\n\n` +
      `*${corpsecName}* — complete your formation directly with our partner via the referral link I sent. ` +
      `Docs are typically ready in 3–10 business days.\n\n` +
      `*${fintechName}* — your financial account match. Check the link above to get started.` +
      `${elephantsNote}\n\n` +
      `I'll keep you posted right here. If anything comes up, just message me — I'm not going anywhere.\n\n` +
      `Welcome to the Companiz family.`
    );
  } catch (err) {
    console.error('[Bot] Submission error:', err.message);
    await sendText(
      phone,
      'Something went wrong on my end during submission. Our team has been notified and will reach out to you directly. Sorry about that.'
    );
  }
}

// ─────────────────────────────────────────────────────────────
// HANDLE EIN SKIP for non-US entities
// ─────────────────────────────────────────────────────────────

function shouldSkipEIN(data) {
  const nonUSEntities = ['singapore', 'uk', 'hong-kong'];
  return nonUSEntities.includes(data.entity_preference);
}

// ─────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────

async function handleMessage({ from: phone, text, name }) {
  // Global reset
  if (['restart', 'reset'].includes(text.toLowerCase().trim())) {
    await resetSession(phone);
    await sendText(phone, 'No problem — let\'s start fresh.');
    const session = await getOrCreateSession(phone, name);
    await mergeSessionData(phone, { user_name: name || 'there' });
    await updateSession(phone, { state: 'COLLECT_COUNTRY' });
    await sendPrompt(phone, 'WELCOME', { user_name: name || 'there' });
    return;
  }

  const session = await getOrCreateSession(phone, name);
  let { state, data } = session;

  // Always make sure we have the user's name from their profile
  if (name && !data.user_name) {
    data = await mergeSessionData(phone, { user_name: name });
  }

  // ── TERMINAL ──────────────────────────────────────────────
  if (state === 'COMPLETE') {
    const firstName = data.user_name || 'there';
    await sendText(
      phone,
      `Hey ${firstName} — your application is already submitted and being processed. ` +
      `If you need anything, just message me here or email hello@companiz.xyz`
    );
    return;
  }

  // ── WELCOME ───────────────────────────────────────────────
  if (state === 'WELCOME') {
    const welcomeMsg = profiling.getPrompt('WELCOME', data);
    const welcomeButtons = profiling.getButtons('WELCOME');
    if (welcomeButtons) {
      await sendButtons(phone, welcomeMsg, welcomeButtons);
    } else {
      await sendText(phone, welcomeMsg);
    }
    await updateSession(phone, { state: 'COLLECT_COUNTRY' });
    return;
  }

  // ── CONFIRM_START (any message → move to first question) ──
  if (state === 'CONFIRM_START') {
    await updateSession(phone, { state: 'COLLECT_COUNTRY' });
    await sendPrompt(phone, 'COLLECT_COUNTRY', data);
    return;
  }

  // ── SHOW_MATCHES (computed, no user input processed here) ──
  if (state === MATCHING_STATE) {
    await handleShowMatches(phone, data);
    return;
  }

  // ── PROCESS INPUT ─────────────────────────────────────────
  let result = null;

  if (PROFILING_STATES.has(state) && profiling.steps[state]) {
    result = profiling.steps[state](text, data);
  } else if (APPLICATION_STATES.has(state) && application.steps[state]) {
    result = application.steps[state](text, data);
  } else if (ELEPHANTS_STATES.has(state) && elephants.steps[state]) {
    result = elephants.steps[state](text, data);
  } else {
    console.warn(`[Bot] Unknown state "${state}" for ${phone}`);
    await sendText(phone, 'Hmm, something got mixed up. Type *restart* and we\'ll go from the top.');
    return;
  }

  if (!result) {
    await sendText(phone, 'Something unexpected happened. Type *restart* to start over.');
    return;
  }

  // Validation error — stay on current state
  if (result.error) {
    await sendText(phone, result.error);
    return;
  }

  // Save new data
  let updatedData = data;
  if (result.save && Object.keys(result.save).length) {
    updatedData = await mergeSessionData(phone, result.save);
  }

  const nextState = result.nextState;
  await updateSession(phone, { state: nextState });

  // ── AUTO-SKIP EIN for non-US entities ─────────────────────
  if (nextState === 'COLLECT_EIN' && shouldSkipEIN(updatedData)) {
    updatedData = await mergeSessionData(phone, { ein_required: false });
    await updateSession(phone, { state: 'COLLECT_DOB' });
    await sendPrompt(phone, 'COLLECT_DOB', updatedData);
    return;
  }

  // ── AUTO-TRIGGER MATCHING when profiling complete ─────────
  if (nextState === MATCHING_STATE) {
    await handleShowMatches(phone, updatedData);
    return;
  }

  // ── AUTO-TRIGGER SUBMISSION ───────────────────────────────
  if (nextState === 'SUBMITTING') {
    await handleSubmitting(phone, updatedData);
    return;
  }

  // ── SEND NEXT PROMPT ──────────────────────────────────────
  await sendPrompt(phone, nextState, updatedData);
}

module.exports = { handleMessage };
