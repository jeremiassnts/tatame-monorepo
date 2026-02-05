# API Design (Stripe Endpoints)

**Document version:** 1.0  
**Last updated:** 2026-02-05  
**Scope:** Contract for Phase 1 Stripe endpoints; no implementation.

---

## 1. Conventions

- **Base path:** All Stripe-related endpoints are under a common prefix (e.g. `/stripe` or `/api/v1/stripe`). Examples below use `/stripe`.
- **Authentication:** Protected routes require `Authorization: Bearer <Clerk JWT>`. Missing or invalid token → `401 Unauthorized`.
- **Content type:** Request and response bodies are JSON (`Content-Type: application/json`).
- **Errors:** Consistent envelope (e.g. `{ "error": { "code": "...", "message": "..." } }`). Status code reflects HTTP semantics; body carries machine-readable code and human-readable message where appropriate.

---

## 2. Endpoints

### 2.1 GET /stripe/products

**Purpose:** Return a list of Stripe products (e.g. for display in web or mobile). Optionally filter by active-only or limit count.

**Authentication:** Required (Clerk JWT).

**Input:**

- **Query parameters (optional):**
  - `active`: boolean (e.g. `true` to return only active products). Default behaviour (if omitted) to be defined (e.g. default to active-only).
  - `limit`: positive integer; max items to return. Upper bound and default to be defined (e.g. default 10, max 100).

**Output (success):**

- **Status:** `200 OK`
- **Body:** List of product objects. Each product has at least: identifier (e.g. `id`), `name`, `description` (if present), `active`, and any other fields agreed for the API (e.g. `images`). Whether to include prices in this response or only via `/stripe/prices` is a design choice; if included, structure (e.g. nested array or separate key) must be defined.

**Error scenarios:**

| Scenario | Status | Notes |
|----------|--------|--------|
| Missing or invalid auth token | 401 | Invalid signature, expired, or missing. |
| Stripe API error (e.g. network, invalid key) | 502 or 503 | Backend cannot complete request to Stripe; message must not leak Stripe internals. |
| Invalid query params (e.g. negative limit) | 400 | Validation error; message describes the problem. |

---

### 2.2 GET /stripe/prices

**Purpose:** Return a list of Stripe prices (e.g. for a product or all active prices). Used to show pricing options and to prepare for checkout or subscription flows.

**Authentication:** Required (Clerk JWT).

**Input:**

- **Query parameters (optional):**
  - `product`: Stripe product id; filter prices by product.
  - `active`: boolean; filter by active status.
  - `limit`: positive integer; max items. Default and max to be defined (e.g. default 10, max 100).

**Output (success):**

- **Status:** `200 OK`
- **Body:** List of price objects. Each price has at least: identifier (e.g. `id`), `product` (product id), `unit_amount` (or equivalent), `currency`, `recurring` (if subscription), and any other fields agreed for the API.

**Error scenarios:**

| Scenario | Status | Notes |
|----------|--------|--------|
| Missing or invalid auth token | 401 | Same as products. |
| Stripe API error | 502 or 503 | Same as products. |
| Invalid query params | 400 | Same as products. |

---

### 2.3 POST /stripe/customer (Optional / Future)

**Purpose:** Create or retrieve a Stripe customer for the authenticated user. Used when the app needs to attach payment methods or subscriptions to a user. Optional for Phase 1; include in design for future implementation.

**Authentication:** Required (Clerk JWT).

**Input:**

- **Body (optional):** Metadata (e.g. email, name) to set on the Stripe customer. If omitted, backend may derive from Clerk user or leave minimal.

**Output (success):**

- **Status:** `200 OK` (or `201 Created` if customer was created).
- **Body:** Customer object with at least: `id` (Stripe customer id). May include `email`, `metadata`, etc., as agreed. Backend should persist mapping (e.g. in Supabase) from Clerk user id to Stripe customer id for idempotency and future use.

**Error scenarios:**

| Scenario | Status | Notes |
|----------|--------|--------|
| Missing or invalid auth token | 401 | Same as above. |
| Stripe API error | 502 or 503 | Same as above. |
| Conflict (e.g. customer already exists for user) | 200 or 409 | Design choice: return existing customer with 200, or 409 if strict create-only semantics. |

---

## 3. Common Error Response Shape

All error responses should use a consistent structure so clients can parse them uniformly. Suggested high-level shape:

- **Field:** `error` (object).
  - **Subfields:** e.g. `code` (string, machine-readable), `message` (string, human-readable). Optional: `details` for validation errors (e.g. list of invalid fields).

Example (conceptual): `{ "error": { "code": "UNAUTHORIZED", "message": "Invalid or expired token." } }`.

---

## 4. Summary

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /stripe/products` | Required | List Stripe products (optional filters). |
| `GET /stripe/prices` | Required | List Stripe prices (optional filters by product/active). |
| `POST /stripe/customer` | Required (future) | Create or get Stripe customer for current user. |

No implementation in this phase; this document is the contract for implementation and for frontend/mobile integration. Next: [04-supabase-coexistence-strategy.md](./04-supabase-coexistence-strategy.md).
