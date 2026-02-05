-- =====================================================
-- Supabase Validation Queries
-- =====================================================
-- Description: Queries to verify Supabase setup is correct
-- Version: 1.0
-- Last updated: 2026-02-05
-- 
-- Run these in your Supabase SQL Editor to verify:
-- 1. Tables exist
-- 2. Indexes are created
-- 3. Data structure is correct
-- =====================================================

-- =====================================================
-- 1. Verify Tables Exist
-- =====================================================

-- List all backend-related tables
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('stripe_customer_mapping', 'stripe_webhook_events')
ORDER BY table_name;

-- Expected output: 2 rows
-- stripe_customer_mapping
-- stripe_webhook_events

-- =====================================================
-- 2. Verify Table Structures
-- =====================================================

-- Check stripe_customer_mapping columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'stripe_customer_mapping'
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid)
-- user_id (text)
-- clerk_user_id (text)
-- stripe_customer_id (text)
-- created_at (timestamp with time zone)
-- updated_at (timestamp with time zone)

-- Check stripe_webhook_events columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'stripe_webhook_events'
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid)
-- stripe_event_id (text)
-- event_type (text)
-- processed_at (timestamp with time zone)
-- created_at (timestamp with time zone)

-- =====================================================
-- 3. Verify Indexes
-- =====================================================

-- List all indexes for backend tables
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('stripe_customer_mapping', 'stripe_webhook_events')
ORDER BY tablename, indexname;

-- Expected indexes for stripe_customer_mapping:
-- - stripe_customer_mapping_pkey (PRIMARY KEY on id)
-- - idx_stripe_customer_mapping_clerk_user_id
-- - idx_stripe_customer_mapping_stripe_customer_id
-- - stripe_customer_mapping_clerk_user_id_key (UNIQUE)
-- - stripe_customer_mapping_stripe_customer_id_key (UNIQUE)

-- Expected indexes for stripe_webhook_events:
-- - stripe_webhook_events_pkey (PRIMARY KEY on id)
-- - idx_stripe_webhook_events_event_id
-- - idx_stripe_webhook_events_event_type
-- - idx_stripe_webhook_events_created_at
-- - stripe_webhook_events_stripe_event_id_key (UNIQUE)

-- =====================================================
-- 4. Verify Constraints
-- =====================================================

-- Check unique constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('stripe_customer_mapping', 'stripe_webhook_events')
  AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
ORDER BY tc.table_name, tc.constraint_type, kcu.column_name;

-- Expected unique constraints:
-- stripe_customer_mapping: clerk_user_id, stripe_customer_id
-- stripe_webhook_events: stripe_event_id

-- =====================================================
-- 5. Check Current Data
-- =====================================================

-- Count records in each table
SELECT 
  'stripe_customer_mapping' as table_name,
  COUNT(*) as record_count
FROM stripe_customer_mapping
UNION ALL
SELECT 
  'stripe_webhook_events' as table_name,
  COUNT(*) as record_count
FROM stripe_webhook_events;

-- Recent customer mappings (if any)
SELECT 
  clerk_user_id,
  stripe_customer_id,
  created_at,
  updated_at
FROM stripe_customer_mapping
ORDER BY created_at DESC
LIMIT 5;

-- Recent webhook events (if any)
SELECT 
  stripe_event_id,
  event_type,
  processed_at,
  created_at
FROM stripe_webhook_events
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 6. Webhook Event Analytics
-- =====================================================

-- Count events by type (useful after processing some webhooks)
SELECT 
  event_type,
  COUNT(*) as event_count,
  MIN(created_at) as first_event,
  MAX(created_at) as latest_event
FROM stripe_webhook_events
GROUP BY event_type
ORDER BY event_count DESC;

-- Events processed in last 24 hours
SELECT 
  event_type,
  COUNT(*) as count_24h
FROM stripe_webhook_events
WHERE processed_at >= NOW() - INTERVAL '24 hours'
GROUP BY event_type
ORDER BY count_24h DESC;

-- =====================================================
-- 7. Data Integrity Checks
-- =====================================================

-- Check for orphaned customer mappings (customers without Stripe ID)
SELECT 
  clerk_user_id,
  stripe_customer_id,
  created_at
FROM stripe_customer_mapping
WHERE stripe_customer_id IS NULL 
   OR stripe_customer_id = ''
   OR clerk_user_id IS NULL
   OR clerk_user_id = '';

-- Expected: 0 rows (no orphaned mappings)

-- Check for duplicate event IDs (should not happen with UNIQUE constraint)
SELECT 
  stripe_event_id,
  COUNT(*) as duplicate_count
FROM stripe_webhook_events
GROUP BY stripe_event_id
HAVING COUNT(*) > 1;

-- Expected: 0 rows (no duplicates)

-- =====================================================
-- 8. Performance Check
-- =====================================================

-- Check index usage (run after some queries)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('stripe_customer_mapping', 'stripe_webhook_events')
ORDER BY tablename, indexname;

-- High idx_scan values indicate the index is being used

-- =====================================================
-- 9. Table Size and Statistics
-- =====================================================

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('stripe_customer_mapping', 'stripe_webhook_events')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- 10. Test Data Cleanup (USE WITH CAUTION)
-- =====================================================

-- Uncomment to delete test data (WARNING: destructive)
-- USE ONLY in development/testing environment

-- DELETE FROM stripe_webhook_events 
-- WHERE created_at < NOW() - INTERVAL '7 days';

-- DELETE FROM stripe_customer_mapping 
-- WHERE clerk_user_id LIKE 'test_%';

-- =====================================================
-- Validation Complete
-- =====================================================

-- If all queries above returned expected results:
-- ✅ Tables exist and are properly structured
-- ✅ Indexes are in place for performance
-- ✅ Constraints ensure data integrity
-- ✅ Ready for production use

-- Next steps:
-- 1. Configure webhook in Stripe Dashboard
-- 2. Add STRIPE_WEBHOOK_SECRET to .env
-- 3. Test webhook delivery with Stripe CLI or Dashboard
-- 4. Monitor webhook processing in server logs
-- 5. Verify events are stored in stripe_webhook_events table
