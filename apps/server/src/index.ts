import { env } from "@tatame-monorepo/env/server";
import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { protectedRoutes } from "./routes";

const app = express();

// Enable CORS for Expo/mobile apps
app.use(
  cors({
    origin: "*", // Allow all origins for development (restrict in production)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// JSON body parser for all other routes
app.use(express.json());

// Protected routes (authentication applied within the router)
app.use("/api", protectedRoutes);
// Error handler must be last
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
  console.log(`CORS enabled for all origins (development mode)`);
});
