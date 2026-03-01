-- ============================================================
-- MealMash Recipe Normalization SQL
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- STEP 1: Drop the old ingredients JSONB column from recipes
-- This removes the deprecated JSON ingredients format
ALTER TABLE recipes DROP COLUMN IF EXISTS ingredients;

-- ============================================================
-- STEP 2: Delete existing recipe_ingredients to start fresh
-- ============================================================
DELETE FROM recipe_ingredients;

-- ============================================================
-- STEP 3: Insert 10 normalized recipes
-- ============================================================

-- Recipe 1: Classic Spaghetti Carbonara
INSERT INTO recipes (name, description, category, prep_time_minutes, cook_time_minutes, servings) 
VALUES ('Classic Spaghetti Carbonara', 'Creamy Italian pasta with crispy pancetta and parmesan', 'dinner', 10, 20, 4);

-- Recipe 2: Classic Pancakes
INSERT INTO recipes (name, description, category, prep_time_minutes, cook_time_minutes, servings) 
VALUES ('Classic Pancakes', 'Fluffy American-style pancakes perfect for weekend breakfast', 'breakfast', 10, 15, 4);

-- Recipe 3: Chicken Caesar Salad
INSERT INTO recipes (name, description, category, prep_time_minutes, cook_time_minutes, servings) 
VALUES ('Chicken Caesar Salad', 'Classic Caesar salad with grilled chicken breast', 'lunch', 15, 15, 2);

-- Recipe 4: Beef Tacos
INSERT INTO recipes (name, description, category, prep_time_minutes, cook_time_minutes, servings) 
VALUES ('Beef Tacos', 'Seasoned ground beef tacos with fresh toppings', 'dinner', 15, 15, 4);

-- Recipe 5: Grilled Salmon
INSERT INTO recipes (name, description, category, prep_time_minutes, cook_time_minutes, servings) 
VALUES ('Grilled Salmon', 'Simple grilled salmon with lemon and dill', 'dinner', 10, 15, 4);

-- Recipe 6: Chicken Stir Fry
INSERT INTO recipes (name, description, category, prep_time_minutes, cook_time_minutes, servings) 
VALUES ('Chicken Stir Fry', 'Quick and healthy chicken stir fry with vegetables', 'dinner', 15, 15, 4);

-- Recipe 7: Mushroom Risotto
INSERT INTO recipes (name, description, category, prep_time_minutes, cook_time_minutes, servings) 
VALUES ('Mushroom Risotto', 'Creamy Italian risotto with mushrooms and parmesan', 'dinner', 10, 30, 4);

-- Recipe 8: Vegetable Curry
INSERT INTO recipes (name, description, category, prep_time_minutes, cook_time_minutes, servings) 
VALUES ('Vegetable Curry', 'Hearty vegetable curry with coconut milk', 'dinner', 15, 25, 4);

-- Recipe 9: Guacamole
INSERT INTO recipes (name, description, category, prep_time_minutes, cook_time_minutes, servings) 
VALUES ('Guacamole', 'Fresh and zesty Mexican avocado dip', 'snack', 10, 0, 6);

-- Recipe 10: Banana Bread
INSERT INTO recipes (name, description, category, prep_time_minutes, cook_time_minutes, servings) 
VALUES ('Banana Bread', 'Moist homemade banana bread', 'dessert', 15, 60, 8);

-- ============================================================
-- STEP 4: Insert recipe_ingredients for all 10 recipes
-- ============================================================

-- Carbonara ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '400g' FROM recipes r, ingredients i 
WHERE r.name = 'Classic Spaghetti Carbonara' AND i.name = 'Pasta';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '200g' FROM recipes r, ingredients i 
WHERE r.name = 'Classic Spaghetti Carbonara' AND i.name = 'Bacon';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '4' FROM recipes r, ingredients i 
WHERE r.name = 'Classic Spaghetti Carbonara' AND i.name = 'Egg';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '100g' FROM recipes r, ingredients i 
WHERE r.name = 'Classic Spaghetti Carbonara' AND i.name = 'Parmesan';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, 'to taste' FROM recipes r, ingredients i 
WHERE r.name = 'Classic Spaghetti Carbonara' AND i.name = 'Black Pepper';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, 'to taste' FROM recipes r, ingredients i 
WHERE r.name = 'Classic Spaghetti Carbonara' AND i.name = 'Salt';

-- Pancakes ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2 cups' FROM recipes r, ingredients i 
WHERE r.name = 'Classic Pancakes' AND i.name = 'Flour';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2' FROM recipes r, ingredients i 
WHERE r.name = 'Classic Pancakes' AND i.name = 'Egg';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '1.5 cups' FROM recipes r, ingredients i 
WHERE r.name = 'Classic Pancakes' AND i.name = 'Milk';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2 tbsp' FROM recipes r, ingredients i 
WHERE r.name = 'Classic Pancakes' AND i.name = 'Sugar';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '0.5 tsp' FROM recipes r, ingredients i 
WHERE r.name = 'Classic Pancakes' AND i.name = 'Salt';

-- Chicken Caesar Salad ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2' FROM recipes r, ingredients i 
WHERE r.name = 'Chicken Caesar Salad' AND i.name = 'Chicken Breast';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '1 head' FROM recipes r, ingredients i 
WHERE r.name = 'Chicken Caesar Salad' AND i.name = 'Lettuce';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '50g' FROM recipes r, ingredients i 
WHERE r.name = 'Chicken Caesar Salad' AND i.name = 'Parmesan';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2 tbsp' FROM recipes r, ingredients i 
WHERE r.name = 'Chicken Caesar Salad' AND i.name = 'Olive Oil';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, 'to taste' FROM recipes r, ingredients i 
WHERE r.name = 'Chicken Caesar Salad' AND i.name = 'Black Pepper';

-- Beef Tacos ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '500g' FROM recipes r, ingredients i 
WHERE r.name = 'Beef Tacos' AND i.name = 'Ground Beef';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '8 shells' FROM recipes r, ingredients i 
WHERE r.name = 'Beef Tacos' AND i.name = 'Tortilla';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '1 cup' FROM recipes r, ingredients i 
WHERE r.name = 'Beef Tacos' AND i.name = 'Cheddar';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '0.5 head' FROM recipes r, ingredients i 
WHERE r.name = 'Beef Tacos' AND i.name = 'Lettuce';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2' FROM recipes r, ingredients i 
WHERE r.name = 'Beef Tacos' AND i.name = 'Tomato';

-- Grilled Salmon ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '4 fillets' FROM recipes r, ingredients i 
WHERE r.name = 'Grilled Salmon' AND i.name = 'Salmon';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2' FROM recipes r, ingredients i 
WHERE r.name = 'Grilled Salmon' AND i.name = 'Lemon';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '3 cloves' FROM recipes r, ingredients i 
WHERE r.name = 'Grilled Salmon' AND i.name = 'Garlic';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2 tbsp' FROM recipes r, ingredients i 
WHERE r.name = 'Grilled Salmon' AND i.name = 'Olive Oil';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, 'to taste' FROM recipes r, ingredients i 
WHERE r.name = 'Grilled Salmon' AND i.name = 'Salt';

-- Chicken Stir Fry ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '500g' FROM recipes r, ingredients i 
WHERE r.name = 'Chicken Stir Fry' AND i.name = 'Chicken Breast';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2 cups' FROM recipes r, ingredients i 
WHERE r.name = 'Chicken Stir Fry' AND i.name = 'Broccoli';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2' FROM recipes r, ingredients i 
WHERE r.name = 'Chicken Stir Fry' AND i.name = 'Bell Pepper';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '3 cloves' FROM recipes r, ingredients i 
WHERE r.name = 'Chicken Stir Fry' AND i.name = 'Garlic';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2 cups' FROM recipes r, ingredients i 
WHERE r.name = 'Chicken Stir Fry' AND i.name = 'Rice';

-- Mushroom Risotto ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '300g' FROM recipes r, ingredients i 
WHERE r.name = 'Mushroom Risotto' AND i.name = 'Arborio Rice';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '200g' FROM recipes r, ingredients i 
WHERE r.name = 'Mushroom Risotto' AND i.name = 'Mushroom';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '1' FROM recipes r, ingredients i 
WHERE r.name = 'Mushroom Risotto' AND i.name = 'Onion';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '50g' FROM recipes r, ingredients i 
WHERE r.name = 'Mushroom Risotto' AND i.name = 'Parmesan';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2 tbsp' FROM recipes r, ingredients i 
WHERE r.name = 'Mushroom Risotto' AND i.name = 'Butter';

-- Vegetable Curry ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2' FROM recipes r, ingredients i 
WHERE r.name = 'Vegetable Curry' AND i.name = 'Potato';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '1 head' FROM recipes r, ingredients i 
WHERE r.name = 'Vegetable Curry' AND i.name = 'Cauliflower';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '1 can' FROM recipes r, ingredients i 
WHERE r.name = 'Vegetable Curry' AND i.name = 'Coconut';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '1' FROM recipes r, ingredients i 
WHERE r.name = 'Vegetable Curry' AND i.name = 'Onion';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2 cups' FROM recipes r, ingredients i 
WHERE r.name = 'Vegetable Curry' AND i.name = 'Rice';

-- Guacamole ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '3' FROM recipes r, ingredients i 
WHERE r.name = 'Guacamole' AND i.name = 'Avocado';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '1' FROM recipes r, ingredients i 
WHERE r.name = 'Guacamole' AND i.name = 'Lime';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '0.5' FROM recipes r, ingredients i 
WHERE r.name = 'Guacamole' AND i.name = 'Onion';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2' FROM recipes r, ingredients i 
WHERE r.name = 'Guacamole' AND i.name = 'Tomato';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, 'to taste' FROM recipes r, ingredients i 
WHERE r.name = 'Guacamole' AND i.name = 'Salt';

-- Banana Bread ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '3' FROM recipes r, ingredients i 
WHERE r.name = 'Banana Bread' AND i.name = 'Banana';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '0.33 cup' FROM recipes r, ingredients i 
WHERE r.name = 'Banana Bread' AND i.name = 'Butter';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '0.75 cup' FROM recipes r, ingredients i 
WHERE r.name = 'Banana Bread' AND i.name = 'Sugar';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '1' FROM recipes r, ingredients i 
WHERE r.name = 'Banana Bread' AND i.name = 'Egg';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) 
SELECT r.id, i.id, '2 cups' FROM recipes r, ingredients i 
WHERE r.name = 'Banana Bread' AND i.name = 'Flour';

-- ============================================================
-- STEP 5: Verify the normalized data
-- ============================================================
SELECT r.name, i.name as ingredient, ri.quantity 
FROM recipe_ingredients ri
JOIN recipes r ON r.id = ri.recipe_id
JOIN ingredients i ON i.id = ri.ingredient_id
ORDER BY r.name, i.name;
