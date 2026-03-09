-- Recipe: Miso Glazed Salmon with Pickled Vegetables
-- Cuisine: Japanese | Category: Lunch | Difficulty: Medium

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Salmon', 'Miso', 'Soy Sauce', 'Rice', 'Ginger', 'Garlic', 'Cucumber', 'Carrot', 'Sesame Oil', 'Sesame Seeds', 'Green Onion')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Miso Glazed Salmon with Pickled Vegetables',
    'Tender salmon fillets glazed with sweet white miso, served over steamed rice with quick-pickled cucumber and carrot ribbons. A balanced Japanese bento-style lunch with umami-rich flavors and contrasting textures.',
    '[]'::jsonb,
    ARRAY[
      'Mix white miso, soy sauce, mirin, and sesame oil to create the glaze',
      'Pat salmon dry and coat generously with the miso glaze. Let marinate for 15 minutes.',
      'Quick pickle thin cucumber and carrot ribbons in rice vinegar and salt for 10 minutes.',
      'Sear salmon skin-side down in a hot pan for 3 minutes, flip and cook 2 more minutes.',
      'Spoon glaze over salmon and caramelize with a blow torch or under broiler for 30 seconds.',
      'Serve salmon over steamed rice, topped with pickled vegetables, sesame seeds, and sliced green onion.'
    ],
    'lunch',
    ARRAY['Japanese', 'Asian'],
    ARRAY[]::text[],
    'Medium',
    25, 10, 2, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE i.name
    WHEN 'Salmon' THEN '2 fillets'
    WHEN 'Miso' THEN '3 tbsp'
    WHEN 'Soy Sauce' THEN '2 tbsp'
    WHEN 'Rice' THEN '1.5 cups'
    WHEN 'Ginger' THEN '1 tbsp'
    WHEN 'Garlic' THEN '2 cloves'
    WHEN 'Cucumber' THEN '1 medium'
    WHEN 'Carrot' THEN '1 large'
    WHEN 'Sesame Oil' THEN '1 tbsp'
    WHEN 'Sesame Seeds' THEN '1 tbsp'
    WHEN 'Green Onion' THEN '2 stalks'
  END,
  CASE i.name
    WHEN 'Salmon' THEN 2
    WHEN 'Miso' THEN 3
    WHEN 'Soy Sauce' THEN 2
    WHEN 'Rice' THEN 1
    WHEN 'Ginger' THEN 1
    WHEN 'Garlic' THEN 2
    WHEN 'Cucumber' THEN 1
    WHEN 'Carrot' THEN 1
    WHEN 'Sesame Oil' THEN 1
    WHEN 'Sesame Seeds' THEN 1
    WHEN 'Green Onion' THEN 2
  END,
  CASE i.name
    WHEN 'Salmon' THEN 'fillets'
    WHEN 'Miso' THEN 'tbsp'
    WHEN 'Soy Sauce' THEN 'tbsp'
    WHEN 'Rice' THEN 'cups'
    WHEN 'Ginger' THEN 'tbsp'
    WHEN 'Garlic' THEN 'cloves'
    WHEN 'Cucumber' THEN 'medium'
    WHEN 'Carrot' THEN 'large'
    WHEN 'Sesame Oil' THEN 'tbsp'
    WHEN 'Sesame Seeds' THEN 'tbsp'
    WHEN 'Green Onion' THEN 'stalks'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
