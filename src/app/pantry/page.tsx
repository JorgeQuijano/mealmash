"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { getUser, getUserProfile, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import DesktopNav from "@/components/desktop-nav"
import MobileNav from "@/components/mobile-nav"

interface Ingredient {
  id: string
  name: string
  category: string
  aliases?: string[]
}

interface PantryItem {
  id: string
  name: string
  category: string
  quantity: string
  created_at: string
  ingredient_id?: string
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
  const [newItem, setNewItem] = useState({ 
    name: "", 
    category: "Other", 
    quantity: "",
    ingredientId: "" as string | undefined
  })
  const [adding, setAdding] = useState(false)
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)
  const [editQuantity, setEditQuantity] = useState("")
  const [saving, setSaving] = useState(false)
  
  // Autocomplete state
  const [ingredientQuery, setIngredientQuery] = useState("")
  const [ingredientSuggestions, setIngredientSuggestions] = useState<Ingredient[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

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

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Search ingredients when query changes
  useEffect(() => {
    async function searchIngredients() {
      if (ingredientQuery.length < 2) {
        setIngredientSuggestions([])
        return
      }

      setLoadingSuggestions(true)
      try {
        const { data, error } = await supabase
          .from("ingredients")
          .select("id, name, category, aliases")
          .or(`name.ilike.%${ingredientQuery}%,aliases.cs.{${ingredientQuery}}`)
          .order("name")
          .limit(10)

        if (!error && data) {
          setIngredientSuggestions(data)
        }
      } catch (err) {
        console.error("Error searching ingredients:", err)
      } finally {
        setLoadingSuggestions(false)
      }
    }

    const debounce = setTimeout(searchIngredients, 200)
    return () => clearTimeout(debounce)
  }, [ingredientQuery])

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

  const handleAddItem = async () => {
    if (!newItem.name.trim() || !user) return

    setAdding(true)
    const { data, error } = await supabase
      .from("pantry_items")
      .insert({
        user_id: user.id,
        name: newItem.name.trim(),
        category: newItem.category,
        quantity: newItem.quantity.trim() || "1",
        ingredient_id: newItem.ingredientId || null
      })
      .select()

    if (!error && data) {
      setItems([...data, ...items])
      setNewItem({ name: "", category: "Other", quantity: "", ingredientId: undefined })
      setIngredientQuery("")
      setIngredientSuggestions([])
      setShowSuggestions(false)
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

  const openEditModal = (item: PantryItem) => {
    setEditingItem(item)
    setEditQuantity(item.quantity)
  }

  const handleSaveQuantity = async () => {
    if (!editingItem) return

    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/pantry', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          id: editingItem.id,
          quantity: editQuantity
        })
      })

      if (response.ok) {
        setItems(items.map(item => 
          item.id === editingItem.id 
            ? { ...item, quantity: editQuantity }
            : item
        ))
        setEditingItem(null)
      } else {
        const data = await response.json()
        alert('Error: ' + (data.error || 'Failed to update. Check console for details.'))
        console.error('Update failed:', response.status, data)
        setEditingItem(null)
      }
    } catch (err) {
      console.error('Error saving quantity:', err)
      setEditingItem(null)
    }
    setSaving(false)
  }

  const incrementQuantity = () => {
    const current = parseFloat(editQuantity) || 0
    setEditQuantity(String(current + 1))
  }

  const decrementQuantity = () => {
    const current = parseFloat(editQuantity) || 0
    if (current > 0) {
      setEditQuantity(String(current - 1))
    }
  }

  const selectSuggestion = (ingredient: Ingredient) => {
    setNewItem({
      ...newItem,
      name: ingredient.name,
      category: ingredient.category,
      ingredientId: ingredient.id
    })
    setIngredientQuery(ingredient.name)
    setShowSuggestions(false)
    setIngredientSuggestions([])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewItem({ ...newItem, name: value, ingredientId: undefined })
    setIngredientQuery(value)
    setShowSuggestions(true)
  }

  const handleInputFocus = () => {
    if (ingredientQuery.length >= 2) {
      setShowSuggestions(true)
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
    <div className="min-h-screen bg-background pb-safe">
      <DesktopNav />
      <MobileNav />

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
            <div className="relative">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    placeholder="Search ingredient (e.g., Tomatoes)"
                    value={ingredientQuery}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        if (ingredientSuggestions.length > 0) {
                          selectSuggestion(ingredientSuggestions[0])
                        } else {
                          handleAddItem()
                        }
                      }
                      if (e.key === "Escape") {
                        setShowSuggestions(false)
                      }
                    }}
                  />
                  {/* Autocomplete suggestions */}
                  {showSuggestions && (ingredientSuggestions.length > 0 || loadingSuggestions) && (
                    <div 
                      ref={suggestionsRef}
                      className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto"
                    >
                      {loadingSuggestions ? (
                        <div className="p-3 text-sm text-muted-foreground">Searching...</div>
                      ) : (
                        ingredientSuggestions.map((ingredient) => (
                          <button
                            key={ingredient.id}
                            className="w-full text-left px-3 py-2 hover:bg-accent flex items-center justify-between"
                            onClick={() => selectSuggestion(ingredient)}
                          >
                            <span>{ingredient.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {ingredient.category}
                            </Badge>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
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
            </div>
            {newItem.ingredientId && (
              <p className="text-xs text-muted-foreground mt-2">
                ✓ Linked to ingredient database
              </p>
            )}
          </CardContent>
        </Card>

        {/* Edit Item Modal */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {editingItem?.name}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center gap-4 py-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={decrementQuantity}
                className="h-12 w-12 sm:h-11 sm:w-11 text-xl"
              >
                −
              </Button>
              <Input
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                className="w-24 text-center text-2xl font-bold h-12"
                type="number"
                min="0"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={incrementQuantity}
                className="h-12 w-12 sm:h-11 sm:w-11 text-xl"
              >
                +
              </Button>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveQuantity} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(item)}
                            className="h-9 w-9 sm:h-8 sm:w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                            title="Edit quantity"
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="h-9 w-9 sm:h-8 sm:w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            ✕
                          </Button>
                        </div>
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
