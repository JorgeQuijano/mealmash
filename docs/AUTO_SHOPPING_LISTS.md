# Auto Shopping Lists - Technical Plan

## Overview
Add automatic shopping list generation from selected recipes or meal plans. This is a Pro-only feature that aggregates ingredients from multiple recipes into a consolidated shopping list.

---

## Current State
- Manual shopping list at `/shopping-list`
- Users can manually add/remove items
- Basic check-off functionality
- No recipe integration yet

---

## Proposed Features

### 1. Generate from Selected Recipes
Users can select multiple recipes and generate a shopping list with all ingredients combined.

### 2. Generate from Meal Plan
Auto-generate shopping list from the user's weekly meal plan.

### 3. Smart Aggregation
- Combine duplicate ingredients (e.g., 2 recipes need "onion" → show total quantity)
- Group by category (produce, dairy, meat, pantry)

### 4. Manual Adjustments
- Mark items as "have in pantry" (exclude from list)
- Add custom items
- Edit quantities

---

## User Experience

### Free User Flow
1. User goes to `/shopping-list`
2. Sees "Generate from Recipes" button
3. Clicks → sees paywall: "Auto Shopping Lists are for Pro Members"
4. Prompted to upgrade

### Pro User Flow
1. User goes to `/shopping-list`
2. Sees "Generate from Recipes" and "Generate from Meal Plan" buttons
3. Selects recipes or meal plan
4. Shopping list auto-populates with aggregated ingredients
5. Can edit, add items, check off

---

## Implementation

### 1. Create ShoppingListGenerator Component
**File: `src/components/shopping-list-generator.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { Crown, Wand2, Calendar, ShoppingCart, Plus, X, Check } from 'lucide-react';

interface Recipe {
  id: string;
  name: string;
  category: string[];
}

interface ShoppingListGeneratorProps {
  isPro: boolean;
  onGenerateFromRecipes: (recipeIds: string[]) => void;
  onGenerateFromMealPlan: () => void;
}

export default function ShoppingListGenerator({ 
  isPro, 
  onGenerateFromRecipes,
  onGenerateFromMealPlan 
}: ShoppingListGeneratorProps) {
  const router = useRouter();

  // Free user - show paywall
  if (!isPro) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Auto-Generate Shopping List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Auto Shopping Lists are for Pro</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate shopping lists from your recipes and meal plans automatically
            </p>
            <Button onClick={() => router.push('/upgrade')}>
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pro user - show options
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          Auto-Generate Shopping List
          <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
            <Crown className="w-3 h-3 mr-1" /> Pro
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => {/* Open recipe selector */}}>
          <ShoppingCart className="w-4 h-4 mr-2" />
          From Recipes
        </Button>
        <Button variant="outline" onClick={onGenerateFromMealPlan}>
          <Calendar className="w-4 h-4 mr-2" />
          From Meal Plan
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 2. Create Recipe Selector Dialog
**File: `src/components/recipe-selector.tsx`**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Recipe {
  id: string;
  name: string;
  category: string[];
}

interface RecipeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (recipeIds: string[]) => void;
}

export default function RecipeSelector({ open, onOpenChange, onGenerate }: RecipeSelectorProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) loadRecipes();
  }, [open]);

  async function loadRecipes() {
    setLoading(true);
    const { data } = await supabase
      .from('recipes')
      .select('id, name, category')
      .order('name');
    if (data) setRecipes(data);
    setLoading(false);
  }

  function toggleRecipe(id: string) {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Select Recipes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search recipes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-auto">
              {recipes
                .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
                .map(recipe => (
                  <div key={recipe.id} className="flex items-center gap-2">
                    <Checkbox 
                      checked={selected.includes(recipe.id)}
                      onCheckedChange={() => toggleRecipe(recipe.id)}
                    />
                    <span>{recipe.name}</span>
                  </div>
                ))}
            </div>
          )}

          <Button 
            onClick={() => onGenerate(selected)}
            disabled={selected.length === 0}
            className="w-full"
          >
            Generate List ({selected.length} recipes)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 3. Create Ingredient Aggregator Utility
**File: `src/lib/shopping-list.ts`**

```typescript
import { supabase } from './supabase';

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

interface RecipeIngredient {
  ingredient_id: string;
  quantity: number;
  ingredients: {
    name: string;
    category: string;
    unit: string;
  };
}

// Aggregate ingredients from multiple recipes
export async function generateShoppingListFromRecipes(recipeIds: string[]): Promise<Ingredient[]> {
  // Fetch all recipe ingredients
  const { data: recipeIngredients, error } = await supabase
    .from('recipe_ingredients')
    .select(`
      ingredient_id,
      quantity,
      ingredients (
        name,
        category,
        unit
      )
    `)
    .in('recipe_id', recipeIds);

  if (error || !recipeIngredients) return [];

  // Aggregate by ingredient
  const aggregated = new Map<string, Ingredient>();

  for (const ri of recipeIngredients as any[]) {
    const ing = ri.ingredients;
    if (!ing) continue;
    
    const key = ing.name.toLowerCase();
    
    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.quantity += ri.quantity || 0;
    } else {
      aggregated.set(key, {
        id: ri.ingredient_id,
        name: ing.name,
        quantity: ri.quantity || 0,
        unit: ing.unit || '',
        category: ing.category || 'other'
      });
    }
  }

  // Group by category and sort
  const result = Array.from(aggregated.values());
  
  // Sort by category, then name
  return result.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });
}

// Generate from meal plan
export async function generateShoppingListFromMealPlan(userId: string): Promise<Ingredient[]> {
  // Get user's meal plan for current week
  const { data: mealPlans } = await supabase
    .from('meal_plans')
    .select('recipe_id')
    .eq('user_id', userId)
    .gte('date', getWeekStart())
    .lte('date', getWeekEnd());

  if (!mealPlans || mealPlans.length === 0) return [];

  const recipeIds = mealPlans.map(mp => mp.recipe_id).filter(Boolean);
  return generateShoppingListFromRecipes(recipeIds);
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  return new Date(now.setDate(diff)).toISOString().split('T')[0];
}

function getWeekEnd(): string {
  const start = getWeekStart();
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end.toISOString().split('T')[0];
}
```

### 4. Update Shopping List Page
**File: `src/app/shopping-list/page.tsx`**

```tsx
// Add imports
import ShoppingListGenerator from '@/components/shopping-list-generator';
import RecipeSelector from '@/components/recipe-selector';
import { generateShoppingListFromRecipes, generateShoppingListFromMealPlan } from '@/lib/shopping-list';

// Add state
const [isPro, setIsPro] = useState(false);
const [recipeSelectorOpen, setRecipeSelectorOpen] = useState(false);

// In useEffect - check subscription
const { data: profile } = await supabase
  .from('user_profiles')
  .select('subscription_tier, subscription_status')
  .eq('id', user.id)
  .single();
setIsPro(profile?.subscription_tier === 'pro' && profile?.subscription_status === 'active');

// Add handler functions
const handleGenerateFromRecipes = async (recipeIds: string[]) => {
  setRecipeSelectorOpen(false);
  const ingredients = await generateShoppingListFromRecipes(recipeIds);
  // Add to shopping list
  for (const ing of ingredients) {
    await addShoppingItem(user.id, ing);
  }
  await loadShoppingList(user.id);
};

const handleGenerateFromMealPlan = async () => {
  const ingredients = await generateShoppingListFromMealPlan(user.id);
  for (const ing of ingredients) {
    await addShoppingItem(user.id, ing);
  }
  await loadShoppingList(user.id);
};

// In render - add generator component
<div className="container mx-auto px-4 py-4">
  <ShoppingListGenerator 
    isPro={isPro}
    onGenerateFromRecipes={() => setRecipeSelectorOpen(true)}
    onGenerateFromMealPlan={handleGenerateFromMealPlan}
  />
  
  <RecipeSelector 
    open={recipeSelectorOpen}
    onOpenChange={setRecipeSelectorOpen}
    onGenerate={handleGenerateFromRecipes}
  />
  
  {/* Existing shopping list UI */}
</div>
```

---

## Database Schema (Already Exists)

```sql
-- shopping_items table
-- Already exists with:
-- - id, user_id, name, quantity, unit, category, checked, created_at
```

---

## Files to Create/Modify

| File | Action |
|------|---------|
| `src/components/shopping-list-generator.tsx` | Create - Pro paywall component |
| `src/components/recipe-selector.tsx` | Create - Recipe selection dialog |
| `src/lib/shopping-list.ts` | Create - Shopping list generation logic |
| `src/app/shopping-list/page.tsx` | Modify - Add generator + paywall |

---

## Testing Checklist

- [ ] Free user → sees paywall on shopping list page
- [ ] Free user → cannot access auto-generate features
- [ ] Pro user → sees "Generate from Recipes" button
- [ ] Pro user → sees "Generate from Meal Plan" button
- [ ] Select recipes → generates correct aggregated list
- [ ] Generate from meal plan → uses current week's meals
- [ ] Duplicates are combined correctly
- [ ] Items grouped by category
- [ ] Can manually add/edit/delete items
- [ ] Check-off functionality works

---

## Questions

1. **Ingredient data quality:** Do existing recipes have good ingredient data?
2. **Meal plan table:** Does `meal_plans` table exist with `recipe_id`?
3. **Quantity handling:** Should we handle different unit conversions (cups to tbsp)?
