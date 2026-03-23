/**
 * Smart Grocery List - Ingredient Combining Utility
 * 
 * Handles consolidation of ingredients when adding to shopping list.
 * Quantities with the same unit are combined; different units remain separate.
 */

export interface ShoppingListItem {
  id?: string
  user_id: string
  item_name: string
  quantity: string
  unit: string
  is_checked?: boolean
  ingredient_id?: string | null
  created_at?: string
  purchased_at?: string
}

export interface RecipeIngredient {
  ingredient_id: string
  ingredient_name: string
  quantity: string
  quantity_num: number
  unit: string
}

/**
 * Normalize a quantity string to a number
 */
export function normalizeQuantity(qty: string): number {
  if (!qty || qty.trim() === '') return 1
  const num = parseFloat(qty)
  return isNaN(num) ? 1 : num
}

/**
 * Normalize unit strings for comparison
 * e.g., "cups", "cup", "c." all become "cup"
 */
export function normalizeUnit(unit: string): string {
  if (!unit) return 'pieces'
  
  const unitLower = unit.toLowerCase().trim()
  
  // Common unit aliases
  const unitMap: Record<string, string> = {
    'c': 'cup',
    'c.': 'cup',
    'cups': 'cup',
    'cup': 'cup',
    'tbsp': 'tbsp',
    'tablespoon': 'tbsp',
    'tablespoons': 'tbsp',
    'tsp': 'tsp',
    'teaspoon': 'tsp',
    'teaspoons': 'tsp',
    'oz': 'oz',
    'ounce': 'oz',
    'ounces': 'oz',
    'lb': 'lb',
    'pound': 'lb',
    'pounds': 'lb',
    'g': 'g',
    'gram': 'g',
    'grams': 'g',
    'kg': 'kg',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'ml': 'ml',
    'milliliter': 'ml',
    'milliliters': 'ml',
    'l': 'L',
    'liter': 'L',
    'liters': 'L',
    'litre': 'L',
    'litres': 'L',
    'clove': 'clove',
    'cloves': 'clove',
    'slice': 'slice',
    'slices': 'slice',
    'whole': 'whole',
    'piece': 'piece',
    'pieces': 'piece',
    'bunch': 'bunch',
    'can': 'can',
    'box': 'box',
    'bag': 'bag',
    'head': 'head',
    'heads': 'head',
    'stalk': 'stalk',
    'stalks': 'stalk',
    'bottle': 'bottle',
    'bottles': 'bottle',
  }
  
  return unitMap[unitLower] || unitLower
}

/**
 * Check if two units can be combined (are equivalent)
 */
export function unitsMatch(unit1: string, unit2: string): boolean {
  return normalizeUnit(unit1) === normalizeUnit(unit2)
}

/**
 * Generate a matching key for an ingredient.
 * Uses ingredient_id if available, otherwise falls back to normalized name.
 */
export function getIngredientKey(item: { ingredient_id?: string | null; item_name?: string; name?: string }): string {
  if (item.ingredient_id) {
    return `id:${item.ingredient_id}`
  }
  const name = (item.item_name || item.name || '').toLowerCase().trim()
  return `name:${name}`
}

/**
 * Consolidate a list of ingredients, combining quantities for matching items.
 * Returns a map of unique ingredient keys to consolidated items.
 */
export function consolidateIngredients(
  items: Array<{
    ingredient_id?: string | null
    item_name: string
    quantity: string
    unit: string
  }>
): Map<string, {
  ingredient_id: string | null
  item_name: string
  quantity: number
  unit: string
  // Track all sources for debugging/auditing
  sources: Array<{ quantity: number; unit: string }>
}> {
  const consolidated = new Map()

  for (const item of items) {
    // Try to find a match by ingredient_id first
    let key: string
    let matchFound = false

    if (item.ingredient_id) {
      key = `id:${item.ingredient_id}`
      const existing = consolidated.get(key)
      
      if (existing) {
        // Same ingredient_id - can combine
        if (unitsMatch(existing.unit, item.unit)) {
          existing.quantity += normalizeQuantity(item.quantity)
          existing.sources.push({ quantity: normalizeQuantity(item.quantity), unit: item.unit })
          matchFound = true
        }
        // Different unit - treat as separate entry by creating a name-based key
        if (!matchFound) {
          key = `name:${item.item_name.toLowerCase().trim()}`
        }
      }
    }

    if (!matchFound) {
      // Fall back to name-based matching
      key = `name:${item.item_name.toLowerCase().trim()}`
      const existing = consolidated.get(key)

      if (existing) {
        // Same name - can combine if same unit
        if (unitsMatch(existing.unit, item.unit)) {
          existing.quantity += normalizeQuantity(item.quantity)
          existing.sources.push({ quantity: normalizeQuantity(item.quantity), unit: item.unit })
          matchFound = true
        }
        // Different unit - create separate entry
      }

      if (!matchFound) {
        // No match found - create new entry
        consolidated.set(key, {
          ingredient_id: item.ingredient_id || null,
          item_name: item.item_name,
          quantity: normalizeQuantity(item.quantity),
          unit: normalizeUnit(item.unit) || 'piece',
          sources: [{ quantity: normalizeQuantity(item.quantity), unit: item.unit }]
        })
      }
    }
  }

  return consolidated
}

/**
 * Find matching shopping list item for a given ingredient.
 * Returns the existing item if found and combinable, null otherwise.
 */
export function findMatchingShoppingItem(
  existingItems: ShoppingListItem[],
  newItem: { ingredient_id?: string | null; item_name: string; unit: string }
): ShoppingListItem | null {
  // First try to match by ingredient_id
  if (newItem.ingredient_id) {
    const byId = existingItems.find(
      item => item.ingredient_id === newItem.ingredient_id && unitsMatch(item.unit, newItem.unit)
    )
    if (byId) return byId
  }

  // Fall back to name matching
  const normalizedName = newItem.item_name.toLowerCase().trim()
  return existingItems.find(
    item => item.item_name.toLowerCase().trim() === normalizedName && unitsMatch(item.unit, newItem.unit)
  ) || null
}

/**
 * Build a map of existing shopping list items by their matching key.
 */
export function buildShoppingListMap(
  items: ShoppingListItem[]
): Map<string, ShoppingListItem[]> {
  const map = new Map()

  for (const item of items) {
    const key = getIngredientKey(item)
    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key)!.push(item)

    // Also add to name-based lookup for fallback matching
    const nameKey = `name:${item.item_name.toLowerCase().trim()}`
    if (key.startsWith('id:')) {
      if (!map.has(nameKey)) {
        map.set(nameKey, [])
      }
      map.get(nameKey)!.push(item)
    }
  }

  return map
}

/**
 * Format quantity for display
 */
export function formatQuantity(qty: number, unit: string): string {
  // Clean up floating point display
  const cleanQty = Math.round(qty * 100) / 100
  
  // If it's a whole number, don't show decimals
  if (cleanQty === Math.floor(cleanQty)) {
    return `${cleanQty} ${unit}`
  }
  return `${cleanQty} ${unit}`
}
