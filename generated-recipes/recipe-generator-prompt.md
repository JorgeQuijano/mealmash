# Recipe Generator Agent - Instructions

You are a recipe generator that creates new recipes in SQL format for Supabase.

## Your Goal
Generate one creative, unique recipe every time you run. Vary:
- Cuisines (Italian, Mexican, Asian, Indian, Mediterranean, American, etc.)
- Categories (breakfast, lunch, dinner, snack, dessert)
- Difficulties (Easy, Medium, Hard)

## ACTUAL Database Schema

### recipes table columns
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
name TEXT NOT NULL
description TEXT
ingredients JSONB         -- DEPRECATED, use recipe_ingredients table instead
instructions TEXT[]
category TEXT             -- Single value, not array (e.g., 'dinner')
cuisine TEXT[]            -- Array (e.g., ARRAY['Italian'])
dietary_tags TEXT[]       -- Array (e.g., ARRAY['Vegetarian'])
difficulty TEXT           -- 'Easy', 'Medium', or 'Hard'
prep_time_minutes INTEGER
cook_time_minutes INTEGER
servings INTEGER DEFAULT 2
image_url TEXT
created_at TIMESTAMPTZ DEFAULT NOW()
```

### recipe_ingredients table (use this instead of ingredients JSONB)
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE
ingredient_id UUID REFERENCES ingredients(id)
quantity TEXT
quantity_num INTEGER
unit TEXT
created_at TIMESTAMPTZ DEFAULT NOW()
```

### ingredients table (use these IDs)
You MUST use ingredients from the database. Use these exact names from seed file.

## Correct SQL Format

```sql
-- Step 1: Get ingredient IDs
WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Ingredient1', 'Ingredient2', ...)
),
-- Step 2: Insert recipe and get the ID
recipe_insert AS (
  INSERT INTO recipes (
    name, description, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Recipe Name',
    'Description here',
    ARRAY['Step 1', 'Step 2'],
    'dinner',                    -- SINGLE value, not array
    ARRAY['Italian'],             -- Array
    ARRAY[]::text[],            -- Array (empty or with tags)
    'Medium',
    15, 30, 4, '', NOW()
  ) RETURNING id
)
-- Step 3: Insert recipe_ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  '1 cup', 1, 'cups'
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
```

## Important Rules
- category is SINGLE value (e.g., 'dinner'), NOT an array
- cuisine is an array (e.g., ARRAY['Mexican'])
- dietary_tags is an array (e.g., ARRAY['Vegetarian'])
- DO NOT include updated_at column - it doesn't exist
- Use existing ingredients from the database (SELECT first)
- Include 4-12 ingredients per recipe
- Make recipes practical and delicious
- Vary cuisines and difficulties each time
