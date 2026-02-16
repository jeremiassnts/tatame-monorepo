import { Router } from "express";
import { authMiddleware, requireAuth } from "../middleware/auth";
import { attachmentsRouter } from "./attachments";
import { checkinsRouter } from "./checkins";
import { classRouter } from "./class";
import { graduationsRouter } from "./graduations";
import { gymsRouter } from "./gyms";
import { notificationsRouter } from "./notifications";
import { stripeRouter } from "./stripe";
import { usersRouter } from "./users";
import { versionsRouter } from "./versions";
import { webhooksRouter } from "./webhooks";

export const protectedRoutes: Router = Router();

// Apply Clerk middleware first to parse authentication
protectedRoutes.use(authMiddleware);

// Then require authentication for all routes under /api
protectedRoutes.use(requireAuth);

// Mount protected route handlers
protectedRoutes.use("/stripe", stripeRouter);
protectedRoutes.use("/webhooks", webhooksRouter);
protectedRoutes.use("/gyms", gymsRouter);
protectedRoutes.use("/users", usersRouter);
protectedRoutes.use("/class", classRouter);
protectedRoutes.use("/checkins", checkinsRouter);
protectedRoutes.use("/notifications", notificationsRouter);
protectedRoutes.use("/graduations", graduationsRouter);
protectedRoutes.use("/versions", versionsRouter);
protectedRoutes.use("/attachments", attachmentsRouter);

export default protectedRoutes;