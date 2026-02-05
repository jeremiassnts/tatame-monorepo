# Tatame Backend Server

Node.js (Express) backend for Tatame monorepo with Stripe integration, Clerk authentication, and Supabase data storage.

## Features

- **Stripe Integration**: Products, prices, customers, and webhook event handling
- **Authentication**: Clerk JWT verification for protected routes
- **Data Storage**: Supabase for user-Stripe mappings and webhook event tracking
- **Type Safety**: Full TypeScript with strict mode
- **Environment Validation**: Zod-based env variable validation at startup

## Quick Start

### Prerequisites

- Node.js 18+ (or Bun)
- pnpm 8+
- Stripe account (test mode)
- Clerk account
- Supabase project

### Installation

From the monorepo root:

```bash
pnpm install
```

### Environment Setup

1. Copy the example environment file:

```bash
cd apps/server
cp .env.example .env
```

2. Fill in your credentials:

```bash
# Stripe (from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # See webhook setup guide

# Clerk (from https://dashboard.clerk.com)
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (from https://app.supabase.com/project/_/settings/api)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-service-role-key

# Server
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

### Database Setup (Supabase)

Execute the SQL migrations in your Supabase project:

1. Open Supabase SQL Editor
2. Run the SQL from `../../docs/backend/supabase-migrations.sql`
3. Verify tables were created:
   - `stripe_customer_mapping`
   - `stripe_webhook_events`

See [Webhook Setup Guide](../../docs/backend/07-webhook-setup-guide.md) for detailed instructions.

### Development

Start the server in development mode with hot-reload:

```bash
pnpm dev
```

Server runs on `http://localhost:3000`

### Build

Build for production:

```bash
pnpm build
```

### Production

Run the production build:

```bash
pnpm start
```

## API Endpoints

### Public

- `GET /` - Health check

### Protected (Require Clerk JWT)

- `GET /stripe/products` - List Stripe products
- `GET /stripe/products/:id` - Get product by ID
- `GET /stripe/prices` - List Stripe prices
- `GET /stripe/prices/:id` - Get price by ID
- `POST /stripe/customer` - Create or get Stripe customer

### Webhooks (Stripe Signature Required)

- `POST /webhooks/stripe` - Receive Stripe webhook events

See [API Reference](../../docs/backend/API-REFERENCE.md) for detailed documentation.

## Project Structure

```
src/
├── index.ts              # Express app entry point
├── middleware/
│   ├── auth.ts          # Clerk authentication middleware
│   └── errorHandler.ts  # Centralized error handling
├── routes/
│   ├── stripe.ts        # Stripe API routes (protected)
│   └── webhooks.ts      # Webhook routes (signature-verified)
├── services/
│   ├── stripe/          # Stripe SDK wrapper
│   ├── supabase/        # Supabase client and queries
│   └── webhooks/        # Webhook event handlers
└── types/
    └── express.d.ts     # TypeScript type extensions
```

## Webhook Setup

For local webhook testing:

### Option 1: Stripe CLI (Recommended)

```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:3000/webhooks/stripe

# In another terminal, trigger test events
stripe trigger customer.subscription.created
```

### Option 2: ngrok

```bash
# Terminal 1: Start server
pnpm dev

# Terminal 2: Start ngrok
ngrok http 3000

# Use ngrok URL in Stripe Dashboard webhook configuration
```

See [Webhook Setup Guide](../../docs/backend/07-webhook-setup-guide.md) for complete instructions.

## Testing

### Manual Testing

```bash
# Health check
curl http://localhost:3000/

# Get products (requires Clerk token)
curl -X GET "http://localhost:3000/stripe/products" \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN"

# Trigger webhook (requires Stripe CLI)
stripe trigger customer.created
```

### Type Checking

```bash
pnpm check-types
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | No | Environment mode (development/production/test) |
| `CORS_ORIGIN` | Yes | Allowed CORS origin URL |
| `STRIPE_SECRET_KEY` | Yes | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase service role key |
| `DATABASE_URL` | No | PostgreSQL connection (optional for Supabase-only mode) |

## Documentation

Full documentation is available in `docs/backend/`:

- **[Roadmap](../../docs/backend/00-backend-development-roadmap.md)** - Development phases and status
- **[Architecture](../../docs/backend/02-backend-architecture-plan.md)** - System design and boundaries
- **[API Design](../../docs/backend/03-api-design.md)** - Endpoint contracts
- **[Security](../../docs/backend/05-security-and-best-practices.md)** - Security guidelines
- **[Webhook Setup](../../docs/backend/07-webhook-setup-guide.md)** - Webhook configuration guide
- **[API Reference](../../docs/backend/API-REFERENCE.md)** - Quick API reference
- **[Checklist](../../docs/backend/IMPLEMENTATION-CHECKLIST.md)** - Implementation status

## Troubleshooting

### Server won't start

- Check all required env variables are set
- Verify Stripe and Clerk credentials are valid
- Check Supabase URL and service role key

### Authentication errors (401)

- Verify Clerk credentials are correct
- Check token is being sent in `Authorization` header
- Ensure Clerk instance matches (dev/prod)

### Webhook signature errors

- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Check webhook is configured correctly in Stripe
- Ensure raw body parsing is working

### Database errors

- Verify Supabase tables exist (run migrations)
- Check Supabase credentials
- Verify service role key has proper permissions

See [Webhook Setup Guide](../../docs/backend/07-webhook-setup-guide.md) for detailed troubleshooting.

## Contributing

When adding new features:

1. Follow the established architecture (routes → services → integrations)
2. Add env variables to `packages/env/src/server.ts`
3. Use the error handler for consistent error responses
4. Update API documentation
5. Add tests when available

## License

See root LICENSE file.

---

For questions or issues, refer to the [backend documentation](../../docs/backend/README.md).
