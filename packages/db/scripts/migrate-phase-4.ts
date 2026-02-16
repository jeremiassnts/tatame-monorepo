/**
 * Phase 4 Data Migration Script
 * Copies class, checkins, assets from Supabase → Postgres
 *
 * NOTE: This is the DATA migration step. Structure migration (schemas, services)
 * is complete without running this. Run this only when Postgres is running
 * and you are ready to copy data.
 *
 * Dependencies: Phase 3 (users), Phase 2 (gyms)
 *
 * Run with: pnpm migrate:phase-4
 */

import { db } from "../src/index.js";
import { classTable, checkins, assets } from "../src/schema/index.js";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "../../apps/server/.env" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase credentials. Check SUPABASE_URL and SUPABASE_ANON_KEY in apps/server/.env",
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Migrate class table
 * Depends on gyms and users (instructor_id, created_by)
 */
async function migrateClass() {
  console.log("\n📦 Migrating class table...");

  try {
    const { data, error } = await supabase
      .from("class")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    console.log(`   Found ${data.length} classes in Supabase`);

    for (const row of data) {
      await db
        .insert(classTable)
        .values({
          id: row.id,
          gymId: row.gym_id,
          instructorId: row.instructor_id,
          createdBy: row.created_by,
          day: row.day,
          start: row.start,
          end: row.end,
          modality: row.modality,
          description: row.description,
          createdAt: new Date(row.created_at),
          deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
        })
        .onConflictDoNothing();
    }

    const pgClasses = await db.select().from(classTable);
    console.log(`   Postgres now has ${pgClasses.length} classes`);

    if (pgClasses.length !== data.length) {
      throw new Error(
        `❌ Row count mismatch! Supabase: ${data.length}, Postgres: ${pgClasses.length}`,
      );
    }

    console.log("   ✅ Class migrated successfully");
    return { success: true, count: data.length };
  } catch (error) {
    console.error("   ❌ Error migrating class:", error);
    throw error;
  }
}

/**
 * Migrate checkins table
 * Depends on class and users
 */
async function migrateCheckins() {
  console.log("\n📦 Migrating checkins table...");

  try {
    const { data, error } = await supabase
      .from("checkins")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    console.log(`   Found ${data.length} checkins in Supabase`);

    for (const row of data) {
      await db
        .insert(checkins)
        .values({
          id: row.id,
          userId: row.userId,
          classId: row.classId,
          date: row.date,
          createdAt: new Date(row.created_at),
        })
        .onConflictDoNothing();
    }

    const pgCheckins = await db.select().from(checkins);
    console.log(`   Postgres now has ${pgCheckins.length} checkins`);

    if (pgCheckins.length !== data.length) {
      throw new Error(
        `❌ Row count mismatch! Supabase: ${data.length}, Postgres: ${pgCheckins.length}`,
      );
    }

    console.log("   ✅ Checkins migrated successfully");
    return { success: true, count: data.length };
  } catch (error) {
    console.error("   ❌ Error migrating checkins:", error);
    throw error;
  }
}

/**
 * Migrate assets table
 * Depends on class
 */
async function migrateAssets() {
  console.log("\n📦 Migrating assets table...");

  try {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    console.log(`   Found ${data.length} assets in Supabase`);

    for (const row of data) {
      await db
        .insert(assets)
        .values({
          id: row.id,
          classId: row.class_id,
          title: row.title,
          content: row.content,
          type: row.type,
          validUntil: row.valid_until ? new Date(row.valid_until) : null,
          createdAt: new Date(row.created_at),
        })
        .onConflictDoNothing();
    }

    const pgAssets = await db.select().from(assets);
    console.log(`   Postgres now has ${pgAssets.length} assets`);

    if (pgAssets.length !== data.length) {
      throw new Error(
        `❌ Row count mismatch! Supabase: ${data.length}, Postgres: ${pgAssets.length}`,
      );
    }

    console.log("   ✅ Assets migrated successfully");
    return { success: true, count: data.length };
  } catch (error) {
    console.error("   ❌ Error migrating assets:", error);
    throw error;
  }
}

async function main() {
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║         PHASE 4: CLASS & ACTIVITY TABLES MIGRATION            ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝");
  console.log("\nTables to migrate: class, checkins, assets");
  console.log("Risk level: HIGH ⚠️");
  console.log("Dependencies: gyms, users (from Phase 2 & 3)");
  console.log("\n⚠️  ClassService.nextClass() has complex date logic");
  console.log("⚠️  Verify timezone handling and date calculations\n");

  try {
    const classResult = await migrateClass();
    const checkinsResult = await migrateCheckins();
    const assetsResult = await migrateAssets();

    console.log("\n╔═══════════════════════════════════════════════════════════════╗");
    console.log("║                      MIGRATION SUMMARY                        ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝");
    console.log(`\n   ✅ class:     ${classResult.count} rows migrated`);
    console.log(`   ✅ checkins:  ${checkinsResult.count} rows migrated`);
    console.log(`   ✅ assets:    ${assetsResult.count} rows migrated`);
    console.log("\n🎉 Phase 4 migration completed successfully!\n");
    console.log("Next steps:");
    console.log("  1. Update ClassService to use Drizzle");
    console.log("  2. Update CheckinsService to use Drizzle");
    console.log("  3. Update AssetsService to use Drizzle");
    console.log("  4. Run tests (class scheduling, check-ins, assets)");
    console.log("  5. Proceed to Phase 5 (Notifications)\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.error("\n⚠️  Rollback may be needed. Check the documentation for rollback procedures.");
    process.exit(1);
  }
}

main();
