/**
 * Phase 2 Migration Script
 * Migrates core domain table: gyms
 * 
 * Run with: pnpm tsx scripts/migrate-phase-2.ts
 */

import { db } from "../src/index.js";
import { gyms } from "../src/schema/index.js";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "../../apps/server/.env" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase credentials. Check SUPABASE_URL and SUPABASE_ANON_KEY in apps/server/.env");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Migrate gyms table
 * Note: managerId is set to NULL initially due to circular dependency with users table
 * Will be populated after users migration in Phase 3
 */
async function migrateGyms() {
  console.log("\n📦 Migrating gyms table...");
  
  try {
    // 1. Fetch from Supabase
    const { data, error } = await supabase
      .from("gyms")
      .select("*")
      .order("id", { ascending: true });
    
    if (error) throw error;
    
    console.log(`   Found ${data.length} gyms in Supabase`);
    
    // 2. Insert into Postgres
    for (const gym of data) {
      await db.insert(gyms).values({
        id: gym.id,
        name: gym.name,
        address: gym.address,
        logo: gym.logo,
        managerId: null, // ⚠️ Circular dependency - will be updated after users migration
        since: gym.since,
        createdAt: new Date(gym.created_at),
      }).onConflictDoNothing(); // Idempotent - can run multiple times
    }
    
    // 3. Validate
    const pgGyms = await db.select().from(gyms);
    console.log(`   Postgres now has ${pgGyms.length} gyms`);
    
    if (pgGyms.length !== data.length) {
      throw new Error(`❌ Row count mismatch! Supabase: ${data.length}, Postgres: ${pgGyms.length}`);
    }
    
    console.log("   ✅ Gyms migrated successfully (managerId will be updated in Phase 3)");
    return { success: true, count: data.length };
  } catch (error) {
    console.error("   ❌ Error migrating gyms:", error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║              PHASE 2: CORE DOMAIN TABLE MIGRATION             ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝");
  console.log("\nTable to migrate: gyms");
  console.log("Risk level: LOW");
  console.log("Dependencies: None (but referenced by users)\n");
  console.log("⚠️  Note: managerId will be NULL initially and populated after users migration");
  
  try {
    // Migrate gyms table
    const gymsResult = await migrateGyms();
    
    // Summary
    console.log("\n╔═══════════════════════════════════════════════════════════════╗");
    console.log("║                      MIGRATION SUMMARY                        ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝");
    console.log(`\n   ✅ gyms: ${gymsResult.count} rows migrated`);
    console.log("\n🎉 Phase 2 migration completed successfully!\n");
    console.log("Next steps:");
    console.log("  1. Update GymsService to use Drizzle");
    console.log("  2. Run tests to validate service");
    console.log("  3. Proceed to Phase 3 (User Tables)");
    console.log("  4. After Phase 3, update gyms.managerId with correct values\n");
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.error("\n⚠️  Rollback may be needed. Check the documentation for rollback procedures.");
    process.exit(1);
  }
}

// Run migration
main();
