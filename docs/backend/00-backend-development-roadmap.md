# Backend Development Roadmap

**Document version:** 1.0  
**Last updated:** 2026-02-05  
**Status:** Planning only — no implementation.

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

| Phase | Name | Objective | Outcome |
|-------|------|-----------|---------|
| **0** | Analysis & planning | Understand codebase; define architecture and API | This documentation set |
| **1** | Stripe setup | Secure Stripe connection; list products and prices | Working Stripe-backed endpoints |
| **2** | Auth integration | Validate Clerk JWT in Express; protect routes | Authenticated API access |
| **3** | Supabase coexistence | Use Supabase from Express where needed; map Stripe ↔ users | Backend can read/write Supabase as required |
| **4** | Webhooks (future) | Stripe webhook endpoint; signature verification; idempotency | Ready for subscriptions/events |
| **5** | Migration prep (future) | Plan and checklist for Supabase → Postgres | No execution in Phase 1 |

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

## Constraints (Reminder)

- **No code implementation** in this planning phase.
- **No Postgres migration** until a later phase.
- **No frontend changes** in Phase 1.
- **No SQL or Stripe code** in the deliverables — planning and documentation only.
