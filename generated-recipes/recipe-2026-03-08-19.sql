-- Recipe: Teriyaki Salmon Bowls with Ginger Vegetables
-- Cuisine: Japanese | Category: Dinner | Difficulty: Medium
-- Generated: 2026-03-08-19

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Salmon', 'Soy Sauce', 'Honey', 'Ginger', 'Garlic', 'Sesame Oil', 'Carrot', 'Broccoli', 'Onion', 'Rice', 'Sesame Seed', 'Vegetable Stock')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Teriyaki Salmon Bowls with Ginger Vegetables',
    'Pan-seared salmon glazed with a sweet soy-honey teriyaki sauce, served over fluffy rice with ginger-garlic sautéed vegetables. A comforting Japanese-inspired bowl that brings restaurant flavors home.',
    '[]'::jsonb,
    ARRAY[
      'Cook rice according to package instructions and keep warm.',
      'Mix soy sauce, honey, and a splash of sesame oil in a small bowl for the teriyaki glaze.',
      'Pat salmon fillets dry and season with salt and pepper.',
      'Heat oil in a large skillet over medium-high heat. Sear salmon skin-side up for 4 minutes until golden.',
      'Flip salmon and cook for another 3 minutes. Pour teriyaki glaze over the fish and let it caramelize.',
      'In another pan, sauté minced ginger and garlic in sesame oil for 30 seconds.',
      'Add sliced carrots and broccoli florets to the ginger-garlic pan. Stir-fry for 5 minutes.',
      'Add a splash of vegetable stock and cover to steam vegetables until tender-crisp.',
      'Assemble bowls: divide rice between bowls, top with glazed salmon and gingered vegetables.',
      'Drizzle remaining teriyaki glaze from the pan over the bowls.',
      'Garnish with toasted sesame seeds and serve immediately.'
    ],
    'dinner',
    ARRAY['Japanese'],
    ARRAY[]::text[],
    'Medium',
    15, 25, 2, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Salmon' THEN '2 fillets'
    WHEN i.name = 'Soy Sauce' THEN '3 tbsp'
    WHEN i.name = 'Honey' THEN '2 tbsp'
    WHEN i.name = 'Ginger' THEN '1 tbsp'
    WHEN i.name = 'Garlic' THEN '2 cloves'
    WHEN i.name = 'Sesame Oil' THEN '2 tbsp'
    WHEN i.name = 'Carrot' THEN '1 medium'
    WHEN i.name = 'Broccoli' THEN '1 cup'
    WHEN i.name = 'Onion' THEN '1/2 medium'
    WHEN i.name = 'Rice' THEN '1 cup'
    WHEN i.name = 'Sesame Seed' THEN '1 tbsp'
    WHEN i.name = 'Vegetable Stock' THEN '1/4 cup'
  END,
  CASE 
    WHEN i.name = 'Salmon' THEN 2
    WHEN i.name = 'Soy Sauce' THEN 3
    WHEN i.name = 'Honey' THEN 2
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Garlic' THEN 2
    WHEN i.name = 'Sesame Oil' THEN 2
    WHEN i.name = 'Carrot' THEN 1
    WHEN i.name = 'Broccoli' THEN 1
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Rice' THEN 1
    WHEN i.name = 'Sesame Seed' THEN 1
    WHEN i.name = 'Vegetable Stock' THEN 1
  END,
  CASE 
    WHEN i.name IN ('Salmon', 'Rice') THEN 'fillets'
    WHEN i.name IN ('Soy Sauce', 'Honey', 'Sesame Oil', 'Vegetable Stock') THEN 'tbsp'
    WHEN i.name IN ('Ginger', 'Carrot', 'Broccoli', 'Onion') THEN 'medium'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Sesame Seed' THEN 'tbsp'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
