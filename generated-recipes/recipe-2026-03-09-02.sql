-- Recipe: Thai Coconut Chicken Curry
-- Generated: 2026-03-09-02

-- Step 1: Get ingredient IDs
WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('chicken breast', 'coconut milk', 'thai basil', 'fish sauce', 'lime', 'garlic', 'onion', 'ginger', 'red curry paste', 'vegetable oil', 'jasmine rice')
),
-- Step 2: Insert recipe and get the ID
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Thai Coconut Chicken Curry',
    'A creamy, aromatic Thai curry with tender chicken pieces simmered in rich coconut milk, infused with Thai basil and fresh lime. Perfect comfort food with a kick of heat.',
    '[]'::jsonb,
    ARRAY['Heat oil in a large pan over medium-high heat', 'Add curry paste and cook for 1 minute until fragrant', 'Add diced chicken and sear on all sides', 'Pour in coconut milk and bring to a simmer', 'Add sliced onion, garlic, and ginger', 'Cook for 15 minutes until chicken is cooked through', 'Stir in fish sauce and lime juice', 'Garnish with fresh Thai basil and serve over jasmine rice'],
    'dinner',
    ARRAY['Thai'],
    ARRAY[]::text[],
    'Medium',
    15, 25, 4, '', NOW()
  ) RETURNING id
)
-- Step 3: Insert recipe_ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'chicken breast' THEN '1 lb'
    WHEN i.name = 'coconut milk' THEN '2 cups'
    WHEN i.name = 'thai basil' THEN '1/2 cup'
    WHEN i.name = 'fish sauce' THEN '2 tbsp'
    WHEN i.name = 'lime' THEN '1 lime'
    WHEN i.name = 'garlic' THEN '4 cloves'
    WHEN i.name = 'onion' THEN '1 medium'
    WHEN i.name = 'ginger' THEN '1 inch'
    WHEN i.name = 'red curry paste' THEN '3 tbsp'
    WHEN i.name = 'vegetable oil' THEN '2 tbsp'
    WHEN i.name = 'jasmine rice' THEN '2 cups'
  END,
  CASE 
    WHEN i.name = 'chicken breast' THEN 1
    WHEN i.name = 'coconut milk' THEN 2
    WHEN i.name = 'thai basil' THEN 0
    WHEN i.name = 'fish sauce' THEN 2
    WHEN i.name = 'lime' THEN 1
    WHEN i.name = 'garlic' THEN 4
    WHEN i.name = 'onion' THEN 1
    WHEN i.name = 'ginger' THEN 1
    WHEN i.name = 'red curry paste' THEN 3
    WHEN i.name = 'vegetable oil' THEN 2
    WHEN i.name = 'jasmine rice' THEN 2
  END,
  CASE 
    WHEN i.name IN ('chicken breast', 'coconut milk', 'thai basil', 'fish sauce', 'vegetable oil', 'jasmine rice') THEN 
      CASE i.name 
        WHEN 'chicken breast' THEN 'lb'
        WHEN 'coconut milk' THEN 'cups'
        WHEN 'thai basil' THEN 'cups'
        WHEN 'fish sauce' THEN 'tbsp'
        WHEN 'vegetable oil' THEN 'tbsp'
        WHEN 'jasmine rice' THEN 'cups'
      END
    WHEN i.name IN ('lime', 'onion', 'ginger') THEN 'whole'
    WHEN i.name = 'garlic' THEN 'cloves'
    WHEN i.name = 'red curry paste' THEN 'tbsp'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
