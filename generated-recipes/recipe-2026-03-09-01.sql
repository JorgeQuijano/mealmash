-- Korean BBQ Beef Bowl (Bulgogi)
-- Cuisine: Korean
-- Category: Dinner
-- Difficulty: Medium

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN (
    'Beef',
    'Soy Sauce',
    'Sesame Oil',
    'Garlic',
    'Ginger',
    'Onion',
    'Brown Sugar',
    'Pear',
    'Vegetable Oil',
    'Rice',
    'Scallion',
    'Sesame Seed',
    'Cucumber'
  )
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Korean BBQ Beef Bowl',
    'Tender marinated beef with sweet and savory bulgogi sauce, served over steamed rice with fresh vegetables and pickled cucumber.',
    '[]'::jsonb,
    ARRAY[
      'Combine soy sauce, brown sugar, sesame oil, minced garlic, grated ginger, and pear puree in a bowl to make the marinade.',
      'Slice beef thinly against the grain and marinate for at least 30 minutes or overnight.',
      'Heat vegetable oil in a large skillet or wok over high heat.',
      'Cook marinated beef in batches for 2-3 minutes until caramelized and cooked through.',
      'Prepare cucumber pickles by slicing thin and tossing with rice vinegar and salt.',
      'Serve beef over steamed rice, topped with sliced scallions and sesame seeds.',
      'Serve with pickled cucumber on the side.'
    ],
    'dinner',
    ARRAY['Korean'],
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
    WHEN i.name = 'Ginger' THEN '1 inch'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Brown Sugar' THEN '3 tbsp'
    WHEN i.name = 'Pear' THEN '1/2 ripe'
    WHEN i.name = 'Vegetable Oil' THEN '2 tbsp'
    WHEN i.name = 'Rice' THEN '2 cups'
    WHEN i.name = 'Scallion' THEN '3 stalks'
    WHEN i.name = 'Sesame Seed' THEN '1 tbsp'
    WHEN i.name = 'Cucumber' THEN '1 medium'
  END,
  CASE 
    WHEN i.name = 'Beef' THEN 1
    WHEN i.name = 'Soy Sauce' THEN 0.25
    WHEN i.name = 'Sesame Oil' THEN 2
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Brown Sugar' THEN 3
    WHEN i.name = 'Pear' THEN 0.5
    WHEN i.name = 'Vegetable Oil' THEN 2
    WHEN i.name = 'Rice' THEN 2
    WHEN i.name = 'Scallion' THEN 3
    WHEN i.name = 'Sesame Seed' THEN 1
    WHEN i.name = 'Cucumber' THEN 1
  END,
  CASE 
    WHEN i.name = 'Beef' THEN 'lb'
    WHEN i.name = 'Soy Sauce' THEN 'cup'
    WHEN i.name = 'Sesame Oil' THEN 'tbsp'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Ginger' THEN 'inch'
    WHEN i.name = 'Onion' THEN 'medium'
    WHEN i.name = 'Brown Sugar' THEN 'tbsp'
    WHEN i.name = 'Pear' THEN 'ripe'
    WHEN i.name = 'Vegetable Oil' THEN 'tbsp'
    WHEN i.name = 'Rice' THEN 'cups'
    WHEN i.name = 'Scallion' THEN 'stalks'
    WHEN i.name = 'Sesame Seed' THEN 'tbsp'
    WHEN i.name = 'Cucumber' THEN 'medium'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
