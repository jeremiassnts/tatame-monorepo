import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import path from "path";
import * as schema from "./schema";

// Resolve migrations path (CJS/Jest compatible; no import.meta)
const cwd = process.cwd();
const migrationsFolder = cwd.endsWith("server")
  ? path.resolve(cwd, "..", "..", "packages", "db", "src", "migrations")
  : path.resolve(cwd, "packages", "db", "src", "migrations");

let testPool: Pool | null = null;
let testDb: ReturnType<typeof drizzle> | null = null;

export async function setupTestDatabase() {
  const connectionString =
    process.env.TEST_DATABASE_URL ||
    "postgresql://postgres:password@localhost:5432/tatame_test";

  testPool = new Pool({ connectionString });
  testDb = drizzle(testPool, { schema });

  await migrate(testDb, { migrationsFolder });
  
  return testDb;
}

export async function teardownTestDatabase() {
  if (testPool) {
    await testPool.end();
    testPool = null;
    testDb = null;
  }
}

export async function clearTestData() {
  if (!testDb) throw new Error("Test database not initialized");
  
  // Clear all tables in reverse order of dependencies
  await testDb.delete(schema.checkins);
  await testDb.delete(schema.assets);
  await testDb.delete(schema.notifications);
  await testDb.delete(schema.graduations);
  await testDb.delete(schema.classTable);
  await testDb.delete(schema.users);
  await testDb.delete(schema.gyms);
  await testDb.delete(schema.roles);
  await testDb.delete(schema.versions);
  await testDb.delete(schema.appStores);
}
