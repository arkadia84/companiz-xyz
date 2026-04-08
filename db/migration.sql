-- ============================================================
-- Companiz WA Agent — Supabase Schema v3
-- Run this in your Supabase SQL editor
-- ============================================================

-- Session state per WhatsApp user
CREATE TABLE IF NOT EXISTS wa_sessions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone       TEXT UNIQUE NOT NULL,
  name        TEXT,
  state       TEXT NOT NULL DEFAULT 'WELCOME',
  data        JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_sessions_phone ON wa_sessions(phone);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wa_sessions_updated_at ON wa_sessions;
CREATE TRIGGER wa_sessions_updated_at
  BEFORE UPDATE ON wa_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Full applications (partner-matched, multi-provider)
CREATE TABLE IF NOT EXISTS wa_applications (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone                 TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending',

  -- Profile
  user_name             TEXT,   -- from Telegram/WhatsApp profile (not formal legal name)
  country               TEXT,
  entity_preference     TEXT,   -- wyoming-llc | delaware-llc | c-corp | singapore | uk | hong-kong
  business_type         TEXT,   -- ecommerce | saas | real-estate | holding | consulting | other
  banking_need          TEXT,   -- usd | multi-currency | corporate-card | international-transfers | all
  has_us_persons        BOOLEAN DEFAULT FALSE,

  -- Matched partners
  matched_corpsec       TEXT,   -- e.g. 'doola', 'fileform', 'osome', etc.
  matched_corpsec_2     TEXT,
  matched_fintech       TEXT,   -- e.g. 'mercury', 'airwallex', 'revolut-us', 'elephants'
  matched_fintech_2     TEXT,

  -- Company formation data
  company_name_1        TEXT,
  company_name_2        TEXT,
  company_name_3        TEXT,
  business_purpose      TEXT,
  ein_required          BOOLEAN DEFAULT FALSE,

  -- KYC / Identity data (for financial account applications)
  date_of_birth         TEXT,
  passport_number       TEXT,
  passport_expiry       TEXT,
  residential_address   TEXT,
  source_of_funds       TEXT,

  -- Elephants financial account
  elephants_opted_in    BOOLEAN DEFAULT FALSE,

  -- Meta
  submitted_at          TIMESTAMPTZ DEFAULT NOW(),
  processed_at          TIMESTAMPTZ,
  notes                 TEXT
);

CREATE INDEX IF NOT EXISTS idx_wa_applications_phone  ON wa_applications(phone);
CREATE INDEX IF NOT EXISTS idx_wa_applications_status ON wa_applications(status);
CREATE INDEX IF NOT EXISTS idx_wa_applications_entity ON wa_applications(entity_preference);
CREATE INDEX IF NOT EXISTS idx_wa_applications_corpsec ON wa_applications(matched_corpsec);

-- Enable Row Level Security
ALTER TABLE wa_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_applications ENABLE ROW LEVEL SECURITY;
-- Your Node.js server uses service_role key, which bypasses RLS automatically.
