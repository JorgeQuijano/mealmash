-- Add cuisine, dietary_tags, and difficulty columns to recipes table

ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS cuisine TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS dietary_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Medium';

-- Set default difficulty where null
UPDATE recipes SET difficulty = 'Medium' WHERE difficulty IS NULL;

-- Optional: Set default cuisine based on common patterns (can be customized later)
-- UPDATE recipes SET cuisine = ARRAY['American'] WHERE cuisine IS NULL;
