import { env } from "@tatame-monorepo/env/server";
import cors from "cors";
import express from "express";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { protectedRoutes } from "./routes";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

// Webhook routes need raw body for signature verification
// Must be mounted BEFORE express.json() middleware
// app.use(
//   "/webhooks",
//   express.raw({ type: "application/json" }),
//   (req, _res, next) => {
//     // Store raw body for signature verification
//     (req as any).rawBody = req.body;
//     next();
//   },
//   webhooksRouter,
// );

// JSON body parser for all other routes
app.use(express.json());
// Public health check route
app.get("/", (_req, res) => {
  res.status(200).send("OK");
});
// Clerk authentication middleware (applied to all routes after this point)
app.use(authMiddleware);
// Protected Stripe routes
app.use("/api", protectedRoutes);
// Error handler must be last
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
});
