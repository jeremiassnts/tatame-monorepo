# Supabase to Postgres Migration Plan - Overview

**Document version:** 1.0  
**Last updated:** 2026-02-14  
**Status:** Planning Phase - No Implementation Yet

---

## 1. Executive Summary

This document outlines the complete migration strategy from Supabase (PostgreSQL with REST API) to a self-hosted PostgreSQL database using Drizzle ORM. The migration will be executed incrementally, table by table, to minimize risk and allow for gradual testing and validation.

### Key Goals

- **Data Integrity**: Ensure all data is preserved and validated
- **Incremental Approach**: Migrate one table/service at a time
- **Type Safety**: Leverage Drizzle ORM for type-safe database operations
- **Rollback Ready**: Each step should be reversible
- **Acceptable Downtime**: Project not fully published, can handle service interruption during migration

### Migration Scope

**Total Tables to Migrate:** 11 tables

**Services to Update:** 10 services

**Estimated Timeline:** 3-5 weeks (with proper testing)

---

## 2. Current State Analysis

### Existing Infrastructure

#### Supabase Tables (from types.ts)

1. **app_stores** - App store links (iOS/Android)
2. **assets** - Class-related assets (videos, documents)
3. **checkins** - Student attendance tracking
4. **class** - Class schedules and information
5. **graduations** - Student belt/degree progression
6. **gyms** - Gym/academy information
7. **notifications** - Push notification management
8. **roles** - User role definitions
9. **users** - Core user data (linked to Clerk)
10. **versions** - App version control
11. **attachments** - File attachments

**Note:** Stripe customer mapping is handled through the existing backend Stripe service, not as separate database tables.

#### Current Services Using Supabase

1. **UsersService** - User CRUD, approval, filtering
2. **GymsService** - Gym management, user association
3. **ClassService** - Class scheduling, next class calculation
4. **GraduationsService** - Belt/degree management
5. **CheckinsService** - Attendance tracking
6. **NotificationsService** - Notification CRUD and delivery
7. **AssetsService** - Asset management
8. **RolesService** - Role checking (reads from users table)
9. **VersionsService** - App version checking
10. **AppStoresService** - App store link management
11. **AttachmentsService** - File attachment management

### Existing Postgres Package

Located at: `packages/db/`

**Current Setup:**
- Drizzle ORM already configured
- `drizzle.config.ts` pointing to `DATABASE_URL`
- Empty schema directory (`src/schema/index.ts` exports nothing)
- Docker Compose for local development
- Migration scripts configured

**What's Missing:**
- Schema definitions for all tables
- Migration files
- Seed data
- Integration with `apps/server`

---

## 3. Migration Strategy

### Phase Structure

The migration will be split into **7 phases**, each with clear deliverables and validation steps.

```
Phase 0: Foundation Setup (1-2 days)
  └─► Phase 1: Infrastructure Tables (2-3 days)
       └─► Phase 2: Core Domain Tables (3-4 days)
            └─► Phase 3: User-Related Tables (3-4 days)
                 └─► Phase 4: Class & Activity Tables (3-4 days)
                      └─► Phase 5: External Integration Tables (2-3 days)
                           └─► Phase 6: Cutover & Cleanup (2-3 days)
```

### Migration Principles

1. **Service-by-Service**: Complete one service entirely before moving to the next
2. **Data Validation**: Verify data consistency at each step
3. **Simplified Approach**: Since downtime is acceptable, no need for complex dual-write patterns
4. **Feature Flags**: Use environment variables to control which database is active during testing
5. **Manual Data Migration**: Export from Supabase, import to Postgres with validation

### Structure vs. Data Migration

| Type | What it includes | When |
|------|------------------|------|
| **Structure migration** | Drizzle schemas, service code (Drizzle), migration scripts (`migrate-phase-X.ts`) | Done per phase. Commit without running data scripts. |
| **Data migration** | Running `pnpm migrate:phase-X` to copy Supabase data into Postgres | Separate step. Only when Postgres is running and cutover is planned. |

**Phase completion = structure migration.** You do not need to run the data migration scripts to complete a phase.

---

## 4. Phase Breakdown

### Phase 0: Foundation Setup ✅ (Planning Complete)

**Duration:** 1-2 days  
**Risk:** Low  
**Dependencies:** None

**Objectives:**
- Set up Drizzle schema structure
- Configure database connection pooling
- Set up migration workflow
- Create testing database environment
- Document schema design decisions

**Deliverables:**
- Complete schema definitions for all 11 tables
- Database connection module
- Migration scripts
- Local development environment
- Testing framework setup

**Tables:** None (infrastructure only)

---

### Phase 1: Infrastructure Tables (Low Risk)

**Duration:** 2-3 days  
**Risk:** Low  
**Dependencies:** Phase 0

**Objectives:**
- Migrate simple, rarely-changed tables with no complex relationships
- Validate migration process and patterns
- Establish baseline for more complex migrations

**Tables to Migrate:**
1. **roles** - Simple lookup table
2. **versions** - Version control
3. **app_stores** - App store links

**Services to Update:**
- RolesService (partial - just role lookup)
- VersionsService
- AppStoresService

**Why Start Here:**
- Simple schemas with few columns
- No foreign key dependencies
- Low write frequency
- Easy to validate

---

### Phase 2: Core Domain Tables (Low Risk)

**Duration:** 2-3 days  
**Risk:** Low  
**Dependencies:** Phase 1

**Objectives:**
- Migrate core business entity (gyms)
- Handle foreign key relationships
- Establish data validation patterns

**Tables to Migrate:**
4. **gyms** - Gym/academy information

**Services to Update:**
- GymsService

**Why Second:**
- Gyms are referenced by users and classes
- Single table with clear structure
- Moderate write frequency
- Clear validation criteria

---

### Phase 3: User-Related Tables (High Risk)

**Duration:** 3-4 days  
**Risk:** High  
**Dependencies:** Phase 2 (gyms must be migrated first)

**Objectives:**
- Migrate user data with zero data loss
- Handle complex business logic (approval, roles)
- Maintain Clerk integration

**Tables to Migrate:**
5. **users** - Core user data with multiple foreign keys
6. **graduations** - User belt/degree progression

**Services to Update:**
- UsersService (complete rewrite)
- GraduationsService
- RolesService (complete - reads from users)

**Why Third:**
- Users reference gyms and roles
- High write frequency
- Critical for all other features
- Complex business logic

**Special Considerations:**
- Users table has 20+ columns
- Multiple services depend on it
- Approval workflow must be preserved
- Clerk integration must remain intact

---

### Phase 4: Class & Activity Tables (High Risk)

**Duration:** 3-4 days  
**Risk:** High  
**Dependencies:** Phase 3 (users must be migrated first)

**Objectives:**
- Migrate class scheduling and attendance
- Maintain date/time logic
- Preserve relationships

**Tables to Migrate:**
7. **class** - Class schedules
8. **checkins** - Attendance records
9. **assets** - Class-related assets
10. **attachments** - File attachments

**Services to Update:**
- ClassService (complex time calculations)
- CheckinsService
- AssetsService
- AttachmentsService

**Why Fourth:**
- Classes reference gyms, users (instructor)
- Checkins reference classes and users
- Assets reference classes
- Complex date/time logic in ClassService
- High read frequency

**Special Considerations:**
- ClassService.nextClass() has complex date logic
- Checkins have date filtering
- Assets have expiration dates

---

### Phase 5: Notifications Table (Medium Risk)

**Duration:** 2 days  
**Risk:** Medium  
**Dependencies:** Phase 3 (users must be migrated)

**Objectives:**
- Migrate notification system
- Preserve push notification integration
- Maintain read/unread state

**Tables to Migrate:**
11. **notifications** - Push notifications and messaging

**Services to Update:**
- NotificationsService

**Why Fifth:**
- References users (sent_by, recipients)
- Array columns (recipients, viewed_by)
- Push notification integration
- Moderate write frequency

**Special Considerations:**
- Array columns need proper PostgreSQL array handling
- Expo Push Token integration must work
- Recipients stored as string array
- Viewed_by tracking

---

### Phase 6: Cutover & Cleanup

**Duration:** 1-2 days  
**Risk:** Medium  
**Dependencies:** All phases complete

**Objectives:**
- Remove Supabase dependencies
- Final data validation
- Performance optimization
- Documentation update

**Tasks:**
1. Final data synchronization
2. Remove SupabaseService and related code
3. Update all service imports
4. Remove Supabase environment variables
5. Update documentation
6. Performance testing
7. Production deployment

---

## 5. Table Dependency Graph

Understanding relationships is critical for migration order:

```
roles (standalone)
  └─► users
       ├─► gyms (users.gym_id → gyms.id)
       │    └─► class (class.gym_id → gyms.id)
       │         ├─► assets (assets.class_id → class.id)
       │         ├─► attachments (attachments.class_id → class.id)
       │         └─► checkins (checkins.classId → class.id)
       ├─► graduations (graduations.userId → users.id)
       ├─► notifications (notifications.sent_by → users.id)
       └─► class (class.instructor_id, class.created_by → users.id)

versions (standalone)
app_stores (standalone)
```

**Key Insights:**
- **roles** must be migrated before **users**
- **gyms** must be migrated before **users** (circular reference requires careful handling)
- **users** must be migrated before **class**, **graduations**, **notifications**, **checkins**
- **class** must be migrated before **assets** and **checkins**

**Circular Dependency Alert:**
- `gyms.managerId` references `users.id`
- `users.gym_id` references `gyms.id`
- **Solution**: Migrate gyms first with nullable managerId, then update after users are migrated

---

## 6. Risk Assessment

### High Risk Areas

| Area | Risk Level | Mitigation Strategy |
|------|------------|---------------------|
| Users table migration | **HIGH** | Extensive testing, rollback plan, data validation |
| Date/time calculations | **HIGH** | Comprehensive test suite, timezone validation |
| Foreign key relationships | **MEDIUM** | Migration order, constraint validation |
| Array columns | **MEDIUM** | Drizzle array column types, data validation |
| Clerk integration | **MEDIUM** | Keep clerk_user_id as source of truth |
| Production downtime | **LOW** | Acceptable - project not fully published |

### Data Loss Prevention

1. **Backup Strategy**: Export full data from Supabase before migration (can delete Supabase after)
2. **Validation Scripts**: SQL queries to compare row counts and data
3. **Testing Period**: Validate in local/staging environment before production
4. **Rollback Procedures**: Keep Supabase export as fallback
5. **Monitoring**: Real-time alerts for data inconsistencies post-migration

---

## 7. Testing Strategy

### Testing Levels

1. **Unit Tests**: Each service method with Drizzle
2. **Integration Tests**: Multi-service workflows
3. **Data Validation**: Row count, foreign key integrity
4. **Performance Tests**: Query performance comparison
5. **E2E Tests**: Full user flows

### Validation Checklist (Per Table)

- [ ] Row count matches between Supabase and Postgres
- [ ] Primary keys are sequential and correct
- [ ] Foreign key relationships are valid
- [ ] Nullable fields are preserved
- [ ] Date/time values are correctly migrated
- [ ] Array fields contain correct data
- [ ] Default values are applied
- [ ] Unique constraints are enforced
- [ ] Indexes are created
- [ ] Service methods return expected results

---

## 8. Rollback Plan

### Per-Phase Rollback

Each phase has a rollback procedure:

1. **Stop the server** temporarily (downtime is acceptable)
2. **Restore from Supabase export** if needed
3. **Revert service code** to Supabase version
4. **Validate** Supabase data is current
5. **Resume operations** on Supabase
6. **Document issues** for retry

### Emergency Rollback (Production)

If critical issues arise in production:

1. **Immediate**: Switch environment variable to use Supabase
2. **Fast**: Restore from Supabase export if needed
3. **Full**: Redeploy previous version of services
4. **Analysis**: Root cause analysis before retry

**Note:** Since the project is not fully published and downtime is acceptable, rollback can be simpler and more direct.

---

## 9. Environment Variables & Hosting

### Current (Supabase)

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### New (Postgres)

```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

**Hosting Solution:** VPS with Coolify for deployment and management. This provides:
- Easy deployment workflow
- Database management
- Environment variable management
- Monitoring capabilities

**Future Considerations:** If performance or scaling becomes an issue, can evaluate managed Postgres solutions (RDS, DigitalOcean Managed DB, etc.)

### Transition Period

```bash
# Both databases active during migration testing
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://user:password@host:port/database

# Feature flag to control which database is used
USE_POSTGRES=false  # Set to true per table/service as migrated
```

---

## 10. Success Criteria

### Phase Completion

A phase is complete when:

- ✅ All tables in phase have Drizzle schema definitions
- ✅ Migrations have run successfully
- ✅ Data is validated (row counts, relationships)
- ✅ All services are updated and tested
- ✅ Integration tests pass
- ✅ Performance is acceptable or improved
- ✅ Rollback plan is tested
- ✅ Documentation is updated

### Migration Complete

The migration is complete when:

- ✅ All 13 tables are migrated
- ✅ All 11 services use Drizzle exclusively
- ✅ Supabase code is removed
- ✅ Production is running on Postgres
- ✅ 7 days of stable production operation
- ✅ Performance meets or exceeds Supabase baseline
- ✅ Team is trained on new system

---

## 11. Timeline Summary

| Phase | Duration | Risk | Cumulative Time |
|-------|----------|------|-----------------|
| Phase 0: Foundation | 1-2 days | Low | 1-2 days |
| Phase 1: Infrastructure | 2-3 days | Low | 3-5 days |
| Phase 2: Core Domain | 2-3 days | Low | 5-8 days |
| Phase 3: User Tables | 3-4 days | High | 8-12 days |
| Phase 4: Class & Activity | 3-4 days | High | 11-16 days |
| Phase 5: Notifications | 2 days | Medium | 13-18 days |
| Phase 6: Cutover | 1-2 days | Medium | 14-20 days |
| **Buffer (20%)** | **3-4 days** | - | **17-24 days** |
| **TOTAL** | **17-24 days** | - | **~3-5 weeks** |

**Note:** Timeline assumes dedicated development time without other major features.

---

## 12. Next Steps

### Immediate Actions (This Document)

- [x] Document current state
- [x] Identify all tables and services
- [x] Define migration phases
- [x] Establish risk mitigation strategies
- [x] Create timeline

### Next Document (Phase 0)

See: [01-phase-0-foundation.md](./01-phase-0-foundation.md)

**Phase 0 will cover:**
- Complete Drizzle schema definitions for all 13 tables
- Database connection module
- Migration script setup
- Testing framework
- Local development environment

---

## 13. Related Documents

This migration plan consists of multiple documents:

1. **00-migration-overview.md** ← You are here
2. **01-phase-0-foundation.md** - Schema definitions & setup
3. **02-phase-1-infrastructure.md** - roles, versions, app_stores
4. **03-phase-2-core-domain.md** - gyms, stripe tables
5. **04-phase-3-user-tables.md** - users, graduations
6. **05-phase-4-class-activity.md** - class, checkins, assets
7. **06-phase-5-notifications.md** - notifications
8. **07-phase-6-cutover.md** - Final cleanup & deployment
9. **99-troubleshooting.md** - Common issues & solutions

---

## 14. Questions & Decisions Log

### Resolved Questions

1. **Q:** Should we keep Supabase tables as backup during transition?
   **A:** ✅ No - Project not fully published, can handle downtime. Supabase will be deleted after migration.

2. **Q:** How to handle the gym/user circular dependency?
   **A:** ✅ Make managerId nullable, migrate gyms first, manually insert gyms before users migration.

3. **Q:** Should stripe tables stay in Supabase or migrate?
   **A:** ✅ No stripe tables needed - Stripe integration is already managed in the users table, not separate tables.

4. **Q:** What hosting solution for production Postgres?
   **A:** ✅ VPS with Coolify initially, evaluate if scaling becomes an issue later.

### Open Questions

None at this time.

### Decisions Made

1. **Decision:** Use Drizzle ORM (not Prisma or raw SQL)
   **Reason:** Already initialized in packages/db, type-safe, lightweight

2. **Decision:** Incremental migration, not "big bang"
   **Reason:** Minimize risk, allow testing, enable rollback

3. **Decision:** Start with simple tables (roles, versions, app_stores)
   **Reason:** Low risk, establish patterns, gain confidence

4. **Decision:** Keep Clerk integration as-is
   **Reason:** Working well, no need to change

---

**End of Overview Document**

**Next:** [01-phase-0-foundation.md](./01-phase-0-foundation.md) - Detailed schema definitions and setup
