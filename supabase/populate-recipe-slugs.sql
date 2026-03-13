-- Populate slug column for existing recipes
-- Run this SQL to generate URL-friendly slugs from recipe names

-- First, update recipes with slugs based on their names
UPDATE recipes
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      name,
      '[^a-zA-Z0-9\s-]', -- Remove special characters
      '',
      'g'
    ),
    '\s+', -- Replace multiple spaces with single dash
    '-',
    'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- Handle duplicates by appending the recipe ID
WITH duplicate_slugs AS (
  SELECT 
    r1.id,
    r1.slug,
    r1.name,
    COUNT(r2.id) as duplicate_count
  FROM recipes r1
  LEFT JOIN recipes r2 ON r1.slug = r2.slug AND r1.id != r2.id
  GROUP BY r1.id, r1.slug, r1.name
  HAVING COUNT(r2.id) > 0
)
UPDATE recipes
SET slug = (
  SELECT slug || '-' || recipes.id::TEXT
  FROM duplicate_slugs ds
  WHERE ds.id = recipes.id
)
WHERE id IN (SELECT id FROM duplicate_slugs);

-- Verify the results
SELECT id, name, slug FROM recipes WHERE slug IS NOT NULL LIMIT 20;
