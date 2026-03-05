"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

import { supabase, getUser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import MobileNav from "@/components/mobile-nav"
import RecipeModal from "@/components/recipe-modal"
import { getImageUrl } from "@/lib/images"
import Image from "next/image"

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

export default function FavoritesPage() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [user, setUser] = useState<any>(null)
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([])

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    const currentUser = await getUser()
    if (currentUser) {
      setUser(currentUser)
      await loadPantryItems(currentUser.id)
      await loadFavorites(currentUser.id)
    } else {
      setLoading(false)
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

  async function loadFavorites(userId: string) {
    setLoading(true)
    
    // First get the favorite recipe IDs
    const { data: favorites, error: favError } = await supabase
      .from('user_favorites')
      .select('recipe_id')
      .eq('user_id', userId)
    
    if (favError || !favorites || favorites.length === 0) {
      setRecipes([])
      setLoading(false)
      return
    }

    const recipeIds = favorites.map(f => f.recipe_id)
    
    // Then fetch the actual recipes
    const { data, error } = await supabase
      .from("recipes")
      .select(`
        *,
        recipe_ingredients (
          ingredient_id,
          quantity,
          ingredients (name, category)
        )
      `)
      .in('id', recipeIds)
    
    if (data) {
      setRecipes(data)
    } else {
      console.error("Error loading favorites:", error)
    }
    setLoading(false)
  }

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

  // Refresh favorites when modal closes
  const handleModalClose = () => {
    setSelectedRecipe(null)
    if (user) {
      loadFavorites(user.id)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-safe">
        <MobileNav />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">❤️ My Favorites</h2>
            <p className="text-muted-foreground mb-8">
              Please log in to view your favorite recipes.
            </p>
            <Button onClick={() => router.push('/')}>
              Go to Home
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-safe">
      
      <MobileNav />

      <main className="container mx-auto px-4 py-4">
        {/* Hero - hidden on mobile to save space */}
        <div className="text-center mb-4 hidden md:block">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">❤️ My Favorites</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto hidden">
            Your saved recipes in one place. Quick access to your go-to meals.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t saved any favorites yet.
            </p>
            <Button onClick={() => router.push('/recipes')}>
              Browse Recipes
            </Button>
          </div>
        ) : (
          /* Recipe Grid - compact cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {recipes.map((recipe) => (
              <Card 
                key={recipe.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer h-full py-0"
                onClick={() => setSelectedRecipe(recipe)}
              >
                {getImageUrl(recipe.image_url) && (
                  <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg -mb-2">
                    <Image 
                      src={getImageUrl(recipe.image_url)!} 
                      alt={recipe.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-3 pt-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold">{recipe.name}</h3>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {parseCategory(recipe.category).map((cat) => (
                        <Badge key={cat} className={getCategoryColor(cat)}>
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{recipe.description}</p>
                </div>
                <div className="p-3 pt-0 flex flex-col gap-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>⏱️ {recipe.prep_time_minutes + recipe.cook_time_minutes} min</span>
                    <span>👥 {recipe.servings}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          user={user}
          pantryItems={pantryItems}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
