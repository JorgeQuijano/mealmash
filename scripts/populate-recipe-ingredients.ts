/**
 * Script to populate recipe_ingredients table from existing recipes
 * Run with: npx tsx scripts/populate-recipe-ingredients.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Normalize ingredient name for matching
function normalizeIngredient(ingredient: string): string {
  return ingredient
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
}

// Extract ingredient names from recipe (handles both string and object formats)
function getRecipeIngredientNames(ingredients: any): string[] {
  if (!ingredients) return []
  if (typeof ingredients === 'string') {
    return ingredients.split(',').map((i: string) => i.trim())
  }
  if (Array.isArray(ingredients)) {
    return ingredients.map((ing: any) => {
      if (typeof ing === 'string') return ing
      if (typeof ing === 'object' && ing?.item) return ing.item
      if (typeof ing === 'object' && ing?.name) return ing.name
      return ''
    }).filter(Boolean)
  }
  return []
}

async function populateRecipeIngredients() {
  console.log('Fetching all recipes...')
  
  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('id, name, ingredients')
  
  if (recipesError) {
    console.error('Error fetching recipes:', recipesError)
    return
  }
  
  console.log(`Found ${recipes.length} recipes`)
  
  // Clear existing recipe_ingredients
  console.log('Clearing existing recipe_ingredients...')
  await supabase.from('recipe_ingredients').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  let totalInserted = 0
  
  for (const recipe of recipes) {
    const ingredientNames = getRecipeIngredientNames(recipe.ingredients)
    console.log(`\nProcessing "${recipe.name}" (${ingredientNames.length} ingredients)`)
    
    for (const ingName of ingredientNames) {
      const normalized = normalizeIngredient(ingName)
      
      // Try to find matching ingredient in the ingredients table
      const { data: matchingIngredients } = await supabase
        .from('ingredients')
        .select('id, name, aliases')
        .eq('is_enabled', true)
        .or(`name.ilike.%${normalized}%,aliases.cs.{${normalized}}`)
        .limit(1)
      
      if (matchingIngredients && matchingIngredients.length > 0) {
        const ingredient = matchingIngredients[0]
        
        await supabase.from('recipe_ingredients').insert({
          recipe_id: recipe.id,
          ingredient_id: ingredient.id,
          quantity: null
        })
        
        console.log(`  ✓ Matched "${ingName}" -> ${ingredient.name}`)
        totalInserted++
      } else {
        console.log(`  ✗ No match for "${ingName}"`)
      }
    }
  }
  
  console.log(`\n✅ Done! Inserted ${totalInserted} recipe_ingredients`)
}

populateRecipeIngredients()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })
