import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load environment variables
dotenv.config({
  path: "../../apps/server/.env",
});

export default defineConfig({
  schema: "./src/schema/**/*.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
  
  // Migration options
  verbose: true,
  strict: true,
});
