-- Recipe: Thai Coconut Lime Soup
-- Generated: 2026-03-08 10:02

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Chicken Breast', 'Coconut', 'Lime', 'Lemongrass', 'Ginger', 'Garlic', 'Onion', 'MSpinach', 'ushroom', 'Fish Sauce', 'Cilantro')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Thai Coconut Lime Soup',
    'A bright, aromatic Thai-inspired soup featuring tender chicken in a creamy coconut broth infused with fresh lemongrass, lime, and ginger. Loaded with vegetables and finished with fresh cilantro for a light yet satisfying lunch.',
    '[]'::jsonb,
    ARRAY['Mince the lemongrass, ginger, and garlic into a fine paste', 'In a large pot, heat oil over medium heat and sauté onion until translucent', 'Add the lemongrass-ginger-garlic paste and cook for 1 minute until fragrant', 'Pour in the coconut milk and bring to a gentle simmer', 'Add sliced chicken breast and cook for 8-10 minutes until cooked through', 'Add sliced mushrooms and cook for 3 minutes', 'Stir in fish sauce and lime juice to taste', 'Fold in fresh spinach and remove from heat', 'Serve hot, garnished with fresh cilantro and extra lime wedges'],
    'lunch',
    ARRAY['Thai'],
    ARRAY[]::text[],
    'Easy',
    15, 20, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN '1 lb'
    WHEN i.name = 'Coconut' THEN '2 cans'
    WHEN i.name = 'Lime' THEN '2 limes'
    WHEN i.name = 'Lemongrass' THEN '2 stalks'
    WHEN i.name = 'Ginger' THEN '1 inch'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Mushroom' THEN '8 oz'
    WHEN i.name = 'Spinach' THEN '2 cups'
    WHEN i.name = 'Fish Sauce' THEN '2 tbsp'
    WHEN i.name = 'Cilantro' THEN '1/4 cup'
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 1
    WHEN i.name = 'Coconut' THEN 2
    WHEN i.name = 'Lime' THEN 2
    WHEN i.name = 'Lemongrass' THEN 2
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Mushroom' THEN 8
    WHEN i.name = 'Spinach' THEN 2
    WHEN i.name = 'Fish Sauce' THEN 2
    WHEN i.name = 'Cilantro' THEN 1
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 'lb'
    WHEN i.name = 'Coconut' THEN 'cans'
    WHEN i.name = 'Lime' THEN 'whole'
    WHEN i.name = 'Lemongrass' THEN 'stalks'
    WHEN i.name = 'Ginger' THEN 'inch'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Onion' THEN 'medium'
    WHEN i.name = 'Mushroom' THEN 'oz'
    WHEN i.name = 'Spinach' THEN 'cups'
    WHEN i.name = 'Fish Sauce' THEN 'tbsp'
    WHEN i.name = 'Cilantro' THEN 'cups'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
