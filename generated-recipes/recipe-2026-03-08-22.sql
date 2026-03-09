-- Thai Red Curry Chicken
-- A fragrant and creamy Thai curry with tender chicken, coconut milk, and colorful vegetables

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Chicken Breast', 'Coconut Milk', 'Tomato', 'Bell Pepper', 'Onion', 'Garlic', 'Ginger', 'Fish Sauce', 'Vegetable Stock', 'Cilantro', 'Rice', 'Vegetable Oil')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Thai Red Curry Chicken',
    'A fragrant and creamy Thai-inspired curry with tender chicken breast, coconut milk, fresh vegetables, and aromatic spices. Served over steamed jasmine rice for a complete and satisfying meal.',
    '[]'::jsonb,
    ARRAY[
      'Heat vegetable oil in a large wok or skillet over medium-high heat',
      'Add diced onion and cook until softened, about 3 minutes',
      'Add minced garlic and ginger, stir for 30 seconds until fragrant',
      'Add chicken breast pieces and cook until browned on all sides, about 5-6 minutes',
      'Pour in coconut milk and vegetable stock, stir to combine',
      'Add sliced bell pepper and diced tomato, bring to a simmer',
      'Reduce heat to medium-low and simmer for 10-12 minutes until chicken is cooked through and sauce thickens slightly',
      'Stir in fish sauce to taste',
      'Serve hot over steamed jasmine rice, garnished with fresh cilantro'
    ],
    'dinner',
    ARRAY['Thai', 'Asian'],
    ARRAY['Gluten-Free', 'Dairy-Free'],
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
    WHEN i.name = 'Coconut Milk' THEN '2 cups'
    WHEN i.name = 'Tomato' THEN '2 medium'
    WHEN i.name = 'Bell Pepper' THEN '1 large'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Ginger' THEN '1 inch'
    WHEN i.name = 'Fish Sauce' THEN '2 tbsp'
    WHEN i.name = 'Vegetable Stock' THEN '1 cup'
    WHEN i.name = 'Cilantro' THEN '1/4 cup'
    WHEN i.name = 'Rice' THEN '2 cups'
    WHEN i.name = 'Vegetable Oil' THEN '2 tbsp'
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 1
    WHEN i.name = 'Coconut Milk' THEN 2
    WHEN i.name = 'Tomato' THEN 2
    WHEN i.name = 'Bell Pepper' THEN 1
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Fish Sauce' THEN 2
    WHEN i.name = 'Vegetable Stock' THEN 1
    WHEN i.name = 'Cilantro' THEN 0.25
    WHEN i.name = 'Rice' THEN 2
    WHEN i.name = 'Vegetable Oil' THEN 2
  END,
  CASE 
    WHEN i.name IN ('Chicken Breast', 'Tomato', 'Bell Pepper', 'Onion', 'Garlic', 'Ginger', 'Cilantro') THEN 'pieces'
    WHEN i.name IN ('Coconut Milk', 'Vegetable Stock', 'Fish Sauce', 'Vegetable Oil') THEN 'cups'
    WHEN i.name = 'Rice' THEN 'cups'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
