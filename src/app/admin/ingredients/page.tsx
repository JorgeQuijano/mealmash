"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, isUserAdmin, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"

import MobileNav from "@/components/mobile-nav"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Ingredient = {
  id: string
  name: string
  category: string
  aliases: string[]
  created_at: string
}

const CATEGORIES = ["produce", "dairy", "meat", "pantry", "frozen", "bakery", "other"]

export default function IngredientsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "other",
    aliases: "",
  })

  useEffect(() => {
    async function checkAdmin() {
      const currentUser = await getUser()
      
      if (!currentUser) {
        router.push("/login")
        return
      }
      
      setUser(currentUser)
      
      const admin = await isUserAdmin(currentUser.id)
      setIsAdmin(admin)
      
      if (!admin) {
        router.push("/dashboard")
        return
      }
      
      loadIngredients()
      setLoading(false)
    }
    
    checkAdmin()
  }, [router])

  // Responsive items per page
  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(window.innerHeight >= 900 ? 25 : 15)
    }
    
    updateItemsPerPage()
    window.addEventListener('resize', updateItemsPerPage)
    return () => window.removeEventListener('resize', updateItemsPerPage)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  async function loadIngredients() {
    const { data } = await supabase
      .from("ingredients")
      .select("*")
      .order("name")
    
    if (data) setIngredients(data)
  }

  // Filter ingredients by search
  const filteredIngredients = ingredients.filter(ing => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      ing.name.toLowerCase().includes(query) ||
      ing.category.toLowerCase().includes(query) ||
      (ing.aliases && ing.aliases.some((a: string) => a.toLowerCase().includes(query)))
    )
  })

  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage)
  const paginatedIngredients = filteredIngredients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  async function handleAddIngredient(e: React.FormEvent) {
    e.preventDefault()
    
    const aliasesArray = formData.aliases
      .split(",")
      .map(a => a.trim())
      .filter(Boolean)

    const ingredientData = {
      name: formData.name.trim(),
      category: formData.category,
      aliases: aliasesArray.length > 0 ? aliasesArray : null,
    }

    const { error } = await supabase.from("ingredients").insert(ingredientData)
    
    if (error) {
      toast.error("Error adding ingredient: " + error.message)
      return
    }

    toast.success("Ingredient added successfully!")
    setShowAddForm(false)
    resetForm()
    loadIngredients()
  }

  async function handleUpdateIngredient(e: React.FormEvent) {
    e.preventDefault()
    
    if (!editingIngredient) return

    const aliasesArray = formData.aliases
      .split(",")
      .map(a => a.trim())
      .filter(Boolean)

    const ingredientData = {
      name: formData.name.trim(),
      category: formData.category,
      aliases: aliasesArray.length > 0 ? aliasesArray : null,
    }

    const { error } = await supabase
      .from("ingredients")
      .update(ingredientData)
      .eq("id", editingIngredient.id)
    
    if (error) {
      toast.error("Error updating ingredient: " + error.message)
      return
    }

    toast.success("Ingredient updated successfully!")
    setEditingIngredient(null)
    setShowAddForm(false)
    resetForm()
    loadIngredients()
  }

  async function handleDeleteIngredient(id: string) {
    // Check if ingredient is used in any recipes
    const { data: usage } = await supabase
      .from("recipe_ingredients")
      .select("id")
      .eq("ingredient_id", id)
      .limit(1)

    if (usage && usage.length > 0) {
      toast.error("Cannot delete ingredient - it's used in recipes")
      return
    }

    if (!confirm("Are you sure you want to delete this ingredient?")) return
    
    const { error } = await supabase.from("ingredients").delete().eq("id", id)
    
    if (error) {
      toast.error("Error deleting ingredient: " + error.message)
    } else {
      toast.success("Ingredient deleted!")
      loadIngredients()
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      category: "other",
      aliases: "",
    })
  }

  function startEditing(ingredient: Ingredient) {
    setEditingIngredient(ingredient)
    setFormData({
      name: ingredient.name,
      category: ingredient.category,
      aliases: ingredient.aliases ? ingredient.aliases.join(", ") : "",
    })
    setShowAddForm(true)
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

      <Dialog open={showAddForm} onOpenChange={(open) => {
        setShowAddForm(open)
        if (!open) {
          setEditingIngredient(null)
          resetForm()
        }
      }}>
        <DialogTrigger asChild>
          <Button className="hidden">Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIngredient ? "Edit Ingredient" : "Add New Ingredient"}</DialogTitle>
            <DialogDescription>
              {editingIngredient ? "Update the ingredient details" : "Add a new ingredient to the global library"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingIngredient ? handleUpdateIngredient : handleAddIngredient} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Chicken Breast"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Aliases (comma-separated)</label>
              <Input
                value={formData.aliases}
                onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                placeholder="e.g., chicken, poultry, breast meat"
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddForm(false)
                setEditingIngredient(null)
                resetForm()
              }} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingIngredient ? "Update" : "Add Ingredient"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <main className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Ingredient Management</h2>
            <p className="text-sm text-muted-foreground md:hidden">{ingredients.length} ingredients</p>
            <p className="text-sm md:text-base text-muted-foreground hidden md:block">{ingredients.length} ingredients in library</p>
          </div>
          <Button onClick={() => { setShowAddForm(true); resetForm(); }} className="w-full md:w-auto">
            ➕ Add Ingredient
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ingredients..."
            className="max-w-md"
          />
        </div>

        {/* Ingredient List */}
        <div className="space-y-2">
          {filteredIngredients.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {searchQuery ? "No ingredients match your search" : "No ingredients yet. Click 'Add Ingredient' to get started."}
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatedIngredients.map((ingredient) => (
                <Card key={ingredient.id} className="py-0">
                  <CardContent className="p-3 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{ingredient.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge variant="outline" className="capitalize text-[10px] py-0 px-1">
                          {ingredient.category}
                        </Badge>
                        {ingredient.aliases && ingredient.aliases.length > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            also: {ingredient.aliases.slice(0, 3).join(", ")}
                            {ingredient.aliases.length > 3 && ` +${ingredient.aliases.length - 3}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => startEditing(ingredient)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleDeleteIngredient(ingredient.id)}
                      >
                        Del
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Prev
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
