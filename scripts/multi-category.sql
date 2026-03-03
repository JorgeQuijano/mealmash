-- Enable multi-category support for recipes
-- Run this in Supabase SQL Editor

-- 1. Drop the old single-value constraint
ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_category_check;

-- 2. Add new array column (keep old for now, we'll migrate)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 3. Migrate existing category values to new array column
UPDATE recipes 
SET categories = ARRAY[category] 
WHERE category IS NOT NULL AND category != '';

-- 4. Make the new column not null with default
ALTER TABLE recipes ALTER COLUMN categories SET DEFAULT ARRAY[]::TEXT[];

-- 5. (Optional) Drop old column after testing
-- ALTER TABLE recipes DROP COLUMN IF EXISTS category;
-- ALTER TABLE recipes RENAME COLUMN categories TO category;
