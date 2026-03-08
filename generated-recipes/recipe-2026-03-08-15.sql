-- Recipe: Teriyaki Glazed Salmon with Sesame Crusted Rice
-- Cuisine: Japanese
-- Category: Dinner
-- Difficulty: Medium

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Salmon', 'Rice', 'Soy Sauce', 'Mirin', 'Sake', 'Ginger', 'Garlic', 'Sesame Seeds', 'Green Onion', 'Honey', 'Sesame Oil', 'Brown Sugar')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Teriyaki Glazed Salmon with Sesame Crusted Rice',
    'Perfectly pan-seared salmon fillets glazed with a rich, glossy teriyaki sauce made from soy sauce, mirin, and honey, served over fluffy rice coated in toasted sesame seeds. This dish combines the buttery richness of salmon with the umami depth of Japanese-inspired flavors.',
    '[]'::jsonb,
    ARRAY[
      'Rinse rice thoroughly until water runs clear, then cook according to package instructions',
      'While rice cooks, prepare the teriyaki sauce by combining soy sauce, mirin, sake, honey, and brown sugar in a small saucepan',
      'Bring teriyaki sauce to a gentle simmer and cook until slightly thickened, about 5 minutes',
      'Pat salmon fillets dry with paper towels and season lightly with salt',
      'Heat sesame oil in a large skillet over medium-high heat until shimmering',
      'Place salmon skin-side up and sear for 3-4 minutes until golden brown',
      'Flip salmon and cook for another 2-3 minutes',
      'Pour teriyaki sauce over salmon and let it glaze the fillets, basting occasionally for 1-2 minutes',
      'Toast sesame seeds in a dry pan until fragrant, about 2 minutes',
      'Fluff cooked rice and toss with toasted sesame seeds and finely sliced green onions',
      'Serve salmon over sesame rice, drizzle with remaining teriyaki glaze from the pan',
      'Garnish with pickled ginger, extra green onions, and a sprinkle of sesame seeds'
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
    WHEN i.name = 'Salmon' THEN '2 fillets'
    WHEN i.name = 'Rice' THEN '1 cup'
    WHEN i.name = 'Soy Sauce' THEN '1/4 cup'
    WHEN i.name = 'Mirin' THEN '3 tbsp'
    WHEN i.name = 'Sake' THEN '2 tbsp'
    WHEN i.name = 'Ginger' THEN '1 inch'
    WHEN i.name = 'Garlic' THEN '2 cloves'
    WHEN i.name = 'Sesame Seeds' THEN '3 tbsp'
    WHEN i.name = 'Green Onion' THEN '3 stalks'
    WHEN i.name = 'Honey' THEN '2 tbsp'
    WHEN i.name = 'Sesame Oil' THEN '2 tbsp'
    WHEN i.name = 'Brown Sugar' THEN '2 tbsp'
  END,
  CASE 
    WHEN i.name = 'Salmon' THEN 2
    WHEN i.name = 'Rice' THEN 1
    WHEN i.name = 'Soy Sauce' THEN 1
    WHEN i.name = 'Mirin' THEN 3
    WHEN i.name = 'Sake' THEN 2
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Garlic' THEN 2
    WHEN i.name = 'Sesame Seeds' THEN 3
    WHEN i.name = 'Green Onion' THEN 3
    WHEN i.name = 'Honey' THEN 2
    WHEN i.name = 'Sesame Oil' THEN 2
    WHEN i.name = 'Brown Sugar' THEN 2
  END,
  CASE 
    WHEN i.name = 'Salmon' THEN 'fillets'
    WHEN i.name = 'Rice' THEN 'cup'
    WHEN i.name = 'Soy Sauce' THEN 'cup'
    WHEN i.name = 'Mirin' THEN 'tbsp'
    WHEN i.name = 'Sake' THEN 'tbsp'
    WHEN i.name = 'Ginger' THEN 'inch'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Sesame Seeds' THEN 'tbsp'
    WHEN i.name = 'Green Onion' THEN 'stalks'
    WHEN i.name = 'Honey' THEN 'tbsp'
    WHEN i.name = 'Sesame Oil' THEN 'tbsp'
    WHEN i.name = 'Brown Sugar' THEN 'tbsp'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
