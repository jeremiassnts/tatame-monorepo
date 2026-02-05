# Troubleshooting Guide

**Version:** 1.0  
**Last updated:** 2026-02-05  

Common issues and solutions for the Tatame backend.

---

## Server Won't Start

### Issue: Environment validation errors

**Error message:**
```
Error: Invalid environment variables: ...
```

**Solutions:**

1. **Check all required variables are set:**
   ```bash
   cat .env
   ```
   
   Required variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `CORS_ORIGIN`

2. **Copy from example file:**
   ```bash
   cp .env.example .env
   # Then fill in your credentials
   ```

3. **Verify no extra spaces or quotes:**
   ```bash
   # Bad
   STRIPE_SECRET_KEY = sk_test_...
   STRIPE_SECRET_KEY="sk_test_..."
   
   # Good
   STRIPE_SECRET_KEY=sk_test_...
   ```

### Issue: Port already in use

**Error message:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

1. **Kill the process using port 3000:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Or use a different port:**
   ```bash
   # Modify index.ts to use process.env.PORT
   PORT=3001 pnpm dev
   ```

### Issue: Module not found

**Error message:**
```
Cannot find module '@tatame-monorepo/env/server'
```

**Solutions:**

1. **Install dependencies:**
   ```bash
   # From monorepo root
   pnpm install
   ```

2. **Build shared packages:**
   ```bash
   pnpm build --filter=@tatame-monorepo/env
   ```

---

## Authentication Issues (401 Unauthorized)

### Issue: All requests return 401

**Possible causes:**

1. **Clerk credentials are invalid**
   - Verify `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are from the same Clerk instance
   - Check you're using the correct environment (dev/prod)
   - Confirm keys are not expired or revoked

2. **Token not being sent**
   ```bash
   # Check request includes Authorization header
   curl -v http://localhost:3000/stripe/products \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Token format is incorrect**
   - Must be: `Authorization: Bearer <token>`
   - Not: `Authorization: <token>` or `Bearer: <token>`

4. **Clock skew**
   - JWT validation is time-sensitive
   - Ensure server time is correct:
     ```bash
     date
     # Should match actual time
     ```

### Issue: Token expired

**Solutions:**

1. **Get a fresh token from Clerk:**
   - Frontend: `await getToken()` gets a fresh token
   - Mobile: Use latest token from `useAuth().getToken()`

2. **Check token expiration:**
   - Clerk tokens typically expire after 1 hour
   - Frontend/mobile should refresh automatically

### Issue: CORS errors (browser)

**Error in browser console:**
```
Access to fetch at 'http://localhost:3000/stripe/products' from origin 'http://localhost:3001' 
has been blocked by CORS policy
```

**Solutions:**

1. **Verify CORS_ORIGIN matches your frontend URL:**
   ```bash
   # .env
   CORS_ORIGIN=http://localhost:3001  # Must match frontend exactly
   ```

2. **Restart server after changing CORS_ORIGIN:**
   ```bash
   # Stop server (Ctrl+C) and restart
   pnpm dev
   ```

3. **Check for trailing slash:**
   ```bash
   # Bad
   CORS_ORIGIN=http://localhost:3001/
   
   # Good
   CORS_ORIGIN=http://localhost:3001
   ```

---

## Webhook Issues

### Issue: Webhook signature verification fails

**Error message:**
```
400 INVALID_SIGNATURE - Invalid webhook signature
```

**Solutions:**

1. **Verify webhook secret matches Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click your endpoint
   - Click "Reveal" signing secret
   - Compare with your `.env` file

2. **Check you're using the correct webhook endpoint:**
   - Test webhooks: `whsec_...` from test Dashboard
   - Live webhooks: Different secret from live Dashboard
   - Local forwarding: Use secret from `stripe listen` output

3. **Verify raw body is being parsed:**
   - Check middleware order in `index.ts`
   - Webhook route must be mounted BEFORE `express.json()`

### Issue: Webhooks not being received

**Possible causes:**

1. **Webhook URL not accessible**
   - Local development: Use ngrok or Stripe CLI
   - Production: Verify HTTPS endpoint is public

2. **Check webhook is configured in Stripe:**
   ```bash
   stripe webhooks list
   ```

3. **Verify endpoint URL is correct:**
   - Should be: `https://your-domain.com/webhooks/stripe`
   - Not: `/stripe/webhooks` or other path

4. **Check Stripe Dashboard event log:**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click your endpoint
   - View delivery attempts and errors

### Issue: Events processed multiple times

**Possible causes:**

1. **Idempotency table not working:**
   - Verify `stripe_webhook_events` table exists in Supabase
   - Check table has UNIQUE constraint on `stripe_event_id`

2. **Database connection failing:**
   - Check Supabase credentials
   - Verify service role key has write permissions

3. **Idempotency check being skipped:**
   - Check server logs for errors before event processing

**Validation:**

```sql
-- Check for duplicate events (should be 0)
SELECT stripe_event_id, COUNT(*) 
FROM stripe_webhook_events 
GROUP BY stripe_event_id 
HAVING COUNT(*) > 1;
```

### Issue: Webhook returns 500 error

**Solutions:**

1. **Check server logs for error details:**
   ```bash
   # Server should log the error
   pnpm dev
   # Look for error messages when webhook is triggered
   ```

2. **Common causes:**
   - Database connection error (check Supabase credentials)
   - Missing handler for event type (add to webhook service)
   - Invalid event data structure (add validation)

3. **Test with specific event:**
   ```bash
   stripe trigger customer.created
   # Check server logs for error details
   ```

---

## Database Issues

### Issue: Supabase connection fails

**Error message:**
```
Supabase error: Invalid API key
```

**Solutions:**

1. **Verify Supabase credentials:**
   - Check `SUPABASE_URL` format: `https://xxx.supabase.co`
   - Verify `SUPABASE_ANON_KEY` is service role (not anon key)
   - Get fresh credentials from: https://app.supabase.com/project/_/settings/api

2. **Check network connectivity:**
   ```bash
   curl https://your-project.supabase.co/rest/v1/
   # Should return 404 (but means endpoint is reachable)
   ```

### Issue: Table does not exist

**Error message:**
```
relation "stripe_customer_mapping" does not exist
```

**Solutions:**

1. **Run migrations:**
   - Execute SQL from `docs/backend/supabase-migrations.sql`
   - In Supabase SQL Editor

2. **Verify tables exist:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'stripe_%';
   ```

3. **Check you're connected to the correct Supabase project:**
   - Verify `SUPABASE_URL` matches your project

### Issue: Permission denied

**Error message:**
```
new row violates row-level security policy
```

**Solutions:**

1. **Use service role key (not anon key):**
   ```bash
   # .env
   SUPABASE_ANON_KEY=eyJhbGc...  # Service role key
   # NOT the anon key
   ```

2. **Or disable RLS for backend tables:**
   ```sql
   ALTER TABLE stripe_customer_mapping DISABLE ROW LEVEL SECURITY;
   ALTER TABLE stripe_webhook_events DISABLE ROW LEVEL SECURITY;
   ```

---

## Stripe Issues

### Issue: Stripe API errors

**Error message:**
```
502 SERVICE_ERROR - Payment service temporarily unavailable
```

**Solutions:**

1. **Check Stripe API key is valid:**
   ```bash
   stripe config --list
   # Verify you're using the correct key
   ```

2. **Test Stripe connection:**
   ```bash
   stripe products list --limit 1
   # Should list products
   ```

3. **Verify API version compatibility:**
   - Current version: `2024-12-18.acacia`
   - Update Stripe SDK if needed:
     ```bash
     pnpm update stripe
     ```

4. **Check Stripe API status:**
   - Visit: https://status.stripe.com/

### Issue: Products/prices not found

**Solutions:**

1. **Create test products in Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/test/products
   - Click "Add product"
   - Add price to product

2. **Verify products exist:**
   ```bash
   stripe products list
   stripe prices list
   ```

3. **Check active filter:**
   - Products might be inactive
   - Try: `GET /stripe/products?active=false`

---

## Development Workflow Issues

### Issue: Changes not reflected

**Solutions:**

1. **Restart dev server:**
   ```bash
   # Stop with Ctrl+C, then:
   pnpm dev
   ```

2. **Clear cache (if using tsx):**
   ```bash
   rm -rf node_modules/.cache
   pnpm dev
   ```

3. **Rebuild shared packages:**
   ```bash
   # From monorepo root
   pnpm build --filter=@tatame-monorepo/env
   ```

### Issue: TypeScript errors

**Solutions:**

1. **Check types:**
   ```bash
   pnpm check-types
   ```

2. **Install type definitions:**
   ```bash
   pnpm add -D @types/node @types/express
   ```

3. **Clear TypeScript cache:**
   ```bash
   rm -rf dist
   pnpm build
   ```

---

## Testing Issues

### Issue: Can't get Clerk token for testing

**Solutions:**

1. **Use Stripe CLI (doesn't need Clerk token):**
   ```bash
   stripe trigger customer.created
   ```

2. **Get token from browser (for API testing):**
   - Open browser DevTools
   - Go to Application → Local Storage
   - Find Clerk token
   - Or use `await clerk.session.getToken()` in console

3. **Use Postman/Insomnia:**
   - Get token from frontend
   - Save in environment variable
   - Reuse for multiple requests

### Issue: Stripe CLI not working

**Solutions:**

1. **Login to Stripe:**
   ```bash
   stripe login
   ```

2. **Verify connection:**
   ```bash
   stripe config --list
   ```

3. **Update Stripe CLI:**
   ```bash
   brew upgrade stripe/stripe-cli/stripe  # macOS
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

---

## Common Error Codes

| Error Code | HTTP Status | Cause | Solution |
|------------|-------------|-------|----------|
| `UNAUTHORIZED` | 401 | Invalid/missing Clerk token | Check token is valid and not expired |
| `INVALID_SIGNATURE` | 400 | Webhook signature invalid | Verify webhook secret matches Stripe |
| `MISSING_SIGNATURE` | 400 | No Stripe-Signature header | Ensure request is from Stripe |
| `VALIDATION_ERROR` | 400 | Invalid request parameters | Check query params or body format |
| `STRIPE_ERROR` | 502 | Stripe API error | Check Stripe credentials and API status |
| `INTERNAL_SERVER_ERROR` | 500 | Server error | Check server logs for details |

---

## Debugging Tips

### Enable verbose logging

Add to your code temporarily:

```typescript
// In webhook handler
console.log('Webhook event:', JSON.stringify(event, null, 2));

// In Stripe service
console.log('Stripe request:', method, params);
console.log('Stripe response:', response);
```

### Check request/response

```bash
# Use curl with verbose flag
curl -v http://localhost:3000/stripe/products \
  -H "Authorization: Bearer TOKEN"
```

### Monitor Supabase logs

1. Go to: https://app.supabase.com/project/_/logs
2. View Postgres logs for query errors
3. Check API logs for connection issues

### Monitor Stripe events

1. Go to: https://dashboard.stripe.com/test/events
2. View all events triggered
3. Check webhook delivery status

---

## Getting Help

### Before asking for help:

1. ✅ Check this troubleshooting guide
2. ✅ Review server logs for error details
3. ✅ Verify environment variables are correct
4. ✅ Confirm Supabase tables exist
5. ✅ Test with Stripe CLI to isolate issues

### Useful information to provide:

- Server logs (sanitize secrets!)
- Environment variable names (not values)
- Steps to reproduce the issue
- Expected vs actual behavior
- Stripe Dashboard webhook event log
- Supabase error logs (if applicable)

### Resources:

- **Backend Documentation:** [docs/backend/README.md](./README.md)
- **Stripe Documentation:** https://stripe.com/docs
- **Clerk Documentation:** https://clerk.com/docs
- **Supabase Documentation:** https://supabase.com/docs
- **Express Documentation:** https://expressjs.com/

---

## Quick Diagnostic Checklist

Run through this checklist to identify the issue:

### Server
- [ ] All environment variables set in `.env`
- [ ] Server starts without errors
- [ ] Health check returns 200: `curl http://localhost:3000/`
- [ ] No TypeScript errors: `pnpm check-types`

### Authentication
- [ ] Clerk credentials are valid
- [ ] Token is being sent in Authorization header
- [ ] Auth middleware is mounted correctly
- [ ] Public routes (/) work without token
- [ ] Protected routes (/stripe/*) require token

### Stripe
- [ ] Stripe API key is valid (test mode)
- [ ] Can list products via Stripe CLI: `stripe products list`
- [ ] Products exist in Stripe Dashboard
- [ ] API calls from backend return data

### Webhooks
- [ ] `STRIPE_WEBHOOK_SECRET` is set
- [ ] Webhook configured in Stripe Dashboard
- [ ] Webhook URL is accessible (ngrok/CLI for local)
- [ ] Signature verification passes
- [ ] Events are logged in server output

### Database
- [ ] Supabase tables exist (run validation queries)
- [ ] Service role key has proper permissions
- [ ] Connection to Supabase works
- [ ] Data can be inserted/queried

---

## Performance Issues

### Slow API responses

**Check:**

1. **Stripe API latency:**
   - Test direct Stripe call: `stripe products list`
   - Check Stripe status: https://status.stripe.com/

2. **Database query performance:**
   ```sql
   -- Check slow queries
   SELECT * FROM pg_stat_statements 
   ORDER BY total_exec_time DESC 
   LIMIT 10;
   ```

3. **Network latency:**
   - Use different Supabase region if possible
   - Check network connection

### High memory usage

**Solutions:**

1. **Limit concurrent requests:**
   - Add rate limiting middleware
   - Use connection pooling

2. **Check for memory leaks:**
   - Monitor with: `node --inspect`
   - Profile with Chrome DevTools

---

## Security Concerns

### Exposed secrets in logs

**Check:**

1. **Search logs for secret patterns:**
   ```bash
   # Should return nothing
   grep -r "sk_test_" logs/
   grep -r "whsec_" logs/
   ```

2. **Review logging statements:**
   - Never log full request/response
   - Only log non-sensitive identifiers

### Suspicious webhook activity

**Actions:**

1. **Verify signature on all webhooks:**
   - Check logs for signature verification
   - Ensure no webhooks bypass verification

2. **Monitor webhook event types:**
   ```sql
   SELECT event_type, COUNT(*) 
   FROM stripe_webhook_events 
   WHERE created_at > NOW() - INTERVAL '1 hour'
   GROUP BY event_type;
   ```

3. **Rotate webhook secret if compromised:**
   - Generate new secret in Stripe Dashboard
   - Update `.env`
   - Restart server

---

**Still having issues?** Check the detailed setup guides:

- [Webhook Setup Guide](./07-webhook-setup-guide.md)
- [API Reference](./API-REFERENCE.md)
- [Security Best Practices](./05-security-and-best-practices.md)
