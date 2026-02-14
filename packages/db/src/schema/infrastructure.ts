import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// ============================================
// ROLES TABLE
// ============================================
export const roles = pgTable("roles", {
  id: text("id").primaryKey(), // "STUDENT", "INSTRUCTOR", "MANAGER"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// VERSIONS TABLE
// ============================================
export const versions = pgTable("versions", {
  id: serial("id").primaryKey(),
  appVersion: text("appVersion"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  disabledAt: timestamp("disabled_at"),
});

// ============================================
// APP_STORES TABLE
// ============================================
export const appStores = pgTable("app_stores", {
  id: serial("id").primaryKey(),
  store: text("store"), // "ios" or "android"
  url: text("url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  disabledAt: timestamp("disabled_at"),
});
