# Migration Plan Update - Stripe Tables Removed

**Date:** 2026-02-14  
**Change:** Removed stripe_customer_mapping and stripe_webhook_events from migration plan  
**Reason:** These tables are not in the current Supabase schema and Stripe integration is handled through the backend service

---

## What Changed

### Tables Reduced: 13 → 11

**Removed:**
- ~~stripe_customer_mapping~~
- ~~stripe_webhook_events~~

**Remaining 11 tables:**
1. roles
2. versions
3. app_stores
4. gyms
5. users
6. graduations
7. class
8. checkins
9. assets
10. attachments
11. notifications

### Services Reduced: 11 → 10

**Services to migrate:**
1. RolesService
2. VersionsService
3. AppStoresService
4. GymsService
5. UsersService
6. GraduationsService
7. ClassService
8. CheckinsService
9. AssetsService
10. AttachmentsService *(confirmed in codebase)*
11. NotificationsService

**Removed:** StripeService (customer mapping part)

---

## Timeline Updated

### Before
- **Total:** 4-6 weeks (19-28 days)
- **Phase 2:** 3-4 days (gyms + 2 stripe tables)

### After
- **Total:** 3-5 weeks (17-24 days)
- **Phase 2:** 2-3 days (gyms only) - **Risk reduced to LOW**

### Phase-by-Phase Changes

| Phase | Before | After | Change |
|-------|--------|-------|--------|
| Phase 0 | 1-2 days | 1-2 days | No change |
| Phase 1 | 2-3 days | 2-3 days | No change |
| **Phase 2** | **3-4 days (Medium)** | **2-3 days (Low)** | **-1 day, risk reduced** |
| Phase 3 | 3-4 days | 3-4 days | No change |
| Phase 4 | 3-4 days | 3-4 days | *Added attachments table* |
| Phase 5 | 2-3 days | 2 days | -1 day (simplified) |
| Phase 6 | 2-3 days | 1-2 days | -1 day |
| **Total** | **19-28 days** | **17-24 days** | **-2 to -4 days** |

---

## Phase 2 Simplified

### Before (Medium Risk)
- Migrate 3 tables: gyms, stripe_customer_mapping, stripe_webhook_events
- Update 2 services: GymsService, StripeService
- Medium complexity due to Stripe domain

### After (Low Risk)
- Migrate 1 table: gyms
- Update 1 service: GymsService
- Low risk - simple, focused migration

---

## Phase 4 Enhanced

Added **attachments** table to Phase 4 (confirmed it exists in the codebase):

### Tables in Phase 4
7. class
8. checkins
9. assets
10. **attachments** *(added)*

### Services in Phase 4
- ClassService
- CheckinsService
- AssetsService
- **AttachmentsService** *(added)*

No timeline change - attachments is a simple table similar to assets.

---

## Benefits of This Change

### 1. Faster Migration
- 2-4 days faster overall
- Phase 2 is now simpler and lower risk

### 2. Lower Complexity
- Removed cross-domain complexity (Stripe + Gyms)
- Each phase now focuses on a single domain

### 3. Better Risk Profile
- Phase 2 reduced from Medium to Low risk
- Only 2 high-risk phases remain (3 and 4)

### 4. Clearer Scope
- No confusion about Stripe tables that don't exist in Supabase
- Migration scope matches actual database schema

---

## Risk Assessment Updated

### Before
- **Low risk:** 5 tables (infrastructure + stripe)
- **Medium risk:** 4 tables
- **High risk:** 4 tables

### After
- **Low risk:** 4 tables (infrastructure + gyms)
- **Medium risk:** 4 tables (graduations, assets, attachments, notifications)
- **High risk:** 3 tables (users, class, checkins)

**Overall risk: REDUCED** ✅

---

## Documentation Updated

All documents have been updated:

- ✅ **00-migration-overview.md** - Updated counts, phases, timeline
- ✅ **01-phase-0-foundation.md** - Removed Stripe schemas, added attachments
- ✅ **02-table-by-table-guide.md** - Removed Stripe migration steps
- ✅ **03-service-migration-patterns.md** - No changes needed (patterns still valid)
- ✅ **README.md** - Updated counts and timeline
- ✅ **MIGRATION-SUMMARY.md** - Updated statistics
- ✅ **QUICK-REFERENCE.md** - Updated table list and timeline

---

## Schema Changes

### Removed from Phase 0

```typescript
// DELETED: stripe.ts file
// - stripeCustomerMapping table
// - stripeWebhookEvents table
```

### Added to Phase 0

```typescript
// ENHANCED: assets.ts file
// Added attachments table
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

## Implementation Impact

### What Stays the Same
- Phase 0 (Foundation) process
- Phase 1 (Infrastructure) tables
- Phase 3 (Users) complexity and risk
- Phase 4 (Class) overall approach
- Phase 5 (Notifications) array handling
- Phase 6 (Cutover) procedures

### What Changes
- Phase 2 is faster and simpler
- Overall timeline is shorter
- Risk profile is improved
- Attachments table is now explicitly included

---

## Next Steps

No changes to immediate next steps:

1. ✅ Review updated documentation
2. ✅ Proceed with Phase 0 (Foundation)
3. ✅ Begin Phase 1 (Infrastructure)
4. ✅ Complete Phase 2 (now faster!)

---

## Validation

Confirmed in codebase:
- ✅ AttachmentsService exists (`apps/server/src/services/attachments/index.ts`)
- ✅ No stripe_customer_mapping or stripe_webhook_events in Supabase types
- ✅ Stripe integration handled by existing StripeService (webhooks.ts)
- ✅ All 11 tables are in use

---

## Summary

**Migration scope:** 11 tables, 10 services  
**Timeline:** 3-5 weeks (down from 4-6 weeks)  
**Risk:** Reduced (Phase 2 now low risk)  
**Complexity:** Simplified (removed cross-domain concerns)  

**Status:** ✅ Documentation updated and ready for implementation

---

**Last Updated:** 2026-02-14  
**Documentation Version:** 1.1  
**Ready to proceed:** YES
