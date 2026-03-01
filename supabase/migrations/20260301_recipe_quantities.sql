-- Migration: Split recipe_ingredients quantity into number + unit
-- Run this in Supabase SQL Editor

-- Add new columns
ALTER TABLE recipe_ingredients ADD COLUMN IF NOT EXISTS quantity_num INTEGER;
ALTER TABLE recipe_ingredients ADD COLUMN IF NOT EXISTS unit TEXT;

-- Migrate existing data (parse "2 cups" → quantity_num=2, unit="cups")
UPDATE recipe_ingredients 
SET 
  quantity_num = (regexp_match(quantity, '(\d+)'))[1]::integer,
  unit = TRIM(REGEXP_REPLACE(quantity, '^[0-9]+\s*', '', 'g'))
WHERE quantity IS NOT NULL;
