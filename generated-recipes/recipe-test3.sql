-- Thai Coconut Curry Salmon
-- A aromatic Thai-inspired curry with salmon, coconut milk, and fresh vegetables

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Salmon', 'Coconut Milk', 'Ginger', 'Garlic', 'Bell Pepper', 'Onion', 'Curry Powder', 'Fish Sauce', 'Lime', 'Basil', 'Vegetable Stock', 'Brown Sugar')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Thai Coconut Curry Salmon',
    'A rich and aromatic Thai-inspired curry featuring tender salmon pieces simmered in creamy coconut milk with fresh vegetables, ginger, and aromatic spices. Perfectly balanced with tangy lime and fresh basil.',
    ARRAY[
      'Pat salmon fillets dry and cut into 1.5-inch pieces. Season lightly with salt.',
      'Heat vegetable oil in a large wok or deep skillet over medium-high heat.',
      'Add diced onion and cook until translucent, about 3 minutes.',
      'Add minced garlic and ginger, stir for 30 seconds until fragrant.',
      'Add curry powder and cook for 1 minute, stirring constantly to bloom the spices.',
      'Pour in coconut milk and vegetable stock, stir to combine.',
      'Add brown sugar and fish sauce, bring to a gentle simmer.',
      'Add sliced bell pepper and cook for 3-4 minutes until slightly tender.',
      'Gently add salmon pieces to the curry, spooning sauce over them.',
      'Simmer for 5-7 minutes until salmon is cooked through but still tender.',
      'Remove from heat, stir in fresh lime juice and lime zest.',
      'Garnish with fresh Thai basil leaves and serve over jasmine rice.'
    ],
    'dinner',
    ARRAY['Thai', 'Asian'],
    ARRAY['Gluten-Free', 'Dairy-Free'],
    'Medium',
    15, 25, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE 
    WHEN i.name = 'Salmon' THEN '1.5 lbs'
    WHEN i.name = 'Coconut Milk' THEN '2 cups'
    WHEN i.name = 'Bell Pepper' THEN '1 medium'
    WHEN i.name = 'Onion' THEN '1 large'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Ginger' THEN '2 inches'
    WHEN i.name = 'Curry Powder' THEN '2 tablespoons'
    WHEN i.name = 'Fish Sauce' THEN '2 tablespoons'
    WHEN i.name = 'Lime' THEN '1 whole'
    WHEN i.name = 'Basil' THEN '1 cup'
    WHEN i.name = 'Vegetable Stock' THEN '1 cup'
    WHEN i.name = 'Brown Sugar' THEN '1 tablespoon'
  END,
  CASE 
    WHEN i.name = 'Salmon' THEN 1
    WHEN i.name = 'Coconut Milk' THEN 2
    WHEN i.name = 'Bell Pepper' THEN 1
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Ginger' THEN 2
    WHEN i.name = 'Curry Powder' THEN 2
    WHEN i.name = 'Fish Sauce' THEN 2
    WHEN i.name = 'Lime' THEN 1
    WHEN i.name = 'Basil' THEN 1
    WHEN i.name = 'Vegetable Stock' THEN 1
    WHEN i.name = 'Brown Sugar' THEN 1
  END,
  CASE 
    WHEN i.name IN ('Salmon', 'Bell Pepper', 'Onion', 'Lime') THEN 'whole'
    WHEN i.name IN ('Coconut Milk', 'Vegetable Stock') THEN 'cups'
    WHEN i.name = 'Garlic' THEN 'cloves'
    WHEN i.name = 'Ginger' THEN 'inches'
    WHEN i.name = 'Curry Powder' THEN 'tablespoons'
    WHEN i.name = 'Fish Sauce' THEN 'tablespoons'
    WHEN i.name = 'Basil' THEN 'cups'
    WHEN i.name = 'Brown Sugar' THEN 'tablespoons'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
