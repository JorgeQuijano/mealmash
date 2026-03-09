-- Thai Coconut Curry Ramen
-- A fusion dish combining Japanese ramen with Thai coconut curry flavors

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Ramen Noodles', 'Coconut Milk', 'Chicken Stock', 'Chicken Breast', 'Bell Pepper', 'Onion', 'Garlic', 'Ginger', 'Soy Sauce', 'Curry Powder', 'Cilantro', 'Lime', 'Sesame Oil')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Thai Coconut Curry Ramen',
    'A rich and creamy ramen bowl featuring Thai-inspired coconut curry broth, tender chicken, and fresh vegetables. The perfect fusion of Japanese and Thai cuisines.',
    '[]'::jsonb,
    ARRAY[
      'Heat sesame oil in a large pot over medium-high heat',
      'Add diced onion and sauté until translucent, about 3 minutes',
      'Add minced garlic and ginger, cook for 1 minute until fragrant',
      'Stir in curry powder and cook for 30 seconds',
      'Add coconut milk and chicken stock, bring to a simmer',
      'Add chicken breast and cook for 15 minutes until cooked through',
      'Remove chicken, shred, and set aside',
      'Add sliced bell pepper to the broth and cook for 3 minutes',
      'Cook ramen noodles according to package instructions',
      'Divide noodles among bowls, top with shredded chicken',
      'Ladle hot curry broth over the noodles',
      'Garnish with fresh cilantro and a squeeze of lime',
      'Drizzle with soy sauce to taste'
    ],
    'dinner',
    ARRAY['Thai', 'Japanese'],
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
    WHEN i.name = 'Ramen Noodles' THEN '2 packs'
    WHEN i.name = 'Coconut Milk' THEN '1 can'
    WHEN i.name = 'Chicken Stock' THEN '2 cups'
    WHEN i.name = 'Chicken Breast' THEN '2 pieces'
    WHEN i.name = 'Bell Pepper' THEN '1 medium'
    WHEN i.name = 'Onion' THEN '1 large'
    WHEN i.name = 'Garlic' THEN '4 cloves'
    WHEN i.name = 'Ginger' THEN '1 inch'
    WHEN i.name = 'Soy Sauce' THEN '2 tbsp'
    WHEN i.name = 'Curry Powder' THEN '2 tbsp'
    WHEN i.name = 'Cilantro' THEN '1/4 cup'
    WHEN i.name = 'Lime' THEN '1 whole'
    WHEN i.name = 'Sesame Oil' THEN '2 tbsp'
  END,
  CASE 
    WHEN i.name = 'Ramen Noodles' THEN 2
    WHEN i.name = 'Coconut Milk' THEN 1
    WHEN i.name = 'Chicken Stock' THEN 2
    WHEN i.name = 'Chicken Breast' THEN 2
    WHEN i.name = 'Bell Pepper' THEN 1
    WHEN i.name = 'Onion' THEN 1
    WHEN i.name = 'Garlic' THEN 4
    WHEN i.name = 'Ginger' THEN 1
    WHEN i.name = 'Soy Sauce' THEN 2
    WHEN i.name = 'Curry Powder' THEN 2
    WHEN i.name = 'Cilantro' THEN 1
    WHEN i.name = 'Lime' THEN 1
    WHEN i.name = 'Sesame Oil' THEN 2
  END,
  CASE 
    WHEN i.name IN ('Ramen Noodles', 'Coconut Milk', 'Chicken Stock') THEN 'packs'
    WHEN i.name IN ('Chicken Breast', 'Bell Pepper', 'Onion', 'Lime') THEN 'pieces'
    WHEN i.name IN ('Garlic', 'Ginger') THEN 'cloves'
    WHEN i.name IN ('Soy Sauce', 'Curry Powder', 'Sesame Oil') THEN 'tbsp'
    WHEN i.name = 'Cilantro' THEN 'cups'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
