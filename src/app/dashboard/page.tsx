"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, getUserProfile } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DesktopNav from "@/components/desktop-nav"
import MobileNav from "@/components/mobile-nav"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
      setLoading(false)
    }
    
    loadUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-safe">
      <DesktopNav />
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

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">Favorites</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">Meals Planned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">Shopping Lists</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Badge variant={profile?.is_admin ? "default" : "secondary"}>
                {profile?.is_admin ? "Admin" : "Free User"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
