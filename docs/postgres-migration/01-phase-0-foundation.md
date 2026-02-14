# Phase 0: Foundation Setup - Drizzle Schema & Infrastructure

**Phase:** 0 of 6  
**Status:** Planning  
**Duration:** 1-2 days  
**Risk Level:** Low

---

## 1. Phase Overview

### Objectives

- Define complete Drizzle schemas for all 13 tables
- Set up database connection and pooling
- Configure migration workflow
- Create local development environment
- Establish testing framework
- Document schema design decisions

### Deliverables

- [ ] Complete schema definitions for 11 tables in `packages/db/src/schema/`
- [ ] Database connection module in `packages/db/src/db.ts`
- [ ] Updated `drizzle.config.ts` with proper configuration
- [ ] Local development database setup
- [ ] Migration scripts
- [ ] Schema documentation
- [ ] Testing utilities

### Why This Phase Matters

Phase 0 establishes the foundation for all subsequent migrations. By defining all 11 table schemas upfront:
- We ensure consistency across tables
- We catch relationship issues early
- We validate that Drizzle can handle all data types
- We establish patterns for the team

**Note:** Stripe customer mapping and webhook tracking are handled by the existing Stripe service integration, not as separate database tables.

---

## 2. Drizzle Schema Definitions

### Schema Organization

```
packages/db/src/schema/
├── index.ts              # Exports all schemas
├── users.ts              # User-related tables
├── gyms.ts               # Gym and class tables
├── graduations.ts        # Belt/degree tracking
├── notifications.ts      # Notification system
├── assets.ts             # Class assets and attachments
├── checkins.ts           # Attendance tracking
├── infrastructure.ts     # roles, versions, app_stores
└── relations.ts          # Drizzle relations
```

---

## 3. Complete Schema Definitions

### 3.1 Infrastructure Tables (infrastructure.ts)

```typescript
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
  appVersion: text("app_version"),
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
```

---

### 3.2 Gym Tables (gyms.ts)

```typescript
import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

// ============================================
// GYMS TABLE
// ============================================
export const gyms = pgTable("gyms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  logo: text("logo"),
  managerId: integer("manager_id").references(() => users.id), // Circular ref
  since: text("since").notNull(), // Date as text in original
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Note: managerId creates a circular dependency with users.gym_id
// Solution: Make this nullable during initial migration, populate after users migration
```

---

### 3.3 User Tables (users.ts)

```typescript
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { roles } from "./infrastructure";
import { gyms } from "./gyms";

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
  role: text("role").references(() => roles.id),
  gymId: integer("gym_id").references(() => gyms.id),
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
```

---

### 3.4 Graduations Table (graduations.ts)

```typescript
import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

// ============================================
// GRADUATIONS TABLE
// ============================================
export const graduations = pgTable("graduations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  belt: text("belt"), // Belt color
  degree: integer("degree"), // Degree/stripe count
  modality: text("modality"), // BJJ, Muay Thai, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

### 3.5 Class Tables (gyms.ts continued)

```typescript
import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { gyms } from "./gyms";
import { users } from "./users";

// ============================================
// CLASS TABLE
// ============================================
export const classTable = pgTable("class", {
  id: serial("id").primaryKey(),
  gymId: integer("gym_id").references(() => gyms.id),
  instructorId: integer("instructor_id").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id),
  
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
```

---

### 3.6 Assets Table (assets.ts)

```typescript
import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { classTable } from "./gyms";

// ============================================
// ASSETS TABLE
// ============================================
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => classTable.id),
  
  title: text("title"),
  content: text("content"), // URL or content
  type: text("type"), // "video", "document", etc.
  
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

### 3.7 Checkins Table (checkins.ts)

```typescript
import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { classTable } from "./gyms";

// ============================================
// CHECKINS TABLE
// ============================================
export const checkins = pgTable("checkins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  classId: integer("class_id").references(() => classTable.id),
  
  date: text("date"), // ISO date string
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

### 3.8 Notifications Table (notifications.ts)

```typescript
import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

// ============================================
// NOTIFICATIONS TABLE
// ============================================
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  sentBy: integer("sent_by").references(() => users.id),
  
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
```

---

### 3.9 Attachments Table (assets.ts continued)

```typescript
import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { classTable } from "./gyms";

// ============================================
// ATTACHMENTS TABLE
// ============================================
export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => classTable.id),
  
  fileName: text("file_name"),
  fileUrl: text("file_url"),
  fileType: text("file_type"),
  fileSize: integer("file_size"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

### 3.10 Relations Definition (relations.ts)

Drizzle ORM supports explicit relations for better TypeScript inference:

```typescript
import { relations } from "drizzle-orm";
import {
  users,
  gyms,
  classTable,
  graduations,
  checkins,
  notifications,
  assets,
  attachments,
  roles,
} from "./index";

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
  attachments: many(attachments),
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
// ATTACHMENT RELATIONS
// ============================================
export const attachmentsRelations = relations(attachments, ({ one }) => ({
  class: one(classTable, {
    fields: [attachments.classId],
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
```

---

### 3.11 Schema Index (schema/index.ts)

```typescript
// Export all tables
export * from "./infrastructure";
export * from "./users";
export * from "./gyms";
export * from "./graduations";
export * from "./assets";
export * from "./checkins";
export * from "./notifications";

// Export all relations
export * from "./relations";
```

---

## 4. Database Connection Module

### Updated db.ts

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// ============================================
// DATABASE CONNECTION
// ============================================

// Connection pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Drizzle instance with schema
export const db = drizzle(pool, { 
  schema,
  logger: process.env.NODE_ENV === "development", // Log queries in dev
});

// Export types for TypeScript
export type Database = typeof db;

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
}
```

---

## 5. Migration Configuration

### Updated drizzle.config.ts

```typescript
import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load environment variables
dotenv.config({
  path: "../../apps/server/.env",
});

export default defineConfig({
  schema: "./src/schema/**/*.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
  
  // Migration options
  verbose: true,
  strict: true,
  
  // Table prefix (optional)
  // tablesFilter: ["tatame_*"],
});
```

---

## 6. Environment Configuration

### Required Environment Variables

```bash
# Postgres Database (new)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tatame

# Supabase (keep during transition)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Feature flag for gradual migration
USE_POSTGRES=false  # Set to true when ready to switch
```

### Local Development Setup

```bash
# Start local Postgres with Docker
cd packages/db
pnpm db:start

# Or use existing docker-compose.yml
docker compose up -d

# Verify connection
psql postgresql://postgres:postgres@localhost:5432/tatame
```

---

## 7. Migration Scripts

### Generate Initial Migration

```bash
cd packages/db

# Generate migration files from schema
pnpm db:generate

# This creates: src/migrations/0000_initial_schema.sql
```

### Apply Migrations

```bash
# Push schema to database (development only)
pnpm db:push

# Or apply migrations (production-safe)
pnpm db:migrate
```

### Open Drizzle Studio

```bash
# Visual database explorer
pnpm db:studio

# Opens at: https://local.drizzle.studio
```

---

## 8. Type Safety & Utilities

### Query Builder Types

```typescript
import { db } from "@tatame-monorepo/db";
import { users, gyms, classTable } from "@tatame-monorepo/db/schema";
import { eq, and, or, desc, asc } from "drizzle-orm";

// Example: Type-safe query
const result = await db.query.users.findFirst({
  where: eq(users.clerkUserId, "user_123"),
  with: {
    gym: true,
    graduations: true,
  },
});

// Type of result is fully inferred!
// result: User & { gym: Gym | null; graduations: Graduation[] }
```

### Insert Types

```typescript
import { users } from "@tatame-monorepo/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

// Type for inserting a new user
export type NewUser = InferInsertModel<typeof users>;

// Type for selected user
export type User = InferSelectModel<typeof users>;

// Usage
const newUser: NewUser = {
  clerkUserId: "user_123",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "STUDENT",
  // ... other fields
};

await db.insert(users).values(newUser);
```

---

## 9. Testing Setup

### Test Database Configuration

```typescript
// packages/db/src/test-utils.ts

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./schema";

let testPool: Pool | null = null;
let testDb: ReturnType<typeof drizzle> | null = null;

export async function setupTestDatabase() {
  // Use separate test database
  testPool = new Pool({
    connectionString: process.env.TEST_DATABASE_URL || 
      "postgresql://postgres:postgres@localhost:5432/tatame_test",
  });
  
  testDb = drizzle(testPool, { schema });
  
  // Run migrations
  await migrate(testDb, { migrationsFolder: "./src/migrations" });
  
  return testDb;
}

export async function teardownTestDatabase() {
  if (testPool) {
    await testPool.end();
    testPool = null;
    testDb = null;
  }
}

export async function clearTestData() {
  if (!testDb) throw new Error("Test database not initialized");
  
  // Clear all tables in reverse order of dependencies
  await testDb.delete(schema.checkins);
  await testDb.delete(schema.assets);
  await testDb.delete(schema.notifications);
  await testDb.delete(schema.graduations);
  await testDb.delete(schema.classTable);
  await testDb.delete(schema.users);
  await testDb.delete(schema.gyms);
  await testDb.delete(schema.stripeCustomerMapping);
  await testDb.delete(schema.stripeWebhookEvents);
  await testDb.delete(schema.roles);
  await testDb.delete(schema.versions);
  await testDb.delete(schema.appStores);
}
```

### Example Test

```typescript
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import { setupTestDatabase, teardownTestDatabase, clearTestData } from "./test-utils";
import { users } from "./schema";
import { eq } from "drizzle-orm";

describe("Users Schema", () => {
  let db: any;
  
  beforeAll(async () => {
    db = await setupTestDatabase();
  });
  
  afterAll(async () => {
    await teardownTestDatabase();
  });
  
  beforeEach(async () => {
    await clearTestData();
  });
  
  it("should insert a user", async () => {
    const newUser = {
      clerkUserId: "user_test123",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      role: "STUDENT",
    };
    
    const [inserted] = await db.insert(users).values(newUser).returning();
    
    expect(inserted.id).toBeDefined();
    expect(inserted.email).toBe("test@example.com");
  });
});
```

---

## 10. Data Validation Scripts

### Row Count Comparison

```typescript
// scripts/validate-migration.ts

import { db as pgDb } from "@tatame-monorepo/db";
import { createClient } from "@supabase/supabase-js";
import { users, gyms, classTable /* ... */ } from "@tatame-monorepo/db/schema";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function validateTableCounts() {
  const tables = [
    { name: "users", pgTable: users, sbTable: "users" },
    { name: "gyms", pgTable: gyms, sbTable: "gyms" },
    { name: "class", pgTable: classTable, sbTable: "class" },
    // ... add all tables
  ];
  
  for (const table of tables) {
    // Count in Postgres
    const pgCount = await pgDb.select({ count: sql`count(*)` })
      .from(table.pgTable);
    
    // Count in Supabase
    const { count: sbCount } = await supabase
      .from(table.sbTable)
      .select("*", { count: "exact", head: true });
    
    console.log(`${table.name}: PG=${pgCount[0].count}, SB=${sbCount}`);
    
    if (pgCount[0].count !== sbCount) {
      console.error(`❌ Mismatch in ${table.name}`);
    } else {
      console.log(`✅ ${table.name} counts match`);
    }
  }
}

validateTableCounts();
```

---

## 11. Documentation

### Schema Documentation

Create `packages/db/README.md`:

```markdown
# Database Package (@tatame-monorepo/db)

This package contains the Drizzle ORM schema definitions and database utilities for the Tatame monorepo.

## Structure

- `src/schema/` - Table definitions and relations
- `src/migrations/` - Generated migration files
- `src/db.ts` - Database connection and utilities
- `src/test-utils.ts` - Testing utilities

## Usage

\`\`\`typescript
import { db } from "@tatame-monorepo/db";
import { users } from "@tatame-monorepo/db/schema";
import { eq } from "drizzle-orm";

// Query
const user = await db.query.users.findFirst({
  where: eq(users.clerkUserId, "user_123"),
});

// Insert
await db.insert(users).values({
  clerkUserId: "user_456",
  email: "new@example.com",
});
\`\`\`

## Scripts

- `pnpm db:generate` - Generate migrations from schema
- `pnpm db:push` - Push schema to database (dev only)
- `pnpm db:migrate` - Apply migrations (production)
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:start` - Start local Postgres with Docker

## Migration Status

See: `/docs/postgres-migration/` for detailed migration plan.
```

---

## 12. Phase 0 Checklist

### Implementation Checklist

- [ ] **Create schema files**
  - [ ] `infrastructure.ts` (roles, versions, app_stores)
  - [ ] `users.ts` (users table)
  - [ ] `gyms.ts` (gyms, class tables)
  - [ ] `graduations.ts` (graduations table)
  - [ ] `assets.ts` (assets, attachments tables)
  - [ ] `checkins.ts` (checkins table)
  - [ ] `notifications.ts` (notifications table)
  - [ ] `relations.ts` (Drizzle relations)
  - [ ] `index.ts` (export all schemas)

- [ ] **Update configuration**
  - [ ] Update `drizzle.config.ts`
  - [ ] Update `src/db.ts` with connection pooling
  - [ ] Add environment variables to `.env.example`

- [ ] **Testing setup**
  - [ ] Create `test-utils.ts`
  - [ ] Set up test database
  - [ ] Write initial schema tests

- [ ] **Documentation**
  - [ ] Create `packages/db/README.md`
  - [ ] Document schema design decisions
  - [ ] Document circular dependency handling

- [ ] **Local development**
  - [ ] Verify Docker Compose works
  - [ ] Generate initial migration
  - [ ] Apply migration to local database
  - [ ] Open Drizzle Studio and verify tables

- [ ] **Validation**
  - [ ] All tables created correctly
  - [ ] Foreign keys are properly defined
  - [ ] Indexes are created
  - [ ] Default values work
  - [ ] TypeScript types are correct

### Testing Checklist

- [ ] Connection pool works
- [ ] Migrations apply cleanly
- [ ] Foreign keys enforce relationships
- [ ] Array columns work for notifications
- [ ] Timestamps default to now()
- [ ] Serial IDs auto-increment
- [ ] Unique constraints work
- [ ] Nullable fields behave correctly

---

## 13. Known Issues & Solutions

### Issue 1: Circular Dependency (gyms ↔ users)

**Problem:** 
- `gyms.managerId` references `users.id`
- `users.gymId` references `gyms.id`

**Solution:**
1. Create gyms table with `managerId` as nullable
2. Create users table normally
3. After users migration, update gyms with correct managerId
4. Add NOT NULL constraint to managerId if desired

### Issue 2: Array Columns

**Problem:** 
- Notifications table has `recipients` and `viewedBy` as string arrays
- Must properly handle PostgreSQL array type

**Solution:**
```typescript
recipients: text("recipients").array(), // ✅ Correct
```

Drizzle will handle serialization/deserialization automatically.

### Issue 3: Date Storage

**Problem:**
- Some dates stored as text in Supabase ("YYYY-MM-DD", "MM-DD", "HH:MM")
- Should we convert to timestamp or keep as text?

**Decision:** Keep as text for now
- Less migration risk
- Existing logic expects text format
- Can optimize later if needed

---

## 14. Next Steps

Once Phase 0 is complete:

1. **Review schemas** with team
2. **Generate initial migration** (`pnpm db:generate`)
3. **Test locally** with seed data
4. **Validate** all table structures
5. **Proceed to Phase 1** - Infrastructure tables migration

---

## 15. Success Criteria

Phase 0 is complete when:

- ✅ All 11 table schemas are defined in Drizzle
- ✅ Database connection module works
- ✅ Migrations can be generated and applied
- ✅ Local development environment is set up
- ✅ Testing utilities are in place
- ✅ Documentation is complete
- ✅ Team can query tables using Drizzle Studio
- ✅ TypeScript types are fully inferred

**Next Phase:** [02-phase-1-infrastructure.md](./02-phase-1-infrastructure.md)

---

**Phase 0 Complete!** Ready to begin table-by-table migration.
