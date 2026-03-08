-- Recipe: Thai Basil Chicken Stir-Fry (Pad Krapow Gai)
-- Cuisine: Thai | Category: Dinner | Difficulty: Medium
-- Generated: 2026-03-07-23

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Chicken Breast', 'Garlic', 'Thai Basil', 'Bell Pepper', 'Onion', 'Fish Sauce', 'Soy Sauce', 'Oyster Sauce', 'Sugar', 'Jalapeño', 'Egg')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Thai Basil Chicken Stir-Fry',
    'A fiery Thai street food classic featuring ground chicken stir-fried with aromatic Thai basil, crisp vegetables, and a savory-sweet sauce. Served with a fried egg on top.',
    '[]'::jsonb,
    ARRAY[
      'Mince the chicken breast finely or use ground chicken',
      'Mince garlic and slice the jalapeños (adjust for heat preference)',
      'Slice bell pepper and onion into bite-sized pieces',
      'Heat oil in a wok over high heat until smoking',
      'Add garlic and jalapeños, stir-fry for 30 seconds until fragrant',
      'Add chicken, breaking it apart as it cooks',
      'Stir-fry for 3-4 minutes until chicken is cooked through',
      'Add oyster sauce, fish sauce, soy sauce, and sugar. Mix well',
      'Add bell pepper and onion, stir-fry for 2 minutes',
      'Remove from heat and fold in fresh Thai basil leaves',
      'Fry eggs in a separate pan sunny-side up',
      'Serve chicken over jasmine rice, top with fried egg',
      'Garnish with extra basil and sliced chilies if desired'
    ],
    'dinner',
    ARRAY['Thai', 'Asian'],
    ARRAY[]::text[],
    'Medium',
    15, 15, 2, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE i.name
    WHEN 'Chicken Breast' THEN '1 lb'
    WHEN 'Garlic' THEN '6 cloves'
    WHEN 'Thai Basil' THEN '1 cup'
    WHEN 'Bell Pepper' THEN '1 medium'
    WHEN 'Onion' THEN '1 small'
    WHEN 'Fish Sauce' THEN '2 tbsp'
    WHEN 'Soy Sauce' THEN '1 tbsp'
    WHEN 'Oyster Sauce' THEN '2 tbsp'
    WHEN 'Sugar' THEN '1 tsp'
    WHEN 'Jalapeño' THEN '3-4'
    WHEN 'Egg' THEN '2'
  END,
  CASE i.name
    WHEN 'Chicken Breast' THEN 1
    WHEN 'Garlic' THEN 6
    WHEN 'Thai Basil' THEN 1
    WHEN 'Bell Pepper' THEN 1
    WHEN 'Onion' THEN 1
    WHEN 'Fish Sauce' THEN 2
    WHEN 'Soy Sauce' THEN 1
    WHEN 'Oyster Sauce' THEN 2
    WHEN 'Sugar' THEN 1
    WHEN 'Jalapeño' THEN 4
    WHEN 'Egg' THEN 2
  END,
  CASE i.name
    WHEN 'Chicken Breast' THEN 'lb'
    WHEN 'Garlic' THEN 'cloves'
    WHEN 'Thai Basil' THEN 'cups'
    WHEN 'Bell Pepper' THEN 'medium'
    WHEN 'Onion' THEN 'small'
    WHEN 'Fish Sauce' THEN 'tbsp'
    WHEN 'Soy Sauce' THEN 'tbsp'
    WHEN 'Oyster Sauce' THEN 'tbsp'
    WHEN 'Sugar' THEN 'tsp'
    WHEN 'Jalapeño' THEN 'pieces'
    WHEN 'Egg' THEN 'large'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
