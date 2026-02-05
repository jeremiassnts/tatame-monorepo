# Backend Architecture Plan (Stripe-Focused)

**Document version:** 1.0  
**Last updated:** 2026-02-05  
**Scope:** Logical architecture and module responsibilities for a Stripe-first Node.js backend.

---

## 1. Goals

- Introduce **Stripe** as the first backend capability (connection, products, prices; foundation for customers and webhooks).
- Keep **Supabase** as the data source; no Postgres/Drizzle in this phase.
- Validate **Clerk** JWTs in Express and protect Stripe (and future) routes.
- Keep clear boundaries: routes → services → integrations (Stripe, Supabase, Clerk).

---

## 2. Logical Architecture (Textual)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Web / Mobile)                              │
│  - Next.js or React Native + Expo                                            │
│  - Clerk SDK: login, session, JWT in Authorization header                   │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ HTTPS + Bearer JWT
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXPRESS BACKEND (apps/server)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────────────────┐ │
│  │  Middleware │  │   Routes     │  │  Services / Integrations             │ │
│  │  - CORS     │  │  /stripe/*   │  │  - Stripe service (SDK wrapper)      │ │
│  │  - JSON     │  │  / (health)  │  │  - Clerk verification (JWT)         │ │
│  │  - Auth     │  │              │  │  - Supabase client (when needed)     │ │
│  │  - Error    │  │              │  │  - Env / config                      │ │
│  └─────────────┘  └──────────────┘  └─────────────────────────────────────┘ │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Clerk       │       │     Stripe      │       │    Supabase     │
│  (verify JWT)   │       │  (products,     │       │  (data store    │
│                 │       │   prices, etc.) │       │   for now)      │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

**Flow (high-level):**

1. Client sends request with `Authorization: Bearer <Clerk JWT>`.
2. Express auth middleware verifies the JWT with Clerk (public key or backend API); rejects invalid/expired tokens.
3. Route handler calls a Stripe service (or Supabase when needed); service uses env for API keys and does not expose secrets.
4. Response is returned in a consistent shape (e.g. JSON with a standard envelope for errors).

---

## 3. Responsibility Boundaries

### 3.1 Routes (HTTP Layer)

- **Responsibility:** Parse request, call service(s), format response, delegate errors to error middleware.
- **Does not:** Call Stripe SDK directly, validate JWT manually, or access env secrets.
- **Location (suggested):** `apps/server/src/routes/` (e.g. `stripe.ts`, `health.ts` or keep health in index).

### 3.2 Services (Application Layer)

- **Stripe service:** Single place that talks to the Stripe SDK (list products, list prices, later create customer, etc.). Uses `STRIPE_SECRET_KEY` from env. Returns domain-friendly data or re-exposes Stripe types as chosen by the API contract.
- **Auth / Clerk:** Encapsulates JWT verification (e.g. Clerk’s backend verify or JWKS). Used by middleware; exposes a simple “user/session or null” for the request.
- **Supabase (when needed):** Client initialisation and access to tables; used for mapping Clerk user id ↔ Stripe customer id or other app data. Not used for Stripe product/price listing (those come from Stripe only).

### 3.3 Integrations (External Boundaries)

- **Stripe:** Wrapped in the Stripe service; no raw Stripe calls in routes or in multiple places.
- **Clerk:** Used only for verification; no Clerk usage inside Stripe or Supabase logic.
- **Supabase:** Used only where app data is needed; Stripe data lives in Stripe.

### 3.4 Middleware

- **CORS, JSON:** Already present; keep and configure via env.
- **Auth:** Runs on protected routes; verifies Clerk JWT and attaches user/session to request (e.g. `req.auth`).
- **Error handler:** Centralised; maps thrown errors or service errors to HTTP status and a consistent JSON body; logs appropriately.

### 3.5 Config / Env

- **Single source:** `@tatame-monorepo/env/server` (or equivalent). All secrets and feature flags (e.g. Stripe enabled, Supabase URL) come from env and are validated at startup.

---

## 4. Folder / Module Responsibility Map (Suggested)

| Path (under `apps/server/src`) | Responsibility |
|--------------------------------|----------------|
| `index.ts` | Bootstrap: load env, mount middleware and routes, start server. |
| `config/` or use `env` package | Server-specific config derived from env (e.g. Stripe enabled, API prefix). |
| `middleware/` | `auth.ts` (Clerk JWT), `errorHandler.ts`, optionally `requestId.ts`. |
| `routes/` | Route definitions; delegate to services. |
| `services/stripe/` | Stripe SDK wrapper; list products, list prices, (later) create customer. |
| `services/auth/` or `lib/auth` | Clerk JWT verification. |
| `services/supabase/` or `lib/supabase` | Supabase client and helpers (when needed). |
| `types/` or inline | Request extensions (e.g. `AuthUser`), shared response shapes. |

**Note:** No `packages/db` usage in this phase; Supabase client lives in server only (or a future shared package if desired).

---

## 5. Integration Flow: Client → Clerk → API → Stripe

1. **Client** (web or mobile): User is signed in with Clerk; Clerk provides a session token (JWT).
2. **Client** sends HTTP request to Express: `GET /stripe/products` with header `Authorization: Bearer <Clerk JWT>`.
3. **Express** auth middleware: Validates JWT with Clerk (e.g. JWKS or Clerk’s verify endpoint); on success attaches identity to `req`; on failure returns 401.
4. **Express** route: Calls Stripe service “list products” (and optionally “list prices” or combined).
5. **Stripe service:** Uses Stripe SDK with `STRIPE_SECRET_KEY`; returns products (and prices if in contract).
6. **Express** route: Maps service result to API response body; returns 200.
7. **Client** receives JSON list of products.

**Optional (future):** If the app needs to associate Stripe customers with users, the route or a dedicated “customer” service can read/write Supabase (e.g. `user_id` ↔ `stripe_customer_id`) and call Stripe to create or retrieve the customer.

---

## 6. Environment Variable Strategy

### 6.1 Local

- `.env` in `apps/server/` (or root if server loads from root). Never committed; use `.env.example` with placeholder keys.
- Required for Phase 1 (Stripe): `STRIPE_SECRET_KEY`, `CORS_ORIGIN`, and existing server vars. If Postgres is not used, `DATABASE_URL` can be optional or a dummy value for env validation only.
- Clerk: `CLERK_SECRET_KEY` or `CLERK_PUBLISHABLE_KEY` + JWKS URL for verification.
- Supabase (when used): `SUPABASE_URL`, `SUPABASE_ANON_KEY` (or anon key if no elevated access needed).

### 6.2 Staging / Production

- Same variable names; values from secret manager or platform env (e.g. Vercel, Railway, etc.).
- Use distinct Stripe keys (test vs live) and Clerk instances per environment.
- CORS and `NEXT_PUBLIC_SERVER_URL` (or API base URL) set per environment.

### 6.3 Validation

- Keep using Zod in `packages/env` (or server-specific schema). Add optional vs required per phase: e.g. `STRIPE_SECRET_KEY` required when Stripe routes are enabled; `DATABASE_URL` optional when Supabase-only.

---

## 7. Summary

- **Routes** handle HTTP; **services** encapsulate Stripe, Clerk, and Supabase.
- **Stripe** is accessed only through a dedicated service layer.
- **Clerk** is used only for JWT verification in middleware.
- **Supabase** is used only for app data (e.g. user–Stripe mapping), not for Stripe catalog data.
- **Env** is the single source for secrets and config; validation at startup.  
Next: [03-api-design.md](./03-api-design.md) for endpoint contracts.
