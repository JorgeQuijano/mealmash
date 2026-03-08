-- Recipe: Chilaquiles Rojos con Huevos
-- Generated: 2026-03-08-04
-- Cuisine: Mexican | Category: Breakfast | Difficulty: Easy

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Tortilla', 'Onion', 'Tomato', 'Garlic', 'Egg', 'Cheddar', 'Avocado', 'Sour Cream', 'Cilantro', 'Vegetable Oil', 'Salt', 'Black Pepper', 'Canned Tomatoes', 'Salsa Verde')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Chilaquiles Rojos con Huejos',
    'A vibrant and satisfying Mexican breakfast classic featuring crispy tortilla chips bathed in a rich, tangy red salsa, topped with perfectly fried eggs, creamy avocado, and crumbled cheese. This beloved dish brings together the textures of soft chips, runny egg yolks, and fresh toppings in every delicious bite.',
    '[]'::jsonb,
    ARRAY[
      'First, make the red salsa: Heat 2 tablespoons of vegetable oil in a large skillet over medium heat. Add diced onion and cook until softened and translucent, about 5 minutes.',
      'Add minced garlic and cook for 1 minute until fragrant. Pour in the canned tomatoes, breaking them up with a spoon. Add a splash of water, salt, and pepper to taste.',
      'Simmer the salsa for 10-12 minutes until it thickens and darkens in color. Remove from heat and set aside. You should have about 1.5 cups of salsa.',
      'While the salsa simmers, cut the corn tortillas into triangular quarters. Heat 1/2 inch of vegetable oil in a deep pan or skillet to 350°F (175°C).',
      'Fry the tortilla pieces in batches until golden brown and crispy, about 2-3 minutes per batch. Remove with a slotted spoon and drain on paper towels.',
      'In the same skillet or a clean pan, fry the eggs to your preference - sunny side up or over easy works perfectly for this dish.',
      'Now assemble: Pour half of the warm red salsa onto a large serving plate or shallow bowl. Add the crispy tortilla chips and gently toss to coat them in the sauce.',
      'Add more salsa as needed - the chips should be well-coated but not soggy. Top with the fried eggs, allowing the yolks to run over the chips.',
      'Slice the avocado and arrange on top. Sprinkle generously with crumbled cheddar cheese. Add a dollop of sour cream and fresh cilantro.',
      'Serve immediately while the eggs are still warm and the salsa is hot. Serve with extra salsa on the side if desired.'
    ],
    'breakfast',
    ARRAY['Mexican'],
    ARRAY[]::text[],
    'Easy',
    15, 25, 2, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Tortilla' THEN '8 small'
    WHEN i.name = 'Onion' THEN '1/2 medium'
    WHEN i.name = 'Tomato' THEN '2 medium'
    WHEN i.name = 'Garlic' THEN '3 cloves'
    WHEN i.name = 'Egg' THEN '4 large'
    WHEN i.name = 'Cheddar' THEN '1/2 cup'
    WHEN i.name = 'Avocado' THEN '1 ripe'
    WHEN i.name = 'Sour Cream' THEN '1/4 cup'
    WHEN i.name = 'Cilantro' THEN '2 tbsp'
    WHEN i.name = 'Vegetable Oil' THEN '1/2 cup'
    WHEN i.name = 'Salt' THEN 'to taste'
    WHEN i.name = 'Black Pepper' THEN 'to taste'
    WHEN i.name = 'Canned Tomatoes' THEN '1 can (14 oz)'
    WHEN i.name = 'Salsa Verde' THEN '1/2 cup'
    ELSE 'as needed'
  END,
  CASE 
    WHEN i.name = 'Tortilla' THEN 8
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Tomato' THEN 2
    WHEN i.name = 'Garlic' THEN 3
    WHEN i.name = 'Egg' THEN 4
    WHEN i.name = 'Cheddar' THEN 1
    WHEN i.name = 'Avocado' THEN 1
    WHEN i.name = 'Sour Cream' THEN 1
    WHEN i.name = 'Cilantro' THEN 2
    WHEN i.name = 'Vegetable Oil' THEN 1
    ELSE 0
  END,
  CASE 
    WHEN i.name IN ('Tortilla', 'Egg', 'Avocado', 'Cheddar', 'Sour Cream') THEN 'unit'
    WHEN i.name IN ('Garlic') THEN 'cloves'
    WHEN i.name = 'Onion' THEN 'medium'
    WHEN i.name = 'Tomato' THEN 'medium'
    WHEN i.name = 'Cilantro' THEN 'tbsp'
    WHEN i.name = 'Vegetable Oil' THEN 'cup'
    WHEN i.name = 'Canned Tomatoes' THEN 'can'
    WHEN i.name = 'Salsa Verde' THEN 'cup'
    ELSE 'to taste'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
