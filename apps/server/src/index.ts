import { env } from "@tatame-monorepo/env/server";
import cors from "cors";
import express from "express";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { stripeRouter } from "./routes/stripe";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

app.use(express.json());

app.use(authMiddleware);

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.use("/stripe", stripeRouter);

app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
