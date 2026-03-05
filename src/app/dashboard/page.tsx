"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, getUserProfile, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import MobileNav from "@/components/mobile-nav"

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

    // Get expiration alerts
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const twoDaysLater = new Date(today)
    twoDaysLater.setDate(today.getDate() + 2)
    const twoDaysStr = twoDaysLater.toISOString().split('T')[0]

    const sevenDaysLater = new Date(today)
    sevenDaysLater.setDate(today.getDate() + 7)
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

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back{profile?.name ? `, ${profile.name}` : ""}! 👋
          </h2>
          <p className="text-muted-foreground">
            What would you like to cook today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/random")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎲 Spin the Wheel
              </CardTitle>
              <CardDescription>Let fate decide your meal</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Can&apos;t decide? Let our random meal picker surprise you!
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/recipes")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🥕 What&apos;s in my fridge?
              </CardTitle>
              <CardDescription>Find recipes by ingredients</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Enter what you have and we&apos;ll find delicious recipes.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/suggestions")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🍳 What Can I Make?
              </CardTitle>
              <CardDescription>See what you can cook now</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Based on your pantry items, see matching recipes you can make right now!
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/pantry")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🥕 My Pantry
              </CardTitle>
              <CardDescription>What do you have on hand?</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track your ingredients and always know what&apos;s available.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/shopping-list")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📋 Shopping List
              </CardTitle>
              <CardDescription>What you need to buy</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keep track of what to pick up at the store.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* EXPIRED Section - Most Urgent */}
        {expiredItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold">🔴 Expired</h3>
              <Badge variant="destructive" className="bg-red-600">{expiredItems.length} items</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {expiredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30"
                  onClick={() => router.push("/pantry")}
                >
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <Badge variant="destructive">
                      {new Date(item.expires_at).toLocaleDateString()}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* EXPIRING SOON Section - Within 2 days */}
        {expiringSoonItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold">🔥 Expiring in 2 Days</h3>
              <Badge className="bg-orange-500 hover:bg-orange-600">{expiringSoonItems.length} items</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {expiringSoonItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer border-orange-200 dark:border-orange-800"
                  onClick={() => router.push("/pantry")}
                >
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      {new Date(item.expires_at).toLocaleDateString()}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* EXPIRING THIS WEEK Section - 3-7 days */}
        {expiringWeekItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold">📅 Expiring This Week</h3>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{expiringWeekItems.length} items</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {expiringWeekItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer border-yellow-200 dark:border-yellow-800"
                  onClick={() => router.push("/pantry")}
                >
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                      {new Date(item.expires_at).toLocaleDateString()}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/recipes/favorites")}>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{stats.favorites}</div>
              <p className="text-sm text-muted-foreground">Favorites</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/meal-plan")}>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{stats.mealsPlanned}</div>
              <p className="text-sm text-muted-foreground">Meals Planned</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/shopping-list")}>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{stats.shoppingList}</div>
              <p className="text-sm text-muted-foreground">Shopping List</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/pantry")}>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{stats.pantryItems}</div>
              <p className="text-sm text-muted-foreground">Pantry Items</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
