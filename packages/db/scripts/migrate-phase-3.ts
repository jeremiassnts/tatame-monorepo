/**
 * Phase 3 Migration Script
 * Migrates user-related tables: users, graduations
 * 
 * CRITICAL: This is the highest risk migration phase
 * - Users table has 20+ columns
 * - Required by almost all other tables
 * - Clerk integration must remain intact
 * 
 * Run with: pnpm tsx scripts/migrate-phase-3.ts
 */

import { db } from "../src/index.js";
import { users, graduations, gyms } from "../src/schema/index.js";
import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
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
 * Migrate users table
 * This is the most critical migration - handle with care
 */
async function migrateUsers() {
  console.log("\n📦 Migrating users table...");
  
  try {
    // 1. Fetch from Supabase
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("id", { ascending: true });
    
    if (error) throw error;
    
    console.log(`   Found ${data.length} users in Supabase`);
    
    // 2. Insert into Postgres
    let successCount = 0;
    let skipCount = 0;
    
    for (const user of data) {
      try {
        await db.insert(users).values({
          id: user.id,
          clerkUserId: user.clerk_user_id,
          
          // Profile
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          profilePicture: user.profile_picture,
          
          // Personal info
          birth: user.birth,
          birthDay: user.birth_day,
          gender: user.gender,
          phone: user.phone,
          instagram: user.instagram,
          
          // App-specific
          role: user.role,
          gymId: user.gym_id,
          expoPushToken: user.expo_push_token,
          
          // Stripe integration
          customerId: user.customer_id,
          subscriptionId: user.subscription_id,
          plan: user.plan,
          
          // Status tracking
          approvedAt: user.approved_at ? new Date(user.approved_at) : null,
          deniedAt: user.denied_at ? new Date(user.denied_at) : null,
          migratedAt: user.migrated_at ? new Date(user.migrated_at) : null,
          deletedAt: user.deleted_at ? new Date(user.deleted_at) : null,
          createdAt: new Date(user.created_at),
        }).onConflictDoNothing(); // Idempotent
        
        successCount++;
      } catch (err) {
        console.error(`   ⚠️  Failed to migrate user ${user.id}:`, err);
        skipCount++;
      }
    }
    
    console.log(`   ✅ Successfully migrated ${successCount} users`);
    if (skipCount > 0) {
      console.log(`   ⚠️  Skipped ${skipCount} users due to errors`);
    }
    
    // 3. Validate
    const pgUsers = await db.select().from(users);
    console.log(`   Postgres now has ${pgUsers.length} users`);
    
    if (pgUsers.length !== data.length) {
      throw new Error(`❌ Row count mismatch! Supabase: ${data.length}, Postgres: ${pgUsers.length}`);
    }
    
    console.log("   ✅ Users migrated successfully");
    return { success: true, count: data.length };
  } catch (error) {
    console.error("   ❌ Error migrating users:", error);
    throw error;
  }
}

/**
 * Migrate graduations table
 * Depends on users table being migrated first
 */
async function migrateGraduations() {
  console.log("\n📦 Migrating graduations table...");
  
  try {
    // 1. Fetch from Supabase
    const { data, error } = await supabase
      .from("graduations")
      .select("*")
      .order("id", { ascending: true });
    
    if (error) throw error;
    
    console.log(`   Found ${data.length} graduations in Supabase`);
    
    // 2. Insert into Postgres
    for (const graduation of data) {
      await db.insert(graduations).values({
        id: graduation.id,
        userId: graduation.userId,
        belt: graduation.belt,
        degree: graduation.degree,
        modality: graduation.modality,
        createdAt: new Date(graduation.created_at),
      }).onConflictDoNothing(); // Idempotent
    }
    
    // 3. Validate
    const pgGraduations = await db.select().from(graduations);
    console.log(`   Postgres now has ${pgGraduations.length} graduations`);
    
    if (pgGraduations.length !== data.length) {
      throw new Error(`❌ Row count mismatch! Supabase: ${data.length}, Postgres: ${pgGraduations.length}`);
    }
    
    console.log("   ✅ Graduations migrated successfully");
    return { success: true, count: data.length };
  } catch (error) {
    console.error("   ❌ Error migrating graduations:", error);
    throw error;
  }
}

/**
 * Update gyms.managerId after users migration
 * This resolves the circular dependency from Phase 2
 */
async function updateGymManagers() {
  console.log("\n📦 Updating gym managers...");
  
  try {
    // Fetch gyms with managerId from Supabase
    const { data, error } = await supabase
      .from("gyms")
      .select("id, managerId")
      .not("managerId", "is", null);
    
    if (error) throw error;
    
    console.log(`   Found ${data.length} gyms with managers in Supabase`);
    
    let updateCount = 0;
    for (const gym of data) {
      if (gym.managerId) {
        await db.update(gyms)
          .set({ managerId: gym.managerId })
          .where(eq(gyms.id, gym.id));
        updateCount++;
      }
    }
    
    console.log(`   ✅ Updated ${updateCount} gym managers`);
    return { success: true, count: updateCount };
  } catch (error) {
    console.error("   ❌ Error updating gym managers:", error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║           PHASE 3: USER-RELATED TABLES MIGRATION             ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝");
  console.log("\nTables to migrate: users, graduations");
  console.log("Risk level: HIGH ⚠️");
  console.log("Dependencies: roles, gyms (from previous phases)");
  console.log("\n⚠️  CRITICAL: This migration handles the core user data");
  console.log("⚠️  Clerk integration must remain intact");
  console.log("⚠️  All user IDs and relationships must be preserved\n");
  
  try {
    // Step 1: Migrate users (most critical)
    const usersResult = await migrateUsers();
    
    // Step 2: Migrate graduations (depends on users)
    const graduationsResult = await migrateGraduations();
    
    // Step 3: Update gym managers (resolves Phase 2 circular dependency)
    const gymManagersResult = await updateGymManagers();
    
    // Summary
    console.log("\n╔═══════════════════════════════════════════════════════════════╗");
    console.log("║                      MIGRATION SUMMARY                        ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝");
    console.log(`\n   ✅ users:        ${usersResult.count} rows migrated`);
    console.log(`   ✅ graduations:  ${graduationsResult.count} rows migrated`);
    console.log(`   ✅ gym managers: ${gymManagersResult.count} relationships updated`);
    console.log("\n🎉 Phase 3 migration completed successfully!\n");
    console.log("Next steps:");
    console.log("  1. Update UsersService to use Drizzle");
    console.log("  2. Update GraduationsService to use Drizzle");
    console.log("  3. Run comprehensive tests (auth, approval flow, graduations)");
    console.log("  4. Verify Clerk integration still works");
    console.log("  5. Proceed to Phase 4 (Class & Activity Tables)\n");
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.error("\n⚠️  CRITICAL: User data migration failed!");
    console.error("⚠️  Do NOT proceed to service updates until this is resolved.");
    console.error("⚠️  Check the documentation for rollback procedures.");
    process.exit(1);
  }
}

// Run migration
main();
