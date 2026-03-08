-- Recipe: Chilaquiles Verdes with Fried Eggs
-- Cuisine: Mexican
-- Category: Breakfast
-- Difficulty: Medium

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Tortillas', 'Tomatillos', 'Serrano', 'Onion', 'Garlic', 'Cilantro', 'Eggs', 'Queso Fresco', 'Mexican Cream', 'Olive Oil', 'Chicken Broth', 'Cumin')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Chilaquiles Verdes with Fried Eggs',
    'A classic Mexican breakfast featuring crispy tortilla chips bathed in tangy green salsa, topped with perfectly fried eggs, queso fresco, and fresh cilantro. This dish balances crunch, creaminess, and bright herbal notes in every bite.',
    '[]'::jsonb,
    ARRAY[
      'Roast tomatillos, serrano peppers, and garlic cloves under broiler until charred, about 5-7 minutes',
      'Blend roasted vegetables with fresh cilantro and onion to create the verde salsa',
      'Heat olive oil in a large skillet and add the verde salsa, simmer with chicken broth for 5 minutes',
      'Add stale tortilla chips to the salsa and gently toss to coat evenly',
      'Cook for 3-4 minutes until chips absorb some sauce but still hold their shape',
      'Fry eggs in a separate pan to desired doneness',
      'Serve chilaquiles on a plate, top with fried eggs',
      'Garnish with crumbled queso fresco, Mexican cream drizzle, and fresh cilantro',
      'Serve immediately with warm tortillas on the side'
    ],
    'breakfast',
    ARRAY['Mexican'],
    ARRAY[]::text[],
    'Medium',
    15, 20, 2, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Tortillas' THEN '6 small'
    WHEN i.name = 'Tomatillos' THEN '6 medium'
    WHEN i.name = 'Serrano' THEN '3-4'
    WHEN i.name = 'Onion' THEN '1/2 medium'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Cilantro' THEN '1 cup'
    WHEN i.name = 'Eggs' THEN '4 large'
    WHEN i.name = 'Queso Fresco' THEN '1/2 cup'
    WHEN i.name = 'Mexican Cream' THEN '1/4 cup'
    WHEN i.name = 'Olive Oil' THEN '3 tbsp'
    WHEN i.name = 'Chicken Broth' THEN '1 cup'
    WHEN i.name = 'Cumin' THEN '1/2 tsp'
  END,
  CASE 
    WHEN i.name = 'Tortillas' THEN 6
    WHEN i.name = 'Tomatillos' THEN 6
    WHEN i.name = 'Serrano' THEN 4
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Cilantro' THEN 1
    WHEN i.name = 'Eggs' THEN 4
    WHEN i.name = 'Queso Fresco' THEN 1
    WHEN i.name = 'Mexican Cream' THEN 1
    WHEN i.name = 'Olive Oil' THEN 3
    WHEN i.name = 'Chicken Broth' THEN 1
    WHEN i.name = 'Cumin' THEN 1
  END,
  CASE 
    WHEN i.name IN ('Tortillas', 'Tomatillos', 'Queso Fresco', 'Mexican Cream') THEN 'pieces'
    WHEN i.name IN ('Serrano', 'Eggs', 'Onion') THEN 'whole'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Cilantro' THEN 'cup'
    WHEN i.name = 'Olive Oil' THEN 'tbsp'
    WHEN i.name = 'Chicken Broth' THEN 'cup'
    WHEN i.name = 'Cumin' THEN 'tsp'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
