# Execution Templates

**Document version:** 1.0  
**Last updated:** 2026-02-05  
**Scope:** Reusable templates for future development phases. Fill in and follow when implementing each phase.

---

## How to Use

Each section below is a template. When starting a phase:

1. Copy the template (or use this doc as the source of truth).
2. Fill in **Files/Modules Affected**, **Steps to Execute**, and **Validation Checklist** with concrete paths and tasks.
3. Update **Risks** and **External Dependencies** as the codebase evolves.
4. Track completion against the checklist before closing the phase.

---

## Template 1: Stripe Setup Phase

**Phase Name:** Stripe setup (connection, products, prices)

**Objective:** Establish a secure connection to Stripe and expose `GET /stripe/products` and `GET /stripe/prices` as defined in the API design, with authentication required.

**Scope:**

- Add Stripe SDK and env vars; implement Stripe service layer.
- Implement routes for listing products and prices.
- Apply auth middleware to these routes.
- No Supabase usage for catalog data; no webhooks yet.

**Files/Modules Affected:**

- `packages/env/src/server.ts` — add Stripe (and optionally Clerk) env vars.
- `apps/server/src/` — new or updated: `services/stripe/`, `routes/stripe.ts`, `middleware/auth.ts`, `middleware/errorHandler.ts`, `index.ts` (mount routes and middleware).
- `apps/server/package.json` — add Stripe SDK (and Clerk backend SDK or JWT lib if not already present).
- `apps/server/.env.example` — document `STRIPE_SECRET_KEY`, `CORS_ORIGIN`, and any Clerk vars.

**Environment Variables:**

- `STRIPE_SECRET_KEY` (required for Stripe routes).
- `CORS_ORIGIN` (existing).
- Optional for this phase: `CLERK_SECRET_KEY` or Clerk JWKS URL for auth middleware.

**External Dependencies:**

- Stripe API (availability, rate limits, test vs live keys).
- Clerk (if auth is implemented in this phase) for JWT verification.

**Steps to Execute:**

1. Add and validate Stripe (and auth-related) env vars in `packages/env`.
2. Implement Stripe service: init SDK with secret key; implement list products and list prices (with optional query filters).
3. Implement auth middleware that verifies Clerk JWT and attaches user to request (or stub that rejects all for now if auth is deferred).
4. Implement route handlers for `GET /stripe/products` and `GET /stripe/prices`; call Stripe service; return JSON per API contract.
5. Mount routes under `/stripe` and apply auth middleware to them.
6. Add centralised error handler; map Stripe and auth errors to HTTP status and error body.
7. Document `.env.example` and update README if needed.

**Validation Checklist:**

- [ ] Server starts without missing env (Stripe key present in dev).
- [ ] Unauthenticated request to `GET /stripe/products` returns 401.
- [ ] Authenticated request returns 200 and list of products (or empty list) per contract.
- [ ] `GET /stripe/prices` behaves similarly; optional query params work.
- [ ] Stripe API errors result in 502/503 and safe message; no secret or stack in response.
- [ ] No Stripe secret in logs or client response.

**Risks:**

- Env validation may require `DATABASE_URL` today; make it optional or provide a dummy if Supabase-only.
- If auth is stubbed, ensure it is replaced before production.

---

## Template 2: Auth Integration Phase (Clerk + Express)

**Phase Name:** Auth integration (Clerk JWT verification in Express)

**Objective:** Validate Clerk-issued JWTs in the Express backend and protect all Stripe (and other sensitive) routes. Establish a single, reusable auth middleware and request identity.

**Scope:**

- Clerk JWT verification (JWKS or Clerk verify API).
- Middleware that runs on protected routes; attach user/session to request.
- Apply to all Stripe routes (and any other protected endpoints).
- No change to frontend or mobile beyond existing Clerk usage (they already send the token).

**Files/Modules Affected:**

- `packages/env/src/server.ts` — ensure Clerk-related vars are defined (e.g. `CLERK_SECRET_KEY`, or `CLERK_PUBLISHABLE_KEY` + JWKS URL).
- `apps/server/src/middleware/auth.ts` — implement verification and `req.auth` (or equivalent).
- `apps/server/src/index.ts` or route mounting — apply auth middleware to protected route groups.
- Optional: `apps/server/src/services/auth/` or `lib/auth` — encapsulate Clerk verification logic.
- `apps/server/.env.example` — document Clerk vars.

**Environment Variables:**

- `CLERK_SECRET_KEY` and/or Clerk JWKS URL (or equivalent per Clerk docs).
- `CORS_ORIGIN` (existing).

**External Dependencies:**

- Clerk API or JWKS endpoint availability.
- Correct Issuer (iss) and Audience (aud) in JWT validation to match your Clerk instance.

**Steps to Execute:**

1. Add Clerk env vars and validate at startup.
2. Implement verification function: given Bearer token, return payload or throw (e.g. invalid, expired).
3. Implement auth middleware: read `Authorization` header; verify token; set `req.auth` (e.g. `{ userId: sub }`); on failure send 401 with consistent error body.
4. Apply middleware to all routes under `/stripe` (and any other protected prefix).
5. Ensure health or public routes (e.g. `GET /`) do not use auth middleware.
6. Test with valid and invalid tokens; confirm 401 for missing/expired/invalid.

**Validation Checklist:**

- [ ] Request without `Authorization` to `GET /stripe/products` returns 401.
- [ ] Request with invalid or expired JWT returns 401.
- [ ] Request with valid Clerk JWT returns 200 (and products/prices as per Stripe phase).
- [ ] `GET /` (or other public route) still returns 200 without token.
- [ ] No Clerk secret or token logged.

**Risks:**

- Clock skew can cause valid tokens to be rejected; ensure server time is correct or allow small leeway.
- If multiple Clerk instances (e.g. dev/prod), ensure correct env per environment.

---

## Template 3: Supabase → Postgres Migration Phase

**Phase Name:** Supabase to Postgres (Drizzle) migration

**Objective:** Migrate app data from Supabase to the monorepo’s Postgres database using Drizzle, and switch the backend to use `packages/db` instead of the Supabase client. This template is for planning and execution when the migration is approved; not for Phase 1.

**Scope:**

- Design Drizzle schema that mirrors (or improves) current Supabase usage.
- Migrate data from Supabase to Postgres (export/import or ETL).
- Replace Supabase client usage in the backend with Drizzle queries.
- Update env to use `DATABASE_URL` for app data; remove or deprecate Supabase URL/key for backend.
- No change to Stripe or Clerk integration; only data store changes.

**Files/Modules Affected:**

- `packages/db/src/schema/` — new or updated tables (users, stripe_customer_mapping, etc.).
- `packages/db/` — migrations generated and applied.
- `apps/server/src/services/supabase/` or equivalent — remove or replace with services that use `packages/db`.
- `apps/server/src/` — any route or service that currently reads/writes Supabase; switch to Drizzle.
- `packages/env/src/server.ts` — `DATABASE_URL` required; Supabase vars optional or removed.
- `apps/server/package.json` — ensure `@tatame-monorepo/db` is used; remove Supabase client if no longer needed.

**Environment Variables:**

- `DATABASE_URL` — Postgres connection string for the monorepo database.
- Supabase vars — deprecated or removed for backend after cutover.

**External Dependencies:**

- Supabase export capability or API for data extraction.
- Postgres (e.g. docker-compose or hosted) for target database.
- Downtime or read-only window if doing big bang migration.

**Steps to Execute:**

1. Complete **Migration Readiness Checklist** in [04-supabase-coexistence-strategy.md](./04-supabase-coexistence-strategy.md).
2. Design Drizzle schema; generate migrations; apply to target Postgres (e.g. empty DB first).
3. Export data from Supabase (per table or full dump as appropriate).
4. Transform and load into Postgres (scripts or one-off jobs); verify row counts and constraints.
5. Implement or switch backend to use Drizzle for all former Supabase reads/writes.
6. Remove or stub Supabase client usage in server.
7. Switch env to require `DATABASE_URL`; run integration tests.
8. Plan rollback (e.g. feature flag or revert to Supabase client) if issues appear.

**Validation Checklist:**

- [ ] All tables and relationships present in Drizzle schema.
- [ ] Data in Postgres matches (or is acceptable subset of) Supabase data.
- [ ] Stripe customer mapping (and any other critical paths) work with Drizzle.
- [ ] No runtime Supabase calls in backend after cutover.
- [ ] Rollback plan documented and tested if possible.

**Risks:**

- Data loss or inconsistency if migration script has bugs; run in staging first and verify.
- Dual-write or long cutover may add complexity; prefer clear cutover window if acceptable.

---

## Template 4: Webhook Implementation Phase

**Phase Name:** Stripe webhook implementation

**Objective:** Add a dedicated endpoint for Stripe webhooks that verifies the signature, parses the event, and processes it idempotently. Prepares for subscription and payment events.

**Scope:**

- New route `POST /stripe/webhooks` (or similar) that receives Stripe event payloads.
- Raw body required for signature verification; no JSON body parser on this route.
- Verify `Stripe-Signature` using `STRIPE_WEBHOOK_SECRET`.
- Dispatch event by type (e.g. `customer.subscription.updated`); process in service layer; store or side-effect idempotently by event id.
- No change to existing products/prices or auth flow.

**Files/Modules Affected:**

- `packages/env/src/server.ts` — add `STRIPE_WEBHOOK_SECRET`.
- `apps/server/src/routes/stripe.ts` (or new `webhooks.ts`) — POST handler that reads raw body and verifies signature.
- `apps/server/src/services/stripe/` or new `services/webhooks/` — event handling and idempotency (e.g. store processed event ids in Supabase or Postgres).
- `apps/server/src/index.ts` — mount webhook route with raw body parser only for that path.
- `apps/server/.env.example` — document `STRIPE_WEBHOOK_SECRET` and webhook URL.

**Environment Variables:**

- `STRIPE_WEBHOOK_SECRET` — from Stripe Dashboard (webhook endpoint secret).
- Existing Stripe and auth vars as needed.

**External Dependencies:**

- Stripe webhook delivery (HTTPS endpoint reachable by Stripe).
- Idempotency store (Supabase or Postgres) for processed event ids.

**Steps to Execute:**

1. Add `STRIPE_WEBHOOK_SECRET` to env and validate at startup.
2. Configure Express so that the webhook route receives raw body (no global JSON parser for that path, or use a separate raw-body middleware for `/stripe/webhooks`).
3. Implement handler: read raw body; verify `Stripe-Signature` with secret; parse event; return 400 if verification fails.
4. Implement event dispatcher: by `event.type`, call appropriate handler (e.g. update subscription status in DB). Skip or log unknown types.
5. Implement idempotency: before processing, check if event id already processed; if yes return 200 without reprocessing.
6. Document webhook URL and events to subscribe in Stripe Dashboard; add to README or runbook.
7. Do not require Clerk auth for webhook route (Stripe signature is the auth).

**Validation Checklist:**

- [ ] Request without valid signature returns 400 (or 401).
- [ ] Request with valid signature and known event type is processed once; duplicate event id returns 200 without duplicate side effects.
- [ ] Response 200 returned promptly so Stripe does not retry unnecessarily.
- [ ] No webhook secret or full payload logged.
- [ ] Subscription (or other) events update app state correctly in Supabase/Postgres.

**Risks:**

- Raw body must be read before any body parser that consumes the stream; order of middleware matters.
- High event volume may require async processing (queue) in the future; initial implementation can be synchronous if fast enough.

---

## Summary

| Template | Phase | Key Outcome |
|----------|--------|-------------|
| 1. Stripe setup | First backend feature | Working products/prices endpoints with Stripe and auth. |
| 2. Auth integration | Clerk + Express | All protected routes require valid Clerk JWT. |
| 3. Supabase → Postgres | Migration (future) | Backend uses Drizzle/Postgres instead of Supabase. |
| 4. Webhooks | Stripe events | Secure, idempotent webhook endpoint for Stripe events. |

Use these templates as the execution guide for each phase; update them as the codebase and decisions evolve.
