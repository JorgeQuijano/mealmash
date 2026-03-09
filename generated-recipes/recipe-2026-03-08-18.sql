-- Tuscan Herb Chicken with Roasted Vegetables
-- Cuisine: Italian | Category: Dinner | Difficulty: Medium

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Chicken Breast', 'Olive Oil', 'Garlic', 'Rosemary', 'Thyme', 'Oregano', 'Bell Pepper', 'Zucchini', 'Onion', 'Chicken Broth', 'White Wine', 'Lemon')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Tuscan Herb Chicken with Roasted Vegetables',
    'Juicy pan-seared chicken breasts seasoned with fresh rosemary, thyme, and oregano, served with a medley of roasted bell peppers, zucchini, and caramelized onions finished with a white wine and lemon pan sauce.',
    '[]'::jsonb,
    ARRAY[
      'Season chicken breasts generously with salt, pepper, rosemary, thyme, and oregano. Let rest at room temperature for 15 minutes.',
      'Heat olive oil in a large oven-safe skillet over medium-high heat until shimmering.',
      'Sear chicken skin-side down for 5-6 minutes until golden and crispy. Flip and cook another 3-4 minutes.',
      'Remove chicken and set aside. Add more olive oil if needed.',
      'Sauté sliced onions and bell peppers for 3-4 minutes until softened. Add garlic and cook 1 minute more.',
      'Add zucchini rounds and roasted for 5-6 minutes until tender and slightly caramelized.',
      'Push vegetables to the sides, add white wine and lemon juice to center. Scrape up any browned bits.',
      'Return chicken to skillet, spooning some vegetables over the top.',
      'Transfer to preheated 400°F oven for 10-12 minutes until chicken reaches 165°F internal temperature.',
      'Rest chicken 5 minutes before serving with extra fresh herbs and a drizzle of olive oil.'
    ],
    'dinner',
    ARRAY['Italian'],
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
    WHEN i.name = 'Chicken Breast' THEN '4 pieces'
    WHEN i.name = 'Olive Oil' THEN '3 tbsp'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Rosemary' THEN '2 sprigs'
    WHEN i.name = 'Thyme' THEN '4 sprigs'
    WHEN i.name = 'Oregano' THEN '1 tsp'
    WHEN i.name = 'Bell Pepper' THEN '2 medium'
    WHEN i.name = 'Zucchini' THEN '2 medium'
    WHEN i.name = 'Onion' THEN '1 large'
    WHEN i.name = 'Chicken Broth' THEN '1/2 cup'
    WHEN i.name = 'White Wine' THEN '1/4 cup'
    WHEN i.name = 'Lemon' THEN '1 whole'
    ELSE '1'
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 4
    WHEN i.name = 'Olive Oil' THEN 3
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Rosemary' THEN 2
    WHEN i.name = 'Thyme' THEN 4
    WHEN i.name = 'Oregano' THEN 1
    WHEN i.name = 'Bell Pepper' THEN 2
    WHEN i.name = 'Zucchini' THEN 2
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Chicken Broth' THEN 1
    WHEN i.name = 'White Wine' THEN 1
    WHEN i.name = 'Lemon' THEN 1
    ELSE 1
  END,
  CASE 
    WHEN i.name IN ('Chicken Breast') THEN 'pieces'
    WHEN i.name IN ('Olive Oil') THEN 'tbsp'
    WHEN i.name IN ('Garlic') THEN 'cloves'
    WHEN i.name IN ('Rosemary', 'Thyme') THEN 'sprigs'
    WHEN i.name IN ('Oregano') THEN 'tsp'
    WHEN i.name IN ('Bell Pepper', 'Zucchini') THEN 'medium'
    WHEN i.name IN ('Onion') THEN 'large'
    WHEN i.name IN ('Chicken Broth', 'White Wine') THEN 'cup'
    WHEN i.name IN ('Lemon') THEN 'whole'
    ELSE 'unit'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
