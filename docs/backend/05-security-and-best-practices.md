# Security and Best Practices

**Document version:** 1.0  
**Last updated:** 2026-02-05  
**Scope:** Security checklist and non-functional requirements for the Stripe-first backend; no implementation.

---

## 1. Clerk Token Verification

- **Every protected route** must run auth middleware that verifies the Bearer JWT before reaching the handler.
- **Verification method:** Use Clerk’s server-side verification (e.g. JWKS or Clerk’s verify endpoint). Do not trust the token without cryptographic validation.
- **Failure behaviour:** Invalid, expired, or missing token → `401 Unauthorized` and a consistent error body; do not proceed to Stripe or Supabase.
- **No secrets in token:** Treat the JWT as opaque for auth; use only verified claims (e.g. `sub` for user id). Do not store Stripe keys or Supabase keys in the token.
- **CORS:** Keep CORS restricted to known origins (e.g. web app and, if applicable, mobile or staging URLs). Use env for allowed origins.

---

## 2. Stripe Secret Management

- **Secret key:** `STRIPE_SECRET_KEY` must be loaded from env only; never hardcoded or committed. Use test key in development/staging and live key only in production.
- **Scope:** Only the Stripe service (or equivalent encapsulated layer) should read the secret; routes and other services must not use it directly.
- **Webhook signing secret:** When webhooks are implemented, use `STRIPE_WEBHOOK_SECRET` from env and verify the `Stripe-Signature` header on every webhook request. Reject requests with invalid or missing signature.
- **Logging:** Never log the secret key, webhook secret, or full card/payment details. Log only non-sensitive identifiers (e.g. Stripe object ids, request ids) for debugging.

---

## 3. Webhook Security (Future Phase)

- **Endpoint:** Dedicated route (e.g. `POST /stripe/webhooks`) that accepts raw body for signature verification. Do not use JSON body parser before verifying the signature.
- **Verification:** Use Stripe’s SDK or documented method to verify `Stripe-Signature` with the webhook secret. Reject with 400 or 401 if verification fails.
- **Idempotency:** Process webhook events idempotently (e.g. by Stripe event id) to avoid duplicate side effects on retries.
- **Response:** Return 200 quickly after accepting the event; perform heavy work asynchronously if needed so Stripe does not retry unnecessarily.

---

## 4. Supabase and Env

- **Service role key:** If the backend uses the Supabase service role key, treat it as a secret: env only, no logging, no exposure to client. Prefer least privilege (e.g. RLS or a dedicated role) if possible.
- **Env validation:** All required secrets and URLs must be validated at server startup (e.g. via Zod in `@tatame-monorepo/env/server`). Fail fast if a required variable is missing or invalid in the target environment.

---

## 5. Logging and Error Handling

- **Structured logging:** Use a consistent format (e.g. level, message, request id, timestamp). Include request id (or correlation id) in logs for tracing.
- **Sensitive data:** Do not log request/response bodies that may contain PII or payment data. Log only status codes, paths, and non-sensitive metadata.
- **Errors:** Map internal errors to HTTP status and a stable error response shape. Do not expose stack traces or internal messages to the client in production.
- **Stripe/Supabase errors:** Log server-side for debugging; return generic messages to the client (e.g. “Payment service temporarily unavailable”) and appropriate 5xx when the backend cannot fulfill the request due to an integration failure.

---

## 6. Non-Functional Requirements (Summary)

| Area | Requirement |
|------|-------------|
| Auth | All Stripe (and other protected) routes require valid Clerk JWT; reject otherwise with 401. |
| Secrets | Stripe and Supabase keys only in env; never in code or logs. |
| Webhooks | Verify signature; idempotent handling; no raw secrets in logs. |
| CORS | Restrict to configured origins. |
| Errors | Consistent JSON error envelope; no internal leakage to client. |
| Logging | Structured; no PII or payment data; include correlation id. |

---

## 7. Security Checklist (Pre-Implementation)

- [ ] Auth middleware in place and applied to all Stripe routes before any implementation that returns Stripe data.
- [ ] Env schema includes `STRIPE_SECRET_KEY` (and later `STRIPE_WEBHOOK_SECRET`); validation at startup.
- [ ] No Stripe or Supabase keys in repository or in client-facing responses.
- [ ] CORS and allowed origins configured per environment.
- [ ] Error handler centralised and tested for 401/4xx/5xx and error body shape.
- [ ] Logging policy documented and applied (what is logged, what is not).

This document is the reference for implementation and review. Execution templates: [06-execution-templates.md](./06-execution-templates.md).
