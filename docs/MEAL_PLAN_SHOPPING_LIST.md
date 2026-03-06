# Meal Plan to Shopping List - Technical Plan

## Overview
Add a button to the meal plan page that generates a shopping list by:
1. Letting user select date range (week, 2 weeks, weekend, custom)
2. Fetching all recipes in that date range
3. Getting all ingredients needed
4. Comparing with user's pantry
5. Adding only missing items to shopping list

---

## Data Structures

### Current Tables
```
meal_plans
├── id (uuid)
├── user_id (uuid)
├── recipe_id (uuid)
├── planned_date (date)
└── meal_type (breakfast/lunch/dinner/snack/dessert)

pantry_items
├── id (uuid)
├── user_id (uuid)
├── name (string)
├── quantity (string)
└── ingredient_id (uuid)

recipe_ingredients
├── recipe_id (uuid)
├── ingredient_id (uuid)
├── quantity (string)
└── quantity_num (number)

ingredients
├── id (uuid)
└── name (string)
```

---

## UI Design

### Option A: Simple Date Range Selector
```
┌─────────────────────────────────────┐
│  Add to Shopping List        [▼]   │  ← Button with dropdown
│  ┌─────────────────────────────┐   │
│  │ This Week (Mon-Sun)         │   │
│  │ Next Week                   │   │
│  │ This Weekend (Sat-Sun)      │   │
│  │ Custom Range...             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Option B: Modal with Preview
```
┌─────────────────────────────────────┐
│  Generate Shopping List              │
├─────────────────────────────────────┤
│  Date Range:                        │
│  [This Week ▼]                      │
│                                     │
│  Preview:                           │
│  • Chicken Breast (2 recipes)       │
│  • Rice                            │
│  • Tomatoes (you have 1) ← crossed  │
│  • Onions                          │
│                                     │
│  [Cancel]  [Add 8 Items to List]   │
└─────────────────────────────────────┘
```

### Recommendation: Option B
Shows user what's missing vs what they have, builds trust.

---

## Implementation

### Step 1: Add Button to Meal Plan Page
**File:** `src/app/meal-plan/page.tsx`

```tsx
// Add state for the modal
const [showShoppingModal, setShowShoppingModal] = useState(false)

// Add button in UI
<Button onClick={() => setShowShoppingModal(true)}>
  🛒 Add to Shopping List
</Button>
```

### Step 2: Create ShoppingListGenerator Modal
**File:** `src/components/meal-plan-shopping-modal.tsx`

```tsx
interface Props {
  userId: string;
  mealPlans: MealPlan[];
  onClose: () => void;
}

interface DateRangeOption {
  label: string;
  getDates: () => { start: Date; end: Date };
}

// Predefined options
const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  {
    label: 'This Week (Mon-Sun)',
    getDates: () => { /* current week */ }
  },
  {
    label: 'Next Week',
    getDates: () => { /* next week */ }
  },
  {
    label: 'This Weekend (Sat-Sun)',
    getDates: () => { /* weekend */ }
  },
  {
    label: 'Next 2 Weeks',
    getDates: () => { /* 14 days */ }
  },
];
```

### Step 3: Fetch & Aggregate Logic

```tsx
// 1. Get recipes in date range
const getMealPlanRecipes = async (userId: string, startDate: string, endDate: string) => {
  const { data } = await supabase
    .from('meal_plans')
    .select('recipe_id, recipes(*)')
    .eq('user_id, userId)
    .gte('planned_date', startDate)
    .lte('planned_date', endDate);
  return data;
};

// 2. Get all ingredients for those recipes
const getRecipeIngredients = async (recipeIds: string[]) => {
  const { data } = await supabase
    .from('recipe_ingredients')
    .select('quantity, quantity_num, ingredients(*)')
    .in('recipe_id', recipeIds);
  return data;
};

// 3. Get user's pantry
const getPantryItems = async (userId: string) => {
  const { data } = await supabase
    .from('pantry_items')
    .select('name, ingredient_id')
    .eq('user_id', userId);
  return data;
};

// 4. Aggregate & compare
const generateShoppingList = (recipeIngredients, pantryItems) => {
  const pantryNames = new Set(pantryItems.map(p => p.name.toLowerCase()));
  
  const needed = [];
  for (const ri of recipeIngredients) {
    const ingName = ri.ingredients.name.toLowerCase();
    if (!pantryNames.has(ingName)) {
      // Aggregate duplicates
      const existing = needed.find(n => n.name.toLowerCase() === ingName);
      if (existing) {
        existing.quantity += ri.quantity_num || 1;
      } else {
        needed.push({
          name: ri.ingredients.name,
          quantity: ri.quantity_num || 1,
          unit: ri.unit,
        });
      }
    }
  }
  return needed;
};
```

### Step 4: Insert to Shopping List

```tsx
const addToShoppingList = async (items: ShoppingItem[]) => {
  for (const item of items) {
    await supabase.from('shopping_list').insert({
      user_id: userId,
      item_name: item.name,
      quantity: item.quantity.toString(),
      ingredient_id: item.ingredient_id,
      is_checked: false,
    });
  }
};
```

---

## Date Range Options

| Option | Description |
|--------|-------------|
| This Week | Mon-Sun of current week |
| Next Week | Following 7 days |
| This Weekend | Sat-Sun |
| Next 2 Weeks | 14 days from Monday |
| Custom | Date picker for start/end |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/app/meal-plan/page.tsx` | Add button, import modal |
| `src/components/meal-plan-shopping-modal.tsx` | Create - the modal component |

---

## Edge Cases

1. **No meal plans:** Show message "No meals planned for this period"
2. **All ingredients in pantry:** Show "You have everything!"
3. **Duplicate ingredients:** Aggregate quantities
4. **Date range with no plans:** Show empty state
5. **Pantry check:** Case-insensitive matching

---

## Pro Paywall Consideration

Currently meal plans are Pro-only. Options:
- **Option A:** Shopping list generation is included with meal plans (same tier)
- **Option B:** Separate Pro feature for shopping list generation

**Recommendation:** Option A - if they have meal plans, they can generate shopping lists.

---

## Time Estimate
- Button + modal hookup: 20 min
- Date range logic: 30 min
- Ingredient aggregation: 30 min
- Preview UI: 30 min
- Testing: 20 min

**Total: ~2 hours**
