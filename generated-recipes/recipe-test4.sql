-- Recipe: Indian Butter Chicken (Murgh Makhani)
-- A rich, creamy classic from Northern India with tender chicken in a velvety tomato-cream sauce

-- Step 1: Get ingredient IDs
WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN (
    'Chicken Breast', 'Butter', 'Heavy Cream', 'Canned Tomatoes', 'Onion', 
    'Garlic', 'Ginger', 'Garam Masala', 'Paprika', 'Cumin', 'Coriander Seed',
    'Salt', 'Black Pepper', 'Sugar', 'Lime', 'Greek Yogurt'
  )
),
-- Step 2: Insert recipe and get the ID
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Butter Chicken (Murgh Makhani)',
    'Tender chicken pieces swimming in a luscious, spiced tomato-cream sauce. A beloved North Indian classic with deep, complex flavors that balance warmth, richness, and a subtle sweetness.',
    '[]'::jsonb,
    ARRAY[
      'Cut chicken breast into 1.5-inch cubes and set aside',
      'In a large bowl, combine yogurt, garam masala, paprika, cumin, coriander, salt, and pepper',
      'Add chicken pieces to the marinade and coat thoroughly. Let sit for 30 minutes or overnight in refrigerator',
      'Heat a large skillet or grill pan over medium-high heat with 1 tbsp oil',
      'Cook marinated chicken until charred and cooked through, about 8-10 minutes. Set aside',
      'In a large pot or Dutch oven, melt butter over medium heat',
      'Add diced onion and cook until golden brown, about 8 minutes',
      'Add minced garlic and ginger, cook until fragrant, about 2 minutes',
      'Pour in crushed tomatoes and simmer for 15 minutes, stirring occasionally',
      'Use an immersion blender to puree the sauce until smooth (or transfer to a blender)',
      'Return sauce to pot, add heavy cream and stir well',
      'Add the cooked chicken pieces to the sauce',
      'Simmer for 10 minutes, allowing chicken to absorb flavors',
      'Stir in sugar, salt to taste, and a squeeze of lime juice',
      'Serve hot over basmati rice or with warm naan bread'
    ],
    'dinner',
    ARRAY['Indian'],
    ARRAY[]::text[],
    'Medium',
    20,
    35,
    4,
    '',
    NOW()
  ) RETURNING id
)
-- Step 3: Insert recipe_ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN '1.5 lbs'
    WHEN i.name = 'Butter' THEN '4 tbsp'
    WHEN i.name = 'Heavy Cream' THEN '1 cup'
    WHEN i.name = 'Canned Tomatoes' THEN '14 oz can'
    WHEN i.name = 'Onion' THEN '1 large'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Ginger' THEN '2 inches'
    WHEN i.name = 'Garam Masala' THEN '2 tsp'
    WHEN i.name = 'Paprika' THEN '1 tsp'
    WHEN i.name = 'Cumin' THEN '1 tsp'
    WHEN i.name = 'Coriander Seed' THEN '1 tsp'
    WHEN i.name = 'Salt' THEN '1.5 tsp'
    WHEN i.name = 'Black Pepper' THEN '1/2 tsp'
    WHEN i.name = 'Sugar' THEN '1 tsp'
    WHEN i.name = 'Lime' THEN '1 whole'
    WHEN i.name = 'Greek Yogurt' THEN '1/2 cup'
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 24
    WHEN i.name = 'Butter' THEN 4
    WHEN i.name = 'Heavy Cream' THEN 1
    WHEN i.name = 'Canned Tomatoes' THEN 14
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Ginger' THEN 2
    WHEN i.name = 'Garam Masala' THEN 2
    WHEN i.name = 'Paprika' THEN 1
    WHEN i.name = 'Cumin' THEN 1
    WHEN i.name = 'Coriander Seed' THEN 1
    WHEN i.name = 'Salt' THEN 1.5
    WHEN i.name = 'Black Pepper' THEN 0.5
    WHEN i.name = 'Sugar' THEN 1
    WHEN i.name = 'Lime' THEN 1
    WHEN i.name = 'Greek Yogurt' THEN 0.5
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 'oz'
    WHEN i.name = 'Butter' THEN 'tbsp'
    WHEN i.name = 'Heavy Cream' THEN 'cup'
    WHEN i.name = 'Canned Tomatoes' THEN 'oz'
    WHEN i.name = 'Onion' THEN 'large'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Ginger' THEN 'inches'
    WHEN i.name IN ('Garam Masala', 'Paprika', 'Cumin', 'Coriander Seed', 'Sugar') THEN 'tsp'
    WHEN i.name = 'Salt' THEN 'tsp'
    WHEN i.name = 'Black Pepper' THEN 'tsp'
    WHEN i.name = 'Lime' THEN 'whole'
    WHEN i.name = 'Greek Yogurt' THEN 'cup'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
