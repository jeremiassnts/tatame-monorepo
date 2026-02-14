import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

// ============================================
// NOTIFICATIONS TABLE
// ============================================
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  sentBy: integer("sent_by"), // References users.id
  
  title: text("title"),
  content: text("content"),
  channel: text("channel"), // "push", "email", etc.
  status: text("status"), // "pending", "sent", "failed"
  
  // Array columns - Drizzle handles PostgreSQL arrays
  recipients: text("recipients").array(), // Array of user IDs as strings
  viewedBy: text("viewed_by").array(), // Array of user IDs as strings
  
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
