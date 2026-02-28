"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, getUserProfile, signOut, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface PantryItem {
  id: string
  name: string
  category: string
  quantity: string
  created_at: string
}

const CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat",
  "Seafood",
  "Grains",
  "Spices",
  "Condiments",
  "Frozen",
  "Canned",
  "Other"
]

export default function PantryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [items, setItems] = useState<PantryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState({ name: "", category: "Other", quantity: "" })
  const [adding, setAdding] = useState(false)

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
      await loadPantryItems(currentUser.id)
      setLoading(false)
    }
    
    loadUser()
  }, [router])

  async function loadPantryItems(userId: string) {
    const { data, error } = await supabase
      .from("pantry_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setItems(data)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleAddItem = async () => {
    if (!newItem.name.trim() || !user) return

    setAdding(true)
    const { data, error } = await supabase
      .from("pantry_items")
      .insert({
        user_id: user.id,
        name: newItem.name.trim(),
        category: newItem.category,
        quantity: newItem.quantity.trim() || "1"
      })
      .select()

    if (!error && data) {
      setItems([...data, ...items])
      setNewItem({ name: "", category: "Other", quantity: "" })
    }
    setAdding(false)
  }

  const handleDeleteItem = async (id: string) => {
    const { error } = await supabase
      .from("pantry_items")
      .delete()
      .eq("id", id)

    if (!error) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || "Other"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, PantryItem[]>)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold gradient-text">MealMash</h1>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/dashboard" className="text-sm hover:text-primary transition-colors">Dashboard</a>
              <a href="/suggestions" className="text-sm hover:text-primary transition-colors">🍳 What Can I Make?</a>
              <a href="/recipes" className="text-sm hover:text-primary transition-colors">Recipes</a>
              <a href="/pantry" className="text-sm text-primary font-medium">Pantry</a>
              <a href="/shopping-list" className="text-sm hover:text-primary transition-colors">Shopping List</a>
            <a href="/meal-plan" className="text-sm hover:text-primary transition-colors">📅 Meal Plan</a>
            <a href="/settings" className="text-sm hover:text-primary transition-colors">⚙️ Settings</a>
              {profile?.is_admin && (
                <a href="/admin" className="text-sm hover:text-primary transition-colors">Admin</a>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">🥕 My Pantry</h2>
            <p className="text-muted-foreground">
              Track what ingredients you have on hand
            </p>
          </div>
          <Badge variant="outline" className="text-lg py-1">
            {items.length} items
          </Badge>
        </div>

        {/* Add Item Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Item name (e.g., Tomatoes)"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="px-3 py-2 rounded-md border bg-background text-sm"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Input
                placeholder="Qty"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                className="w-24"
                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              />
              <Button onClick={handleAddItem} disabled={adding || !newItem.name.trim()}>
                {adding ? "Adding..." : "Add"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pantry Items */}
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Your pantry is empty</p>
              <p className="text-sm text-muted-foreground">Add some items above to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  {getCategoryEmoji(category)} {category}
                  <Badge variant="secondary" className="ml-2">{categoryItems.length}</Badge>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {categoryItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          ✕
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    "Produce": "🥬",
    "Dairy": "🧀",
    "Meat": "🥩",
    "Seafood": "🐟",
    "Grains": "🌾",
    "Spices": "🧂",
    "Condiments": "🍯",
    "Frozen": "🧊",
    "Canned": "🥫",
    "Other": "📦"
  }
  return emojis[category] || "📦"
}
