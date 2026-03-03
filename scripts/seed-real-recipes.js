/**
 * MealMash Seed Script - Real Recipes with Proper Ingredients
 * Reads from real-recipes.json and populates database with verified recipes
 * 
 * Run: cd mealmash && node scripts/seed-real-recipes.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Load recipes from JSON file
const recipesPath = path.join(__dirname, 'real-recipes.json')
const recipesData = JSON.parse(fs.readFileSync(recipesPath, 'utf-8'))

console.log(`📂 Loaded ${recipesData.length} recipes from JSON`)

// Build ingredient lookup (exact + aliases)
async function buildIngredientLookup() {
  const { data: ingredients, error } = await supabase
    .from('ingredients')
    .select('id, name, category, aliases')
  
  if (error) {
    console.error('Error loading ingredients:', error)
    process.exit(1)
  }
  
  console.log(`📦 Loaded ${ingredients.length} ingredients from database`)
  
  // Build lookup maps
  const byName = new Map()
  const byAlias = new Map()
  
  for (const ing of ingredients) {
    // Map lowercase name to ingredient
    byName.set(ing.name.toLowerCase(), ing)
    
    // Map aliases
    if (ing.aliases && Array.isArray(ing.aliases)) {
      for (const alias of ing.aliases) {
        byAlias.set(alias.toLowerCase(), ing)
      }
    }
  }
  
  return { byName, byAlias, ingredients }
}

function findIngredient(name, { byName, byAlias }) {
  const searchName = name.toLowerCase().trim()
  
  // Try exact match first
  if (byName.has(searchName)) {
    return byName.get(searchName)
  }
  
  // Try alias match
  if (byAlias.has(searchName)) {
    return byAlias.get(searchName)
  }
  
  // Try partial match (contains)
  for (const [key, ing] of byName) {
    if (key.includes(searchName) || searchName.includes(key)) {
      return ing
    }
  }
  
  return null // Not found
}

async function seedRecipes() {
  console.log('\n🔍 Building ingredient lookup...')
  const ingredientLookup = await buildIngredientLookup()
  
  console.log('\n📝 Seeding recipes...\n')
  
  let successCount = 0
  let skipCount = 0
  let warningCount = 0
  const warnings = []
  
  for (let i = 0; i < recipesData.length; i++) {
    const recipe = recipesData[i]
    console.log(`[${i + 1}/${recipesData.length}] ${recipe.name}...`)
    
    try {
      // 1. Insert recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          name: recipe.name,
          description: recipe.description || `${recipe.name} - a delicious recipe`,
          ingredients: JSON.stringify([]), // Required by schema but we use recipe_ingredients
          category: recipe.category,
          instructions: recipe.instructions,
          prep_time_minutes: recipe.prep_time_minutes,
          cook_time_minutes: recipe.cook_time_minutes,
          servings: recipe.servings,
          image_url: ''
        })
        .select()
        .single()
      
      if (recipeError) {
        console.log(`   ⚠️ Recipe insert failed: ${recipeError.message}`)
        skipCount++
        continue
      }
      
      // 2. Match and insert ingredients
      let ingredientsMatched = 0
      
      for (const ing of recipe.ingredients) {
        const matchedIng = findIngredient(ing.name, ingredientLookup)
        
        if (matchedIng) {
          const { error: riError } = await supabase
            .from('recipe_ingredients')
            .insert({
              recipe_id: recipeData.id,
              ingredient_id: matchedIng.id,
              quantity: ing.quantity
            })
          
          if (!riError) {
            ingredientsMatched++
          }
        } else {
          warningCount++
          warnings.push(`"${recipe.name}": could not find ingredient "${ing.name}"`)
        }
      }
      
      console.log(`   ✅ Added (${ingredientsMatched}/${recipe.ingredients.length} ingredients matched)`)
      successCount++
      
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`)
      skipCount++
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 SEED SUMMARY')
  console.log('='.repeat(50))
  console.log(`✅ Recipes inserted: ${successCount}`)
  console.log(`⚠️ Skipped: ${skipCount}`)
  console.log(`⚠️ Ingredients not found: ${warningCount}`)
  
  if (warnings.length > 0) {
    console.log('\n⚠️ Warnings:')
    warnings.forEach(w => console.log(`   - ${w}`))
  }
  
  // Show final count
  const { count } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n📈 Total recipes in database: ${count}`)
  
  const { count: riCount } = await supabase
    .from('recipe_ingredients')
    .select('*', { count: 'exact', head: true })
  
  console.log(`📈 Total recipe_ingredients: ${riCount}`)
}

seedRecipes()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch(err => {
    console.error('❌ Error:', err)
    process.exit(1)
  })
