-- Vietnamese Caramel Pork Ribs (Sườn Xào Nước Đường)
-- Difficulty: Medium
-- Category: dinner

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Pork', 'Sugar', 'Fish Sauce', 'Garlic', 'Onion', 'Carrot', 'Lemon', 'Black Pepper', 'Vegetable Oil')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Vietnamese Caramel Pork Ribs',
    'Tender pork ribs slowly braised in a rich caramel sauce with aromatic garlic and onions. A balance of sweet, savory, and umami flavors that defines classic Vietnamese home cooking.',
    '[]'::jsonb,
    ARRAY[
      'Cut pork ribs into 2-inch pieces and pat dry with paper towels.',
      'Heat vegetable oil in a large Dutch oven over medium-high heat.',
      'Add sugar and stir continuously until it melts and turns deep amber (caramel).',
      'Add pork ribs and sear on all sides until browned, about 5 minutes.',
      'Add minced garlic and sliced onions, sauté for 2 minutes until fragrant.',
      'Pour in fish sauce, add 2 cups of water, and bring to a boil.',
      'Reduce heat to low, cover, and simmer for 45 minutes until ribs are tender.',
      'Add sliced carrots and continue cooking for 15 minutes until carrots are tender.',
      'Season with black pepper and squeeze fresh lemon juice over the top.',
      'Serve hot over steamed jasmine rice with pickled vegetables.'
    ],
    'dinner',
    ARRAY['Vietnamese', 'Asian'],
    ARRAY[]::text[],
    'Medium',
    20, 60, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Pork' THEN '2 lbs'
    WHEN i.name = 'Sugar' THEN '3 tbsp'
    WHEN i.name = 'Fish Sauce' THEN '4 tbsp'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Carrot' THEN '2 medium'
    WHEN i.name = 'Lemon' THEN '1 whole'
    WHEN i.name = 'Black Pepper' THEN '1 tsp'
    WHEN i.name = 'Vegetable Oil' THEN '2 tbsp'
  END,
  CASE 
    WHEN i.name = 'Pork' THEN 2
    WHEN i.name = 'Sugar' THEN 3
    WHEN i.name = 'Fish Sauce' THEN 4
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Carrot' THEN 2
    WHEN i.name = 'Lemon' THEN 1
    WHEN i.name = 'Black Pepper' THEN 1
    WHEN i.name = 'Vegetable Oil' THEN 2
  END,
  CASE 
    WHEN i.name IN ('Pork', 'Sugar', 'Fish Sauce', 'Garlic', 'Black Pepper', 'Vegetable Oil') THEN 'varies'
    WHEN i.name IN ('Onion', 'Lemon') THEN 'whole'
    WHEN i.name = 'Carrot' THEN 'medium'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
