-- Add unit column to pantry_items table
ALTER TABLE pantry_items ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'pieces';
