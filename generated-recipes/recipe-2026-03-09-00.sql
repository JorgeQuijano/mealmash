-- Korean BBQ Beef Bowl
-- A savory, slightly sweet Korean-inspired beef dish served over rice with roasted vegetables

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Beef', 'Soy Sauce', 'Garlic', 'Ginger', 'Honey', 'Sesame Oil', 'Rice', 'Bell Pepper', 'Onion', 'Sesame Seed', 'Vegetable Oil')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Korean BBQ Beef Bowl',
    'Tender beef marinated in a sweet and savory soy-honey glaze, served over fluffy rice with sautéed bell peppers and onions. Finished with a sprinkle of toasted sesame seeds for crunch.',
    '[]'::jsonb,
    ARRAY[
      'Cut beef into thin strips against the grain for maximum tenderness.',
      'In a bowl, combine soy sauce, minced garlic, grated ginger, honey, and sesame oil to create the marinade.',
      'Add beef strips to the marinade and let sit for at least 30 minutes (longer for better flavor).',
      'Heat vegetable oil in a large skillet or wok over high heat.',
      'Remove beef from marinade (reserve the liquid) and sear in batches until browned but still slightly pink inside.',
      'Add reserved marinade to the pan and simmer until slightly thickened.',
      'In a separate pan, sauté sliced bell pepper and onion until slightly caramelized.',
      'Cook rice according to package instructions.',
      'Assemble bowls: divide rice between plates, top with beef and sauce, add sautéed vegetables.',
      'Garnish with toasted sesame seeds and serve immediately.'
    ],
    'dinner',
    ARRAY['Asian', 'Korean'],
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
    WHEN i.name = 'Beef' THEN '1 lb'
    WHEN i.name = 'Soy Sauce' THEN '1/4 cup'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Ginger' THEN '1 tbsp'
    WHEN i.name = 'Honey' THEN '2 tbsp'
    WHEN i.name = 'Sesame Oil' THEN '1 tbsp'
    WHEN i.name = 'Rice' THEN '2 cups'
    WHEN i.name = 'Bell Pepper' THEN '1 medium'
    WHEN i.name = 'Onion' THEN '1 medium'
    WHEN i.name = 'Sesame Seed' THEN '1 tbsp'
    WHEN i.name = 'Vegetable Oil' THEN '2 tbsp'
  END,
  CASE 
    WHEN i.name = 'Beef' THEN 1
    WHEN i.name = 'Soy Sauce' THEN 60
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Honey' THEN 2
    WHEN i.name = 'Sesame Oil' THEN 1
    WHEN i.name = 'Rice' THEN 2
    WHEN i.name = 'Bell Pepper' THEN 1
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Sesame Seed' THEN 1
    WHEN i.name = 'Vegetable Oil' THEN 2
  END,
  CASE 
    WHEN i.name IN ('Beef') THEN 'lb'
    WHEN i.name IN ('Soy Sauce', 'Honey', 'Sesame Oil', 'Vegetable Oil') THEN 'tbsp'
    WHEN i.name IN ('Garlic') THEN 'cloves'
    WHEN i.name IN ('Ginger', 'Sesame Seed') THEN 'tbsp'
    WHEN i.name IN ('Rice') THEN 'cups'
    WHEN i.name IN ('Bell Pepper', 'Onion') THEN 'medium'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
