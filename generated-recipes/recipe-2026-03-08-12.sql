-- Recipe: Thai Coconut Lime Chicken Soup
-- Cuisine: Thai | Category: Dinner | Difficulty: Easy
-- Generated: 2026-03-08-12

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Chicken Breast', 'Coconut Milk', 'Chicken Stock', 'Mushroom', 'Onion', 
                 'Garlic', 'Ginger', 'Fish Sauce', 'Lime', 'Cilantro', 'Red Pepper Flake', 
                 'Salt', 'Soy Sauce', 'Sesame Oil')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Thai Coconut Lime Chicken Soup',
    'A fragrant and creamy Tom Kha-inspired soup with tender chicken, earthy mushrooms, and bright lime notes. Comforting and aromatic with just the right balance of heat.',
    '[]'::jsonb,
    ARRAY[
      'Slice chicken breast into thin strips and set aside.',
      'In a large pot, bring coconut milk and chicken stock to a gentle simmer over medium heat.',
      'Add sliced onion, minced garlic, and grated ginger. Simmer for 8 minutes to infuse flavors.',
      'Add sliced mushrooms and cook for 3-4 minutes until tender.',
      'Add chicken strips and cook for 5-7 minutes until cooked through.',
      'Stir in fish sauce, a splash of soy sauce, sesame oil, and lime juice.',
      'Add a pinch of red pepper flakes for heat, adjusting to taste.',
      'Taste and adjust seasoning with salt as needed.',
      'Serve hot, garnished with fresh cilantro and extra lime wedges.'
    ],
    'dinner',
    ARRAY['Thai', 'Asian'],
    ARRAY[]::text[],
    'Easy',
    15, 20, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT ri.id, i.id, 
  CASE 
    WHEN i.name = 'Chicken Breast' THEN '1 lb'
    WHEN i.name = 'Coconut Milk' THEN '2 cans (13.5 oz each)'
    WHEN i.name = 'Chicken Stock' THEN '2 cups'
    WHEN i.name = 'Mushroom' THEN '8 oz'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Ginger' THEN '1 inch'
    WHEN i.name = 'Fish Sauce' THEN '3 tbsp'
    WHEN i.name = 'Lime' THEN '2'
    WHEN i.name = 'Cilantro' THEN '1/4 cup'
    WHEN i.name = 'Red Pepper Flake' THEN '1/2 tsp'
    WHEN i.name = 'Salt' THEN 'to taste'
    WHEN i.name = 'Soy Sauce' THEN '1 tbsp'
    WHEN i.name = 'Sesame Oil' THEN '1 tsp'
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 16
    WHEN i.name = 'Coconut Milk' THEN 2
    WHEN i.name = 'Chicken Stock' THEN 2
    WHEN i.name = 'Mushroom' THEN 8
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Fish Sauce' THEN 3
    WHEN i.name = 'Lime' THEN 2
    WHEN i.name = 'Cilantro' THEN 4
    WHEN i.name = 'Red Pepper Flake' THEN 1
    WHEN i.name = 'Salt' THEN 1
    WHEN i.name = 'Soy Sauce' THEN 1
    WHEN i.name = 'Sesame Oil' THEN 1
  END,
  CASE 
    WHEN i.name IN ('Chicken Breast', 'Coconut Milk', 'Chicken Stock', 'Mushroom') THEN 'oz'
    WHEN i.name IN ('Fish Sauce', 'Soy Sauce', 'Red Pepper Flake') THEN 'tbsp'
    WHEN i.name = 'Sesame Oil' THEN 'tsp'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Ginger' THEN 'inch'
    WHEN i.name = 'Lime' THEN 'whole'
    WHEN i.name = 'Cilantro' THEN 'cups'
    WHEN i.name = 'Salt' THEN 'to taste'
    ELSE 'cups'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
