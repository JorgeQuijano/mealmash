-- Recipe: Greek Lemon Herb Chicken Bowl
-- Cuisine: Mediterranean
-- Category: lunch
-- Difficulty: Easy

-- Step 1: Get ingredient IDs
WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Chicken Breast', 'Lemon', 'Olive Oil', 'Garlic', 'Oregano', 'Rosemary', 'Salt', 'Black Pepper', 'Cucumber', 'Tomato', 'Red Onion', 'Feta', 'Kalamata Olive', 'Chicken Stock')
),
-- Step 2: Insert recipe and get the ID
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Greek Lemon Herb Chicken Bowl',
    'A vibrant Mediterranean lunch bowl featuring juicy lemon-herb marinated chicken breast served over fresh cucumber, tomato, and red onion salad with kalamata olives and creamy feta cheese. Light, refreshing, and packed with Mediterranean flavor.',
    '[]'::jsonb,
    ARRAY[
      'Combine olive oil, lemon juice, minced garlic, oregano, and rosemary in a bowl to create the marinade',
      'Cut chicken breast into bite-sized pieces and toss in the marinade. Let rest for 10 minutes.',
      'Heat a pan over medium-high heat and cook marinated chicken until golden and cooked through, about 8-10 minutes.',
      'While chicken cooks, dice cucumber, tomato, and thin slice red onion.',
      'In a large bowl, combine the fresh vegetables with kalamata olives.',
      'Arrange the vegetable mixture in bowls as the base.',
      'Top with the hot lemon herb chicken pieces.',
      'Crumble feta cheese over the top and serve immediately.',
      'Optional: drizzle with extra olive oil and a squeeze of fresh lemon.'
    ],
    'lunch',
    ARRAY['Mediterranean'],
    ARRAY['High Protein'],
    'Easy',
    15, 15, 2, '', NOW()
  ) RETURNING id
)
-- Step 3: Insert recipe_ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN '1 lb'
    WHEN i.name = 'Lemon' THEN '2 medium'
    WHEN i.name = 'Olive Oil' THEN '3 tablespoons'
    WHEN i.name = 'Garlic' THEN '3 cloves'
    WHEN i.name = 'Oregano' THEN '1 teaspoon'
    WHEN i.name = 'Rosemary' THEN '1 teaspoon'
    WHEN i.name = 'Salt' THEN 'to taste'
    WHEN i.name = 'Black Pepper' THEN 'to taste'
    WHEN i.name = 'Cucumber' THEN '1 medium'
    WHEN i.name = 'Tomato' THEN '2 medium'
    WHEN i.name = 'Red Onion' THEN '1 small'
    WHEN i.name = 'Feta' THEN '1/2 cup'
    WHEN i.name = 'Kalamata Olive' THEN '1/4 cup'
    WHEN i.name = 'Chicken Stock' THEN '2 tablespoons'
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 1
    WHEN i.name = 'Lemon' THEN 2
    WHEN i.name = 'Olive Oil' THEN 3
    WHEN i.name = 'Garlic' THEN 3
    WHEN i.name = 'Oregano' THEN 1
    WHEN i.name = 'Rosemary' THEN 1
    WHEN i.name = 'Cucumber' THEN 1
    WHEN i.name = 'Tomato' THEN 2
    WHEN i.name = 'Red Onion' THEN 1
    WHEN i.name = 'Feta' THEN 8
    WHEN i.name = 'Kalamata Olive' THEN 4
    ELSE 1
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 'lb'
    WHEN i.name = 'Lemon' THEN 'medium'
    WHEN i.name = 'Olive Oil' THEN 'tablespoons'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Oregano' THEN 'teaspoon'
    WHEN i.name = 'Rosemary' THEN 'teaspoon'
    WHEN i.name = 'Cucumber' THEN 'medium'
    WHEN i.name = 'Tomato' THEN 'medium'
    WHEN i.name = 'Red Onion' THEN 'small'
    WHEN i.name = 'Feta' THEN 'cups'
    WHEN i.name = 'Kalamata Olive' THEN 'cups'
    ELSE 'pieces'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
