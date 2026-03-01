"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import DesktopNav from "@/components/desktop-nav"
import MobileNav from "@/components/mobile-nav"

type RecipeIngredient = {
  ingredient_id: string
  quantity: string
  ingredients: {
    name: string
    category: string
  }
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

  useEffect(() => {
    loadRecipes()
  }, [selectedCategory])

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
              <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
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
                    <Button variant="outline" size="sm" className="w-full mt-auto" onClick={(e) => e.preventDefault()}>
                      👁️ View Recipe
                    </Button>
                  </CardContent>
                </Card>
              </Link>
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

                <div>
                  <h3 className="font-semibold mb-2">Ingredients</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedRecipe.recipe_ingredients?.map((ing: RecipeIngredient, i: number) => (
                      <li key={i} className="text-muted-foreground">
                        {ing.quantity} {ing.ingredients?.name}
                      </li>
                    ))}
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
      </main>
    </div>
  )
}
