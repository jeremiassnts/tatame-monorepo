import { env } from "@tatame-monorepo/env/server";
import cors from "cors";
import express from "express";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { stripeRouter } from "./routes/stripe";
import { webhooksRouter } from "./routes/webhooks";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

// Webhook routes need raw body for signature verification
// Must be mounted BEFORE express.json() middleware
app.use(
  "/webhooks",
  express.raw({ type: "application/json" }),
  (req, _res, next) => {
    // Store raw body for signature verification
    (req as any).rawBody = req.body;
    next();
  },
  webhooksRouter,
);

// JSON body parser for all other routes
app.use(express.json());

// Clerk authentication middleware (applied to all routes after this point)
app.use(authMiddleware);

// Public health check route
app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

// Protected Stripe routes
app.use("/stripe", stripeRouter);

// Error handler must be last
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
