-- Coconut Chickpea Curry with Basmati Rice
-- Cuisine: Indian | Category: Lunch | Difficulty: Easy

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Chickpeas', 'Onion', 'Garlic', 'Ginger', 'Coconut Milk', 'Curry Powder', 'Cumin', 'Cilantro', 'Vegetable Broth', 'Tomatoes', 'Basmati Rice', 'Salt', 'Olive Oil', 'Lemon')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Coconut Chickpea Curry with Basmati Rice',
    'A fragrant and creamy Indian-inspired curry featuring tender chickpeas simmered in rich coconut milk with aromatic curry powder and cumin, served over fluffy basmati rice and finished with fresh cilantro and a squeeze of lemon.',
    '[]'::jsonb,
    ARRAY[
      'Rinse basmati rice under cold water until water runs clear. Add rice, 1.5 cups water, and a pinch of salt to a pot. Bring to boil, then reduce heat to low, cover, and cook for 15 minutes.',
      'While rice cooks, dice the onion and mince the garlic and ginger.',
      'Heat olive oil in a large pan or Dutch oven over medium heat.',
      'Add diced onion and sauté for 4-5 minutes until softened and translucent.',
      'Add minced garlic and ginger, cook for 1 minute until fragrant.',
      'Stir in curry powder and cumin, cook for 30 seconds to toast the spices.',
      'Add the can of tomatoes (crushed or diced), breaking them up with a spoon. Cook for 2-3 minutes.',
      'Add drained chickpeas and vegetable broth. Stir well to combine.',
      'Pour in the coconut milk and stir to incorporate. Bring to a gentle simmer.',
      'Reduce heat to low, cover, and simmer for 15-20 minutes, stirring occasionally, until the sauce thickens slightly and flavors meld.',
      'Season with salt to taste. Add more curry powder if desired for deeper flavor.',
      'Fluff the cooked basmati rice with a fork.',
      'Serve curry over basmati rice in bowls.',
      'Garnish with fresh cilantro leaves and a squeeze of fresh lemon juice before serving.'
    ],
    'lunch',
    ARRAY['Indian'],
    ARRAY['Vegetarian', 'Vegan', 'Gluten-Free'],
    'Easy',
    10, 25, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Chickpeas' THEN '1 can (15 oz)'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Garlic' THEN '3 cloves'
    WHEN i.name = 'Ginger' THEN '1 inch piece'
    WHEN i.name = 'Coconut Milk' THEN '1 can (13.5 oz)'
    WHEN i.name = 'Curry Powder' THEN '2 tbsp'
    WHEN i.name = 'Cumin' THEN '1 tsp'
    WHEN i.name = 'Cilantro' THEN '1/4 cup'
    WHEN i.name = 'Vegetable Broth' THEN '1/2 cup'
    WHEN i.name = 'Tomatoes' THEN '1 can (14 oz)'
    WHEN i.name = 'Basmati Rice' THEN '1 cup'
    WHEN i.name = 'Salt' THEN 'to taste'
    WHEN i.name = 'Olive Oil' THEN '2 tbsp'
    WHEN i.name = 'Lemon' THEN '1/2 fruit'
    ELSE '1'
  END,
  CASE 
    WHEN i.name = 'Chickpeas' THEN 1
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garlic' THEN 3
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Coconut Milk' THEN 1
    WHEN i.name = 'Curry Powder' THEN 2
    WHEN i.name = 'Cumin' THEN 1
    WHEN i.name = 'Cilantro' THEN 1
    WHEN i.name = 'Vegetable Broth' THEN 1
    WHEN i.name = 'Tomatoes' THEN 1
    WHEN i.name = 'Basmati Rice' THEN 1
    WHEN i.name = 'Salt' THEN 0
    WHEN i.name = 'Olive Oil' THEN 2
    WHEN i.name = 'Lemon' THEN 1
    ELSE 1
  END,
  CASE 
    WHEN i.name IN ('Chickpeas', 'Coconut Milk', 'Tomatoes') THEN 'can'
    WHEN i.name IN ('Onion') THEN 'medium'
    WHEN i.name IN ('Garlic') THEN 'cloves'
    WHEN i.name IN ('Ginger') THEN 'inch piece'
    WHEN i.name IN ('Curry Powder', 'Cumin') THEN 'tbsp'
    WHEN i.name IN ('Cilantro') THEN 'cup'
    WHEN i.name IN ('Vegetable Broth') THEN 'cup'
    WHEN i.name IN ('Basmati Rice') THEN 'cup'
    WHEN i.name IN ('Salt') THEN 'to taste'
    WHEN i.name IN ('Olive Oil') THEN 'tbsp'
    WHEN i.name IN ('Lemon') THEN 'fruit'
    ELSE 'unit'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
