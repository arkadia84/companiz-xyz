/**
 * PROFILING FLOW
 *
 * Phase 1 — Collect 4 profile fields to enable partner matching.
 * Questions are partner-agnostic: the agent doesn't mention any partner
 * by name until after the match is computed.
 *
 * PERSONALITY: Smart, friendly CorpSec advisor — like a knowledgeable
 * friend who happens to know everything about company formation.
 * Warm, conversational, zero corporate-speak. Explains *why* each
 * question matters so the user feels guided, not interrogated.
 *
 * DROPPED: Legal name and email — we get the user's first name from
 * Telegram/WhatsApp profile and collect formal details later in the
 * application phase when they're actually needed.
 */

// ─────────────────────────────────────────────────────────────
// STEP HANDLERS
// Each receives (input, data) where data is the current session data
// ─────────────────────────────────────────────────────────────

const steps = {

  COLLECT_COUNTRY(input) {
    if (input.length < 2) {
      return { error: 'Hmm, I need at least a country name to work with — where are you based? (e.g. France, India, UAE)' };
    }
    return { nextState: 'COLLECT_ENTITY_PREF', save: { country: input } };
  },

  COLLECT_ENTITY_PREF(input, data = {}) {
    const map = {
      '1': 'wyoming-llc',
      'wyoming': 'wyoming-llc',
      'wyoming llc': 'wyoming-llc',
      'wyoming-llc': 'wyoming-llc',
      '2': 'c-corp',
      'delaware': 'c-corp',
      'delaware c-corp': 'c-corp',
      'delaware ccorp': 'c-corp',
      'delaware corp': 'c-corp',
      'c-corp': 'c-corp',
      'c corp': 'c-corp',
      'corp': 'c-corp',
      '3': 'singapore',
      'sg': 'singapore',
      'singapore': 'singapore',
      'pte ltd': 'singapore',
      'pte. ltd': 'singapore',
      'singapore pte': 'singapore',
      '4': 'hong-kong',
      'hk': 'hong-kong',
      'hong kong': 'hong-kong',
      'hong-kong': 'hong-kong',
      'hongkong': 'hong-kong',
      '5': 'recommend',
      'recommend': 'recommend',
      'not sure': 'recommend',
      'help me choose': 'recommend',
      'help': 'recommend',
    };
    const val = map[input.toLowerCase().trim()];
    if (!val) {
      return {
        error:
          'No worries — just pick a number:\n\n' +
          '1 — Wyoming LLC\n' +
          '2 — Delaware C-Corp\n' +
          '3 — Singapore Pte Ltd\n' +
          '4 — Hong Kong Limited\n' +
          '5 — Not sure yet (I\'ll help you figure it out)',
      };
    }
    return { nextState: 'COLLECT_BUSINESS_TYPE', save: { entity_preference: val } };
  },

  COLLECT_BUSINESS_TYPE(input) {
    const map = {
      '1': 'ecommerce',
      'ecommerce': 'ecommerce',
      'e-commerce': 'ecommerce',
      'e commerce': 'ecommerce',
      'amazon': 'ecommerce',
      'shopify': 'ecommerce',
      '2': 'saas',
      'saas': 'saas',
      'software': 'saas',
      'tech': 'saas',
      'app': 'saas',
      'startup': 'saas',
      '3': 'real-estate',
      'real estate': 'real-estate',
      'real-estate': 'real-estate',
      'property': 'real-estate',
      'rwa': 'real-estate',
      '4': 'holding',
      'holding': 'holding',
      'investment': 'holding',
      'investments': 'holding',
      'assets': 'holding',
      '5': 'consulting',
      'consulting': 'consulting',
      'freelance': 'consulting',
      'agency': 'consulting',
      'services': 'consulting',
      '6': 'crypto',
      'crypto': 'crypto',
      'web3': 'crypto',
      'defi': 'crypto',
      'blockchain': 'crypto',
      'nft': 'crypto',
      'dao': 'crypto',
      'token': 'crypto',
      '7': 'other',
      'other': 'other',
    };
    const val = map[input.toLowerCase().trim()];
    if (!val) {
      return {
        error:
          'Just pick the closest match — it helps me find the right setup for you:\n\n' +
          '1 — E-commerce / Amazon FBA\n' +
          '2 — SaaS / Tech / App\n' +
          '3 — Real Estate / RWA\n' +
          '4 — Holding / Investments\n' +
          '5 — Consulting / Freelance / Agency\n' +
          '6 — Crypto / Web3 / DeFi\n' +
          '7 — Something else',
      };
    }
    return { nextState: 'COLLECT_BANKING_NEED', save: { business_type: val } };
  },

  COLLECT_BANKING_NEED(input) {
    const map = {
      '1': 'usd',
      'usd': 'usd',
      'dollar': 'usd',
      'us dollar': 'usd',
      '2': 'multi-currency',
      'multi': 'multi-currency',
      'multi-currency': 'multi-currency',
      'multicurrency': 'multi-currency',
      'currencies': 'multi-currency',
      '3': 'corporate-card',
      'card': 'corporate-card',
      'cards': 'corporate-card',
      'corporate card': 'corporate-card',
      '4': 'international-transfers',
      'transfers': 'international-transfers',
      'wire': 'international-transfers',
      'international': 'international-transfers',
      '5': 'all',
      'all': 'all',
      'everything': 'all',
      'all of the above': 'all',
    };
    const val = map[input.toLowerCase().trim()];
    if (!val) {
      return {
        error:
          'What do you need most from your financial account?\n\n' +
          '1 — USD account\n' +
          '2 — Multi-currency (USD + EUR + GBP etc.)\n' +
          '3 — Corporate card / spend management\n' +
          '4 — International transfers\n' +
          '5 — All of the above',
      };
    }
    return { nextState: 'COLLECT_US_PERSONS', save: { banking_need: val } };
  },

  COLLECT_US_PERSONS(input) {
    const yes = ['yes', 'y', '1', 'true'];
    const no = ['no', 'n', '2', 'false', 'none'];
    if (yes.includes(input.toLowerCase().trim())) {
      return { nextState: 'SHOW_MATCHES', save: { has_us_persons: true } };
    }
    if (no.includes(input.toLowerCase().trim())) {
      return { nextState: 'SHOW_MATCHES', save: { has_us_persons: false } };
    }
    return { error: 'Just a quick *YES* or *NO* — are any of the company\'s owners US citizens or residents?' };
  },
};

// ─────────────────────────────────────────────────────────────
// MESSAGE BUILDERS
// ─────────────────────────────────────────────────────────────

function getPrompt(state, data = {}) {
  const firstName = data.user_name || 'there';

  const isUSBased = ['united states', 'usa', 'us', 'america'].includes(
    (data.country || '').toLowerCase().trim()
  );

  const prompts = {
    WELCOME:
      `Hey ${firstName}! I'm your Companiz advisor.\n\n` +
      `Think of me as that friend who actually knows the ins and outs of setting up a company abroad — ` +
      `the right entity type, the best formation partner for your situation, and which financial accounts will actually work for you.\n\n` +
      `I've got 4 quick questions, then I'll give you a personalized recommendation. Takes about 2 minutes.\n\n` +
      `Ready to go?`,

    COLLECT_COUNTRY:
      `First things first — *where are you based right now?*\n\n` +
      `This matters because your country of residence affects which formation providers and financial accounts you're eligible for. ` +
      `Some have restrictions, and I'd rather tell you upfront than waste your time.`,

    COLLECT_ENTITY_PREF:
      (isUSBased
        ? `Quick heads up — Companiz is really built for founders outside the US who want to set up ` +
          `a global structure. If you're US-based running a US business, a local formation service might serve you better. ` +
          `But if you want a Wyoming LLC or Delaware C-Corp as an international structure, you're in the right place!\n\n`
        : '') +
      `*What type of company are you looking to form?*\n\n` +
      `1 — Wyoming LLC — great for privacy, low cost, and flexibility\n` +
      `2 — Delaware C-Corp — the go-to if you're raising VC money\n` +
      `3 — Singapore Pte Ltd — perfect for ASEAN operations\n` +
      `4 — Hong Kong Limited — ideal for China/GBA access or crypto\n` +
      `5 — Not sure yet — I'll recommend one based on your answers\n\n` +
      `_No wrong answers here — if you're unsure, just hit 5 and I'll figure it out for you._`,

    COLLECT_BUSINESS_TYPE:
      `Nice. Now *what kind of business is this?*\n\n` +
      `1 — E-commerce / Amazon FBA\n` +
      `2 — SaaS / Tech / App\n` +
      `3 — Real Estate / RWA\n` +
      `4 — Holding / Investments\n` +
      `5 — Consulting / Freelance / Agency\n` +
      `6 — Crypto / Web3 / DeFi\n` +
      `7 — Something else\n\n` +
      `_This helps me match you with the right jurisdiction and partners — some are way better than others for specific industries._`,

    COLLECT_BANKING_NEED:
      `Almost there. *What do you need most from your business financial account?*\n\n` +
      `1 — USD account\n` +
      `2 — Multi-currency (USD + EUR + GBP and more)\n` +
      `3 — Corporate card / spend management\n` +
      `4 — International transfers / payouts\n` +
      `5 — All of the above\n\n` +
      `_I ask because different providers specialize in different things — I want to point you to the one that actually fits._`,

    COLLECT_US_PERSONS:
      `Last one — *are any of the company's owners or members US citizens or US residents?*\n\n` +
      `*YES* or *NO*\n\n` +
      `_This affects your tax obligations and which financial accounts you can open. Important to get right._`,
  };
  return prompts[state] || null;
}

function getButtons(state) {
  const buttons = {
    WELCOME: [{ id: 'start', title: "Let's do it" }],
    COLLECT_ENTITY_PREF: [
      { id: '1', title: 'Wyoming LLC' },
      { id: '5', title: 'Help me choose' },
    ],
    COLLECT_US_PERSONS: [
      { id: 'yes', title: 'Yes' },
      { id: 'no', title: 'No' },
    ],
  };
  return buttons[state] || null;
}

module.exports = { steps, getPrompt, getButtons };
