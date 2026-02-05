# Webhook Setup Guide

**Document version:** 1.0  
**Last updated:** 2026-02-05  
**Status:** Implementation guide for Phase 4 (Webhooks).

---

## Purpose

This guide provides step-by-step instructions for setting up Stripe webhooks with the Node.js backend, including Stripe Dashboard configuration, Supabase table creation, and testing.

---

## 1. Supabase Database Setup

### 1.1 Create Webhook Events Table

Create the `stripe_webhook_events` table in Supabase to track processed events and ensure idempotency:

```sql
-- Create stripe_webhook_events table for idempotent webhook processing
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on stripe_event_id for fast lookup
CREATE INDEX idx_stripe_webhook_events_event_id ON stripe_webhook_events(stripe_event_id);

-- Create index on event_type for analytics/monitoring
CREATE INDEX idx_stripe_webhook_events_event_type ON stripe_webhook_events(event_type);

-- Add comment
COMMENT ON TABLE stripe_webhook_events IS 'Tracks processed Stripe webhook events for idempotency';
```

### 1.2 Verify Table Creation

In your Supabase project:

1. Go to **Table Editor**
2. Confirm the `stripe_webhook_events` table exists
3. Verify the columns: `id`, `stripe_event_id`, `event_type`, `processed_at`, `created_at`

---

## 2. Environment Variables

Add the following to your `.env` file:

```bash
# Stripe Webhook Secret
# Get this from Stripe Dashboard after creating webhook endpoint
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Note:** The webhook secret is unique to each webhook endpoint. If you have separate endpoints for development, staging, and production, each will have its own secret.

---

## 3. Stripe Dashboard Configuration

### 3.1 Create Webhook Endpoint

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   - **Local development (with tunnel):** `https://your-ngrok-url.ngrok.io/webhooks/stripe`
   - **Staging/Production:** `https://your-domain.com/webhooks/stripe`
4. Select **API version:** Use the latest or match your Stripe SDK version (currently `2024-12-18.acacia`)

### 3.2 Select Events to Listen

Select the events you want to receive. The backend currently handles:

**Customer Events:**
- `customer.created`
- `customer.updated`
- `customer.deleted`

**Subscription Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**Payment Events:**
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Checkout Events:**
- `checkout.session.completed`
- `checkout.session.expired`

You can select **"Select all customer events"**, **"Select all subscription events"**, etc., or choose individual events based on your needs.

### 3.3 Get Webhook Secret

After creating the endpoint:

1. Click on the newly created endpoint
2. Click **"Reveal"** next to **Signing secret**
3. Copy the secret (starts with `whsec_`)
4. Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

---

## 4. Local Development Setup

### 4.1 Using ngrok for Local Testing

Since Stripe needs to reach your local server, use a tunneling service like ngrok:

```bash
# Install ngrok (if not already installed)
# Visit: https://ngrok.com/download

# Start your server
pnpm dev

# In another terminal, start ngrok
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and use it in the Stripe Dashboard webhook endpoint configuration.

### 4.2 Using Stripe CLI (Alternative)

Alternatively, use the Stripe CLI to forward webhooks to your local server:

```bash
# Install Stripe CLI
# Visit: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/webhooks/stripe
```

The CLI will output a webhook signing secret. Use this in your `.env` file for local development.

---

## 5. Testing Webhooks

### 5.1 Manual Testing with Stripe CLI

Send test events using the Stripe CLI:

```bash
# Test customer.created event
stripe trigger customer.created

# Test subscription created event
stripe trigger customer.subscription.created

# Test payment succeeded event
stripe trigger invoice.payment_succeeded
```

### 5.2 Verify Processing

Check your server logs to confirm:

1. Event received
2. Signature verified
3. Event processed
4. Event marked as processed in database

Expected log output:

```
Processing webhook event: customer.created (evt_...)
Customer created: cus_...
```

### 5.3 Test Idempotency

Send the same event twice (replay the webhook in Stripe Dashboard):

1. Go to **Stripe Dashboard → Webhooks**
2. Click on your endpoint
3. Find an event in the **Event log**
4. Click **"..."** → **"Resend event"**

The second request should return `{ "received": true, "duplicate": true }` and not reprocess the event.

---

## 6. Monitoring and Debugging

### 6.1 Check Webhook Delivery in Stripe Dashboard

1. Go to **Stripe Dashboard → Webhooks**
2. Click on your endpoint
3. View the **Event log** to see:
   - Successful deliveries (200 response)
   - Failed deliveries (4xx/5xx responses)
   - Response body and timing

### 6.2 Query Processed Events in Supabase

Check which events have been processed:

```sql
SELECT 
  stripe_event_id,
  event_type,
  processed_at,
  created_at
FROM stripe_webhook_events
ORDER BY created_at DESC
LIMIT 10;
```

### 6.3 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `400 INVALID_SIGNATURE` | Wrong webhook secret or body parsing issue | Verify `STRIPE_WEBHOOK_SECRET` matches Dashboard; ensure raw body is parsed correctly |
| `400 MISSING_SIGNATURE` | Stripe-Signature header not present | Check that request is coming from Stripe; verify webhook URL is correct |
| `500` errors | Error in event handler logic | Check server logs for stack trace; fix handler implementation |
| Events not received | Webhook endpoint unreachable | Verify URL is public (ngrok/CLI for local); check firewall/CORS settings |

---

## 7. Production Checklist

Before deploying to production:

- [ ] Webhook endpoint URL uses HTTPS (required by Stripe)
- [ ] `STRIPE_WEBHOOK_SECRET` set to production webhook secret (not test secret)
- [ ] All required Stripe events are selected in webhook endpoint configuration
- [ ] Supabase `stripe_webhook_events` table created in production database
- [ ] Webhook endpoint tested with Stripe CLI or Dashboard resend feature
- [ ] Monitoring/alerting configured for webhook failures
- [ ] Rate limiting considered if webhook volume is high
- [ ] Event handlers implement proper error handling and logging
- [ ] Sensitive data (PII, payment details) not logged

---

## 8. Event Handler Customization

To add or modify event handlers, edit `apps/server/src/services/webhooks/index.ts`:

### Example: Add Custom Subscription Handler

```typescript
case "customer.subscription.created":
  await this.handleSubscriptionCreated(event);
  break;

// ... in the same file ...

async handleSubscriptionCreated(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  
  // Example: Update user subscription status in Supabase
  const customerId = subscription.customer as string;
  
  // Get Clerk user ID from Stripe customer mapping
  // ... your logic here ...
  
  // Update subscription in your database
  // ... your logic here ...
  
  console.log(`Subscription activated: ${subscription.id}`);
}
```

### Example: Send Email on Payment Failure

```typescript
async handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  
  // Get customer details
  const customerId = invoice.customer as string;
  
  // Lookup user email from Supabase
  // ... your logic here ...
  
  // Send payment failure notification
  // await emailService.sendPaymentFailedEmail(userEmail, invoice);
  
  console.log(`Payment failed notification sent for invoice ${invoice.id}`);
}
```

---

## 9. Security Best Practices

- **Always verify signature:** Never trust webhook payload without signature verification
- **Use HTTPS only:** Stripe will not send webhooks to HTTP endpoints in production
- **Keep webhook secret secure:** Treat it like a password; rotate if compromised
- **Implement idempotency:** Always check if event has been processed before taking action
- **Validate event data:** Don't assume event structure; validate types and required fields
- **Log minimally:** Don't log full event payload or customer PII
- **Return 200 quickly:** Process heavy work asynchronously to avoid Stripe retries
- **Handle unknown events gracefully:** Log and skip events your system doesn't need

---

## 10. Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Event Types Reference](https://stripe.com/docs/api/events/types)
- [Stripe Best Practices](https://stripe.com/docs/webhooks/best-practices)

---

## Summary

The webhook system provides:

- **Real-time event processing** from Stripe (subscriptions, payments, customers)
- **Idempotent handling** to prevent duplicate processing on retries
- **Signature verification** to ensure webhooks are genuinely from Stripe
- **Extensible handlers** for adding custom business logic per event type
- **Production-ready** with proper error handling, logging, and security

For questions or issues, refer to the execution templates in [06-execution-templates.md](./06-execution-templates.md).
