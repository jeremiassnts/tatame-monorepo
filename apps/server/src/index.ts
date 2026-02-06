import { env } from "@tatame-monorepo/env/server";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { protectedRoutes } from "./routes";

const app = express();

// app.use(
//   cors({
//     origin: env.CORS_ORIGIN,
//     methods: ["GET", "POST", "OPTIONS"],
//   }),
// );
// JSON body parser for all other routes
app.use(express.json());
// Protected routes (authentication applied within the router)
app.use("/api", protectedRoutes);
// Error handler must be last
app.use(errorHandler);
app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
});
