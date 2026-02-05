import { clerkMiddleware, requireAuth } from "@clerk/express";
import { env } from "@tatame-monorepo/env/server";

export const authMiddleware = clerkMiddleware({
  publishableKey: env.CLERK_PUBLISHABLE_KEY,
  secretKey: env.CLERK_SECRET_KEY,
});

export const protectRoute = requireAuth({
  onError: (_req, res) => {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token.",
      },
    });
  },
});
