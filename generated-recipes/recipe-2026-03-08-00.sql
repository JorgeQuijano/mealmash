-- Recipe: Thai Coconut Lemongrass Chicken
-- Category: dinner
-- Cuisine: Thai
-- Difficulty: Medium

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Chicken Breast', 'Coconut Milk', 'Onion', 'Garlic', 'Ginger', 'Bell Pepper', 'Rice', 'Lemon')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Thai Coconut Lemongrass Chicken',
    'A fragrant Thai-inspired dish featuring tender chicken in a creamy coconut curry sauce with bright lemongrass and aromatic ginger. Served over steamed jasmine rice.',
    '[]'::jsonb,
    ARRAY[
      'Mince the garlic, ginger, and lemongrass stalks finely',
      'Heat coconut milk in a large wok over medium heat until it begins to separate',
      'Add garlic, ginger, and lemongrass, stir until fragrant (about 2 minutes)',
      'Add chicken breast pieces and cook until browned on all sides',
      'Add sliced bell pepper and onion, cook for 3-4 minutes',
      'Season with fish sauce and brown sugar, simmer for 10 minutes',
      'Serve over steamed jasmine rice with fresh lemon wedges'
    ],
    'dinner',
    ARRAY['Thai'],
    ARRAY[]::text[],
    'Medium',
    15, 25, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE i.name
    WHEN 'Chicken Breast' THEN '1 lb'
    WHEN 'Coconut Milk' THEN '1 can'
    WHEN 'Onion' THEN '1 medium'
    WHEN 'Garlic' THEN '4 cloves'
    WHEN 'Ginger' THEN '2 inches'
    WHEN 'Bell Pepper' THEN '1 large'
    WHEN 'Rice' THEN '2 cups'
    WHEN 'Lemon' THEN '1'
  END,
  CASE i.name
    WHEN 'Chicken Breast' THEN 1
    WHEN 'Coconut Milk' THEN 1
    WHEN 'Onion' THEN 1
    WHEN 'Garlic' THEN 4
    WHEN 'Ginger' THEN 2
    WHEN 'Bell Pepper' THEN 1
    WHEN 'Rice' THEN 2
    WHEN 'Lemon' THEN 1
  END,
  CASE i.name
    WHEN 'Chicken Breast' THEN 'lb'
    WHEN 'Coconut Milk' THEN 'can'
    WHEN 'Onion' THEN 'medium'
    WHEN 'Garlic' THEN 'cloves'
    WHEN 'Ginger' THEN 'inches'
    WHEN 'Bell Pepper' THEN 'large'
    WHEN 'Rice' THEN 'cups'
    WHEN 'Lemon' THEN ''
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
