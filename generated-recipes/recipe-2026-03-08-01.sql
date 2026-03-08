-- Recipe: Lamb Rogan Josh
-- Cuisine: Indian (Kashmiri)
-- Category: Dinner
-- Difficulty: Medium

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Lamb', 'Onion', 'Garlic', 'Ginger', 'Tomato', 'Cumin', 'Cinnamon', 'Cardamom', 'Clove', 'Garam Masala', 'Salt', 'Vegetable Oil', 'Cayenne', 'Bay Leaf')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Lamb Rogan Josh',
    'A rich and aromatic Kashmiri curry featuring tender lamb simmered in a fragrant tomato-based sauce infused with cardamom, cinnamon, cloves, and warming spices. A classic North Indian dish with deep, complex flavors.',
    '[]'::jsonb,
    ARRAY['Season lamb with salt and set aside for 15 minutes', 'Heat oil in a large pot over medium-high heat. Add cardamom, cinnamon, cloves, and bay leaves. Sauté until fragrant, about 1 minute', 'Add sliced onions and cook until deep golden brown, about 8-10 minutes', 'Add ginger and garlic paste, cook until raw smell disappears, about 2 minutes', 'Add tomatoes and cook until they break down and oil separates, about 8 minutes', 'Add cumin, cayenne, and half the garam masala. Stir for 1 minute', 'Add lamb pieces and brown on all sides, about 5 minutes', 'Add 2 cups water, bring to a boil, then reduce heat to low', 'Cover and simmer for 1 hour until lamb is tender', 'Remove lid, increase heat to medium, and cook until sauce thickens', 'Finish with remaining garam masula and serve hot with rice or naan'],
    'dinner',
    ARRAY['Indian'],
    ARRAY[]::text[],
    'Medium',
    20, 90, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Lamb' THEN '2 lbs'
    WHEN i.name = 'Onion' THEN '2 large'
    WHEN i.name = 'Garlic' THEN '6 cloves'
    WHEN i.name = 'Ginger' THEN '2 inch piece'
    WHEN i.name = 'Tomato' THEN '4 medium'
    WHEN i.name = 'Cardamom' THEN '4 pods'
    WHEN i.name = 'Cinnamon' THEN '1 inch stick'
    WHEN i.name = 'Clove' THEN '4 cloves'
    WHEN i.name = 'Bay Leaf' THEN '2 leaves'
    WHEN i.name = 'Cumin' THEN '1 tsp'
    WHEN i.name = 'Cayenne' THEN '1/2 tsp'
    WHEN i.name = 'Garam Masala' THEN '2 tsp'
    WHEN i.name = 'Salt' THEN 'to taste'
    WHEN i.name = 'Vegetable Oil' THEN '4 tbsp'
  END,
  CASE 
    WHEN i.name = 'Lamb' THEN 2
    WHEN i.name = 'Onion' THEN 2
    WHEN i.name = 'Garlic' THEN 6
    WHEN i.name = 'Ginger' THEN 2
    WHEN i.name = 'Tomato' THEN 4
    WHEN i.name = 'Cardamom' THEN 4
    WHEN i.name = 'Cinnamon' THEN 1
    WHEN i.name = 'Clove' THEN 4
    WHEN i.name = 'Bay Leaf' THEN 2
    WHEN i.name = 'Cumin' THEN 1
    WHEN i.name = 'Cayenne' THEN 1
    WHEN i.name = 'Garam Masala' THEN 2
    WHEN i.name = 'Salt' THEN 1
    WHEN i.name = 'Vegetable Oil' THEN 4
  END,
  CASE 
    WHEN i.name IN ('Lamb') THEN 'lbs'
    WHEN i.name IN ('Onion', 'Tomato') THEN 'medium'
    WHEN i.name IN ('Garlic') THEN 'cloves'
    WHEN i.name IN ('Ginger') THEN 'inch piece'
    WHEN i.name IN ('Cardamom') THEN 'pods'
    WHEN i.name IN ('Cinnamon') THEN 'inch stick'
    WHEN i.name IN ('Clove') THEN 'cloves'
    WHEN i.name IN ('Bay Leaf') THEN 'leaves'
    WHEN i.name IN ('Cumin', 'Cayenne', 'Garam Masala') THEN 'tsp'
    WHEN i.name IN ('Salt') THEN 'to taste'
    WHEN i.name IN ('Vegetable Oil') THEN 'tbsp'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
