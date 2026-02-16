/**
 * Phase 5 Data Migration Script
 * Copies notifications from Supabase → Postgres
 *
 * NOTE: This is the DATA migration step. Structure migration (schemas, services)
 * is complete without running this. Run this only when Postgres is running
 * and you are ready to copy data.
 *
 * Dependencies: Phase 3 (users must be migrated)
 *
 * Run with: pnpm migrate:phase-5
 */

import { db } from "../src/index.js";
import { notifications } from "../src/schema/index.js";
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
 * Migrate notifications table
 * Depends on users (sent_by references users.id)
 */
async function migrateNotifications() {
  console.log("\n📦 Migrating notifications table...");

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    console.log(`   Found ${data.length} notifications in Supabase`);

    for (const row of data) {
      await db
        .insert(notifications)
        .values({
          id: row.id,
          sentBy: row.sent_by ?? null,
          title: row.title ?? null,
          content: row.content ?? null,
          channel: row.channel ?? null,
          status: row.status ?? null,
          recipients: row.recipients ?? [],
          viewedBy: row.viewed_by ?? [],
          sentAt: row.sent_at ? new Date(row.sent_at) : null,
          createdAt: new Date(row.created_at),
        })
        .onConflictDoNothing();
    }

    const pgNotifications = await db.select().from(notifications);
    console.log(`   Postgres now has ${pgNotifications.length} notifications`);

    if (pgNotifications.length !== data.length) {
      throw new Error(
        `❌ Row count mismatch! Supabase: ${data.length}, Postgres: ${pgNotifications.length}`,
      );
    }

    console.log("   ✅ Notifications migrated successfully");
    return { success: true, count: data.length };
  } catch (error) {
    console.error("   ❌ Error migrating notifications:", error);
    throw error;
  }
}

async function main() {
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║      PHASE 5: EXTERNAL INTEGRATION (NOTIFICATIONS) MIGRATION   ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝");
  console.log("\nTables to migrate: notifications");
  console.log("Risk level: MEDIUM");
  console.log("Dependencies: users (from Phase 3)");
  console.log("\n⚠️  Array columns: recipients, viewed_by");
  console.log("⚠️  Expo Push Token integration must work\n");

  try {
    const notificationsResult = await migrateNotifications();

    console.log("\n╔═══════════════════════════════════════════════════════════════╗");
    console.log("║                      MIGRATION SUMMARY                        ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝");
    console.log(`\n   ✅ notifications: ${notificationsResult.count} rows migrated`);
    console.log("\n🎉 Phase 5 migration completed successfully!\n");
    console.log("Next steps:");
    console.log("  1. NotificationsService already uses Drizzle");
    console.log("  2. Run tests (notifications, push delivery)");
    console.log("  3. Proceed to Phase 6 (Cutover & Cleanup)\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.error("\n⚠️  Rollback may be needed. Check the documentation for rollback procedures.");
    process.exit(1);
  }
}

main();
