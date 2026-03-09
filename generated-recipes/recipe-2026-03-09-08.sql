-- Recipe: Chilaquiles Verdes con Pollo
-- Cuisine: Mexican
-- Category: breakfast
-- Difficulty: Medium

-- Step 1: Get ingredient IDs
WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Chicken Breast', 'Tortilla', 'Tomato', 'Onion', 'Garlic', 'Jalapeño', 'Cilantro', 'Sour Cream', 'Cheddar', 'Salt', 'Vegetable Oil', 'Cumin', 'Chicken Stock')
),
-- Step 2: Insert recipe and get the ID
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Chilaquiles Verdes con Pollo',
    'A hearty Mexican breakfast of crispy tortilla strips simmered in a tangy green tomato and jalapeño salsa, topped with tender shredded chicken, creamy sour cream, fresh cilantro, and melted cheddar cheese. Satisfying and full of flavor.',
    '[]'::jsonb,
    ARRAY[
      'Cut tortillas into 1-inch strips and set aside',
      'Heat vegetable oil in a large skillet over medium-high heat',
      'Fry tortilla strips until golden and crispy, about 3-4 minutes. Remove and drain on paper towels',
      'In the same oil, sauté diced onion until translucent, about 3 minutes',
      'Add minced garlic and cook for 1 minute until fragrant',
      'Add diced tomatoes and jalapeño, cook for 5 minutes until softened',
      'Pour in chicken stock and add cumin, salt to taste. Simmer for 10 minutes',
      'Add shredded chicken to the salsa and mix well',
      'Add crispy tortilla strips to the sauce, toss to coat evenly',
      'Cook for 2-3 minutes until tortillas absorb some sauce but still hold shape',
      'Transfer to serving plates',
      'Top with a drizzle of sour cream, fresh cilantro, and shredded cheddar',
      'Serve immediately while hot and crispy'
    ],
    'breakfast',
    ARRAY['Mexican'],
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
    WHEN i.name = 'Chicken Breast' THEN '2 cups shredded'
    WHEN i.name = 'Tortilla' THEN '12 small'
    WHEN i.name = 'Tomato' THEN '4 medium'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Jalapeño' THEN '2 medium'
    WHEN i.name = 'Cilantro' THEN '1/4 cup'
    WHEN i.name = 'Sour Cream' THEN '1/2 cup'
    WHEN i.name = 'Cheddar' THEN '1 cup'
    WHEN i.name = 'Salt' THEN 'to taste'
    WHEN i.name = 'Vegetable Oil' THEN '1/2 cup'
    WHEN i.name = 'Cumin' THEN '1 tsp'
    WHEN i.name = 'Chicken Stock' THEN '1 cup'
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 2
    WHEN i.name = 'Tortilla' THEN 12
    WHEN i.name = 'Tomato' THEN 4
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Jalapeño' THEN 2
    WHEN i.name = 'Cilantro' THEN 4
    WHEN i.name = 'Sour Cream' THEN 8
    WHEN i.name = 'Cheddar' THEN 1
    WHEN i.name = 'Vegetable Oil' THEN 8
    ELSE 1
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 'cups'
    WHEN i.name = 'Tortilla' THEN 'small'
    WHEN i.name = 'Tomato' THEN 'medium'
    WHEN i.name = 'Onion' THEN 'medium'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Jalapeño' THEN 'medium'
    WHEN i.name = 'Cilantro' THEN 'cups'
    WHEN i.name = 'Sour Cream' THEN 'cups'
    WHEN i.name = 'Cheddar' THEN 'cups'
    WHEN i.name = 'Vegetable Oil' THEN 'cups'
    WHEN i.name = 'Cumin' THEN 'tsp'
    WHEN i.name = 'Chicken Stock' THEN 'cups'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
