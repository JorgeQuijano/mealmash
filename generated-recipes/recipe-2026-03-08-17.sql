-- Butter Chicken Nawiches
-- A fusion dish combining creamy butter chicken flavors with crispy naan "sandwiches"

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Chicken Breast', 'Butter', 'Heavy Cream', 'Tomato', 'Garlic', 'Ginger', 'Onion', 'Garam Masala', 'Turmeric', 'Cumin', 'Cilantro', 'Naan')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Butter Chicken Nawiches',
    'Crispy naan bread filled with tender spiced chicken in a rich, creamy tomato sauce. A delicious fusion of Indian flavors in sandwich form.',
    '[]'::jsonb,
    ARRAY[
      'Season chicken breast with garam masala, turmeric, and cumin',
      'Grill or pan-fry chicken until cooked through, then slice thinly',
      'Sauté onion, garlic, and ginger until fragrant',
      'Add tomatoes and simmer until softened',
      'Stir in butter and heavy cream to create the sauce',
      'Add sliced chicken to the sauce and simmer for 5 minutes',
      'Warm naan bread on a skillet until crispy on outside',
      'Assemble: naan, butter chicken filling, fresh cilantro, naan',
      'Serve immediately with extra sauce on the side'
    ],
    'dinner',
    ARRAY['Indian', 'Fusion'],
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
    WHEN i.name = 'Chicken Breast' THEN '1 lb'
    WHEN i.name = 'Butter' THEN '3 tbsp'
    WHEN i.name = 'Heavy Cream' THEN '1/2 cup'
    WHEN i.name = 'Tomato' THEN '2 medium'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Ginger' THEN '1 inch piece'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Garam Masala' THEN '2 tsp'
    WHEN i.name = 'Turmeric' THEN '1/2 tsp'
    WHEN i.name = 'Cumin' THEN '1 tsp'
    WHEN i.name = 'Cilantro' THEN '1/4 cup'
    WHEN i.name = 'Naan' THEN '4 pieces'
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 1
    WHEN i.name = 'Butter' THEN 3
    WHEN i.name = 'Heavy Cream' THEN 4
    WHEN i.name = 'Tomato' THEN 2
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garam Masala' THEN 2
    WHEN i.name = 'Turmeric' THEN 1
    WHEN i.name = 'Cumin' THEN 1
    WHEN i.name = 'Cilantro' THEN 1
    WHEN i.name = 'Naan' THEN 4
  END,
  CASE 
    WHEN i.name IN ('Chicken Breast', 'Butter', 'Heavy Cream') THEN 'tbsp'
    WHEN i.name IN ('Tomato', 'Onion', 'Naan', 'Cilantro') THEN 'pieces'
    WHEN i.name IN ('Garlic', 'Ginger') THEN 'cloves'
    WHEN i.name IN ('Garam Masala', 'Turmeric', 'Cumin') THEN 'tsp'
    WHEN i.name = 'Heavy Cream' THEN 'cup'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
