# Advanced Recipe Filters - Technical Plan

## Overview
Add premium recipe filtering capabilities for Pro users, including cuisine type, dietary restrictions, cooking time, difficulty, and more. Free users will see basic filters only.

---

## Current State

### Existing Filters (Basic)
- **Search:** Text search by name/description
- **Category:** breakfast, lunch, dinner, snack, dessert

### Recipe Data Structure
```typescript
type Recipe = {
  id: string
  name: string
  description: string
  instructions: string[]
  category: string[]
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  image_url: string
  recipe_ingredients?: RecipeIngredient[]
}
```

---

## Proposed Advanced Filters

### New Filter Options
| Filter | Type | Options | Pro Only |
|--------|------|---------|-----------|
| **Cuisine** | Multi-select | Italian, Mexican, Asian, American, Indian, Mediterranean, etc. | ✅ Yes |
| **Dietary** | Multi-select | Vegetarian, Vegan, Gluten-Free, Dairy-Free, Keto, Low-Carb | ✅ Yes |
| **Cooking Time** | Range | 0-15min, 15-30min, 30-60min, 60min+ | ✅ Yes |
| **Difficulty** | Single | Easy, Medium, Hard | ✅ Yes |
| **Calories** | Range | <300, 300-500, 500-800, 800+ | ✅ Yes |
| **Meal Type** | Multi-select | Breakfast, Lunch, Dinner, Snack, Dessert (existing) | No |

### What Free Users See
- Search by name/description
- Category filter (existing)

### What Pro Users See
- All basic filters
- All advanced filters
- "Pro" badge on advanced filters

---

## Implementation

### 1. Database Changes

**Option A: Add new columns to recipes table**
```sql
-- Add new fields to recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cuisine TEXT[];
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS dietary_tags TEXT[];
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS difficulty TEXT; -- 'easy', 'medium', 'hard'
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS calories INTEGER;
```

**Option B: Use existing category field creatively** (quicker, no DB change)
- Store cuisine in category like "cuisine:italian"
- Store dietary in category like "dietary:vegetarian"
- Parse at runtime

**Recommendation:** Option B for speed, migrate to A later

### 2. Create Filter Components

**File: `src/components/recipe-filters.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, ChevronUp, Crown, Filter } from 'lucide-react';

const CUISINES = [
  'Italian', 'Mexican', 'Asian', 'American', 'Indian', 
  'Mediterranean', 'French', 'Japanese', 'Thai', 'Chinese'
];

const DIETARY = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb', 'Nut-Free'
];

const DIFFICULTY = ['Easy', 'Medium', 'Hard'];

const TIME_RANGES = [
  { label: 'Under 15 min', min: 0, max: 15 },
  { label: '15-30 min', min: 15, max: 30 },
  { label: '30-60 min', min: 30, max: 60 },
  { label: 'Over 60 min', min: 60, max: 999 },
];

interface RecipeFiltersProps {
  isPro: boolean;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function RecipeFilters({ isPro, filters, onFilterChange }: RecipeFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllCuisines, setShowAllCuisines] = useState(false);

  if (!isPro) {
    // Show basic filters only with upgrade prompt
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </span>
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          {/* Basic filters only */}
          <div className="text-center py-4">
            <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Advanced filters are for Pro members
            </p>
            <Button size="sm" onClick={() => router.push('/upgrade')}>
              Upgrade to Pro
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Pro users see all filters
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
            <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
              <Crown className="w-3 h-3 mr-1" /> Pro
            </Badge>
          </span>
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-4">
        
        {/* Cuisine Filter */}
        <div>
          <h4 className="text-sm font-medium mb-2">Cuisine</h4>
          <div className="flex flex-wrap gap-2">
            {CUISINES.slice(0, showAllCuisines ? CUISINES.length : 5).map(cuisine => (
              <Badge
                key={cuisine}
                variant={filters.cuisine.includes(cuisine) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleCuisine(cuisine)}
              >
                {cuisine}
              </Badge>
            ))}
            {CUISINES.length > 5 && (
              <Button variant="link" size="sm" onClick={() => setShowAllCuisines(!showAllCuisines)}>
                {showAllCuisines ? 'Show less' : `+${CUISINES.length - 5} more`}
              </Button>
            )}
          </div>
        </div>

        {/* Dietary Filter */}
        <div>
          <h4 className="text-sm font-medium mb-2">Dietary</h4>
          <div className="flex flex-wrap gap-2">
            {DIETARY.map(diet => (
              <Badge
                key={diet}
                variant={filters.dietary.includes(diet) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleDietary(diet)}
              >
                {diet}
              </Badge>
            ))}
          </div>
        </div>

        {/* Cooking Time Filter */}
        <div>
          <h4 className="text-sm font-medium mb-2">Cooking Time</h4>
          <div className="flex flex-wrap gap-2">
            {TIME_RANGES.map(range => (
              <Badge
                key={range.label}
                variant={filters.timeRange === range.label ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => onFilterChange({...filters, timeRange: range.label})}
              >
                {range.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div>
          <h4 className="text-sm font-medium mb-2">Difficulty</h4>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY.map(diff => (
              <Badge
                key={diff}
                variant={filters.difficulty.includes(diff) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleDifficulty(diff)}
              >
                {diff}
              </Badge>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear all filters
        </Button>

      </CollapsibleContent>
    </Collapsible>
  );
}
```

### 3. Update Recipes Page

**File: `src/app/recipes/page.tsx`**

```tsx
// Add filter state
const [filters, setFilters] = useState<FilterState>({
  search: '',
  category: 'all',
  cuisine: [],
  dietary: [],
  timeRange: null,
  difficulty: [],
});

// Add subscription check
const [isPro, setIsPro] = useState(false);

// In useEffect, check subscription
const { data: profile } = await supabase
  .from('user_profiles')
  .select('subscription_tier, subscription_status')
  .eq('id', user.id)
  .single();
setIsPro(profile?.subscription_tier === 'pro' && profile?.subscription_status === 'active');

// Update filter function
const filteredRecipes = recipes.filter(recipe => {
  // Basic filters
  const matchesSearch = recipe.name.toLowerCase().includes(filters.search.toLowerCase());
  const matchesCategory = filters.category === 'all' || recipe.category?.includes(filters.category);
  
  // Advanced filters (only for Pro)
  if (isPro) {
    const matchesCuisine = filters.cuisine.length === 0 || 
      filters.cuisine.some(c => recipe.cuisine?.includes(c));
    const matchesDietary = filters.dietary.length === 0 ||
      filters.dietary.some(d => recipe.dietary_tags?.includes(d));
    // ... time and difficulty filters
  }
  
  return matchesSearch && matchesCategory;
});
```

### 4. Add FilterState Type

```typescript
interface FilterState {
  search: string;
  category: string;
  cuisine: string[];
  dietary: string[];
  timeRange: string | null;
  difficulty: string[];
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/recipe-filters.tsx` | Create new filter component |
| `src/app/recipes/page.tsx` | Add Pro check + integrate filters |

---

## Database Migration (Optional - for structured data)

```sql
-- If we want structured cuisine/dietary data
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS cuisine TEXT[],
ADD COLUMN IF NOT EXISTS dietary_tags TEXT[],
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS calories INTEGER;

-- Create indexes for filtering
CREATE INDEX idx_recipes_cuisine ON recipes USING GIN(cuisine);
CREATE INDEX idx_recipes_dietary ON recipes USING GIN(dietary_tags);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_calories ON recipes(calories);
```

---

## Mock Data Updates

Will need to add cuisine/dietary data to existing recipes:
- Italian, Mexican, Asian, etc. for cuisine
- Vegetarian, Vegan, Gluten-Free for dietary

---

## Testing Checklist

- [ ] Free user sees basic filters + upgrade prompt
- [ ] Pro user sees all advanced filters
- [ ] Filters work correctly (AND logic)
- [ ] Clear filters resets all
- [ ] Mobile responsive design
- [ ] Performance with large recipe dataset

---

## Questions Before Implementation

1. **Database approach?** Quick (category parsing) vs. proper (new columns)
2. **Cuisine/dietary data?** Should we seed sample data or manually add?
3. **Filter logic?** Should filters be AND (all must match) or OR (any can match)?
