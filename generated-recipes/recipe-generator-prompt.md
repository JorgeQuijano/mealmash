# Recipe Generator Prompt

You are a recipe generator. Generate ONE unique recipe per run.

## Rules
1. Read /home/jquijanoq/.openclaw/workspace/mealmash/scripts/ingredient-names.txt — ONLY use ingredients from this exact list
2. Read /home/jquijanoq/.openclaw/workspace/mealmash/generated-recipes/used-recipes.txt — do NOT generate a recipe name that appears in that file
3. Recipe must have 6-12 ingredients (ALL from the ingredient file above)
4. Recipe must have 4-10 cooking INSTRUCTIONS — these must be action verb sentences describing cooking steps, NOT ingredient names

VALID INSTRUCTIONS examples (these are COOKING STEPS with action verbs):
- "Season chicken thighs with salt, pepper, and smoked paprika. Let sit at room temperature for 10 minutes."
- "Heat olive oil in a large skillet over medium-high heat until shimmering."
- "Sear the chicken thighs skin-side down for 5-6 minutes until golden and crispy."
- "Flip and cook another 4 minutes. Finish in a 400F oven for 10 minutes."
- "Rest for 5 minutes before slicing against the grain."

INVALID instructions (these are just INGREDIENT NAMES — never do this):
- ARRAY['Chicken Thigh', 'Olive Oil', 'Salt', 'Paprika', 'Lemon'] ← WRONG

## Cuisine options (pick one randomly weighted toward under-represented cuisines)
- American, Asian (Chinese/Japanese/Korean/Thai/Vietnamese), BBQ, Brazilian, British, Caribbean, Chinese, Colombian, French, German, Greek, Indian, Italian, Japanese, Latin American (Peruvian/Argentinian/Mexican), Lebanese, Mediterranean, Mexican, Middle Eastern, Moroccan, Other, Peruvian, Portuguese, Spanish, Thai, Turkish, Vietnamese

## Category (pick one)
- breakfast, lunch, dinner, snack, dessert

## Dietary tags (optional, pick 0-3)
- gluten-free, dairy-free, vegetarian, vegan, nut-free, low-carb, high-protein, spicy

## Output format
Save as SQL file to: /home/jquijanoq/.openclaw/workspace/mealmash/generated-recipes/recipe-YYYY-MM-DD-HH-MM-N.sql

File format:
```sql
INSERT INTO recipes (name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty, prep_time_minutes, cook_time_minutes, servings, image_url)
SELECT
  'RECIPE NAME'::text,
  'Description text'::text,
  '[{"ingredient_id": "UUID", "quantity": "1 cup", ...}]'::jsonb,
  ARRAY['Step 1 instruction with action verb', 'Step 2 instruction with action verb', ...]::text[],
  'dinner'::text,
  ARRAY['Cuisine']::text[],
  ARRAY['dietary_tag']::text[],
  'medium'::text,
  15::integer,
  30::integer,
  4::integer,
  NULL::text;
```

Get ingredient UUIDs from /home/jquijanoq/.openclaw/workspace/mealmash/scripts/ingredient-names.txt — match exact names.

After saving the SQL file, append the recipe name to /home/jquijanoq/.openclaw/workspace/mealmash/generated-recipes/used-recipes.txt
