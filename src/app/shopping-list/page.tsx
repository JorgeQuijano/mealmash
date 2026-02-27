"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, getUserProfile, signOut, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface ShoppingItem {
  id: string
  item_name: string
  quantity: string
  is_checked: boolean
  created_at: string
}

export default function ShoppingListPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState({ item_name: "", quantity: "" })
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
      await loadShoppingList(currentUser.id)
      setLoading(false)
    }
    
    loadUser()
  }, [router])

  async function loadShoppingList(userId: string) {
    const { data, error } = await supabase
      .from("shopping_list")
      .select("*")
      .eq("user_id", userId)
      .order("is_checked", { ascending: true })
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
    if (!newItem.item_name.trim() || !user) return

    setAdding(true)
    const { data, error } = await supabase
      .from("shopping_list")
      .insert({
        user_id: user.id,
        item_name: newItem.item_name.trim(),
        quantity: newItem.quantity.trim() || "1",
        is_checked: false
      })
      .select()

    if (!error && data) {
      setItems([...data, ...items])
      setNewItem({ item_name: "", quantity: "" })
    }
    setAdding(false)
  }

  const handleToggleCheck = async (item: ShoppingItem) => {
    const newChecked = !item.is_checked
    
    const { error } = await supabase
      .from("shopping_list")
      .update({ is_checked: newChecked })
      .eq("id", item.id)

    if (!error) {
      setItems(items.map(i => 
        i.id === item.id ? { ...i, is_checked: newChecked } : i
      ))
    }
  }

  const handleDeleteItem = async (id: string) => {
    const { error } = await supabase
      .from("shopping_list")
      .delete()
      .eq("id", id)

    if (!error) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const handleClearChecked = async () => {
    const checkedItems = items.filter(i => i.is_checked)
    
    for (const item of checkedItems) {
      await supabase.from("shopping_list").delete().eq("id", item.id)
    }
    
    setItems(items.filter(i => !i.is_checked))
  }

  const uncheckedItems = items.filter(i => !i.is_checked)
  const checkedItems = items.filter(i => i.is_checked)

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
              <a href="/recipes" className="text-sm hover:text-primary transition-colors">Recipes</a>
              <a href="/pantry" className="text-sm hover:text-primary transition-colors">Pantry</a>
              <a href="/shopping-list" className="text-sm text-primary font-medium">Shopping List</a>
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
            <h2 className="text-3xl font-bold mb-2">📝 Shopping List</h2>
            <p className="text-muted-foreground">
              Keep track of what you need to buy
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-lg py-1">
              {uncheckedItems.length} to buy
            </Badge>
            {checkedItems.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearChecked}>
                Clear checked
              </Button>
            )}
          </div>
        </div>

        {/* Add Item Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Item name (e.g., Milk)"
                value={newItem.item_name}
                onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              />
              <Input
                placeholder="Qty"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                className="w-24"
                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              />
              <Button onClick={handleAddItem} disabled={adding || !newItem.item_name.trim()}>
                {adding ? "Adding..." : "Add"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shopping List */}
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Your shopping list is empty</p>
              <p className="text-sm text-muted-foreground">Add some items above to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Unchecked Items */}
            {uncheckedItems.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">To Buy</h3>
                <div className="space-y-2">
                  {uncheckedItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => handleToggleCheck(item)}
                        >
                          <div className="w-5 h-5 border-2 border-gray-300 rounded hover:border-green-500 transition-colors flex items-center justify-center">
                          </div>
                          <div>
                            <p className="font-medium">{item.item_name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
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
            )}

            {/* Checked Items */}
            {checkedItems.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Purchased</h3>
                <div className="space-y-2">
                  {checkedItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow bg-muted/30">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => handleToggleCheck(item)}
                        >
                          <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center text-white text-xs">
                            ✓
                          </div>
                          <div className="line-through text-muted-foreground">
                            <p className="font-medium">{item.item_name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
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
            )}
          </div>
        )}
      </main>
    </div>
  )
}
