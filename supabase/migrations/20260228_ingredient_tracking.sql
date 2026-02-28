-- Migration: Add ingredient tracking and spam prevention
-- Run this in Supabase SQL Editor

-- Add tracking columns to ingredients
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT true;

-- Add flag_count to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS flag_count INTEGER DEFAULT 0;

-- Enable RLS on new columns (optional but recommended)
-- ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ingredients_is_enabled ON ingredients(is_enabled);
CREATE INDEX IF NOT EXISTS idx_ingredients_created_by ON ingredients(created_by);
CREATE INDEX IF NOT EXISTS idx_user_profiles_flag_count ON user_profiles(flag_count);

-- Backfill existing ingredients as enabled (if needed)
-- UPDATE ingredients SET is_enabled = true WHERE is_enabled IS NULL;
