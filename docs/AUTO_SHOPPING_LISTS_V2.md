# Auto-Shopping Lists - Technical Implementation Plan

## Overview
Auto-generate shopping lists from recipes or meal plans by aggregating ingredients.

---

## Option A: Simple Approach (Recommended)
Use existing database structure - fetch recipe ingredients and aggregate them.

### How It Works
1. User clicks "Generate from Recipes" or "From Meal Plan"
2. System fetches all recipe ingredients for selected recipes (or user's meal plan)
3. System aggregates duplicate ingredients (e.g., 2 recipes need onions → combine to total)
4. System inserts aggregated items into `shopping_items` table

### What We Need

#### 1. Component: ShoppingListGenerator
**File:** `src/components/shopping-list-generator.tsx`

```tsx
interface Props {
  isPro: boolean;
  onGenerateFromRecipes: () => void;
  onGenerateFromMealPlan: () => void;
}

// Shows paywall for free users, buttons for Pro users
```

#### 2. Component: RecipeSelector Dialog
**File:** `src/components/recipe-selector.tsx`

```tsx
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (recipeIds: string[]) => void;
}

// Checkbox list of user's recipes to select from
```

#### 3. Utility: Ingredient Aggregation
**File:** `src/lib/shopping-list.ts`

```typescript
// Fetch recipe ingredients and aggregate
export async function generateFromRecipes(userId: string, recipeIds: string[]): Promise<AggregatedIngredient[]>

// Fetch meal plan recipes and aggregate
export async function generateFromMealPlan(userId: string): Promise<AggregatedIngredient[]>
```

---

## Database Requirements

### Current Tables (Already Exist)
- `recipes` - has `recipe_ingredients` relation
- `recipe_ingredients` - links recipes to ingredients with quantity
- `ingredients` - master ingredient list
- `shopping_items` - user's shopping list

### No New Tables Needed!
We just need to query existing data.

---

## Implementation Steps

### Step 1: Add Checkbox UI Component
Create missing `checkbox.tsx`:

```tsx
// src/components/ui/checkbox.tsx
// Standard shadcn/ui checkbox component
```

### Step 2: Create ShoppingListGenerator Component
```tsx
// Pro paywall UI
// Two buttons: "From Recipes" and "From Meal Plan"
```

### Step 3: Create RecipeSelector Dialog
```tsx
// Dialog with checkbox list of recipes
// Fetch from Supabase: recipes table
// Return selected recipe IDs
```

### Step 4: Create Aggregation Logic
```typescript
// Query recipe_ingredients with ingredients join
// Group by ingredient name (lowercase)
// Sum quantities
// Return aggregated list
```

### Step 5: Add to Shopping List Page
```tsx
// Import ShoppingListGenerator
// Add to page with proper isPro check
// Hook up handlers to call aggregation + insert
```

---

## Key Technical Details

### Aggregation Logic
```typescript
// Example:
// Recipe 1: 2 onions
// Recipe 2: 1 onion
// Result: 3 onions

const aggregated = new Map();
for (const ri of recipeIngredients) {
  const key = ri.ingredients.name.toLowerCase();
  if (aggregated.has(key)) {
    aggregated.get(key).quantity += ri.quantity;
  } else {
    aggregated.set(key, { ... });
  }
}
```

### Unit Handling
Currently ingredients use various units (cups, tbsp, pieces). For MVP:
- Display raw quantity without conversion
- Or use simplified conversion table

### Paywall
- Free users: See "Upgrade to Pro" banner
- Pro users: Full access

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/ui/checkbox.tsx` | Create |
| `src/components/shopping-list-generator.tsx` | Create |
| `src/components/recipe-selector.tsx` | Create |
| `src/lib/shopping-list.ts` | Create |
| `src/app/shopping-list/page.tsx` | Modify - add generator |

---

## Time Estimate
- Checkbox component: 15 min
- ShoppingListGenerator: 20 min
- RecipeSelector: 30 min
- Aggregation logic: 30 min
- Integration: 15 min

**Total: ~1.5 hours**
