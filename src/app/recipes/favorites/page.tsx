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

const categories = ["all", "breakfast", "lunch", "dinner", "snack", "dessert"]

export default function FavoritesPage() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]) // For client-side filtering
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [user, setUser] = useState<any>(null)
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const recipesPerPage = 20

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
      setAllRecipes([])
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
      setAllRecipes(data)
      setRecipes(data)
    } else {
      console.error("Error loading favorites:", error)
    }
    setLoading(false)
  }

  // Filter recipes client-side
  const filteredRecipes = allRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || 
      (recipe.category && parseCategory(recipe.category).includes(selectedCategory))
    return matchesSearch && matchesCategory
  })

  // Paginate
  const totalCount = filteredRecipes.length
  const paginatedRecipes = filteredRecipes.slice(
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

        {/* Search & Filters - compact on mobile */}
        {allRecipes.length > 0 && (
          <div className="mb-4 space-y-3">
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                type="search"
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="h-9 text-sm"
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-1.5">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                  className="capitalize text-xs h-7 px-2.5"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No favorites found{searchQuery || selectedCategory !== "all" ? " matching your search" : " yet"}.
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
                Clear Filters
              </Button>
            )}
            {!searchQuery && selectedCategory === "all" && (
              <Button onClick={() => router.push('/recipes')}>
                Browse Recipes
              </Button>
            )}
          </div>
        ) : (
          /* Recipe Grid - compact cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {paginatedRecipes.map((recipe) => (
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
