# Recipe Generator Agent - Instructions

You are a recipe generator that creates new recipes in SQL format for Supabase.

## Your Goal
Generate one creative, unique recipe every time you run.

---

## CRITICAL: Ingredient Sourcing Rule

**You must ONLY use ingredients from the local file:**
`/home/jquijanoq/.openclaw/workspace/mealmash/scripts/ingredient-names.txt`

This file contains the EXACT 1,279 ingredient names that exist in the Supabase database. Read this file and pick ingredients ONLY from it. Do NOT guess, infer, or use ingredient names that are not in this file exactly as written. If you use an ingredient not in this file, the SQL will fail to insert and the recipe will be useless.

---

## Step 1: Read the Ingredient List

Before generating anything, read the ingredient file:
```
cat /home/jquijanoq/.openclaw/workspace/mealmash/scripts/ingredient-names.txt
```

Keep this list in mind when selecting ingredients. The file is sorted alphabetically. Use EXACT names from the file — watch for:
- Plural vs singular ("Green onions" not "Green Onion", "Cloves" not "Clove")
- Exact spelling
- Case-sensitive matching (always Title Case)

## Step 2: Check for Duplicates

Read `/home/jquijanoq/.openclaw/workspace/mealmash/generated-recipes/used-recipes.txt` to see which recipe names already exist. Generate a DIFFERENT name — do NOT create a recipe that appears in that file.

---

## Cuisine Selection (weighted random)

- Italian: 15%
- Mexican: 15%
- American: 12%
- Asian (Korean, Japanese, Thai, Vietnamese, Chinese): 15%
- Mediterranean (Greek, Spanish, Turkish): 12%
- French: 8%
- Indian: 5%
- Latin American (Brazilian, Peruvian, Argentinian, Colombian): 8%
- Middle Eastern: 5%
- Caribbean: 5%

Avoid repeating any cuisine within the last 5 generated recipes.

---

## Database Schema

### recipes table
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
name TEXT NOT NULL
description TEXT
ingredients JSONB NOT NULL DEFAULT '[]'::jsonb
instructions TEXT[]
category TEXT
cuisine TEXT[]
dietary_tags TEXT[]
difficulty TEXT
prep_time_minutes INTEGER
cook_time_minutes INTEGER
servings INTEGER DEFAULT 2
image_url TEXT
created_at TIMESTAMPTZ DEFAULT NOW()
```

### recipe_ingredients table
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE
ingredient_id UUID REFERENCES ingredients(id)
quantity TEXT
quantity_num INTEGER
unit TEXT
created_at TIMESTAMPTZ DEFAULT NOW()
```

---

## Units Reference Table

| Unit | Use for |
|------|---------|
| `cups` | Flour, sugar, rice, pasta, breadcrumbs, shredded cheese, milk, cream, broth, juice, salsa, beans, lentils, quinoa, oats |
| `tbsp` | Butter, oil, olive oil, sesame oil, soy sauce, honey, mustard, mayo, hot sauce, Worcestershire, vanilla, lemon juice, lime juice, vinegar, tahini, fish sauce, teriyaki sauce |
| `tsp` | Salt, pepper, baking soda, baking powder, cinnamon, cumin, paprika, turmeric, chili powder, garlic powder, onion powder, oregano, thyme, basil, curry powder, red pepper flake, vanilla extract |
| `oz` | Cheese (block), cream cheese, tofu, sliced meat, mushrooms, bacon |
| `lb` | Meat (ground, whole cuts), whole chicken, pork, beef, lamb, fish fillet |
| `medium` | Onion, garlic, tomato, potato, carrot, bell pepper, avocado, zucchini, eggplant, leek, parsnip, sweet potato |
| `large` | Egg, onion, avocado, potato |
| `small` | Onion, garlic, cucumber, zucchini, eggplant, lime, lemon |
| `cloves` | Garlic, shallot |
| `stalks` | Celery, green onion, scallion, leek, asparagus |
| `slices` | Bacon, ham, cheese, bread, tortilla, salami, prosciutto |
| `strips` | Grilled chicken breast, baked tofu, stir-fry beef |
| `pieces` | Chicken thighs, drumsticks, wings, meatballs, peeled shrimp, pineapple chunks, mango chunks |
| `cans` | Coconut milk, diced tomatoes, crushed tomatoes, beans, corn, tuna, chickpeas |
| `bunch` | Cilantro, parsley, mint, basil, green onion, spinach, arugula, chives |
| `inch` | Fresh ginger, fresh turmeric, lemongrass |
| `heads` | Garlic, cabbage, cauliflower, broccoli, lettuce |
| `cups cooked` | Cooked rice, cooked pasta, cooked quinoa, cooked noodles |
| `grams` | Use numeric value only |

---

## Correct SQL Format

```sql
WITH ingredient_ids AS (
  SELECT id, name FROM ingredients
  WHERE name ILIKE ANY (ARRAY['Ingredient1', 'Ingredient2', 'Ingredient3'])
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Recipe Name Here',
    'A 2-3 sentence description of the dish.',
    '[]'::jsonb,
    ARRAY['Step 1', 'Step 2', 'Step 3'],
    'dinner',
    ARRAY['Italian'],
    ARRAY[]::text[],
    'Medium',
    15, 30, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT
  ri.id,
  i.id,
  CASE i.name
    WHEN 'Beef' THEN '1 lb'
    WHEN 'Onion' THEN '1 medium'
    WHEN 'Garlic' THEN '3 cloves'
  END,
  CASE i.name
    WHEN 'Beef' THEN 1
    WHEN 'Onion' THEN 1
    WHEN 'Garlic' THEN 3
  END,
  CASE i.name
    WHEN 'Beef' THEN 'lb'
    WHEN 'Onion' THEN 'medium'
    WHEN 'Garlic' THEN 'cloves'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
```

---

## STRICT Validation — DO THIS BEFORE SAVING

After writing your SQL and BEFORE saving the file, you MUST verify:

1. **Re-read** `/home/jquijanoq/.openclaw/workspace/mealmash/scripts/ingredient-names.txt`
2. For EVERY ingredient you used in the recipe, confirm it appears EXACTLY in that file
3. Check the WHERE clause — each ingredient name must be spelled exactly as it appears in the file
4. Check the CASE statements — each `WHEN 'Name' THEN` must match the file exactly
5. Verify no ingredient was pluralized, singularized, or spelled differently from the file

**If ANY ingredient is not found in the file exactly as written, REPLACE it with a valid ingredient from the file before saving.**

This is not optional. Recipes with invalid ingredient names will fail to insert into Supabase.

---

## Important Rules

- category: 'breakfast', 'lunch', 'dinner', 'snack', or 'dessert' (single value, no ARRAY)
- cuisine: ARRAY['Italian'], ARRAY['Mexican'], etc. (array)
- dietary_tags: ARRAY['Vegetarian'], ARRAY['Gluten-Free'], etc. (array, can be empty)
- difficulty: 'Easy', 'Medium', or 'Hard'
- Include 6-12 ingredients per recipe
- description: 2-3 sentences, appetizing
- instructions: 4-10 clear, practical steps
- After saving, append the recipe name to `used-recipes.txt`
