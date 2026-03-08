-- Recipe: Thai Green Curry Chicken
-- Cuisine: Thai (Asian)
-- Category: Dinner
-- Difficulty: Medium

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN (
    'Chicken Breast', 'Coconut Milk', 'Bell Pepper', 'Bamboo Shoots', 
    'Thai Basil', 'Fish Sauce', 'Palm Sugar', 'Green Curry Paste',
    'Eggplant', 'Jasmine Rice', 'Lime', 'Garlic', 'Onion', 'Olive Oil'
  )
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Thai Green Curry Chicken',
    'A fragrant and creamy Thai curry with tender chicken, colorful vegetables, and aromatic basil in a spiced coconut milk base. Perfect comfort food with a kick.',
    '[]'::jsonb,
    ARRAY[
      'Heat 2 tablespoons oil in a large wok or pan over medium-high heat',
      'Add 3 tablespoons green curry paste and fry for 1 minute until fragrant',
      'Add 400ml coconut milk and stir well to combine',
      'Add 500g sliced chicken breast and simmer for 10 minutes',
      'Add sliced eggplant, bell pepper, bamboo shoots, and onions',
      'Season with 2 tablespoons fish sauce and 1 tablespoon palm sugar',
      'Simmer for another 8-10 minutes until vegetables are tender',
      'Remove from heat and stir in Thai basil leaves',
      'Serve hot over steamed jasmine rice with lime wedges'
    ],
    'dinner',
    ARRAY['Thai', 'Asian'],
    ARRAY[]::text[],
    'Medium',
    15, 25, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN '500g'
    WHEN i.name = 'Coconut Milk' THEN '400ml'
    WHEN i.name = 'Green Curry Paste' THEN '3 tbsp'
    WHEN i.name = 'Bell Pepper' THEN '1 medium'
    WHEN i.name = 'Eggplant' THEN '1 small'
    WHEN i.name = 'Bamboo Shoots' THEN '1 cup'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Garlic' THEN '3 cloves'
    WHEN i.name = 'Fish Sauce' THEN '2 tbsp'
    WHEN i.name = 'Palm Sugar' THEN '1 tbsp'
    WHEN i.name = 'Thai Basil' THEN '1 cup'
    WHEN i.name = 'Lime' THEN '1 whole'
    WHEN i.name = 'Jasmine Rice' THEN '2 cups'
    WHEN i.name = 'Olive Oil' THEN '2 tbsp'
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 500
    WHEN i.name = 'Coconut Milk' THEN 400
    WHEN i.name = 'Green Curry Paste' THEN 3
    WHEN i.name = 'Bell Pepper' THEN 1
    WHEN i.name = 'Eggplant' THEN 1
    WHEN i.name = 'Bamboo Shoots' THEN 1
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garlic' THEN 3
    WHEN i.name = 'Fish Sauce' THEN 2
    WHEN i.name = 'Palm Sugar' THEN 1
    WHEN i.name = 'Thai Basil' THEN 1
    WHEN i.name = 'Lime' THEN 1
    WHEN i.name = 'Jasmine Rice' THEN 2
    WHEN i.name = 'Olive Oil' THEN 2
  END,
  CASE 
    WHEN i.name IN ('Chicken Breast', 'Bamboo Shoots', 'Thai Basil', 'Jasmine Rice') THEN 'g'
    WHEN i.name IN ('Coconut Milk') THEN 'ml'
    WHEN i.name IN ('Green Curry Paste', 'Fish Sauce', 'Olive Oil') THEN 'tbsp'
    WHEN i.name IN ('Palm Sugar') THEN 'tbsp'
    WHEN i.name IN ('Bell Pepper', 'Eggplant', 'Onion', 'Lime') THEN 'medium'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Thai Basil' THEN 'cups'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
