# Migration Quick Reference Card

**Quick lookup for common tasks during migration**

---

## 📖 Document Quick Links

| Need | Read |
|------|------|
| Understanding the strategy | [00-migration-overview.md](./00-migration-overview.md) |
| Setting up schemas | [01-phase-0-foundation.md](./01-phase-0-foundation.md) |
| Migrating a specific table | [02-table-by-table-guide.md](./02-table-by-table-guide.md) |
| Converting service code | [03-service-migration-patterns.md](./03-service-migration-patterns.md) |
| Getting started | [README.md](./README.md) |

---

## 🚀 Common Commands

### Database Management

```bash
# Start local Postgres
cd packages/db && pnpm db:start

# Stop local Postgres
pnpm db:stop

# Connect to database
psql postgresql://postgres:postgres@localhost:5432/tatame
```

### Drizzle Operations

```bash
# Generate migration from schema
cd packages/db && pnpm db:generate

# Apply migrations (production-safe)
pnpm db:migrate

# Push schema to DB (dev only, skips migrations)
pnpm db:push

# Open Drizzle Studio (visual DB explorer)
pnpm db:studio
```

### Validation

```bash
# List all tables
psql -d tatame -c "\dt"

# Count rows in table
psql -d tatame -c "SELECT COUNT(*) FROM users;"

# Check table structure
psql -d tatame -c "\d users"
```

---

## 📊 Table Migration Order

| Order | Table | Phase | Risk | Dependencies |
|-------|-------|-------|------|--------------|
| 1 | roles | 1 | Low | None |
| 2 | versions | 1 | Low | None |
| 3 | app_stores | 1 | Low | None |
| 4 | gyms | 2 | Low | None* |
| 5 | users | 3 | HIGH | roles, gyms |
| 6 | graduations | 3 | Med | users |
| 7 | class | 4 | HIGH | gyms, users |
| 8 | checkins | 4 | Med | users, class |
| 9 | assets | 4 | Med | class |
| 10 | attachments | 4 | Med | class |
| 11 | notifications | 5 | Med | users |

*Note: gyms has circular dependency with users - migrate with null managerId first

---

## 🔄 Common Drizzle Patterns

### Import Statements

```typescript
// Core
import { db } from "@tatame-monorepo/db";
import { users, gyms, classTable } from "@tatame-monorepo/db/schema";

// Operators
import { eq, and, or, isNull, isNotNull } from "drizzle-orm";

// Ordering
import { asc, desc } from "drizzle-orm";
```

### Query Patterns

```typescript
// Simple select
await db.select().from(users);

// Select with where
await db.select().from(users).where(eq(users.id, 1));

// Insert
await db.insert(users).values({ ... }).returning();

// Update
await db.update(users).set({ ... }).where(eq(users.id, 1));

// Delete
await db.delete(users).where(eq(users.id, 1));

// Join (via relations)
await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: { gym: true, graduations: true }
});
```

---

## 🎯 Phase Checklist

### Before Starting Any Phase

- [ ] Read phase document
- [ ] Backup current data
- [ ] Create feature branch
- [ ] Note baseline metrics

### During Phase

- [ ] Run migration script
- [ ] Validate row counts
- [ ] Update service code
- [ ] Update tests
- [ ] Run tests
- [ ] Test rollback
- [ ] Deploy to staging
- [ ] Validate in staging

### After Phase

- [ ] Monitor for 24 hours
- [ ] Document any issues
- [ ] Update documentation if needed
- [ ] Merge to main
- [ ] Move to next phase

---

## ⚠️ Common Issues & Solutions

### Issue: Row count mismatch

```sql
-- Check Supabase count
-- (in Supabase dashboard or API)

-- Check Postgres count
SELECT COUNT(*) FROM users;

-- Compare and investigate differences
```

### Issue: Foreign key violation

```sql
-- Find orphaned records
SELECT * FROM users 
WHERE gym_id NOT IN (SELECT id FROM gyms);

-- Fix: Migrate parent table first, or fix data
```

### Issue: Migration fails

```bash
# Rollback migration
git revert <commit-hash>

# Check error logs
# Fix schema issue
# Regenerate migration
pnpm db:generate

# Try again
pnpm db:push
```

---

## 📝 Data Migration Script Template

```typescript
import { db } from "@tatame-monorepo/db";
import { tableName } from "@tatame-monorepo/db/schema";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function migrateTable() {
  console.log("📦 Migrating [table_name]...");
  
  // 1. Fetch from Supabase
  const { data, error } = await supabase
    .from("table_name")
    .select("*")
    .order("id", { ascending: true });
  
  if (error) throw error;
  console.log(`Found ${data.length} rows`);
  
  // 2. Insert into Postgres
  for (const row of data) {
    await db.insert(tableName)
      .values({
        // Map fields (snake_case → camelCase)
        id: row.id,
        createdAt: new Date(row.created_at),
        // ... other fields
      })
      .onConflictDoNothing(); // Idempotent
  }
  
  // 3. Validate
  const pgCount = await db.select({ count: sql`count(*)` })
    .from(tableName);
  
  console.log(`Postgres has ${pgCount[0].count} rows`);
  
  if (Number(pgCount[0].count) !== data.length) {
    throw new Error("Row count mismatch!");
  }
  
  console.log("✅ Migration complete");
}

migrateTable().catch(console.error);
```

---

## 🔍 Validation Queries

### Check All Tables

```sql
-- List all tables with row counts
SELECT 
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM pg_catalog.pg_class WHERE relname = tablename) as count
FROM pg_catalog.pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check Foreign Keys

```sql
-- List all foreign keys
SELECT
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### Check for Orphaned Records

```sql
-- Example: Users without valid gym
SELECT COUNT(*) FROM users 
WHERE gym_id IS NOT NULL 
  AND gym_id NOT IN (SELECT id FROM gyms);
```

---

## 🔐 Environment Variables

### Development

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tatame
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Production

```bash
DATABASE_URL=postgresql://user:pass@host:5432/production_db
# Remove Supabase vars after migration complete
```

---

## 📞 Emergency Procedures

### Rollback Single Table

```bash
# 1. Stop writes to Postgres for that table
# 2. Revert service code
git revert <commit-hash>

# 3. Redeploy
pnpm build && pnpm start

# 4. Clear Postgres table (optional)
psql -d tatame -c "DELETE FROM table_name;"
```

### Full Rollback

```bash
# 1. Switch environment variable
USE_POSTGRES=false

# 2. Revert all service changes
git revert <first-commit>..<last-commit>

# 3. Redeploy immediately
pnpm build && pnpm start

# 4. Verify Supabase is active
# 5. Investigate issue before retry
```

---

## 📊 Timeline At A Glance

```
Week 1: Phase 0 + Phase 1 (Foundation + Infrastructure)
Week 2: Phase 2 + Phase 3 Start (Gyms + Users begin)
Week 3: Phase 3 Complete + Phase 4 (Users/Graduations + Class/Activity) ⚠️ HIGH RISK
Week 4: Phase 4 Complete + Phase 5 (Class complete + Notifications)
Week 5: Phase 6 + Buffer (Cutover & Monitoring)
```

---

## ✅ Success Indicators

### Per Phase

- ✅ Row counts match Supabase
- ✅ All tests passing
- ✅ No errors in staging
- ✅ Rollback tested
- ✅ Performance acceptable

### Overall

- ✅ All tables migrated
- ✅ All services updated
- ✅ Production stable 7+ days
- ✅ Zero data loss
- ✅ Team trained

---

## 🎓 Key Files to Know

```
packages/db/
├── src/
│   ├── schema/
│   │   ├── index.ts          # Export all schemas
│   │   ├── users.ts          # User tables
│   │   ├── gyms.ts           # Gym & class tables
│   │   └── ...               # Other schemas
│   ├── db.ts                 # DB connection
│   └── test-utils.ts         # Testing utilities
├── drizzle.config.ts         # Migration config
└── docker-compose.yml        # Local Postgres

apps/server/src/
├── services/
│   ├── users/index.ts        # UsersService
│   ├── gyms/index.ts         # GymsService
│   └── ...                   # Other services
└── routes/
    └── ...                   # API routes

docs/postgres-migration/      # This directory
```

---

## 💡 Pro Tips

1. **Always backup** before migrating a table
2. **Test rollback** before declaring success
3. **Migrate in pairs** (one codes, one reviews)
4. **Take breaks** between phases
5. **Celebrate milestones** 🎉
6. **Document everything** as you go
7. **Monitor closely** first 48 hours after each phase
8. **Don't skip validation** - it catches issues early

---

## 🆘 When You're Stuck

1. **Check the docs** - answer might be there
2. **Read error carefully** - often self-explanatory
3. **Check Drizzle docs** - excellent reference
4. **Ask the team** - someone might know
5. **Take a break** - fresh eyes help
6. **Review the plan** - might have missed a step

---

## 🎯 Remember

- **One phase at a time** - don't rush
- **Test everything twice** - catch issues early
- **Communication is key** - keep team informed
- **Document deviations** - help future you
- **It's a marathon, not a sprint** - pace yourself

---

**Keep this card handy during migration!**

**Need more details?** → See full documentation in this directory

**Last updated:** 2026-02-14
