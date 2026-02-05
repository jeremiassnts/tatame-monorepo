-- Supabase Schema for Stripe Customer Mapping
-- This file documents the required Supabase table structure for Phase 3
-- Run this in your Supabase SQL Editor to create the necessary tables

-- Create stripe_customer_mapping table
CREATE TABLE IF NOT EXISTS stripe_customer_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  clerk_user_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by clerk_user_id
CREATE INDEX IF NOT EXISTS idx_stripe_customer_clerk_user_id 
  ON stripe_customer_mapping(clerk_user_id);

-- Create index for faster lookups by stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_stripe_customer_stripe_id 
  ON stripe_customer_mapping(stripe_customer_id);

-- Add comments for documentation
COMMENT ON TABLE stripe_customer_mapping IS 'Maps Clerk user IDs to Stripe customer IDs for payment processing';
COMMENT ON COLUMN stripe_customer_mapping.user_id IS 'Internal user identifier (currently same as clerk_user_id)';
COMMENT ON COLUMN stripe_customer_mapping.clerk_user_id IS 'Clerk authentication user ID';
COMMENT ON COLUMN stripe_customer_mapping.stripe_customer_id IS 'Stripe customer ID from Stripe API';

-- Enable Row Level Security (RLS)
ALTER TABLE stripe_customer_mapping ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access only
-- Note: The backend uses service_role_key which bypasses RLS by default
-- This policy is for future reference if using anon key
CREATE POLICY "Service role can manage all mappings"
  ON stripe_customer_mapping
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
