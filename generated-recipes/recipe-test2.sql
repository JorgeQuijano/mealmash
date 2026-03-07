-- Thai Coconut Curry Ramen
-- A fusion bowl combining Japanese ramen with Thai coconut curry flavors

-- Step 1: Get ingredient IDs
WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN (
    'Chicken Thigh', 'Rice Noodle', 'Coconut Milk', 'Chicken Stock', 
    'Bell Pepper', 'Mushroom', 'Onion', 'Garlic', 'Ginger', 
    'Soy Sauce', 'Lime', 'Cilantro', 'Basil', 'Salt', 'Black Pepper'
  )
),
-- Step 2: Insert recipe and get the ID
recipe_insert AS (
  INSERT INTO recipes (
    name, description, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at, updated_at
  )
  SELECT 
    'Thai Coconut Curry Ramen',
    'A rich and creamy fusion bowl featuring rice noodles in a fragrant coconut curry broth with tender chicken, crisp vegetables, and fresh herbs.',
    ARRAY[
      'Heat a large pot over medium-high heat and add 1 tbsp oil',
      'Season chicken thighs with salt and pepper, then cook until golden and cooked through. Set aside and slice.',
      'In the same pot, sauté onion, garlic, and ginger until fragrant, about 2 minutes',
      'Add bell pepper and mushrooms, cook for 3-4 minutes until softened',
      'Pour in coconut milk and chicken stock, bring to a simmer',
      'Add soy sauce and let simmer for 10 minutes to develop flavors',
      'Cook rice noodles according to package instructions, drain and divide into bowls',
      'Ladle the curry broth over noodles',
      'Top with sliced chicken, fresh cilantro, and basil',
      'Squeeze lime juice over the top and serve immediately'
    ],
    ARRAY['dinner'],
    ARRAY['Thai', 'Japanese'],
    ARRAY[]::text[],
    'Medium',
    15,
    25,
    4,
    '',
    NOW(),
    NOW()
  RETURNING id
)
-- Step 3: Insert recipe_ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Chicken Thigh' THEN '4 pieces'
    WHEN i.name = 'Rice Noodle' THEN '8 oz'
    WHEN i.name = 'Coconut Milk' THEN '2 cups'
    WHEN i.name = 'Chicken Stock' THEN '2 cups'
    WHEN i.name = 'Bell Pepper' THEN '1 medium'
    WHEN i.name = 'Mushroom' THEN '8 oz'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Garlic' THEN '3 cloves'
    WHEN i.name = 'Ginger' THEN '1 inch'
    WHEN i.name = 'Soy Sauce' THEN '2 tbsp'
    WHEN i.name = 'Lime' THEN '1 whole'
    WHEN i.name = 'Cilantro' THEN '1/4 cup'
    WHEN i.name = 'Basil' THEN '1/4 cup'
    WHEN i.name = 'Salt' THEN '1 tsp'
    WHEN i.name = 'Black Pepper' THEN '1/2 tsp'
  END,
  CASE 
    WHEN i.name = 'Chicken Thigh' THEN 4
    WHEN i.name = 'Rice Noodle' THEN 8
    WHEN i.name = 'Coconut Milk' THEN 2
    WHEN i.name = 'Chicken Stock' THEN 2
    WHEN i.name = 'Bell Pepper' THEN 1
    WHEN i.name = 'Mushroom' THEN 8
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garlic' THEN 3
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Soy Sauce' THEN 2
    WHEN i.name = 'Lime' THEN 1
    WHEN i.name = 'Cilantro' THEN 0.25
    WHEN i.name = 'Basil' THEN 0.25
    WHEN i.name = 'Salt' THEN 1
    WHEN i.name = 'Black Pepper' THEN 0.5
  END,
  CASE 
    WHEN i.name IN ('Chicken Thigh', 'Bell Pepper', 'Onion', 'Lime') THEN 'pieces'
    WHEN i.name IN ('Rice Noodle', 'Mushroom') THEN 'oz'
    WHEN i.name IN ('Coconut Milk', 'Chicken Stock') THEN 'cups'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Ginger' THEN 'inch'
    WHEN i.name = 'Soy Sauce' THEN 'tbsp'
    WHEN i.name IN ('Cilantro', 'Basil') THEN 'cups'
    WHEN i.name = 'Salt' THEN 'tsp'
    WHEN i.name = 'Black Pepper' THEN 'tsp'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
