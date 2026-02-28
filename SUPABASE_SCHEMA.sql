-- MealMash Database Schema
-- Run this in Supabase SQL Editor

-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes (admin-created, visible to all users)
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  instructions TEXT[],
  category TEXT CHECK (category IN ('breakfast', 'lunch', 'dinner', 'snack', 'dessert')),
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER DEFAULT 2,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Favorites
CREATE TABLE user_favorites (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, recipe_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Public read for recipes
CREATE POLICY "Recipes are public" ON recipes FOR SELECT USING (true);
CREATE POLICY "Admins can manage recipes" ON recipes FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can read other profiles" ON user_profiles FOR SELECT USING (true);

-- Favorites policies
CREATE POLICY "Users manage own favorites" ON user_favorites FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Meal plans table
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own meal plans" ON meal_plans FOR ALL USING (auth.uid() = user_id);

-- Sample Recipes (optional - for testing)
INSERT INTO recipes (name, description, ingredients, instructions, category, prep_time_minutes, cook_time_minutes, servings) VALUES
(
  'Classic Spaghetti Carbonara',
  'Creamy Italian pasta with crispy pancetta and parmesan',
  '["400g spaghetti", "200g pancetta or guanciale", "4 large eggs", "100g parmesan cheese, grated", "Freshly ground black pepper", "Salt"]',
  ARRAY['Bring a large pot of salted water to boil and cook spaghetti according to package directions', 'Cut pancetta into small cubes and fry in a large pan until crispy', 'In a bowl, whisk together eggs, parmesan, and plenty of black pepper', 'Reserve 1 cup pasta water, then drain pasta', 'Add hot pasta to pancetta pan (off heat) and quickly toss with egg mixture', 'Add pasta water as needed for creamy consistency', 'Serve immediately with extra parmesan and pepper'],
  'dinner',
  10,
  20,
  4
),
(
  'Avocado Toast with Eggs',
  'Healthy and delicious breakfast favorite',
  '["2 slices sourdough bread", "1 ripe avocado", "2 eggs", "Cherry tomatoes", "Red pepper flakes", "Salt and pepper", "Lemon juice"]',
  ARRAY['Toast the bread until golden', 'Mash avocado with lemon juice, salt, and pepper', 'Fry or poach eggs to your liking', 'Spread avocado on toast', 'Top with eggs and cherry tomatoes', 'Season with red pepper flakes'],
  'breakfast',
  5,
  10,
  1
),
(
  'Chocolate Chip Cookies',
  'Classic homemade cookies - crispy on outside, chewy inside',
  '["225g butter, softened", "200g brown sugar", "100g white sugar", "2 eggs", "1 tsp vanilla extract", "280g all-purpose flour", "1 tsp baking soda", "1 tsp salt", "300g chocolate chips"]',
  ARRAY['Preheat oven to 375°F (190°C)', 'Cream butter and sugars until light and fluffy', 'Beat in eggs and vanilla', 'Mix flour, baking soda, and salt in separate bowl', 'Gradually add dry ingredients to wet mixture', 'Stir in chocolate chips', 'Drop rounded tablespoons onto baking sheets', 'Bake for 9-11 minutes until golden', 'Cool on baking sheet for 5 minutes'],
  'dessert',
  15,
  11,
  24
);

-- Ingredients library (global, standardized)
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  aliases TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update pantry_items to reference ingredient
ALTER TABLE pantry_items ADD COLUMN IF NOT EXISTS ingredient_id UUID REFERENCES ingredients(id);

-- Enable RLS for ingredients
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ingredients are public read" ON ingredients FOR SELECT USING (true);

-- Function to search ingredients
CREATE OR REPLACE FUNCTION search_ingredients(query_text TEXT)
RETURNS TABLE(id UUID, name TEXT, category TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.name, i.category
  FROM ingredients i
  WHERE i.name ILIKE '%' || query_text || '%'
     OR EXISTS (SELECT 1 FROM unnest(i.aliases) a WHERE a ILIKE '%' || query_text || '%')
  ORDER BY i.name
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
