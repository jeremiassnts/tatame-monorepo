import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

// ============================================
// GRADUATIONS TABLE
// ============================================
export const graduations = pgTable("graduations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(), // References users.id
  belt: text("belt"), // Belt color
  degree: integer("degree"), // Degree/stripe count
  modality: text("modality"), // BJJ, Muay Thai, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
