# Postgres Migration Documentation

**Project:** Tatame Monorepo - Backend Migration  
**From:** Supabase (PostgreSQL + REST API)  
**To:** Self-hosted PostgreSQL + Drizzle ORM  
**Status:** Planning Phase - Ready for Implementation

---

## 📚 Documentation Index

This directory contains the complete migration plan from Supabase to PostgreSQL with Drizzle ORM.

### Essential Documents (Read First)

1. **[00-migration-overview.md](./00-migration-overview.md)** ⭐ START HERE
   - Executive summary
   - Complete migration strategy
   - Phase breakdown
   - Timeline and risk assessment

2. **[01-phase-0-foundation.md](./01-phase-0-foundation.md)** 🏗️ FOUNDATION
   - Complete Drizzle schema definitions for all 13 tables
   - Database connection setup
   - Migration configuration
   - Testing framework

3. **[02-table-by-table-guide.md](./02-table-by-table-guide.md)** 📋 REFERENCE
   - Detailed migration steps for each table
   - Data migration scripts
   - Validation queries
   - Rollback procedures

4. **[03-service-migration-patterns.md](./03-service-migration-patterns.md)** 💻 CODE GUIDE
   - Before/after code examples
   - Query conversion patterns
   - Service refactoring examples
   - Common Drizzle patterns

---

## 🎯 Quick Start

### For Project Manager / Product Owner

1. Read: **00-migration-overview.md** (30 minutes)
   - Understand scope, timeline, and risks
   - Review 6-phase approach
   - Note 3-5 week timeline estimate

2. Review: Risk assessment and rollback plans
3. Approve: Resources and timeline

### For Lead Developer

1. Read: All 6 documents (2-3 hours)
2. Review: Schema definitions in Phase 0
3. Set up: Local development environment
4. Plan: Sprint breakdown for each phase

### For Developer Implementing Migration

1. Read: **00-migration-overview.md** (overview)
2. Study: **01-phase-0-foundation.md** (schemas)
3. Reference: **02-table-by-table-guide.md** (during implementation)
4. Use: **03-service-migration-patterns.md** (code examples)
5. Keep handy: **QUICK-REFERENCE.md** (commands and patterns)

---

## 📊 Migration Overview

### Current State

**Database:** Supabase (PostgreSQL with REST API)
- 13 tables total
- 11 services using Supabase client
- Type definitions in `apps/server/src/services/supabase/types.ts`

**Tables:**
1. roles
2. versions
3. app_stores
4. gyms
5. users
6. graduations
7. class
8. checkins
9. assets
10. notifications
11. stripe_customer_mapping
12. stripe_webhook_events

### Target State

**Database:** Self-hosted PostgreSQL + Drizzle ORM
- Same 13 tables, better performance
- Type-safe queries with Drizzle
- Full control over database
- Better developer experience

**Infrastructure:**
- Package: `@tatame-monorepo/db`
- ORM: Drizzle
- Migrations: Drizzle Kit
- Local dev: Docker Compose

---

## 🗺️ Migration Phases

### Phase 0: Foundation Setup (1-2 days)
**Status:** Ready to implement  
**Risk:** Low  
**Output:** Complete Drizzle schemas, database setup

**Tasks:**
- Define all 13 table schemas
- Set up database connection
- Configure migrations
- Create testing framework

**Document:** [01-phase-0-foundation.md](./01-phase-0-foundation.md)

---

### Phase 1: Infrastructure Tables (2-3 days)
**Risk:** Low  
**Tables:** roles, versions, app_stores  
**Services:** RolesService, VersionsService, AppStoresService

**Why first:**
- Simple schemas
- No foreign keys
- Low write frequency
- Establish migration patterns

---

### Phase 2: Core Domain Tables (2-3 days)
**Risk:** Low  
**Tables:** gyms  
**Services:** GymsService

**Why second:**
- Required by users table
- Moderate complexity
- Clear structure

---

### Phase 3: User Tables (3-4 days)
**Risk:** HIGH ⚠️  
**Tables:** users, graduations  
**Services:** UsersService, GraduationsService, RolesService (complete)

**Why third:**
- Critical table with 20+ columns
- Required by most other tables
- High write frequency
- Complex business logic

---

### Phase 4: Class & Activity Tables (3-4 days)
**Risk:** HIGH ⚠️  
**Tables:** class, checkins, assets, attachments  
**Services:** ClassService, CheckinsService, AssetsService, AttachmentsService

**Why fourth:**
- Complex relationships
- Date/time calculations
- Multiple foreign keys

---

### Phase 5: Notifications (2 days)
**Risk:** Medium  
**Tables:** notifications  
**Services:** NotificationsService

**Why fifth:**
- Array columns (PostgreSQL arrays)
- Push notification integration
- References users

---

### Phase 6: Cutover & Cleanup (1-2 days)
**Risk:** Medium  
**Tasks:** Remove Supabase code, final validation, production deployment

---

## ⏱️ Timeline Summary

| Phase | Duration | Risk | Tables | Services |
|-------|----------|------|--------|----------|
| 0: Foundation | 1-2 days | Low | 0 (setup) | 0 |
| 1: Infrastructure | 2-3 days | Low | 3 | 3 |
| 2: Core Domain | 3-4 days | Medium | 3 | 2 |
| 3: User Tables | 3-4 days | High | 2 | 3 |
| 4: Class & Activity | 3-4 days | High | 3 | 3 |
| 5: Notifications | 2-3 days | Medium | 1 | 1 |
| 6: Cutover | 2-3 days | Medium | 0 (cleanup) | 0 |
| **Buffer (20%)** | 3-5 days | - | - | - |
| **TOTAL** | **19-28 days** | - | **13** | **11** |

**Estimated:** 4-6 weeks with dedicated development time

---

## 🎯 Key Decisions

### 1. Use Drizzle ORM
**Reason:** Already initialized in `packages/db`, type-safe, lightweight, good developer experience

### 2. Incremental Migration
**Reason:** Minimize risk, allow thorough testing at each step, enable easy rollback

### 3. Start with Simple Tables
**Reason:** Establish patterns, gain confidence, validate approach before tackling complex tables

### 4. Keep Clerk Integration
**Reason:** Working well, no need to change, minimal risk

### 5. Dual-Write Period
**Reason:** Safety net during migration, allows validation before complete cutover

---

## ⚠️ Risk Management

### High-Risk Areas

1. **Users Table Migration**
   - Mitigation: Extensive testing, dual-write period, rollback plan
   
2. **Date/Time Calculations**
   - Mitigation: Comprehensive test suite, timezone validation
   
3. **Foreign Key Relationships**
   - Mitigation: Careful migration order, constraint validation
   
4. **Array Columns** (notifications)
   - Mitigation: Drizzle array types, data validation

### Rollback Strategy

Each phase includes:
- Complete rollback procedures
- Data validation scripts
- Service reversion instructions
- Emergency procedures for production

---

## ✅ Success Criteria

### Per-Phase Success

A phase is complete when:
- ✅ All schemas defined and migrated
- ✅ Data validated (row counts, relationships)
- ✅ Services updated and tested
- ✅ Integration tests pass
- ✅ Performance acceptable
- ✅ Rollback tested
- ✅ Documentation updated

### Migration Complete

The entire migration is complete when:
- ✅ All 13 tables migrated
- ✅ All 11 services using Drizzle
- ✅ Supabase code removed
- ✅ Production stable for 7 days
- ✅ Performance meets/exceeds baseline
- ✅ Team trained on new system

---

## 📖 Document Descriptions

### 00-migration-overview.md (35 KB)
- Executive summary and complete strategy
- All phases outlined
- Timeline and risk assessment
- Dependency graph
- Success criteria

**Read if:** You need to understand the overall approach

### 01-phase-0-foundation.md (45 KB)
- Complete Drizzle schema definitions for all 13 tables
- Database connection configuration
- Migration setup
- Testing framework
- Local development environment

**Read if:** You're setting up the database infrastructure

### 02-table-by-table-guide.md (30 KB)
- Detailed migration steps for each table
- Data migration scripts
- Validation queries
- Rollback procedures
- Common patterns

**Read if:** You're implementing a specific table migration

### 03-service-migration-patterns.md (40 KB)
- Before/after code examples
- Query conversion patterns (Supabase → Drizzle)
- Service refactoring examples
- Common Drizzle operations
- Testing strategies

**Read if:** You're converting service code from Supabase to Drizzle

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Docker (for local Postgres)
- Access to Supabase project
- Familiarity with the codebase

### Step 1: Read Documentation

```bash
# Start here
cat docs/postgres-migration/00-migration-overview.md

# Then dive into Phase 0
cat docs/postgres-migration/01-phase-0-foundation.md
```

### Step 2: Set Up Local Environment

```bash
# Start local Postgres
cd packages/db
pnpm db:start

# Verify connection
psql postgresql://postgres:postgres@localhost:5432/tatame
```

### Step 3: Implement Phase 0

Follow: [01-phase-0-foundation.md](./01-phase-0-foundation.md)

1. Create schema files
2. Configure database connection
3. Generate initial migration
4. Test locally

### Step 4: Validate Phase 0

```bash
# Generate migration
cd packages/db
pnpm db:generate

# Apply migration
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

### Step 5: Begin Phase 1

Once Phase 0 is validated, proceed to Phase 1 (infrastructure tables).

---

## 🔧 Tools & Resources

### Package Location
```
packages/db/
├── src/
│   ├── schema/         # Table definitions
│   ├── migrations/     # Generated migrations
│   ├── db.ts          # Database connection
│   └── test-utils.ts  # Testing utilities
├── drizzle.config.ts  # Drizzle configuration
├── docker-compose.yml # Local Postgres
└── package.json       # Scripts
```

### Useful Scripts

```bash
# In packages/db/

# Start local database
pnpm db:start

# Generate migrations from schema
pnpm db:generate

# Apply migrations (production-safe)
pnpm db:migrate

# Push schema to database (dev only)
pnpm db:push

# Open Drizzle Studio (visual DB explorer)
pnpm db:studio

# Stop database
pnpm db:stop
```

### External Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit (CLI) Documentation](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🤝 Contributing to Migration

### If You're Implementing a Phase

1. Create a feature branch: `feat/migration-phase-X`
2. Follow the phase document exactly
3. Test thoroughly before committing
4. Update documentation if patterns change
5. Create PR with detailed description

### If You Find Issues

1. Check rollback procedures first
2. Document the issue
3. Notify team immediately
4. Don't proceed until resolved

### If You Improve a Pattern

1. Update the relevant document
2. Share with team
3. Consider if it affects other phases

---

## 📞 Support

### Questions About Strategy
- Review: [00-migration-overview.md](./00-migration-overview.md)
- Ask: Lead developer or project manager

### Questions About Implementation
- Review: [02-table-by-table-guide.md](./02-table-by-table-guide.md)
- Review: [03-service-migration-patterns.md](./03-service-migration-patterns.md)
- Ask: Developer who completed previous phase

### Questions About Drizzle
- Check: [Drizzle Documentation](https://orm.drizzle.team/)
- Review: Service migration patterns document
- Ask: Team member with Drizzle experience

---

## ✨ Benefits of This Migration

### Developer Experience
- ✅ Better TypeScript inference
- ✅ More intuitive query API
- ✅ Better debugging (direct SQL access)
- ✅ Local development without Supabase

### Performance
- ✅ Direct database access (no REST API overhead)
- ✅ Connection pooling
- ✅ Query optimization opportunities
- ✅ Better for complex joins

### Operations
- ✅ Full control over database
- ✅ Easier backups and recovery
- ✅ No vendor lock-in
- ✅ Cost savings (self-hosted)

### Codebase
- ✅ Simpler service code
- ✅ Better type safety
- ✅ Easier testing
- ✅ More maintainable

---

## 📝 Status Tracking

Track your migration progress:

### Phase 0: Foundation
- [ ] Schema files created
- [ ] Database connection configured
- [ ] Migrations generated
- [ ] Local environment working
- [ ] Team trained on Drizzle

### Phase 1: Infrastructure
- [ ] roles migrated
- [ ] versions migrated
- [ ] app_stores migrated
- [ ] Services updated
- [ ] Tests passing

### Phase 2: Core Domain
- [ ] gyms migrated
- [ ] stripe_customer_mapping migrated
- [ ] stripe_webhook_events migrated
- [ ] Services updated
- [ ] Tests passing

### Phase 3: User Tables
- [ ] users migrated
- [ ] graduations migrated
- [ ] Services updated
- [ ] Tests passing

### Phase 4: Class & Activity
- [ ] class migrated
- [ ] checkins migrated
- [ ] assets migrated
- [ ] Services updated
- [ ] Tests passing

### Phase 5: Notifications
- [ ] notifications migrated
- [ ] Service updated
- [ ] Tests passing

### Phase 6: Cutover
- [ ] Supabase code removed
- [ ] Final validation complete
- [ ] Production deployed
- [ ] 7 days stable

---

## 🎓 Learning Path

### For New Team Members

1. **Week 1: Understanding**
   - Read all migration docs (3-4 hours)
   - Review Supabase codebase
   - Set up local environment
   - Review completed phases

2. **Week 2: Practice**
   - Migrate a simple table (with guidance)
   - Write tests for migrated service
   - Review code with experienced team member

3. **Week 3: Contributing**
   - Migrate a table independently
   - Help with next phase
   - Improve documentation

### For Experienced Developers

1. **Day 1:** Review docs, set up environment
2. **Day 2:** Complete Phase 0
3. **Day 3+:** Lead phase implementation

---

## 🏁 Final Notes

This migration is well-planned and incremental. Each phase builds on the previous one, allowing for:

- **Steady progress** without rush
- **Thorough testing** at each step
- **Easy rollback** if issues arise
- **Team learning** as you go
- **Production stability** throughout

**Estimated completion:** 4-6 weeks  
**Estimated effort:** 160-240 developer hours  
**Risk level:** Medium (with proper execution)

---

**Ready to start?** → [00-migration-overview.md](./00-migration-overview.md)

**Need help?** → Contact the development team

**Found an issue?** → Update this documentation!

---

**Last Updated:** 2026-02-14  
**Version:** 1.0  
**Status:** Planning Complete - Ready for Implementation
