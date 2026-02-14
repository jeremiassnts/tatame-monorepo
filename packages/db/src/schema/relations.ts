import { relations } from "drizzle-orm";
import { users } from "./users";
import { gyms, classTable } from "./gyms";
import { graduations } from "./graduations";
import { checkins } from "./checkins";
import { notifications } from "./notifications";
import { assets } from "./assets";
import { roles } from "./infrastructure";

// ============================================
// USER RELATIONS
// ============================================
export const usersRelations = relations(users, ({ one, many }) => ({
  // One-to-one
  role: one(roles, {
    fields: [users.role],
    references: [roles.id],
  }),
  gym: one(gyms, {
    fields: [users.gymId],
    references: [gyms.id],
  }),
  
  // One-to-many
  graduations: many(graduations),
  checkins: many(checkins),
  instructedClasses: many(classTable, { relationName: "instructor" }),
  createdClasses: many(classTable, { relationName: "creator" }),
  sentNotifications: many(notifications),
}));

// ============================================
// GYM RELATIONS
// ============================================
export const gymsRelations = relations(gyms, ({ one, many }) => ({
  manager: one(users, {
    fields: [gyms.managerId],
    references: [users.id],
  }),
  
  members: many(users),
  classes: many(classTable),
}));

// ============================================
// CLASS RELATIONS
// ============================================
export const classRelations = relations(classTable, ({ one, many }) => ({
  gym: one(gyms, {
    fields: [classTable.gymId],
    references: [gyms.id],
  }),
  instructor: one(users, {
    fields: [classTable.instructorId],
    references: [users.id],
    relationName: "instructor",
  }),
  creator: one(users, {
    fields: [classTable.createdBy],
    references: [users.id],
    relationName: "creator",
  }),
  
  assets: many(assets),
  checkins: many(checkins),
}));

// ============================================
// GRADUATION RELATIONS
// ============================================
export const graduationsRelations = relations(graduations, ({ one }) => ({
  user: one(users, {
    fields: [graduations.userId],
    references: [users.id],
  }),
}));

// ============================================
// CHECKIN RELATIONS
// ============================================
export const checkinsRelations = relations(checkins, ({ one }) => ({
  user: one(users, {
    fields: [checkins.userId],
    references: [users.id],
  }),
  class: one(classTable, {
    fields: [checkins.classId],
    references: [classTable.id],
  }),
}));

// ============================================
// ASSET RELATIONS
// ============================================
export const assetsRelations = relations(assets, ({ one }) => ({
  class: one(classTable, {
    fields: [assets.classId],
    references: [classTable.id],
  }),
}));

// ============================================
// NOTIFICATION RELATIONS
// ============================================
export const notificationsRelations = relations(notifications, ({ one }) => ({
  sender: one(users, {
    fields: [notifications.sentBy],
    references: [users.id],
  }),
}));
