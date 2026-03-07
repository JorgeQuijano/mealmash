-- Recipe: Thai Coconut Salmon Curry
-- Generated: 2026-03-07

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Salmon', 'Coconut Milk', 'Spinach', 'Onion', 'Garlic', 'Ginger', 'Fish Sauce', 'Lime', 'Cilantro', 'Jasmine Rice', 'Red Pepper Flake', 'Curry Powder')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Thai Coconut Salmon Curry',
    'A rich and aromatic Thai-inspired curry featuring tender salmon fillets swimming in a creamy coconut milk broth infused with lemongrass, ginger, and red curry flavors. Fresh spinach adds nutrition and silkiness to the sauce.',
    '[]'::jsonb,
    ARRAY[
      'Heat 2 tablespoons of oil in a large skillet over medium-high heat',
      'Add diced onion and sauté until translucent, about 5 minutes',
      'Add minced garlic and ginger, cook for 1 minute until fragrant',
      'Stir in curry powder and red pepper flakes, toast for 30 seconds',
      'Pour in coconut milk and bring to a gentle simmer',
      'Add fish sauce and adjust seasoning to taste',
      'Gently place salmon fillets in the curry, skin-side up',
      'Simmer for 8-10 minutes until salmon is almost cooked through',
      'Add fresh spinach and stir until wilted',
      'Squeeze lime juice over the curry and garnish with fresh cilantro',
      'Serve immediately over steamed jasmine rice'
    ],
    'dinner',
    '{"Thai","Asian"}',
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
    WHEN i.name = 'Salmon' THEN '4 fillets'
    WHEN i.name = 'Coconut Milk' THEN '2 cans'
    WHEN i.name = 'Spinach' THEN '3 cups'
    WHEN i.name = 'Onion' THEN '1 large'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Ginger' THEN '1 inch'
    WHEN i.name = 'Fish Sauce' THEN '2 tablespoons'
    WHEN i.name = 'Lime' THEN '1 whole'
    WHEN i.name = 'Cilantro' THEN '1/4 cup'
    WHEN i.name = 'Jasmine Rice' THEN '2 cups'
    WHEN i.name = 'Red Pepper Flake' THEN '1/2 teaspoon'
    WHEN i.name = 'Curry Powder' THEN '2 tablespoons'
  END,
  CASE 
    WHEN i.name = 'Salmon' THEN 4
    WHEN i.name = 'Coconut Milk' THEN 2
    WHEN i.name = 'Spinach' THEN 3
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Fish Sauce' THEN 2
    WHEN i.name = 'Lime' THEN 1
    WHEN i.name = 'Cilantro' THEN 1
    WHEN i.name = 'Jasmine Rice' THEN 2
    WHEN i.name = 'Red Pepper Flake' THEN 1
    WHEN i.name = 'Curry Powder' THEN 2
  END,
  CASE 
    WHEN i.name IN ('Salmon', 'Spinach', 'Onion', 'Garlic', 'Ginger', 'Cilantro') THEN 'whole'
    WHEN i.name = 'Coconut Milk' THEN 'cans'
    WHEN i.name = 'Fish Sauce' THEN 'tablespoons'
    WHEN i.name = 'Lime' THEN 'whole'
    WHEN i.name = 'Jasmine Rice' THEN 'cups'
    WHEN i.name IN ('Red Pepper Flake', 'Curry Powder') THEN 'tablespoons'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
