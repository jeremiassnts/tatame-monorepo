import { clerkMiddleware, getAuth } from "@clerk/express";
import type { SessionAuthObject } from "@clerk/express";
import { env } from "@tatame-monorepo/env/server";
import type { RequestHandler } from "express";

/**
 * Clerk middleware that adds authentication state to all requests
 * This middleware is permissive and does NOT block unauthenticated requests
 */
export const authMiddleware: RequestHandler = clerkMiddleware({
  publishableKey: env.CLERK_PUBLISHABLE_KEY,
  secretKey: env.CLERK_SECRET_KEY,
});

/**
 * Test auth bypass: when NODE_ENV=test and X-Test-User-Id header is present,
 * treats the request as authenticated with that userId. Used for E2E testing
 * without real Clerk tokens.
 */
const TEST_USER_ID_HEADER = "X-Test-User-Id";

export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.path.startsWith("/webhooks")) {
    return next();
  }

  // E2E test bypass: use header as authenticated user when in test env
  if (process.env.NODE_ENV === "test") {
    const testUserId = req.get(TEST_USER_ID_HEADER);
    if (testUserId) {
      req.auth = {
        userId: testUserId,
        sessionId: "test-session",
        getToken: async () => "test-token",
        sessionClaims: {},
      } as SessionAuthObject;
      return next();
    }
  }

  const auth = getAuth(req);

  if (!auth?.userId) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required. Please provide a valid token.",
      },
    });
  }

  // Attach auth to request for downstream handlers
  req.auth = auth;
  next();
};