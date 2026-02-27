-- Phase 2 Database Tables

-- Pantry Items Table
CREATE TABLE IF NOT EXISTS pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  quantity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping List Table
CREATE TABLE IF NOT EXISTS shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity TEXT,
  is_checked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users manage own pantry" ON pantry_items;
CREATE POLICY "Users manage own pantry" ON pantry_items FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own shopping" ON shopping_list;
CREATE POLICY "Users manage own shopping" ON shopping_list FOR ALL USING (auth.uid() = user_id);

-- Add some common pantry categories
-- This is just for reference, data will be stored in the table
COMMENT ON COLUMN pantry_items.category IS 'Categories: Produce, Dairy, Meat, Seafood, Grains, Spices, Condiments, Frozen, Canned, Other';
