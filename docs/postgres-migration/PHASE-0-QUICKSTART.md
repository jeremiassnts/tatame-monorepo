# Phase 0 Quick Start Guide

This guide will help you verify the Phase 0 setup and prepare for Phase 1.

---

## Prerequisites

- Docker installed and running
- Node.js and pnpm installed

---

## Step 1: Start the Database

```bash
# From project root
cd packages/db

# Start PostgreSQL with Docker
pnpm db:start

# Verify it's running
docker ps | grep tatame-monorepo-postgres
```

Expected output:
```
tatame-monorepo-postgres   postgres   Up   0.0.0.0:5432->5432/tcp
```

---

## Step 2: Apply the Migration

```bash
# Still in packages/db

# Option A: Push schema (development - faster)
pnpm db:push

# Option B: Run migration (production-safe)
pnpm db:migrate
```

You should see:
```
✅ Schema applied successfully
✅ All 11 tables created
```

---

## Step 3: Verify with Drizzle Studio

```bash
# Open Drizzle Studio (visual database explorer)
pnpm db:studio
```

This opens a browser at `https://local.drizzle.studio`

**What to check:**
- ✅ All 11 tables are visible
- ✅ Tables have correct column names
- ✅ Timestamps have default values
- ✅ users.clerk_user_id has unique constraint
- ✅ Array columns (recipients, viewed_by) are present

---

## Step 4: Test Database Connection

Create a test file to verify the connection works:

```typescript
// test-connection.ts
import { db, checkDatabaseConnection } from "@tatame-monorepo/db";
import { roles } from "@tatame-monorepo/db/schema";

async function test() {
  // Test connection
  const isConnected = await checkDatabaseConnection();
  console.log("Database connected:", isConnected);

  // Test insert
  await db.insert(roles).values({ id: "STUDENT" });
  console.log("✅ Insert successful");

  // Test query
  const allRoles = await db.query.roles.findMany();
  console.log("Roles:", allRoles);
}

test();
```

---

## Step 5: Verify Environment Variables

Check that `apps/server/.env` has:

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/tatame-monorepo
```

---

## Phase 0 Checklist

Before proceeding to Phase 1, verify:

- [ ] Docker is running
- [ ] PostgreSQL container is up
- [ ] Migration applied successfully
- [ ] All 11 tables created
- [ ] Drizzle Studio can connect
- [ ] Database connection works from code
- [ ] Environment variables are set

---

## Troubleshooting

### Issue: Docker not starting

**Solution:**
```bash
# Check if Docker Desktop is running
open -a Docker

# Wait for Docker to start, then retry
```

### Issue: Port 5432 already in use

**Solution:**
```bash
# Find process using port 5432
lsof -i :5432

# Kill the process or change port in docker-compose.yml
```

### Issue: Migration fails

**Solution:**
```bash
# Reset database
docker compose down -v

# Restart and retry
docker compose up -d
pnpm db:push
```

### Issue: Connection error in code

**Solution:**
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Verify port 5432 is accessible

---

## Next Steps

Once Phase 0 is verified and working:

1. **Review Phase 1 plan**: Read `docs/postgres-migration/02-phase-1-infrastructure.md`
2. **Export Supabase data**: Back up current data from Supabase
3. **Start Phase 1**: Migrate infrastructure tables (roles, versions, app_stores)

---

## Useful Commands

```bash
# Start database
pnpm db:start

# Stop database (keeps data)
pnpm db:stop

# Stop and remove data
pnpm db:down

# View database logs
docker logs tatame-monorepo-postgres

# Connect with psql
psql postgresql://postgres:password@localhost:5432/tatame-monorepo

# Generate new migration (after schema changes)
pnpm db:generate

# Open Drizzle Studio
pnpm db:studio
```

---

## Phase 0 Status

✅ **Complete** - Foundation is ready, proceed to Phase 1 when ready.
