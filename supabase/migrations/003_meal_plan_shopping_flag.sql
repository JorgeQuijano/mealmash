-- Add shopping_list_added flag to meal_plans table
ALTER TABLE meal_plans 
ADD COLUMN IF NOT EXISTS shopping_list_added BOOLEAN DEFAULT FALSE;
