import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { protectedRoutes } from "./routes";

/**
 * Creates and returns the Express application.
 * Used by index.ts for production and by E2E tests via supertest.
 */
export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Test-User-Id"],
    }),
  );

  app.use(express.json());

  app.use("/api", protectedRoutes);
  app.use(errorHandler);

  return app;
}
