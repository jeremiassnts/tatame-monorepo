# Implementation Checklist - Phase 4 (Webhooks)

**Status:** ✅ Phase 4 Complete  
**Date:** 2026-02-05

---

## ✅ Completed (Automated)

The following items have been implemented in the codebase:

### 1. Environment Configuration
- [x] Added `STRIPE_WEBHOOK_SECRET` to `packages/env/src/server.ts`
- [x] Updated `.env.example` with webhook secret documentation

### 2. Services Layer
- [x] Created `apps/server/src/services/webhooks/index.ts` with event handlers:
  - Customer events: `created`, `updated`, `deleted`
  - Subscription events: `created`, `updated`, `deleted`
  - Payment events: `invoice.payment_succeeded`, `invoice.payment_failed`
  - Checkout events: `session.completed`, `session.expired`
- [x] Extended `apps/server/src/services/supabase/index.ts` with webhook idempotency methods:
  - `isWebhookEventProcessed()`
  - `markWebhookEventProcessed()`
- [x] Extended `apps/server/src/services/stripe/index.ts` to expose Stripe instance for webhook verification

### 3. Routes
- [x] Created `apps/server/src/routes/webhooks.ts` with `POST /webhooks/stripe` endpoint
- [x] Implemented Stripe signature verification
- [x] Implemented idempotency check before processing
- [x] Added proper error handling and logging

### 4. Application Configuration
- [x] Updated `apps/server/src/index.ts`:
  - Configured raw body parsing for webhook route
  - Mounted webhook routes before JSON parser
  - Ensured webhook bypasses Clerk authentication
  - Maintained signature-based security

### 5. Documentation
- [x] Updated `docs/backend/00-backend-development-roadmap.md`:
  - Marked Phase 4 as complete
  - Added Phase 4 implementation summary
  - Updated document version
- [x] Created `docs/backend/07-webhook-setup-guide.md`:
  - Step-by-step webhook configuration guide
  - Supabase table creation instructions
  - Stripe Dashboard setup
  - Local development setup (ngrok/Stripe CLI)
  - Testing procedures
  - Security best practices
- [x] Created `docs/backend/README.md`:
  - Navigation guide for all documentation
  - Implementation status overview
  - Quick links and resources
- [x] Created `docs/backend/supabase-migrations.sql`:
  - Complete SQL migrations for Supabase
  - Includes both customer mapping and webhook events tables
  - Verification queries included
- [x] Created `docs/backend/IMPLEMENTATION-CHECKLIST.md` (this file)

---

## 🔧 Manual Setup Required

You need to complete these steps manually:

### 1. Database Setup (Supabase) ⚠️ REQUIRED

Execute the SQL migrations in your Supabase project:

1. Open Supabase SQL Editor: https://app.supabase.com/project/_/sql
2. Copy the contents of `docs/backend/supabase-migrations.sql`
3. Execute the SQL to create:
   - `stripe_webhook_events` table (for webhook idempotency)
   - Indexes for performance
4. Verify tables were created successfully

**Required tables:**
- `stripe_customer_mapping` (should already exist from Phase 3)
- `stripe_webhook_events` (NEW - required for Phase 4)

### 2. Environment Variables ⚠️ REQUIRED

Add the following to your `.env` file:

```bash
# Stripe Webhook Secret
# Get from: https://dashboard.stripe.com/test/webhooks
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Stripe Dashboard Configuration ⚠️ REQUIRED

Configure webhook endpoint in Stripe Dashboard:

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter webhook URL:
   - **Local dev:** Use ngrok or Stripe CLI (see guide)
   - **Production:** `https://your-domain.com/webhooks/stripe`
4. Select events to listen for (see guide for full list)
5. Copy the signing secret (starts with `whsec_`)
6. Add to `.env` as `STRIPE_WEBHOOK_SECRET`

### 4. Local Development Setup (Optional)

For local testing, choose one:

**Option A: ngrok**
```bash
# Terminal 1: Start server
pnpm dev

# Terminal 2: Start ngrok
ngrok http 3000
# Use ngrok URL in Stripe Dashboard
```

**Option B: Stripe CLI**
```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
# Use webhook secret from CLI output
```

### 5. Testing (Recommended)

Test the webhook implementation:

```bash
# Send test event with Stripe CLI
stripe trigger customer.created

# Or resend from Stripe Dashboard:
# 1. Go to Webhooks → Your endpoint
# 2. Click on an event
# 3. Click "..." → "Resend event"
```

Verify in server logs:
- ✅ Event received
- ✅ Signature verified
- ✅ Event processed
- ✅ Event marked as processed in Supabase

---

## 📋 Validation Checklist

Before considering Phase 4 complete, verify:

- [ ] `stripe_webhook_events` table exists in Supabase
- [ ] `STRIPE_WEBHOOK_SECRET` is set in `.env`
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Server starts without env validation errors
- [ ] Webhook receives events from Stripe (test with CLI or Dashboard)
- [ ] Signature verification works (check logs)
- [ ] Events are processed successfully (check logs)
- [ ] Events are stored in `stripe_webhook_events` table
- [ ] Duplicate events return `duplicate: true` (idempotency works)
- [ ] No sensitive data logged (PII, secrets, full payloads)

---

## 🚀 Next Steps (Phase 5 - Not Automated)

Phase 5 (Supabase → Postgres migration) is **NOT automated** and requires manual planning:

1. Review `docs/backend/04-supabase-coexistence-strategy.md` for migration checklist
2. Plan data migration strategy (export/import, ETL, dual-write, etc.)
3. Design Drizzle schema in `packages/db/src/schema/`
4. Implement data migration scripts
5. Test migration in staging environment
6. Execute cutover with rollback plan

**Note:** Phase 5 is out of scope for automated implementation.

---

## 📚 Reference Documentation

- **Setup Guide:** [docs/backend/07-webhook-setup-guide.md](./07-webhook-setup-guide.md)
- **SQL Migrations:** [docs/backend/supabase-migrations.sql](./supabase-migrations.sql)
- **Roadmap:** [docs/backend/00-backend-development-roadmap.md](./00-backend-development-roadmap.md)
- **Security:** [docs/backend/05-security-and-best-practices.md](./05-security-and-best-practices.md)
- **Execution Templates:** [docs/backend/06-execution-templates.md](./06-execution-templates.md)

---

## ⚠️ Important Notes

1. **No commit was created** as requested
2. **Supabase migration SQL provided** but not executed (manual execution required)
3. **Webhook secret required** - get from Stripe Dashboard after creating endpoint
4. **Local testing requires tunneling** - use ngrok or Stripe CLI
5. **Phase 5 not implemented** - migration to Postgres requires manual planning

---

## 🆘 Troubleshooting

If you encounter issues:

1. **Server won't start:**
   - Check `STRIPE_WEBHOOK_SECRET` is set in `.env`
   - Verify all other env vars are present

2. **Webhook signature fails:**
   - Verify webhook secret matches Stripe Dashboard
   - Ensure raw body parsing is working (check middleware order)

3. **Events not received:**
   - Check webhook URL is public and reachable
   - Verify firewall/CORS settings
   - Check Stripe Dashboard event log for delivery status

4. **Database errors:**
   - Ensure `stripe_webhook_events` table exists
   - Check Supabase credentials are correct
   - Verify table structure matches schema

For detailed troubleshooting, see [07-webhook-setup-guide.md](./07-webhook-setup-guide.md) section 6.

---

## ✅ Summary

**What was automated:**
- ✅ Code implementation (routes, services, middleware)
- ✅ TypeScript types and interfaces
- ✅ Environment variable schema
- ✅ Comprehensive documentation
- ✅ SQL migration scripts

**What needs manual setup:**
- ⚠️ Execute SQL migrations in Supabase
- ⚠️ Configure webhook in Stripe Dashboard
- ⚠️ Add `STRIPE_WEBHOOK_SECRET` to `.env`
- ⚠️ Test webhook integration

**Estimated manual setup time:** 15-30 minutes

---

**Phase 4 implementation is complete. Ready for manual setup and testing!**
