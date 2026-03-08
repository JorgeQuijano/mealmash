-- Recipe: Butter Chicken with Garlic Naan
-- Generated: 2026-03-08-08
-- Cuisine: Indian | Category: Dinner | Difficulty: Medium

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Chicken', 'Garlic', 'Onion', 'Tomato', 'Butter', 'Heavy Cream', 'Ginger', 'Cilantro', 'Lime', 'Garam Masala', 'Cumin', 'Turmeric', 'Chili Powder', 'Chicken Broth', 'Rice', 'Naan')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Butter Chicken with Garlic Naan',
    'Tender chicken pieces swimming in a rich, velvety tomato-cream sauce with warm spices, served alongside soft, fluffy naan bread brushed with aromatic garlic butter. A beloved Indian restaurant classic made from scratch.',
    '[]'::jsonb,
    ARRAY[
      'Cut chicken into bite-sized pieces. Marinate with yogurt, half the garam masala, turmeric, and salt for at least 30 minutes (or overnight in the refrigerator).',
      'For the sauce: heat oil and butter in a large pan over medium heat. Add sliced onions and cook until golden brown, about 8-10 minutes.',
      'Add minced ginger and garlic, sauté for 2 minutes until fragrant.',
      'Add tomatoes, remaining garam masala, cumin, chili powder, and a pinch of salt. Cook for 10-12 minutes, stirring occasionally, until tomatoes break down into a thick sauce.',
      'Use an immersion blender to puree the sauce until smooth (or transfer to a regular blender).',
      'Return the sauce to the pan. Add chicken broth and bring to a simmer. Add the marinated chicken pieces.',
      'Cook for 15-20 minutes until chicken is cooked through and sauce has thickened.',
      'Stir in heavy cream and a tablespoon of butter. Simmer for another 5 minutes. Adjust seasoning to taste.',
      'For garlic naan: mix softened butter with minced garlic and chopped cilantro.',
      'Warm naan breads in a dry pan or oven. Brush generously with garlic butter.',
      'Serve butter chicken over steamed basmati rice, with garlic naan on the side. Garnish with fresh cilantro and a squeeze of lime.'
    ],
    'dinner',
    ARRAY['Indian'],
    ARRAY[]::text[],
    'Medium',
    20, 40, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE i.name
    WHEN 'Chicken' THEN '1.5 lbs'
    WHEN 'Garlic' THEN '6 cloves'
    WHEN 'Onion' THEN '2 medium'
    WHEN 'Tomato' THEN '4 medium'
    WHEN 'Butter' THEN '4 tbsp'
    WHEN 'Heavy Cream' THEN '1 cup'
    WHEN 'Ginger' THEN '2 inch piece'
    WHEN 'Cilantro' THEN '1/4 cup'
    WHEN 'Lime' THEN '1'
    WHEN 'Garam Masala' THEN '2 tbsp'
    WHEN 'Cumin' THEN '1 tsp'
    WHEN 'Turmeric' THEN '1/2 tsp'
    WHEN 'Chili Powder' THEN '1 tsp'
    WHEN 'Chicken Broth' THEN '1 cup'
    WHEN 'Rice' THEN '2 cups'
    WHEN 'Naan' THEN '4 pieces'
  END,
  CASE i.name
    WHEN 'Chicken' THEN 1.5
    WHEN 'Garlic' THEN 6
    WHEN 'Onion' THEN 2
    WHEN 'Tomato' THEN 4
    WHEN 'Butter' THEN 4
    WHEN 'Heavy Cream' THEN 1
    WHEN 'Ginger' THEN 2
    WHEN 'Cilantro' THEN 0.25
    WHEN 'Lime' THEN 1
    WHEN 'Garam Masala' THEN 2
    WHEN 'Cumin' THEN 1
    WHEN 'Turmeric' THEN 0.5
    WHEN 'Chili Powder' THEN 1
    WHEN 'Chicken Broth' THEN 1
    WHEN 'Rice' THEN 2
    WHEN 'Naan' THEN 4
  END,
  CASE i.name
    WHEN 'Chicken' THEN 'lbs'
    WHEN 'Garlic' THEN 'cloves'
    WHEN 'Onion' THEN 'medium'
    WHEN 'Tomato' THEN 'medium'
    WHEN 'Butter' THEN 'tbsp'
    WHEN 'Heavy Cream' THEN 'cups'
    WHEN 'Ginger' THEN 'inch'
    WHEN 'Cilantro' THEN 'cups'
    WHEN 'Lime' THEN 'whole'
    WHEN 'Garam Masala' THEN 'tbsp'
    WHEN 'Cumin' THEN 'tsp'
    WHEN 'Turmeric' THEN 'tsp'
    WHEN 'Chili Powder' THEN 'tsp'
    WHEN 'Chicken Broth' THEN 'cups'
    WHEN 'Rice' THEN 'cups'
    WHEN 'Naan' THEN 'pieces'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
