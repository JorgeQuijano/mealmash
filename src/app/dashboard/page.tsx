"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, getUserProfile, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import MobileNav from "@/components/mobile-nav"
import ExpiringRecipeModal from "@/components/ExpiringRecipeModal"

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
    // Get favorites count
    const { count: favoritesCount } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get meals planned count
    const { count: mealsPlannedCount } = await supabase
      .from('meal_plans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get shopping list count
    const { count: shoppingListCount } = await supabase
      .from('shopping_list')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get pantry items count
    const { count: pantryItemsCount } = await supabase
      .from('pantry_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    setStats({
      favorites: favoritesCount || 0,
      mealsPlanned: mealsPlannedCount || 0,
      shoppingList: shoppingListCount || 0,
      pantryItems: pantryItemsCount || 0
    })

    // Get today's meals
    const today = new Date().toISOString().split('T')[0]
    const { data: meals } = await supabase
      .from('meal_plans')
      .select('*, recipes(*)')
      .eq('user_id', userId)
      .eq('planned_date', today)
      .order('meal_type', { ascending: true })

    setTodaysMeals(meals || [])

    // Get expiration alerts
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    const todayStr = todayDate.toISOString().split('T')[0]

    const twoDaysLater = new Date(todayDate)
    twoDaysLater.setDate(todayDate.getDate() + 2)
    const twoDaysStr = twoDaysLater.toISOString().split('T')[0]

    const sevenDaysLater = new Date(todayDate)
    sevenDaysLater.setDate(todayDate.getDate() + 7)
    const sevenDaysStr = sevenDaysLater.toISOString().split('T')[0]

    // Get expired items (past expiration date)
    const { data: expired } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', userId)
      .not('expires_at', 'is', null)
      .lt('expires_at', todayStr)
      .order('expires_at', { ascending: false })
      .limit(5)

    // Get expiring in 2 days (urgent)
    const { data: expiringSoon } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', userId)
      .not('expires_at', 'is', null)
      .gte('expires_at', todayStr)
      .lte('expires_at', twoDaysStr)
      .order('expires_at', { ascending: true })
      .limit(5)

    // Get expiring in 3-7 days
    const { data: expiringWeek } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', userId)
      .not('expires_at', 'is', null)
      .gt('expires_at', twoDaysStr)
      .lte('expires_at', sevenDaysStr)
      .order('expires_at', { ascending: true })
      .limit(5)

    setExpiredItems(expired || [])
    setExpiringSoonItems(expiringSoon || [])
    setExpiringWeekItems(expiringWeek || [])
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

        {/* Today's Meals - Prominent */}
        {todaysMeals.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              🍽️ Tonight&apos;s Dinner
            </h3>
            <div className="space-y-2">
              {todaysMeals.map((meal) => (
                <Card 
                  key={meal.id} 
                  className="hover:shadow-md cursor-pointer border-primary/20"
                  onClick={() => router.push("/meal-plan")}
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

        {/* Quick Actions - Compact Horizontal Scroll */}
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

        {/* EXPIRED Section - Most Urgent */}
        {expiredItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-bold">🔴 Expired</h3>
              <Badge variant="destructive" className="bg-red-600">{expiredItems.length}</Badge>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {expiredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="flex-shrink-0 cursor-pointer border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 min-w-[140px]"
                  onClick={() => setSelectedExpiringItem(item)}
                >
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-red-600 mt-1">
                      {new Date(item.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* EXPIRING SOON Section - Within 2 days */}
        {expiringSoonItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-bold">🔥 Expiring Soon</h3>
              <Badge className="bg-orange-500">{expiringSoonItems.length}</Badge>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {expiringSoonItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="flex-shrink-0 cursor-pointer border-orange-200 dark:border-orange-800 min-w-[140px]"
                  onClick={() => setSelectedExpiringItem(item)}
                >
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-orange-600 mt-1">
                      {new Date(item.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* EXPIRING THIS WEEK Section - 3-7 days */}
        {expiringWeekItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold">📅 Expiring This Week</h3>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{expiringWeekItems.length}</Badge>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {expiringWeekItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="flex-shrink-0 cursor-pointer border-yellow-200 dark:border-yellow-800 min-w-[140px]"
                  onClick={() => setSelectedExpiringItem(item)}
                >
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      {new Date(item.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stats - Compact */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Your Stats</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            <Card 
              className="flex-shrink-0 cursor-pointer min-w-[100px]" 
              onClick={() => router.push("/recipes/favorites")}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.favorites}</div>
                <p className="text-xs text-muted-foreground">Favorites</p>
              </CardContent>
            </Card>
            <Card 
              className="flex-shrink-0 cursor-pointer min-w-[100px]" 
              onClick={() => router.push("/meal-plan")}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.mealsPlanned}</div>
                <p className="text-xs text-muted-foreground">Planned</p>
              </CardContent>
            </Card>
            <Card 
              className="flex-shrink-0 cursor-pointer min-w-[100px]" 
              onClick={() => router.push("/shopping-list")}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.shoppingList}</div>
                <p className="text-xs text-muted-foreground">Shopping</p>
              </CardContent>
            </Card>
            <Card 
              className="flex-shrink-0 cursor-pointer min-w-[100px]" 
              onClick={() => router.push("/pantry")}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.pantryItems}</div>
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
      </main>
    </div>
  )
}
