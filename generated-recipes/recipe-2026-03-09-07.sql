-- Recipe: Korean Glass Noodle Stir-Fry (Japchae)
-- Generated: 2026-03-09 07:00

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Beef', 'Spinach', 'Carrot', 'Onion', 'Garlic', 'Sesame Oil', 'Soy Sauce', 'Sugar', 'Gochujang', 'Mushroom', 'Egg')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Korean Glass Noodle Stir-Fry (Japchae)',
    'A classic Korean dish featuring silky sweet potato glass noodles tossed with marinated beef, colorful vegetables, and a savory-sweet sauce. Perfect for family dinners or gatherings.',
    '[]'::jsonb,
    ARRAY[
      'Soak glass noodles in warm water for 30 minutes until soft, then drain and cut into manageable lengths.',
      'Slice beef thinly against the grain and marinate in 1 tbsp soy sauce, 1 tsp sesame oil, and minced garlic for 15 minutes.',
      'Blanch spinach in boiling water for 30 seconds, drain and squeeze dry, then chop roughly.',
      'Julienne carrots and slice mushrooms. caramelize onion in a hot wok until golden.',
      'Beat eggs and scramble in the wok over high heat, breaking into small pieces. Set aside.',
      'Stir-fry marinated beef in the wok until browned, about 3-4 minutes. Remove and set aside.',
      'Add carrots and mushrooms to the wok, stir-fry for 2 minutes until slightly softened.',
      'Return beef to the wok, add drained noodles, and pour over the sauce (soy sauce, sesame oil, sugar, gochujang).',
      'Toss everything together over high heat for 3-4 minutes until noodles are heated through and coated in sauce.',
      'Add spinach, scrambled eggs, and green onions. Toss to combine and serve hot.'
    ],
    'dinner',
    ARRAY['Korean', 'Asian'],
    ARRAY[]::text[],
    'Medium',
    30, 20, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Beef' THEN '200g'
    WHEN i.name = 'Spinach' THEN '150g'
    WHEN i.name = 'Carrot' THEN '1 medium'
    WHEN i.name = 'Onion' THEN '1 small'
    WHEN i.name = 'Garlic' THEN '3 cloves'
    WHEN i.name = 'Sesame Oil' THEN '2 tbsp'
    WHEN i.name = 'Soy Sauce' THEN '3 tbsp'
    WHEN i.name = 'Sugar' THEN '1 tbsp'
    WHEN i.name = 'Gochujang' THEN '1 tbsp'
    WHEN i.name = 'Mushroom' THEN '100g'
    WHEN i.name = 'Egg' THEN '2 large'
  END,
  CASE 
    WHEN i.name = 'Beef' THEN 200
    WHEN i.name = 'Spinach' THEN 150
    WHEN i.name = 'Carrot' THEN 1
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garlic' THEN 3
    WHEN i.name = 'Sesame Oil' THEN 2
    WHEN i.name = 'Soy Sauce' THEN 3
    WHEN i.name = 'Sugar' THEN 1
    WHEN i.name = 'Gochujang' THEN 1
    WHEN i.name = 'Mushroom' THEN 100
    WHEN i.name = 'Egg' THEN 2
  END,
  CASE 
    WHEN i.name IN ('Beef', 'Spinach', 'Mushroom') THEN 'grams'
    WHEN i.name IN ('Carrot', 'Onion', 'Egg') THEN 'pieces'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name IN ('Sesame Oil', 'Soy Sauce', 'Sugar', 'Gochujang') THEN 'tbsp'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
