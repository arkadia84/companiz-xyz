require('dotenv').config();

module.exports = {
  // WhatsApp Cloud API (Meta)
  WA_TOKEN: process.env.WA_TOKEN,               // Bearer token from Meta App Dashboard
  WA_PHONE_NUMBER_ID: process.env.WA_PHONE_NUMBER_ID, // Your WA phone number ID
  WA_VERIFY_TOKEN: process.env.WA_VERIFY_TOKEN, // Any secret string you define for webhook verification

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY, // Use service_role key (not anon)

  // App
  PORT: process.env.PORT || 3000,

  // Elephants referral
  ELEPHANTS_REFERRAL_CODE: 'PROPEX',

  // Notification (optional: your WA number to receive submission alerts)
  ADMIN_PHONE: process.env.ADMIN_PHONE, // e.g. "6512345678" (no + prefix)
};
