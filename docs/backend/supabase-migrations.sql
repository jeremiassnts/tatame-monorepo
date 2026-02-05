-- =====================================================
-- Supabase Migrations for Backend Integration
-- =====================================================
-- Description: SQL migrations for Stripe-integrated backend
-- Version: 1.0
-- Last updated: 2026-02-05
-- 
-- Execute these migrations in your Supabase SQL Editor:
-- https://app.supabase.com/project/_/sql
-- =====================================================

-- =====================================================
-- Migration 1: Stripe Customer Mapping
-- Purpose: Store mapping between Clerk users and Stripe customers
-- Required for: Phase 3 (Supabase coexistence)
-- =====================================================

CREATE TABLE IF NOT EXISTS stripe_customer_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  clerk_user_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_stripe_customer_mapping_clerk_user_id 
  ON stripe_customer_mapping(clerk_user_id);

CREATE INDEX IF NOT EXISTS idx_stripe_customer_mapping_stripe_customer_id 
  ON stripe_customer_mapping(stripe_customer_id);

-- Add comments for documentation
COMMENT ON TABLE stripe_customer_mapping IS 
  'Maps Clerk user IDs to Stripe customer IDs for idempotent customer creation';

COMMENT ON COLUMN stripe_customer_mapping.user_id IS 
  'Internal user ID (can be same as clerk_user_id)';

COMMENT ON COLUMN stripe_customer_mapping.clerk_user_id IS 
  'Clerk user ID from authentication';

COMMENT ON COLUMN stripe_customer_mapping.stripe_customer_id IS 
  'Stripe customer ID from Stripe API';

-- =====================================================
-- Migration 2: Stripe Webhook Events
-- Purpose: Track processed webhook events for idempotency
-- Required for: Phase 4 (Webhooks)
-- =====================================================

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups and analytics
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id 
  ON stripe_webhook_events(stripe_event_id);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type 
  ON stripe_webhook_events(event_type);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_created_at 
  ON stripe_webhook_events(created_at);

-- Add comments for documentation
COMMENT ON TABLE stripe_webhook_events IS 
  'Tracks processed Stripe webhook events to ensure idempotent processing';

COMMENT ON COLUMN stripe_webhook_events.stripe_event_id IS 
  'Unique event ID from Stripe (e.g., evt_...)';

COMMENT ON COLUMN stripe_webhook_events.event_type IS 
  'Stripe event type (e.g., customer.subscription.created)';

COMMENT ON COLUMN stripe_webhook_events.processed_at IS 
  'Timestamp when the event was successfully processed';

-- =====================================================
-- Optional: Row Level Security (RLS)
-- =====================================================
-- Uncomment these if you want to enable RLS
-- Note: Backend uses service role key, which bypasses RLS

-- Enable RLS on tables
-- ALTER TABLE stripe_customer_mapping ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access (backend only)
-- CREATE POLICY "Service role only" ON stripe_customer_mapping
--   FOR ALL USING (auth.role() = 'service_role');

-- CREATE POLICY "Service role only" ON stripe_webhook_events
--   FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify migrations were successful

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('stripe_customer_mapping', 'stripe_webhook_events');

-- Check indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('stripe_customer_mapping', 'stripe_webhook_events')
ORDER BY tablename, indexname;

-- Sample queries to test tables (should return empty results initially)
SELECT COUNT(*) as customer_mappings FROM stripe_customer_mapping;
SELECT COUNT(*) as webhook_events FROM stripe_webhook_events;

-- =====================================================
-- Future: Subscription Tracking Table (Phase 5+)
-- =====================================================
-- Uncomment when implementing subscription management

-- CREATE TABLE IF NOT EXISTS stripe_subscriptions (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   clerk_user_id TEXT NOT NULL REFERENCES stripe_customer_mapping(clerk_user_id),
--   stripe_subscription_id TEXT UNIQUE NOT NULL,
--   stripe_customer_id TEXT NOT NULL,
--   stripe_price_id TEXT NOT NULL,
--   status TEXT NOT NULL, -- active, canceled, past_due, etc.
--   current_period_start TIMESTAMP WITH TIME ZONE,
--   current_period_end TIMESTAMP WITH TIME ZONE,
--   cancel_at_period_end BOOLEAN DEFAULT FALSE,
--   canceled_at TIMESTAMP WITH TIME ZONE,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_clerk_user_id 
--   ON stripe_subscriptions(clerk_user_id);

-- CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id 
--   ON stripe_subscriptions(stripe_customer_id);

-- CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status 
--   ON stripe_subscriptions(status);

-- COMMENT ON TABLE stripe_subscriptions IS 
--   'Tracks user subscriptions synced from Stripe webhooks';

-- =====================================================
-- Clean Up (Use with caution - only for development)
-- =====================================================
-- Uncomment to drop tables (WARNING: destructive operation)

-- DROP TABLE IF EXISTS stripe_webhook_events;
-- DROP TABLE IF EXISTS stripe_customer_mapping;
-- DROP TABLE IF EXISTS stripe_subscriptions; -- if created

-- =====================================================
-- End of Migrations
-- =====================================================
