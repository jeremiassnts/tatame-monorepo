# Architecture Overview and Findings

**Document version:** 1.0  
**Last updated:** 2026-02-05  
**Scope:** Codebase analysis for backend development planning.

---

## 1. Architecture Overview

### 1.1 Monorepo Structure

```
tatame-monorepo/
├── apps/
│   ├── server/          # Express backend (Node.js)
│   └── web/             # Next.js frontend
├── packages/
│   ├── config/          # Shared TypeScript base config
│   ├── db/              # Drizzle + Postgres schema and client (not used in Phase 1)
│   └── env/             # Environment validation (server + web)
├── bts.jsonc            # Better-T-Stack manifest
├── package.json         # Root workspace scripts
├── pnpm-workspace.yaml
└── turbo.json           # Turborepo task graph
```

- **Tooling:** pnpm workspaces, Turborepo, TypeScript (strict), ESM.
- **Backend runtime:** Node.js; build via tsdown (ESM output).
- **Database:** Postgres + Drizzle are configured (docker-compose, schema, migrations) but are **out of scope** for the Stripe-only phase; Supabase remains the data source.

### 1.2 Backend (Express) — Current Setup

- **Entry:** `apps/server/src/index.ts`.
- **Stack:** Express 5, `cors`, `express.json()`, `@tatame-monorepo/env/server`, `@tatame-monorepo/db` (dependency only; **not imported or used** in code).
- **Routes:** Single `GET /` returning `200 OK`.
- **Config:** CORS origin and methods come from env; no route modules, no middleware beyond CORS and JSON.
- **Env:** Validated via `@t3-oss/env-core` + Zod in `packages/env/src/server.ts`. Required: `DATABASE_URL`, `CORS_ORIGIN`, `NODE_ENV`.

### 1.3 Frontend (Next.js)

- **App:** Next.js 16, React 19, Tailwind, shadcn/ui, theme provider.
- **Env:** `packages/env/src/web.ts` — `NEXT_PUBLIC_SERVER_URL` only. No Clerk or Supabase references in the repo.

### 1.4 Shared Packages

- **config:** Base `tsconfig` only.
- **db:** Drizzle client, empty schema export, docker-compose for Postgres, drizzle-kit config. Used by server only as a dependency; **no runtime usage** in current server code.
- **env:** Centralised env with Zod; server env is tied to `DATABASE_URL` (Postgres).

### 1.5 External Systems (Not in Repo)

- **Clerk:** Frontend authentication; backend must consume JWT/session (to be integrated).
- **Supabase:** Current data storage; backend will coexist with it (read/write as needed).
- **Mobile app (React Native + Expo):** Referenced in context; not present in this monorepo. Assumed to call the same Express API and use Clerk for auth.

---

## 2. Findings

### 2.1 Backend

| Finding | Severity | Notes |
|--------|----------|--------|
| No Stripe usage | Expected | No Stripe SDK, env, or routes; to be added in Phase 1. |
| No auth middleware | High | No Clerk JWT verification; all routes are effectively public. Must be added before or with protected Stripe routes. |
| Server depends on `@tatame-monorepo/db` | Medium | Package is listed but not imported. For Supabase-only phase, consider not loading Drizzle or making `DATABASE_URL` optional in server env to avoid coupling to Postgres. |
| Server env requires `DATABASE_URL` | Medium | Env validation will fail without Postgres URL. Phase 1 strategy: either make it optional when using Supabase only, or add a separate server env schema for the “Supabase-only” mode. |
| Single-file app | Low | No route or service structure yet; suitable for adding a clear folder layout (routes, services, middleware, config). |
| CORS and JSON only | Low | Good base; need to add auth middleware and error-handling strategy. |

### 2.2 Integrations

| Finding | Severity | Notes |
|--------|----------|--------|
| Clerk not in repo | Info | Backend design must assume Clerk-issued JWTs; no code to inspect. |
| Supabase not in repo | Info | Backend design must assume Supabase client or REST usage; no code to inspect. |
| Stripe not in repo | Info | All Stripe usage to be introduced; no legacy behaviour to preserve. |

### 2.3 Consistency and Maintainability

| Finding | Severity | Notes |
|--------|----------|--------|
| Env split (server vs web) | Good | Clear separation; server env can be extended with Stripe and Supabase vars. |
| TypeScript strict | Good | Strict and consistent config; suitable for adding typed services and DTOs. |
| No API versioning | Low | No `/v1` or similar; can be defined in API design before implementation. |

---

## 3. Assumptions and Constraints

### 3.1 Assumptions

- The **mobile app** (React Native + Expo) will call the same Express API and use Clerk for auth; the backend contract must suit both web and mobile.
- **Clerk** will remain the source of truth for identity; the backend only validates tokens and optionally stores Clerk user id in Supabase for mapping to Stripe customers.
- **Supabase** will remain the primary data store until an explicit migration phase; no Drizzle/Postgres usage in Phase 1.
- **Stripe** will be used for products, prices, and later customers/subscriptions/webhooks; no other payment provider in scope for this plan.
- The **Next.js app** in this repo may not yet use Clerk or Supabase; the plan still assumes they are or will be used on the frontend and that the backend must align with that.

### 3.2 Constraints

- **No implementation** in this phase — analysis and planning only.
- **No Postgres/Drizzle** for backend data in Phase 1; Supabase only.
- **No frontend changes** in Phase 1.
- **Stripe-only** as the first backend feature set (connection, products, prices; foundation for customers and webhooks).

### 3.3 Risks and Gaps

- **Env:** Current server env requires `DATABASE_URL`. Until Supabase-only is formalised, either make it optional or provide a dummy value for local runs that do not use Postgres.
- **Auth order:** If Stripe routes are implemented before Clerk middleware, they could be exposed as public; implement auth validation in the same or earlier phase than protected routes.
- **Supabase access:** No existing pattern in repo for Supabase (client, service role, env). The backend will need a dedicated Supabase client/config and a clear policy on which tables/operations are allowed.
- **Mobile app:** Not in repo; API design and auth flow must be documented so mobile can integrate without access to this codebase.

---

## 4. Summary

The monorepo provides a minimal but solid Express backend with shared env and TypeScript. There are no Stripe, Clerk, or Supabase implementations in the repo yet; the backend plan must introduce them in a controlled way. The main follow-ups are: extend server env for Stripe and Supabase (and optionally relax or bypass `DATABASE_URL` for Phase 1), introduce Clerk verification and route structure, and define how Supabase is used alongside a Stripe-only feature set. The next document ([02-backend-architecture-plan.md](./02-backend-architecture-plan.md)) details the Stripe-first backend architecture and integration flow.
