-- Recipe: Teriyaki Glazed Pork Belly Bowl
-- Cuisine: Japanese
-- Category: Dinner
-- Difficulty: Medium

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Pork Belly', 'Soy Sauce', 'Honey', 'Garlic', 'Ginger', 'Rice', 'Sesame Seed', 'Cucumber', 'Carrot', 'Sesame Oil', 'Rice Vinegar')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Teriyaki Glazed Pork Belly Bowl',
    'Tender pork belly slices caramelized in a sweet and savory teriyaki glaze, served over steamed Japanese rice with quick-pickled cucumber and carrots. The contrast of rich, fatty pork with crisp, tangy vegetables creates an addictive harmony of textures and flavors.',
    '[]'::jsonb,
    ARRAY[
      'Cut pork belly into 1/2-inch thick slices against the grain for optimal tenderness',
      'Mix soy sauce, honey, minced garlic, and grated ginger in a bowl to create the teriyaki marinade',
      'Heat sesame oil in a large skillet over medium-high heat',
      'Sear pork belly slices for 3-4 minutes until golden brown on each side',
      'Pour teriyaki marinade over the pork, reduce heat to medium',
      'Cook for 8-10 minutes, basting occasionally, until sauce thickens and glazes the pork',
      'Meanwhile, slice cucumber thinly and marinate in rice vinegar with a pinch of sugar for quick pickles',
      'Julienne carrots and add to the pickled vegetables',
      'Steam Japanese rice according to package instructions',
      'Serve rice in bowls, top with sliced teriyaki pork',
      'Add pickled cucumber and carrots on the side',
      'Garnish with toasted sesame seeds and sliced green onions if available'
    ],
    'dinner',
    ARRAY['Japanese'],
    ARRAY[]::text[],
    'Medium',
    15, 25, 2, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Pork Belly' THEN '12 oz'
    WHEN i.name = 'Soy Sauce' THEN '1/4 cup'
    WHEN i.name = 'Honey' THEN '3 tbsp'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Ginger' THEN '1 inch'
    WHEN i.name = 'Rice' THEN '1.5 cups'
    WHEN i.name = 'Sesame Seed' THEN '2 tbsp'
    WHEN i.name = 'Cucumber' THEN '1 medium'
    WHEN i.name = 'Carrot' THEN '1 medium'
    WHEN i.name = 'Sesame Oil' THEN '2 tbsp'
    WHEN i.name = 'Rice Vinegar' THEN '3 tbsp'
  END,
  CASE 
    WHEN i.name = 'Pork Belly' THEN 12
    WHEN i.name = 'Soy Sauce' THEN 4
    WHEN i.name = 'Honey' THEN 3
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Rice' THEN 2
    WHEN i.name = 'Sesame Seed' THEN 2
    WHEN i.name = 'Cucumber' THEN 1
    WHEN i.name = 'Carrot' THEN 1
    WHEN i.name = 'Sesame Oil' THEN 2
    WHEN i.name = 'Rice Vinegar' THEN 3
  END,
  CASE 
    WHEN i.name IN ('Pork Belly', 'Sesame Seed') THEN 'oz'
    WHEN i.name IN ('Soy Sauce', 'Honey', 'Rice Vinegar') THEN 'tbsp'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Ginger' THEN 'inch'
    WHEN i.name = 'Rice' THEN 'cups'
    WHEN i.name IN ('Cucumber', 'Carrot') THEN 'medium'
    WHEN i.name = 'Sesame Oil' THEN 'tbsp'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
