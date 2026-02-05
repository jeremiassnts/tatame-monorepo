import { clerkMiddleware } from "@clerk/express";
import { env } from "@tatame-monorepo/env/server";
import type { RequestHandler } from "express";

export const authMiddleware: RequestHandler = clerkMiddleware({
  publishableKey: env.CLERK_PUBLISHABLE_KEY,
  secretKey: env.CLERK_SECRET_KEY,
});
