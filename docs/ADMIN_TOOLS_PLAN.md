# Technical Plan: Admin Tools Expansion

## Current State

- **Admin page exists** at `/admin` with recipe management (CRUD)
- **Ingredients table** in Supabase: `id`, `name`, `category`, `aliases`, `created_at`
- **Ingredient search component** allows inline creation when adding recipes, but no dedicated management page
- **RLS already in place**: ingredients are publicly readable, writeable by admins

---

## Scope

1. **Admin Dashboard** - Central hub to route to different admin tools
2. **Ingredient Management Page** - Full CRUD for global ingredients
3. **Refactor existing admin page** into a sub-route under the dashboard

---

## Implementation Plan

### Phase 1: Admin Dashboard (`/admin`)

**Goal**: Transform `/admin` into a dashboard with navigation to different admin sections.

**Changes**:
- Create a shared admin layout or dashboard component
- Add navigation cards/links to:
  - Recipe Management (`/admin/recipes`)
  - Ingredient Management (`/admin/ingredients`)
- Move existing recipe management logic to `/admin/recipes`

**Routes**:
```
/admin          → Dashboard (overview + nav)
/admin/recipes  → Recipe management (move existing logic here)
/admin/ingredients → Ingredient management (new)
```

**UI**: Card-based dashboard with icons, e.g.:
- 🧾 Recipes - View & manage all recipes
- 🥬 Ingredients - Manage global ingredient library

---

### Phase 2: Ingredient Management Page (`/admin/ingredients`)

**Goal**: Full CRUD interface for the global ingredients table.

**Features**:
1. **List View** - Paginated table of all ingredients with search/filter
2. **Add Ingredient** - Form with fields:
   - Name (required)
   - Category (dropdown: produce, dairy, meat, pantry, frozen, bakery, other)
   - Aliases (optional, comma-separated or multi-input for common variations)
3. **Edit Ingredient** - Same form, pre-populated
4. **Delete Ingredient** - With confirmation (check for usage in recipes first)
5. **Bulk Import** (optional future): CSV upload

**Database**:
- No schema changes needed - table already exists
- Add RLS policy for admin-only write (update/delete):
```sql
CREATE POLICY "Admins can manage ingredients" ON ingredients FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);
```

**Components to create**:
- `src/app/admin/ingredients/page.tsx` - Main ingredient management page
- Reuse existing UI components (Card, Button, Input, Dialog, DataTable or simple list)

---

### Phase 3: Code Changes

#### Step 3.1: Refactor `/admin` → `/admin/recipes`

1. Move `src/app/admin/page.tsx` content to `src/app/admin/recipes/page.tsx`
2. Replace `/admin/page.tsx` with dashboard UI (simple cards)
3. Update nav links:
   - Desktop nav: `/admin/recipes`
   - Mobile nav: `/admin/recipes`

#### Step 3.2: Create `/admin/ingredients`

1. New page at `src/app/admin/ingredients/page.tsx`
2. Features:
   - Search bar for filtering
   - Table/list of ingredients (name, category, aliases)
   - Add/Edit dialog (reusable form component)
   - Delete with usage check
3. Copy patterns from recipe management page

#### Step 3.3: RLS Policies

Ensure proper admin-only policies on ingredients:
```sql
-- Already exists: ingredients are public read
-- Add admin write policy if not present
DROP POLICY IF EXISTS "Admins can manage ingredients" ON ingredients;
CREATE POLICY "Admins can manage ingredients" ON ingredients FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);
```

---

## File Changes Summary

| Action | File |
|--------|------|
| Create | `src/app/admin/page.tsx` (dashboard) |
| Move + edit | `src/app/admin/recipes/page.tsx` (from existing admin) |
| Create | `src/app/admin/ingredients/page.tsx` |
| Edit | `src/components/desktop-nav.tsx` (update admin link) |
| Edit | `src/components/mobile-nav.tsx` (update admin link) |
| Edit | Supabase (add RLS policy if needed) |

---

## Estimated Effort

- **Phase 1**: ~30 min (refactor routing)
- **Phase 2**: ~1-1.5 hrs (new ingredient page with full CRUD)
- **Testing**: ~15 min

**Total**: ~2 hours

---

## Future Enhancements (Out of Scope)

- Bulk ingredient import (CSV)
- Ingredient usage analytics
- Recipe nutrition data
- User management (promote/demote admins)
