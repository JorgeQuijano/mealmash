"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
// Helper to parse category from any format to string array
function parseCategory(cat: any): string[] {
  if (Array.isArray(cat)) return cat
  if (typeof cat === "string") {
    try {
      const parsed = JSON.parse(cat)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return [cat]
    }
  }
  return [String(cat)]
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

type RecipeIngredient = {
  ingredient_id: string
  quantity: string
  quantity_num?: number
  unit?: string
  ingredients: {
    name: string
    category: string
  }
}

type PantryItem = {
  id: string
  name: string
  quantity: string
  ingredient_id: string | null
  user_id: string
}

type Recipe = {
  id: string
  name: string
  description: string
  instructions: string[]
  category: string[]  // Now supports multiple categories
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  image_url: string
  recipe_ingredients?: RecipeIngredient[]
}

type User = {
  id: string
  email: string
}

type SuggestedRecipe = {
  recipe: Recipe
  matchedIngredients: { id: string; name: string; category: string }[]
  missingIngredients: { id: string; name: string; category: string }[]
  matchedCount: number
  totalCount: number
}

type RecipeModalProps = {
  recipe: Recipe | SuggestedRecipe
  user: User | null
  pantryItems: PantryItem[]
  onClose: () => void
  onAddToShoppingList?: (missing: any[]) => Promise<void>
  isSuggested?: boolean
}

function isSuggestedRecipe(recipe: Recipe | SuggestedRecipe): recipe is SuggestedRecipe {
  return 'matchedIngredients' in recipe && 'missingIngredients' in recipe
}

function getCategoryColor(category: string | string[]) {
  const cat = Array.isArray(category) ? category[0] : category
  const colors: Record<string, string> = {
    breakfast: "bg-yellow-100 text-yellow-800",
    lunch: "bg-green-100 text-green-800",
    dinner: "bg-orange-100 text-orange-800",
    snack: "bg-purple-100 text-purple-800",
    dessert: "bg-pink-100 text-pink-800"
  }
  return colors[cat] || "bg-gray-100 text-gray-800"
}

function getMatchColor(matched: number, total: number) {
  const percentage = total > 0 ? (matched / total) * 100 : 0
  if (percentage >= 80) return "bg-green-500"
  if (percentage >= 60) return "bg-yellow-500"
  return "bg-orange-500"
}

export default function RecipeModal({ 
  recipe: initialRecipe, 
  user, 
  pantryItems, 
  onClose,
  onAddToShoppingList,
  isSuggested = false 
}: RecipeModalProps) {
  const [addingToList, setAddingToList] = useState(false)
  const [addedToList, setAddedToList] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [checkingFavorite, setCheckingFavorite] = useState(false)
  const [updatingFavorite, setUpdatingFavorite] = useState(false)

  // Get the actual recipe ID
  const recipeId = isSuggestedRecipe(initialRecipe) 
    ? initialRecipe.recipe.id 
    : (initialRecipe as Recipe).id

  // Check if recipe is already favorited
  useEffect(() => {
    if (!user || !recipeId) return

    const checkFavorite = async () => {
      setCheckingFavorite(true)
      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('*')
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId)
          .single()
        
        if (data) {
          setIsFavorite(true)
        }
      } catch (err) {
        console.error('Error checking favorite:', err)
      } finally {
        setCheckingFavorite(false)
      }
    }

    checkFavorite()
  }, [user, recipeId])

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!user || !recipeId) return

    setUpdatingFavorite(true)
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId)
        
        if (!error) {
          setIsFavorite(false)
        }
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            recipe_id: recipeId
          })
        
        if (!error) {
          setIsFavorite(true)
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
    } finally {
      setUpdatingFavorite(false)
    }
  }

  // For recipes page: need to compute match from pantryItems
  const isLoggedIn = !!user
  const isRecipeMode = !isSuggested && 'recipe_ingredients' in initialRecipe
  
  let matchedIngredients: { id: string; name: string; category: string }[] = []
  let missingIngredients: { id: string; name: string; category: string }[] = []
  let matchedCount = 0
  let totalCount = 0

  if (isSuggestedRecipe(initialRecipe)) {
    matchedIngredients = initialRecipe.matchedIngredients
    missingIngredients = initialRecipe.missingIngredients
    matchedCount = initialRecipe.matchedCount
    totalCount = initialRecipe.totalCount
  } else if (isRecipeMode && pantryItems.length > 0) {
    const recipe = initialRecipe as Recipe
    
    // Create a map of ingredient_id -> pantry quantity
    const pantryMap = new Map<string, number>()
    pantryItems.forEach(p => {
      if (p.ingredient_id) {
        // Parse quantity from pantry (try to extract number)
        const qty = parseFloat(p.quantity) || 0
        pantryMap.set(p.ingredient_id, qty)
      }
    })
    
    recipe.recipe_ingredients?.forEach((ri) => {
      const pantryQty = pantryMap.get(ri.ingredient_id) || 0
      const recipeQty = ri.quantity_num || 1
      const neededQty = recipeQty - pantryQty
      
      if (pantryQty >= recipeQty) {
        // Has enough - show in green
        matchedIngredients.push({
          id: ri.ingredient_id,
          name: ri.ingredients?.name || '',
          category: ri.ingredients?.category || ''
        })
      } else {
        // Missing or partial - show in yellow/red
        missingIngredients.push({
          id: ri.ingredient_id,
          name: ri.ingredients?.name || '',
          category: ri.ingredients?.category || ''
        })
      }
    })
    
    matchedCount = matchedIngredients.length
    totalCount = recipe.recipe_ingredients?.length || 0
  }

  const recipe = isSuggestedRecipe(initialRecipe) ? initialRecipe.recipe : initialRecipe

  const handleAddToShoppingList = async () => {
    if (missingIngredients.length === 0) return
    
    if (onAddToShoppingList) {
      setAddingToList(true)
      await onAddToShoppingList(missingIngredients)
      setAddingToList(false)
      setAddedToList(true)
      setTimeout(() => setAddedToList(false), 3000)
    } else if (user) {
      // Default implementation
      setAddingToList(true)
      
      for (const ing of missingIngredients) {
        const { data: existing } = await supabase
          .from("shopping_list")
          .select("id, quantity")
          .eq("user_id", user.id)
          .ilike("item_name", ing.name)
          .single()
        
        if (existing) {
          await supabase
            .from("shopping_list")
            .update({ quantity: `${existing.quantity} + 1` })
            .eq("id", existing.id)
        } else {
          await supabase.from("shopping_list").insert({
            user_id: user.id,
            item_name: ing.name,
            quantity: "1",
            ingredient_id: ing.id,
            is_checked: false
          })
        }
      }
      
      setAddingToList(false)
      setAddedToList(true)
      setShowConfirmModal(false)
      setTimeout(() => setAddedToList(false), 3000)
    }
  }

  const showIngredientMatch = isLoggedIn && totalCount > 0

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <Card 
          className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="flex-shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{recipe.name}</CardTitle>
                <CardDescription className="mt-2">{recipe.description}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1 pb-safe space-y-6">
            {/* Ingredient Match Progress (logged in users only) */}
            {showIngredientMatch && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Ingredient Match</span>
                  <span className="text-lg font-bold">
                    {matchedCount}/{totalCount}
                  </span>
                </div>
                <Progress 
                  value={(matchedCount / totalCount) * 100} 
                  className="h-3"
                  indicatorClassName={getMatchColor(matchedCount, totalCount)}
                />
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    ✅ {matchedCount} in pantry
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    ❌ {missingIngredients.length} missing
                  </Badge>
                </div>
              </div>
            )}

            {/* Category, Times, Servings */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1">
                {parseCategory(recipe.category).map((cat) => (
                  <Badge key={cat} className={getCategoryColor(cat)}>
                    {cat}
                  </Badge>
                ))}
              </div>
              <span className="text-sm">⏱️ Prep: {recipe.prep_time_minutes} min</span>
              <span className="text-sm">🍳 Cook: {recipe.cook_time_minutes} min</span>
              <span className="text-sm">👥 {recipe.servings} servings</span>
            </div>

            {/* Ingredients Grid (if logged in) */}
            {showIngredientMatch && (
              <div>
                <h3 className="font-semibold mb-3">Ingredients</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Create a map with quantities for display */}
                  {(() => {
                    const pantryMap = new Map<string, { qty: number; name: string }>()
                    pantryItems.forEach(p => {
                      if (p.ingredient_id) {
                        const qty = parseFloat(p.quantity) || 0
                        pantryMap.set(p.ingredient_id, { qty, name: p.name })
                      }
                    })
                    
                    return (recipe as Recipe).recipe_ingredients?.map((ri: RecipeIngredient, i: number) => {
                      const pantryQty = pantryMap.get(ri.ingredient_id)?.qty || 0
                      const recipeQty = ri.quantity_num || 1
                      const have = pantryQty
                      const need = recipeQty
                      
                      let colorClass = ''
                      let colorDot = ''
                      if (have >= need) {
                        colorClass = 'bg-green-50 text-green-700 border-green-200'
                        colorDot = '🟢'
                      } else if (have > 0) {
                        colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        colorDot = '🟡'
                      } else {
                        colorClass = 'bg-red-50 text-red-700 border-red-200'
                        colorDot = '🔴'
                      }
                      
                      return (
                        <div 
                          key={`ing-${i}`}
                          className={`flex items-center gap-2 p-2 rounded border ${colorClass}`}
                        >
                          <span>{colorDot}</span>
                          <span className="text-sm flex-1">{ri.ingredients?.name}</span>
                          <span className="text-xs font-mono">{have}/{need}</span>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            )}

            {/* Simple Ingredients List (if not logged in) */}
            {!showIngredientMatch && (
              <div>
                <h3 className="font-semibold mb-2">Ingredients</h3>
                <ul className="list-disc list-inside space-y-1">
                  {(recipe as Recipe).recipe_ingredients?.map((ing: RecipeIngredient, i: number) => (
                    <li key={i} className="text-muted-foreground">
                      {ing.quantity_num || ing.quantity}{ing.unit ? ` ${ing.unit}` : ''} {ing.ingredients?.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add to Shopping List Button (if logged in and has missing) */}
            {isLoggedIn && missingIngredients.length > 0 && (
              <>
                <Button 
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  🛒 Add {missingIngredients.length} Missing to Shopping List
                </Button>
                
                {addedToList && (
                  <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    ✅ Added to shopping list!
                  </div>
                )}
              </>
            )}

            {/* Instructions */}
            <div>
              <h3 className="font-semibold mb-2">Instructions</h3>
              <ol className="list-decimal list-inside space-y-2">
                {recipe.instructions?.map((step, i) => (
                  <li key={i} className="text-muted-foreground">{step}</li>
                ))}
              </ol>
            </div>

            {/* Add to Favorites Button */}
            {isLoggedIn ? (
              <Button 
                onClick={handleToggleFavorite}
                disabled={checkingFavorite || updatingFavorite}
                className={`w-full ${isFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-pink-500 hover:bg-pink-600'}`}
              >
                {checkingFavorite ? '⏳ Checking...' : 
                 updatingFavorite ? '⏳ Saving...' :
                 isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  // Could show a login prompt here
                  alert('Please log in to save favorites!')
                }}
                className="w-full bg-gray-400 cursor-not-allowed"
              >
                🔒 Log in to Save Favorites
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm Add to Shopping List Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-background rounded-lg p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2">Add Missing Ingredients</h3>
            <p className="text-muted-foreground mb-4">
              Add the following {missingIngredients.length} items to your shopping list?
            </p>
            
            <ul className="mb-4 max-h-60 overflow-auto border rounded p-2">
              {missingIngredients.map((ing, i) => (
                <li key={i} className="py-1 text-red-500">
                  ❌ {ing.name}
                </li>
              ))}
            </ul>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToShoppingList}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                disabled={addingToList}
              >
                {addingToList ? "Adding..." : "Add to Shopping List"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
