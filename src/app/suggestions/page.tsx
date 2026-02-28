"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getUser, getUserProfile, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import DesktopNav from "@/components/desktop-nav"
import MobileNav from "@/components/mobile-nav"

type Recipe = {
  id: string
  name: string
  description: string
  ingredients: any
  instructions: string[]
  category: string
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
  const filteredSuggestions = selectedCategory === "all" 
    ? suggestedRecipes 
    : suggestedRecipes.filter(s => s.recipe.category === selectedCategory)

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      breakfast: "bg-yellow-100 text-yellow-800",
      lunch: "bg-green-100 text-green-800",
      dinner: "bg-orange-100 text-orange-800",
      snack: "bg-purple-100 text-purple-800",
      dessert: "bg-pink-100 text-pink-800"
    }
    return colors[category] || "bg-gray-100 text-gray-800"
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
      <DesktopNav />
      <MobileNav />

      <main className="container mx-auto px-4 py-8">
        {/* Pantry Summary */}
        {pantryItems.length > 0 && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              📦 You have <span className="font-semibold text-foreground">{pantryItems.length}</span> items in your pantry
            </p>
          </div>
        )}

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
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
        {pantryItems.length > 0 && filteredSuggestions.length === 0 && (
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
        {filteredSuggestions.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuggestions.map((suggestion) => (
              <Card 
                key={suggestion.recipe.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedRecipe(suggestion)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{suggestion.recipe.name}</CardTitle>
                    <Badge className={getCategoryColor(suggestion.recipe.category)}>
                      {suggestion.recipe.category}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {suggestion.recipe.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Match Count */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Ingredients Match</span>
                      <span className="font-semibold">
                        {suggestion.matchedCount}/{suggestion.totalCount}
                      </span>
                    </div>
                    <Progress 
                      value={(suggestion.matchedCount / suggestion.totalCount) * 100} 
                      className="h-2"
                      indicatorClassName={getMatchColor(suggestion.matchedCount, suggestion.totalCount)}
                    />
                  </div>

                  {/* Missing Ingredients Preview */}
                  {suggestion.missingIngredients.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Missing: </span>
                      <span className="text-orange-600">
                        {suggestion.missingIngredients.slice(0, 3).map(i => i.name).join(", ")}
                        {suggestion.missingIngredients.length > 3 && ` +${suggestion.missingIngredients.length - 3} more`}
                      </span>
                    </div>
                  )}

                  <Button className="w-full" onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRecipe(suggestion)
                  }}>
                    Start Cooking
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recipe Detail Modal */}
        {selectedRecipe && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setSelectedRecipe(null)}
          >
            <Card 
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedRecipe.recipe.name}</CardTitle>
                    <CardDescription className="mt-2">{selectedRecipe.recipe.description}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRecipe(null)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Match Info */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Ingredient Match</span>
                    <span className="text-lg font-bold">
                      {selectedRecipe.matchedCount}/{selectedRecipe.totalCount}
                    </span>
                  </div>
                  <Progress 
                    value={(selectedRecipe.matchedCount / selectedRecipe.totalCount) * 100} 
                    className="h-3"
                    indicatorClassName={getMatchColor(selectedRecipe.matchedCount, selectedRecipe.totalCount)}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Badge className={getCategoryColor(selectedRecipe.recipe.category)}>
                    {selectedRecipe.recipe.category}
                  </Badge>
                  <span className="text-sm">⏱️ Prep: {selectedRecipe.recipe.prep_time_minutes} min</span>
                  <span className="text-sm">🍳 Cook: {selectedRecipe.recipe.cook_time_minutes} min</span>
                  <span className="text-sm">👥 {selectedRecipe.recipe.servings} servings</span>
                </div>

                {/* Ingredients with Match Status */}
                <div>
                  <h3 className="font-semibold mb-3">Ingredients</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedRecipe.matchedIngredients.map((ing, i) => (
                      <div 
                        key={`matched-${i}`}
                        className="flex items-center gap-2 p-2 rounded bg-green-50 text-green-700"
                      >
                        <span>✅</span>
                        <span className="text-sm">{ing.name}</span>
                      </div>
                    ))}
                    {selectedRecipe.missingIngredients.map((ing, i) => (
                      <div 
                        key={`missing-${i}`}
                        className="flex items-center gap-2 p-2 rounded bg-orange-50 text-orange-700"
                      >
                        <span>❌</span>
                        <span className="text-sm">{ing.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Ingredients to Buy */}
                {selectedRecipe.missingIngredients.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-semibold mb-2">🛒 Missing Ingredients</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Add these to your shopping list:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.missingIngredients.map((ing, i) => (
                        <Badge key={i} variant="outline" className="bg-white">
                          {ing.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div>
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedRecipe.recipe.instructions?.map((step, i) => (
                      <li key={i} className="text-muted-foreground">{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      if (selectedRecipe.missingIngredients.length > 0) {
                        addMissingToShoppingList(selectedRecipe.missingIngredients)
                      }
                    }}
                    disabled={addingToList || selectedRecipe.missingIngredients.length === 0}
                  >
                    {addingToList 
                      ? "Adding..." 
                      : addedToList 
                        ? "✓ Added to Shopping List!" 
                        : `🛒 Add Missing (${selectedRecipe.missingIngredients.length}) to List`
                    }
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => router.push("/shopping-list")}
                  >
                    View Shopping List
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
