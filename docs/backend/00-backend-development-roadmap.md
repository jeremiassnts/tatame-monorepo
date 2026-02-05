# Backend Development Roadmap

**Document version:** 1.2  
**Last updated:** 2026-02-05  
**Status:** Phase 3 (Supabase coexistence) — Implemented.

---

## Purpose

This roadmap defines a phased plan to evolve the Node.js (Express) backend from its current minimal state to a **Stripe-first backend** while:

- Keeping **Supabase** as the data source (no Postgres/Drizzle usage yet).
- Respecting **Clerk**-based authentication from the frontend.
- Following clean architecture and best practices.
- Enabling future migration to Postgres and expansion of backend features.

---

## Current State Summary

- **Monorepo:** Better-T-Stack (Next.js, Express, Postgres + Drizzle available but **not used** for Phase 1).
- **Backend:** Minimal Express app; single health route; CORS and JSON middleware; env via `@tatame-monorepo/env/server`.
- **Auth/Data:** Clerk (frontend) and Supabase (data) are **not present in this repo**; they are integration targets and constraints.
- **First goal:** Stripe-only backend (connection, products, prices; foundation for customers, subscriptions, webhooks).

---

## Phased Roadmap

| Phase | Name | Objective | Outcome | Status |
|-------|------|-----------|---------|--------|
| **0** | Analysis & planning | Understand codebase; define architecture and API | This documentation set | ✅ Complete |
| **1** | Stripe setup | Secure Stripe connection; list products and prices | Working Stripe-backed endpoints | ✅ Complete |
| **2** | Auth integration | Validate Clerk JWT in Express; protect routes | Authenticated API access | ✅ Complete |
| **3** | Supabase coexistence | Use Supabase from Express where needed; map Stripe ↔ users | Backend can read/write Supabase as required | ✅ Complete |
| **4** | Webhooks (future) | Stripe webhook endpoint; signature verification; idempotency | Ready for subscriptions/events | 🔜 Next |
| **5** | Migration prep (future) | Plan and checklist for Supabase → Postgres | No execution in Phase 1 | 📋 Planned |

---

## Document Index

| # | Document | Content |
|---|----------|---------|
| 01 | [Architecture Overview and Findings](./01-architecture-overview-and-findings.md) | Codebase analysis; findings; assumptions and constraints |
| 02 | [Backend Architecture Plan](./02-backend-architecture-plan.md) | Stripe-first architecture; boundaries; Clerk/Supabase/Stripe integration |
| 03 | [API Design](./03-api-design.md) | Contract for `GET /stripe/products`, `GET /stripe/prices`, optional `POST /stripe/customer` |
| 04 | [Supabase Coexistence Strategy](./04-supabase-coexistence-strategy.md) | What stays in Supabase; mapping; migration readiness |
| 05 | [Security and Best Practices](./05-security-and-best-practices.md) | Clerk verification; Stripe secrets; webhooks; logging and errors |
| 06 | [Execution Templates](./06-execution-templates.md) | Reusable templates for Stripe setup, Auth, Supabase→Postgres, Webhooks |

---

## Implementation Status

### Phase 1 Complete (2026-02-05)

Implemented the Stripe setup phase with the following:

- **Environment variables:** Added `STRIPE_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY` to server env schema; made `DATABASE_URL` optional for Supabase-only mode.
- **Dependencies:** Added Stripe SDK and @clerk/express to server.
- **Services:** Created Stripe service layer (`services/stripe/`) that encapsulates all Stripe API calls.
- **Middleware:** Implemented Clerk authentication middleware and centralized error handler.
- **Routes:** Created `/stripe/products` and `/stripe/prices` endpoints with authentication and query parameter validation.
- **Documentation:** Created `.env.example` with all required environment variables.

All Stripe routes are protected by Clerk JWT authentication and return consistent error responses per the API design.

### Phase 3 Complete (2026-02-05)

Implemented the Supabase coexistence phase with the following:

- **Environment variables:** Added `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to server env schema.
- **Dependencies:** Added `@supabase/supabase-js` client library to server.
- **Services:** Created Supabase service layer (`services/supabase/`) with methods for managing Stripe customer mappings.
- **Customer endpoint:** Implemented `POST /stripe/customer` endpoint that creates or retrieves Stripe customers with idempotent mapping to Clerk user IDs in Supabase.
- **Mapping logic:** Store `clerk_user_id` ↔ `stripe_customer_id` in Supabase `stripe_customer_mapping` table for future subscription and payment handling.
- **Documentation:** Updated `.env.example` with Supabase credentials.

The backend now integrates with Supabase for storing user-Stripe customer mappings while keeping Stripe as the source of truth for products, prices, and customer data.

### Next Steps

- Phase 4: Implement Stripe webhooks for event handling
- Phase 5: Plan and execute Supabase → Postgres migration
