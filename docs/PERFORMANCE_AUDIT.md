# Performance Audit Report

## Executive Summary

The dashboard and other pages make **too many sequential database calls** and are missing critical database indexes. This is the primary cause of slow load times - NOT Vercel.

---

## Critical Issues

### 1. Sequential Database Queries (HIGH PRIORITY)

**Dashboard page makes 10+ sequential queries:**

```
Query 1:  Get user profile
Query 2:  Get favorites count
Query 3:  Get meals planned count
Query 4:  Get shopping list count
Query 5:  Get pantry items count
Query 6:  Get today's meals (HEAVY - joins recipes + recipe_ingredients)
Query 7:  Get pantry items (full list)
Query 8:  Get expired items
Query 9:  Get expiring soon (2 days)
Query 10: Get expiring this week (7 days)
```

**Each query waits for the previous one to complete!**

**Fix:** Use `Promise.all()` to run queries in parallel.

---

### 2. Missing Database Indexes (HIGH PRIORITY)

**Current indexes:**
- `user_profiles.stripe_customer`
- `user_profiles.subscription_tier, subscription_status`
- `ingredients.is_enabled`
- `ingredients.created_by`
- `user_profiles.flag_count`
- `recipe_ingredients.recipe_id`
- `recipe_ingredients.ingredient_id`

**Missing critical indexes:**
```sql
-- User data lookups
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_user_date ON meal_plans(user_id, planned_date);
CREATE INDEX idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX idx_pantry_items_expires_at ON pantry_items(expires_at);
CREATE INDEX idx_shopping_list_user_id ON shopping_list(user_id);
```

---

### 3. Over-fetching Data (MEDIUM)

Example from dashboard:
```typescript
// Fetching ALL pantry items just to count them
const { count: pantryItemsCount } = await supabase
  .from('pantry_items')
  .select('*', { count: 'exact', head: true }) // Still queries all rows to count
  .eq('user_id', userId)
```

**Fix:** Use count-only queries properly or aggregate on server.

---

### 4. Heavy JOINs Without Optimization

Today's meals query fetches full recipe data including ALL recipe ingredients:
```typescript
.select(`
  *,
  recipes (
    *,
    recipe_ingredients (
      ingredient_id,
      quantity,
      quantity_num,
      unit,
      ingredients (name, category)
    )
  )
`)
```

This is needed for the modal, but we're loading it even when user doesn't click.

---

### 5. No Caching Strategy

- No React Query / SWR for caching
- Every page load hits the database fresh
- No stale-while-revalidate

---

## Recommended Fixes

### Immediate (High Impact)

1. **Parallelize queries with Promise.all()**
```typescript
// BEFORE (sequential - slow)
const favorites = await getFavorites()
const meals = await getMeals()
const pantry = await getPantry()

// AFTER (parallel - fast)
const [favorites, meals, pantry] = await Promise.all([
  getFavorites(),
  getMeals(),
  getPantry()
])
```

2. **Add missing indexes**
```sql
CREATE INDEX idx_meal_plans_user_date ON meal_plans(user_id, planned_date);
CREATE INDEX idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX idx_pantry_items_expires_at ON pantry_items(expires_at);
```

3. **Lazy load heavy data**
- Only fetch recipe ingredients when user clicks to open modal
- Don't load full recipe_ingredients on initial page load

---

### Short-term (Medium Impact)

4. **Add React Query / SWR for caching**
```typescript
// Example with SWR
const { data, error } = useSWR(
  ['todays-meals', userId],
  () => fetchTodaysMeals(userId),
  { revalidateOnFocus: false }
)
```

5. **Implement skeleton loading states**
- Show placeholders while data loads
- Feels faster to users

---

### Long-term (Architecture)

6. **Consider Supabase Database Functions**
Create a single RPC call that returns all dashboard data in one query:
```sql
CREATE FUNCTION get_dashboard_data(user_id UUID)
RETURNS TABLE (...)
AS $$
BEGIN
  RETURN QUERY
  SELECT ... multiple queries joined;
END;
$$ LANGUAGE plpgsql;
```

7. **Add Redis caching layer** (for Vercel Pro)

---

## Estimated Performance Gains

| Fix | Current | Expected |
|-----|---------|----------|
| Parallel queries | 10 sequential calls | 3-4 parallel calls |
| Database indexes | Full table scans | Index lookups |
| Lazy load ingredients | 500ms+ | 50ms initial load |
| **Total improvement** | **~3-5 seconds** | **~500ms-1s** |

---

## SQL Migration for Indexes

```sql
-- Add missing indexes for performance

-- User favorites
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);

-- Meal plans (critical - used in dashboard + meal-plan page)
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, planned_date);

-- Pantry items (critical - dashboard + pantry page)
CREATE INDEX IF NOT EXISTS idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_expires_at ON pantry_items(expires_at);
CREATE INDEX IF NOT EXISTS idx_pantry_items_user_expires ON pantry_items(user_id, expires_at);

-- Shopping list
CREATE INDEX IF NOT EXISTS idx_shopping_list_user_id ON shopping_list(user_id);

-- User profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/app/dashboard/page.tsx` | Parallelize queries with Promise.all() |
| Database | Add 7+ missing indexes |
| `src/app/meal-plan/page.tsx` | Optimize queries |
| `src/app/pantry/page.tsx` | Optimize queries |

---

## Priority Order

1. Add database indexes (fastest fix - just SQL)
2. Parallelize dashboard queries (biggest impact)
3. Lazy load recipe ingredients
4. Add caching layer (optional, more work)
