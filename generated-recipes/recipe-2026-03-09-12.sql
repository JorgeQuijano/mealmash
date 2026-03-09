-- Vietnamese Fresh Spring Rolls with Peanut Dipping Sauce
-- Category: lunch
-- Cuisine: Vietnamese
-- Difficulty: Easy

WITH ingredient_ids AS (
  SELECT id, name FROM ingredients 
  WHERE name IN ('Rice Noodle', 'Shrimp', 'Lettuce', 'Cucumber', 'Carrot', 'Mint', 'Cilantro', 'Rice Vinegar', 'Fish Sauce', 'Lime', 'Peanut Butter', 'Garlic', 'Sesame Oil', 'Sesame Seed')
),
recipe_insert AS (
  INSERT INTO recipes (
    name, description, ingredients, instructions, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url, created_at
  )
  VALUES (
    'Vietnamese Fresh Spring Rolls',
    'Light and refreshing rice paper rolls filled with plump shrimp, crisp vegetables, and fresh herbs, served with a creamy peanut dipping sauce. Perfect for summer lunches or as an appetizer.',
    '[]'::jsonb,
    ARRAY[
      'Bring a pot of water to boil. Add rice noodles and cook for 4-5 minutes until tender but still firm. Drain and rinse with cold water.',
      'Prepare the peanut dipping sauce: mix peanut butter, fish sauce, lime juice, a splash of warm water, minced garlic, and sesame oil. Stir until smooth. Garnish with sesame seeds.',
      'Cook shrimp in boiling water for 2-3 minutes until pink and curled. Drain and slice each shrimp in half lengthwise.',
      'Julienne the cucumber and carrot into thin strips.',
      'Fill a large bowl with warm water. Dip one rice paper wrapper for 5-10 seconds until softened but still slightly firm.',
      'Lay the softened wrapper flat on a damp cutting board. Layer lettuce leaves in the center, add a small handful of rice noodles, cucumber, carrots, mint leaves, and cilantro.',
      'Place 3-4 shrimp halves on top, with the pink side facing down.',
      'Fold the sides of the wrapper inward, then roll tightly from bottom to top. Place seam-side down on a plate.',
      'Repeat with remaining wrappers and ingredients.',
      'Serve spring rolls immediately with peanut dipping sauce on the side.'
    ],
    'lunch',
    ARRAY['Vietnamese'],
    ARRAY[]::text[],
    'Easy',
    30, 10, 4, '', NOW()
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_num, unit)
SELECT 
  ri.id,
  i.id,
  CASE i.name
    WHEN 'Rice Noodle' THEN '4 oz'
    WHEN 'Shrimp' THEN '12 large'
    WHEN 'Lettuce' THEN '4 leaves'
    WHEN 'Cucumber' THEN '1 small'
    WHEN 'Carrot' THEN '1 medium'
    WHEN 'Mint' THEN '1/4 cup'
    WHEN 'Cilantro' THEN '1/4 cup'
    WHEN 'Rice Vinegar' THEN '2 tbsp'
    WHEN 'Fish Sauce' THEN '2 tbsp'
    WHEN 'Lime' THEN '1 whole'
    WHEN 'Peanut Butter' THEN '3 tbsp'
    WHEN 'Garlic' THEN '2 cloves'
    WHEN 'Sesame Oil' THEN '1 tsp'
    WHEN 'Sesame Seed' THEN '1 tbsp'
  END,
  CASE i.name
    WHEN 'Rice Noodle' THEN 4
    WHEN 'Shrimp' THEN 12
    WHEN 'Lettuce' THEN 4
    WHEN 'Cucumber' THEN 1
    WHEN 'Carrot' THEN 1
    WHEN 'Mint' THEN 1
    WHEN 'Cilantro' THEN 1
    WHEN 'Rice Vinegar' THEN 2
    WHEN 'Fish Sauce' THEN 2
    WHEN 'Lime' THEN 1
    WHEN 'Peanut Butter' THEN 3
    WHEN 'Garlic' THEN 2
    WHEN 'Sesame Oil' THEN 1
    WHEN 'Sesame Seed' THEN 1
  END,
  CASE i.name
    WHEN 'Rice Noodle' THEN 'oz'
    WHEN 'Shrimp' THEN 'large'
    WHEN 'Lettuce' THEN 'leaves'
    WHEN 'Cucumber' THEN 'small'
    WHEN 'Carrot' THEN 'medium'
    WHEN 'Mint' THEN 'cup'
    WHEN 'Cilantro' THEN 'cup'
    WHEN 'Rice Vinegar' THEN 'tbsp'
    WHEN 'Fish Sauce' THEN 'tbsp'
    WHEN 'Lime' THEN 'whole'
    WHEN 'Peanut Butter' THEN 'tbsp'
    WHEN 'Garlic' THEN 'cloves'
    WHEN 'Sesame Oil' THEN 'tsp'
    WHEN 'Sesame Seed' THEN 'tbsp'
  END
FROM ingredient_ids i
CROSS JOIN recipe_insert ri;
