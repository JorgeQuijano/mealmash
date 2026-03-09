"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase, getUser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import MobileNav from "@/components/mobile-nav"
import RecipeModal from "@/components/recipe-modal"
import { getImageUrl } from "@/lib/images"
import RecipeFilters, { FilterState } from "@/components/recipe-filters"
import Image from "next/image"

// Helper to parse category from any format to string array
function parseCategory(cat: any): string[] {
  if (Array.isArray(cat)) return cat
  if (typeof cat === 'string') {
    try {
      const parsed = JSON.parse(cat)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return [cat]
    }
  }
  return [String(cat)]
}

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
  category: string[]  // Now an array for multiple categories
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
  const [isPro, setIsPro] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    cuisine: [],
    dietary: [],
    timeRange: null,
    difficulty: [],
  })
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasActiveFilters, setHasActiveFilters] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const recipesPerPage = 20

  // Reset to page 1 when filters change
  useEffect(() => {
    const filtersActive = 
      filters.cuisine.length > 0 || 
      filters.dietary.length > 0 || 
      filters.difficulty.length > 0 ||
      filters.timeRange !== null
    
    setHasActiveFilters(filtersActive)
    setCurrentPage(1)
    setIsFiltering(true)  // Show loading when filters change
  }, [filters])

  useEffect(() => {
    loadAllData()
  }, [selectedCategory, currentPage, filters])

  async function loadUser() {
    const currentUser = await getUser()
    if (currentUser) {
      setUser(currentUser)
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
    
    // Calculate offset
    const offset = (currentPage - 1) * recipesPerPage
    
    // Check if advanced filters are active
    const hasAdvancedFilters = 
      filters.cuisine.length > 0 || 
      filters.dietary.length > 0 || 
      filters.difficulty.length > 0 ||
      filters.timeRange !== null
    
    // If filters active, fetch more data for client-side filtering
    // Otherwise, use standard pagination
    const limit = hasAdvancedFilters ? 500 : recipesPerPage
    const fetchOffset = hasAdvancedFilters ? 0 : offset
    
    // Build query with server-side filtering
    let query = supabase
      .from("recipes")
      .select(`
        *,
        recipe_ingredients (
          ingredient_id,
          quantity,
          ingredients (name, category)
        )
      `, { count: 'exact' })
      .order("name", { ascending: true })
    
    let countQuery = supabase
      .from("recipes")
      .select("*", { count: 'exact', head: true })
    
    // Apply category filter - use text search since category is stored as JSON string
    if (selectedCategory !== "all") {
      query = query.ilike("category", `%${selectedCategory}%`)
      countQuery = countQuery.ilike("category", `%${selectedCategory}%`)
    }
    
    const [{ count }, { data, error }] = await Promise.all([
      countQuery,
      query.range(fetchOffset, fetchOffset + limit - 1)
    ])
    
    // If advanced filters are active, calculate count from fetched data
    // Otherwise use server count
    if (hasAdvancedFilters) {
      setTotalCount(data?.length || 0)
    } else {
      setTotalCount(count || 0)
    }
    
    if (data) {
      setRecipes(data)
    } else {
      console.error("Error loading recipes:", error)
    }
    setLoading(false)
    setIsFiltering(false)
  }

  // Batch load all data in parallel
  async function loadAllData() {
    const currentUser = await getUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    
    setUser(currentUser)
    
    // Check subscription status
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier, subscription_status, is_admin')
      .eq('id', currentUser.id)
      .single()
    
    const isProUser = profile?.subscription_tier === 'pro' && profile?.subscription_status === 'active'
    const isAdminUser = profile?.is_admin === true
    setIsPro(isProUser)
    setIsAdmin(isAdminUser)
    
    // Run all queries in parallel
    await Promise.all([
      loadRecipes(),
      loadPantryItems(currentUser.id)
    ])
    
    setLoading(false)
  }

  const filteredRecipes = recipes.filter(recipe => {
    // Basic search filter
    const matchesSearch = 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || 
      (recipe.category && recipe.category.includes(selectedCategory))
    
    if (!matchesSearch || !matchesCategory) return false
    
    // Advanced filters (Pro only, but admins bypass)
    if (isPro || isAdmin) {
      // Cuisine filter
      if (filters.cuisine.length > 0) {
        const recipeCuisines = (recipe as any).cuisine || []
        const hasCuisine = filters.cuisine.some(c => 
          recipeCuisines.some((rc: string) => rc.toLowerCase().includes(c.toLowerCase()))
        )
        if (!hasCuisine) return false
      }
      
      // Dietary filter
      if (filters.dietary.length > 0) {
        const recipeDietary = (recipe as any).dietary_tags || []
        const hasDietary = filters.dietary.some(d => 
          recipeDietary.some((rd: string) => rd.toLowerCase().includes(d.toLowerCase()))
        )
        if (!hasDietary) return false
      }
      
      // Difficulty filter
      if (filters.difficulty.length > 0) {
        const recipeDifficulty = (recipe as any).difficulty || 'Medium'
        const hasDifficulty = filters.difficulty.some(d => 
          recipeDifficulty.toLowerCase() === d.toLowerCase()
        )
        if (!hasDifficulty) return false
      }
      
      // Time filter
      if (filters.timeRange) {
        const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)
        const timeRanges: Record<string, [number, number]> = {
          'Under 15 min': [0, 15],
          '15-30 min': [15, 30],
          '30-60 min': [30, 60],
          'Over 60 min': [60, 999]
        }
        const [min, max] = timeRanges[filters.timeRange] || [0, 999]
        if (totalTime < min || totalTime > max) return false
      }
    }
    
    return true
  })

  // When filters are active, paginate client-side from filtered results
  const paginatedRecipes = hasActiveFilters
    ? filteredRecipes.slice((currentPage - 1) * recipesPerPage, currentPage * recipesPerPage)
    : filteredRecipes

  const displayedCount = hasActiveFilters ? filteredRecipes.length : totalCount

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

  return (
    <div className="min-h-screen bg-background pb-safe">
      
      <MobileNav />

      <main className="container mx-auto px-4 py-4">
        {/* Hero - hidden on mobile for logged-in users to save space */}
        <div className="text-center mb-4 hidden md:block">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Browse Recipes 🍳</h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto hidden">
            Discover delicious recipes for every meal. Search by ingredients or browse by category.
          </p>
        </div>

        {/* Search & Filters - compact on mobile */}
        <div className="mb-4 space-y-3">
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              type="search"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-sm"
            />
            <Button 
              variant="outline" 
              onClick={() => router.push("/random")}
              className="h-9 text-sm shrink-0 px-3"
            >
              🎲
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-1.5">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                h-7
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className="capitalize text-xs h-7 px-2.5"
              >
                {cat}
              </Button>
            ))}
          </div>
          
          {/* Advanced Filters - Pro only (admins bypass) */}
          <div className="mt-3">
            <RecipeFilters 
              isPro={isPro || isAdmin} 
              filters={filters} 
              onFilterChange={setFilters} 
            />
          </div>
        </div>

        {/* Loading */}
        {(loading || isFiltering) && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        )}

        {/* Recipes Grid - compact cards on mobile */}
        {!loading && !isFiltering && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
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

        {/* No Results */}
        {!loading && filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No recipes found. Try a different search or category.</p>
          </div>
        )}

        {/* Pagination */}
        {displayedCount > recipesPerPage && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {Math.ceil(displayedCount / recipesPerPage)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= Math.ceil(displayedCount / recipesPerPage)}
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
            pantryItems={pantryItems}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </main>
    </div>
  )
}
