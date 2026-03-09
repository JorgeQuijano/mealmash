-- Recipe: Masala Egg Toast
-- Cuisine: Indian-inspired Breakfast
-- Category: breakfast
-- Difficulty: Medium

-- Step 1: Get ingredient IDs
WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Egg', 'Onion', 'Tomato', 'Garlic', 'Ginger', 'Cilantro', 'Salt', 'Black Pepper', 'Butter', 'Milk', 'Cheddar', 'Bread Crumb')
),
-- Step 2: Insert recipe and get the ID
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Masala Egg Toast',
    'A fusion breakfast combining fluffy spiced omelette with caramelized onions, tomatoes, and aromatic ginger-garlic on crispy bread, finished with melted cheddar cheese. Perfect for a hearty morning.',
    '[]'::jsonb,
    ARRAY[
      'Toast bread crumbs in a pan until golden and crispy, set aside',
      'Whisk eggs with milk, salt, and black pepper until fluffy',
      'Sauté diced onion in butter until translucent',
      'Add minced garlic and ginger, cook for 1 minute until fragrant',
      'Add diced tomato and cook until softened',
      'Pour egg mixture over vegetables and scramble gently',
      'Place egg mixture on crispy bread crumbs',
      'Top with shredded cheddar and broil until melted',
      'Garnish with fresh cilantro and serve hot'
    ],
    'breakfast',
    ARRAY['Indian'],
    ARRAY[]::text[],
    'Medium',
    10, 15, 2, '', NOW()
  ) RETURNING id
)
-- Step 3: Insert recipe_ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Egg' THEN '3 large'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Tomato' THEN '1 medium'
    WHEN i.name = 'Garlic' THEN '2 cloves'
    WHEN i.name = 'Ginger' THEN '1 inch'
    WHEN i.name = 'Cilantro' THEN '2 tablespoons'
    WHEN i.name = 'Salt' THEN 'to taste'
    WHEN i.name = 'Black Pepper' THEN 'to taste'
    WHEN i.name = 'Butter' THEN '2 tablespoons'
    WHEN i.name = 'Milk' THEN '2 tablespoons'
    WHEN i.name = 'Cheddar' THEN '1/4 cup'
    WHEN i.name = 'Bread Crumb' THEN '2 slices worth'
  END,
  CASE 
    WHEN i.name = 'Egg' THEN 3
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Tomato' THEN 1
    WHEN i.name = 'Garlic' THEN 2
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Cilantro' THEN 2
    WHEN i.name = 'Butter' THEN 2
    WHEN i.name = 'Milk' THEN 2
    WHEN i.name = 'Cheddar' THEN 4
    ELSE 1
  END,
  CASE 
    WHEN i.name = 'Egg' THEN 'large'
    WHEN i.name = 'Onion' THEN 'medium'
    WHEN i.name = 'Tomato' THEN 'medium'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Ginger' THEN 'inch'
    WHEN i.name = 'Cilantro' THEN 'tablespoons'
    WHEN i.name = 'Butter' THEN 'tablespoons'
    WHEN i.name = 'Milk' THEN 'tablespoons'
    WHEN i.name = 'Cheddar' THEN 'cups'
    ELSE 'pieces'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
