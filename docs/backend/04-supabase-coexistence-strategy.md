# Supabase Coexistence Strategy

**Document version:** 1.0  
**Last updated:** 2026-02-05  
**Scope:** How Supabase coexists with the Node.js backend until a future Postgres migration; no execution.

---

## 1. Context

- **Current data store:** Supabase (PostgreSQL-backed; Supabase SDK/REST).
- **Backend:** Express in this monorepo; must use Supabase for app data until migration.
- **Future:** Migration to Postgres + Drizzle in this repo (not in Phase 1). This document defines policy and preparation only.

---

## 2. What Stays in Supabase

- **User and app data** that the product already uses: user profiles, app-specific entities, feature flags, etc.
- **Clerk ↔ app user mapping** (if stored): e.g. Clerk user id linked to an internal user or profile row.
- **Stripe ↔ user mapping (when implemented):** e.g. table or columns that store `user_id` (or Clerk id) and `stripe_customer_id` for idempotent customer creation and subscription handling.
- **Any existing tables** that the frontend or other services currently read/write via Supabase; the Node backend should not duplicate or replace them without an explicit migration decision.

---

## 3. What Must Not Be Duplicated (Yet)

- **Stripe catalog data:** Products and prices live in Stripe only. The backend must not mirror them into Supabase in Phase 1; responses are built from Stripe API only.
- **Auth state:** Sessions and identity are in Clerk; Supabase may store a link to Clerk user id but not replace Clerk as the source of truth for authentication.
- **Postgres in this repo:** The `packages/db` (Drizzle + Postgres) setup is not used for backend data in Phase 1. No writes to the monorepo’s Postgres for app data until migration is decided and executed.

---

## 4. Mapping Stripe IDs to Supabase Users

- **When creating or retrieving a Stripe customer:** The backend will need a stable “user” identifier. Prefer **Clerk user id** (or a single internal user id stored in Supabase and linked to Clerk) as the key.
- **Storage:** In Supabase, maintain a mapping table (or equivalent) such as: `user_id` (or `clerk_user_id`) ↔ `stripe_customer_id`. This allows:
  - Idempotent “get or create” Stripe customer per user.
  - Future subscription and payment-method logic to resolve “current user” → Stripe customer.
- **Ownership:** Only the Node backend (and any trusted server-side process) should create or update this mapping; frontend and mobile must not write Stripe customer ids directly.

---

## 5. Migration Readiness Checklist (No Execution)

Before any future migration from Supabase to Postgres (Drizzle) in this repo:

- [ ] **Inventory:** List all Supabase tables and columns in use by the app and by the Node backend.
- [ ] **Schema alignment:** Design Drizzle schema in `packages/db` that can represent the same data (types, constraints, indexes).
- [ ] **Access patterns:** Document which operations (read/write) each feature uses so that Drizzle queries and migrations can be designed.
- [ ] **Stripe mapping:** Ensure the Stripe–user mapping table (or equivalent) is included in the schema and migration plan.
- [ ] **Secrets and env:** Plan for switching from Supabase URL/key to `DATABASE_URL` for the monorepo Postgres; ensure no dual-write period without a clear cutover or sync strategy.
- [ ] **Rollback:** Define how to revert or run in “Supabase mode” again if migration fails.
- [ ] **Timing:** Migration is out of scope for Phase 1; this checklist is for a later phase.

---

## 6. Supabase Usage Policy (Backend)

- **Read/write:** Backend may read and write Supabase only where the product requires it (e.g. user profile, Stripe customer mapping). No speculative or duplicate storage of Stripe catalog.
- **Credentials:** Use a single Supabase client (or minimal set) initialised from env (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` or anon key as appropriate). Prefer service role only when elevated access is required; restrict by RLS if using anon key.
- **Errors:** Treat Supabase errors like any other integration: log, map to HTTP status (e.g. 502/503), and avoid exposing internal details to the client.
- **No Postgres (Drizzle) in Phase 1:** Do not use `packages/db` or `DATABASE_URL` for app data until the migration phase.

---

## 7. Summary

- **Supabase** remains the app data store; Stripe catalog stays in Stripe only.
- **Stripe–user mapping** is stored in Supabase and keyed by Clerk (or internal user) id.
- **No duplication** of Stripe catalog or auth state; no use of monorepo Postgres for app data in Phase 1.
- **Migration** to Postgres is prepared via checklist and schema planning in a later phase.  
Next: [05-security-and-best-practices.md](./05-security-and-best-practices.md).
