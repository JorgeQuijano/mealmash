-- Recipe: Thai Coconut Salmon with Lemongrass
-- Generated: 2026-03-08-03
-- Cuisine: Thai | Category: Dinner | Difficulty: Medium

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Salmon', 'Coconut Milk', 'Lemongrass', 'Ginger', 'Fish Sauce', 'Lime', 'Bell Pepper', 'Basil', 'Garlic', 'Onion', 'Sesame Oil', 'Brown Sugar')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Thai Coconut Salmon with Lemongrass',
    'A fragrant Thai-inspired dish featuring pan-seared salmon fillets in a creamy coconut curry broth infused with fresh lemongrass, ginger, and Thai basil. The perfect balance of spicy, sweet, and savory flavors.',
    '[]'::jsonb,
    ARRAY[
      'Trim lemongrass stalks and bruise with the back of a knife. Slice shallots and ginger thinly.',
      'Heat sesame oil in a large skillet over medium-high heat. Season salmon fillets with salt and pepper.',
      'Sear salmon skin-side up for 3-4 minutes until golden. Flip and cook 2 minutes more. Remove and set aside.',
      'In the same pan, sauté garlic, shallots, and ginger for 1 minute until fragrant.',
      'Add coconut milk, fish sauce, brown sugar, and lemongrass. Simmer for 8-10 minutes.',
      'Add sliced bell pepper and cook for 3 minutes until tender-crisp.',
      'Return salmon to the pan, spooning sauce over the fillets. Simmer for 3-4 minutes.',
      'Remove from heat and stir in fresh Thai basil. Squeeze lime juice over the top.',
      'Serve over jasmine rice, garnished with extra basil and sliced chilies if desired.'
    ],
    'dinner',
    ARRAY['Thai', 'Asian'],
    ARRAY['Gluten-Free'],
    'Medium',
    15, 25, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE i.name
    WHEN 'Salmon' THEN '4 fillets'
    WHEN 'Coconut Milk' THEN '2 cups'
    WHEN 'Lemongrass' THEN '2 stalks'
    WHEN 'Ginger' THEN '1 inch'
    WHEN 'Fish Sauce' THEN '2 tbsp'
    WHEN 'Lime' THEN '1 whole'
    WHEN 'Bell Pepper' THEN '1 medium'
    WHEN 'Basil' THEN '1 cup'
    WHEN 'Garlic' THEN '4 cloves'
    WHEN 'Onion' THEN '1 medium'
    WHEN 'Sesame Oil' THEN '2 tbsp'
    WHEN 'Brown Sugar' THEN '1 tbsp'
  END,
  CASE i.name
    WHEN 'Salmon' THEN 4
    WHEN 'Coconut Milk' THEN 2
    WHEN 'Lemongrass' THEN 2
    WHEN 'Ginger' THEN 1
    WHEN 'Fish Sauce' THEN 2
    WHEN 'Lime' THEN 1
    WHEN 'Bell Pepper' THEN 1
    WHEN 'Basil' THEN 1
    WHEN 'Garlic' THEN 4
    WHEN 'Onion' THEN 1
    WHEN 'Sesame Oil' THEN 2
    WHEN 'Brown Sugar' THEN 1
  END,
  CASE i.name
    WHEN 'Salmon' THEN 'fillets'
    WHEN 'Coconut Milk' THEN 'cups'
    WHEN 'Lemongrass' THEN 'stalks'
    WHEN 'Ginger' THEN 'inch'
    WHEN 'Fish Sauce' THEN 'tbsp'
    WHEN 'Lime' THEN 'whole'
    WHEN 'Bell Pepper' THEN 'medium'
    WHEN 'Basil' THEN 'cups'
    WHEN 'Garlic' THEN 'cloves'
    WHEN 'Onion' THEN 'medium'
    WHEN 'Sesame Oil' THEN 'tbsp'
    WHEN 'Brown Sugar' THEN 'tbsp'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
