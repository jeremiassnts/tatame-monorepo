/**
 * Load env before any module that uses process.env.DATABASE_URL.
 * Must be imported first in migration scripts (ESM evaluates imports before body).
 */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../apps/server/.env") });
