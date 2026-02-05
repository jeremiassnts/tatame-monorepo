# Architecture Overview - Visual Guide

**Version:** 1.0  
**Last updated:** 2026-02-05  

Visual representation of the Tatame backend architecture.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │   Next.js Web    │              │  React Native    │         │
│  │   (Port 3001)    │              │  Mobile App      │         │
│  │                  │              │                  │         │
│  │  - Clerk Auth    │              │  - Clerk Auth    │         │
│  │  - UI Components │              │  - Expo          │         │
│  └────────┬─────────┘              └────────┬─────────┘         │
│           │                                 │                   │
│           │ HTTP + Bearer JWT               │                   │
└───────────┼─────────────────────────────────┼───────────────────┘
            │                                 │
            ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS BACKEND                             │
│                      (Port 3000)                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    MIDDLEWARE LAYER                         │ │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌───────────────┐         │ │
│  │  │ CORS │→ │ JSON │→ │ Auth │→ │ Error Handler │         │ │
│  │  └──────┘  └──────┘  └──────┘  └───────────────┘         │ │
│  │                                                             │ │
│  │  Special: /webhooks/* → Raw Body Parser                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     ROUTES LAYER                            │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │ GET /        │  │ /stripe/*    │  │ /webhooks/*  │    │ │
│  │  │ (Health)     │  │ (Protected)  │  │ (Signature)  │    │ │
│  │  └──────────────┘  └──────┬───────┘  └──────┬───────┘    │ │
│  │                            │                  │             │ │
│  └────────────────────────────┼──────────────────┼─────────────┘ │
│                               │                  │               │
│  ┌────────────────────────────┼──────────────────┼─────────────┐ │
│  │                    SERVICES LAYER             │             │ │
│  │                               │                  │             │ │
│  │  ┌─────────────────┐  ┌───────▼──────┐  ┌──────▼────────┐ │ │
│  │  │ Auth Service    │  │   Stripe     │  │   Webhook     │ │ │
│  │  │ (Clerk verify)  │  │   Service    │  │   Service     │ │ │
│  │  └────────┬────────┘  └───────┬──────┘  └──────┬────────┘ │ │
│  │           │                    │                 │          │ │
│  │           │         ┌──────────▼─────────────────▼────────┐│ │
│  │           │         │    Supabase Service                 ││ │
│  │           │         │    (Customer & Event tracking)      ││ │
│  │           │         └─────────────────────────────────────┘│ │
│  └───────────┼──────────────────────────────────────────────────┘ │
└──────────────┼──────────────────────────────────────────────────┘
               │
     ┌─────────┼─────────────────────────────┐
     │         │                             │
     ▼         ▼                             ▼
┌─────────┐ ┌─────────────┐        ┌──────────────────┐
│  Clerk  │ │   Stripe    │        │    Supabase      │
│         │ │             │        │                  │
│ Verify  │ │ Products    │        │ - Customer Maps  │
│  JWT    │ │ Prices      │        │ - Webhook Events │
│         │ │ Customers   │        │                  │
│         │ │ Webhooks    │        │                  │
└─────────┘ └─────────────┘        └──────────────────┘
```

---

## Request Flow Diagrams

### 1. Authenticated API Request (e.g., GET /stripe/products)

```
┌─────────┐                                                      ┌─────────┐
│ Client  │                                                      │  Clerk  │
└────┬────┘                                                      └────┬────┘
     │                                                                │
     │ 1. GET /stripe/products                                        │
     │    Authorization: Bearer <jwt>                                 │
     ├──────────────────────────────────────┐                         │
     │                                      │                         │
     │                        ┌─────────────▼───────────┐             │
     │                        │  Express Backend        │             │
     │                        │                         │             │
     │                        │  2. Auth Middleware     │             │
     │                        │     Extract JWT         │             │
     │                        └──────────┬──────────────┘             │
     │                                   │                            │
     │                                   │ 3. Verify JWT              │
     │                                   ├───────────────────────────►│
     │                                   │                            │
     │                                   │ 4. Valid (user info)       │
     │                                   │◄───────────────────────────┤
     │                        ┌──────────▼──────────────┐             │
     │                        │  5. Route Handler       │             │
     │                        │     /stripe/products    │             │
     │                        └──────────┬──────────────┘             │
     │                                   │                            │
     │                        ┌──────────▼──────────────┐   ┌─────────────┐
     │                        │  6. Stripe Service      │   │   Stripe    │
     │                        │     listProducts()      ├───►  API        │
     │                        └──────────┬──────────────┘   └─────────────┘
     │                                   │                            │
     │                        ┌──────────▼──────────────┐             │
     │                        │  7. Format Response     │             │
     │ 8. 200 OK              │     { data: [...] }     │             │
     │    { data: products }  │                         │             │
     │◄───────────────────────┤                         │             │
     │                        └─────────────────────────┘             │
     │                                                                │
```

### 2. Customer Creation (POST /stripe/customer)

```
┌─────────┐                                              ┌──────────┐
│ Client  │                                              │ Supabase │
└────┬────┘                                              └────┬─────┘
     │                                                         │
     │ 1. POST /stripe/customer                                │
     │    Authorization: Bearer <jwt>                          │
     │    { email, name }                                      │
     ├──────────────────────────────────┐                      │
     │                    ┌─────────────▼─────────────┐        │
     │                    │  Express Backend          │        │
     │                    │  2. Auth + Validate       │        │
     │                    └──────────┬────────────────┘        │
     │                               │                         │
     │                               │ 3. Check existing       │
     │                               │    customer mapping     │
     │                               ├────────────────────────►│
     │                               │                         │
     │                               │ 4. Not found            │
     │                               │◄────────────────────────┤
     │                    ┌──────────▼────────────────┐        │
     │                    │  5. Stripe Service        │  ┌──────────┐
     │                    │     createCustomer()      ├─►│  Stripe  │
     │                    └──────────┬────────────────┘  └──────────┘
     │                               │                         │
     │                               │ 6. Store mapping        │
     │                               │    clerk_id → stripe_id │
     │                               ├────────────────────────►│
     │                               │                         │
     │ 7. 201 Created                │ 7. Success              │
     │    { data: customer,          │◄────────────────────────┤
     │      created: true }          │                         │
     │◄──────────────────────────────┤                         │
     │                               │                         │
```

### 3. Webhook Processing (POST /webhooks/stripe)

```
┌──────────┐                                              ┌──────────┐
│  Stripe  │                                              │ Supabase │
└────┬─────┘                                              └────┬─────┘
     │                                                          │
     │ 1. POST /webhooks/stripe                                 │
     │    Stripe-Signature: ...                                 │
     │    { id: "evt_...", type: "...", data: {...} }          │
     ├──────────────────────────────────┐                       │
     │                    ┌─────────────▼──────────────┐        │
     │                    │  Express Backend           │        │
     │                    │                            │        │
     │                    │  2. Extract raw body       │        │
     │                    │  3. Verify signature       │        │
     │                    └──────────┬─────────────────┘        │
     │                               │                          │
     │                               │ 4. Check if processed    │
     │                               ├─────────────────────────►│
     │                               │                          │
     │                               │ 5. Not processed         │
     │                               │◄─────────────────────────┤
     │                    ┌──────────▼─────────────────┐        │
     │                    │  6. Webhook Service        │        │
     │                    │     Process event          │        │
     │                    │     by type                │        │
     │                    └──────────┬─────────────────┘        │
     │                               │                          │
     │                               │ 7. Mark as processed     │
     │                               ├─────────────────────────►│
     │                               │                          │
     │ 8. 200 OK                     │ 8. Success               │
     │    { received: true }         │◄─────────────────────────┤
     │◄──────────────────────────────┤                          │
     │                               │                          │
```

---

## Data Flow

### Customer Data Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    Clerk     │    │   Supabase   │    │    Stripe    │
│              │    │              │    │              │
│  user_id     │◄──►│  Mapping     │◄──►│  customer_id │
│  (identity)  │    │  Table       │    │  (payment)   │
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                           │ Maps:
                           │ clerk_user_id → stripe_customer_id
                           │
                    ONE user = ONE customer
```

### Webhook Event Flow

```
Stripe Event        Backend Processing         Database Storage
─────────────      ───────────────────        ─────────────────

customer.created        ┌─────────┐          stripe_webhook_events
      │                 │ Receive │                │
      ├────────────────►│ Verify  │                │
      │                 │ Check   ├───────────────►│ Insert event_id
      │                 │ Process │                │ event_type
      │                 │ Store   │                │ processed_at
      │                 └─────────┘                │
      │                     │                      │
      ◄─────────────────────┘                      │
    200 OK            (Idempotent)                 │
                                                   │
    [Same event resent]                            │
      │                 ┌─────────┐                │
      ├────────────────►│ Receive │                │
      │                 │ Verify  │                │
      │                 │ Check   │◄──────────────┤ Found: skip
      │                 └─────────┘                │
      │                     │                      │
      ◄─────────────────────┘                      │
  200 OK (duplicate)                               │
```

---

## Module Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│  apps/server/src/index.ts (Entry Point)                    │
└────┬────────────────────────────────────────────────────────┘
     │
     ├─► middleware/
     │   ├─► auth.ts (@clerk/express)
     │   └─► errorHandler.ts
     │
     ├─► routes/
     │   ├─► stripe.ts
     │   └─► webhooks.ts
     │
     └─► services/
         ├─► stripe/
         │   └─► index.ts (Stripe SDK)
         ├─► supabase/
         │   └─► index.ts (@supabase/supabase-js)
         └─► webhooks/
             └─► index.ts (Event handlers)

┌─────────────────────────────────────────────────────────────┐
│  packages/env/src/server.ts (Environment Validation)        │
│  - Validates all env vars at startup                        │
│  - Used by all services and middleware                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Layers

```
┌────────────────────────────────────────────────────────────┐
│                     Request Journey                         │
└────────────────────────────────────────────────────────────┘

Incoming Request
      │
      ▼
┌─────────────────┐
│  1. CORS Check  │  ← Blocks requests from unauthorized origins
└────────┬────────┘
         │ ✓
         ▼
┌─────────────────┐
│  2. Body Parse  │  ← JSON or Raw (webhooks)
└────────┬────────┘
         │ ✓
         ▼
┌─────────────────┐
│  3. Auth Layer  │  ← Protected routes: Clerk JWT verification
│                 │  ← Webhooks: Stripe signature verification
└────────┬────────┘
         │ ✓
         ▼
┌─────────────────┐
│  4. Route       │  ← Input validation (Zod schemas)
│     Handler     │  ← Business logic
└────────┬────────┘
         │ ✓
         ▼
┌─────────────────┐
│  5. Service     │  ← External API calls
│     Layer       │  ← Database operations
└────────┬────────┘
         │ ✓
         ▼
┌─────────────────┐
│  6. Response    │  ← Consistent JSON format
│                 │  ← Error handling
└────────┬────────┘
         │
         ▼
Response Sent
```

---

## Environment Variables Flow

```
┌──────────────────────────────────────────────────────────────┐
│  .env file (local) or Platform Secrets (production)          │
│                                                               │
│  STRIPE_SECRET_KEY=sk_test_...                               │
│  STRIPE_WEBHOOK_SECRET=whsec_...                             │
│  CLERK_PUBLISHABLE_KEY=pk_test_...                           │
│  CLERK_SECRET_KEY=sk_test_...                                │
│  SUPABASE_URL=https://...                                    │
│  SUPABASE_SERVICE_ROLE_KEY=...                               │
│  CORS_ORIGIN=http://localhost:3001                           │
│  NODE_ENV=development                                        │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────┐
         │  packages/env/src/server.ts          │
         │  (Validates with Zod at startup)     │
         └────────────────┬─────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
    ┌────────┐      ┌─────────┐      ┌──────────┐
    │ Stripe │      │  Clerk  │      │ Supabase │
    │Service │      │ Middle- │      │ Service  │
    │        │      │  ware   │      │          │
    └────────┘      └─────────┘      └──────────┘
```

---

## File Structure Map

```
tatame-monorepo/
│
├── apps/server/                    # Backend application
│   ├── src/
│   │   ├── index.ts               # Entry point & Express setup
│   │   ├── middleware/
│   │   │   ├── auth.ts           # Clerk JWT verification
│   │   │   └── errorHandler.ts  # Centralized error handling
│   │   ├── routes/
│   │   │   ├── stripe.ts         # Products, prices, customer
│   │   │   └── webhooks.ts       # Webhook event receiver
│   │   ├── services/
│   │   │   ├── stripe/
│   │   │   │   └── index.ts     # Stripe SDK wrapper
│   │   │   ├── supabase/
│   │   │   │   └── index.ts     # Supabase client & queries
│   │   │   └── webhooks/
│   │   │       └── index.ts     # Event handlers
│   │   └── types/
│   │       └── express.d.ts     # TypeScript extensions
│   ├── scripts/
│   │   ├── test-api.sh          # API testing script
│   │   └── test-webhooks.sh     # Webhook testing script
│   ├── .env.example              # Environment template
│   ├── package.json              # Dependencies & scripts
│   └── README.md                 # Server documentation
│
├── packages/env/                  # Shared environment validation
│   └── src/
│       └── server.ts             # Server env schema (Zod)
│
└── docs/backend/                  # Comprehensive documentation
    ├── README.md                  # Documentation index (start here)
    ├── 00-backend-development-roadmap.md
    ├── 01-architecture-overview-and-findings.md
    ├── 02-backend-architecture-plan.md
    ├── 03-api-design.md
    ├── 04-supabase-coexistence-strategy.md
    ├── 05-security-and-best-practices.md
    ├── 06-execution-templates.md
    ├── 07-webhook-setup-guide.md
    ├── API-REFERENCE.md           # Quick API reference
    ├── FAQ.md                     # Common questions
    ├── TROUBLESHOOTING.md         # Problem solving
    ├── DEPLOYMENT.md              # Production deployment
    ├── CHANGELOG.md               # Version history
    ├── NEXT-STEPS.md              # Future improvements
    ├── IMPLEMENTATION-CHECKLIST.md # Setup checklist
    ├── supabase-migrations.sql    # Database migrations
    └── supabase-validation.sql    # Database verification
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Backend Stack                           │
└─────────────────────────────────────────────────────────────┘

Runtime:
  ├─ Node.js 20+
  └─ TypeScript 5+ (strict mode)

Framework:
  └─ Express 5

Authentication:
  └─ Clerk (@clerk/express)
      ├─ JWT verification
      └─ User identity

Payment Processing:
  └─ Stripe SDK
      ├─ Products & Prices API
      ├─ Customers API
      └─ Webhooks API

Database:
  └─ Supabase (@supabase/supabase-js)
      ├─ Customer mappings
      └─ Event tracking

Validation:
  ├─ Zod (schemas & parsing)
  └─ @t3-oss/env-core (env validation)

Utilities:
  ├─ cors (CORS handling)
  └─ dotenv (env loading)

Build Tools:
  ├─ tsdown (build)
  ├─ tsx (dev watch)
  └─ pnpm (package manager)
```

---

## Database Schema

```
Supabase Database
─────────────────

┌──────────────────────────────────────┐
│  stripe_customer_mapping             │
├──────────────────────────────────────┤
│  id                  UUID PK          │
│  user_id             TEXT             │
│  clerk_user_id       TEXT UNIQUE     │ ← Auth identifier
│  stripe_customer_id  TEXT UNIQUE     │ ← Payment identifier
│  created_at          TIMESTAMP       │
│  updated_at          TIMESTAMP       │
└──────────────────────────────────────┘
         │
         │ One-to-One mapping
         │
┌──────────────────────────────────────┐
│  stripe_webhook_events               │
├──────────────────────────────────────┤
│  id                  UUID PK          │
│  stripe_event_id     TEXT UNIQUE     │ ← Idempotency key
│  event_type          TEXT            │ ← Event classification
│  processed_at        TIMESTAMP       │
│  created_at          TIMESTAMP       │
└──────────────────────────────────────┘

Indexes:
  ✓ clerk_user_id (fast user lookup)
  ✓ stripe_customer_id (fast customer lookup)
  ✓ stripe_event_id (fast event lookup)
  ✓ event_type (analytics)
```

---

## API Endpoints Map

```
┌─────────────────────────────────────────────────────────────┐
│                    API Endpoint Tree                         │
└─────────────────────────────────────────────────────────────┘

/
├── GET /                           [Public]
│   └─ Health check
│
├── /stripe                         [Protected - Clerk JWT]
│   ├── GET /products
│   │   └─ List Stripe products
│   ├── GET /products/:id
│   │   └─ Get product by ID
│   ├── GET /prices
│   │   └─ List Stripe prices
│   ├── GET /prices/:id
│   │   └─ Get price by ID
│   └── POST /customer
│       └─ Create/get customer for user
│
└── /webhooks                       [Stripe Signature]
    └── POST /stripe
        └─ Process Stripe webhook events

Legend:
  [Public]           - No authentication required
  [Protected]        - Requires valid Clerk JWT
  [Stripe Signature] - Requires valid Stripe signature
```

---

## Integration Points

```
┌───────────────────────────────────────────────────────────────┐
│                    External Integrations                       │
└───────────────────────────────────────────────────────────────┘

Clerk (Authentication)
  ├─ Purpose: User identity and JWT verification
  ├─ Used in: middleware/auth.ts
  ├─ API calls: JWT verification (via @clerk/express)
  └─ Data stored: None (JWT claims only)

Stripe (Payments)
  ├─ Purpose: Products, prices, customers, subscriptions, webhooks
  ├─ Used in: services/stripe/, routes/webhooks.ts
  ├─ API calls: 
  │   ├─ Products: list, retrieve
  │   ├─ Prices: list, retrieve
  │   ├─ Customers: create, retrieve
  │   └─ Webhooks: constructEvent (verification)
  └─ Data stored: None (Stripe is source of truth)

Supabase (Database)
  ├─ Purpose: User-customer mappings, webhook event tracking
  ├─ Used in: services/supabase/
  ├─ Tables:
  │   ├─ stripe_customer_mapping (Clerk ↔ Stripe)
  │   └─ stripe_webhook_events (Processed events)
  └─ Data stored: Mappings and event logs only
```

---

## Deployment Architecture

### Development

```
┌──────────────┐     ┌──────────────┐
│  Developer   │     │   Stripe     │
│  Machine     │────►│   Test       │
│              │     │   Mode       │
│  localhost   │     └──────────────┘
│  :3000       │            │
└──────┬───────┘            │
       │                    │
       │     ┌──────────────▼──────┐
       │     │  Stripe CLI         │
       │     │  (Webhook Forward)  │
       │     └──────────┬──────────┘
       │                │
       ▼                ▼
   ┌──────────────────────────────┐
   │  Express Server              │
   │  - Clerk Dev                 │
   │  - Supabase Dev Project      │
   └──────────────────────────────┘
```

### Production

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Web App    │     │  Mobile App  │     │   Stripe     │
│  (Vercel)    │     │   (Expo)     │     │   Live       │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                     │
       │ HTTPS              │ HTTPS               │ Webhooks
       │                    │                     │ (HTTPS)
       ▼                    ▼                     │
   ┌────────────────────────────────────────┐    │
   │     Load Balancer / API Gateway        │    │
   └───────────────┬────────────────────────┘    │
                   │                             │
                   ▼                             │
   ┌────────────────────────────────────────┐    │
   │   Express Server (Railway/DO/etc)      │◄───┘
   │   - Clerk Production                   │
   │   - Stripe Live Keys                   │
   └───────────────┬────────────────────────┘
                   │
                   ▼
   ┌────────────────────────────────────────┐
   │   Supabase Production                  │
   │   - Customer mappings                  │
   │   - Webhook events                     │
   └────────────────────────────────────────┘
```

---

## Monitoring Points

```
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Points                         │
└─────────────────────────────────────────────────────────────┘

Application Layer:
  ├─ Health endpoint (/)
  │   └─ Response time < 50ms
  ├─ API endpoints (/stripe/*)
  │   ├─ Response time P95 < 500ms
  │   ├─ Error rate < 1%
  │   └─ Request rate
  └─ Webhook endpoint
      ├─ Signature success rate > 99%
      ├─ Processing time < 1s
      └─ Idempotency check rate

External Services:
  ├─ Stripe API
  │   ├─ Availability
  │   ├─ Response time
  │   └─ Error rate
  ├─ Clerk Verification
  │   ├─ JWT verification time
  │   └─ Success rate
  └─ Supabase
      ├─ Query performance
      ├─ Connection count
      └─ Storage usage

Infrastructure:
  ├─ Server
  │   ├─ CPU usage < 70%
  │   ├─ Memory usage < 80%
  │   └─ Uptime > 99.9%
  └─ Network
      ├─ Bandwidth usage
      └─ Request latency
```

---

## Error Propagation

```
Error Source           Handler                Client Response
─────────────         ─────────              ────────────────

Clerk JWT Invalid  →  Auth Middleware    →  401 UNAUTHORIZED
                      (protectRoute)          "Invalid or expired token"

Stripe API Error   →  Error Handler      →  502 SERVICE_ERROR
                      (StripeError)           "Payment service unavailable"

Validation Error   →  Error Handler      →  400 VALIDATION_ERROR
                      (ZodError)              "Invalid request parameters"

Database Error     →  Error Handler      →  500 INTERNAL_ERROR
                      (Generic Error)         "Unexpected error occurred"

Webhook Signature  →  Webhook Route      →  400 INVALID_SIGNATURE
  Invalid             (constructEvent)        "Invalid webhook signature"

All errors logged on server side (without sensitive data)
```

---

## Scaling Strategy

```
Current (Single Instance):

┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────┐
│   Express   │────►│  Stripe  │
│   Server    │     └──────────┘
│             │     ┌──────────┐
│             │────►│ Supabase │
└─────────────┘     └──────────┘

Future (Scaled):

┌─────────────┐
│   Clients   │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Load Balancer   │
└────────┬─────────┘
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐
│Server 1│ │Server 2│ │Server 3│
└───┬────┘ └───┬────┘ └───┬────┘
    │          │          │
    └──────────┴──────────┴─────────┐
                                    │
              ┌─────────────────────┼──────────┐
              │                     │          │
              ▼                     ▼          ▼
         ┌─────────┐         ┌──────────┐ ┌─────────┐
         │ Stripe  │         │  Redis   │ │Supabase │
         │   API   │         │  Cache   │ │ (Pool)  │
         └─────────┘         └──────────┘ └─────────┘
```

---

## Quick Reference

| Aspect | Details |
|--------|---------|
| **Language** | TypeScript (ESM) |
| **Runtime** | Node.js 20+ |
| **Framework** | Express 5 |
| **Port** | 3000 (configurable) |
| **Auth** | Clerk JWT |
| **Payments** | Stripe API |
| **Database** | Supabase (PostgreSQL) |
| **Build** | tsdown |
| **Dev Server** | tsx watch |

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /` | None | Health check |
| `GET /stripe/products` | Clerk | List products |
| `GET /stripe/prices` | Clerk | List prices |
| `POST /stripe/customer` | Clerk | Create customer |
| `POST /webhooks/stripe` | Stripe Sig | Process events |

| Service | Purpose | External API |
|---------|---------|--------------|
| Stripe | Payment operations | Stripe API |
| Supabase | Data persistence | Supabase REST API |
| Webhooks | Event processing | Internal |
| Auth | JWT verification | Clerk JWKS |

---

## Related Documentation

- **[API Reference](./API-REFERENCE.md)** - Detailed endpoint documentation
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment
- **[FAQ](./FAQ.md)** - Common questions
- **[Roadmap](./00-backend-development-roadmap.md)** - Implementation status

---

**Architecture documentation complete!** For implementation details, see the main [README](./README.md).
