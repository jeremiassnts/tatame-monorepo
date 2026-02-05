# Backend Documentation

This directory contains comprehensive documentation for the Node.js (Express) backend development.

## 🚀 Quick Navigation

**📋 What was done?** → [**IMPLEMENTATION-SUMMARY.md**](./IMPLEMENTATION-SUMMARY.md) ⭐ **START HERE**

**👔 Non-technical overview?** → [**EXECUTIVE-SUMMARY.md**](./EXECUTIVE-SUMMARY.md)

**🚀 New developer setup?** → [**QUICKSTART.md**](./QUICKSTART.md) - Get running in 5 minutes!

**📖 Need API docs?** → [**API-REFERENCE.md**](./API-REFERENCE.md)

**❓ Have questions?** → [**FAQ.md**](./FAQ.md)

**🐛 Having issues?** → [**TROUBLESHOOTING.md**](./TROUBLESHOOTING.md)

**🗺️ Browse all docs?** → [**DOCUMENT-INDEX.md**](./DOCUMENT-INDEX.md)

---

## Quick Links

### 📋 Overview & Getting Started

- **[IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md)** ⭐ What was done and what to do next
- **[EXECUTIVE-SUMMARY.md](./EXECUTIVE-SUMMARY.md)** 👔 High-level overview for stakeholders
- **[QUICKSTART.md](./QUICKSTART.md)** 🚀 5-minute setup guide
- **[DOCUMENT-INDEX.md](./DOCUMENT-INDEX.md)** 🗺️ Complete documentation navigation
- **[00-backend-development-roadmap.md](./00-backend-development-roadmap.md)** ⭐ Phased development plan and status
- **[ARCHITECTURE-OVERVIEW.md](./ARCHITECTURE-OVERVIEW.md)** 📊 Visual architecture guide with diagrams
- **[01-architecture-overview-and-findings.md](./01-architecture-overview-and-findings.md)** - Codebase analysis and architecture overview
- **[02-backend-architecture-plan.md](./02-backend-architecture-plan.md)** - Stripe-first architecture design
- **[03-api-design.md](./03-api-design.md)** - API contracts for all endpoints
- **[04-supabase-coexistence-strategy.md](./04-supabase-coexistence-strategy.md)** - Supabase integration strategy
- **[05-security-and-best-practices.md](./05-security-and-best-practices.md)** - Security guidelines and best practices
- **[06-execution-templates.md](./06-execution-templates.md)** - Reusable implementation templates

### 📖 Setup & Implementation Guides

- **[07-webhook-setup-guide.md](./07-webhook-setup-guide.md)** - Stripe webhook setup and testing guide
- **[IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md)** ⭐ Phase 4 completion checklist and manual setup steps
- **[supabase-migrations.sql](./supabase-migrations.sql)** ⚠️ SQL migrations to run in Supabase
- **[supabase-validation.sql](./supabase-validation.sql)** - SQL queries to verify Supabase setup

### 📚 Reference & Support

- **[API-REFERENCE.md](./API-REFERENCE.md)** - Quick API reference with examples
- **[FAQ.md](./FAQ.md)** - Frequently asked questions
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and changes
- **[NEXT-STEPS.md](./NEXT-STEPS.md)** - Future improvements and recommendations

### 🚀 Quick Start Guide

#### For First-Time Setup:
1. ⭐ Read the [**Roadmap**](./00-backend-development-roadmap.md) to understand current status
2. 📖 Follow [**Implementation Checklist**](./IMPLEMENTATION-CHECKLIST.md) for manual setup
3. ⚠️ Run SQL from [**supabase-migrations.sql**](./supabase-migrations.sql) in Supabase
4. 🔧 Configure environment variables (see `apps/server/.env.example`)
5. 🎯 Set up webhooks with [**Webhook Setup Guide**](./07-webhook-setup-guide.md)

#### For Understanding the System:
1. Review [Architecture (01-02)](./01-architecture-overview-and-findings.md) for design decisions
2. Check [API Reference](./API-REFERENCE.md) for endpoint documentation
3. Study [Security Best Practices (05)](./05-security-and-best-practices.md)

#### When You Need Help:
1. 🔍 Check [**Troubleshooting Guide**](./TROUBLESHOOTING.md) first
2. 📋 Review [Implementation Checklist](./IMPLEMENTATION-CHECKLIST.md) for setup issues
3. 🔮 See [Next Steps](./NEXT-STEPS.md) for future improvements

### ✅ Implementation Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 | ✅ Complete | Analysis & planning |
| Phase 1 | ✅ Complete | Stripe setup (products, prices) |
| Phase 2 | ✅ Complete | Clerk authentication integration |
| Phase 3 | ✅ Complete | Supabase coexistence & customer mapping |
| Phase 4 | ✅ Complete | Stripe webhooks with idempotency |
| Phase 5 | 📋 Planned | Supabase → Postgres migration |

### 🔧 Key Features Implemented

- **Stripe Integration:**
  - List products and prices
  - Create/retrieve customers
  - Webhook event handling
  
- **Authentication:**
  - Clerk JWT verification
  - Protected routes
  
- **Data Storage:**
  - Supabase for user-Stripe mappings
  - Webhook event idempotency tracking
  
- **Security:**
  - Signature verification for webhooks
  - Environment variable validation
  - Error handling and logging

### 📦 Backend Structure

```
apps/server/src/
├── index.ts                 # Express app entry point
├── middleware/
│   ├── auth.ts             # Clerk authentication
│   └── errorHandler.ts     # Centralized error handling
├── routes/
│   ├── stripe.ts           # Stripe API routes (protected)
│   └── webhooks.ts         # Webhook routes (signature-verified)
├── services/
│   ├── stripe/             # Stripe API service layer
│   ├── supabase/           # Supabase client and queries
│   └── webhooks/           # Webhook event handlers
└── types/
    └── express.d.ts        # TypeScript type extensions
```

### 🗄️ Database Tables

#### Supabase Tables Required

1. **`stripe_customer_mapping`** - Maps Clerk users to Stripe customers
   ```sql
   clerk_user_id → stripe_customer_id
   ```

2. **`stripe_webhook_events`** - Tracks processed webhook events for idempotency
   ```sql
   stripe_event_id, event_type, processed_at
   ```

See [Webhook Setup Guide](./07-webhook-setup-guide.md) for SQL schema.

### 🔐 Environment Variables

Required environment variables (see `apps/server/.env.example`):

```bash
# Server
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-service-role-key
```

### 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Documentation](https://expressjs.com/)

---

For questions, issues, or contributions, refer to the specific document relevant to your concern or consult the [Execution Templates](./06-execution-templates.md) for implementation guidance.
