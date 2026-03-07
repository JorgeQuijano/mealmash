"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, getUserProfile, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import MobileNav from "@/components/mobile-nav"
import ExpiringRecipeModal from "@/components/ExpiringRecipeModal"
import RecipeModal from "@/components/recipe-modal"

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

function getCategoryColor(category: string | string[]) {
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

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    favorites: 0,
    mealsPlanned: 0,
    shoppingList: 0,
    pantryItems: 0
  })
  const [expiredItems, setExpiredItems] = useState<any[]>([])
  const [expiringSoonItems, setExpiringSoonItems] = useState<any[]>([])
  const [expiringWeekItems, setExpiringWeekItems] = useState<any[]>([])
  const [todaysMeals, setTodaysMeals] = useState<any[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const [pantryItems, setPantryItems] = useState<any[]>([])
  const [selectedExpiringItem, setSelectedExpiringItem] = useState<any>(null)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getUser()
      
      if (!currentUser) {
        router.push("/login")
        return
      }
      
      setUser(currentUser)
      
      const { data } = await getUserProfile(currentUser.id)
      setProfile(data)
      
      // Load real stats
      await loadStats(currentUser.id)
      
      setLoading(false)
    }
    
    loadUser()
  }, [router])

  async function loadStats(userId: string) {
    const today = new Date().toISOString().split('T')[0]
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    const todayStr = todayDate.toISOString().split('T')[0]

    const twoDaysLater = new Date(todayDate)
    twoDaysLater.setDate(todayDate.getDate() + 2)
    const twoDaysStr = twoDaysLater.toISOString().split('T')[0]

    const sevenDaysLater = new Date(todayDate)
    sevenDaysLater.setDate(todayDate.getDate() + 7)
    const sevenDaysStr = sevenDaysLater.toISOString().split('T')[0]

    // Run all queries in PARALLEL for faster loading
    const [
      favoritesResult,
      mealsPlannedResult,
      shoppingListResult,
      pantryCountResult,
      mealsResult,
      pantryResult,
      expiredResult,
      expiringSoonResult,
      expiringWeekResult
    ] = await Promise.all([
      // Query 1: Favorites count
      supabase.from('user_favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      // Query 2: Meals planned count
      supabase.from('meal_plans').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      // Query 3: Shopping list count
      supabase.from('shopping_list').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      // Query 4: Pantry items count
      supabase.from('pantry_items').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      // Query 5: Today's meals (without recipe_ingredients - lazy load later)
      supabase.from('meal_plans').select('*, recipes(*)').eq('user_id', userId).eq('planned_date', today).order('meal_type', { ascending: true }),
      // Query 6: Pantry items
      supabase.from('pantry_items').select('*').eq('user_id', userId),
      // Query 7: Expired items
      supabase.from('pantry_items').select('*').eq('user_id', userId).not('expires_at', 'is', null).lt('expires_at', todayStr).order('expires_at', { ascending: false }).limit(5),
      // Query 8: Expiring soon (2 days)
      supabase.from('pantry_items').select('*').eq('user_id', userId).not('expires_at', 'is', null).gte('expires_at', todayStr).lte('expires_at', twoDaysStr).order('expires_at', { ascending: true }).limit(5),
      // Query 9: Expiring this week
      supabase.from('pantry_items').select('*').eq('user_id', userId).not('expires_at', 'is', null).gt('expires_at', twoDaysStr).lte('expires_at', sevenDaysStr).order('expires_at', { ascending: true }).limit(5),
    ])

    // Set stats
    setStats({
      favorites: favoritesResult.count || 0,
      mealsPlanned: mealsPlannedResult.count || 0,
      shoppingList: shoppingListResult.count || 0,
      pantryItems: pantryCountResult.count || 0
    })

    // Set today's meals (without recipe_ingredients - lazy loaded)
    setTodaysMeals(mealsResult.data || [])

    // Set pantry items
    setPantryItems(pantryResult.data || [])

    // Set expiration alerts
    setExpiredItems(expiredResult.data || [])
    setExpiringSoonItems(expiringSoonResult.data || [])
    setExpiringWeekItems(expiringWeekResult.data || [])
  }

  // Lazy load recipe ingredients when user clicks on a meal
  async function loadRecipeIngredients(recipeId: string) {
    const { data } = await supabase
      .from('recipe_ingredients')
      .select('ingredient_id, quantity, quantity_num, unit, ingredients(name, category)')
      .eq('recipe_id', recipeId)
    
    return data || []
  }

  // Update selected recipe with full ingredients
  async function handleRecipeClick(meal: any) {
    // Already loaded, just show modal
    if (meal.recipes?.recipe_ingredients) {
      setSelectedRecipe(meal.recipes)
      return
    }
    
    // Lazy load ingredients
    const ingredients = await loadRecipeIngredients(meal.recipes.id)
    setSelectedRecipe({
      ...meal.recipes,
      recipe_ingredients: ingredients
    })
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

      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">
            Welcome back{profile?.name ? `, ${profile.name}` : ""}! 👋
          </h2>
        </div>

        {/* Quick Actions - First for easy access */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <Button 
              variant="outline" 
              className="flex-shrink-0 gap-2"
              onClick={() => router.push("/pantry")}
            >
              🥕 Add Pantry
            </Button>
            <Button 
              variant="outline" 
              className="flex-shrink-0 gap-2"
              onClick={() => router.push("/recipes")}
            >
              🔍 Find Recipe
            </Button>
            <Button 
              variant="outline" 
              className="flex-shrink-0 gap-2"
              onClick={() => router.push("/random")}
            >
              🎲 Random
            </Button>
            <Button 
              variant="outline" 
              className="flex-shrink-0 gap-2"
              onClick={() => router.push("/shopping-list")}
            >
              🛒 Shopping
            </Button>
            <Button 
              variant="outline" 
              className="flex-shrink-0 gap-2"
              onClick={() => router.push("/suggestions")}
            >
              🍳 What Can I Make?
            </Button>
          </div>
        </div>

        {/* EXPIRING SOON Section - Within 2 days */}
        {expiringSoonItems.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-bold">🔥 Expiring Soon</h3>
              <Badge className="bg-orange-500 text-xs">{expiringSoonItems.length}</Badge>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4">
              {expiringSoonItems.map((item) => (
                <button 
                  key={item.id} 
                  className="flex-shrink-0 flex items-center gap-1 px-2 py-1 text-xs bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded hover:bg-orange-100 transition-colors"
                  onClick={() => setSelectedExpiringItem(item)}
                >
                  <span className="truncate max-w-[60px]">{item.name}</span>
                  <span className="text-orange-600 whitespace-nowrap">
                    {new Date(item.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* EXPIRING THIS WEEK Section - 3-7 days */}
        {expiringWeekItems.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold">📅 This Week</h3>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">{expiringWeekItems.length}</Badge>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4">
              {expiringWeekItems.map((item) => (
                <button 
                  key={item.id} 
                  className="flex-shrink-0 flex items-center gap-1 px-2 py-1 text-xs bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded hover:bg-yellow-100 transition-colors"
                  onClick={() => setSelectedExpiringItem(item)}
                >
                  <span className="truncate max-w-[60px]">{item.name}</span>
                  <span className="text-yellow-600 whitespace-nowrap">
                    {new Date(item.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Today's Meals - Prominent */}
        {todaysMeals.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              🍽️ Today's Meals
            </h3>
            <div className="space-y-2">
              {todaysMeals.map((meal) => (
                <Card 
                  key={meal.id} 
                  className="hover:shadow-md cursor-pointer border-primary/20"
                  onClick={() => handleRecipeClick(meal)}
                >
                  <CardContent className="p-2 flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{meal.recipes?.name || 'Recipe'}</p>
                    {parseCategory(meal.recipes?.category).map((cat) => (
                      <Badge key={cat} className={getCategoryColor(cat)}>
                        {cat}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stats - Compact */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Your Stats</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <Card 
              className="flex-shrink-0 cursor-pointer min-w-[80px]" 
              onClick={() => router.push("/recipes/favorites")}
            >
              <CardContent className="p-2 text-center">
                <div className="text-lg font-bold">{stats.favorites}</div>
                <p className="text-xs text-muted-foreground">Favorites</p>
              </CardContent>
            </Card>
            <Card 
              className="flex-shrink-0 cursor-pointer min-w-[80px]" 
              onClick={() => router.push("/meal-plan")}
            >
              <CardContent className="p-2 text-center">
                <div className="text-lg font-bold">{stats.mealsPlanned}</div>
                <p className="text-xs text-muted-foreground">Planned</p>
              </CardContent>
            </Card>
            <Card 
              className="flex-shrink-0 cursor-pointer min-w-[80px]" 
              onClick={() => router.push("/shopping-list")}
            >
              <CardContent className="p-2 text-center">
                <div className="text-lg font-bold">{stats.shoppingList}</div>
                <p className="text-xs text-muted-foreground">Shopping</p>
              </CardContent>
            </Card>
            <Card 
              className="flex-shrink-0 cursor-pointer min-w-[80px]" 
              onClick={() => router.push("/pantry")}
            >
              <CardContent className="p-2 text-center">
                <div className="text-lg font-bold">{stats.pantryItems}</div>
                <p className="text-xs text-muted-foreground">Pantry</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Expiring Item Recipe Modal */}
        {selectedExpiringItem && (
          <ExpiringRecipeModal 
            expiringItem={selectedExpiringItem}
            onClose={() => setSelectedExpiringItem(null)}
          />
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
