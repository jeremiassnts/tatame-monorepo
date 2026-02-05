# Next Steps and Future Improvements

**Version:** 1.0  
**Last updated:** 2026-02-05  
**Status:** Recommendations for Phase 5 and beyond

---

## Immediate Next Steps (Manual Setup Required)

### 1. Complete Phase 4 Setup ⚠️ PRIORITY

Before the backend is production-ready, you must:

- [ ] **Execute Supabase migrations:**
  - Run SQL from `supabase-migrations.sql` in your Supabase project
  - Verify tables exist using `supabase-validation.sql` queries

- [ ] **Configure Stripe webhook:**
  - Create webhook endpoint in Stripe Dashboard
  - Point to `https://your-domain.com/webhooks/stripe`
  - Select events to receive (see guide)
  - Copy signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

- [ ] **Test webhook integration:**
  - Use Stripe CLI: `stripe trigger customer.created`
  - Verify event is received and processed
  - Check event is stored in `stripe_webhook_events` table
  - Test idempotency by resending same event

- [ ] **Deploy to staging/production:**
  - Set all environment variables in your hosting platform
  - Use production Stripe/Clerk/Supabase credentials
  - Test webhook delivery from live Stripe

See [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md) for detailed instructions.

---

## Phase 5: Supabase → Postgres Migration (Future)

### Overview

Migrate from Supabase to the monorepo's Postgres + Drizzle setup.

**Why migrate?**
- Full control over database schema and migrations
- Better integration with monorepo tooling
- Simplified local development (docker-compose)
- No external dependency on Supabase for backend data
- Type-safe database queries with Drizzle

**When to migrate?**
- After Phase 4 is stable in production
- When Supabase becomes a bottleneck or cost concern
- When you need features better suited to self-hosted Postgres
- When team is ready for additional infrastructure management

### Migration Steps (High-Level)

1. **Design Drizzle Schema**
   - Mirror existing Supabase tables in `packages/db/src/schema/`
   - Include: users, stripe_customer_mapping, stripe_webhook_events
   - Add any new tables needed for features

2. **Create Migrations**
   ```bash
   pnpm --filter=@tatame-monorepo/db generate
   pnpm --filter=@tatame-monorepo/db migrate
   ```

3. **Export Data from Supabase**
   - Use Supabase dashboard export or pg_dump
   - Transform to match new schema if needed

4. **Import to Postgres**
   - Load data into local/staging Postgres
   - Verify data integrity and counts

5. **Update Backend Code**
   - Replace Supabase client with Drizzle queries
   - Update services to use `packages/db`
   - Test all endpoints

6. **Cutover**
   - Plan downtime or read-only window
   - Switch `DATABASE_URL` to new Postgres
   - Monitor for issues
   - Keep Supabase backup for rollback

See [04-supabase-coexistence-strategy.md](./04-supabase-coexistence-strategy.md) for detailed migration checklist.

---

## Recommended Improvements

### Short-term (Before Production)

#### 1. Add Request Logging
```typescript
// middleware/logger.ts
import { nanoid } from 'nanoid';

export const requestLogger = (req, res, next) => {
  const requestId = nanoid();
  req.requestId = requestId;
  
  console.log({
    requestId,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
  });
  
  next();
};
```

#### 2. Add Rate Limiting
```bash
pnpm add express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});

app.use('/stripe', limiter);
```

#### 3. Add Health Check Details
```typescript
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      stripe: await checkStripeConnection(),
      supabase: await checkSupabaseConnection(),
    },
  };
  res.json(health);
});
```

#### 4. Add Request ID to Errors
```typescript
// Attach request ID to all responses
app.use((req, res, next) => {
  res.setHeader('X-Request-ID', req.requestId);
  next();
});
```

#### 5. Add Webhook Event Logging
```typescript
// Store more webhook metadata for debugging
interface WebhookEventLog extends StripeWebhookEvent {
  raw_data?: object;  // Store event data for debugging
  error?: string;      // Store error if processing failed
  retry_count?: number;
}
```

### Medium-term (After Stable)

#### 1. Implement Subscription Management

**Endpoints:**
- `POST /stripe/checkout` - Create checkout session for subscription
- `GET /stripe/subscriptions` - List user's active subscriptions
- `POST /stripe/subscriptions/:id/cancel` - Cancel subscription
- `POST /stripe/subscriptions/:id/update` - Update subscription (change plan)

**Database:**
- Add `stripe_subscriptions` table (see supabase-migrations.sql)
- Track subscription status, billing period, cancel date

#### 2. Add Payment Method Management

**Endpoints:**
- `GET /stripe/payment-methods` - List user's payment methods
- `POST /stripe/payment-methods` - Add payment method
- `DELETE /stripe/payment-methods/:id` - Remove payment method
- `POST /stripe/payment-methods/:id/default` - Set default payment method

#### 3. Implement Invoice Handling

**Endpoints:**
- `GET /stripe/invoices` - List user's invoices
- `GET /stripe/invoices/:id` - Get invoice details
- `POST /stripe/invoices/:id/pay` - Retry failed invoice

**Webhooks:**
- Enhance `invoice.payment_succeeded` handler to send receipt email
- Enhance `invoice.payment_failed` handler to notify user

#### 4. Add Usage-Based Billing (If Needed)

**Endpoints:**
- `POST /stripe/usage` - Report usage for metered billing
- `GET /stripe/usage` - Get current usage

**Webhooks:**
- Handle `invoice.created` to attach usage records

#### 5. Implement Customer Portal

**Endpoints:**
- `POST /stripe/portal` - Create Stripe Customer Portal session
  - Returns URL for user to manage subscription/payment methods

### Long-term (Future Phases)

#### 1. Multi-tenant Support

- Workspace/organization-level subscriptions
- Team billing and seat management
- Shared subscription across multiple users

#### 2. Advanced Webhook Features

- Async processing with queue (Bull, BullMQ, or similar)
- Webhook retry logic with exponential backoff
- Dead letter queue for failed events
- Webhook event replay capability

#### 3. Analytics and Reporting

**Endpoints:**
- `GET /analytics/revenue` - Revenue metrics
- `GET /analytics/subscriptions` - Subscription analytics
- `GET /analytics/churn` - Churn analysis

**Database:**
- Add analytics tables or views
- Aggregate webhook events for reporting

#### 4. Testing Infrastructure

- Unit tests for services and utilities
- Integration tests for API endpoints
- E2E tests for critical flows
- Webhook testing utilities
- Mock Stripe for testing without API calls

#### 5. Monitoring and Observability

- Structured logging (Winston, Pino)
- Error tracking (Sentry, Datadog)
- Performance monitoring (APM)
- Webhook delivery monitoring
- Database query performance tracking

#### 6. Performance Optimization

- Response caching (Redis)
- Database connection pooling
- Stripe API response caching
- GraphQL layer (if needed)
- Background job processing

#### 7. Security Enhancements

- API key authentication (for server-to-server)
- Webhook IP allowlist (Stripe IPs only)
- Request signing for mobile app
- Rate limiting per user (not just IP)
- CSRF protection (if serving HTML)

---

## API Expansion Ideas

### Potential New Features

1. **Discounts and Coupons:**
   - `POST /stripe/coupons/apply` - Apply coupon to customer
   - `GET /stripe/coupons` - List available coupons

2. **Refunds:**
   - `POST /stripe/refunds` - Issue refund
   - `GET /stripe/refunds` - List refunds

3. **Payment Intents (One-time Payments):**
   - `POST /stripe/payment-intents` - Create payment intent
   - `GET /stripe/payment-intents/:id` - Get payment status

4. **Metered Billing:**
   - `POST /stripe/usage-records` - Report usage
   - `GET /stripe/usage-summary` - Get current period usage

5. **Tax Calculation:**
   - Integrate Stripe Tax
   - Calculate tax on checkout
   - Store tax IDs

6. **Webhooks Management:**
   - `GET /webhooks/status` - Webhook health status
   - `GET /webhooks/events` - List processed events (for debugging)
   - `POST /webhooks/replay/:id` - Replay failed event

---

## Database Schema Evolution

### Current (Supabase)

```
stripe_customer_mapping
  - clerk_user_id → stripe_customer_id

stripe_webhook_events
  - stripe_event_id, event_type, processed_at
```

### Future (Postgres + Drizzle)

```
users (if migrating from Supabase)
  - id, clerk_user_id, email, name, ...

stripe_customers
  - id, user_id, stripe_customer_id, email, name

stripe_subscriptions
  - id, customer_id, subscription_id, status, price_id, ...

stripe_webhook_events
  - id, event_id, event_type, processed_at, data (jsonb)

stripe_invoices (optional)
  - id, customer_id, invoice_id, amount, status, ...

stripe_payment_methods (optional)
  - id, customer_id, payment_method_id, type, is_default
```

---

## Architecture Improvements

### API Versioning

Consider adding version prefix for breaking changes:

```
/api/v1/stripe/products  (current)
/api/v2/stripe/products  (future)
```

### GraphQL Layer (Optional)

If frontend/mobile needs complex queries:

```graphql
query {
  currentUser {
    stripeCustomer {
      id
      subscriptions {
        id
        status
        plan {
          name
          price
        }
      }
    }
  }
}
```

### Microservices (Long-term)

If backend grows significantly:

- Separate payment service (Stripe)
- Separate auth service (Clerk wrapper)
- Separate webhook processor (event handling)
- API Gateway to route requests

---

## DevOps and Infrastructure

### CI/CD Pipeline

```yaml
# Suggested .github/workflows/server.yml
- Lint and type check
- Run tests
- Build Docker image
- Deploy to staging
- Run E2E tests
- Deploy to production (manual approval)
```

### Monitoring

- **Uptime:** Ping health endpoint every 5 minutes
- **Errors:** Alert on 5xx errors or Stripe failures
- **Webhooks:** Alert if webhook delivery fails > 3 times
- **Performance:** Track P95/P99 response times

### Scaling

- **Horizontal:** Multiple server instances behind load balancer
- **Database:** Read replicas for Postgres
- **Caching:** Redis for frequently accessed data
- **Queue:** Background job processing for webhooks

---

## Documentation Improvements

### Future Documents

1. **Deployment Guide** - Step-by-step production deployment
2. **Runbook** - Operational procedures (restart, rollback, etc.)
3. **Architecture Decision Records (ADR)** - Document major decisions
4. **API Changelog** - Track API changes and versions
5. **Performance Tuning Guide** - Optimization techniques

### Integration Guides

1. **Frontend Integration** - How to call backend from Next.js
2. **Mobile Integration** - How to call backend from React Native
3. **Webhook Integration** - How to subscribe and handle events
4. **Testing Guide** - How to test locally and in CI

---

## Team Onboarding

### New Developer Checklist

For new team members:

- [ ] Read [README.md](./README.md) for overview
- [ ] Review [Roadmap](./00-backend-development-roadmap.md) for status
- [ ] Study [Architecture](./02-backend-architecture-plan.md)
- [ ] Set up local environment (follow server README)
- [ ] Run test scripts to verify setup
- [ ] Make a small change and test locally
- [ ] Review [Security Best Practices](./05-security-and-best-practices.md)

---

## Metrics to Track

### Business Metrics
- Active subscriptions count
- Monthly recurring revenue (MRR)
- Churn rate
- Failed payment rate
- Coupon usage

### Technical Metrics
- API response time (P50, P95, P99)
- Error rate by endpoint
- Webhook processing time
- Database query performance
- Cache hit rate (if caching added)

### Operational Metrics
- Server uptime
- Webhook delivery success rate
- Stripe API error rate
- Database connection pool usage
- Memory/CPU usage

---

## Questions to Consider

Before Phase 5 and beyond:

1. **Database:**
   - Is Supabase meeting our needs?
   - Do we need more control over database?
   - What's the migration effort vs benefit?

2. **Scaling:**
   - What's our expected traffic?
   - Do we need caching?
   - Should we separate webhook processing?

3. **Features:**
   - What payment features do users need most?
   - Should we support multiple payment methods?
   - Do we need usage-based billing?

4. **Security:**
   - Do we need SOC 2 compliance?
   - Should we add fraud detection?
   - Do we need audit logging?

5. **Operations:**
   - What monitoring/alerting do we need?
   - How do we handle incidents?
   - What's our rollback strategy?

---

## Resources and Learning

### Stripe
- [Stripe Integration Best Practices](https://stripe.com/docs/development/best-practices)
- [Stripe Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Stripe Security Guide](https://stripe.com/docs/security)

### Node.js/Express
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)

### Database
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)

### Architecture
- [Clean Architecture in Node.js](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [API Design Best Practices](https://swagger.io/resources/articles/best-practices-in-api-design/)

---

## Summary

**Current State:**
- ✅ Phases 0-4 complete
- ✅ Production-ready with manual setup
- ✅ Comprehensive documentation

**Next Actions:**
1. Complete manual setup (webhooks, database)
2. Deploy to production
3. Monitor and iterate

**Future Work:**
- Phase 5: Postgres migration (when ready)
- Additional payment features as needed
- Infrastructure and monitoring improvements

---

For questions or to discuss next steps, refer to the full documentation in this directory or consult the [Implementation Checklist](./IMPLEMENTATION-CHECKLIST.md).
