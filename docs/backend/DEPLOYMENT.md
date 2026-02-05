# Deployment Guide

**Version:** 1.0  
**Last updated:** 2026-02-05  
**Status:** Production deployment checklist and procedures

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

### Code & Dependencies
- [ ] All code is committed to version control
- [ ] No console.log with sensitive data
- [ ] Dependencies are up to date
- [ ] TypeScript builds without errors: `pnpm check-types`
- [ ] Production build works: `pnpm build`

### Environment
- [ ] All required environment variables documented
- [ ] Production credentials obtained (Stripe live, Clerk prod, Supabase prod)
- [ ] Environment variables set in hosting platform
- [ ] `NODE_ENV=production` configured

### Database
- [ ] Supabase migrations executed in production database
- [ ] Tables verified: `stripe_customer_mapping`, `stripe_webhook_events`
- [ ] Indexes created and verified
- [ ] Backup strategy in place

### External Services
- [ ] Stripe account verified and activated
- [ ] Clerk production instance configured
- [ ] Supabase production project created
- [ ] Webhook endpoint configured in Stripe (live mode)

### Security
- [ ] All secrets are in environment variables (not hardcoded)
- [ ] CORS_ORIGIN set to production frontend URL
- [ ] HTTPS enabled (required for webhooks)
- [ ] Rate limiting configured (recommended)
- [ ] Error messages don't leak sensitive info

### Testing
- [ ] All endpoints tested in staging
- [ ] Webhook delivery tested with Stripe test mode
- [ ] Authentication flow verified
- [ ] Error handling verified

---

## Hosting Options

### Option 1: Railway.app (Recommended for MVP)

**Pros:** Simple, automatic deploys, environment variables UI, PostgreSQL available

**Steps:**

1. **Create new project:**
   - Go to: https://railway.app/
   - Click "New Project"
   - Connect GitHub repository
   - Select monorepo

2. **Configure service:**
   - Select `apps/server` as root directory
   - Build command: `pnpm build`
   - Start command: `pnpm start`

3. **Set environment variables:**
   - Add all variables from `.env.example`
   - Use production credentials

4. **Deploy:**
   - Push to main branch (auto-deploys)
   - Or trigger manual deploy

5. **Configure webhook:**
   - Get Railway URL (e.g., `https://your-app.railway.app`)
   - Configure in Stripe: `https://your-app.railway.app/webhooks/stripe`

### Option 2: Vercel (Serverless)

**Pros:** Easy Next.js integration, automatic HTTPS, global CDN

**Steps:**

1. **Install Vercel CLI:**
   ```bash
   pnpm add -g vercel
   ```

2. **Configure `vercel.json` in `apps/server`:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/index.ts"
       }
     ]
   }
   ```

3. **Deploy:**
   ```bash
   cd apps/server
   vercel --prod
   ```

4. **Set environment variables:**
   ```bash
   vercel env add STRIPE_SECRET_KEY production
   vercel env add STRIPE_WEBHOOK_SECRET production
   # ... add all other variables
   ```

**Note:** Webhooks may have cold start issues on Vercel. Consider Railway or dedicated server for better webhook reliability.

### Option 3: DigitalOcean App Platform

**Pros:** Simple, affordable, good for API servers

**Steps:**

1. **Create app:**
   - Go to: https://cloud.digitalocean.com/apps
   - Create app from GitHub
   - Select repository and branch

2. **Configure:**
   - App Type: Web Service
   - Build command: `cd apps/server && pnpm build`
   - Run command: `pnpm start`
   - HTTP Port: 3000

3. **Environment variables:**
   - Add via dashboard
   - Use production credentials

### Option 4: Docker (Any Platform)

**Pros:** Portable, works anywhere, full control

**Create `apps/server/Dockerfile`:**

```dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/env/package.json ./packages/env/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build --filter=server

FROM base AS runtime
WORKDIR /app
COPY --from=build /app/apps/server/dist ./dist
COPY --from=build /app/apps/server/package.json ./package.json
COPY --from=dependencies /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.mjs"]
```

**Build and run:**

```bash
# Build
docker build -t tatame-backend -f apps/server/Dockerfile .

# Run
docker run -p 3000:3000 --env-file apps/server/.env tatame-backend
```

---

## Environment Variables for Production

### Required Variables

```bash
# Server
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# Stripe (LIVE mode)
STRIPE_SECRET_KEY=sk_live_...  # NOT test key
STRIPE_WEBHOOK_SECRET=whsec_...  # From production webhook

# Clerk (Production)
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Supabase (Production)
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_ANON_KEY=your-prod-service-role-key

# Database (Optional)
# DATABASE_URL=postgresql://...  # If using Postgres
```

### Security Best Practices

1. **Never commit secrets:**
   - Use `.env.local` for local secrets
   - Add to `.gitignore`

2. **Use different credentials per environment:**
   - Dev: Stripe test, Clerk dev, Supabase dev
   - Staging: Stripe test, Clerk staging, Supabase staging
   - Prod: Stripe live, Clerk prod, Supabase prod

3. **Rotate secrets regularly:**
   - Quarterly rotation recommended
   - Document rotation procedure

4. **Use secret management:**
   - Railway: Built-in secrets
   - Vercel: Environment variables UI
   - Self-hosted: Use HashiCorp Vault or AWS Secrets Manager

---

## Webhook Configuration for Production

### 1. Create Production Webhook Endpoint

In Stripe Dashboard (LIVE mode):

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://your-production-domain.com/webhooks/stripe`
4. Select events (same as test mode)
5. Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### 2. Test Webhook Delivery

1. Trigger a test event in Stripe Dashboard
2. Check delivery in webhook event log
3. Verify server logs show event received
4. Confirm event stored in Supabase

### 3. Monitor Webhook Health

Set up alerts for:
- Failed webhook deliveries (3+ consecutive failures)
- Signature verification failures
- Processing errors (500 responses)
- High latency (>1s response time)

---

## Database Migration (Supabase)

### Production Database Setup

1. **Create production Supabase project** (if not exists)

2. **Run migrations:**
   ```sql
   -- Copy from supabase-migrations.sql and execute in production
   ```

3. **Verify setup:**
   ```sql
   -- Copy from supabase-validation.sql and verify all tables exist
   ```

4. **Configure backups:**
   - Supabase Pro: Daily automatic backups
   - Or set up pg_dump schedule

5. **Set up monitoring:**
   - Enable Supabase monitoring
   - Set up alerts for query performance

---

## Health Checks and Monitoring

### Health Check Endpoint

Configure your platform's health check to use:

```
GET https://your-domain.com/
```

Expected response: `200 OK` with body `"OK"`

### Monitoring Setup

#### Application Monitoring

**Recommended tools:**
- **Sentry** - Error tracking and performance
- **LogDNA / Datadog** - Log aggregation
- **New Relic / AppDynamics** - APM

**Key metrics to monitor:**
- Response time (P50, P95, P99)
- Error rate by endpoint
- Request rate
- Memory/CPU usage

#### Webhook Monitoring

**Monitor in Stripe Dashboard:**
- https://dashboard.stripe.com/webhooks
- Check delivery success rate
- Set up email alerts for failures

**Monitor in your application:**
```sql
-- Recent webhook failures (if you log them)
SELECT * FROM stripe_webhook_events 
WHERE error IS NOT NULL 
ORDER BY created_at DESC;
```

#### Database Monitoring

**Supabase Dashboard:**
- Query performance
- Connection count
- Storage usage
- Index usage

**Custom alerts:**
```sql
-- Slow queries (if pg_stat_statements enabled)
SELECT query, mean_exec_time 
FROM pg_stat_statements 
WHERE mean_exec_time > 1000 
ORDER BY mean_exec_time DESC;
```

---

## Deployment Procedure

### Initial Deployment

1. **Deploy to staging first:**
   ```bash
   # Deploy to staging environment
   git push origin staging
   ```

2. **Run smoke tests:**
   ```bash
   # From your local machine
   ./apps/server/scripts/test-api.sh YOUR_STAGING_CLERK_TOKEN
   ```

3. **Test webhooks:**
   ```bash
   # Trigger test events in Stripe Dashboard
   # Verify delivery and processing
   ```

4. **Deploy to production:**
   ```bash
   git push origin main
   # Or use platform-specific deploy command
   ```

5. **Verify production:**
   - Check health endpoint
   - Test one API call
   - Trigger webhook test event
   - Monitor logs for errors

### Updates and Hotfixes

**For regular updates:**

1. Create feature branch
2. Implement changes
3. Test locally
4. Deploy to staging
5. Test in staging
6. Merge to main
7. Deploy to production
8. Monitor for issues

**For critical hotfixes:**

1. Create hotfix branch from main
2. Implement minimal fix
3. Test locally (if possible)
4. Deploy directly to production
5. Monitor closely
6. Backport to develop/staging

---

## Rollback Procedure

### If deployment fails:

1. **Check logs for errors:**
   - Platform logs (Railway, Vercel, etc.)
   - Application logs
   - Database logs

2. **Attempt quick fix:**
   - Fix environment variables
   - Restart service
   - Clear cache

3. **Rollback if needed:**
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin main
   
   # Or redeploy previous version
   # (platform-specific command)
   ```

4. **Restore database (if needed):**
   - Restore from backup
   - Verify data integrity

### Rollback Checklist

- [ ] Previous version redeployed
- [ ] Environment variables verified
- [ ] Database state verified
- [ ] Webhooks working
- [ ] API endpoints responding
- [ ] No data loss occurred

---

## Production Checklist

### Before Go-Live

#### Infrastructure
- [ ] HTTPS enabled and certificates valid
- [ ] Custom domain configured (if applicable)
- [ ] Health check endpoint configured
- [ ] Monitoring and alerting set up
- [ ] Log aggregation configured
- [ ] Backup strategy in place

#### Application
- [ ] All environment variables set to production values
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Webhooks configured in Stripe live mode
- [ ] CORS configured for production frontend
- [ ] Rate limiting enabled

#### Security
- [ ] Secrets stored securely (not in code)
- [ ] HTTPS only (no HTTP)
- [ ] Security headers configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified

#### Testing
- [ ] All endpoints tested in staging
- [ ] Webhook delivery tested
- [ ] Error scenarios tested
- [ ] Load testing performed (if high traffic expected)
- [ ] Rollback procedure tested

#### Documentation
- [ ] API documentation updated
- [ ] Deployment procedure documented
- [ ] Rollback procedure documented
- [ ] On-call runbook created
- [ ] Team trained on system

---

## Post-Deployment

### Immediate (First 24 Hours)

- [ ] Monitor error rates closely
- [ ] Check webhook delivery success rate
- [ ] Verify all endpoints responding correctly
- [ ] Monitor database performance
- [ ] Check for any unexpected errors

### First Week

- [ ] Review logs for patterns
- [ ] Analyze performance metrics
- [ ] Gather user feedback
- [ ] Plan improvements based on real usage
- [ ] Update documentation with learnings

### Ongoing

- [ ] Weekly review of error logs
- [ ] Monthly review of performance metrics
- [ ] Quarterly security audit
- [ ] Regular dependency updates
- [ ] Continuous documentation updates

---

## Platform-Specific Notes

### Railway

**Environment:**
- Add variables in Railway dashboard
- Use Railway secrets for sensitive data
- Variables are encrypted at rest

**Deployment:**
- Automatic on git push to main
- Or manual deploy via Railway CLI
- Zero-downtime deployments

**Logs:**
```bash
railway logs
```

### Vercel

**Environment:**
- Use Vercel dashboard or CLI
- Separate variables per environment

**Deployment:**
```bash
vercel --prod
```

**Logs:**
```bash
vercel logs
```

### DigitalOcean

**Environment:**
- Configure in app settings
- Use encrypted variables

**Deployment:**
- Automatic from GitHub
- Or doctl CLI

**Logs:**
- View in DigitalOcean dashboard

### Docker (Self-Hosted)

**Environment:**
- Use `.env` file or environment variables
- Never include `.env` in image

**Deployment:**
```bash
# Build
docker build -t tatame-backend:v1.0.0 .

# Run
docker run -d \
  --name tatame-backend \
  -p 3000:3000 \
  --env-file .env.production \
  tatame-backend:v1.0.0
```

**Logs:**
```bash
docker logs -f tatame-backend
```

---

## Scaling Considerations

### When to Scale

Scale when you observe:
- Response times > 500ms consistently
- CPU usage > 70% sustained
- Memory usage > 80% sustained
- Webhook processing delays
- Database connection pool exhausted

### Horizontal Scaling

**Multiple server instances:**

1. Deploy multiple instances behind load balancer
2. Use sticky sessions (if stateful)
3. Share environment variables across instances
4. Use external session store (Redis) if needed

**Load Balancer Configuration:**
- Health check: `GET /`
- Timeout: 30s
- Retry: 3 attempts

### Database Scaling

**Supabase:**
- Upgrade to higher tier for more connections
- Enable read replicas (if available)
- Optimize slow queries

**Future Postgres:**
- Connection pooling (PgBouncer)
- Read replicas for analytics
- Partition large tables

### Caching

**Add Redis for:**
- Stripe product/price caching (1 hour TTL)
- Session caching
- Rate limiting state

---

## Disaster Recovery

### Backup Strategy

**Application:**
- Git repository is source of truth
- Keep deployment artifacts (Docker images, build outputs)

**Database:**
- Supabase: Automatic daily backups (Pro plan)
- Manual: `pg_dump` weekly
- Store backups in separate location (S3, etc.)

**Secrets:**
- Document all required secrets
- Store encrypted backup of `.env` template
- Use secret management system

### Recovery Procedure

**If database corrupted:**

1. Stop application
2. Restore from latest backup
3. Verify data integrity
4. Restart application
5. Test critical flows
6. Monitor for issues

**If application crashes:**

1. Check logs for cause
2. Fix issue or rollback code
3. Redeploy
4. Verify health
5. Monitor closely

**If webhook processing fails:**

1. Check Stripe event log for failed events
2. Fix webhook handler issue
3. Redeploy
4. Manually replay failed events from Stripe Dashboard
5. Verify events processed correctly

---

## Maintenance Windows

### Scheduled Maintenance

**When to schedule:**
- Database migrations
- Major version updates
- Infrastructure changes

**Procedure:**

1. Announce maintenance window to users (24h advance notice)
2. Deploy changes to staging first
3. Create database backup
4. Enable read-only mode (if possible)
5. Execute changes
6. Verify functionality
7. Restore write access
8. Monitor for issues

**Communication template:**

```
Subject: Scheduled Maintenance - [Date] [Time]

We will be performing scheduled maintenance on [Date] from [Start] to [End] [Timezone].

During this time:
- API will be in read-only mode
- New subscriptions cannot be created
- Existing subscriptions will continue normally

Estimated duration: [X] minutes

Thank you for your patience.
```

---

## Security in Production

### HTTPS Configuration

**Required for:**
- Stripe webhooks (Stripe requires HTTPS)
- Clerk authentication (best practice)
- PCI compliance

**Certificate:**
- Most hosting platforms provide automatic HTTPS (Railway, Vercel)
- Self-hosted: Use Let's Encrypt (certbot)

### Security Headers

Add these headers (via middleware):

```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### Rate Limiting

Protect against abuse:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: { error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});

app.use(limiter);
```

---

## Monitoring Alerts

### Critical Alerts (Immediate Action)

- Server down (health check fails)
- Database connection lost
- Stripe API errors > 10% of requests
- Webhook signature failures
- 5xx error rate > 1%

### Warning Alerts (Check Within 1 Hour)

- Response time P95 > 1s
- Memory usage > 80%
- CPU usage > 80%
- Webhook delivery failures
- Database slow queries

### Info Alerts (Review Daily)

- New error types
- Unusual traffic patterns
- Webhook event type distribution changes

---

## Compliance and Regulations

### PCI Compliance

**Current status:** PCI SAQ A (Stripe handles card data)

**Requirements:**
- Never store card numbers
- Never log card data
- Use HTTPS only
- Keep software updated

### GDPR (If Applicable)

**Considerations:**
- User data in Supabase (Clerk user ID, email, etc.)
- Stripe customer data
- Right to erasure (delete customer data)
- Data export capability

**Implementation:**
- Add endpoint: `DELETE /user/data` (delete all user data)
- Add endpoint: `GET /user/data` (export user data)
- Document data retention policy

---

## Performance Optimization

### Before Optimizing

**Measure first:**
- Use APM tools (New Relic, Datadog)
- Identify slow endpoints
- Profile database queries
- Check external API latency

### Quick Wins

1. **Enable compression:**
   ```bash
   pnpm add compression
   ```
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Add response caching:**
   ```typescript
   // Cache product list for 5 minutes
   const cache = new Map();
   
   app.get('/stripe/products', async (req, res) => {
     const cacheKey = 'products';
     if (cache.has(cacheKey)) {
       return res.json(cache.get(cacheKey));
     }
     
     const products = await stripeService.listProducts();
     cache.set(cacheKey, products);
     setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
     
     res.json(products);
   });
   ```

3. **Optimize database queries:**
   - Add indexes on frequently queried columns
   - Use select specific columns (not `SELECT *`)
   - Add pagination to list endpoints

---

## Deployment Checklist Summary

**Pre-deploy:**
- ✅ Code review completed
- ✅ Tests passing
- ✅ Staging tested
- ✅ Environment variables ready

**Deploy:**
- ✅ Deploy to production
- ✅ Run health check
- ✅ Test critical endpoints
- ✅ Verify webhook delivery

**Post-deploy:**
- ✅ Monitor logs (1 hour)
- ✅ Check error rates
- ✅ Verify webhook processing
- ✅ Update status page (if applicable)

---

## Resources

- **Railway Docs:** https://docs.railway.app/
- **Vercel Docs:** https://vercel.com/docs
- **DigitalOcean Docs:** https://docs.digitalocean.com/products/app-platform/
- **Docker Docs:** https://docs.docker.com/
- **Stripe Production Checklist:** https://stripe.com/docs/security/checklist

---

**Ready to deploy?** Review the [Implementation Checklist](./IMPLEMENTATION-CHECKLIST.md) first!
