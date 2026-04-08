/**
 * APPLICATION FLOW
 *
 * Phase 3 — Collects all data needed to submit to matched partners.
 * Questions adapt based on whether the entity is US vs. non-US.
 *
 * PERSONALITY: Smart, friendly CorpSec advisor. Each question comes
 * with context about *why* it's needed. Error messages are helpful
 * and human, not robotic warning signs.
 *
 * Universal data collected:
 *   - Company name (3 options)
 *   - Business purpose
 *   - EIN needed? (US entities only)
 *   - Date of birth
 *   - Passport number + expiry
 *   - Residential address
 *   - Source of funds
 */

function isValidDate(input) {
  const match = input.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (!match) return false;
  const [, d, m, y] = match;
  const date = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
  return !isNaN(date.getTime());
}

function isValidPassport(input) {
  return /^[A-Z0-9]{5,15}$/i.test(input.replace(/\s/g, ''));
}

// ─────────────────────────────────────────────────────────────
// STEP HANDLERS
// ─────────────────────────────────────────────────────────────

const steps = {

  CONFIRM_MATCH(input) {
    const yes = ['yes', 'y', '1', 'confirm_match', 'correct', 'looks good', 'perfect', 'great'];
    const no = ['no', 'n', '2', 'change', 'adjust', 'edit_match'];
    if (yes.includes(input.toLowerCase())) {
      return { nextState: 'COLLECT_COMPANY_NAME_1' };
    }
    if (no.includes(input.toLowerCase())) {
      return { nextState: 'COLLECT_ENTITY_PREF' }; // back to profiling
    }
    return { error: 'Say *yes* if this match looks good, or *no* if you want to tweak your preferences.' };
  },

  COLLECT_COMPANY_NAME_1(input) {
    if (input.length < 2 || input.length > 80) {
      return { error: 'Company names need to be between 2 and 80 characters. What\'s your top choice?' };
    }
    return { nextState: 'COLLECT_COMPANY_NAME_2', save: { company_name_1: input } };
  },

  COLLECT_COMPANY_NAME_2(input) {
    if (input.length < 2 || input.length > 80) {
      return { error: 'I need a valid backup name (2–80 characters). What else were you considering?' };
    }
    return { nextState: 'COLLECT_COMPANY_NAME_3', save: { company_name_2: input } };
  },

  COLLECT_COMPANY_NAME_3(input) {
    if (input.length < 2 || input.length > 80) {
      return { error: 'One more valid name (2–80 characters) and we\'re done with names.' };
    }
    return { nextState: 'COLLECT_BUSINESS_PURPOSE', save: { company_name_3: input } };
  },

  COLLECT_BUSINESS_PURPOSE(input) {
    if (input.length < 10) {
      return {
        error: 'Give me a bit more to work with — at least a sentence.\n\nSomething like: _"Holding and investing in digital assets and real estate globally."_',
      };
    }
    return { nextState: 'COLLECT_EIN', save: { business_purpose: input } };
  },

  COLLECT_EIN(input) {
    const yes = ['yes', 'y', '1', 'add_ein'];
    const no = ['no', 'n', '2', 'skip_ein', 'skip'];
    if (yes.includes(input.toLowerCase())) {
      return { nextState: 'COLLECT_DOB', save: { ein_required: true } };
    }
    if (no.includes(input.toLowerCase())) {
      return { nextState: 'COLLECT_DOB', save: { ein_required: false } };
    }
    return { error: 'Just *yes* to include EIN filing, or *no* to skip it for now. You can always add it later.' };
  },

  COLLECT_DOB(input) {
    if (!isValidDate(input)) {
      return { error: 'I need that in *DD/MM/YYYY* format — like 15/03/1990.' };
    }
    return { nextState: 'COLLECT_PASSPORT_NUMBER', save: { date_of_birth: input } };
  },

  COLLECT_PASSPORT_NUMBER(input) {
    if (!isValidPassport(input)) {
      return { error: 'That doesn\'t look quite right — passport numbers are usually 5–15 characters, letters and numbers only. No spaces or dashes.' };
    }
    return {
      nextState: 'COLLECT_PASSPORT_EXPIRY',
      save: { passport_number: input.toUpperCase().replace(/\s/g, '') },
    };
  },

  COLLECT_PASSPORT_EXPIRY(input) {
    if (!isValidDate(input)) {
      return { error: 'I need the expiry date in *DD/MM/YYYY* format — like 30/06/2029.' };
    }
    return { nextState: 'COLLECT_RESIDENTIAL_ADDRESS', save: { passport_expiry: input } };
  },

  COLLECT_RESIDENTIAL_ADDRESS(input) {
    if (input.length < 10) {
      return {
        error: 'I need your full address — street, city, country, and postal code.\n\nLike: _45 Marina Bay Ave, #12-01, Dubai, UAE 12345_',
      };
    }
    return { nextState: 'COLLECT_SOURCE_OF_FUNDS', save: { residential_address: input } };
  },

  COLLECT_SOURCE_OF_FUNDS(input) {
    if (input.length < 5) {
      return {
        error: 'Just a quick description — business revenue, employment income, investment returns, consulting fees, etc.',
      };
    }
    return { nextState: 'CONFIRM_APPLICATION', save: { source_of_funds: input } };
  },

  CONFIRM_APPLICATION(input) {
    const yes = ['confirm', 'yes', 'y', '1', 'submit', 'confirm_app'];
    const edit = ['edit', 'change', '2', 'restart_app', 'redo'];
    if (yes.includes(input.toLowerCase())) {
      return { nextState: 'ELEPHANTS_OFFER' };
    }
    if (edit.includes(input.toLowerCase())) {
      return { nextState: 'COLLECT_COMPANY_NAME_1' };
    }
    return { error: 'Say *confirm* to submit everything, or *edit* if something needs fixing.' };
  },
};

// ─────────────────────────────────────────────────────────────
// MESSAGE BUILDERS
// ─────────────────────────────────────────────────────────────

function getPrompt(state, data = {}) {
  const isNonUS = ['singapore', 'uk', 'hong-kong'].includes(data.entity_preference);
  const firstName = data.user_name || 'there';

  const prompts = {
    CONFIRM_MATCH: null, // Built dynamically in bot.js using matcher output

    COLLECT_COMPANY_NAME_1:
      `Great — let\'s build your application.\n\n` +
      `*What do you want to name your company?*\n\n` +
      (isNonUS
        ? `_Example: Blue Ridge Asia Pte. Ltd._`
        : `_Your entity will be registered as "[Your Name], LLC" — what name?\n\nExample: Blue Ridge Ventures_`),

    COLLECT_COMPANY_NAME_2:
      `Smart. Now give me a *backup name* in case that one\'s already registered.`,

    COLLECT_COMPANY_NAME_3:
      `And a *third option* — always good to have a safety net.`,

    COLLECT_BUSINESS_PURPOSE:
      `*What will this company do?*\n\n` +
      `Describe it in 1–2 sentences. This goes straight into your formation docs.\n\n` +
      `_Example: "Investing in digital assets, real estate, and international business ventures."_\n\n` +
      `_Keep it broad — you don\'t want to amend this every time you pivot._`,

    COLLECT_EIN: isNonUS
      ? null // Skipped for non-US entities — handled by bot.js
      : `*Do you want to include EIN filing?*\n\n` +
        `An EIN (Employer Identification Number) is basically your company\'s tax ID in the US. ` +
        `You\'ll need one to open most US financial accounts, file taxes, or hire people.\n\n` +
        `Without it, providers will ask for your SSN instead — which most non-US founders don\'t have.\n\n` +
        `*YES* — include it  |  *NO* — skip for now`,

    COLLECT_DOB:
      `Now I need a few personal details for the KYC (Know Your Customer) checks — this is standard for company formation worldwide.\n\n` +
      `*What\'s your date of birth?*\n\nFormat: DD/MM/YYYY`,

    COLLECT_PASSPORT_NUMBER:
      `*What\'s your passport number?*\n\n` +
      `_Letters and numbers only, no spaces or dashes._\n\n` +
      `_This is required by formation providers for identity verification — it\'s kept secure and only shared with your chosen partner._`,

    COLLECT_PASSPORT_EXPIRY:
      `*When does your passport expire?*\n\nFormat: DD/MM/YYYY\n\n` +
      `_Some providers require at least 6 months validity — worth checking if yours is close to expiring._`,

    COLLECT_RESIDENTIAL_ADDRESS:
      `*What\'s your current home address?*\n\n` +
      `Include street, city, country, and postal code.\n\n` +
      `_Example: 12 Sheikh Zayed Rd, Dubai Marina, Dubai, UAE 00000_\n\n` +
      `_This is used for director/member registration — it won\'t be made public._`,

    COLLECT_SOURCE_OF_FUNDS:
      `Almost done. *Where does your funding come from?*\n\n` +
      `This is a compliance question — just a simple description is fine.\n\n` +
      `_Examples: Business revenue, employment income, investment returns, consulting fees_`,

    CONFIRM_APPLICATION:
      `Here\'s your full application — take a look:\n\n` +
      `${firstName !== 'there' ? `${firstName} · ` : ''}${data.country || '—'}\n` +
      `Company names:\n` +
      `  1. ${data.company_name_1 || '—'}\n` +
      `  2. ${data.company_name_2 || '—'}\n` +
      `  3. ${data.company_name_3 || '—'}\n` +
      `Purpose: ${data.business_purpose || '—'}\n` +
      `EIN: ${data.ein_required ? 'Yes' : data.ein_required === false ? 'No' : 'N/A'}\n` +
      `DOB: ${data.date_of_birth || '—'}\n` +
      `Passport: ${data.passport_number || '—'} (exp. ${data.passport_expiry || '—'})\n` +
      `Address: ${data.residential_address || '—'}\n` +
      `Source of funds: ${data.source_of_funds || '—'}\n\n` +
      `Everything correct? Say *confirm* to submit, or *edit* to fix something.`,
  };

  return prompts[state] || null;
}

function getButtons(state, data = {}) {
  const buttons = {
    CONFIRM_MATCH: [
      { id: 'confirm_match', title: 'Yes, looks good' },
      { id: 'edit_match', title: 'Adjust preferences' },
    ],
    COLLECT_EIN: [
      { id: 'add_ein', title: 'Yes, include EIN' },
      { id: 'skip_ein', title: 'Skip for now' },
    ],
    CONFIRM_APPLICATION: [
      { id: 'confirm_app', title: 'Confirm & Submit' },
      { id: 'restart_app', title: 'Edit' },
    ],
  };
  return buttons[state] || null;
}

module.exports = { steps, getPrompt, getButtons };
