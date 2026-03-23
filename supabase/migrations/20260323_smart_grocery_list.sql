-- Smart Grocery List: Meal Plan Shopping Contributions
-- This table tracks which meal plan entry contributed which quantity to which shopping list item.
-- Used for accurate removal when recipes are removed from meal plans.

CREATE TABLE IF NOT EXISTS meal_plan_shopping_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  shopping_list_id UUID NOT NULL REFERENCES shopping_list(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id),
  quantity_contributed NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate contributions
  UNIQUE(meal_plan_id, shopping_list_id, ingredient_id)
);

-- Index for fast lookups when removing from meal plan
CREATE INDEX IF NOT EXISTS idx_contributions_meal_plan ON meal_plan_shopping_contributions(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_contributions_shopping_list ON meal_plan_shopping_contributions(shopping_list_id);
