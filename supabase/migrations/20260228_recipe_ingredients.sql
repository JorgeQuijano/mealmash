-- Migration: Create recipe_ingredients table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id),
  quantity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipe_ingredients all public" ON recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "recipe_ingredients all insert" ON recipe_ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "recipe_ingredients all update" ON recipe_ingredients FOR UPDATE USING (true);
CREATE POLICY "recipe_ingredients all delete" ON recipe_ingredients FOR DELETE USING (true);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);
