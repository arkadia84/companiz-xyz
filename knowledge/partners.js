/**
 * PARTNER KNOWLEDGE BASE
 *
 * Contains all T&Cs, eligibility rules, excluded countries, pricing,
 * and requirements for every corpsec and fintech partner in the Companiz network.
 *
 * Sources compiled from official partner websites, help centers, and T&Cs.
 * Last reviewed: April 2026. Verified via web search of official support pages.
 */

// ─────────────────────────────────────────────────────────────
// SHARED EXCLUSION LISTS
// ─────────────────────────────────────────────────────────────

// Core OFAC / US sanctions list (applies to ALL US-related services)
const OFAC_COUNTRIES = [
  'iran', 'north korea', 'dprk', 'cuba', 'syria',
  'russia', 'belarus', 'crimea', 'donetsk', 'luhansk',
];

// ─────────────────────────────────────────────────────────────
// CORPSEC PARTNERS
// ─────────────────────────────────────────────────────────────

const CORPSEC = {

  doola: {
    id: 'doola',
    name: 'Doola',
    type: 'corpsec',
    tagline: 'Best for non-US founders launching US companies',
    jurisdictions: ['US'],
    entityTypes: ['wyoming-llc', 'delaware-llc', 'c-corp'],
    // Works with founders from 120+ countries
    supportedCountries: 'global',
    // Follows OFAC + their own risk-based exclusions
    excludedCountries: [
      ...OFAC_COUNTRIES,
      'north korea', 'iraq', 'south sudan', 'somalia', 'libya',
      'central african republic', 'democratic republic of congo', 'drc',
      'burundi', 'liberia', 'nicaragua', 'venezuela', 'sudan',
    ],
    pricing: {
      starter: '$297 one-time (Wyoming LLC, basic)',
      total_compliance: '$1,997/yr (LLC + EIN + registered agent + compliance)',
      ein_only: '$199 (EIN filing for non-citizens)',
    },
    requirements: [
      'Valid passport (each founder/owner)',
      'Email address',
      'Desired company name (2-3 options)',
      'Business purpose description',
      'No SSN required for basic formation',
    ],
    registeredAgentIncluded: true,
    einService: true,
    einForNonCitizensPrice: '$199',
    turnaround: '1–3 business days (Wyoming), 3–7 days (Delaware)',
    annualFee: '$199/yr registered agent after year 1',
    bestFor: [
      'non-US founders',
      'e-commerce',
      'amazon-fba',
      'digital business',
      'saas',
      'consulting',
    ],
    notFor: [
      'founders from excluded countries',
      'US-domestic businesses wanting cheapest option',
    ],
    url: 'https://doola.com',
    referralCode: null, // add Companiz referral code if/when approved
    notes: 'Strong support for non-US founders. Offers full-stack compliance bundles including bookkeeping and tax.',
    // Compliance notes
    compliance: {
      kycRequired: true,
      passportRequired: true,
      usAddressProvided: true, // via registered agent
      einIncluded: 'optional add-on',
    },
  },

  firstbase: {
    id: 'firstbase',
    name: 'Firstbase',
    type: 'corpsec',
    tagline: 'Best for VC-fundable startups, Delaware C-Corps',
    jurisdictions: ['US'],
    entityTypes: ['delaware-llc', 'wyoming-llc', 'c-corp'],
    supportedCountries: 'global-with-exclusions',
    // Explicit exclusion list from their ToS
    excludedCountries: [
      ...OFAC_COUNTRIES,
      // Firstbase-specific additional exclusions
      'albania', 'bosnia', 'burundi', 'central african republic',
      'croatia', 'cyprus', 'democratic republic of congo', 'drc',
      'iraq', 'lebanon', 'liberia', 'libya', 'macedonia', 'montenegro',
      'nicaragua', 'serbia', 'slovenia', 'somalia', 'south sudan',
      'pakistan', 'ukraine', 'nigeria', 'philippines', 'zimbabwe',
      'venezuela', 'yemen', 'sudan',
    ],
    pricing: {
      launch: '$399/yr (Delaware LLC or Wyoming LLC)',
      scale: '$599/yr (includes compliance features)',
      registered_agent: 'included',
    },
    requirements: [
      'Valid passport',
      'Email address',
      'Company name (2-3 options)',
      'Business description',
      'Owners information (name, address, ownership %)',
    ],
    registeredAgentIncluded: true,
    einService: true,
    turnaround: '3–7 business days',
    annualFee: 'Included in subscription',
    bestFor: [
      'VC-backed startups',
      'Delaware C-Corp',
      'saas',
      'tech startups',
      'global founders (eligible countries)',
    ],
    notFor: [
      'founders from their extended excluded list',
      'simple holding companies',
      'e-commerce needing Wyoming privacy',
    ],
    url: 'https://firstbase.io',
    referralCode: null,
    notes: 'Strong product for tech startups. Delaware C-Corp is standard for US VC rounds. Extended exclusion list vs. other providers.',
    compliance: {
      kycRequired: true,
      passportRequired: true,
      usAddressProvided: true,
      einIncluded: 'optional add-on',
    },
  },

  northwest: {
    id: 'northwest',
    name: 'Northwest Registered Agent',
    type: 'corpsec',
    tagline: 'Best value + privacy-first, all 50 US states',
    jurisdictions: ['US'],
    entityTypes: ['llc', 'c-corp', 's-corp', 'nonprofit'],
    supportedCountries: 'global',
    excludedCountries: [...OFAC_COUNTRIES], // OFAC only, no additional restrictions stated
    pricing: {
      formation: '$39 service fee + state filing fees',
      wyoming_total: '~$139 total (Wyoming $100 state fee)',
      delaware_total: '~$129 total (Delaware $90 state fee)',
      registered_agent: '$125/yr after year 1 (year 1 included)',
      ein_no_ssn: '$200 (for foreign owners without SSN)',
      ein_with_ssn: '$50',
    },
    requirements: [
      'Company name',
      'Owner/member names and addresses',
      'For EIN without SSN: IRS Form SS-4, passport',
    ],
    registeredAgentIncluded: true, // Year 1 free
    einService: true,
    einForNonCitizensPrice: '$200',
    turnaround: 'Same day to 3 business days (state dependent)',
    annualFee: '$125/yr registered agent',
    bestFor: [
      'budget-conscious founders',
      'privacy-focused businesses',
      'US-domestic founders',
      'all-state flexibility',
      'non-US founders wanting low cost',
    ],
    notFor: [
      'founders needing full-stack compliance support',
      'VC startups needing Delaware C-Corp specialist',
    ],
    url: 'https://northwestregisteredagent.com',
    referralCode: null,
    notes: 'Strong privacy practices — does not sell or share your data. Best price in market for basic formation. No fancy dashboard but solid fundamentals.',
    compliance: {
      kycRequired: false, // minimal verification
      passportRequired: false, // for basic formation
      usAddressProvided: true,
      einIncluded: 'paid add-on ($200 without SSN)',
    },
  },

  osome: {
    id: 'osome',
    name: 'Osome',
    type: 'corpsec',
    tagline: 'Best for Singapore, UK, and Hong Kong incorporation',
    jurisdictions: ['SG', 'UK', 'HK'],
    entityTypes: ['private-limited', 'ltd'],
    supportedCountries: 'global',
    excludedCountries: [
      ...OFAC_COUNTRIES,
      'high-risk jurisdictions per MAS/FCA guidelines',
    ],
    pricing: {
      singapore: 'S$600+ (inc. company secretary, 1 yr)',
      uk: '£50+ (basic registration)',
      hong_kong: 'HKD 4,500–8,800 (inc. registered address)',
      nominee_director_sg: 'S$1,200+/yr (required for non-residents)',
    },
    requirements: {
      singapore: [
        'At least 1 local director (Singapore resident) OR nominee director via Osome',
        'Company secretary (provided by Osome)',
        'Registered Singapore address (provided)',
        'Passport for all shareholders/directors',
        'Min. 1 share at SGD 1',
      ],
      uk: [
        'At least 1 director (any nationality)',
        'Registered UK address',
        'Passport or national ID',
        'Service address',
      ],
      hong_kong: [
        'At least 1 director (any nationality)',
        'Company secretary (HK resident or corp)',
        'Registered HK address',
        'Passport for all directors/shareholders',
      ],
    },
    registeredAgentIncluded: true,
    einService: false, // Not US
    turnaround: {
      singapore: '1–3 business days (ACRA filing)',
      uk: 'Same day to 24 hours (Companies House)',
      hong_kong: '3–5 business days',
    },
    annualFee: 'Ongoing company secretary + compliance fees',
    bestFor: [
      'asia-pacific operations',
      'singapore holding structure',
      'uk limited company',
      'hong kong trading company',
      'digital nomads in Asia',
    ],
    notFor: [
      'US-entity focused founders',
      'budget-only formation',
    ],
    url: 'https://osome.com/hk/r/8V3C7H7V',
    referralCode: '8V3C7H7V',
    referralUrl: 'https://osome.com/hk/r/8V3C7H7V',
    notes: 'Companiz referral partner for HK formation. Singapore formation is now handled by Sleek. HK is popular for Asia-Pacific trade structures and crypto licensing. Osome provides nominee director, company secretary, and compliance services.',
    compliance: {
      kycRequired: true,
      passportRequired: true,
      localDirectorRequired: { SG: true, UK: false, HK: false },
      einIncluded: 'N/A',
    },
  },

  sleek: {
    id: 'sleek',
    name: 'Sleek',
    type: 'corpsec',
    tagline: 'Best for Singapore incorporation — fast, digital, affordable',
    jurisdictions: ['SG', 'AU', 'HK'],
    entityTypes: ['private-limited', 'sole-proprietor'],
    supportedCountries: 'global',
    excludedCountries: [
      ...OFAC_COUNTRIES,
      'high-risk jurisdictions per MAS guidelines',
    ],
    pricing: {
      singapore_resident_starter: 'S$650 (incorporation + company secretary + business account + partner perks)',
      singapore_nonresident_starter: 'S$2,200 (incorporation + accounting + tax support)',
      singapore_full_compliance_resident: 'S$1,600',
      singapore_full_compliance_nonresident: 'S$3,788',
      nominee_director: 'S$1,500/yr (for non-residents without local director)',
      registered_address: 'S$300/yr (if needed)',
      accounting_starter: 'from S$200/mo',
    },
    requirements: {
      singapore: [
        'At least 1 local director (Singapore resident or PR) OR nominee director via Sleek',
        'Company secretary (provided by Sleek)',
        'Registered Singapore address (provided by Sleek)',
        'Passport for all shareholders and directors',
        'Min. 1 ordinary share at SGD 1',
        'Proof of address (utility bill or bank statement)',
      ],
    },
    registeredAgentIncluded: true,
    einService: false,
    turnaround: {
      singapore: '1 business day (ACRA filing same day in most cases)',
    },
    annualFee: 'S$399+/yr (annual company secretary + filing)',
    bestFor: [
      'singapore pte ltd incorporation',
      'non-resident founders entering Singapore',
      'digital-first corp sec and accounting',
      'startups needing fast SG incorporation',
      'founders wanting all-in-one formation + accounting',
    ],
    notFor: [
      'US entity formation',
      'budget-only with zero compliance support',
    ],
    url: 'https://sleek.com/sg/?ref=zmqynme',
    referralCode: 'zmqynme',
    referralUrl: 'https://sleek.com/sg/?ref=zmqynme',
    notes: 'Companiz referral partner. Fast digital Singapore incorporation — typically same-day ACRA filing. Non-residents must use a nominee director (S$1,500/yr). Sleek also offers accounting, tax, and payroll making it a solid all-in-one solution for SG-incorporated businesses.',
    compliance: {
      kycRequired: true,
      passportRequired: true,
      localDirectorRequired: { SG: true },
      nomineeDirectorAvailable: true,
      einIncluded: 'N/A',
    },
  },

  fileform: {
    id: 'fileform',
    name: 'Fileforms',
    type: 'corpsec',
    tagline: 'US LLC + EIN specialist — fast, compliant, non-resident friendly',
    jurisdictions: ['US'],
    entityTypes: ['wyoming-llc', 'delaware-ccorp'],
    supportedCountries: 'global',
    excludedCountries: [...OFAC_COUNTRIES],
    pricing: {
      formation: '$399 + state filing fee (paid directly to Fileforms via Companiz referral link)',
      registered_agent: 'included year 1',
      ein: 'included',
    },
    requirements: [
      'Owner legal name',
      'Company name',
      'Basic business info',
    ],
    registeredAgentIncluded: true,
    einService: true,
    turnaround: '10 business days or less (guaranteed)',
    annualFee: 'Registered agent renewal — ask Fileforms for current rate',
    bestFor: [
      'wyoming-llc formation',
      'delaware-ccorp formation',
      'non-US founders needing US entity + EIN',
      'tokeniz referral clients',
    ],
    notFor: [
      'complex multi-member structures with bespoke legal needs',
      'VC-fundable startups needing full legal counsel',
    ],
    url: 'https://register.fileforms.com/partner-file-now-cta-v2/?REFERRALCODE=recM4mmc9COERzwg5',
    referralCode: 'recM4mmc9COERzwg5',
    referralUrl: 'https://register.fileforms.com/partner-file-now-cta-v2/?REFERRALCODE=recM4mmc9COERzwg5',
    notes: 'Companiz referral partner. Includes LLC/Corp formation, EIN, registered agent (year 1), and operating agreement template. 100% compliance guaranteed. Filed in 10 business days or less. User pays Fileforms directly via referral link — no Companiz fee.',
    compliance: {
      kycRequired: false,
      passportRequired: false,
      usAddressProvided: true,
      einIncluded: 'included',
    },
  },
};

// ─────────────────────────────────────────────────────────────
// FINTECH PARTNERS
// ─────────────────────────────────────────────────────────────

const FINTECH = {

  mercury: {
    id: 'mercury',
    name: 'Mercury',
    type: 'fintech',
    tagline: 'Best USD bank account for US-incorporated startups',
    accountType: 'US business bank account (FDIC insured)',
    currencies: ['USD'],
    entityTypes: ['llc', 'c-corp', 's-corp', 'us-incorporated'],
    requiresUSEntity: true,
    requiresEIN: true,
    requiresUSAddress: true, // Registered agent address accepted
    // Prohibited: owners/directors residing in these countries cannot open accounts
    prohibitedOwnerCountries: [
      'belarus', 'burundi', 'central african republic', 'cuba',
      'democratic republic of congo', 'drc', 'iran', 'iraq', 'lebanon',
      'liberia', 'libya', 'nicaragua', 'north korea', 'nigeria', 'pakistan',
      'philippines', 'somalia', 'south sudan', 'sudan', 'syria',
      'ukraine', 'venezuela', 'yemen', 'zimbabwe', 'croatia',
    ],
    pricing: {
      basic: 'Free (no monthly fee)',
      treasury: 'Mercury Treasury available for cash management',
      wire_domestic: '$0 incoming, $5 outgoing',
      wire_international: '$0 incoming, $20–25 outgoing',
    },
    requirements: [
      'US-incorporated business (LLC or C-Corp)',
      'EIN from IRS (mandatory)',
      'US registered address (registered agent OK)',
      'Valid passport or government ID (each owner 25%+)',
      'Certificate of formation/incorporation',
      'Company operating agreement or bylaws',
    ],
    features: [
      'FDIC insured up to $5M (via partner banks)',
      'Virtual + physical Visa debit cards',
      'ACH transfers (free)',
      'Domestic + international wires',
      'Mercury Treasury (yield on cash)',
      'API access',
      'Integrates with QuickBooks, Stripe, Gusto',
    ],
    approvalTimeline: '1–3 business days (can be faster)',
    bestFor: [
      'US startups',
      'SaaS companies',
      'USD-primary businesses',
      'founders who need free USD checking',
      'VC-backed companies',
    ],
    notFor: [
      'founders from prohibited countries',
      'businesses needing multi-currency accounts',
      'non-US entities',
    ],
    url: 'https://mercury.com',
    referralCode: null,
    notes: 'De-facto standard for US startups. No fees, good UX, integrates with startup stack. Has been tightening country restrictions — always verify current prohibited list.',
  },

  airwallex: {
    id: 'airwallex',
    name: 'Airwallex',
    type: 'fintech',
    tagline: 'Best for global multi-currency payments and FX',
    accountType: 'Multi-currency business account',
    currencies: ['USD', 'EUR', 'GBP', 'AUD', 'SGD', 'HKD', 'JPY', '150+ more'],
    entityTypes: ['any-registered-business'],
    requiresUSEntity: false, // Can register from 56 countries
    requiresEIN: false,
    requiresUSAddress: false,
    // Company must be REGISTERED in one of these 56 countries
    supportedRegistrationCountries: [
      'australia', 'austria', 'belgium', 'brazil', 'bulgaria', 'canada',
      'cayman islands', 'china', 'costa rica', 'croatia', 'cyprus', 'czech republic',
      'denmark', 'estonia', 'fiji', 'finland', 'france', 'germany', 'gibraltar',
      'greece', 'guadeloupe', 'hong kong', 'hungary', 'iceland', 'india',
      'indonesia', 'ireland', 'isle of man', 'israel', 'italy', 'japan',
      'south korea', 'latvia', 'liechtenstein', 'lithuania', 'luxembourg',
      'macau', 'malaysia', 'malta', 'marshall islands', 'martinique', 'mexico',
      'netherlands', 'new zealand', 'norway', 'philippines', 'poland', 'portugal',
      'puerto rico', 'romania', 'samoa', 'seychelles', 'singapore', 'slovakia',
      'slovenia', 'spain', 'sweden', 'switzerland', 'taiwan', 'thailand',
      'united kingdom', 'united states',
    ],
    prohibitedOwnerCountries: [
      'russia', 'belarus',
      ...OFAC_COUNTRIES,
    ],
    pricing: {
      basic: 'Free to open',
      fx: '0.5%–1% FX conversion fee',
      local_transfers: 'Free in many corridors',
      swift_transfers: '$10–25 per transfer',
      cards: 'Free virtual cards, physical card fee varies',
    },
    requirements: [
      'Business registered in supported country (56 countries)',
      'Certificate of incorporation',
      'Valid ID/passport for directors and beneficial owners',
      'Proof of business address',
      'Business description and transaction volume',
      'Source of funds declaration',
    ],
    features: [
      'Multi-currency accounts (USD, EUR, GBP, AUD, SGD, HKD +)',
      'International transfers in 150+ countries',
      'Physical + virtual corporate cards',
      'FX at competitive rates',
      'Batch payments',
      'Xero / QuickBooks integration',
      'API for payment automation',
      'Payout to 150+ countries',
    ],
    approvalTimeline: '1–5 business days',
    bestFor: [
      'global e-commerce',
      'cross-border payments',
      'multi-currency operations',
      'asia-pacific businesses',
      'businesses receiving/paying in multiple currencies',
      'marketplaces and platforms',
    ],
    notFor: [
      'purely USD-focused US companies (Mercury better)',
      'companies needing US FDIC insurance',
    ],
    url: 'https://airwallex.com',
    referralCode: null,
    notes: 'Strongest option for multi-currency and Asia-Pacific. Competitive FX rates. Company registration country matters — not just where founders live.',
  },

  mercury_revolut_us: {
    id: 'revolut-us',
    name: 'Revolut Business (US)',
    type: 'fintech',
    tagline: 'Multi-currency account for US-incorporated businesses',
    accountType: 'Multi-currency business account (US)',
    currencies: ['USD', 'EUR', 'GBP', 'and 25+ more'],
    entityTypes: ['llc', 'c-corp', 'us-incorporated'],
    requiresUSEntity: true,
    requiresEIN: false, // Not explicitly required but recommended
    requiresUSAddress: true, // Must have US presence/address
    // Owner/applicant must reside in one of these countries
    eligibleApplicantCountries: [
      'united states', 'united kingdom', 'australia', 'canada', 'singapore',
      'india', 'brazil', 'israel', 'japan', 'mexico', 'new zealand',
      'switzerland', 'united arab emirates', 'uae',
      // EEA countries (Bulgaria excluded for US)
      'germany', 'france', 'spain', 'italy', 'netherlands', 'sweden',
      'norway', 'denmark', 'finland', 'austria', 'belgium', 'ireland',
      'poland', 'czech republic', 'portugal', 'greece', 'hungary', 'romania',
      'slovakia', 'croatia', 'estonia', 'latvia', 'lithuania', 'luxembourg',
      'malta', 'cyprus',
    ],
    prohibitedOwnerCountries: [
      ...OFAC_COUNTRIES,
      'russia', 'belarus',
    ],
    pricing: {
      basic: 'Free plan available',
      grow: '$39.99/mo',
      scale: '$79.99/mo',
      enterprise: 'Custom',
    },
    requirements: [
      'US-incorporated company (active registration)',
      'Certificate of incorporation',
      'Proof of US physical presence',
      'Valid ID/passport for applicant and beneficial owners',
      'Video selfie verification',
      'Business activity description',
    ],
    features: [
      'USD + EUR + GBP + 25 currencies',
      'Local US account details (ACH/wire)',
      'International transfers',
      'Corporate cards (virtual + physical)',
      'Expense management',
      'FX at interbank rates (on paid plans)',
    ],
    approvalTimeline: '1–5 business days',
    bestFor: [
      'EU/UK founders with US entities',
      'multi-currency operations with US base',
      'businesses with European connections',
      'corporate expense management',
    ],
    notFor: [
      'founders outside eligible applicant countries',
      'non-US entities',
      'companies needing FDIC insurance',
    ],
    url: 'https://revolut.com/business',
    referralCode: null,
    notes: 'Revolut Business requires company registered in EEA, UK, CH, US, AU, or SG. Applicant must also reside in a supported country. Charities, public sector, cooperatives, and sole traders excluded. Good for European/UK founders who formed a US company.',
  },

  revolut_sg: {
    id: 'revolut-sg',
    name: 'Revolut Business (Singapore)',
    type: 'fintech',
    tagline: 'Multi-currency account for Singapore-incorporated businesses',
    accountType: 'Multi-currency business account (SG)',
    currencies: ['SGD', 'USD', 'EUR', 'GBP', 'and 25+ more'],
    entityTypes: ['private-limited', 'sg-incorporated'],
    requiresSGEntity: true,
    requiresUSEntity: false,
    // Applicant residence requirement
    eligibleApplicantCountries: [
      'singapore', 'united kingdom', 'united states', 'australia', 'canada',
      'india', 'brazil', 'israel', 'japan', 'mexico', 'new zealand',
      'switzerland', 'united arab emirates',
      'germany', 'france', 'spain', 'italy', 'netherlands', 'sweden',
    ],
    prohibitedOwnerCountries: [
      ...OFAC_COUNTRIES,
      'russia', 'belarus',
    ],
    pricing: {
      basic: 'Free plan (SGD)',
      professional: 'SGD 35/mo',
      ultimate: 'SGD 79/mo',
    },
    requirements: [
      'Singapore-registered company (Pte. Ltd.)',
      'Certificate of incorporation (ACRA)',
      'Valid ID/passport',
      'Business address in Singapore',
      'Business description',
    ],
    features: [
      'SGD, USD, EUR, GBP accounts',
      'Local SGD FAST transfers',
      'International SWIFT/SEPA',
      'Corporate cards',
      'Multi-currency FX',
    ],
    approvalTimeline: '2–5 business days',
    bestFor: [
      'singapore-incorporated businesses',
      'asia-pacific trade and operations',
      'SGD + multi-currency needs',
    ],
    notFor: [
      'non-SG entities',
      'applicants outside eligible countries',
    ],
    url: 'https://revolut.com/sg/business',
    referralCode: null,
    notes: 'Requires company to be properly registered in Singapore. Good for SG Pte. Ltd. with international operations.',
  },

  aspire: {
    id: 'aspire',
    name: 'Aspire',
    type: 'fintech',
    tagline: 'All-in-one finance platform for growing businesses in APAC and beyond',
    accountType: 'Multi-currency business account + corporate cards + expense management',
    currencies: ['SGD', 'USD', 'EUR', 'GBP', 'HKD', 'AUD', '16 currencies total'],
    entityTypes: ['any-registered-business-in-supported-countries'],
    requiresUSEntity: false,
    requiresEIN: false,
    // Supported registration countries (expanded 2025-2026)
    supportedRegistrationCountries: [
      'singapore', 'hong kong', 'australia', 'united states',
      'indonesia', 'india', 'malaysia', 'philippines', 'south korea',
      'sri lanka', 'taiwan', 'thailand', 'vietnam', 'mongolia',
      'maldives', 'china',
    ],
    pricing: {
      basic: 'Free account',
      premium: 'From SGD 50/mo',
    },
    requirements: [
      'Company registered in a supported country',
      'Certificate of incorporation',
      'Valid ID/passport for directors',
      'Business address',
    ],
    features: [
      'Multi-currency accounts (16 currencies)',
      'Corporate cards (virtual + physical)',
      'Expense management',
      'Bill payments and payouts',
      'Accounting integration (Xero, QBO)',
      'Credit lines available',
    ],
    approvalTimeline: '1-3 business days',
    bestFor: [
      'singapore-incorporated businesses',
      'hong-kong businesses',
      'APAC operations',
      'US entities with APAC connections',
      'spend management',
    ],
    notFor: [
      'companies outside supported registration countries',
      'pure EU/UK businesses (use Revolut instead)',
    ],
    url: 'https://aspireapp.com',
    referralCode: null,
    notes: 'Expanded significantly in 2025-2026. Now supports US entities. Strong for APAC businesses. Recently secured AU, EU, and US licenses for global rollout.',
  },

  elephants: {
    id: 'elephants',
    name: 'Elephants Inc.',
    type: 'fintech',
    tagline: 'Smart spend management + corporate card platform for SMEs',
    accountType: 'Corporate spend account + multi-currency card',
    currencies: ['USD', 'multi-currency card'],
    entityTypes: ['any-business'],
    requiresUSEntity: false,
    requiresEIN: false,
    // Based on public info — invite/referral based onboarding
    supportedCountries: 'global (referral-based)',
    // Exclude known OFAC restricted + Singapore, UK, China per earlier research
    excludedCountries: [
      ...OFAC_COUNTRIES,
      'singapore', 'united states', 'us', 'united kingdom', 'uk',
      'china', 'myanmar', 'burma',
    ],
    pricing: {
      account: 'Invite/referral only — pricing TBC via partner',
      cards: 'Virtual + physical corporate cards',
    },
    requirements: [
      'Valid passport',
      'Business registration documents',
      'Referral code: PROPEX',
      'KYC verification (standard)',
      'Source of funds declaration',
    ],
    features: [
      'Virtual + physical multi-currency corporate cards',
      'Real-time spend visibility and controls',
      'Employee card issuance',
      'Spend limits and approval workflows',
      'Receipt capture',
      'Global card acceptance (Visa/Mastercard network)',
      'Expense reporting',
    ],
    approvalTimeline: '2–5 business days',
    bestFor: [
      'SMEs needing corporate expense management',
      'multi-currency card spending',
      'teams needing employee cards',
      'any entity type',
      'founders needing spend control',
    ],
    notFor: [
      'US residents',
      'UK residents',
      'Singapore residents',
      'primary banking account (this is a spend/card product)',
    ],
    url: 'https://elephants.inc',
    referralCode: 'PROPEX',
    notes: 'This is a SPEND MANAGEMENT platform, not a primary bank. Best used alongside a primary USD or multi-currency account. Access via Companiz referral PROPEX. IMPORTANT: Do NOT use the words "bank", "banking", "deposit", or "savings" when describing Elephants to users.',
  },
};

// ─────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────

module.exports = { CORPSEC, FINTECH, OFAC_COUNTRIES };
