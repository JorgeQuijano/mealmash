# Recipe Metadata (Cuisine/Dietary/Difficulty) - Technical Plan

## Overview
Add cuisine, dietary tags, and difficulty fields to recipes so advanced filters can work. These fields need to be editable in the recipe create/edit modal.

---

## Database Changes

### Option A: Add columns to existing `recipes` table
```sql
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS cuisine TEXT[],
ADD COLUMN IF NOT EXISTS dietary_tags TEXT[],
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Medium';
```

**Pros:** Simple, fast
**Cons:** None really

### Option B: Create separate tables
```sql
CREATE TABLE cuisine_types (id, name);
CREATE TABLE dietary_tags (id, name);
CREATE TABLE recipe_cuisine (recipe_id, cuisine_id);
CREATE TABLE recipe_dietary (recipe_id, dietary_tag_id);
-- difficulty stays on recipes table
```

**Pros:** Normalized, easy to manage lists
**Cons:** More complex queries

### Recommendation: Option A (simple columns)

---

## Frontend Changes

### 1. Update Recipe Type Definition
**File:** `src/app/admin/page.tsx` (and any recipe types)

```typescript
type Recipe = {
  // ... existing fields
  cuisine: string[];
  dietary_tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}
```

### 2. Add Form Fields to Recipe Modal
**File:** `src/app/admin/page.tsx` (inside the form)

```tsx
{/* Cuisine Selection */}
<div className="space-y-2">
  <label className="text-sm font-medium">Cuisine</label>
  <div className="flex gap-2 flex-wrap">
    {['Italian', 'Mexican', 'Asian', 'American', 'Indian', 'Mediterranean', 'French', 'Japanese', 'Thai', 'Chinese'].map((c) => (
      <button
        key={c}
        type="button"
        onClick={() => toggleArrayField('cuisine', c)}
        className={`px-3 py-1.5 rounded-full text-sm ${newRecipe.cuisine?.includes(c) ? 'bg-primary' : 'bg-secondary'}`}
      >
        {c}
      </button>
    ))}
  </div>
</div>

{/* Dietary Tags */}
<div className="space-y-2">
  <label className="text-sm font-medium">Dietary</label>
  <div className="flex gap-2 flex-wrap">
    {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb', 'Nut-Free'].map((d) => (
      <button
        key={d}
        type="button"
        onClick={() => toggleArrayField('dietary_tags', d)}
        className={`px-3 py-1.5 rounded-full text-sm ${newRecipe.dietary_tags?.includes(d) ? 'bg-green-600' : 'bg-secondary'}`}
      >
        {d}
      </button>
    ))}
  </div>
</div>

{/* Difficulty */}
<div className="space-y-2">
  <label className="text-sm font-medium">Difficulty</label>
  <Select 
    value={newRecipe.difficulty} 
    onValueChange={(v) => setNewRecipe({...newRecipe, difficulty: v})}
  >
    <SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="Easy">Easy</SelectItem>
      <SelectItem value="Medium">Medium</SelectItem>
      <SelectItem value="Hard">Hard</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### 3. Update State Initialization
**File:** `src/app/admin/page.tsx`

```typescript
const [newRecipe, setNewRecipe] = useState({
  name: '',
  description: '',
  category: [] as string[],
  instructions: '',
  prep_time_minutes: 0,
  cook_time_minutes: 0,
  servings: 2,
  image_url: '',
  cuisine: [] as string[],        // NEW
  dietary_tags: [] as string[],   // NEW
  difficulty: 'Medium' as string, // NEW
})
```

### 4. Add Helper Function
```typescript
function toggleArrayField(field: 'cuisine' | 'dietary_tags', value: string) {
  const current = newRecipe[field] || []
  const updated = current.includes(value)
    ? current.filter(v => v !== value)
    : [...current, value]
  setNewRecipe({ ...newRecipe, [field]: updated })
}
```

### 5. Populate Existing Recipes
After adding the columns, run a migration to set default values:

```sql
-- Set default difficulty
UPDATE recipes SET difficulty = 'Medium' WHERE difficulty IS NULL;

-- You can also set some basic values based on category if needed
UPDATE recipes SET cuisine = ARRAY['American'] WHERE cuisine IS NULL;
```

For proper data, users/admins will need to edit each recipe manually.

---

## Filter Updates (Re-enable Pro Paywall)

Once recipes have this data, update `src/components/recipe-filters.tsx`:

```typescript
interface RecipeFiltersProps {
  isPro: boolean;  // Re-add this prop
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

// Add paywall check back
if (!isPro) {
  return <FreeFiltersPaywall />;
}
```

And update `src/app/recipes/page.tsx` to pass `isPro`:

```typescript
<RecipeFilters 
  isPro={isPro}
  filters={filters} 
  onFilterChange={setFilters} 
/>
```

Update `src/lib/feature-gate.ts`:

```typescript
searchAdvanced: false, // Revert to Pro-only
```

---

## Files to Modify

| File | Change |
|------|--------|
| Database | Add cuisine, dietary_tags, difficulty columns |
| `src/app/admin/page.tsx` | Add form fields for cuisine/dietary/difficulty |
| `src/app/recipes/page.tsx` | Pass isPro to RecipeFilters |
| `src/components/recipe-filters.tsx` | Re-add Pro paywall |
| `src/lib/feature-gate.ts` | Revert searchAdvanced to false |

---

## Implementation Order

1. Run database migration to add columns
2. Update admin page form with new fields
3. Test adding a recipe with metadata
4. Update recipe filters to re-enable Pro paywall
5. Test the full flow

---

## Time Estimate
- Database: 5 min
- Admin form: 30 min
- Filter integration: 15 min
- Testing: 20 min

**Total: ~1.5 hours**
