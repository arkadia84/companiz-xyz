/**
 * FORMATION FLOW (Legacy / Guided Launch)
 *
 * Collects data required for referral-based company formation.
 * Companiz is a referral business — after confirming details, users are
 * sent directly to the appropriate partner to complete their formation.
 *
 * PERSONALITY: Smart, friendly CorpSec advisor. Explains context,
 * gives tips, makes the process feel like a conversation not a form.
 *
 * DROPPED: Legal name and email — collected from platform profile
 * and deferred to the application phase when formally needed.
 *
 * Partners:
 *   US (Wyoming LLC / Delaware C-Corp) → Fileforms
 *   Singapore Pte Ltd                  → Sleek
 *   Hong Kong Limited                  → Osome
 */

function isValidCompanyName(name) {
  return name.length >= 2 && name.length <= 80;
}

// ─────────────────────────────────────────────────────────────
// REFERRAL LINKS
// ─────────────────────────────────────────────────────────────

const REFERRAL_LINKS = {
  us: {
    partner: 'Fileforms',
    url: 'https://register.fileforms.com/partner-file-now-cta-v2/?REFERRALCODE=recM4mmc9COERzwg5',
    details: 'Includes LLC/Corp filing, EIN, registered agent (year 1) — from $399 + state fee, paid directly to Fileforms.',
  },
  singapore: {
    partner: 'Sleek',
    url: 'https://sleek.com/sg/?ref=zmqynme',
    details: 'Singapore Pte Ltd incorporation, company secretary, registered address — from S$699/yr, paid directly to Sleek.',
  },
  'hong-kong': {
    partner: 'Osome',
    url: 'https://osome.com/hk/r/8V3C7H7V',
    details: 'Hong Kong Limited incorporation, company secretary, registered address — from HKD 4,500, paid directly to Osome.',
  },
};

function getReferral(entityPreference) {
  if (['wyoming-llc', 'c-corp'].includes(entityPreference)) return REFERRAL_LINKS.us;
  if (entityPreference === 'singapore') return REFERRAL_LINKS.singapore;
  if (entityPreference === 'hong-kong') return REFERRAL_LINKS['hong-kong'];
  return REFERRAL_LINKS.us; // default fallback
}

// ─────────────────────────────────────────────────────────────
// STEP HANDLERS
// ─────────────────────────────────────────────────────────────

const steps = {

  CONFIRM_START(input) {
    const yes = ['yes', 'y', 'start', 'ok', 'sure', 'let\'s go', 'go', '1', 'confirm_start', 'let\'s do it'];
    if (yes.includes(input.toLowerCase())) {
      return { nextState: 'COLLECT_COUNTRY' };
    }
    return { error: 'Whenever you\'re ready — just say *yes* or *go* and we\'ll get started.' };
  },

  COLLECT_COUNTRY(input) {
    if (input.length < 2) {
      return { error: 'I need to know where you\'re based — just type your country (e.g. France, India, UAE).' };
    }
    return { nextState: 'COLLECT_COMPANY_NAME_1', save: { country: input } };
  },

  COLLECT_COMPANY_NAME_1(input) {
    if (!isValidCompanyName(input)) {
      return { error: 'That name\'s a bit too short — company names need to be at least 2 characters. What did you have in mind?' };
    }
    return { nextState: 'COLLECT_COMPANY_NAME_2', save: { company_name_1: input } };
  },

  COLLECT_COMPANY_NAME_2(input) {
    if (!isValidCompanyName(input)) {
      return { error: 'I need a valid backup name (2–80 characters). What\'s your second choice?' };
    }
    return { nextState: 'COLLECT_COMPANY_NAME_3', save: { company_name_2: input } };
  },

  COLLECT_COMPANY_NAME_3(input) {
    if (!isValidCompanyName(input)) {
      return { error: 'One more valid name and we\'re done with this part (2–80 characters).' };
    }
    return { nextState: 'COLLECT_BUSINESS_PURPOSE', save: { company_name_3: input } };
  },

  COLLECT_BUSINESS_PURPOSE(input) {
    if (input.length < 10) {
      return {
        error: 'Give me a bit more detail — even one sentence is fine.\n\nSomething like: _"Managing and investing in digital assets and real estate."_',
      };
    }
    return { nextState: 'CONFIRM_FORMATION', save: { business_purpose: input } };
  },

  CONFIRM_FORMATION(input) {
    const confirmValues = ['confirm', 'yes', 'y', '1', 'looks_good', 'submit', 'looks good'];
    const editValues = ['edit', 'change', '2', 'restart', 'redo'];
    if (confirmValues.includes(input.toLowerCase())) {
      return { nextState: 'ELEPHANTS_INTRO' };
    }
    if (editValues.includes(input.toLowerCase())) {
      return { nextState: 'COLLECT_COUNTRY', save: {} };
    }
    return { error: 'Just say *confirm* to lock it in, or *edit* if you want to change anything.' };
  },
};

// ─────────────────────────────────────────────────────────────
// MESSAGE BUILDERS
// ─────────────────────────────────────────────────────────────

function getPrompt(state, data = {}) {
  const referral = getReferral(data.entity_preference);
  const firstName = data.user_name || 'there';

  const entityLabel = {
    'wyoming-llc': 'Wyoming LLC',
    'c-corp': 'Delaware C-Corp',
    'singapore': 'Singapore Pte Ltd',
    'hong-kong': 'Hong Kong Limited',
  }[data.entity_preference] || 'your company';

  const prompts = {
    WELCOME:
      `Hey ${firstName}! I'm your Companiz advisor.\n\n` +
      `I'll walk you through picking the right company structure, match you with a vetted formation partner, ` +
      `and send you straight to them to get it done — no middleman, no markup.\n\n` +
      `This takes about 3 minutes. Ready?`,

    CONFIRM_START: `Whenever you\'re ready — just say *yes* or *go*.`,

    COLLECT_COUNTRY:
      `Alright, let\'s get into it.\n\n` +
      `*Where are you currently based?*\n\n` +
      `_Your country of residence determines which formation providers and financial accounts you qualify for — some have restrictions I need to check against._`,

    COLLECT_COMPANY_NAME_1:
      `Now for the fun part — *what do you want to name your company?*\n\n` +
      `Give me your top choice. If it\'s already taken, we\'ll have backups.\n\n` +
      `_Tip: Keep it clean, memorable, and make sure it reflects what you\'re building. Something like "Blue Ridge Ventures" or "Apex Global Holdings"._`,

    COLLECT_COMPANY_NAME_2:
      `Good choice. Now give me a *backup name* in case that one\'s taken.\n\n` +
      `_Registries reject duplicates, so it\'s smart to have options ready._`,

    COLLECT_COMPANY_NAME_3:
      `And one more *backup* — third time\'s the charm.`,

    COLLECT_BUSINESS_PURPOSE:
      `*What will this company actually do?*\n\n` +
      `Just describe it in a sentence or two. This goes into your formation documents.\n\n` +
      `_Example: "Managing and investing in digital assets, real estate, and international business ventures."_\n\n` +
      `_Pro tip: Keep it broad enough to cover future activities — you don\'t want to have to amend this later._`,

    CONFIRM_FORMATION:
      `Here\'s what we\'ve got:\n\n` +
      `${firstName !== 'there' ? `${firstName} · ` : ''}${data.country || '—'}\n` +
      `Entity: *${entityLabel}*\n` +
      `Company names:\n` +
      `  1. ${data.company_name_1 || '—'}\n` +
      `  2. ${data.company_name_2 || '—'}\n` +
      `  3. ${data.company_name_3 || '—'}\n` +
      `Purpose: ${data.business_purpose || '—'}\n\n` +
      `Your formation partner is *${referral.partner}*:\n` +
      `${referral.url}\n\n` +
      `${referral.details}\n\n` +
      `Everything look right? Say *confirm* to lock it in, or *edit* to change something.`,
  };

  return prompts[state] || null;
}

function getButtons(state) {
  const buttons = {
    WELCOME: [{ id: 'confirm_start', title: "Let's go" }],
    CONFIRM_FORMATION: [
      { id: 'looks_good', title: 'Confirm' },
      { id: 'edit', title: 'Edit' },
    ],
  };
  return buttons[state] || null;
}

module.exports = { steps, getPrompt, getButtons };
