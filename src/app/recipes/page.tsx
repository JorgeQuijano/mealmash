"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase, getUser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import DesktopNav from "@/components/desktop-nav"
import MobileNav from "@/components/mobile-nav"

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
  category: string
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  image_url: string
  recipe_ingredients?: RecipeIngredient[]
}

const categories = ["all", "breakfast", "lunch", "dinner", "snack", "dessert"]

export default function RecipesPage() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [user, setUser] = useState<any>(null)
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([])
  const [matchedIndices, setMatchedIndices] = useState<number[]>([])
  const [missingIndices, setMissingIndices] = useState<number[]>([])
  const [showAddToListModal, setShowAddToListModal] = useState(false)
  const [addingToList, setAddingToList] = useState(false)
  const [addedToList, setAddedToList] = useState(false)

  useEffect(() => {
    loadRecipes()
    loadUser()
  }, [selectedCategory])

  async function loadUser() {
    const currentUser = await getUser()
    if (currentUser) {
      setUser(currentUser)
      await loadPantryItems(currentUser.id)
    }
  }

  async function loadPantryItems(userId: string) {
    const { data, error } = await supabase
      .from("pantry_items")
      .select("id, name, quantity, ingredient_id, user_id")
      .eq("user_id", userId)
    
    if (!error && data) {
      setPantryItems(data)
    }
  }

  // Recalculate matches when pantryItems or selectedRecipe changes
  useEffect(() => {
    if (!selectedRecipe?.recipe_ingredients || pantryItems.length === 0) {
      setMatchedIndices([])
      setMissingIndices([])
      return
    }
    
    const matched: number[] = []
    const missing: number[] = []
    
    const pantryIngredientIds = new Set(
      pantryItems.filter(p => p.ingredient_id).map(p => p.ingredient_id)
    )
    
    selectedRecipe.recipe_ingredients.forEach((ri, index) => {
      if (pantryIngredientIds.has(ri.ingredient_id)) {
        matched.push(index)
      } else {
        missing.push(index)
      }
    })
    
    setMatchedIndices(matched)
    setMissingIndices(missing)
  }, [pantryItems, selectedRecipe?.recipe_ingredients])

  async function loadRecipes() {
    setLoading(true)
    
    let query = supabase.from("recipes").select(`
      *,
      recipe_ingredients (
        ingredient_id,
        quantity,
        ingredients (name, category)
      )
    `)
    
    if (selectedCategory !== "all") {
      query = query.eq("category", selectedCategory)
    }
    
    const { data, error } = await query
    
    if (data) {
      setRecipes(data)
    } else {
      console.error("Error loading recipes:", error)
    }
    setLoading(false)
  }

  const handleAddMissingToShoppingList = async () => {
    if (!user || missingIndices.length === 0 || !selectedRecipe) return
    
    setAddingToList(true)
    
    const ingredientList = selectedRecipe.recipe_ingredients || []
    
    for (const index of missingIndices) {
      const ing = ingredientList[index]
      const itemName = ing.ingredients?.name || ''
      const quantity = `${ing.quantity_num || ing.quantity || ''} ${ing.unit || ''}`.trim()
      
      // Check if already in shopping list
      const { data: existing } = await supabase
        .from("shopping_list")
        .select("id, quantity")
        .eq("user_id", user.id)
        .ilike("item_name", itemName)
        .single()
      
      if (existing) {
        // Update quantity (append)
        const newQty = `${existing.quantity} + ${quantity}`
        await supabase
          .from("shopping_list")
          .update({ quantity: newQty })
          .eq("id", existing.id)
      } else {
        // Insert new
        await supabase.from("shopping_list").insert({
          user_id: user.id,
          item_name: itemName,
          quantity: quantity || "1",
          ingredient_id: ing.ingredient_id,
          is_checked: false
        })
      }
    }
    
    setAddingToList(false)
    setShowAddToListModal(false)
    setAddedToList(true)
    
    // Reset success message after 3 seconds
    setTimeout(() => setAddedToList(false), 3000)
  }

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  return (
    <div className="min-h-screen bg-background pb-safe">
      <DesktopNav />
      <MobileNav />

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">Browse Recipes 🍳</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover delicious recipes for every meal. Search by ingredients or browse by category.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              type="search"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={() => router.push("/random")}
              className="shrink-0"
            >
              🎲 Random
            </Button>
          </div>
          
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

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        )}

        {/* Recipes Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card 
                key={recipe.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer h-full"
                onClick={() => setSelectedRecipe(recipe)}
              >
                {recipe.image_url && (
                  <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
                    <img 
                      src={recipe.image_url} 
                      alt={recipe.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                    <Badge className={getCategoryColor(recipe.category)}>
                      {recipe.category}
                    </Badge>
                  </div>
                  <CardDescription>{recipe.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>⏱️ {recipe.prep_time_minutes + recipe.cook_time_minutes} min</span>
                    <span>👥 {recipe.servings} servings</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-auto" asChild>
                    <Link href={`/recipes/${recipe.id}`}>👁️ View Recipe</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No recipes found. Try a different search or category.</p>
          </div>
        )}

        {/* Recipe Detail Modal */}
        {selectedRecipe && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedRecipe(null)}>
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedRecipe.name}</CardTitle>
                    <CardDescription className="mt-2">{selectedRecipe.description}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRecipe(null)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Badge className={getCategoryColor(selectedRecipe.category)}>
                    {selectedRecipe.category}
                  </Badge>
                  <span className="text-sm">⏱️ Prep: {selectedRecipe.prep_time_minutes} min</span>
                  <span className="text-sm">🍳 Cook: {selectedRecipe.cook_time_minutes} min</span>
                  <span className="text-sm">👥 {selectedRecipe.servings} servings</span>
                </div>

                {/* Pantry Status */}
                {user && selectedRecipe.recipe_ingredients && selectedRecipe.recipe_ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      ✅ {matchedIndices.length} in pantry
                    </Badge>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      ❌ {missingIndices.length} missing
                    </Badge>
                  </div>
                )}

                {/* Add Missing to Shopping List Button */}
                {user && missingIndices.length > 0 && (
                  <Button 
                    onClick={() => setShowAddToListModal(true)}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    🛒 Add {missingIndices.length} Missing to Shopping List
                  </Button>
                )}
                
                {/* Success Message */}
                {addedToList && (
                  <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    ✅ Added to shopping list!
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Ingredients</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedRecipe.recipe_ingredients?.map((ing: RecipeIngredient, i: number) => {
                      const isMatched = matchedIndices.includes(i)
                      const isMissing = missingIndices.includes(i)
                      return (
                        <li key={i} className={isMatched ? 'text-green-600' : isMissing ? 'text-red-500' : 'text-muted-foreground'}>
                          {isMatched && '✅ '}
                          {isMissing && '❌ '}
                          {ing.quantity_num || ing.quantity}{ing.unit ? ` ${ing.unit}` : ''} {ing.ingredients?.name}
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedRecipe.instructions?.map((step, i) => (
                      <li key={i} className="text-muted-foreground">{step}</li>
                    ))}
                  </ol>
                </div>

                <Button className="w-full">❤️ Add to Favorites</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Missing to Shopping List Modal */}
        {showAddToListModal && selectedRecipe && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowAddToListModal(false)}>
            <div className="bg-background rounded-lg p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-2">Add Missing Ingredients</h3>
              <p className="text-muted-foreground mb-4">
                Add the following {missingIndices.length} items to your shopping list?
              </p>
              
              <ul className="mb-4 max-h-60 overflow-auto border rounded p-2">
                {missingIndices.map(index => {
                  const ing = selectedRecipe.recipe_ingredients?.[index]
                  return (
                    <li key={index} className="py-1 text-red-500">
                      ❌ {ing?.quantity_num || ing?.quantity}{ing?.unit ? ` ${ing.unit}` : ''} {ing?.ingredients?.name}
                    </li>
                  )
                })}
              </ul>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddToListModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMissingToShoppingList}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  disabled={addingToList}
                >
                  {addingToList ? "Adding..." : "Add to Shopping List"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
