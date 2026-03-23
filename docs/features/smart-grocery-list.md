# Smart Grocery List with Automatic Ingredient Combining

## Feature Description

When recipes are added to a meal plan, their ingredients are added to the user's shopping list. If multiple recipes share the same ingredient, the shopping list should automatically consolidate them into a single entry with combined quantities, rather than showing duplicate lines.

**Example:**
- Recipe A needs: 2 cups Tomatoes
- Recipe B needs: 1 cup Tomatoes
- Current behavior: Two separate "Tomatoes" lines
- Desired behavior: One line showing "3 cups Tomatoes"

---

## Current State

**Relevant files to examine:**

- `src/app/api/meal-plans/route.ts` — handles adding/removing recipes from meal plan
- `src/app/shopping-list/page.tsx` — shopping list UI
- `src/components/meal-plan-shopping-modal.tsx` — modal for syncing meal plan to shopping list
- `src/app/api/ingredients/route.ts` — ingredient API
- `src/lib/supabase.ts` — database client

**Database tables to understand:**

- `shopping_list` — columns: id, user_id, item_name, quantity, unit, is_checked, ingredient_id, created_at, purchased_at
- `meal_plans` — columns: id, user_id, recipe_id, planned_date, meal_type
- `recipes` — columns: id, name, etc.
- `recipe_ingredients` — columns: id, recipe_id, ingredient_id, quantity
- `ingredients` — columns: id, name, category

---

## Requirements

### 1. Ingredient Matching Logic

- When adding ingredients to the shopping list, check if an item with the same `ingredient_id` already exists for that user
- If `ingredient_id` exists on both, treat them as the same ingredient even if `item_name` differs slightly
- If no `ingredient_id` match, fall back to matching by `item_name` (case-insensitive, trimmed)
- Consolidate quantities when matches are found

### 2. Quantity Combining

- Quantities with the **same unit** should be added numerically
  - `2 cups` + `1 cup` = `3 cups`
  - `500g` + `250g` = `750g`
- Quantities with **different units** should NOT be combined (too error-prone without a full unit conversion system)
  - `2 cups` + `1 lb` should remain as two separate lines
- For unit-less quantities (e.g., "1 whole tomato"), treat "pieces" or "whole" as the default unit

### 3. Handling Missing `ingredient_id`

- Some pantry items may be added without an `ingredient_id` (free-text entries)
- These should still be matched by name against items that DO have an `ingredient_id`
- The reverse is also true: items with `ingredient_id` should be matched against free-text items by name

### 4. API Changes

Modify the shopping list add logic to:

```
For each ingredient being added:
  1. Try to find existing shopping_list item with same ingredient_id
  2. If not found, try to find by matching item_name
  3. If found with same unit: add quantities
  4. If found with different unit: create new line
  5. If not found: insert new line
```

### 5. Removing from Meal Plan

- When a recipe is removed from the meal plan, its ingredients should be removed from the shopping list
- Only remove the portion of an ingredient that was contributed by that specific recipe
- If after removing, an ingredient's quantity would go to 0 or negative, delete the shopping list entry
- Handle gracefully if some ingredients were already consolidated with others

### 6. Edge Cases

- User adds same recipe twice to meal plan: quantities should accumulate correctly
- User manually adds an ingredient to shopping list that overlaps with a recipe ingredient: should consolidate
- Ingredient with quantity "to taste" or empty quantity: treat as quantity "1"
- Duplicate prevention: don't add the same ingredient twice from the same recipe to the same meal plan

---

## Suggested Implementation Approach

1. Create a utility function `combineIngredients(existingItems, newItems)` that handles the matching and consolidation logic
2. Apply this function wherever ingredients are added to the shopping list (meal plan sync, manual add, recipe add)
3. Write a database migration if needed to handle any schema changes
4. The shopping list UI should show the combined quantity immediately after consolidation

---

## Success Criteria

- [ ] Adding 2 recipes that both need "Tomatoes" results in one line with combined quantity
- [ ] Recipes needing "2 cups Tomatoes" and "1 lb Tomatoes" remain as separate lines
- [ ] Removing a recipe from meal plan correctly reduces (or removes) its contribution from shopping list
- [ ] Manually added ingredients consolidate with recipe ingredients correctly
- [ ] No duplicate ingredient entries in shopping list after multiple recipe additions

---

## Notes

- Keep the consolidation logic in a shared utility function to avoid code duplication
- Consider adding a `source_recipe_id` or `contribution` field to track how much each recipe contributed, to make removal accurate
- For MVP, unit conversion can wait — same-unit consolidation is the priority
