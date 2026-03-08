-- Thai Basil Chicken (Pad Gaprow) - A fiery, aromatic Thai street food classic
-- Generated: 2026-03-08-13

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Chicken Breast', 'Basil', 'Garlic', 'Bell Pepper', 'Onion', 'Soy Sauce', 'Fish Sauce', 'Oyster Sauce', 'Sugar', 'Jalapeño', 'Egg')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Thai Basil Chicken (Pad Gaprow)',
    'A fiery Thai street food classic featuring tender chicken wok-tossed with aromatic holy basil, crisp vegetables, and a savory-sweet sauce. This fast-cooking dish delivers bold flavors with minimal fuss.',
    '[]'::jsonb,
    ARRAY[
      'Mince the chicken breast finely or use ground chicken for authentic texture.',
      'Mince garlic and slice the jalapeño. Dice bell pepper and onion into bite-sized pieces.',
      'Heat wok or large skillet over high heat. Add 2 tablespoons oil and swirl to coat.',
      'Add garlic and jalapeño, stir-fry for 30 seconds until fragrant.',
      'Add chicken, breaking apart. Cook for 3-4 minutes until no longer pink.',
      'Add bell pepper and onion, stir-fry for 2 minutes.',
      'Add soy sauce, fish sauce, oyster sauce, and sugar. Toss to combine.',
      'Remove from heat and fold in fresh basil leaves until wilted.',
      'Serve immediately over jasmine rice with a fried egg on top.',
      'Garnish with extra chilies and fresh basil leaves.'
    ],
    'dinner',
    ARRAY['Thai', 'Asian'],
    ARRAY[]::text[],
    'Medium',
    15, 15, 2, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN '300g'
    WHEN i.name = 'Basil' THEN '1 cup'
    WHEN i.name = 'Garlic' THEN '6 cloves'
    WHEN i.name = 'Bell Pepper' THEN '1 medium'
    WHEN i.name = 'Onion' THEN '1 small'
    WHEN i.name = 'Soy Sauce' THEN '2 tbsp'
    WHEN i.name = 'Fish Sauce' THEN '1 tbsp'
    WHEN i.name = 'Oyster Sauce' THEN '1 tbsp'
    WHEN i.name = 'Sugar' THEN '1 tsp'
    WHEN i.name = 'Jalapeño' THEN '2-4'
    WHEN i.name = 'Egg' THEN '2'
  END,
  CASE 
    WHEN i.name = 'Chicken Breast' THEN 300
    WHEN i.name = 'Basil' THEN 1
    WHEN i.name = 'Garlic' THEN 6
    WHEN i.name = 'Bell Pepper' THEN 1
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Soy Sauce' THEN 2
    WHEN i.name = 'Fish Sauce' THEN 1
    WHEN i.name = 'Oyster Sauce' THEN 1
    WHEN i.name = 'Sugar' THEN 1
    WHEN i.name = 'Jalapeño' THEN 3
    WHEN i.name = 'Egg' THEN 2
  END,
  CASE 
    WHEN i.name IN ('Chicken Breast', 'Basil') THEN 'cups'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name IN ('Bell Pepper', 'Onion', 'Jalapeño', 'Egg') THEN 'medium'
    ELSE 'tbsp'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
