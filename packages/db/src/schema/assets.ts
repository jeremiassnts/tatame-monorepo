import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

// ============================================
// ASSETS TABLE
// ============================================
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  classId: integer("class_id"), // References class.id
  
  title: text("title"),
  content: text("content"), // URL or content
  type: text("type"), // "video", "document", etc.
  
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
