-- Recipe: Mediterranean Lamb Kofta Bowl
-- Cuisine: Mediterranean
-- Category: dinner
-- Difficulty: Medium

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN (
    'Lamb', 'Onion', 'Garlic', 'Parsley', 'Mint', 'Cumin', 'Coriander', 
    'Cinnamon', 'Tomato', 'Cucumber', 'Feta', 'Greek Yogurt', 'Olive Oil', 
    'Lemon', 'Rice', 'Salt', 'Black Pepper'
  )
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Mediterranean Lamb Kofta Bowl',
    'Juicy spiced lamb kofta served over fluffy rice with fresh cucumber tomato salad, creamy tzatziki, and crumbled feta cheese. A flavorful Mediterranean feast.',
    '[]'::jsonb,
    ARRAY[
      'Mix ground lamb with finely diced onion, garlic, parsley, mint, cumin, coriander, cinnamon, salt, and pepper.',
      'Form the mixture into small oval-shaped kofta and refrigerate for 15 minutes.',
      'Heat olive oil in a skillet over medium-high heat and cook kofta for 12-15 minutes, turning occasionally.',
      'For the salad: combine diced cucumber, tomato, red onion, parsley, olive oil, and lemon juice.',
      'For tzatziki: mix Greek yogurt with grated cucumber, garlic, lemon juice, and mint.',
      'Cook rice according to package instructions.',
      'Assemble bowls: layer rice, kofta, salad, tzatziki, and top with crumbled feta.',
      'Drizzle with extra olive oil and serve immediately.'
    ],
    'dinner',
    ARRAY['Mediterranean'],
    ARRAY[]::text[],
    'Medium',
    20, 25, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Lamb' THEN '1 lb'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Garlic' THEN '3 cloves'
    WHEN i.name = 'Parsley' THEN '1/4 cup'
    WHEN i.name = 'Mint' THEN '2 tbsp'
    WHEN i.name = 'Cumin' THEN '1 tsp'
    WHEN i.name = 'Coriander' THEN '1/2 tsp'
    WHEN i.name = 'Cinnamon' THEN '1/4 tsp'
    WHEN i.name = 'Tomato' THEN '2 medium'
    WHEN i.name = 'Cucumber' THEN '1 large'
    WHEN i.name = 'Feta' THEN '1/2 cup'
    WHEN i.name = 'Greek Yogurt' THEN '1 cup'
    WHEN i.name = 'Olive Oil' THEN '3 tbsp'
    WHEN i.name = 'Lemon' THEN '1'
    WHEN i.name = 'Rice' THEN '1.5 cups'
    WHEN i.name = 'Salt' THEN '1 tsp'
    WHEN i.name = 'Black Pepper' THEN '1/2 tsp'
  END,
  CASE 
    WHEN i.name IN ('Lamb') THEN 1
    WHEN i.name IN ('Onion', 'Tomato', 'Cucumber', 'Lemon', 'Rice') THEN 1
    WHEN i.name IN ('Garlic', 'Cumin', 'Cinnamon', 'Salt', 'Black Pepper') THEN 1
    WHEN i.name IN ('Parsley', 'Mint', 'Coriander', 'Feta') THEN 1
    WHEN i.name IN ('Greek Yogurt', 'Olive Oil') THEN 1
  END,
  CASE 
    WHEN i.name IN ('Lamb') THEN 'lb'
    WHEN i.name IN ('Onion', 'Tomato', 'Cucumber', 'Lemon') THEN 'medium'
    WHEN i.name IN ('Garlic') THEN 'cloves'
    WHEN i.name IN ('Parsley', 'Mint', 'Greek Yogurt') THEN 'cup'
    WHEN i.name IN ('Cumin', 'Coriander', 'Cinnamon', 'Salt', 'Black Pepper') THEN 'tsp'
    WHEN i.name IN ('Feta') THEN 'cup'
    WHEN i.name IN ('Olive Oil') THEN 'tbsp'
    WHEN i.name IN ('Rice') THEN 'cups'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
