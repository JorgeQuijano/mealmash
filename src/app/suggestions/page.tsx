"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getUser, getUserProfile, supabase } from "@/lib/supabase"
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

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import MobileNav from "@/components/mobile-nav"
import RecipeModal from "@/components/recipe-modal"

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

type Ingredient = {
  id: string
  name: string
  category: string
}

type PantryItem = {
  id: string
  name: string
  category: string
  quantity: string
  ingredient_id: string | null
}

type RecipeIngredient = {
  id: string
  recipe_id: string
  ingredient_id: string
  quantity: string | null
  ingredient?: Ingredient
}

type SuggestedRecipe = {
  recipe: Recipe
  matchedIngredients: Ingredient[]
  missingIngredients: Ingredient[]
  matchedCount: number
  totalCount: number
}

const categories = ["all", "breakfast", "lunch", "dinner", "snack", "dessert"]

export default function SuggestionsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([])
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRecipe, setSelectedRecipe] = useState<SuggestedRecipe | null>(null)
  const [addingToList, setAddingToList] = useState(false)
  const [addedToList, setAddedToList] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const recipesPerPage = 12

  useEffect(() => {
    async function loadData() {
      const currentUser = await getUser()
      
      if (!currentUser) {
        router.push("/login")
        return
      }
      
      setUser(currentUser)
      
      const { data } = await getUserProfile(currentUser.id)
      setProfile(data)
      
      await Promise.all([
        loadPantryItems(currentUser.id),
        loadRecipes(),
        loadRecipeIngredients(),
        loadIngredients()
      ])
      
      setLoading(false)
    }
    
    loadData()
  }, [router])

  async function loadPantryItems(userId: string) {
    const { data, error } = await supabase
      .from("pantry_items")
      .select("*")
      .eq("user_id", userId)

    if (!error && data) {
      setPantryItems(data)
    }
  }

  async function loadRecipes() {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
    
    if (data) {
      setRecipes(data)
    }
  }

  async function loadRecipeIngredients() {
    const { data, error } = await supabase
      .from("recipe_ingredients")
      .select("id, recipe_id, ingredient_id, quantity")
    
    if (data) {
      setRecipeIngredients(data)
    }
  }

  async function loadIngredients() {
    const { data, error } = await supabase
      .from("ingredients")
      .select("id, name, category")
      .eq("is_enabled", true)
    
    if (data) {
      setAllIngredients(data)
    }
  }

  // Build ingredient lookup map
  const ingredientMap = useMemo(() => {
    const map = new Map<string, Ingredient>()
    for (const ing of allIngredients) {
      map.set(ing.id, ing)
    }
    return map
  }, [allIngredients])

  // Build pantry ingredient IDs set
  const pantryIngredientIds = useMemo(() => {
    const set = new Set<string>()
    for (const item of pantryItems) {
      if (item.ingredient_id) {
        set.add(item.ingredient_id)
      }
    }
    return set
  }, [pantryItems])

  // Calculate suggested recipes based on pantry items
  const suggestedRecipes = useMemo((): SuggestedRecipe[] => {
    if (pantryItems.length === 0 || recipes.length === 0 || recipeIngredients.length === 0) return []
    
    // Group recipe ingredients by recipe_id
    const recipeIngMap = new Map<string, RecipeIngredient[]>()
    for (const ri of recipeIngredients) {
      if (!recipeIngMap.has(ri.recipe_id)) {
        recipeIngMap.set(ri.recipe_id, [])
      }
      recipeIngMap.get(ri.recipe_id)!.push(ri)
    }
    
    const suggestions: SuggestedRecipe[] = []
    
    for (const recipe of recipes) {
      const rIngList = recipeIngMap.get(recipe.id) || []
      
      if (rIngList.length === 0) continue
      
      const matched: Ingredient[] = []
      const missing: Ingredient[] = []
      
      for (const ri of rIngList) {
        const ingredient = ingredientMap.get(ri.ingredient_id)
        if (!ingredient) continue
        
        if (pantryIngredientIds.has(ri.ingredient_id)) {
          matched.push(ingredient)
        } else {
          missing.push(ingredient)
        }
      }
      
      // Only include recipes with 3+ matched ingredients
      if (matched.length >= 3) {
        suggestions.push({
          recipe,
          matchedIngredients: matched,
          missingIngredients: missing,
          matchedCount: matched.length,
          totalCount: rIngList.length
        })
      }
    }
    
    // Sort by matched count (highest first)
    return suggestions.sort((a, b) => b.matchedCount - a.matchedCount)
  }, [pantryItems, recipes, recipeIngredients, ingredientMap, pantryIngredientIds])

  // Filter by category
  const displayedRecipes = selectedCategory === "all" 
    ? suggestedRecipes 
    : suggestedRecipes.filter(s => 
        s.recipe.category && parseCategory(s.recipe.category).includes(selectedCategory)
      )

  // Paginate
  const totalCount = displayedRecipes.length
  const paginatedRecipes = displayedRecipes.slice(
    (currentPage - 1) * recipesPerPage,
    currentPage * recipesPerPage
  )

  const getCategoryColor = (category: string | string[]) => {
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

  const getMatchColor = (matched: number, total: number) => {
    const percentage = total > 0 ? (matched / total) * 100 : 0
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    return "bg-orange-500"
  }

  async function addMissingToShoppingList(missingIngredients: Ingredient[]) {
    if (!user || addingToList) return
    
    setAddingToList(true)
    
    try {
      for (const ing of missingIngredients) {
        await supabase.from("shopping_list").insert({
          user_id: user.id,
          item_name: ing.name,
          quantity: "1",
          is_checked: false,
          ingredient_id: ing.id
        })
      }
      
      setAddedToList(true)
      setTimeout(() => setAddedToList(false), 2000)
    } catch (err) {
      console.error("Error adding to shopping list:", err)
    } finally {
      setAddingToList(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-safe">
      
      <MobileNav />

      <main className="container mx-auto px-4 py-3 md:py-8">
        {/* Hero - hidden on mobile to save space */}
        <div className="text-center mb-4 hidden md:block">
          <h2 className="text-2xl md:text-4xl font-bold mb-2">🍳 What Can I Make?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find recipes that match what you have in your pantry
          </p>
        </div>

        {/* Pantry Summary */}
        {pantryItems.length > 0 && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              📦 You have <span className="font-semibold text-foreground">{pantryItems.length}</span> items in your pantry
            </p>
          </div>
        )}

        {/* Category Filters */}
        <div className="mb-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className="capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Empty Pantry State */}
        {pantryItems.length === 0 && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Your pantry is empty! 🥕</CardTitle>
              <CardDescription className="text-center">
                Add items to your pantry to see recipe suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => router.push("/pantry")}>
                Go to Pantry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No Matches */}
        {pantryItems.length > 0 && displayedRecipes.length === 0 && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">No matches yet 😔</CardTitle>
              <CardDescription className="text-center">
                Add at least 3 matching ingredients to your pantry to see suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push("/pantry")}>
                Add Pantry Items
              </Button>
              <Button variant="outline" onClick={() => router.push("/recipes")}>
                Browse Recipes
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Suggestions Grid */}
        {paginatedRecipes.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-0 lg:gap-6">
            {paginatedRecipes.map((suggestion) => (
              <Card 
                key={suggestion.recipe.id}
                className="hover:shadow-lg transition-shadow cursor-pointer py-0"
                onClick={() => setSelectedRecipe(suggestion)}
              >
                <CardHeader className="p-3 pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{suggestion.recipe.name}</CardTitle>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {parseCategory(suggestion.recipe.category).map((cat) => (
                        <Badge key={cat} className={getCategoryColor(cat)}>
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-1 hidden md:block">
                    {suggestion.recipe.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-2 space-y-2">
                  {/* Match Count */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Match</span>
                      <span className="font-semibold">
                        {suggestion.matchedCount}/{suggestion.totalCount}
                      </span>
                    </div>
                    <Progress 
                      value={(suggestion.matchedCount / suggestion.totalCount) * 100} 
                      className="h-1.5"
                      indicatorClassName={getMatchColor(suggestion.matchedCount, suggestion.totalCount)}
                    />
                  </div>

                  {/* Missing Ingredients Preview */}
                  {suggestion.missingIngredients.length > 0 && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Missing: </span>
                      <span className="text-orange-600">
                        {suggestion.missingIngredients.slice(0, 2).map(i => i.name).join(", ")}
                        {suggestion.missingIngredients.length > 2 && ` +${suggestion.missingIngredients.length - 2}`}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalCount > recipesPerPage && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {Math.ceil(totalCount / recipesPerPage)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= Math.ceil(totalCount / recipesPerPage)}
            >
              Next
            </Button>
          </div>
        )}

        {/* Recipe Detail Modal */}
        {selectedRecipe && (
          <RecipeModal
            recipe={selectedRecipe}
            user={user}
            pantryItems={pantryItems as any}
            onClose={() => setSelectedRecipe(null)}
            isSuggested={true}
          />
        )}
      </main>
    </div>
  )
}
