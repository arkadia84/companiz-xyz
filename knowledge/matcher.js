/**
 * MATCHER.JS — Rule-Based Partner Matching Engine
 *
 * Takes a user profile and returns ranked corpsec + fintech recommendations.
 *
 * Input (userProfile):
 *   country          {string}  Country of residence (lowercase)
 *   entityPreference {string}  'wyoming-llc' | 'c-corp' |
 *                              'singapore' | 'hong-kong' | 'recommend'
 *   businessType     {string}  'ecommerce' | 'saas' | 'real-estate' |
 *                              'holding' | 'consulting' | 'crypto' | 'other'
 *   bankingNeed      {string}  'usd' | 'multi-currency' | 'corporate-card' |
 *                              'international-transfers' | 'all'
 *   hasUSPersons     {boolean} Any owner a US citizen or resident?
 *   monthlyRevenue   {string}  'pre-revenue' | 'under-10k' | '10k-100k' | 'over-100k'
 *
 * Output:
 *   {
 *     corpsec: [{ partner, score, reasons, warnings }],
 *     fintech:  [{ partner, score, reasons, warnings }],
 *     blocked:  [{ partner, reason }]  // partners the user is ineligible for
 *   }
 *
 * Routing rules:
 *   SG entity       → Sleek (referral partner)
 *   HK entity       → Osome (referral partner)
 *   Crypto business → Override Singapore → recommend Hong Kong Limited instead
 *   US entities     → Fileforms (Wyoming LLC or Delaware C-Corp)
 */

const { CORPSEC, FINTECH } = require('./partners');

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function normalise(str) {
  return (str || '').toLowerCase().trim();
}

function countryInList(country, list) {
  const c = normalise(country);
  return list.some((item) => c.includes(normalise(item)) || normalise(item).includes(c));
}

function isUSJurisdiction(entityPreference) {
  return ['wyoming-llc', 'c-corp', 'us-llc', 'recommend'].includes(entityPreference);
}

// ─────────────────────────────────────────────────────────────
// CORPSEC MATCHING
// ─────────────────────────────────────────────────────────────

function matchCorpsec(profile) {
  const { country, entityPreference, businessType, hasUSPersons } = profile;
  const results = [];
  const blocked = [];

  // Crypto override: if user selected Singapore but business is Crypto/Web3,
  // recommend Hong Kong instead (clearer crypto licensing framework)
  const effectiveEntity = (businessType === 'crypto' && entityPreference === 'singapore')
    ? 'hong-kong'
    : entityPreference;

  // ── DOOLA ──────────────────────────────────────────────────
  {
    const p = CORPSEC.doola;
    if (countryInList(country, p.excludedCountries)) {
      blocked.push({ partner: p.name, reason: `Doola cannot serve founders residing in ${country} due to compliance restrictions.` });
    } else if (isUSJurisdiction(effectiveEntity)) {
      let score = 45;
      const reasons = [];
      const warnings = [];

      if (['ecommerce', 'amazon-fba', 'digital'].includes(businessType)) {
        score += 20;
        reasons.push('Excellent for e-commerce and digital businesses');
      }
      if (['saas', 'consulting', 'other'].includes(businessType)) {
        score += 10;
        reasons.push('Good full-stack support for tech and consulting companies');
      }
      if (country !== 'united states') {
        score += 15;
        reasons.push('Specialist in helping non-US founders launch US companies');
      }
      if (effectiveEntity === 'wyoming-llc') {
        score += 10;
        reasons.push('Wyoming LLC formation included');
      }
      if (effectiveEntity === 'c-corp') {
        score += 10;
        reasons.push('Delaware C-Corp formation available');
      }
      if (effectiveEntity === 'recommend') {
        score += 5;
        reasons.push('Will recommend optimal entity type for your business');
      }

      reasons.push('Registered agent included, EIN filing available');
      results.push({ partner: p, score, reasons, warnings });
    }
  }

  // ── FIRSTBASE ──────────────────────────────────────────────
  {
    const p = CORPSEC.firstbase;
    if (countryInList(country, p.excludedCountries)) {
      blocked.push({ partner: p.name, reason: `Firstbase cannot serve founders from ${country} (their compliance restrictions are stricter than most providers).` });
    } else if (isUSJurisdiction(effectiveEntity)) {
      let score = 40;
      const reasons = [];
      const warnings = [];

      if (['saas', 'other'].includes(businessType)) {
        score += 20;
        reasons.push('Industry-standard for VC-fundable tech startups');
      }
      if (effectiveEntity === 'c-corp') {
        score += 25;
        reasons.push('Best-in-class Delaware C-Corp formation for VC rounds');
      }
      if (effectiveEntity === 'wyoming-llc') {
        score -= 5;
        warnings.push('Firstbase is optimised for Delaware — Wyoming is available but not their specialty');
      }

      reasons.push('Full compliance dashboard, annual reports, and registered agent included');
      results.push({ partner: p, score, reasons, warnings });
    }
  }

  // ── NORTHWEST ──────────────────────────────────────────────
  {
    const p = CORPSEC.northwest;
    if (countryInList(country, p.excludedCountries)) {
      blocked.push({ partner: p.name, reason: 'Northwest cannot serve OFAC-restricted countries.' });
    } else if (isUSJurisdiction(effectiveEntity)) {
      let score = 35;
      const reasons = [];
      const warnings = [];

      reasons.push('Most affordable: ~$39 service fee + state fees');
      reasons.push('Privacy-first — does not sell your data');
      reasons.push('All 50 states available');

      if (effectiveEntity === 'wyoming-llc') {
        score += 15;
        reasons.push('Excellent for Wyoming LLC — same-day filing possible');
      }
      if (!hasUSPersons) {
        score += 5;
        warnings.push('EIN for non-US persons costs $200 extra (no SSN required)');
      }

      results.push({ partner: p, score, reasons, warnings });
    }
  }

  // ── FILEFORMS (Companiz preferred US partner) ───────────────
  {
    const p = CORPSEC.fileform;
    if (countryInList(country, p.excludedCountries)) {
      blocked.push({ partner: p.name, reason: 'Fileforms cannot serve OFAC-restricted countries.' });
    } else if (['wyoming-llc', 'c-corp', 'recommend'].includes(effectiveEntity)) {
      let score = 65; // Companiz preferred US partner
      const reasons = [];

      reasons.push('Companiz referral partner — formation, EIN, and registered agent included from $399');
      if (effectiveEntity === 'wyoming-llc') {
        reasons.push('Wyoming LLC specialist — filed in 10 business days or less, guaranteed');
      } else if (effectiveEntity === 'c-corp') {
        reasons.push('Delaware C-Corp formation — EIN included, 10 business days or less, guaranteed');
      } else {
        reasons.push('Handles both Wyoming LLC and Delaware C-Corp — will recommend best fit');
      }
      reasons.push('User pays Fileforms directly via Companiz referral link');

      results.push({ partner: p, score, reasons, warnings: [] });
    }
  }

  // ── SLEEK (Singapore — Companiz referral partner) ───────────
  {
    const p = CORPSEC.sleek;
    if (effectiveEntity === 'singapore') {
      let score = 75;
      const reasons = [];
      const warnings = [];

      reasons.push('Companiz referral partner for Singapore Pte Ltd');
      reasons.push('Fast digital incorporation — same-day ACRA filing in most cases');
      if (country !== 'singapore') {
        warnings.push('Non-residents need a nominee director via Sleek — S$1,500/yr additional cost');
      }
      reasons.push('Also covers accounting, tax, and payroll — all-in-one solution');

      results.push({ partner: p, score, reasons, warnings });
    }
  }

  // ── OSOME (Hong Kong — Companiz referral partner) ──────────
  {
    const p = CORPSEC.osome;
    const isHK = effectiveEntity === 'hong-kong';
    const isCryptoOverride = businessType === 'crypto' && entityPreference === 'singapore';

    if (isHK) {
      let score = 75;
      const reasons = [];
      const warnings = [];

      if (isCryptoOverride) {
        score = 82;
        reasons.push('⚠️ For Crypto / Web3, Hong Kong Limited is recommended — HK has a clear crypto licensing framework vs. Singapore');
      }
      reasons.push('Companiz referral partner for Hong Kong Limited');
      reasons.push('HK Limited Company ready in 3–5 business days');
      reasons.push('Popular for Asia-Pacific trade structures and crypto licensing');

      results.push({ partner: p, score, reasons, warnings });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return { results, blocked };
}

// ─────────────────────────────────────────────────────────────
// FINTECH MATCHING
// ─────────────────────────────────────────────────────────────

function matchFintech(profile, chosenCorpsec) {
  const { country, entityPreference, businessType, bankingNeed } = profile;
  const results = [];
  const blocked = [];

  // Apply crypto override for SG→HK
  const effectiveEntity = (businessType === 'crypto' && entityPreference === 'singapore')
    ? 'hong-kong'
    : entityPreference;

  const isUSEntity = isUSJurisdiction(effectiveEntity) ||
    (chosenCorpsec && ['doola', 'firstbase', 'northwest', 'fileform'].includes(chosenCorpsec));
  const isSGEntity = effectiveEntity === 'singapore' ||
    (chosenCorpsec && chosenCorpsec === 'sleek');
  const isHKEntity = effectiveEntity === 'hong-kong' ||
    (chosenCorpsec && chosenCorpsec === 'osome');

  const needsMultiCurrency = ['multi-currency', 'international-transfers', 'all'].includes(bankingNeed);
  const needsUSD = ['usd', 'all'].includes(bankingNeed);
  const needsCard = ['corporate-card', 'all'].includes(bankingNeed);

  // ── MERCURY ────────────────────────────────────────────────
  {
    const p = FINTECH.mercury;
    if (!isUSEntity) {
      // Mercury only works with US entities
    } else if (countryInList(country, p.prohibitedOwnerCountries)) {
      blocked.push({ partner: p.name, reason: `Mercury does not allow founders residing in ${country}. You'll need an alternative USD account.` });
    } else {
      let score = 50;
      const reasons = [];
      const warnings = [];

      if (needsUSD || bankingNeed === 'all') {
        score += 25;
        reasons.push('Free USD business account — the gold standard for US startups');
      }
      if (['saas', 'consulting', 'ecommerce'].includes(businessType)) {
        score += 10;
        reasons.push('Integrates with Stripe, Gusto, QuickBooks out of the box');
      }
      reasons.push('FDIC insured up to $5M, no monthly fees, ACH + wire included');
      warnings.push('Requires EIN — included with Fileforms formation package');
      warnings.push('USD only — pair with Airwallex or Elephants if you need multi-currency');

      results.push({ partner: p, score, reasons, warnings });
    }
  }

  // ── AIRWALLEX ──────────────────────────────────────────────
  {
    const p = FINTECH.airwallex;

    let entityCountrySupported = false;
    if (isUSEntity) entityCountrySupported = true;
    if (isSGEntity) entityCountrySupported = true;
    if (isHKEntity) entityCountrySupported = true;

    if (!entityCountrySupported) {
      blocked.push({ partner: p.name, reason: 'Airwallex requires your company to be registered in one of their 56 supported countries.' });
    } else if (countryInList(country, p.prohibitedOwnerCountries)) {
      blocked.push({ partner: p.name, reason: `Airwallex cannot onboard directors/owners residing in ${country}.` });
    } else {
      let score = 45;
      const reasons = [];
      const warnings = [];

      if (needsMultiCurrency) {
        score += 30;
        reasons.push('Multi-currency accounts in 150+ countries — best-in-class for global operations');
      }
      if (['ecommerce', 'real-estate', 'crypto'].includes(businessType)) {
        score += 15;
        reasons.push('Excellent for cross-border payments, collections, and global payouts');
      }
      if (isSGEntity || isHKEntity) {
        score += 10;
        reasons.push('Strong Asia-Pacific coverage with SGD, HKD, AUD local accounts');
      }
      reasons.push('Competitive FX rates, virtual + physical cards, batch payments');

      results.push({ partner: p, score, reasons, warnings });
    }
  }

  // ── REVOLUT US ────────────────────────────────────────────
  {
    const p = FINTECH.mercury_revolut_us;
    if (!isUSEntity) {
      // Skip — Revolut US requires US entity
    } else if (!countryInList(country, p.eligibleApplicantCountries)) {
      blocked.push({ partner: p.name, reason: `Revolut Business (US) requires founders to reside in an eligible country. ${country} is not currently on their eligible list.` });
    } else if (countryInList(country, p.prohibitedOwnerCountries)) {
      blocked.push({ partner: p.name, reason: `Revolut cannot serve founders from ${country}.` });
    } else {
      let score = 40;
      const reasons = [];
      const warnings = [];

      if (needsMultiCurrency) {
        score += 20;
        reasons.push('USD + EUR + GBP + 25 currencies in one account');
      }
      if (['holding', 'real-estate'].includes(businessType)) {
        score += 10;
        reasons.push('Good for international holding structures with multi-currency flows');
      }
      reasons.push('Corporate cards, expense management, FX at interbank rates (paid plans)');
      warnings.push('Must show proof of US physical presence (registered agent address accepted)');

      results.push({ partner: p, score, reasons, warnings });
    }
  }

  // ── REVOLUT SG ────────────────────────────────────────────
  {
    const p = FINTECH.revolut_sg;
    if (!isSGEntity) {
      // Skip — Revolut SG requires SG entity
    } else if (!countryInList(country, p.eligibleApplicantCountries)) {
      blocked.push({ partner: p.name, reason: 'Revolut Business (SG) requires the applicant to reside in an eligible country.' });
    } else {
      let score = 60;
      const reasons = [];

      reasons.push('Multi-currency SGD/USD/EUR/GBP account for Singapore companies');
      reasons.push('FAST payments, SWIFT, corporate cards');
      if (needsMultiCurrency) score += 15;

      results.push({ partner: p, score, reasons, warnings: [] });
    }
  }

  // ── ELEPHANTS ────────────────────────────────────────────
  {
    const p = FINTECH.elephants;
    if (countryInList(country, p.excludedCountries)) {
      blocked.push({ partner: p.name, reason: `Elephants Inc. is not available for residents of ${country}.` });
    } else {
      let score = 35;
      const reasons = [];
      const warnings = [];

      if (needsCard || bankingNeed === 'all') {
        score += 25;
        reasons.push('Corporate spend management + virtual/physical cards — best for controlling team expenses');
      }
      reasons.push('Available via Companiz referral code PROPEX');
      reasons.push('Works alongside your primary account — not a replacement');
      warnings.push('This is a corporate spend/card product, not a primary account. Pair with Mercury or Airwallex for core banking.');

      results.push({ partner: p, score, reasons, warnings });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return { results, blocked };
}

// ─────────────────────────────────────────────────────────────
// MAIN MATCH FUNCTION
// ─────────────────────────────────────────────────────────────

function matchPartners(userProfile, chosenCorpsec = null) {
  const corpsec = matchCorpsec(userProfile);
  const fintech = matchFintech(userProfile, chosenCorpsec);

  return {
    corpsec: corpsec.results,
    fintech: fintech.results,
    blocked: [...corpsec.blocked, ...fintech.blocked],
  };
}

// ─────────────────────────────────────────────────────────────
// FORMAT MATCH MESSAGE (for WhatsApp / Telegram display)
// ─────────────────────────────────────────────────────────────

function formatMatchMessage(matchResult, userName) {
  const topCorpsec = matchResult.corpsec.slice(0, 2);
  const topFintech = matchResult.fintech.slice(0, 2);
  const firstName = userName?.split(' ')[0] || 'there';

  let msg = `Alright ${firstName}, here\'s what I\'d recommend based on everything you told me:\n\n`;

  // Corpsec
  msg += `*Company Formation*\n`;
  if (topCorpsec.length > 0) {
    const top = topCorpsec[0];
    msg += `\nMy top pick: *${top.partner.name}*\n`;
    top.reasons.slice(0, 2).forEach((reason) => (msg += `  - ${reason}\n`));
    if (top.partner.pricing) {
      const firstPrice = Object.values(top.partner.pricing)[0];
      msg += `  - From ${firstPrice}\n`;
    }
    if (top.partner.referralUrl) {
      msg += `  - ${top.partner.referralUrl}\n`;
    }
  }
  if (topCorpsec.length > 1) {
    const alt = topCorpsec[1];
    msg += `\nAlternative: *${alt.partner.name}*\n`;
    alt.reasons.slice(0, 2).forEach((reason) => (msg += `  - ${reason}\n`));
  }

  // Fintech
  msg += `\n*Financial Account*\n`;
  if (topFintech.length > 0) {
    const top = topFintech[0];
    msg += `\nMy top pick: *${top.partner.name}*\n`;
    top.reasons.slice(0, 2).forEach((reason) => (msg += `  - ${reason}\n`));
    if (top.warnings?.length) {
      msg += `  - Heads up: ${top.warnings[0]}\n`;
    }
  }
  if (topFintech.length > 1) {
    const alt = topFintech[1];
    msg += `\nAlternative: *${alt.partner.name}*\n`;
    alt.reasons.slice(0, 1).forEach((reason) => (msg += `  - ${reason}\n`));
  }

  // Blocked
  if (matchResult.blocked.length) {
    msg += `\n_A few providers aren\'t available for your profile:_\n`;
    matchResult.blocked.forEach((b) => (msg += `  - ${b.partner}: ${b.reason}\n`));
  }

  msg += `\nDoes this look right? Say *yes* to continue with these matches, or *no* to go back and adjust.`;
  return msg;
}

module.exports = { matchPartners, formatMatchMessage };
