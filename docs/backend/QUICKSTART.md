# Quick Start - 5 Minute Setup

Get the Tatame backend running in 5 minutes.

---

## Prerequisites

- Node.js 18+
- pnpm installed
- Stripe test account
- Clerk account
- Supabase project

---

## Step 1: Install Dependencies (30 seconds)

```bash
cd /path/to/tatame-monorepo
pnpm install
```

---

## Step 2: Set Environment Variables (2 minutes)

```bash
cd apps/server
cp .env.example .env
```

Edit `.env` and fill in these **required** values:

```bash
# Get from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE

# Get from https://dashboard.clerk.com
CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE

# Get from https://app.supabase.com/project/_/settings/api
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# Set to your frontend URL
CORS_ORIGIN=http://localhost:3001

# Leave as-is for now (webhook setup comes later)
STRIPE_WEBHOOK_SECRET=whsec_PLACEHOLDER
```

---

## Step 3: Create Supabase Tables (1 minute)

1. Open Supabase SQL Editor: https://app.supabase.com/project/_/sql
2. Copy the **entire contents** of `docs/backend/supabase-migrations.sql`
3. Paste and click "Run"
4. Verify success (should see "Success. No rows returned")

---

## Step 4: Start Server (10 seconds)

```bash
pnpm dev
```

You should see:
```
Server is running on http://localhost:3000
```

---

## Step 5: Test It Works (30 seconds)

### Test health check (public):

```bash
curl http://localhost:3000/
```

Expected: `OK`

### Test API with authentication:

**Get a Clerk token:**
1. Open your frontend app (if running)
2. Open browser DevTools → Console
3. Run: `await window.Clerk.session.getToken()`
4. Copy the token

**Test products endpoint:**

```bash
curl http://localhost:3000/stripe/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: `{"data":[],"count":0}` (empty if no products in Stripe yet)

---

## ✅ You're Done!

Server is running and ready to use.

### Next Steps:

1. **Add products in Stripe:**
   - Go to: https://dashboard.stripe.com/test/products
   - Create a product with a price
   - Call `GET /stripe/products` again

2. **Set up webhooks (optional for now):**
   - See [07-webhook-setup-guide.md](./07-webhook-setup-guide.md)
   - For local testing: `stripe listen --forward-to localhost:3000/webhooks/stripe`

3. **Test customer creation:**
   ```bash
   curl -X POST http://localhost:3000/stripe/customer \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User"}'
   ```

---

## Common Issues

### "Invalid environment variables"
→ Check all required vars are in `.env` (no typos, no spaces)

### "Server won't start"
→ Make sure port 3000 is free: `lsof -ti:3000 | xargs kill -9`

### "401 Unauthorized"
→ Make sure you're sending the Clerk token in Authorization header

### "Supabase error"
→ Verify you ran the migrations and credentials are correct

**Full troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## Documentation

- 📖 [Full Documentation](./README.md) - Complete documentation index
- 🚀 [Implementation Checklist](./IMPLEMENTATION-CHECKLIST.md) - Detailed setup
- 📚 [API Reference](./API-REFERENCE.md) - All endpoints
- ❓ [FAQ](./FAQ.md) - Common questions

---

**Ready to build!** 🚀
