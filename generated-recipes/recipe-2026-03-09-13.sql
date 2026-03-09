-- Recipe: Mango Curry Chicken
-- Cuisine: Indian | Category: Dinner | Difficulty: Medium

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Chicken Breast', 'Onion', 'Garlic', 'Ginger', 'Tomato', 'Heavy Cream', 'Butter', 'Honey', 'Cumin', 'Paprika', 'Cayenne', 'Salt', 'Black Pepper')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Mango Curry Chicken',
    'Tender chicken breast simmered in a creamy mango-infused curry sauce with warm spices. A sweet and savory fusion dish that brings together the richness of butter, the sweetness of ripe mango, and the depth of Indian spices.',
    '[]'::jsonb,
    ARRAY[
      'Cut chicken breast into bite-sized pieces and season with salt, black pepper, and half the cumin.',
      'Heat butter in a large pan over medium-high heat. Cook chicken until golden brown, about 5-6 minutes. Remove and set aside.',
      'In the same pan, sauté diced onion until translucent. Add minced garlic and ginger, cook for 1 minute.',
      'Add remaining cumin, paprika, and cayenne. Stir for 30 seconds until fragrant.',
      'Pour in heavy cream and add diced tomato. Simmer for 5 minutes.',
      'Add honey and return chicken to the pan. Cook for another 8-10 minutes until chicken is cooked through and sauce thickens.',
      'Adjust seasoning with salt and pepper. Serve hot over rice or with naan bread.'
    ],
    'dinner',
    ARRAY['Indian'],
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
    WHEN i.name = 'Chicken Breast' THEN '1 lb'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Garlic' THEN '3 cloves'
    WHEN i.name = 'Ginger' THEN '1 inch'
    WHEN i.name = 'Tomato' THEN '2 medium'
    WHEN i.name = 'Heavy Cream' THEN '1 cup'
    WHEN i.name = 'Butter' THEN '3 tbsp'
    WHEN i.name = 'Honey' THEN '2 tbsp'
    WHEN i.name = 'Cumin' THEN '1 tsp'
    WHEN i.name = 'Paprika' THEN '1 tbsp'
    WHEN i.name = 'Cayenne' THEN '1/2 tsp'
    WHEN i.name = 'Salt' THEN 'to taste'
    WHEN i.name = 'Black Pepper' THEN 'to taste'
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 1
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garlic' THEN 3
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Tomato' THEN 2
    WHEN i.name = 'Heavy Cream' THEN 1
    WHEN i.name = 'Butter' THEN 3
    WHEN i.name = 'Honey' THEN 2
    WHEN i.name = 'Cumin' THEN 1
    WHEN i.name = 'Paprika' THEN 1
    WHEN i.name = 'Cayenne' THEN 1
    WHEN i.name = 'Salt' THEN 1
    WHEN i.name = 'Black Pepper' THEN 1
  END,
  CASE 
    WHEN i.name IN ('Chicken Breast') THEN 'lb'
    WHEN i.name IN ('Onion', 'Tomato', 'Ginger') THEN 'medium'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Heavy Cream' THEN 'cup'
    WHEN i.name = 'Butter' THEN 'tbsp'
    WHEN i.name = 'Honey' THEN 'tbsp'
    WHEN i.name IN ('Cumin', 'Paprika', 'Cayenne') THEN 'tsp'
    WHEN i.name IN ('Salt', 'Black Pepper') THEN 'to taste'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
