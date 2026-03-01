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
import RecipeModal from "@/components/recipe-modal"

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
          <RecipeModal
            recipe={selectedRecipe}
            user={user}
            pantryItems={pantryItems}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </main>
    </div>
  )
}
