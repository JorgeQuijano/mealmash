# Task: Populate recipe_ingredients for MealMash

## Context
You are working on the MealMash project located at `/home/jquijanoq/.openclaw/workspace/mealmash`

## Problem
- 350 recipes were seeded into the Supabase database
- Recipes are in the `recipes` table but have NO ingredients
- The frontend expects ingredients from the `recipe_ingredients` junction table
- The app shows empty ingredients because nothing was populated

## Database Schema

### recipes table
```
recipes (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  ingredients JSONB,  -- currently empty []
  instructions TEXT[],
  category TEXT,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER,
  image_url TEXT
)
```

### ingredients table (already populated with 716 ingredients)
```
ingredients (
  id UUID PRIMARY KEY,
  name TEXT,
  category TEXT,
  aliases TEXT[]
)
```

### recipe_ingredients junction table (NEEDS POPULATION)
```
recipe_ingredients (
  id UUID PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id),
  ingredient_id UUID REFERENCES ingredients(id),
  quantity TEXT,  -- e.g., "2 cups", "500g", "1 tbsp"
  created_at TIMESTAMPTZ
)
```

## Your Task

1. **Read the 350 recipes** from the database
   - Supabase URL: https://owmwdsypvvaxsckflbxx.supabase.co
   - Use the anon key from .env.local

2. **Read the 716 ingredients** from the database
   - Map ingredient names to IDs

3. **For each recipe, determine appropriate ingredients** based on:
   - Recipe name (e.g., "Classic Scrambled Eggs" → eggs, butter, salt, pepper)
   - Recipe category
   - Common cooking knowledge

4. **Insert into recipe_ingredients** with proper quantities:
   - recipe_id: UUID from recipes table
   - ingredient_id: UUID from ingredients table  
   - quantity: meaningful amount (e.g., "2", "1/2 cup", "3 tbsp")

5. **Do this in batches** to avoid timeouts:
   - Insert 50 recipes at a time
   - Commit after each batch

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://owmwdsypvvaxsckflbxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bXdkc3lwdnZheHNja2ZsYnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTQ1ODUsImV4cCI6MjA4Nzc5MDU4NX0.7u9LN7jrFDDsytduRLt0kUkzeoaZZkHefbN065o-auU
```

## Example Recipe → Ingredients Mapping

### "Classic Scrambled Eggs"
- Egg (4)
- Butter (2 tbsp)
- Salt (to taste)
- Black Pepper (to taste)
- Milk (2 tbsp) - optional

### "Classic Buttermilk Pancakes"
- Flour (2 cups)
- Baking Powder (2 tsp)
- Salt (1/2 tsp)
- Sugar (2 tbsp)
- Buttermilk (1.5 cups)
- Egg (1)
- Butter (3 tbsp)
- Maple Syrup (for serving)

### "Chicken Caesar Salad"
- Chicken Breast (2)
- Romaine Lettuce (1 head)
- Parmesan (1/2 cup)
- Bread Crumb (1/2 cup)
- Olive Oil (3 tbsp)
- Lemon (1)
- Garlic (2 cloves)

## Output
- Report how many recipes were populated
- Report any errors encountered
- When complete, verify a few recipes have ingredients

## Notes
- Be thorough - each recipe should have 3-10 relevant ingredients
- Use common sense for quantities
- If an ingredient doesn't exist in the database, skip it or use a similar one
- This is a long task - take your time and do it properly
