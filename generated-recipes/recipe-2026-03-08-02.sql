-- Korean BBQ Beef Tacos - Fusion Korean-Mexican Dinner
-- Generated: 2026-03-08-02

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Beef', 'Soy Sauce', 'Sesame Oil', 'Garlic', 'Ginger', 'Brown Sugar', 'Tortilla', 'Cabbage', 'Carrot', 'Cilantro', 'Lime', 'Rice', 'Scallion', 'Sesame Seed', 'Vegetable Oil')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Korean BBQ Beef Tacos',
    'Tender marinated beef with Korean-inspired bulgogi flavors, served in warm tortillas with a crisp Asian slaw and fresh cilantro. A perfect fusion of Korean and Mexican cuisines.',
    '[]'::jsonb,
    ARRAY[
      'Combine soy sauce, sesame oil, minced garlic, grated ginger, and brown sugar to make the marinade.',
      'Slice beef thinly against the grain and marinate for at least 30 minutes or overnight.',
      'Make the slaw by tossing shredded cabbage and carrots with a splash of lime juice and sesame oil.',
      'Heat vegetable oil in a large skillet over high heat.',
      'Cook marinated beef in batches for 2-3 minutes until caramelized and cooked through.',
      'Warm tortillas in a dry skillet or over a gas flame.',
      'Assemble tacos: place beef on tortillas, top with slaw, fresh cilantro, and sliced scallions.',
      'Sprinkle with sesame seeds and serve with lime wedges.'
    ],
    'dinner',
    ARRAY['Korean', 'Mexican'],
    ARRAY[]::text[],
    'Medium',
    20, 15, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Beef' THEN '1 lb'
    WHEN i.name = 'Soy Sauce' THEN '1/4 cup'
    WHEN i.name = 'Sesame Oil' THEN '2 tbsp'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Ginger' THEN '1 tbsp'
    WHEN i.name = 'Brown Sugar' THEN '2 tbsp'
    WHEN i.name = 'Tortilla' THEN '8'
    WHEN i.name = 'Cabbage' THEN '2 cups'
    WHEN i.name = 'Carrot' THEN '1 cup'
    WHEN i.name = 'Cilantro' THEN '1/2 cup'
    WHEN i.name = 'Lime' THEN '2'
    WHEN i.name = 'Sesame Seed' THEN '1 tbsp'
    WHEN i.name = 'Vegetable Oil' THEN '2 tbsp'
    ELSE '1'
  END,
  CASE 
    WHEN i.name = 'Beef' THEN 1
    WHEN i.name = 'Soy Sauce' THEN 60
    WHEN i.name = 'Sesame Oil' THEN 30
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Brown Sugar' THEN 2
    WHEN i.name = 'Tortilla' THEN 8
    WHEN i.name = 'Cabbage' THEN 2
    WHEN i.name = 'Carrot' THEN 1
    WHEN i.name = 'Cilantro' THEN 1
    WHEN i.name = 'Lime' THEN 2
    WHEN i.name = 'Sesame Seed' THEN 1
    WHEN i.name = 'Vegetable Oil' THEN 2
    ELSE 1
  END,
  CASE 
    WHEN i.name IN ('Cabbage', 'Carrot', 'Cilantro') THEN 'cups'
    WHEN i.name IN ('Beef') THEN 'lb'
    WHEN i.name IN ('Tortilla') THEN 'pieces'
    WHEN i.name IN ('Lime') THEN 'pieces'
    WHEN i.name IN ('Garlic') THEN 'cloves'
    WHEN i.name IN ('Sesame Seed') THEN 'tbsp'
    ELSE 'tbsp'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
