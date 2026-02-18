/**
 * Phase 1 Data Migration Script
 * Copies roles, versions, app_stores from Supabase → Postgres
 *
 * NOTE: This is the DATA migration step. Structure migration (schemas, services)
 * is complete without running this. Run only when Postgres is running.
 *
 * Run with: pnpm migrate:phase-1
 */

// Load env first so DATABASE_URL is set before db (Drizzle) is created
import "./load-env.js";
import { sql } from "drizzle-orm";
import { db, checkDatabaseConnection } from "../src/index.js";
import { roles, versions, appStores } from "../src/schema/index.js";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase credentials. Check SUPABASE_URL and SUPABASE_ANON_KEY in apps/server/.env");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Migrate roles table
 * Expected: 3 rows (STUDENT, INSTRUCTOR, MANAGER)
 */
async function migrateRoles() {
  console.log("\n📦 Migrating roles table...");
  
  try {
    // 1. Fetch from Supabase
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .order("id", { ascending: true });
    
    if (error) throw error;
    
    console.log(`   Found ${data.length} roles in Supabase`);
    
    // 2. Insert into Postgres
    for (const role of data) {
      await db.insert(roles).values({
        id: role.id,
        createdAt: new Date(role.created_at),
      }).onConflictDoNothing(); // Idempotent - can run multiple times
    }
    
    // 3. Validate
    const pgRoles = await db.select().from(roles);
    console.log(`   Postgres now has ${pgRoles.length} roles`);
    
    if (pgRoles.length !== data.length) {
      throw new Error(`❌ Row count mismatch! Supabase: ${data.length}, Postgres: ${pgRoles.length}`);
    }
    
    console.log("   ✅ Roles migrated successfully");
    return { success: true, count: data.length };
  } catch (error) {
    console.error("   ❌ Error migrating roles:", error);
    throw error;
  }
}

/**
 * Migrate versions table
 */
async function migrateVersions() {
  console.log("\n📦 Migrating versions table...");
  
  try {
    // 1. Fetch from Supabase
    const { data, error } = await supabase
      .from("versions")
      .select("*")
      .order("id", { ascending: true });
    
    if (error) throw error;
    
    console.log(`   Found ${data.length} versions in Supabase`);
    
    // 2. Insert into Postgres
    for (const version of data) {
      await db.insert(versions).values({
        id: version.id,
        appVersion: version.appVersion,
        createdAt: new Date(version.created_at),
        disabledAt: version.disabled_at ? new Date(version.disabled_at) : null,
      }).onConflictDoNothing();
    }
    
    // 3. Validate
    const pgVersions = await db.select().from(versions);
    console.log(`   Postgres now has ${pgVersions.length} versions`);
    
    if (pgVersions.length !== data.length) {
      throw new Error(`❌ Row count mismatch! Supabase: ${data.length}, Postgres: ${pgVersions.length}`);
    }
    
    console.log("   ✅ Versions migrated successfully");
    return { success: true, count: data.length };
  } catch (error) {
    console.error("   ❌ Error migrating versions:", error);
    throw error;
  }
}

/**
 * Migrate app_stores table
 */
async function migrateAppStores() {
  console.log("\n📦 Migrating app_stores table...");
  
  try {
    // 1. Fetch from Supabase
    const { data, error } = await supabase
      .from("app_stores")
      .select("*")
      .order("id", { ascending: true });
    
    if (error) throw error;
    
    console.log(`   Found ${data.length} app stores in Supabase`);
    
    // 2. Insert into Postgres
    for (const store of data) {
      await db.insert(appStores).values({
        id: store.id,
        store: store.store,
        url: store.url,
        createdAt: new Date(store.created_at),
        disabledAt: store.disabled_at ? new Date(store.disabled_at) : null,
      }).onConflictDoNothing();
    }
    
    // 3. Validate
    const pgStores = await db.select().from(appStores);
    console.log(`   Postgres now has ${pgStores.length} app stores`);
    
    if (pgStores.length !== data.length) {
      throw new Error(`❌ Row count mismatch! Supabase: ${data.length}, Postgres: ${pgStores.length}`);
    }
    
    console.log("   ✅ App stores migrated successfully");
    return { success: true, count: data.length };
  } catch (error) {
    console.error("   ❌ Error migrating app_stores:", error);
    throw error;
  }
}

/**
 * Check that Postgres is reachable and required tables exist
 */
async function ensurePostgresReady(): Promise<void> {
  const ok = await checkDatabaseConnection();
  if (!ok) {
    const url = process.env.DATABASE_URL;
    const hint = url
      ? "Check that Postgres is running and reachable (firewall, VPN)."
      : "DATABASE_URL is not set. Ensure apps/server/.env is loaded (load-env.js runs first).";
    throw new Error(
      `Cannot connect to Postgres. ${hint} ECONNREFUSED usually means the server is down or unreachable.`
    );
  }
  // Check that required tables exist before inserting (avoid "relation does not exist")
  const requiredTables = ["roles", "versions", "app_stores"];
  for (const table of requiredTables) {
    const res = await db.execute(
      sql`SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = ${table}
      ) AS "exists"`
    );
    const rows = (res as unknown as { rows: { exists: boolean }[] }).rows;
    if (!rows[0]?.exists) {
      throw new Error(
        `Table "public.${table}" does not exist in Postgres. Run schema migration (e.g. drizzle-kit push) first.`
      );
    }
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║            PHASE 1: INFRASTRUCTURE TABLES MIGRATION           ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝");
  console.log("\nTables to migrate: roles, versions, app_stores");
  console.log("Risk level: LOW");
  console.log("Dependencies: None\n");
  
  try {
    await ensurePostgresReady();
    // Migrate each table
    const rolesResult = await migrateRoles();
    const versionsResult = await migrateVersions();
    const appStoresResult = await migrateAppStores();
    
    // Summary
    console.log("\n╔═══════════════════════════════════════════════════════════════╗");
    console.log("║                      MIGRATION SUMMARY                        ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝");
    console.log(`\n   ✅ roles:      ${rolesResult.count} rows migrated`);
    console.log(`   ✅ versions:   ${versionsResult.count} rows migrated`);
    console.log(`   ✅ app_stores: ${appStoresResult.count} rows migrated`);
    console.log("\n🎉 Phase 1 migration completed successfully!\n");
    console.log("Next steps:");
    console.log("  1. Update RolesService to use Drizzle");
    console.log("  2. Update VersionsService to use Drizzle");
    console.log("  3. Update AppStoresService to use Drizzle");
    console.log("  4. Run tests to validate services");
    console.log("  5. Proceed to Phase 2 (Core Domain Tables)\n");
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.error("\n⚠️  Rollback may be needed. Check the documentation for rollback procedures.");
    process.exit(1);
  }
}

// Run migration
main();
