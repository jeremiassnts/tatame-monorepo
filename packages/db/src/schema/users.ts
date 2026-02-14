import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

// ============================================
// USERS TABLE
// ============================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  
  // Profile
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profilePicture: text("profile_picture"),
  
  // Personal info
  birth: text("birth"), // Date as text
  birthDay: text("birth_day"), // MM-DD format for birthday matching
  gender: text("gender"),
  phone: text("phone"),
  instagram: text("instagram"),
  
  // App-specific
  role: text("role"), // References roles.id
  gymId: integer("gym_id"), // References gyms.id
  expoPushToken: text("expo_push_token"),
  
  // Stripe integration
  customerId: text("customer_id"),
  subscriptionId: text("subscription_id"),
  plan: text("plan"),
  
  // Status tracking
  approvedAt: timestamp("approved_at"),
  deniedAt: timestamp("denied_at"),
  migratedAt: timestamp("migrated_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
