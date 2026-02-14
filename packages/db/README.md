# Database Package (@tatame-monorepo/db)

This package contains the Drizzle ORM schema definitions and database utilities for the Tatame monorepo.

## Structure

- `src/schema/` - Table definitions and relations
- `src/migrations/` - Generated migration files
- `src/index.ts` - Database connection and utilities
- `src/test-utils.ts` - Testing utilities

## Usage

```typescript
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
```

## Scripts

- `pnpm db:generate` - Generate migrations from schema
- `pnpm db:push` - Push schema to database (dev only)
- `pnpm db:migrate` - Apply migrations (production)
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:start` - Start local Postgres with Docker

## Migration Status

See: `/docs/postgres-migration/` for detailed migration plan.

## Environment Variables

```bash
# Postgres Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tatame

# For testing
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tatame_test
```

## Tables (11 total)

### Infrastructure Tables
1. **roles** - User role definitions
2. **versions** - App version control
3. **app_stores** - App store links

### Core Tables
4. **gyms** - Gym/academy information
5. **users** - User data (linked to Clerk)

### Domain Tables
6. **graduations** - Belt/degree progression
7. **class** - Class schedules
8. **checkins** - Attendance tracking
9. **assets** - Class-related assets
10. **notifications** - Push notifications
11. **attachments** - File attachments (if exists)

## Known Issues

### Circular Dependency (gyms ↔ users)
- `gyms.managerId` references `users.id`
- `users.gymId` references `gyms.id`
- **Solution**: Migrate gyms first with nullable managerId, then update after users are migrated

## Phase 0 Status

✅ Schema definitions complete
✅ Database connection module created
✅ Drizzle config updated
✅ Testing utilities created
⏳ Ready for migration generation
