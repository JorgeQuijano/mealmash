-- Recipe: Huevos Rancheros Bowl
-- Generated: 2026-03-08-05
-- Cuisine: Mexican | Category: Breakfast | Difficulty: Easy

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Egg', 'Black Bean', 'Tortilla', 'Onion', 'Tomato', 'Garlic', 'Cilantro', 'Lime', 'Avocado', 'Sour Cream', 'Cumin', 'Chili Powder')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Huevos Rancheros Bowl',
    'A hearty Mexican breakfast bowl featuring perfectly fried eggs nestled on warm, spiced black beans, served with crispy tortilla strips, fresh pico de gallo, creamy avocado, and a drizzle of cool sour cream. Zesty lime and fresh cilantro brighten every bite.',
    '[]'::jsonb,
    ARRAY[
      'Drain and rinse black beans. Add to a small pot with cumin, chili powder, a pinch of salt, and a splash of water. Simmer for 5 minutes until warmed through.',
      'For pico de gallo: dice tomatoes and onion, chop cilantro, combine in a bowl. Squeeze in lime juice, add salt to taste, and set aside.',
      'Cut tortillas into thin strips. Heat 1/2 inch of oil in a pan over medium heat. Fry strips until golden and crispy, about 2-3 minutes. Drain on paper towels.',
      'Cut avocado in half, remove pit, and slice. Squeeze with lime juice to prevent browning.',
      'Heat a non-stick skillet over medium-high heat. Add a splash of oil. Crack eggs into the pan and cook to your preference (sunny-side up or over easy).',
      'Assemble bowls: divide warm black beans between bowls, create a well in the center.',
      'Place fried eggs on top of beans. Arrange tortilla strips, pico de gallo, and avocado slices around the eggs.',
      'Add a dollop of sour cream, sprinkle with extra cilantro, and serve with lime wedges on the side.'
    ],
    'breakfast',
    ARRAY['Mexican'],
    ARRAY['Vegetarian'],
    'Easy',
    10, 15, 2, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE i.name
    WHEN 'Egg' THEN '4 eggs'
    WHEN 'Black Bean' THEN '1 can (15 oz)'
    WHEN 'Tortilla' THEN '4 small'
    WHEN 'Onion' THEN '1 medium'
    WHEN 'Tomato' THEN '2 medium'
    WHEN 'Garlic' THEN '2 cloves'
    WHEN 'Cilantro' THEN '1/2 cup'
    WHEN 'Lime' THEN '2 whole'
    WHEN 'Avocado' THEN '2 ripe'
    WHEN 'Sour Cream' THEN '1/2 cup'
    WHEN 'Cumin' THEN '1 tsp'
    WHEN 'Chili Powder' THEN '1 tsp'
  END,
  CASE i.name
    WHEN 'Egg' THEN 4
    WHEN 'Black Bean' THEN 15
    WHEN 'Tortilla' THEN 4
    WHEN 'Onion' THEN 1
    WHEN 'Tomato' THEN 2
    WHEN 'Garlic' THEN 2
    WHEN 'Cilantro' THEN 0.5
    WHEN 'Lime' THEN 2
    WHEN 'Avocado' THEN 2
    WHEN 'Sour Cream' THEN 0.5
    WHEN 'Cumin' THEN 1
    WHEN 'Chili Powder' THEN 1
  END,
  CASE i.name
    WHEN 'Egg' THEN 'pieces'
    WHEN 'Black Bean' THEN 'oz'
    WHEN 'Tortilla' THEN 'small'
    WHEN 'Onion' THEN 'medium'
    WHEN 'Tomato' THEN 'medium'
    WHEN 'Garlic' THEN 'cloves'
    WHEN 'Cilantro' THEN 'cups'
    WHEN 'Lime' THEN 'whole'
    WHEN 'Avocado' THEN 'ripe'
    WHEN 'Sour Cream' THEN 'cups'
    WHEN 'Cumin' THEN 'tsp'
    WHEN 'Chili Powder' THEN 'tsp'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
