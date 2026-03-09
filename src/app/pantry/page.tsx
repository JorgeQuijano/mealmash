"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { getUser, getUserProfile, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import MobileNav from "@/components/mobile-nav"
import { getPantryItemLimit } from "@/lib/feature-gate"
import { Crown } from "lucide-react"

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
  unit: string
  created_at: string
  ingredient_id?: string
  expires_at?: string | null
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

const UNITS = ["pieces", "cups", "tbsp", "tsp", "oz", "lb", "g", "kg", "ml", "L", "cloves", "slices", "whole", "bunch", "can", "box", "bag"]

export default function PantryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [items, setItems] = useState<PantryItem[]>([])
  const [loading, setLoading] = useState(true)

  // Get pantry item limit based on subscription
  const tier = profile?.subscription_tier || 'free'
  const limit = getPantryItemLimit(tier)

  const [newItem, setNewItem] = useState({ 
    name: "", 
    category: "Other", 
    quantity: "",
    unit: "pieces",
    ingredientId: "" as string | undefined,
    expiresAt: ""
  })
  const [adding, setAdding] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [quickAddItem, setQuickAddItem] = useState<{name: string, category: string, ingredientId?: string} | null>(null)
  const [quickAddQty, setQuickAddQty] = useState("1")
  const [quickAddUnit, setQuickAddUnit] = useState("pieces")
  const [quickAddExpires, setQuickAddExpires] = useState("")
  const [quickAddSaving, setQuickAddSaving] = useState(false)
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)
  const [editQuantity, setEditQuantity] = useState("")
  const [editUnit, setEditUnit] = useState("pieces")
  const [editExpiresAt, setEditExpiresAt] = useState("")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
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
      
      const { data } = await supabase
        .from('user_profiles')
        .select('*, subscription_tier, subscription_status')
        .eq('id', currentUser.id)
        .single()
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
          .eq("is_enabled", true)
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

    // Check pantry item limit
    const tier = profile?.subscription_tier || 'free'
    const limit = getPantryItemLimit(tier)
    if (limit !== -1 && items.length >= limit) {
      alert(`Free plan limited to ${limit} pantry items. Upgrade to Pro for unlimited items!`)
      return
    }

    setAdding(true)
    const insertData: any = {
      user_id: user.id,
      name: newItem.name.trim(),
      category: newItem.category,
      quantity: newItem.quantity.trim() || "1",
      unit: newItem.unit || "pieces",
      ingredient_id: newItem.ingredientId || null
    }

    // Add expiration date if provided
    if (newItem.expiresAt) {
      insertData.expires_at = newItem.expiresAt
    }

    const { data, error } = await supabase
      .from("pantry_items")
      .insert(insertData)
      .select()

    if (!error && data) {
      setItems([...data, ...items])
      setNewItem({ name: "", category: "Other", quantity: "", unit: "pieces", ingredientId: undefined, expiresAt: "" })
      setIngredientQuery("")
      setIngredientSuggestions([])
      setShowSuggestions(false)
    }
    setAdding(false)
  }

  // Quick add same ingredient (from + button)
  const handleQuickAdd = async () => {
    if (!quickAddItem || !user) return

    // Check pantry item limit
    const tier = profile?.subscription_tier || 'free'
    const limit = getPantryItemLimit(tier)
    if (limit !== -1 && items.length >= limit) {
      alert(`Free plan limited to ${limit} pantry items. Upgrade to Pro for unlimited items!`)
      return
    }
    
    setQuickAddSaving(true)
    const { data, error } = await supabase
      .from("pantry_items")
      .insert({
        user_id: user.id,
        name: quickAddItem.name,
        category: quickAddItem.category,
        quantity: quickAddQty || "1",
        unit: quickAddUnit || "pieces",
        ingredient_id: quickAddItem.ingredientId || null,
        expires_at: quickAddExpires || null
      })
      .select()

    if (!error && data) {
      setItems([...data, ...items])
    }
    setQuickAddSaving(false)
    setQuickAddItem(null)
    setQuickAddQty("1")
    setQuickAddUnit("pieces")
    setQuickAddExpires("")
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
    setEditUnit(item.unit || "pieces")
    setEditExpiresAt(item.expires_at || "")
  }

  const toggleExpand = (name: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(name)) {
      newExpanded.delete(name)
    } else {
      newExpanded.add(name)
    }
    setExpandedItems(newExpanded)
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
          quantity: editQuantity,
          unit: editUnit,
          expires_at: editExpiresAt || null
        })
      })

      if (response.ok) {
        setItems(items.map(item => 
          item.id === editingItem.id 
            ? { ...item, quantity: editQuantity, expires_at: editExpiresAt || null }
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

  // Group items by name (for displaying combined quantities)
  const itemsByName = items.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = []
    }
    acc[item.name].push(item)
    return acc
  }, {} as Record<string, PantryItem[]>)

  // Group by category for display
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
      
      <MobileNav />

      <main className="container mx-auto px-4 py-4">
        {/* Hero - hidden on mobile to save space */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 hidden md:block">
          <div>
            <h2 className="text-3xl font-bold mb-2">🥕 My Pantry</h2>
            <p className="text-muted-foreground">
              Track what ingredients you have on hand
            </p>
          </div>
          <Badge variant="outline" className="text-lg py-1">
            {items.length} {limit === -1 ? (
              <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-sm">
                <Crown className="w-3 h-3 inline mr-1" /> Pro
              </span>
            ) : `/ ${limit} ${limit !== -1 && <span className="text-muted-foreground">(Free plan)</span>}`}
          </Badge>
        </div>

        {/* Mobile: Floating Add Button (FAB) */}
        <div className="md:hidden fixed bottom-20 right-4 z-40">
          <Button 
            onClick={() => setShowAddModal(true)} 
            className="h-14 w-14 rounded-full shadow-lg text-2xl"
          >
            +
          </Button>
        </div>

        {/* Mobile: Add Item Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Pantry Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  ref={inputRef}
                  placeholder="Search ingredient..."
                  value={ingredientQuery}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
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
                    className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto"
                  >
                    {loadingSuggestions ? (
                      <div className="p-3 text-sm text-muted-foreground">Searching...</div>
                    ) : (
                      ingredientSuggestions.map((ingredient) => (
                        <button
                          key={ingredient.id}
                          className="w-full text-left px-3 py-2 hover:bg-accent flex items-center justify-between"
                          onTouchEnd={(e) => {
                            e.preventDefault()
                            selectSuggestion(ingredient)
                          }}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm mt-1"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Quantity</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Qty"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      className="flex-1"
                    />
                    <Select
                      value={newItem.unit}
                      onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Expires (optional)</label>
                <Input
                  type="date"
                  value={newItem.expiresAt}
                  onChange={(e) => setNewItem({ ...newItem, expiresAt: e.target.value })}
                  className="mt-1 w-full"
                />
              </div>
              {newItem.ingredientId ? (
                <p className="text-xs text-green-600">✅ Can match with recipes</p>
              ) : (
                <p className="text-xs text-amber-600">⚠️ Won&apos;t match recipes</p>
              )}
              <Button 
                onClick={async () => {
                  await handleAddItem()
                  setShowAddModal(false)
                }} 
                disabled={adding || !newItem.name.trim()}
                className="w-full"
              >
                {adding ? "Adding..." : "Add to Pantry"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Desktop: Add Item Card */}
        <Card className="hidden md:block mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Add Item</CardTitle>
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
                            onTouchEnd={(e) => {
                              e.preventDefault()
                              selectSuggestion(ingredient)
                            }}
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
                <Input
                  type="date"
                  placeholder="Expires"
                  value={newItem.expiresAt}
                  onChange={(e) => setNewItem({ ...newItem, expiresAt: e.target.value })}
                  className="w-36"
                />
                <Button onClick={handleAddItem} disabled={adding || !newItem.name.trim()}>
                  {adding ? "Adding..." : "Add"}
                </Button>
              </div>
            </div>
            {newItem.ingredientId ? (
              <p className="text-xs text-green-600 mt-2">✅ Can match with recipes</p>
            ) : (
              <p className="text-xs text-amber-600 mt-2">⚠️ Won&apos;t match recipes</p>
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
            <div className="flex justify-center mb-4">
              <Select
                value={editUnit}
                onValueChange={(value) => setEditUnit(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Expires (optional)</label>
              <Input
                type="date"
                value={editExpiresAt}
                onChange={(e) => setEditExpiresAt(e.target.value)}
              />
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

        {/* Quick Add Modal - for adding more of existing ingredient */}
        <Dialog open={!!quickAddItem} onOpenChange={() => setQuickAddItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add {quickAddItem?.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">{quickAddItem?.category}</p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={quickAddQty}
                    onChange={(e) => setQuickAddQty(e.target.value)}
                    className="flex-1 text-lg"
                    type="number"
                    min="1"
                  />
                  <Select
                    value={quickAddUnit}
                    onValueChange={(value) => setQuickAddUnit(value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Expires (optional)</label>
                <Input
                  type="date"
                  value={quickAddExpires}
                  onChange={(e) => setQuickAddExpires(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleQuickAdd} 
                disabled={quickAddSaving}
                className="w-full"
              >
                {quickAddSaving ? "Adding..." : "Add to Pantry"}
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
          <div className="grid gap-2">
            {Object.entries(groupedItems).map(([category, categoryItems]) => {
              // Further group by name within category
              const namesInCategory = [...new Set(categoryItems.map(i => i.name))]
              return (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    {getCategoryEmoji(category)} {category}
                    <Badge variant="secondary" className="ml-2">{namesInCategory.length}</Badge>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {namesInCategory.map(name => {
                      const itemsWithThisName = itemsByName[name] || []
                      const isExpanded = expandedItems.has(name)
                      
                      // Calculate total quantity
                      const totalQty = itemsWithThisName.reduce((sum, i) => sum + (parseFloat(i.quantity) || 1), 0)
                      
                      // Get expiration dates
                      const expires = itemsWithThisName
                        .filter(i => i.expires_at)
                        .map(i => new Date(i.expires_at!).toLocaleDateString())
                      
                      return (
                        <Card key={name} className="hover:shadow-md transition-shadow text-sm py-2">
                          <CardContent className="p-1 md:p-2 !px-2">
                            {/* Main item row - click to expand */}
                            <div 
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => toggleExpand(name)}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Total: {totalQty}
                                  {expires.length > 0 && (
                                    <span className="text-orange-600 ml-1">
                                      • {expires.length} expiring
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setQuickAddItem({
                                      name: name,
                                      category: category,
                                      ingredientId: itemsWithThisName[0]?.ingredient_id || undefined
                                    })
                                    setQuickAddQty("1")
                                    setQuickAddExpires("")
                                  }}
                                  className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-50"
                                  title="Add more"
                                >
                                  ➕
                                </Button>
                                <span className="text-sm text-muted-foreground">{isExpanded ? '▼' : '▶'}</span>
                              </div>
                            </div>
                            
                            {/* Expanded view - show individual items */}
                            {isExpanded && (
                              <div className="mt-2 pt-2 border-t space-y-1">
                                {itemsWithThisName.map((item, idx) => (
                                  <div 
                                    key={item.id} 
                                    className="flex items-center justify-between text-xs bg-muted/50 p-1.5 rounded"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <span className="text-muted-foreground">Qty: {item.quantity} {item.unit || 'pieces'}</span>
                                      {item.expires_at && (
                                        <span className="text-orange-600 ml-1">
                                          • Exp: {new Date(item.expires_at).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEditModal(item)}
                                        className="h-6 w-6 text-amber-500 hover:text-amber-600"
                                      >
                                        ✏️
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="h-6 w-6 text-red-500 hover:text-red-700"
                                      >
                                        ✕
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
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
