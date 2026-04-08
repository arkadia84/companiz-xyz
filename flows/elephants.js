/**
 * ELEPHANTS FINANCIAL ACCOUNT FLOW
 *
 * This is now a lightweight offer gate — not a full KYC flow.
 * All KYC data (DOB, passport, address, source of funds) is already
 * collected in the application phase and reused for the Elephants
 * submission. The user just needs to say yes or no.
 *
 * PERSONALITY: Smart, friendly CorpSec advisor.
 *
 * COMPLIANCE: Per Elephants affiliate agreement, NEVER use:
 *   "bank", "banking", "deposit", "savings"
 * Approved terms: "financial account", "spend account", "global account",
 *                 "multi-currency account", "card account"
 */

// ─────────────────────────────────────────────────────────────
// STEP HANDLERS
// ─────────────────────────────────────────────────────────────

const steps = {

  ELEPHANTS_OFFER(input) {
    const yes = ['yes', 'y', 'continue', 'ok', 'sure', 'next', 'proceed', 'elephants_yes', "let's go", 'go', 'add', 'add it'];
    const skip = ['skip', 'no', 'n', 'later', 'not now', 'elephants_skip', 'pass'];
    if (yes.includes(input.toLowerCase().trim())) {
      return { nextState: 'SUBMITTING', save: { elephants_opted_in: true } };
    }
    if (skip.includes(input.toLowerCase().trim())) {
      return { nextState: 'SUBMITTING', save: { elephants_opted_in: false } };
    }
    return { error: 'Just say *yes* to add the financial account, or *skip* to do it later. Either way, your company formation goes through.' };
  },
};

// ─────────────────────────────────────────────────────────────
// MESSAGE BUILDERS
// ─────────────────────────────────────────────────────────────

function getPrompt(state, data = {}) {
  const firstName = data.user_name || 'there';

  const prompts = {
    ELEPHANTS_OFFER:
      `One more thing, ${firstName} — most founders I work with also set up a *global financial account* alongside their entity.\n\n` +
      `Through our partner *Elephants* (referral code *PROPEX*), you'd get:\n\n` +
      `- Physical + virtual multi-currency cards\n` +
      `- International transfers across 100+ countries\n` +
      `- A spend management dashboard to track everything\n\n` +
      `Since I already have your details from the formation application, I can submit this for you right now — no extra questions.\n\n` +
      `Want me to add it? Or skip and come back to it later.`,
  };

  return prompts[state] || null;
}

function getButtons(state) {
  const buttons = {
    ELEPHANTS_OFFER: [
      { id: 'elephants_yes', title: 'Yes, add it' },
      { id: 'elephants_skip', title: 'Skip for now' },
    ],
  };
  return buttons[state] || null;
}

module.exports = { steps, getPrompt, getButtons };
