import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

// ============================================
// GYMS TABLE
// ============================================
// Note: managerId creates a circular dependency with users.gym_id
// Solution: Make this nullable during initial migration, populate after users migration
export const gyms = pgTable("gyms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  logo: text("logo"),
  managerId: integer("managerId"), // Nullable during migration - references users.id (circular dependency)
  since: text("since").notNull(), // Date as text in original
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// CLASS TABLE
// ============================================
export const classTable = pgTable("class", {
  id: serial("id").primaryKey(),
  gymId: integer("gym_id"),
  instructorId: integer("instructor_id"),
  createdBy: integer("created_by"),
  
  // Schedule
  day: text("day"), // "MONDAY", "TUESDAY", etc.
  start: text("start"), // "18:00" format
  end: text("end"), // "19:30" format
  
  // Details
  modality: text("modality"),
  description: text("description"),
  
  // Tracking
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
