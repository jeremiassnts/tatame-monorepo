# Frequently Asked Questions (FAQ)

**Version:** 1.0  
**Last updated:** 2026-02-05

Common questions about the Tatame backend implementation.

---

## General Questions

### Q: What is this backend for?

**A:** This is a Node.js (Express) backend that integrates Stripe for payment processing, Clerk for authentication, and Supabase for data storage. It powers the Tatame application (web and mobile) with subscription management, customer handling, and webhook processing.

### Q: What phases have been completed?

**A:** Phases 0-4 are complete:
- ✅ Phase 0: Analysis & planning
- ✅ Phase 1: Stripe setup (products, prices)
- ✅ Phase 2: Clerk authentication
- ✅ Phase 3: Supabase integration
- ✅ Phase 4: Stripe webhooks

Phase 5 (Postgres migration) is planned but not executed.

### Q: Is this production-ready?

**A:** Yes, with manual setup:
1. Create Supabase tables (run migrations)
2. Configure Stripe webhook
3. Set all environment variables
4. Deploy to hosting platform

See [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md) for details.

---

## Setup Questions

### Q: What environment variables do I need?

**A:** Required variables:

```bash
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
```

See `apps/server/.env.example` for complete list with descriptions.

### Q: How do I get the Stripe webhook secret?

**A:** 

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://your-domain.com/webhooks/stripe`
4. After creating, click "Reveal" next to signing secret
5. Copy the secret (starts with `whsec_`)
6. Add to `.env` as `STRIPE_WEBHOOK_SECRET`

Full guide: [07-webhook-setup-guide.md](./07-webhook-setup-guide.md)

### Q: What Supabase tables do I need to create?

**A:** Two tables are required:

1. `stripe_customer_mapping` - Maps Clerk users to Stripe customers
2. `stripe_webhook_events` - Tracks processed webhook events

Run the SQL from `supabase-migrations.sql` to create them.

### Q: Can I test webhooks locally?

**A:** Yes, two options:

**Option 1: Stripe CLI (recommended)**
```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

**Option 2: ngrok**
```bash
ngrok http 3000
# Use ngrok URL in Stripe Dashboard
```

See [07-webhook-setup-guide.md](./07-webhook-setup-guide.md) section 4.

---

## Authentication Questions

### Q: How does authentication work?

**A:** 

1. User logs in with Clerk (frontend/mobile)
2. Clerk provides JWT token
3. Client sends token in `Authorization: Bearer <token>` header
4. Backend verifies token with Clerk
5. If valid, request proceeds; if not, returns 401

### Q: Do I need Clerk for all endpoints?

**A:** No:

- **Public:** `GET /` (health check)
- **Protected (Clerk JWT):** All `/stripe/*` routes
- **Webhook (Stripe signature):** `POST /webhooks/stripe`

### Q: How do I get a Clerk token for testing?

**A:** 

**For API testing:**
1. Login to your frontend
2. Open browser DevTools → Console
3. Run: `await window.Clerk.session.getToken()`
4. Copy the token

**For automated testing:**
- Use Clerk's test tokens
- Or create a test user and get token programmatically

### Q: Why do webhook requests not need Clerk authentication?

**A:** Webhooks come from Stripe, not from users. Authentication is done via Stripe signature verification instead of Clerk JWT.

---

## Stripe Questions

### Q: Do I need to create products in Stripe?

**A:** Yes. The backend fetches products from Stripe API. Create them in:
- Test mode: https://dashboard.stripe.com/test/products
- Live mode: https://dashboard.stripe.com/products

### Q: Can I use Stripe live mode for testing?

**A:** No, use test mode for development/staging:
- Test keys: `sk_test_...`, `pk_test_...`
- Live keys: `sk_live_...`, `pk_live_...`

Never use live keys in development.

### Q: What Stripe events does the backend handle?

**A:** Currently handles 11 event types:

- Customer: created, updated, deleted
- Subscription: created, updated, deleted
- Invoice: payment_succeeded, payment_failed
- Checkout: session.completed, session.expired

Unhandled events are logged but not processed.

### Q: Can I add custom webhook event handlers?

**A:** Yes, edit `apps/server/src/services/webhooks/index.ts`:

```typescript
case "your.custom.event":
  await this.handleCustomEvent(event);
  break;
```

Then implement the handler method.

---

## Database Questions

### Q: Why use Supabase instead of Postgres?

**A:** Historical reasons. The app was already using Supabase. Phase 5 will migrate to Postgres + Drizzle for better integration with the monorepo.

### Q: Can I skip Supabase and use Postgres now?

**A:** Not recommended. The current implementation is designed for Supabase. Wait for Phase 5 migration, or implement custom migration yourself.

### Q: What if I don't want to migrate to Postgres?

**A:** You can keep using Supabase indefinitely. The migration is optional and depends on your needs.

### Q: How is webhook idempotency ensured?

**A:** 

1. Before processing, check if `stripe_event_id` exists in `stripe_webhook_events` table
2. If exists, return success without reprocessing
3. If not, process event and insert event ID
4. UNIQUE constraint on `stripe_event_id` prevents duplicates

---

## Development Questions

### Q: How do I run the server locally?

**A:** 

```bash
# From monorepo root
pnpm dev --filter=server

# Or from apps/server
cd apps/server
pnpm dev
```

Server runs on `http://localhost:3000`

### Q: How do I test API endpoints?

**A:** 

Use the test script:
```bash
cd apps/server
./scripts/test-api.sh YOUR_CLERK_TOKEN
```

Or use curl/Postman with your Clerk token.

### Q: Can I use a different port?

**A:** Yes, modify `apps/server/src/index.ts`:

```typescript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Then run: `PORT=4000 pnpm dev`

### Q: Do I need Docker?

**A:** No, Docker is optional:
- Local dev: Use `pnpm dev` (no Docker needed)
- Production: Can deploy without Docker (Railway, Vercel, etc.)
- Only needed if you want containerized deployment

---

## Integration Questions

### Q: How does the frontend call the backend?

**A:** 

```typescript
// In your Next.js app
import { auth } from "@clerk/nextjs/server";

const { getToken } = auth();
const token = await getToken();

const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/products`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const data = await response.json();
```

### Q: How does the mobile app call the backend?

**A:** 

```typescript
// In your React Native app
import { useAuth } from "@clerk/clerk-expo";

const { getToken } = useAuth();
const token = await getToken();

const response = await fetch("https://api.your-domain.com/stripe/products", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const data = await response.json();
```

### Q: What if I'm not using Clerk?

**A:** You'll need to modify the authentication:
1. Remove Clerk middleware
2. Implement your own JWT verification
3. Update auth logic in `middleware/auth.ts`

Not recommended - Clerk integration is already built.

---

## Webhook Questions

### Q: What happens if webhook processing fails?

**A:** 

1. Backend returns 500 error to Stripe
2. Stripe automatically retries (exponential backoff)
3. Check Stripe Dashboard event log for failure details
4. Fix the issue in webhook handler
5. Stripe will retry automatically (up to 3 days)
6. Or manually resend from Dashboard

### Q: Can I replay failed webhook events?

**A:** Yes:

1. Go to Stripe Dashboard → Webhooks
2. Click your endpoint
3. Find the failed event
4. Click "..." → "Resend event"

The backend will process it if not already marked as processed.

### Q: How long are webhook events stored?

**A:** 

- **Stripe:** Events available for 30 days in Dashboard
- **Your database:** Stored permanently in `stripe_webhook_events`

Consider adding cleanup logic for old events (e.g., delete after 90 days).

### Q: What if webhook receives duplicate events?

**A:** The idempotency system handles this:

1. First event: Processed normally
2. Duplicate event: Returns `{ "received": true, "duplicate": true }`
3. No duplicate side effects occur

---

## Error Questions

### Q: Why do I get 401 errors?

**A:** Most common causes:

1. Missing Authorization header
2. Invalid Clerk token (expired, wrong environment)
3. Clerk credentials misconfigured
4. Token format incorrect (should be `Bearer <token>`)

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for solutions.

### Q: Why do I get CORS errors?

**A:** 

Check that `CORS_ORIGIN` matches your frontend URL exactly:

```bash
# Frontend runs on http://localhost:3001
CORS_ORIGIN=http://localhost:3001

# NOT: https://localhost:3001
# NOT: http://localhost:3001/
```

Restart server after changing.

### Q: What does "Payment service temporarily unavailable" mean?

**A:** The backend received an error from Stripe API. Common causes:

1. Invalid Stripe API key
2. Network issue connecting to Stripe
3. Stripe API is down (check https://status.stripe.com/)
4. Rate limited by Stripe

Check server logs for actual Stripe error.

---

## Performance Questions

### Q: How fast should API responses be?

**A:** Target response times:

- Health check: < 50ms
- List products/prices: < 300ms
- Create customer: < 500ms
- Webhook processing: < 1s

If slower, check:
- Stripe API latency
- Supabase query performance
- Network latency

### Q: Can I cache Stripe products?

**A:** Yes, products/prices rarely change:

```typescript
// Cache for 5 minutes
const CACHE_TTL = 5 * 60 * 1000;
```

Consider invalidating cache on `product.updated` webhook.

### Q: How many requests can the server handle?

**A:** Depends on hosting:

- **Railway/Vercel Free:** ~100 requests/second
- **Railway Pro:** ~1000 requests/second
- **Self-hosted (1 CPU):** ~500-1000 requests/second
- **Self-hosted (multi-CPU):** Scale horizontally

Add rate limiting to prevent abuse.

---

## Pricing Questions

### Q: How much does this backend cost to run?

**A:** Estimated monthly costs:

**Free tier (dev/testing):**
- Railway: Free tier available
- Vercel: Free tier available
- Supabase: Free tier (2 projects, 500MB database)
- Stripe: Free (pay only transaction fees)
- Clerk: Free tier (10,000 MAU)

**Production (small scale):**
- Hosting: $5-20/month (Railway, DigitalOcean)
- Supabase: $25/month (Pro tier)
- Stripe: 2.9% + $0.30 per transaction
- Clerk: Free or $25/month (Pro)

**Total: ~$30-70/month + transaction fees**

### Q: Does Stripe charge for API calls?

**A:** No, Stripe API calls are free. You only pay transaction fees (2.9% + $0.30 for card payments).

---

## Migration Questions

### Q: When should I migrate to Postgres?

**A:** Migrate when:

- Supabase costs become significant
- You need more database control
- You want better monorepo integration
- You have dedicated DevOps resources

There's no rush - Supabase works well for most use cases.

### Q: Will migration cause downtime?

**A:** It depends on your approach:

- **With downtime:** 15-60 minutes for data migration
- **Without downtime:** Use dual-write or read replica (more complex)

Plan carefully and test in staging first.

### Q: What about existing data in Supabase?

**A:** Export and import to Postgres:

1. Export from Supabase (pg_dump or dashboard)
2. Transform if needed
3. Import to Postgres
4. Verify data integrity
5. Switch backend to Postgres
6. Keep Supabase backup for rollback

---

## Subscription Questions

### Q: How do I create a subscription?

**A:** 

1. Customer calls `POST /stripe/customer` to create Stripe customer
2. Frontend creates Stripe Checkout session (or use Stripe Elements)
3. User completes checkout
4. Webhook `checkout.session.completed` is sent
5. Backend processes webhook and activates subscription

(Note: Checkout creation endpoint not implemented yet - add in Phase 5+)

### Q: How do I cancel a subscription?

**A:** Currently:

1. Use Stripe Dashboard
2. Or call Stripe API directly
3. Webhook `customer.subscription.deleted` will be sent
4. Backend processes and updates status

(Note: Cancel endpoint not implemented yet - add in Phase 5+)

### Q: How do I handle subscription upgrades/downgrades?

**A:** 

1. Create Stripe Checkout session for new price
2. Or use Stripe billing portal
3. Webhook `customer.subscription.updated` will be sent
4. Backend processes update

(Note: Update endpoint not implemented yet - add in Phase 5+)

---

## Development Workflow Questions

### Q: How do I add a new endpoint?

**A:** 

1. Add route handler in `apps/server/src/routes/stripe.ts` (or new file)
2. Add business logic in `apps/server/src/services/` (if needed)
3. Add input validation with Zod schema
4. Apply `protectRoute` middleware if authentication required
5. Add error handling
6. Update API documentation

Example:

```typescript
stripeRouter.get("/new-endpoint", protectRoute, async (req, res, next) => {
  try {
    const result = await stripeService.yourMethod();
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});
```

### Q: How do I add a new webhook event handler?

**A:** 

Edit `apps/server/src/services/webhooks/index.ts`:

```typescript
// 1. Add case in switch statement
case "your.new.event":
  await this.handleNewEvent(event);
  break;

// 2. Implement handler
async handleNewEvent(event: Stripe.Event): Promise<void> {
  const data = event.data.object;
  // Your logic here
  console.log(`New event processed: ${event.id}`);
}
```

### Q: How do I run tests?

**A:** 

Currently no automated tests. Manual testing:

```bash
# API tests
./apps/server/scripts/test-api.sh YOUR_TOKEN

# Webhook tests
./apps/server/scripts/test-webhooks.sh
```

Consider adding Jest/Vitest for unit tests in future.

---

## Error Handling Questions

### Q: What error format does the API use?

**A:** All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

See [API-REFERENCE.md](./API-REFERENCE.md) for all error codes.

### Q: How do I debug webhook errors?

**A:** 

1. **Check server logs:**
   ```bash
   pnpm dev
   # Webhook errors are logged with details
   ```

2. **Check Stripe Dashboard:**
   - Go to Webhooks → Your endpoint
   - View event log for response codes/bodies

3. **Query Supabase:**
   ```sql
   SELECT * FROM stripe_webhook_events 
   WHERE error IS NOT NULL;
   ```

### Q: What if Stripe API is down?

**A:** 

- Backend returns `502 SERVICE_ERROR`
- Client should retry request
- Check Stripe status: https://status.stripe.com/
- Webhooks will be retried by Stripe automatically

---

## Security Questions

### Q: Is it safe to expose the backend publicly?

**A:** Yes, if configured correctly:

- ✅ All protected routes require valid Clerk JWT
- ✅ Webhook signature verification prevents unauthorized events
- ✅ Secrets are in environment variables, not code
- ✅ Error messages don't leak sensitive info
- ✅ CORS prevents unauthorized domains

Add rate limiting for additional protection.

### Q: How are Stripe secrets kept secure?

**A:** 

- Secrets only in environment variables (never in code)
- Service layer reads secrets; routes don't access them
- Secrets never logged or returned in responses
- Different secrets for test/live environments

### Q: Can customers access other customers' data?

**A:** No:

- Clerk JWT identifies the authenticated user
- Backend only returns data for that user's Stripe customer
- Supabase mapping ensures one customer per user

### Q: What about PCI compliance?

**A:** 

- Backend never handles raw card data
- Stripe handles all payment processing
- You're PCI SAQ A compliant (lowest requirement)
- No card data stored in your database

---

## Troubleshooting Questions

### Q: Server won't start - env validation fails

**A:** 

1. Check all required vars are in `.env`:
   ```bash
   cat apps/server/.env.example
   ```

2. Verify no typos in variable names

3. Remove any quotes or spaces:
   ```bash
   # Bad
   STRIPE_SECRET_KEY = "sk_test_..."
   
   # Good
   STRIPE_SECRET_KEY=sk_test_...
   ```

### Q: Webhooks return 400 INVALID_SIGNATURE

**A:** 

1. Verify webhook secret matches Stripe Dashboard
2. Check you're using raw body parsing (not JSON)
3. Ensure middleware order is correct in `index.ts`
4. Test with Stripe CLI to isolate issue

Full guide: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### Q: Database queries are slow

**A:** 

1. Check indexes exist:
   ```sql
   -- Run queries from supabase-validation.sql
   ```

2. Verify Supabase tier (free tier has limits)

3. Optimize queries (select specific columns)

4. Add caching for frequently accessed data

---

## Deployment Questions

### Q: What hosting platform should I use?

**A:** Recommendations:

- **Railway:** Best for backend APIs, simple setup, good free tier
- **Vercel:** Good if already using for Next.js, but serverless has cold starts
- **DigitalOcean:** Affordable, reliable, good for stable workloads
- **Self-hosted:** Full control, but requires DevOps expertise

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed comparison.

### Q: Do I need a custom domain?

**A:** Not required, but recommended:

- Better user experience
- Professional appearance
- Easier to remember
- Stable URL (won't change if you switch platforms)

### Q: How do I deploy updates?

**A:** 

1. Make changes locally
2. Test thoroughly
3. Commit to git
4. Push to main branch
5. Platform auto-deploys (Railway, Vercel)
6. Or run deploy command (Railway CLI, Vercel CLI)

### Q: What if deployment fails?

**A:** 

1. Check build logs in platform dashboard
2. Fix the issue
3. Redeploy

Or rollback:
```bash
git revert HEAD
git push origin main
```

---

## Future Features Questions

### Q: Can I add subscription management endpoints?

**A:** Yes, see [NEXT-STEPS.md](./NEXT-STEPS.md) for planned features:

- Create checkout session
- Cancel subscription
- Update subscription
- Manage payment methods

These are not implemented yet but can be added following the existing patterns.

### Q: Can I add analytics?

**A:** Yes, you can:

1. Query `stripe_webhook_events` for event analytics
2. Use Stripe Dashboard for built-in analytics
3. Add custom analytics endpoints
4. Export data to analytics platform

### Q: Will you support multiple payment providers?

**A:** Not planned currently. The backend is Stripe-focused. Supporting additional providers (PayPal, etc.) would require significant architecture changes.

---

## Contributing Questions

### Q: How do I contribute to this backend?

**A:** 

1. Follow the architecture patterns (routes → services → integrations)
2. Add environment variables to env schema first
3. Implement services before routes
4. Use existing error handling patterns
5. Update documentation
6. Test thoroughly

### Q: What coding standards should I follow?

**A:** 

- TypeScript strict mode
- ESM modules (import/export, not require)
- Async/await (not callbacks)
- Consistent error handling
- Clear naming conventions
- Comments for complex logic

---

## Still Have Questions?

- 📖 Check the [full documentation](./README.md)
- 🔍 Search the [Troubleshooting Guide](./TROUBLESHOOTING.md)
- 📚 Review the [API Reference](./API-REFERENCE.md)
- 💬 Ask your team
- 🌐 Check external docs (Stripe, Clerk, Supabase)

---

**FAQ Updated:** 2026-02-05 | **Feedback Welcome!**
