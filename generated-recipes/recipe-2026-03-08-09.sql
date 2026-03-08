-- Recipe: Saffron Chicken Kofta Curry
-- Cuisine: Indian | Category: Dinner | Difficulty: Medium
-- Generated: 2026-03-08-09

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Chicken Breast', 'Yogurt', 'Heavy Cream', 'Butter', 'Tomato', 
                 'Onion', 'Garlic', 'Ginger', 'Cilantro', 'Lime', 'Cumin', 
                 'Curry Powder', 'Paprika', 'Salt', 'Black Pepper', 'Basmati Rice')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Saffron Chicken Kofta Curry',
    'Tender chicken kofta (meatballs) simmered in a rich, aromatic saffron-infused tomato-cream sauce with warm spices. A sophisticated twist on classic Indian comfort food.',
    '[]'::jsonb,
    ARRAY[
      'Mix ground chicken with yogurt, ginger, garlic, cumin, and cilantro. Form into small oval kofta and refrigerate for 20 minutes.',
      'Heat oil in a large pan and sear kofta until golden on all sides. Remove and set aside.',
      'In the same pan, sauté onions until caramelized. Add tomato paste and cook for 5 minutes.',
      'Add curry powder, paprika, and saffron-infused warm cream. Simmer for 10 minutes.',
      'Return kofta to the sauce and simmer for 15 minutes until cooked through.',
      'Finish with a drizzle of heavy cream and fresh cilantro.',
      'Serve hot over basmati rice with a squeeze of lime.'
    ],
    'dinner',
    ARRAY['Indian'],
    ARRAY[]::text[],
    'Medium',
    30, 35, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT ri.id, i.id, 
  CASE 
    WHEN i.name = 'Chicken Breast' THEN '1 lb'
    WHEN i.name = 'Yogurt' THEN '1/2 cup'
    WHEN i.name = 'Heavy Cream' THEN '1 cup'
    WHEN i.name = 'Butter' THEN '3 tbsp'
    WHEN i.name = 'Tomato' THEN '2 large'
    WHEN i.name = 'Onion' THEN '1 large'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Ginger' THEN '1 inch'
    WHEN i.name = 'Cilantro' THEN '1/4 cup'
    WHEN i.name = 'Lime' THEN '1'
    WHEN i.name = 'Cumin' THEN '1 tsp'
    WHEN i.name = 'Curry Powder' THEN '2 tbsp'
    WHEN i.name = 'Paprika' THEN '1 tbsp'
    WHEN i.name = 'Salt' THEN 'to taste'
    WHEN i.name = 'Black Pepper' THEN '1/2 tsp'
    WHEN i.name = 'Basmati Rice' THEN '2 cups'
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 1
    WHEN i.name = 'Yogurt' THEN 8
    WHEN i.name = 'Heavy Cream' THEN 16
    WHEN i.name = 'Butter' THEN 3
    WHEN i.name = 'Tomato' THEN 2
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Cilantro' THEN 4
    WHEN i.name = 'Lime' THEN 1
    WHEN i.name = 'Cumin' THEN 1
    WHEN i.name = 'Curry Powder' THEN 2
    WHEN i.name = 'Paprika' THEN 1
    WHEN i.name = 'Salt' THEN 1
    WHEN i.name = 'Black Pepper' THEN 1
    WHEN i.name = 'Basmati Rice' THEN 2
  END,
  CASE 
    WHEN i.name IN ('Chicken Breast', 'Heavy Cream', 'Yogurt', 'Basmati Rice') THEN 'oz'
    WHEN i.name IN ('Butter', 'Cumin', 'Curry Powder', 'Paprika') THEN 'tbsp'
    WHEN i.name IN ('Garlic') THEN 'cloves'
    WHEN i.name IN ('Ginger') THEN 'inch'
    WHEN i.name IN ('Cilantro') THEN 'cups'
    WHEN i.name IN ('Salt') THEN 'to taste'
    WHEN i.name IN ('Black Pepper') THEN 'tsp'
    ELSE 'whole'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
