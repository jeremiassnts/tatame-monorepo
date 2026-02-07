import { clerkMiddleware, getAuth } from "@clerk/express";
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
 * Middleware to protect routes by requiring authentication
 * Returns 401 for unauthenticated requests (suitable for APIs)
 */
export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.path.startsWith("/webhooks")) {
    return next();
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