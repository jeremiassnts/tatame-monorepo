import { Router } from "express";
import { authMiddleware, requireAuth } from "../middleware/auth";
import { stripeRouter } from "./stripe";
import { webhooksRouter } from "./webhooks";

export const protectedRoutes: Router = Router();

// Apply Clerk middleware first to parse authentication
protectedRoutes.use(authMiddleware);

// Then require authentication for all routes under /api
protectedRoutes.use(requireAuth);

// Mount protected route handlers
protectedRoutes.use("/stripe", stripeRouter);
protectedRoutes.use("/webhooks", webhooksRouter);

export default protectedRoutes;