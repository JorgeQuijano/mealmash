-- Recipe: Mediterranean Shakshuka
-- Cuisine: Mediterranean
-- Category: brunch
-- Difficulty: Easy

-- Step 1: Get ingredient IDs
WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Egg', 'Tomato', 'Onion', 'Garlic', 'Bell Pepper', 'Olive Oil', 'Cumin', 'Paprika', 'Feta', 'Cilantro', 'Salt', 'Bread')
),
-- Step 2: Insert recipe and get the ID
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Mediterranean Shakshuka',
    'A vibrant North African and Middle Eastern dish of eggs poached in a spiced tomato and pepper sauce, finished with creamy feta crumbles and fresh herbs. Perfect for brunch with crusty bread for dipping.',
    '[]'::jsonb,
    ARRAY[
      'Heat olive oil in a large skillet over medium heat',
      'Sauté diced onion and bell pepper until softened, about 5 minutes',
      'Add minced garlic, cumin, and paprika. Cook for 1 minute until fragrant',
      'Pour in crushed tomatoes and simmer for 10 minutes until sauce thickens',
      'Make 4 wells in the sauce and crack an egg into each well',
      'Cover and cook for 5-7 minutes until egg whites are set but yolks are still runny',
      'Crumble feta cheese over the top',
      'Garnish with fresh cilantro and serve with crusty bread'
    ],
    'brunch',
    ARRAY['Mediterranean'],
    ARRAY[]::text[],
    'Easy',
    10, 20, 2, '', NOW()
  ) RETURNING id
)
-- Step 3: Insert recipe_ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Egg' THEN '4 large'
    WHEN i.name = 'Tomato' THEN '2 cups crushed'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Garlic' THEN '3 cloves'
    WHEN i.name = 'Bell Pepper' THEN '1 medium'
    WHEN i.name = 'Olive Oil' THEN '2 tablespoons'
    WHEN i.name = 'Cumin' THEN '1 teaspoon'
    WHEN i.name = 'Paprika' THEN '1 teaspoon'
    WHEN i.name = 'Feta' THEN '1/4 cup'
    WHEN i.name = 'Cilantro' THEN '2 tablespoons'
    WHEN i.name = 'Salt' THEN 'to taste'
    WHEN i.name = 'Bread' THEN '4 slices'
  END,
  CASE 
    WHEN i.name = 'Egg' THEN 4
    WHEN i.name = 'Tomato' THEN 2
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garlic' THEN 3
    WHEN i.name = 'Bell Pepper' THEN 1
    WHEN i.name = 'Olive Oil' THEN 2
    WHEN i.name = 'Cumin' THEN 1
    WHEN i.name = 'Paprika' THEN 1
    WHEN i.name = 'Feta' THEN 4
    WHEN i.name = 'Cilantro' THEN 2
    WHEN i.name = 'Bread' THEN 4
    ELSE 1
  END,
  CASE 
    WHEN i.name = 'Egg' THEN 'large'
    WHEN i.name = 'Tomato' THEN 'cups crushed'
    WHEN i.name = 'Onion' THEN 'medium'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Bell Pepper' THEN 'medium'
    WHEN i.name = 'Olive Oil' THEN 'tablespoons'
    WHEN i.name = 'Cumin' THEN 'teaspoon'
    WHEN i.name = 'Paprika' THEN 'teaspoon'
    WHEN i.name = 'Feta' THEN 'cups'
    WHEN i.name = 'Cilantro' THEN 'tablespoons'
    WHEN i.name = 'Bread' THEN 'slices'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
