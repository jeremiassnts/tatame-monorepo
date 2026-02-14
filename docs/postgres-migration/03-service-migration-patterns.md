# Service Migration Patterns - Supabase to Drizzle

**Document Type:** Developer Reference  
**Purpose:** Code patterns and examples for converting services  
**Audience:** Developers performing the migration

---

## Overview

This document provides code patterns and examples for converting each service from Supabase client to Drizzle ORM. Each pattern shows the "before" (Supabase) and "after" (Drizzle) code side by side.

---

## General Patterns

### Pattern 1: Service Class Structure

#### Before (Supabase)

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../supabase";
import type { Database } from "../supabase/types";

export class ExampleService {
  private supabase: SupabaseClient;
  
  constructor(accessToken: string) {
    this.supabase = (new SupabaseService(accessToken)).getClient();
  }
  
  async getById(id: number) {
    const { data, error } = await this.supabase
      .from("table_name")
      .select("*")
      .eq("id", id);
    
    if (error) throw error;
    return data[0];
  }
}
```

#### After (Drizzle)

```typescript
import { db } from "@tatame-monorepo/db";
import { tableName } from "@tatame-monorepo/db/schema";
import { eq } from "drizzle-orm";

export class ExampleService {
  // No constructor needed - db is singleton
  // No accessToken needed for database access
  
  async getById(id: number) {
    return await db.query.tableName.findFirst({
      where: eq(tableName.id, id),
    });
  }
}
```

**Key Changes:**
- No Supabase client initialization
- No error handling needed (Drizzle throws automatically)
- Simpler, more direct queries
- Better TypeScript inference

---

### Pattern 2: SELECT Queries

#### Simple Select

```typescript
// Before
const { data, error } = await this.supabase
  .from("users")
  .select("*");
if (error) throw error;
return data;

// After
return await db.select().from(users);
```

#### Select with Where

```typescript
// Before
const { data, error } = await this.supabase
  .from("users")
  .select("*")
  .eq("id", userId);
if (error) throw error;
return data[0];

// After
return await db.query.users.findFirst({
  where: eq(users.id, userId),
});
```

#### Select Specific Columns

```typescript
// Before
const { data, error } = await this.supabase
  .from("users")
  .select("id, email, first_name");
if (error) throw error;
return data;

// After
return await db.select({
  id: users.id,
  email: users.email,
  firstName: users.firstName,
}).from(users);
```

#### Select with Multiple Conditions

```typescript
// Before
const { data, error } = await this.supabase
  .from("users")
  .select("*")
  .eq("gym_id", gymId)
  .eq("role", "STUDENT")
  .not("approved_at", "is", null);
if (error) throw error;
return data;

// After
return await db.select()
  .from(users)
  .where(
    and(
      eq(users.gymId, gymId),
      eq(users.role, "STUDENT"),
      isNotNull(users.approvedAt)
    )
  );
```

---

### Pattern 3: INSERT Queries

#### Simple Insert

```typescript
// Before
const { data, error } = await this.supabase
  .from("users")
  .insert({
    clerk_user_id: clerkUserId,
    email: email,
    first_name: firstName,
  });
if (error) throw error;
return data;

// After
const [user] = await db.insert(users)
  .values({
    clerkUserId: clerkUserId,
    email: email,
    firstName: firstName,
  })
  .returning();
return user;
```

#### Insert with Returning

```typescript
// Before
const { data, error } = await this.supabase
  .from("gyms")
  .insert(gym)
  .select();
if (error || !data) throw error;
return data[0];

// After
const [gym] = await db.insert(gyms)
  .values(gymData)
  .returning();
return gym;
```

#### Insert Multiple Rows

```typescript
// Before
const { data, error } = await this.supabase
  .from("users")
  .insert([user1, user2, user3]);
if (error) throw error;

// After
await db.insert(users)
  .values([user1, user2, user3]);
```

---

### Pattern 4: UPDATE Queries

#### Simple Update

```typescript
// Before
const { error } = await this.supabase
  .from("users")
  .update({ approved_at: new Date().toISOString() })
  .eq("id", userId);
if (error) throw error;

// After
await db.update(users)
  .set({ approvedAt: new Date() })
  .where(eq(users.id, userId));
```

#### Update with Multiple Conditions

```typescript
// Before
const { error } = await this.supabase
  .from("users")
  .update(data)
  .eq("id", data.id);
if (error) throw error;

// After
await db.update(users)
  .set(data)
  .where(eq(users.id, data.id));
```

---

### Pattern 5: DELETE Queries

#### Soft Delete (Update)

```typescript
// Before
const { error } = await this.supabase
  .from("users")
  .update({ deleted_at: new Date().toISOString() })
  .eq("id", userId);
if (error) throw error;

// After
await db.update(users)
  .set({ deletedAt: new Date() })
  .where(eq(users.id, userId));
```

#### Hard Delete

```typescript
// Before
const { data, error } = await this.supabase
  .from("checkins")
  .delete()
  .eq("id", checkinId);
if (error) throw error;
return data;

// After
await db.delete(checkins)
  .where(eq(checkins.id, checkinId));
```

---

### Pattern 6: Relations (Joins)

#### Simple Join

```typescript
// Before
const { data, error } = await this.supabase
  .from("class")
  .select(`
    *,
    gym:gyms!gym_id(name),
    instructor:users!instructor_id(first_name, last_name)
  `)
  .eq("gym_id", gymId);
if (error) throw error;
return data;

// After
return await db.query.classTable.findMany({
  where: eq(classTable.gymId, gymId),
  with: {
    gym: {
      columns: { name: true },
    },
    instructor: {
      columns: {
        firstName: true,
        lastName: true,
      },
    },
  },
});
```

#### Complex Join with Nested Relations

```typescript
// Before
const { data, error } = await this.supabase
  .from("users")
  .select("*, graduations(belt, degree)")
  .eq("gym_id", gymId);
if (error) throw error;
return data;

// After
return await db.query.users.findMany({
  where: eq(users.gymId, gymId),
  with: {
    graduations: {
      columns: {
        belt: true,
        degree: true,
      },
    },
  },
});
```

---

### Pattern 7: Filtering

#### Comparison Operators

```typescript
// Before: Greater than or equal
const { data } = await this.supabase
  .from("checkins")
  .select("*")
  .gte("date", startDate);

// After
return await db.select()
  .from(checkins)
  .where(gte(checkins.date, startDate));
```

```typescript
// Before: Less than or equal
const { data } = await this.supabase
  .from("checkins")
  .select("*")
  .lte("date", endDate);

// After
return await db.select()
  .from(checkins)
  .where(lte(checkins.date, endDate));
```

```typescript
// Before: Between (using gte + lte)
const { data } = await this.supabase
  .from("checkins")
  .select("*")
  .gte("date", startDate)
  .lte("date", endDate);

// After
return await db.select()
  .from(checkins)
  .where(
    and(
      gte(checkins.date, startDate),
      lte(checkins.date, endDate)
    )
  );
```

#### Null Checks

```typescript
// Before: IS NULL
const { data } = await this.supabase
  .from("versions")
  .select("*")
  .is("disabled_at", null);

// After
return await db.select()
  .from(versions)
  .where(isNull(versions.disabledAt));
```

```typescript
// Before: IS NOT NULL
const { data } = await this.supabase
  .from("users")
  .select("*")
  .not("approved_at", "is", null);

// After
return await db.select()
  .from(users)
  .where(isNotNull(users.approvedAt));
```

#### OR Conditions

```typescript
// Before
const { data } = await this.supabase
  .from("users")
  .select("*")
  .eq("gym_id", gymId)
  .or("role.eq.MANAGER,and(role.eq.INSTRUCTOR,approved_at.not.is.null)");

// After
return await db.select()
  .from(users)
  .where(
    and(
      eq(users.gymId, gymId),
      or(
        eq(users.role, "MANAGER"),
        and(
          eq(users.role, "INSTRUCTOR"),
          isNotNull(users.approvedAt)
        )
      )
    )
  );
```

---

### Pattern 8: Ordering and Limiting

#### Simple Order

```typescript
// Before
const { data } = await this.supabase
  .from("class")
  .select("*")
  .order("start", { ascending: true });

// After
return await db.select()
  .from(classTable)
  .orderBy(asc(classTable.start));
```

#### Multiple Order By

```typescript
// Before
const { data } = await this.supabase
  .from("notifications")
  .select("*")
  .order("created_at", { ascending: false });

// After
return await db.select()
  .from(notifications)
  .orderBy(desc(notifications.createdAt));
```

#### Limit

```typescript
// Before
const { data } = await this.supabase
  .from("versions")
  .select("*")
  .is("disabled_at", null)
  .limit(1);

// After
return await db.select()
  .from(versions)
  .where(isNull(versions.disabledAt))
  .limit(1);
```

---

### Pattern 9: Array Operations

#### Contains (Supabase's `contains`)

```typescript
// Before
const { data } = await this.supabase
  .from("notifications")
  .select("*")
  .contains("recipients", [userId]);

// After
import { arrayContains } from "drizzle-orm/pg-core";

return await db.select()
  .from(notifications)
  .where(arrayContains(notifications.recipients, [userId.toString()]));
```

#### Array Filtering

```typescript
// Before: Filter where array doesn't include value
const filteredData = data?.filter((e) => !e.viewed_by?.includes(userId));

// After: Can still do in-memory, or use SQL
return await db.select()
  .from(notifications)
  .where(
    sql`NOT (${userId}::text = ANY(${notifications.viewedBy}))`
  );
```

---

### Pattern 10: Count Operations

#### Simple Count

```typescript
// Before
const { count } = await this.supabase
  .from("users")
  .select("*", { count: "exact", head: true });

// After
import { count } from "drizzle-orm";

const [result] = await db.select({ 
  count: count() 
}).from(users);
return result.count;
```

#### Count with Conditions

```typescript
// Before
const { count } = await this.supabase
  .from("users")
  .select("*", { count: "exact", head: true })
  .eq("gym_id", gymId);

// After
const [result] = await db.select({ 
  count: count() 
})
.from(users)
.where(eq(users.gymId, gymId));
return result.count;
```

---

## Service-Specific Migration Examples

### UsersService

#### Before (Supabase)

```typescript
export class UsersService {
  private supabase: SupabaseClient;
  private rolesService: RolesService;
  private notificationsService: NotificationsService;
  
  constructor(accessToken: string) {
    this.supabase = (new SupabaseService(accessToken)).getClient();
    this.rolesService = new RolesService(accessToken);
    this.notificationsService = new NotificationsService(accessToken);
  }

  async create(clerkUserId: string, role: string, email: string, 
               firstName: string, lastName: string, profilePicture: string) {
    const { data, error } = await this.supabase.from("users").insert({
      clerk_user_id: clerkUserId,
      role: role,
      email: email,
      first_name: firstName,
      last_name: lastName,
      profile_picture: profilePicture,
      approved_at: this.rolesService.isHigherRole(role) 
        ? new Date().toISOString() 
        : null,
      migrated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return data;
  }

  async get(userId: number) {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", userId);
    if (error) throw error;
    return data[0];
  }

  async getByClerkUserId(clerkUserId: string) {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("clerk_user_id", clerkUserId);
    if (error) throw error;
    return data[0];
  }
}
```

#### After (Drizzle)

```typescript
import { db } from "@tatame-monorepo/db";
import { users } from "@tatame-monorepo/db/schema";
import { eq } from "drizzle-orm";
import { RolesService } from "../roles";
import { NotificationsService } from "../notifications";

export class UsersService {
  private rolesService: RolesService;
  private notificationsService: NotificationsService;
  
  constructor() {
    this.rolesService = new RolesService();
    this.notificationsService = new NotificationsService();
  }

  async create(clerkUserId: string, role: string, email: string, 
               firstName: string, lastName: string, profilePicture: string) {
    const [user] = await db.insert(users).values({
      clerkUserId,
      role,
      email,
      firstName,
      lastName,
      profilePicture,
      approvedAt: this.rolesService.isHigherRole(role) 
        ? new Date() 
        : null,
      migratedAt: new Date(),
    }).returning();
    
    return user;
  }

  async get(userId: number) {
    return await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
  }

  async getByClerkUserId(clerkUserId: string) {
    return await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    });
  }
}
```

---

### ClassService (Complex Example)

#### Before (Supabase)

```typescript
async list(gymId: number) {
  const { data, error } = await this.supabase
    .from("class")
    .select(`
      *,
      gym:gyms!gym_id(name),
      instructor:users!instructor_id(first_name, last_name),
      assets:assets!class_id(id, content, type, valid_until, created_at, title)
    `)
    .filter("gym_id", "eq", gymId)
    .filter("deleted_at", "is", null)
    .order("start", { ascending: true });

  if (error) throw error;
  
  return data.map((item) => {
    const instructor = (
      (item.instructor?.first_name ?? "") +
      " " +
      (item.instructor?.last_name ?? "")
    ).trim();
    return {
      ...item,
      instructor_name: instructor,
    }
  });
}
```

#### After (Drizzle)

```typescript
import { db } from "@tatame-monorepo/db";
import { classTable } from "@tatame-monorepo/db/schema";
import { eq, isNull, asc, and } from "drizzle-orm";

async list(gymId: number) {
  const classes = await db.query.classTable.findMany({
    where: and(
      eq(classTable.gymId, gymId),
      isNull(classTable.deletedAt)
    ),
    with: {
      gym: {
        columns: { name: true },
      },
      instructor: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
      assets: {
        columns: {
          id: true,
          content: true,
          type: true,
          validUntil: true,
          createdAt: true,
          title: true,
        },
      },
    },
    orderBy: asc(classTable.start),
  });
  
  return classes.map((item) => {
    const instructorName = item.instructor
      ? `${item.instructor.firstName ?? ""} ${item.instructor.lastName ?? ""}`.trim()
      : "";
    
    return {
      ...item,
      instructor_name: instructorName,
    };
  });
}
```

---

## Common Drizzle Imports

```typescript
// Core
import { db } from "@tatame-monorepo/db";
import { users, gyms, classTable, /* ... */ } from "@tatame-monorepo/db/schema";

// Operators
import { 
  eq,      // =
  ne,      // !=
  gt,      // >
  gte,     // >=
  lt,      // <
  lte,     // <=
  and,     // AND
  or,      // OR
  not,     // NOT
  isNull,  // IS NULL
  isNotNull, // IS NOT NULL
  like,    // LIKE
  ilike,   // ILIKE (case-insensitive)
  inArray, // IN
  notInArray, // NOT IN
  between, // BETWEEN
} from "drizzle-orm";

// Ordering
import { asc, desc } from "drizzle-orm";

// Aggregates
import { count, sum, avg, min, max } from "drizzle-orm";

// Raw SQL (when needed)
import { sql } from "drizzle-orm";

// Array operations
import { arrayContains, arrayContained, arrayOverlaps } from "drizzle-orm/pg-core";
```

---

## Error Handling Differences

### Supabase

```typescript
const { data, error } = await this.supabase
  .from("users")
  .select("*");

if (error) {
  // Handle error
  throw error;
}

return data;
```

### Drizzle

```typescript
// Drizzle throws automatically
try {
  return await db.select().from(users);
} catch (error) {
  // Handle error
  throw error;
}

// Or just let it throw
return await db.select().from(users);
```

---

## Type Safety Improvements

### Before (Supabase)

```typescript
import type { Database } from "../supabase/types";

async update(data: Database["public"]["Tables"]["users"]["Update"]) {
  // ...
}
```

### After (Drizzle)

```typescript
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { users } from "@tatame-monorepo/db/schema";

type User = InferSelectModel<typeof users>;
type NewUser = InferInsertModel<typeof users>;

async update(data: Partial<User> & { id: number }) {
  // Fully type-safe!
}
```

---

## Testing Considerations

### Before (Supabase)

```typescript
// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: mockData, error: null })),
    })),
  })),
};
```

### After (Drizzle)

```typescript
// Use test database
import { setupTestDatabase, clearTestData } from "@tatame-monorepo/db/test-utils";

let testDb: any;

beforeAll(async () => {
  testDb = await setupTestDatabase();
});

beforeEach(async () => {
  await clearTestData();
});

// Real database queries in tests!
```

---

## Migration Checklist Per Service

For each service:

- [ ] Remove Supabase client initialization
- [ ] Remove SupabaseService dependency
- [ ] Replace all `.from()` queries with Drizzle queries
- [ ] Update error handling (remove `if (error)`)
- [ ] Update type imports
- [ ] Update column names (snake_case → camelCase)
- [ ] Update tests
- [ ] Verify all queries return expected data
- [ ] Performance test against Supabase version

---

## Next Steps

1. Start with simple services (VersionsService, AppStoresService)
2. Move to medium complexity (GymsService, GraduationsService)
3. Tackle complex services last (UsersService, ClassService, NotificationsService)

Each service migration should be:
- Committed separately
- Tested thoroughly
- Deployed to staging before production

---

**Reference:** Use this document alongside phase-specific guides for complete migration instructions.
