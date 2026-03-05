"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getUser, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Recipe = {
  id: string
  name: string
  description: string
  ingredients: any
  instructions: string[]
  category: string[]
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  image_url: string
}

type PantryItem = {
  id: string
  name: string
  quantity: string
  ingredient_id: string | null
  expires_at: string | null
}

type RecipeIngredient = {
  id: string
  recipe_id: string
  ingredient_id: string
  quantity: string | null
}

type MatchedRecipe = {
  recipe: Recipe
  matchPercentage: number
  matchedIngredients: string[]
  missingIngredients: string[]
}

type ExpiringRecipeModalProps = {
  expiringItem: PantryItem
  onClose: () => void
}

export default function ExpiringRecipeModal({ expiringItem, onClose }: ExpiringRecipeModalProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([])
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([])
  const [matchedRecipes, setMatchedRecipes] = useState<MatchedRecipe[]>([])

  useEffect(() => {
    async function loadData() {
      const currentUser = await getUser()
      if (!currentUser) return
      
      setUser(currentUser)

      // Get all recipes
      const { data: allRecipes } = await supabase
        .from('recipes')
        .select('*')
      
      // Get all recipe ingredients
      const { data: allRecipeIngs } = await supabase
        .from('recipe_ingredients')
        .select('id, recipe_id, ingredient_id, quantity')
      
      // Get user's pantry items
      const { data: pantry } = await supabase
        .from('pantry_items')
        .select('id, name, quantity, ingredient_id, expires_at')
        .eq('user_id', currentUser.id)
      
      if (allRecipes && allRecipeIngs && pantry) {
        setRecipes(allRecipes)
        setRecipeIngredients(allRecipeIngs)
        setPantryItems(pantry)
        
        // Find recipes matching the expiring item's ingredient
        const matches = findMatchingRecipes(
          allRecipes, 
          allRecipeIngs, 
          pantry, 
          expiringItem.ingredient_id
        )
        setMatchedRecipes(matches)
      }
      
      setLoading(false)
    }
    
    loadData()
  }, [expiringItem])

  function findMatchingRecipes(
    allRecipes: Recipe[],
    allRecipeIngs: RecipeIngredient[],
    pantry: PantryItem[],
    expiringIngredientId: string | null
  ): MatchedRecipe[] {
    // Get user's pantry ingredient IDs
    const pantryIngredientIds = new Set(
      pantry
        .filter(p => p.ingredient_id)
        .map(p => p.ingredient_id)
    )

    // If we have an ingredient_id, find recipes with that ingredient
    // Otherwise, match by name
    let relevantRecipeIds: Set<string>
    
    if (expiringIngredientId) {
      relevantRecipeIds = new Set(
        allRecipeIngs
          .filter(ri => ri.ingredient_id === expiringIngredientId)
          .map(ri => ri.recipe_id)
      )
    } else {
      // Match by name - find recipes containing this pantry item name
      const itemName = expiringItem.name.toLowerCase()
      relevantRecipeIds = new Set(
        allRecipeIngs
          .map(ri => {
            // Check if any ingredient matches the pantry item name
            const ing = allRecipeIngs.find(i => i.id === ri.id)
            return ri.recipe_id
          })
      )
    }

    const matches: MatchedRecipe[] = []

    for (const recipe of allRecipes) {
      // Get all ingredients for this recipe
      const recipeIngs = allRecipeIngs.filter(ri => ri.recipe_id === recipe.id)
      
      if (recipeIngs.length === 0) continue

      // Get ingredient IDs for this recipe
      const recipeIngIds = recipeIngs.map(ri => ri.ingredient_id).filter(Boolean)

      // Count matches
      const matched: string[] = []
      const missing: string[] = []

      for (const ingId of recipeIngIds) {
        if (pantryIngredientIds.has(ingId)) {
          matched.push(ingId)
        } else {
          missing.push(ingId)
        }
      }

      const matchPercentage = (matched.length / recipeIngIds.length) * 100

      // Only include recipes with 70%+ match
      if (matchPercentage >= 70) {
        matches.push({
          recipe,
          matchPercentage,
          matchedIngredients: matched,
          missingIngredients: missing
        })
      }
    }

    // Sort by match percentage (highest first)
    return matches.sort((a, b) => b.matchPercentage - a.matchPercentage)
  }

  const fullMatches = matchedRecipes.filter(r => r.matchPercentage === 100)
  const partialMatches = matchedRecipes.filter(r => r.matchPercentage >= 70 && r.matchPercentage < 100)

  const handleSelectRecipe = (recipe: Recipe) => {
    onClose()
    router.push(`/recipes/${recipe.id}`)
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <Card 
        className="max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-bold text-lg">
              🥕 {expiringItem.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Expires: {expiringItem.expires_at ? new Date(expiringItem.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : 'N/A'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : matchedRecipes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No matching recipes found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adding more items to your pantry
              </p>
            </div>
          ) : (
            <>
              {/* Full Matches */}
              {fullMatches.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    ✅ You Have All Ingredients
                    <Badge className="bg-green-500">{fullMatches.length}</Badge>
                  </h4>
                  <div className="space-y-2">
                    {fullMatches.map((match) => (
                      <Card 
                        key={match.recipe.id}
                        className="cursor-pointer hover:shadow-md transition-shadow border-green-200 dark:border-green-800"
                        onClick={() => handleSelectRecipe(match.recipe)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{match.recipe.name}</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {Array.isArray(match.recipe.category) ? match.recipe.category[0] : match.recipe.category}
                              </p>
                            </div>
                            <Button size="sm">
                              Cook →
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Partial Matches */}
              {partialMatches.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    🔶 Missing 1-2 Ingredients
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{partialMatches.length}</Badge>
                  </h4>
                  <div className="space-y-2">
                    {partialMatches.map((match) => (
                      <Card 
                        key={match.recipe.id}
                        className="cursor-pointer hover:shadow-md transition-shadow border-yellow-200 dark:border-yellow-800"
                        onClick={() => handleSelectRecipe(match.recipe)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{match.recipe.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {Math.round(match.matchPercentage)}% match
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              View →
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
