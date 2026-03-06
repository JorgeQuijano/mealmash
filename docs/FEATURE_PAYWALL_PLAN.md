# MealClaw Feature Implementation & Paywall Plan

## Current Status

### ✅ Already Implemented
| Feature | Free | Pro | Status |
|---------|------|-----|--------|
| Wheel spins | 3/day | Unlimited | ✅ Implemented |
| Pantry items | 50 | Unlimited | ✅ Implemented |
| Basic recipe search | ✅ | ✅ | Already exists |
| Manual shopping list | ✅ | ✅ | Already exists |

### ❌ Not Implemented / Not Paywalled
| Feature | Free | Pro | Status |
|---------|------|-----|--------|
| Advanced recipe filters | ❌ | ✅ | Not implemented |
| Auto shopping lists | ❌ | ✅ | Not implemented |
| Weekly meal plans | ❌ | ✅ | Not paywalled |
| Nutritional info | ❌ | ✅ | Not implemented |

---

## What's Needed

### 1. Advanced Recipe Filters
**Feature:** Allow filtering by cuisine, difficulty, prep time, dietary restrictions

**Paywall:** Free users see basic filters only, Pro users see advanced filters

### 2. Auto Shopping Lists
**Feature:** Automatically generate shopping list from selected recipes

**Paywall:** Pro only

### 3. Meal Plans Page
**Feature:** Weekly meal planning interface

**Paywall:** Currently accessible to all - needs to be Pro-only

### 4. Nutritional Info
**Feature:** Show calories, macros, nutrients per recipe

**Paywall:** Pro only

---

## Implementation Priority

### Phase 1 - Essential (High Impact)
1. **Wheel spin limit** - ✅ Already done
2. **Pantry item limit** - ✅ Already done  
3. **Meal Plans page** - Make Pro-only

### Phase 2 - Important (Differentiator)
4. **Advanced recipe filters** - Add premium filters for Pro
5. **Auto shopping list** - Generate from recipes

### Phase 3 - Nice to Have
6. **Nutritional info** - API integration needed

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/recipes/page.tsx` | Add advanced filters (Pro only) |
| `src/app/shopping-list/page.tsx` | Add auto-generate feature (Pro only) |
| `src/app/meal-plan/page.tsx` | Add paywall - redirect free users to upgrade |
| `src/app/recipes/[id]/page.tsx` | Add nutritional info section (Pro only) |

---

## Questions

1. Should **Meal Plans** be accessible to free users with limited functionality (e.g., 1 meal plan/week) or fully Pro-only?
2. What specific **advanced filters** should we add? (cuisine types, dietary, time, etc.)
3. Do you want to integrate a **nutrition API** for nutritional info?
