import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

// ============================================
// CHECKINS TABLE
// ============================================
export const checkins = pgTable("checkins", {
  id: serial("id").primaryKey(),
  userId: integer("userId"), // References users.id
  classId: integer("classId"), // References class.id
  
  date: text("date"), // ISO date string
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
