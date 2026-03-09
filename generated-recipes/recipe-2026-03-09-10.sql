-- Recipe: Lemon Ricotta Pancakes with Blueberry Compote
-- Cuisine: Italian | Category: Breakfast | Difficulty: Medium

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Ricotta', 'Egg', 'Flour', 'Sugar', 'Lemon', 'Blueberry', 'Butter', 'Milk', 'Baking Powder', 'Vanilla Extract', 'Salt')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Lemon Ricotta Pancakes with Blueberry Compote',
    'Fluffy ricotta pancakes infused with fresh lemon zest, topped with a sweet-tart blueberry compote. A luxurious Italian-inspired breakfast that feels like a special occasion.',
    '[]'::jsonb,
    ARRAY[
      'In a large bowl, whisk together ricotta, eggs, lemon zest, vanilla, and sugar until smooth',
      'In a separate bowl, sift together flour, baking powder, and salt',
      'Gradually fold dry ingredients into wet ingredients, alternating with milk until a smooth batter forms',
      'Heat a non-stick pan or griddle over medium heat and lightly butter',
      'Pour 1/4 cup batter per pancake, cook until bubbles form on surface (2-3 minutes), flip and cook another 1-2 minutes',
      'For compote: combine blueberries, sugar, and lemon juice in a saucepan over medium heat',
      'Cook blueberries until they burst and sauce thickens (5-7 minutes), remove from heat',
      'Serve pancakes warm, topped with blueberry compote and a dusting of powdered sugar',
      'Garnish with fresh lemon slices and mint if desired'
    ],
    'breakfast',
    ARRAY['Italian'],
    ARRAY[]::text[],
    'Medium',
    15, 20, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Ricotta' THEN '1 cup'
    WHEN i.name = 'Egg' THEN '2'
    WHEN i.name = 'Flour' THEN '1.5 cups'
    WHEN i.name = 'Sugar' THEN '1/4 cup'
    WHEN i.name = 'Lemon' THEN '1'
    WHEN i.name = 'Blueberry' THEN '2 cups'
    WHEN i.name = 'Butter' THEN '2 tbsp'
    WHEN i.name = 'Milk' THEN '1/4 cup'
    WHEN i.name = 'Baking Powder' THEN '1 tsp'
    WHEN i.name = 'Vanilla Extract' THEN '1 tsp'
    WHEN i.name = 'Salt' THEN '1/4 tsp'
  END,
  CASE 
    WHEN i.name = 'Ricotta' THEN 1
    WHEN i.name = 'Egg' THEN 2
    WHEN i.name = 'Flour' THEN 1
    WHEN i.name = 'Sugar' THEN 1
    WHEN i.name = 'Lemon' THEN 1
    WHEN i.name = 'Blueberry' THEN 2
    WHEN i.name = 'Butter' THEN 2
    WHEN i.name = 'Milk' THEN 1
    WHEN i.name = 'Baking Powder' THEN 1
    WHEN i.name = 'Vanilla Extract' THEN 1
    WHEN i.name = 'Salt' THEN 1
  END,
  CASE 
    WHEN i.name IN ('Flour', 'Sugar', 'Milk') THEN 'cups'
    WHEN i.name = 'Butter' THEN 'tbsp'
    WHEN i.name = 'Baking Powder' THEN 'tsp'
    WHEN i.name = 'Vanilla Extract' THEN 'tsp'
    WHEN i.name = 'Salt' THEN 'tsp'
    WHEN i.name = 'Blueberry' THEN 'cups'
    ELSE 'unit'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
