# Nutritional Info Implementation - Technical Plan

## Executive Summary

Implementing nutritional information for recipes can be done in three ways:
1. **API-based** - Real-time lookup from nutrition APIs
2. **Database-driven** - Store nutrition data in ingredients table, calculate totals
3. **Hybrid** - Pre-seed common ingredients with nutrition data

**Recommendation:** Database-driven approach with manual data entry for seed data. It's free, reliable, and doesn't depend on external APIs.

---

## Approach Comparison

### Option A: External API Integration
**Providers:** Nutritionix, Edamam, Spoonacular

**Pros:**
- Real-time nutrition lookup
- Huge database of foods
- No manual data entry

**Cons:**
- API rate limits / costs after free tier
- Requires API key management
- Dependency on third-party service
- Potential downtime / changes

**Cost:**
- Nutritionix: 1000 free requests/month
- Edamam: 100 free requests/day  
- Spoonacular: 150 free requests/day

### Option B: Database-Driven (Recommended)
**Approach:** Store nutrition per ingredient, calculate recipe totals

**Pros:**
- Free, no API costs
- No external dependencies
- Fast, cached data
- Full control

**Cons:**
- Initial data entry required
- Need to maintain ingredient database

**Implementation:**
1. Add nutrition columns to `ingredients` table
2. Seed with common ingredients + nutrition data
3. Calculate recipe totals from ingredient sums

---

## Data Structure

### Database Schema

```sql
-- Add nutrition columns to ingredients table
ALTER TABLE ingredients 
ADD COLUMN IF NOT EXISTS calories_per_100g DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS protein_per_100g DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS carbs_per_100g DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS fat_per_100g DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS fiber_per_100g DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS sugar_per_100g DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS sodium_per_100g DECIMAL(10,2);

-- Or create separate nutrition table
CREATE TABLE ingredient_nutrition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  serving_size_g DECIMAL(10,2) DEFAULT 100,
  calories DECIMAL(10,2),
  protein DECIMAL(10,2),
  carbohydrates DECIMAL(10,2),
  fat DECIMAL(10,2),
  fiber DECIMAL(10,2),
  sugar DECIMAL(10,2),
  sodium DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add to recipes table (for quick display)
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS total_calories DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_protein DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_carbs DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_fat DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS servings INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS calories_per_serving DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS protein_per_serving DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS carbs_per_serving DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS fat_per_serving DECIMAL(10,2);
```

### Recipe Calculation Formula

```
For each recipe:
  total_calories = SUM(ingredient.quantity * ingredient.calories_per_100g / 100)
  calories_per_serving = total_calories / recipe.servings
```

---

## Seed Data

### Common Ingredients with Nutrition (per 100g)

| Ingredient | Calories | Protein | Carbs | Fat | Fiber |
|------------|----------|---------|-------|------|-------|
| Chicken Breast | 165 | 31 | 0 | 3.6 | 0 |
| Rice (cooked) | 130 | 2.7 | 28 | 0.3 | 0.4 |
| Olive Oil | 884 | 0 | 0 | 100 | 0 |
| Egg | 155 | 13 | 1.1 | 11 | 0 |
| Tomato | 18 | 0.9 | 3.9 | 0.2 | 1.2 |
| Onion | 40 | 1.1 | 9.3 | 0.1 | 1.7 |
| Garlic | 149 | 6.4 | 33 | 0.5 | 2.1 |
| Pasta (cooked) | 131 | 5 | 25 | 1.1 | 1.8 |
| Beef (ground) | 250 | 26 | 0 | 15 | 0 |
| Salmon | 208 | 20 | 0 | 13 | 0 |
| Broccoli | 34 | 2.8 | 7 | 0.4 | 2.6 |
| Cheese (cheddar) | 402 | 25 | 1.3 | 33 | 0 |
| Milk | 42 | 3.4 | 5 | 1 | 0 |
| Bread | 265 | 9 | 49 | 3.2 | 2.7 |
| Butter | 717 | 0.9 | 0.1 | 81 | 0 |
| Sugar | 387 | 0 | 100 | 0 | 0 |
| Salt | 0 | 0 | 0 | 0 | 0 |

---

## Implementation Steps

### Phase 1: Database Setup

1. **Create nutrition table** or add columns to existing tables
2. **Seed with base ingredients** (50-100 common items)
3. **Add calculation function** for recipes

### Phase 2: Backend Logic

```typescript
// src/lib/nutrition.ts

interface NutritionInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

interface RecipeNutrition extends NutritionInfo {
  perServing: NutritionInfo;
  servings: number;
}

// Calculate nutrition from recipe ingredients
export async function calculateRecipeNutrition(recipeId: string): Promise<RecipeNutrition> {
  // Fetch recipe with ingredients
  const { data: recipe } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        quantity,
        unit,
        ingredients (
          name,
          nutrition_per_100g
        )
      )
    `)
    .eq('id', recipeId)
    .single();

  let totals: NutritionInfo = { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };

  for (const ri of recipe.recipe_ingredients) {
    // Convert quantity to grams (simplified)
    const grams = convertToGrams(ri.quantity, ri.unit);
    const factor = grams / 100;

    totals.calories += (ri.ingredients.nutrition_per_100g?.calories || 0) * factor;
    totals.protein += (ri.ingredients.nutrition_per_100g?.protein || 0) * factor;
    totals.carbohydrates += (ri.ingredients.nutrition_per_100g?.carbs || 0) * factor;
    totals.fat += (ri.ingredients.nutrition_per_100g?.fat || 0) * factor;
    totals.fiber += (ri.ingredients.nutrition_per_100g?.fiber || 0) * factor;
    totals.sugar += (ri.ingredients.nutrition_per_100g?.sugar || 0) * factor;
    totals.sodium += (ri.ingredients.nutrition_per_100g?.sodium || 0) * factor;
  }

  const servings = recipe.servings || 1;

  return {
    ...totals,
    servings,
    perServing: {
      calories: totals.calories / servings,
      protein: totals.protein / servings,
      carbohydrates: totals.carbohydrates / servings,
      fat: totals.fat / servings,
      fiber: totals.fiber / servings,
      sugar: totals.sugar / servings,
      sodium: totals.sodium / servings,
    }
  };
}

function convertToGrams(quantity: number, unit: string): number {
  const conversions: Record<string, number> = {
    'g': 1,
    'kg': 1000,
    'oz': 28.35,
    'lb': 453.6,
    'cup': 240,  // approximate
    'tbsp': 15,
    'tsp': 5,
    'piece': 100, // approximate
    'ml': 1,
    'l': 1000,
  };
  return quantity * (conversions[unit] || 100);
}
```

### Phase 3: Frontend - Recipe Detail Page

**File: `src/app/recipes/[id]/page.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Flame, 
  Beef, 
  Wheat, 
  Droplet, 
  Crown,
  Loader2 
} from 'lucide-react';

interface NutritionFacts {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servings: number;
  perServing: NutritionFacts;
}

export default function NutritionSection({ recipeId, isPro }: { recipeId: string, isPro: boolean }) {
  const [nutrition, setNutrition] = useState<NutritionFacts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPro) {
      fetchNutrition();
    }
  }, [recipeId, isPro]);

  async function fetchNutrition() {
    const res = await fetch(`/api/recipes/${recipeId}/nutrition`);
    const data = await res.json();
    setNutrition(data);
    setLoading(false);
  }

  // Free user - show paywall
  if (!isPro) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Nutritional Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Nutritional Info is for Pro Members</h3>
            <p className="text-sm text-muted-foreground mb-4">
              See calories, protein, carbs, and more for each recipe
            </p>
            <Button onClick={() => router.push('/upgrade')}>
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pro user - show nutrition
  if (loading) {
    return <Loader2 className="w-6 h-6 animate-spin mx-auto" />;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Nutrition Facts</CardTitle>
        <p className="text-sm text-muted-foreground">
          {nutrition?.servings} serving{nutrition?.servings !== 1 ? 's' : ''} per recipe
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <NutritionItem 
            icon={<Flame className="w-5 h-5" />}
            label="Calories"
            value={nutrition?.perServing.calories}
            unit="kcal"
          />
          <NutritionItem 
            icon={<Beef className="w-5 h-5" />}
            label="Protein"
            value={nutrition?.perServing.protein}
            unit="g"
          />
          <NutritionItem 
            icon={<Wheat className="w-5 h-5" />}
            label="Carbs"
            value={nutrition?.perServing.carbohydrates}
            unit="g"
          />
          <NutritionItem 
            icon={<Droplet className="w-5 h-5" />}
            label="Fat"
            value={nutrition?.perServing.fat}
            unit="g"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function NutritionItem({ icon, label, value, unit }: { 
  icon: React.ReactNode; 
  label: string; 
  value?: number; 
  unit: string; 
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">
          {value?.toFixed(1) || '—'}{unit}
        </p>
      </div>
    </div>
  );
}
```

### Phase 4: API Endpoint

**File: `src/app/api/recipes/[id]/nutrition/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { calculateRecipeNutrition } from '@/lib/nutrition';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const nutrition = await calculateRecipeNutrition(params.id);
    return NextResponse.json(nutrition);
  } catch (error) {
    console.error('Error calculating nutrition:', error);
    return NextResponse.json(
      { error: 'Failed to calculate nutrition' },
      { status: 500 }
    );
  }
}
```

---

## Paywall Strategy

### Free Users
- See ingredient list
- NO nutritional information
- Upgrade prompt: "See nutritional info - Upgrade to Pro"

### Pro Users
- Full nutrition breakdown per recipe
- Calories, protein, carbs, fat per serving
- Total recipe nutrition

---

## Files to Modify

| File | Change |
|------|--------|
| Database migration | Add nutrition columns/tables |
| `src/lib/nutrition.ts` | Create - calculation logic |
| `src/app/api/recipes/[id]/nutrition/route.ts` | Create - API endpoint |
| `src/components/nutrition-section.tsx` | Create - UI component |
| `src/app/recipes/[id]/page.tsx` | Add nutrition section |
| Seed data | Add initial ingredient nutrition |

---

## Seed Data SQL

```sql
-- Seed common ingredients with nutrition (per 100g)
INSERT INTO ingredients (name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g) VALUES
('Chicken Breast', 'meat', 165, 31, 0, 3.6, 0, 0, 74),
('Rice (cooked)', 'grains', 130, 2.7, 28, 0.3, 0.4, 0.1, 1),
('Olive Oil', 'oils', 884, 0, 0, 100, 0, 0, 2),
('Egg', 'dairy', 155, 13, 1.1, 11, 0, 1.1, 124),
('Tomato', 'vegetables', 18, 0.9, 3.9, 0.2, 1.2, 2.6, 5),
('Onion', 'vegetables', 40, 1.1, 9.3, 0.1, 1.7, 4.2, 4),
('Garlic', 'vegetables', 149, 6.4, 33, 0.5, 2.1, 1, 17),
-- ... more ingredients
```

---

## Testing Checklist

- [ ] Database columns created
- [ ] Seed data loaded
- [ ] API endpoint working
- [ ] Free user sees paywall
- [ ] Pro user sees nutrition
- [ ] Nutrition calculation correct
- [ ] Per-serving calculations correct
- [ ] Mobile responsive
- [ ] Unit conversion working

---

## Questions Before Implementation

1. **Data approach:** Manual seed data (free, takes time) or API integration (costs may apply)?
2. **Initial scope:** Start with 20-50 common ingredients or go bigger?
3. **Unit conversion:** Handle common units (cups, tbsp, oz) or simplify?
4. **Pro feature:** Should nutritional info be Pro-only or free?
