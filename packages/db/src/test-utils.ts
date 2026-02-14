import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./schema";

let testPool: Pool | null = null;
let testDb: ReturnType<typeof drizzle> | null = null;

export async function setupTestDatabase() {
  // Use separate test database
  testPool = new Pool({
    connectionString: process.env.TEST_DATABASE_URL || 
      "postgresql://postgres:postgres@localhost:5432/tatame_test",
  });
  
  testDb = drizzle(testPool, { schema });
  
  // Run migrations
  await migrate(testDb, { migrationsFolder: "./src/migrations" });
  
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
