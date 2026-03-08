-- Butter Chicken - Creamy Indian curry with tender chicken in a rich tomato-cream sauce
-- Generated: 2026-03-08-11

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Chicken Breast', 'Butter', 'Garlic', 'Ginger', 'Onion', 'Tomato', 'Heavy Cream', 'Curry Powder', 'Garam Masala', 'Rice', 'Cilantro')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Butter Chicken',
    'Tender chicken pieces in a rich, creamy tomato-based curry with aromatic spices. A beloved Indian classic with a perfect balance of warmth and richness.',
    '[]'::jsonb,
    ARRAY['Cut chicken into bite-sized pieces and season with salt and curry powder', 'Heat butter in a large pan over medium-high heat', 'Add chicken and cook until browned, about 5 minutes. Remove and set aside', 'Add more butter, sauté onion until translucent', 'Add garlic and ginger, cook for 1 minute until fragrant', 'Add tomatoes and simmer for 10 minutes', 'Stir in cream and garam masala', 'Return chicken to pan and simmer for 15 minutes', 'Serve over rice, garnished with fresh cilantro'],
    'dinner',
    ARRAY['Indian'],
    ARRAY[]::text[],
    'Medium',
    20, 35, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN '1.5 lbs'
    WHEN i.name = 'Butter' THEN '4 tbsp'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Ginger' THEN '1 inch piece'
    WHEN i.name = 'Onion' THEN '1 large'
    WHEN i.name = 'Tomato' THEN '2 cans crushed'
    WHEN i.name = 'Heavy Cream' THEN '1 cup'
    WHEN i.name = 'Curry Powder' THEN '2 tbsp'
    WHEN i.name = 'Garam Masala' THEN '1 tbsp'
    WHEN i.name = 'Rice' THEN '2 cups'
    WHEN i.name = 'Cilantro' THEN '2 tbsp'
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 1
    WHEN i.name = 'Butter' THEN 4
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Tomato' THEN 2
    WHEN i.name = 'Heavy Cream' THEN 1
    WHEN i.name = 'Curry Powder' THEN 2
    WHEN i.name = 'Garam Masala' THEN 1
    WHEN i.name = 'Rice' THEN 2
    WHEN i.name = 'Cilantro' THEN 2
  END,
  CASE 
    WHEN i.name IN ('Chicken Breast', 'Rice') THEN 'lbs'
    WHEN i.name IN ('Butter', 'Heavy Cream') THEN 'tbsp'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Ginger' THEN 'inch'
    WHEN i.name = 'Onion' THEN 'large'
    WHEN i.name = 'Tomato' THEN 'cans'
    WHEN i.name IN ('Curry Powder', 'Garam Masala', 'Cilantro') THEN 'tbsp'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
