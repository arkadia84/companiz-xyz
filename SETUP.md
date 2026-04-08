# Companiz WA Agent — Setup & Deployment Guide

## What this agent does

For every user who purchased **Offer B (Guided Launch, $497)**, this WhatsApp bot:
1. Walks them through 9 questions to collect Wyoming Series LLC formation data
2. Walks them through 5 questions to collect Elephants financial account data
3. Saves the complete application to your Supabase `wa_applications` table
4. Sends you an admin alert on WhatsApp (optional)

---

## Prerequisites

- A **Meta Business Account** (free) — to access WhatsApp Cloud API
- A **WhatsApp Business phone number** — can be a fresh number (Twilio SIM, local SIM)
- Your existing **Supabase** project (`app-tokeniz-ai`)
- A deployment host — **Railway** (recommended, free tier available)

---

## Step 1 — Set up WhatsApp Cloud API on Meta

1. Go to [developers.facebook.com](https://developers.facebook.com) → Create App → Business
2. Add the **WhatsApp** product
3. Go to **WhatsApp → API Setup**
4. Copy:
   - `Access Token` → `WA_TOKEN` in your `.env`
   - `Phone Number ID` → `WA_PHONE_NUMBER_ID` in your `.env`

> For production, generate a **permanent System User Token** via Business Settings → System Users

---

## Step 2 — Set up Supabase tables

1. Open your Supabase project → **SQL Editor**
2. Paste the contents of `db/migration.sql` and run it
3. Copy your **service_role** key from Settings → API → `SUPABASE_SERVICE_KEY`

---

## Step 3 — Configure environment variables

```bash
cp .env.example .env
# Fill in all values in .env
```

---

## Step 4 — Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway init

# Add environment variables (or paste in Railway dashboard)
railway variables set WA_TOKEN=xxx WA_PHONE_NUMBER_ID=xxx ...

# Deploy
railway up
```

Your webhook URL will be: `https://your-project.railway.app/webhook`

**Alternatively**, deploy to **Render** (free), **Fly.io**, or any VPS.

---

## Step 5 — Register the Webhook with Meta

1. Go to your Meta App Dashboard → **WhatsApp → Configuration → Webhook**
2. Set Callback URL: `https://your-domain.com/webhook`
3. Set Verify Token: the value of `WA_VERIFY_TOKEN` in your `.env`
4. Click **Verify and Save**
5. Subscribe to: `messages`

---

## Step 6 — Test it

Send a WhatsApp message to your business number from any phone.

The bot will immediately reply with the welcome message and walk through the full flow.

**Test commands:**
- Send any message → starts the flow
- Send `RESTART` at any point → resets to the beginning

---

## Conversation Flow Map

```
WELCOME
  ↓ (user replies YES)
CONFIRM_START
  ↓
COLLECT_LEGAL_NAME → COLLECT_EMAIL → COLLECT_COUNTRY
  ↓
COLLECT_COMPANY_NAME_1 → _2 → _3
  ↓
COLLECT_BUSINESS_PURPOSE → COLLECT_EIN
  ↓
CONFIRM_FORMATION (summary + confirm/edit)
  ↓
ELEPHANTS_INTRO
  ↓
COLLECT_DOB → COLLECT_PASSPORT_NUMBER → COLLECT_PASSPORT_EXPIRY
  ↓
COLLECT_RESIDENTIAL_ADDRESS → COLLECT_SOURCE_OF_FUNDS
  ↓
CONFIRM_ELEPHANTS (summary + confirm/edit)
  ↓
SUBMITTING (auto) → saves to Supabase → admin alert
  ↓
COMPLETE
```

---

## Monitoring Applications

Go to your Supabase dashboard → **Table Editor** → `wa_applications`

Each row contains all formation and financial account data for one user.

**Status values:**
- `pending` — just submitted, awaiting your manual processing
- `processing` — update manually when you start working on it
- `complete` — update manually when done

---

## Compliance Notes

Per Elephants affiliate agreement, the bot **never uses**: "bank", "banking", "deposit", "savings"

Approved copy uses: "financial account", "global account", "spend account", "multi-currency card"

**Excluded markets** (users from these countries will be warned): Singapore, USA, UK, China, Russia, Iran, North Korea, Myanmar

---

## Adding Telegram Support (Future)

The architecture is designed to be channel-agnostic. To add Telegram:
1. Create `services/telegram.js` mirroring the WA service
2. Add a `/telegram-webhook` route in `index.js`
3. Use the same `handleMessage()` from `bot.js`

No changes to the flow logic required.

---

## Local Development

```bash
npm install
cp .env.example .env    # fill in values
npx ngrok http 3000     # expose local port
# Use the ngrok URL as your webhook in Meta dashboard
npm run dev
```
