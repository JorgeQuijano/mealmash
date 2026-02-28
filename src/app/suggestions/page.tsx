"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getUser, getUserProfile, signOut, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

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

type PantryItem = {
  id: string
  name: string
  category: string
  quantity: string
}

type SuggestedRecipe = {
  recipe: Recipe
  matchedIngredients: string[]
  missingIngredients: string[]
  matchPercentage: number
  totalIngredients: number
}

const categories = ["all", "breakfast", "lunch", "dinner", "snack", "dessert"]

// Normalize ingredient for matching
function normalizeIngredient(ingredient: string): string {
  return ingredient
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
}

// Check if pantry item matches recipe ingredient
function isMatch(pantryItem: string, recipeIngredient: string): boolean {
  const normalizedPantry = normalizeIngredient(pantryItem)
  const normalizedRecipe = normalizeIngredient(recipeIngredient)
  
  // Exact match
  if (normalizedPantry === normalizedRecipe) return true
  
  // Partial match - pantry item is contained in recipe ingredient or vice versa
  if (normalizedPantry.includes(normalizedRecipe) || normalizedRecipe.includes(normalizedPantry)) {
    return true
  }
  
  // Check individual words
  const pantryWords = normalizedPantry.split(/\s+/)
  const recipeWords = normalizedRecipe.split(/\s+/)
  
  // If any word from pantry matches any word from recipe (length > 2 to avoid matches like "a", "in")
  const meaningfulPantryWords = pantryWords.filter(w => w.length > 2)
  const meaningfulRecipeWords = recipeWords.filter(w => w.length > 2)
  
  for (const pw of meaningfulPantryWords) {
    for (const rw of meaningfulRecipeWords) {
      if (pw === rw || pw.includes(rw) || rw.includes(pw)) {
        return true
      }
    }
  }
  
  return false
}

// Extract ingredient names from recipe (handles both string and object formats)
function getRecipeIngredientNames(ingredients: any): string[] {
  if (!ingredients) return []
  if (typeof ingredients === "string") {
    return ingredients.split(",").map((i: string) => i.trim())
  }
  if (Array.isArray(ingredients)) {
    return ingredients.map((ing: any) => {
      if (typeof ing === "string") return ing
      if (typeof ing === "object" && ing?.item) return ing.item
      return ""
    }).filter(Boolean)
  }
  return []
}

export default function SuggestionsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRecipe, setSelectedRecipe] = useState<SuggestedRecipe | null>(null)

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
        loadRecipes()
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

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  // Calculate suggested recipes based on pantry items
  const suggestedRecipes = useMemo((): SuggestedRecipe[] => {
    if (pantryItems.length === 0 || recipes.length === 0) return []
    
    const pantryNames = pantryItems.map(p => p.name)
    
    const suggestions: SuggestedRecipe[] = []
    
    for (const recipe of recipes) {
      const recipeIngredients = getRecipeIngredientNames(recipe.ingredients)
      
      if (recipeIngredients.length === 0) continue
      
      const matched: string[] = []
      const missing: string[] = []
      
      for (const recipeIng of recipeIngredients) {
        const found = pantryNames.some(pantryItem => 
          isMatch(pantryItem, recipeIng)
        )
        
        if (found) {
          matched.push(recipeIng)
        } else {
          missing.push(recipeIng)
        }
      }
      
      const matchPercentage = Math.round((matched.length / recipeIngredients.length) * 100)
      
      // Only include recipes with 50%+ match
      if (matchPercentage >= 50) {
        suggestions.push({
          recipe,
          matchedIngredients: matched,
          missingIngredients: missing,
          matchPercentage,
          totalIngredients: recipeIngredients.length
        })
      }
    }
    
    // Sort by match percentage (highest first)
    return suggestions.sort((a, b) => b.matchPercentage - a.matchPercentage)
  }, [pantryItems, recipes])

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

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    return "bg-orange-500"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold gradient-text">MealMash</h1>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/dashboard" className="text-sm hover:text-primary transition-colors">Dashboard</a>
              <a href="/suggestions" className="text-sm text-primary font-medium">What Can I Make?</a>
              <a href="/recipes" className="text-sm hover:text-primary transition-colors">Recipes</a>
              <a href="/pantry" className="text-sm hover:text-primary transition-colors">Pantry</a>
              <a href="/shopping-list" className="text-sm hover:text-primary transition-colors">Shopping List</a>
            <a href="/meal-plan" className="text-sm hover:text-primary transition-colors">📅 Meal Plan</a>
            <a href="/settings" className="text-sm hover:text-primary transition-colors">⚙️ Settings</a>
              {profile?.is_admin && (
                <a href="/admin" className="text-sm hover:text-primary transition-colors">Admin</a>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">🍳 What Can I Make?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Based on your pantry items, here are recipes you can make right now!
          </p>
        </div>

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
                Try adding more items to your pantry or browse all recipes.
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
                  {/* Match Percentage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Ingredients Match</span>
                      <span className="font-semibold">
                        {suggestion.matchedIngredients.length}/{suggestion.totalIngredients} ({suggestion.matchPercentage}%)
                      </span>
                    </div>
                    <Progress 
                      value={suggestion.matchPercentage} 
                      className="h-2"
                      indicatorClassName={getMatchColor(suggestion.matchPercentage)}
                    />
                  </div>

                  {/* Missing Ingredients Preview */}
                  {suggestion.missingIngredients.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Missing: </span>
                      <span className="text-orange-600">
                        {suggestion.missingIngredients.slice(0, 3).join(", ")}
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
                      {selectedRecipe.matchedIngredients.length}/{selectedRecipe.totalIngredients} ({selectedRecipe.matchPercentage}%)
                    </span>
                  </div>
                  <Progress 
                    value={selectedRecipe.matchPercentage} 
                    className="h-3"
                    indicatorClassName={getMatchColor(selectedRecipe.matchPercentage)}
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
                    {selectedRecipe.recipe.ingredients && Array.isArray(selectedRecipe.recipe.ingredients) 
                      ? selectedRecipe.recipe.ingredients.map((ing: any, i: number) => {
                          const ingName = typeof ing === 'string' ? ing : `${ing.amount} ${ing.item}`
                          const isMatched = selectedRecipe.matchedIngredients.some(m => 
                            normalizeIngredient(m).includes(normalizeIngredient(ingName))
                          )
                          return (
                            <div 
                              key={i} 
                              className={`flex items-center gap-2 p-2 rounded ${
                                isMatched ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                              }`}
                            >
                              <span>{isMatched ? '✅' : '❌'}</span>
                              <span className="text-sm">{ingName}</span>
                            </div>
                          )
                        })
                      : <p className="text-muted-foreground">{selectedRecipe.recipe.ingredients}</p>
                    }
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
                          {ing}
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

                <div className="flex gap-4">
                  <Button className="flex-1">❤️ Add to Favorites</Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => router.push("/shopping-list")}
                  >
                    🛒 Add Missing to List
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
