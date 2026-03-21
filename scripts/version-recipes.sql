-- Add version grouping columns to recipes table
-- Run once in Supabase SQL Editor

ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS version_group_id UUID,
  ADD COLUMN IF NOT EXISTS version_number INTEGER NOT NULL DEFAULT 1;

-- Index for fast version lookups
CREATE INDEX IF NOT EXISTS idx_recipes_version_group ON recipes(version_group_id);

-- Update existing recipes: each gets its own version group (they're all "v1" of themselves)
UPDATE recipes SET version_group_id = gen_random_uuid() WHERE version_group_id IS NULL;
UPDATE recipes SET version_number = 1 WHERE version_number IS NULL OR version_number = 0;
