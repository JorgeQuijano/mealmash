-- Thai Coconut Curry Soup with Shrimp and Lemongrass (Tom Kha Gai Inspired)
-- Difficulty: Medium | Cuisine: Thai | Category: Dinner

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Coconut Milk', 'Shrimp', 'Lemongrass', 'Ginger', 'Fish Sauce', 
                 'Red Curry Paste', 'Thai Basil', 'Galangal', 'Kaffir Lime Leaf', 
                 'Lime', 'Chicken Stock', 'Garlic', 'Brown Sugar', 'Onion', 'Chicken Breast')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Thai Coconut Curry Soup',
    'A rich and aromatic Tom Kha Gai-inspired soup featuring tender shrimp, creamy coconut milk, and fragrant lemongrass. This comforting bowl balances spicy, sweet, sour, and savory notes with fresh Thai basil and kaffir lime leaves for an authentic taste of Thailand.',
    '[]'::jsonb,
    ARRAY[
      'Bruise the lemongrass stalks with the back of a knife and slice into 2-inch pieces',
      'Slice the galangal into thin rounds and tear the kaffir lime leaves',
      'In a large pot, heat 2 tablespoons of coconut cream over medium heat until oil separates',
      'Add the red curry paste and fry for 1-2 minutes until fragrant',
      'Add the garlic, ginger, lemongrass, galangal, and kaffir lime leaves, stir for 30 seconds',
      'Pour in the chicken stock and remaining coconut milk, bring to a gentle simmer',
      'Add the sliced chicken breast and cook for 8-10 minutes until cooked through',
      'Add the shrimp and cook for 3-4 minutes until pink and curled',
      'Stir in the fish sauce and brown sugar, taste and adjust seasoning',
      'Remove from heat, squeeze in fresh lime juice',
      'Serve garnished with fresh Thai basil, sliced scallions, and sliced chili rings'
    ],
    'dinner',
    ARRAY['Thai'],
    ARRAY[]::text[],
    'Medium',
    15, 25, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT ri.id, i.id, 
  CASE 
    WHEN i.name = 'Coconut Milk' THEN '4 cups'
    WHEN i.name = 'Shrimp' THEN '1 lb'
    WHEN i.name = 'Lemongrass' THEN '3 stalks'
    WHEN i.name = 'Ginger' THEN '2 inches'
    WHEN i.name = 'Fish Sauce' THEN '3 tbsp'
    WHEN i.name = 'Red Curry Paste' THEN '3 tbsp'
    WHEN i.name = 'Thai Basil' THEN '1 cup'
    WHEN i.name = 'Galangal' THEN '1 inch'
    WHEN i.name = 'Kaffir Lime Leaf' THEN '4 leaves'
    WHEN i.name = 'Lime' THEN '2 whole'
    WHEN i.name = 'Chicken Stock' THEN '2 cups'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Brown Sugar' THEN '1 tbsp'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Chicken Breast' THEN '1 lb'
  END,
  CASE 
    WHEN i.name = 'Coconut Milk' THEN 4
    WHEN i.name = 'Shrimp' THEN 1
    WHEN i.name = 'Lemongrass' THEN 3
    WHEN i.name = 'Ginger' THEN 2
    WHEN i.name = 'Fish Sauce' THEN 3
    WHEN i.name = 'Red Curry Paste' THEN 3
    WHEN i.name = 'Thai Basil' THEN 1
    WHEN i.name = 'Galangal' THEN 1
    WHEN i.name = 'Kaffir Lime Leaf' THEN 4
    WHEN i.name = 'Lime' THEN 2
    WHEN i.name = 'Chicken Stock' THEN 2
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Brown Sugar' THEN 1
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Chicken Breast' THEN 1
  END,
  CASE 
    WHEN i.name IN ('Coconut Milk', 'Chicken Stock') THEN 'cups'
    WHEN i.name IN ('Shrimp', 'Chicken Breast') THEN 'lb'
    WHEN i.name = 'Lemongrass' THEN 'stalks'
    WHEN i.name IN ('Ginger', 'Galangal') THEN 'inches'
    WHEN i.name = 'Fish Sauce' THEN 'tbsp'
    WHEN i.name = 'Red Curry Paste' THEN 'tbsp'
    WHEN i.name = 'Thai Basil' THEN 'cups'
    WHEN i.name = 'Kaffir Lime Leaf' THEN 'leaves'
    WHEN i.name = 'Lime' THEN 'whole'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Brown Sugar' THEN 'tbsp'
    WHEN i.name = 'Onion' THEN 'medium'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
