-- Korean BBQ Chicken Bowl
-- A fusion bowl combining Korean flavors with American-style BBQ chicken

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN (
    'Chicken Breast', 'Soy Sauce', 'Garlic', 'Ginger', 'Sesame Oil', 
    'Rice', 'Brown Sugar', 'Onion', 'Carrot', 'Lettuce', 'Egg', 
    'Sesame Seed', 'Vegetable Oil', 'Honey'
  )
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Korean BBQ Chicken Bowl',
    'Tender chicken thighs glazed in a sweet and savory Korean-inspired BBQ sauce, served over fluffy rice with fresh vegetables and a fried egg.',
    '[]'::jsonb,
    ARRAY[
      'Mix soy sauce, brown sugar, honey, minced garlic, ginger, and sesame oil in a bowl to make the marinade.',
      'Cut chicken thighs into bite-sized pieces and marinate for at least 30 minutes.',
      'Heat vegetable oil in a large skillet over medium-high heat.',
      'Cook marinated chicken until caramelized and cooked through, about 8-10 minutes.',
      'While chicken cooks, prepare rice according to package instructions.',
      'Slice carrots thinly and shred lettuce for the base.',
      'Fry eggs sunny-side up in the same pan.',
      'Assemble bowls: rice base, topped with lettuce, carrots, Korean BBQ chicken, and a fried egg.',
      'Garnish with sesame seeds and sliced green onions if desired.'
    ],
    'dinner',
    ARRAY['Korean', 'Asian'],
    ARRAY[]::text[],
    'Medium',
    20, 25, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN '1.5 lbs'
    WHEN i.name = 'Soy Sauce' THEN '1/4 cup'
    WHEN i.name = 'Brown Sugar' THEN '3 tbsp'
    WHEN i.name = 'Honey' THEN '2 tbsp'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Ginger' THEN '1 tbsp'
    WHEN i.name = 'Sesame Oil' THEN '1 tbsp'
    WHEN i.name = 'Vegetable Oil' THEN '2 tbsp'
    WHEN i.name = 'Rice' THEN '2 cups'
    WHEN i.name = 'Lettuce' THEN '2 cups'
    WHEN i.name = 'Carrot' THEN '1 medium'
    WHEN i.name = 'Egg' THEN '4'
    WHEN i.name = 'Sesame Seed' THEN '1 tbsp'
    ELSE '1'
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 1
    WHEN i.name = 'Soy Sauce' THEN 4
    WHEN i.name = 'Brown Sugar' THEN 3
    WHEN i.name = 'Honey' THEN 2
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Sesame Oil' THEN 1
    WHEN i.name = 'Vegetable Oil' THEN 2
    WHEN i.name = 'Rice' THEN 2
    WHEN i.name = 'Lettuce' THEN 2
    WHEN i.name = 'Carrot' THEN 1
    WHEN i.name = 'Egg' THEN 4
    WHEN i.name = 'Sesame Seed' THEN 1
    ELSE 1
  END,
  CASE 
    WHEN i.name IN ('Chicken Breast', 'Rice', 'Lettuce', 'Carrot') THEN 'cups'
    WHEN i.name IN ('Soy Sauce', 'Sesame Oil', 'Vegetable Oil') THEN 'tbsp'
    WHEN i.name IN ('Brown Sugar', 'Honey', 'Ginger', 'Sesame Seed') THEN 'tbsp'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Egg' THEN 'pieces'
    ELSE 'unit'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
