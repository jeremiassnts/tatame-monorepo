# Table-by-Table Migration Guide

**Document Type:** Reference Guide  
**Purpose:** Detailed migration instructions for each table  
**Usage:** Follow this document when executing each phase

---

## How to Use This Guide

Each table migration follows the same pattern:

1. **Pre-Migration**: Backup, validation, preparation
2. **Schema**: Verify Drizzle schema is correct
3. **Data Migration**: Copy data from Supabase to Postgres
4. **Service Update**: Update service to use Drizzle
5. **Testing**: Validate data and functionality
6. **Rollback Plan**: How to revert if needed

---

## Table 1: roles

**Phase:** 1 (Infrastructure)  
**Risk:** Low  
**Dependencies:** None

### Current Structure (Supabase)

```typescript
{
  id: string;           // PK: "STUDENT", "INSTRUCTOR", "MANAGER"
  created_at: string;   // Timestamp
}
```

### Drizzle Schema

```typescript
export const roles = pgTable("roles", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Migration Steps

#### 1. Pre-Migration

```bash
# Backup Supabase data
curl "https://your-project.supabase.co/rest/v1/roles?select=*" \
  -H "apikey: YOUR_ANON_KEY" > backup/roles.json

# Check row count
# Expected: 3 rows (STUDENT, INSTRUCTOR, MANAGER)
```

#### 2. Data Migration Script

```typescript
// scripts/migrate-roles.ts
import { db } from "@tatame-monorepo/db";
import { roles } from "@tatame-monorepo/db/schema";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function migrateRoles() {
  console.log("📦 Migrating roles table...");
  
  // 1. Fetch from Supabase
  const { data, error } = await supabase
    .from("roles")
    .select("*");
  
  if (error) throw error;
  
  console.log(`Found ${data.length} roles`);
  
  // 2. Insert into Postgres
  for (const role of data) {
    await db.insert(roles).values({
      id: role.id,
      createdAt: new Date(role.created_at),
    }).onConflictDoNothing(); // Idempotent
  }
  
  console.log("✅ Roles migrated successfully");
  
  // 3. Validate
  const pgRoles = await db.select().from(roles);
  console.log(`Postgres has ${pgRoles.length} roles`);
  
  if (pgRoles.length !== data.length) {
    throw new Error("Row count mismatch!");
  }
}

migrateRoles();
```

#### 3. Service Update

```typescript
// Before (Supabase)
async getRoleByUserId(userId: number) {
  const { data, error } = await this.supabase
    .from("users")
    .select("*")
    .eq("id", userId);
  if (error) throw error;
  return data[0].role;
}

// After (Drizzle)
import { db } from "@tatame-monorepo/db";
import { users } from "@tatame-monorepo/db/schema";
import { eq } from "drizzle-orm";

async getRoleByUserId(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true },
  });
  return user?.role;
}
```

#### 4. Validation

```bash
# Check data
pnpm db:studio

# Run tests
pnpm test src/services/roles/

# Verify in production (read-only)
curl "http://localhost:3000/api/roles" # Should work with both DBs
```

#### 5. Rollback

```typescript
// Set environment variable
USE_POSTGRES_ROLES=false

// Or revert code changes
git revert <commit-hash>
```

---

## Table 2: versions

**Phase:** 1 (Infrastructure)  
**Risk:** Low  
**Dependencies:** None

### Current Structure (Supabase)

```typescript
{
  id: number;            // Serial PK
  appVersion: string;    // "1.0.0"
  created_at: string;    // Timestamp
  disabled_at: string;   // Nullable timestamp
}
```

### Drizzle Schema

```typescript
export const versions = pgTable("versions", {
  id: serial("id").primaryKey(),
  appVersion: text("app_version"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  disabledAt: timestamp("disabled_at"),
});
```

### Migration Steps

#### 1. Data Migration Script

```typescript
// scripts/migrate-versions.ts
import { db } from "@tatame-monorepo/db";
import { versions } from "@tatame-monorepo/db/schema";
import { createClient } from "@supabase/supabase-js";

async function migrateVersions() {
  console.log("📦 Migrating versions table...");
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
  
  const { data, error } = await supabase
    .from("versions")
    .select("*")
    .order("id", { ascending: true });
  
  if (error) throw error;
  
  console.log(`Found ${data.length} versions`);
  
  for (const version of data) {
    await db.insert(versions).values({
      id: version.id,
      appVersion: version.appVersion,
      createdAt: new Date(version.created_at),
      disabledAt: version.disabled_at ? new Date(version.disabled_at) : null,
    }).onConflictDoNothing();
  }
  
  console.log("✅ Versions migrated");
}
```

#### 2. Service Update

```typescript
// apps/server/src/services/versions/index.ts

// Before
class VersionsService {
  private supabase: SupabaseClient;
  constructor(accessToken: string) {
    this.supabase = (new SupabaseService(accessToken)).getClient();
  }

  async get() {
    const { data, error } = await this.supabase.from("versions")
      .select("*")
      .is("disabled_at", null)
      .limit(1);
    if (error) throw error;
    return data[0];
  }
}

// After
import { db } from "@tatame-monorepo/db";
import { versions } from "@tatame-monorepo/db/schema";
import { isNull, desc } from "drizzle-orm";

class VersionsService {
  async get() {
    return await db.query.versions.findFirst({
      where: isNull(versions.disabledAt),
      orderBy: desc(versions.id),
    });
  }
}
```

---

## Table 3: app_stores

**Phase:** 1 (Infrastructure)  
**Risk:** Low  
**Dependencies:** None

### Migration Steps

#### 1. Data Migration

```typescript
// scripts/migrate-app-stores.ts
async function migrateAppStores() {
  console.log("📦 Migrating app_stores table...");
  
  const { data, error } = await supabase
    .from("app_stores")
    .select("*")
    .order("id", { ascending: true });
  
  if (error) throw error;
  
  for (const store of data) {
    await db.insert(appStores).values({
      id: store.id,
      store: store.store,
      url: store.url,
      createdAt: new Date(store.created_at),
      disabledAt: store.disabled_at ? new Date(store.disabled_at) : null,
    }).onConflictDoNothing();
  }
  
  console.log("✅ App stores migrated");
}
```

#### 2. Service Update

```typescript
// apps/server/src/services/app-stores/index.ts

// After
import { db } from "@tatame-monorepo/db";
import { appStores } from "@tatame-monorepo/db/schema";
import { isNull } from "drizzle-orm";

class AppStoresService {
  async list() {
    return await db.select().from(appStores)
      .where(isNull(appStores.disabledAt));
  }
}
```

---

## Table 4: gyms

**Phase:** 2 (Core Domain)  
**Risk:** Low  
**Dependencies:** None (but will be referenced by users)

### Special Consideration: Circular Dependency

The gyms table has a `managerId` field that references `users.id`, but users also have a `gymId` field. Solution:

1. Migrate gyms with `managerId` as NULL
2. Migrate users normally
3. Update gyms with correct `managerId` after users migration

### Migration Steps

#### 1. Data Migration

```typescript
// scripts/migrate-gyms.ts
async function migrateGyms() {
  console.log("📦 Migrating gyms table...");
  
  const { data, error } = await supabase
    .from("gyms")
    .select("*")
    .order("id", { ascending: true });
  
  if (error) throw error;
  
  console.log(`Found ${data.length} gyms`);
  
  for (const gym of data) {
    await db.insert(gyms).values({
      id: gym.id,
      name: gym.name,
      address: gym.address,
      logo: gym.logo,
      managerId: null, // ⚠️ Will be updated after users migration
      since: gym.since,
      createdAt: new Date(gym.created_at),
    }).onConflictDoNothing();
  }
  
  console.log("✅ Gyms migrated (managerId will be updated later)");
}
```

#### 2. Service Update

```typescript
// apps/server/src/services/gyms/index.ts

// After
import { db } from "@tatame-monorepo/db";
import { gyms, users } from "@tatame-monorepo/db/schema";
import { eq } from "drizzle-orm";

class GymsService {
  async create(gymData: NewGym, userId: number) {
    // Insert gym
    const [gym] = await db.insert(gyms)
      .values(gymData)
      .returning();
    
    // Update user with gym_id
    await db.update(users)
      .set({ gymId: gym.id })
      .where(eq(users.id, userId));
    
    return gym;
  }
  
  async list() {
    return await db.select().from(gyms);
  }
  
  async getById(id: number) {
    return await db.query.gyms.findFirst({
      where: eq(gyms.id, id),
    });
  }
}
```

---

## Table 5: users (CRITICAL)

**Phase:** 3 (User Tables)  
**Risk:** HIGH  
**Dependencies:** roles, gyms must be migrated first

### Migration Steps

See detailed guide in: `03-phase-3-user-tables.md`

Key considerations:
- 20+ columns
- Multiple foreign keys
- Clerk integration must remain intact
- Approval workflow must be preserved
- High write frequency

---

## Table 6: graduations

**Phase:** 3 (User Tables)  
**Risk:** Medium  
**Dependencies:** users must be migrated first

### Migration Steps

```typescript
// scripts/migrate-graduations.ts
async function migrateGraduations() {
  console.log("📦 Migrating graduations table...");
  
  const { data, error } = await supabase
    .from("graduations")
    .select("*")
    .order("id", { ascending: true });
  
  if (error) throw error;
  
  for (const grad of data) {
    await db.insert(graduations).values({
      id: grad.id,
      userId: grad.userId,
      belt: grad.belt,
      degree: grad.degree,
      modality: grad.modality,
      createdAt: new Date(grad.created_at),
    }).onConflictDoNothing();
  }
  
  console.log("✅ Graduations migrated");
}
```

---

## Tables 7-11: class, checkins, assets, attachments, notifications

**Phase:** 4 & 5  
**Risk:** High (complex relationships and logic)  

Detailed guides in:
- `04-phase-4-class-activity.md`
- `05-phase-5-notifications.md`

---

## Common Migration Patterns

### Pattern 1: Simple Table

```typescript
async function migrateTable(tableName: string, pgTable: any) {
  const { data } = await supabase.from(tableName).select("*");
  
  for (const row of data) {
    await db.insert(pgTable).values(row).onConflictDoNothing();
  }
}
```

### Pattern 2: Table with Timestamps

```typescript
await db.insert(table).values({
  ...row,
  createdAt: new Date(row.created_at),
  updatedAt: row.updated_at ? new Date(row.updated_at) : null,
});
```

### Pattern 3: Table with Foreign Keys

```typescript
// Ensure parent table is migrated first
await migrateParentTable();

// Then migrate child with references
await migrateChildTable();
```

### Pattern 4: Table with Arrays

```typescript
await db.insert(notifications).values({
  ...row,
  recipients: row.recipients || [], // PostgreSQL array
  viewedBy: row.viewed_by || [],
});
```

---

## Validation Queries

### Check Row Counts

```sql
-- Postgres
SELECT 'roles' as table, COUNT(*) FROM roles
UNION ALL
SELECT 'versions', COUNT(*) FROM versions
UNION ALL
SELECT 'app_stores', COUNT(*) FROM app_stores
UNION ALL
SELECT 'gyms', COUNT(*) FROM gyms
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'graduations', COUNT(*) FROM graduations
UNION ALL
SELECT 'class', COUNT(*) FROM class
UNION ALL
SELECT 'checkins', COUNT(*) FROM checkins
UNION ALL
SELECT 'assets', COUNT(*) FROM assets
UNION ALL
SELECT 'attachments', COUNT(*) FROM attachments
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;
```

### Check Foreign Keys

```sql
-- Find orphaned records
SELECT * FROM users WHERE gym_id NOT IN (SELECT id FROM gyms);
SELECT * FROM class WHERE gym_id NOT IN (SELECT id FROM gyms);
SELECT * FROM class WHERE instructor_id NOT IN (SELECT id FROM users);
SELECT * FROM checkins WHERE user_id NOT IN (SELECT id FROM users);
SELECT * FROM checkins WHERE class_id NOT IN (SELECT id FROM class);
```

### Check Data Integrity

```sql
-- Verify unique constraints
SELECT clerk_user_id, COUNT(*) 
FROM users 
GROUP BY clerk_user_id 
HAVING COUNT(*) > 1;

-- Verify not null constraints
SELECT COUNT(*) FROM users WHERE clerk_user_id IS NULL;
SELECT COUNT(*) FROM gyms WHERE name IS NULL;
```

---

## Rollback Procedures

### Immediate Rollback (Code)

```bash
# Revert service changes
git revert <migration-commit>

# Redeploy
pnpm build
pnpm start
```

### Database Rollback

```sql
-- Drop all tables (nuclear option)
DROP TABLE IF EXISTS checkins CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS graduations CASCADE;
DROP TABLE IF EXISTS class CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS gyms CASCADE;
DROP TABLE IF EXISTS app_stores CASCADE;
DROP TABLE IF EXISTS versions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Then re-run migrations if needed
pnpm db:migrate
```

### Partial Rollback (Single Table)

```sql
-- Example: Rollback users table
DELETE FROM checkins WHERE user_id IN (SELECT id FROM users);
DELETE FROM graduations WHERE user_id IN (SELECT id FROM users);
DELETE FROM notifications WHERE sent_by IN (SELECT id FROM users);
-- ... delete all dependent data
DELETE FROM users;

-- Then re-migrate just that table
```

---

## Monitoring During Migration

### Metrics to Track

1. **Row Counts**: Should match between Supabase and Postgres
2. **Query Performance**: Should be similar or better
3. **Error Rates**: Should not increase
4. **Response Times**: Should remain consistent
5. **Data Consistency**: Random sampling validation

### Alerts to Set

- Row count mismatch
- Foreign key violations
- Unique constraint violations
- Query timeouts
- Connection pool exhaustion

---

## Next Steps

Once comfortable with these patterns:

1. **Start with Phase 1** (Infrastructure tables)
2. **Validate thoroughly** before proceeding
3. **Move to Phase 2** (Core domain)
4. **Continue incrementally** through all phases

Each phase document provides detailed implementation steps for that phase's tables.

---

**Reference:** This document should be used alongside phase-specific guides for detailed migration steps.
