const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = require('../config');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─────────────────────────────────────────────────────────────
// SESSION MANAGEMENT
// ─────────────────────────────────────────────────────────────

async function getOrCreateSession(phone, name) {
  const { data, error } = await supabase
    .from('wa_sessions')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (data) return data;

  const { data: newSession, error: insertErr } = await supabase
    .from('wa_sessions')
    .insert({ phone, name: name || phone, state: 'WELCOME', data: {} })
    .select()
    .single();

  if (insertErr) throw insertErr;
  return newSession;
}

async function updateSession(phone, { state, data }) {
  const updates = {};
  if (state !== undefined) updates.state = state;
  if (data !== undefined) updates.data = data;

  const { error } = await supabase.from('wa_sessions').update(updates).eq('phone', phone);
  if (error) throw error;
}

async function mergeSessionData(phone, newFields) {
  const session = await getOrCreateSession(phone);
  const merged = { ...session.data, ...newFields };
  await updateSession(phone, { data: merged });
  return merged;
}

async function resetSession(phone) {
  const { error } = await supabase
    .from('wa_sessions')
    .update({ state: 'WELCOME', data: {} })
    .eq('phone', phone);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────
// APPLICATION SUBMISSION
// ─────────────────────────────────────────────────────────────

async function saveApplication(phone, data) {
  const match = data.match_result || {};

  const { error } = await supabase.from('wa_applications').insert({
    phone,
    status: 'pending',

    // Profile (user_name from platform, no email collected in chat)
    user_name: data.user_name || null,
    country: data.country,
    entity_preference: data.entity_preference,
    business_type: data.business_type,
    banking_need: data.banking_need,
    has_us_persons: data.has_us_persons || false,

    // Matched partners
    matched_corpsec: match.top_corpsec || null,
    matched_corpsec_2: match.top_corpsec_2 || null,
    matched_fintech: match.top_fintech || null,
    matched_fintech_2: match.top_fintech_2 || null,

    // Formation
    company_name_1: data.company_name_1,
    company_name_2: data.company_name_2,
    company_name_3: data.company_name_3,
    business_purpose: data.business_purpose,
    ein_required: data.ein_required === true,

    // KYC
    date_of_birth: data.date_of_birth,
    passport_number: data.passport_number,
    passport_expiry: data.passport_expiry,
    residential_address: data.residential_address,
    source_of_funds: data.source_of_funds,

    // Elephants financial account
    elephants_opted_in: data.elephants_opted_in || false,
  });

  if (error) throw error;
}

module.exports = { getOrCreateSession, updateSession, mergeSessionData, resetSession, saveApplication };
