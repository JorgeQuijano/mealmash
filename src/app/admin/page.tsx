"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, getUserProfile, isUserAdmin, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type Recipe = {
  id: string
  name: string
  description: string
  ingredients: any
  instructions: string[]
  category: string
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  image_url: string
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  
  // New recipe form
  const [newRecipe, setNewRecipe] = useState({
    name: "",
    description: "",
    ingredients: "",
    instructions: "",
    category: "dinner",
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    servings: 2,
    image_url: ""
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
      
      loadRecipes()
      setLoading(false)
    }
    
    checkAdmin()
  }, [router])

  async function loadRecipes() {
    const { data } = await supabase.from("recipes").select("*")
    if (data) setRecipes(data)
  }

  async function handleAddRecipe(e: React.FormEvent) {
    e.preventDefault()
    
    const recipeData = {
      name: newRecipe.name,
      description: newRecipe.description,
      ingredients: JSON.stringify(newRecipe.ingredients.split("\n").filter(Boolean)),
      instructions: newRecipe.instructions.split("\n").filter(Boolean),
      category: newRecipe.category,
      prep_time_minutes: newRecipe.prep_time_minutes,
      cook_time_minutes: newRecipe.cook_time_minutes,
      servings: newRecipe.servings,
      image_url: newRecipe.image_url
    }

    const { error } = await supabase.from("recipes").insert(recipeData)
    
    if (error) {
      alert("Error adding recipe: " + error.message)
    } else {
      alert("Recipe added successfully!")
      setShowAddForm(false)
      setNewRecipe({
        name: "",
        description: "",
        ingredients: "",
        instructions: "",
        category: "dinner",
        prep_time_minutes: 10,
        cook_time_minutes: 20,
        servings: 2,
        image_url: ""
      })
      loadRecipes()
    }
  }

  async function handleDeleteRecipe(id: string) {
    if (!confirm("Are you sure you want to delete this recipe?")) return
    
    const { error } = await supabase.from("recipes").delete().eq("id", id)
    
    if (error) {
      alert("Error deleting recipe: " + error.message)
    } else {
      loadRecipes()
    }
  }

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
            <h1 className="text-2xl font-bold gradient-text">MealMash Admin</h1>
            <Badge variant="destructive">Admin Only</Badge>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/dashboard" className="text-sm hover:text-primary transition-colors">Dashboard</a>
            <a href="/recipes" className="text-sm hover:text-primary transition-colors">Recipes</a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Recipe Management</h2>
            <p className="text-muted-foreground">Add, edit, or remove recipes from the database</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "➕ Add Recipe"}
          </Button>
        </div>

        {/* Add Recipe Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Recipe</CardTitle>
              <CardDescription>Fill in the details to add a new recipe</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddRecipe} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recipe Name</label>
                    <Input
                      value={newRecipe.name}
                      onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newRecipe.category}
                      onChange={(e) => setNewRecipe({ ...newRecipe, category: e.target.value })}
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                      <option value="dessert">Dessert</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={newRecipe.description}
                    onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ingredients (one per line)</label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newRecipe.ingredients}
                    onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
                    placeholder="200g spaghetti&#10;3 eggs&#10;100g pancetta"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Instructions (one per line)</label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newRecipe.instructions}
                    onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                    placeholder="Cook pasta in boiling water&#10;Fry pancetta until crispy"
                  />
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prep Time (min)</label>
                    <Input
                      type="number"
                      value={newRecipe.prep_time_minutes}
                      onChange={(e) => setNewRecipe({ ...newRecipe, prep_time_minutes: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cook Time (min)</label>
                    <Input
                      type="number"
                      value={newRecipe.cook_time_minutes}
                      onChange={(e) => setNewRecipe({ ...newRecipe, cook_time_minutes: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Servings</label>
                    <Input
                      type="number"
                      value={newRecipe.servings}
                      onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Image URL</label>
                    <Input
                      value={newRecipe.image_url}
                      onChange={(e) => setNewRecipe({ ...newRecipe, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">Add Recipe</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Recipe List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Current Recipes ({recipes.length})</h3>
          
          {recipes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No recipes yet. Click &quot;Add Recipe&quot; to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recipes.map((recipe) => (
                <Card key={recipe.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{recipe.name}</h4>
                        <p className="text-sm text-muted-foreground">{recipe.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{recipe.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {recipe.prep_time_minutes + recipe.cook_time_minutes} min
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteRecipe(recipe.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
