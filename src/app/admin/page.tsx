"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, isUserAdmin, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import DesktopNav from "@/components/desktop-nav"
import MobileNav from "@/components/mobile-nav"

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

  // Seed 20 sample recipes
  const sampleRecipes = [
    {
      name: "Classic Pancakes",
      description: "Fluffy American-style pancakes perfect for weekend breakfast",
      ingredients: ["2 cups flour", "2 eggs", "1.5 cups milk", "2 tbsp sugar", "2 tsp baking powder", "1/2 tsp salt"],
      instructions: ["Mix dry ingredients", "Whisk wet ingredients", "Combine and cook on griddle", "Serve with maple syrup"],
      category: "breakfast",
      prep_time_minutes: 10,
      cook_time_minutes: 15,
      servings: 4,
      image_url: ""
    },
    {
      name: "Avocado Toast",
      description: "Simple yet delicious avocado toast with a poached egg",
      ingredients: ["2 slices sourdough bread", "1 ripe avocado", "2 eggs", "Salt and pepper", "Red pepper flakes", "Lemon juice"],
      instructions: ["Toast bread", "Mash avocado with lemon, salt, and pepper", "Poach eggs", "Spread avocado on toast", "Top with poached egg"],
      category: "breakfast",
      prep_time_minutes: 5,
      cook_time_minutes: 10,
      servings: 2,
      image_url: ""
    },
    {
      name: "Greek Salad",
      description: "Fresh Mediterranean salad with feta and olives",
      ingredients: ["3 tomatoes", "1 cucumber", "1/2 red onion", "100g feta cheese", "Kalamata olives", "Olive oil", "Oregano"],
      instructions: ["Chop vegetables", "Add feta and olives", "Drizzle with olive oil", "Sprinkle oregano"],
      category: "lunch",
      prep_time_minutes: 15,
      cook_time_minutes: 0,
      servings: 2,
      image_url: ""
    },
    {
      name: "Chicken Caesar Salad",
      description: "Classic Caesar salad with grilled chicken breast",
      ingredients: ["2 chicken breasts", "1 head romaine lettuce", "Parmesan cheese", "Caesar dressing", "Croutons", "Black pepper"],
      instructions: ["Grill chicken", "Chop lettuce", "Toss with dressing", "Top with chicken, croutons, and parmesan"],
      category: "lunch",
      prep_time_minutes: 10,
      cook_time_minutes: 15,
      servings: 2,
      image_url: ""
    },
    {
      name: "Spaghetti Carbonara",
      description: "Creamy Italian pasta with pancetta and parmesan",
      ingredients: ["400g spaghetti", "200g pancetta", "4 egg yolks", "100g parmesan", "Black pepper", "Salt"],
      instructions: ["Cook pasta", "Fry pancetta until crispy", "Mix egg yolks with parmesan", "Combine pasta with pancetta", "Add egg mixture off heat", "Toss until creamy"],
      category: "dinner",
      prep_time_minutes: 10,
      cook_time_minutes: 20,
      servings: 4,
      image_url: ""
    },
    {
      name: "Beef Tacos",
      description: "Seasoned ground beef tacos with fresh toppings",
      ingredients: ["500g ground beef", "Taco shells", "Taco seasoning", "Lettuce", "Tomatoes", "Cheese", "Sour cream", "Salsa"],
      instructions: ["Brown ground beef", "Add taco seasoning", "Warm taco shells", "Fill with beef", "Top with lettuce, tomato, cheese"],
      category: "dinner",
      prep_time_minutes: 15,
      cook_time_minutes: 15,
      servings: 4,
      image_url: ""
    },
    {
      name: "Grilled Salmon",
      description: "Perfectly grilled salmon with lemon and herbs",
      ingredients: ["4 salmon fillets", "Lemon", "Garlic", "Dill", "Olive oil", "Salt", "Black pepper"],
      instructions: ["Marinate salmon", "Preheat grill", "Grill 4-5 minutes per side", "Serve with lemon wedges"],
      category: "dinner",
      prep_time_minutes: 10,
      cook_time_minutes: 10,
      servings: 4,
      image_url: ""
    },
    {
      name: "Chicken Stir Fry",
      description: "Quick and healthy Asian-style chicken stir fry",
      ingredients: ["500g chicken breast", "Broccoli", "Bell peppers", "Soy sauce", "Ginger", "Garlic", "Sesame oil", "Rice"],
      instructions: ["Slice chicken and vegetables", "Stir fry chicken", "Add vegetables", "Add sauce", "Serve over rice"],
      category: "dinner",
      prep_time_minutes: 15,
      cook_time_minutes: 15,
      servings: 4,
      image_url: ""
    },
    {
      name: "Mushroom Risotto",
      description: "Creamy Italian rice dish with mixed mushrooms",
      ingredients: ["300g arborio rice", "200g mushrooms", "1 onion", "White wine", "Parmesan", "Butter", "Vegetable stock"],
      instructions: ["Sauté mushrooms", "Cook onion", "Add rice and toast", "Add wine", "Add stock gradually", "Stir in parmesan and butter"],
      category: "dinner",
      prep_time_minutes: 10,
      cook_time_minutes: 30,
      servings: 4,
      image_url: ""
    },
    {
      name: "Vegetable Curry",
      description: "Flavorful Indian-style vegetable curry",
      ingredients: ["Potatoes", "Cauliflower", "Chickpeas", "Coconut milk", "Curry powder", "Onion", "Garlic", "Ginger", "Rice"],
      instructions: ["Sauté onion, garlic, ginger", "Add curry powder", "Add vegetables and coconut milk", "Simmer until tender", "Serve with rice"],
      category: "dinner",
      prep_time_minutes: 15,
      cook_time_minutes: 25,
      servings: 4,
      image_url: ""
    },
    {
      name: "Guacamole",
      description: "Fresh Mexican avocado dip",
      ingredients: ["3 ripe avocados", "1 lime", "1/2 onion", "Cilantro", "Jalapeño", "Salt", "Tomato"],
      instructions: ["Mash avocados", "Dice onion, tomato, jalapeño", "Mix everything together", "Add lime juice and salt"],
      category: "snack",
      prep_time_minutes: 15,
      cook_time_minutes: 0,
      servings: 6,
      image_url: ""
    },
    {
      name: "Hummus",
      description: "Smooth and creamy Middle Eastern chickpea dip",
      ingredients: ["400g chickpeas", "Tahini", "Lemon juice", "Garlic", "Olive oil", "Cumin", "Salt"],
      instructions: ["Blend chickpeas", "Add tahini and lemon juice", "Add garlic and spices", "Drizzle with olive oil"],
      category: "snack",
      prep_time_minutes: 10,
      cook_time_minutes: 0,
      servings: 8,
      image_url: ""
    },
    {
      name: "Fruit Smoothie",
      description: "Refreshing blended fruit drink",
      ingredients: ["1 banana", "1 cup berries", "1 cup yogurt", "1/2 cup milk", "Honey", "Ice"],
      instructions: ["Add all ingredients to blender", "Blend until smooth", "Pour and serve"],
      category: "snack",
      prep_time_minutes: 5,
      cook_time_minutes: 0,
      servings: 2,
      image_url: ""
    },
    {
      name: "Bruschetta",
      description: "Italian tomato and basil on toasted bread",
      ingredients: ["Baguette", "Tomatoes", "Basil", "Garlic", "Olive oil", "Balsamic vinegar", "Salt"],
      instructions: ["Dice tomatoes", "Mix with chopped basil, garlic, oil", "Toast baguette", "Top with tomato mixture", "Drizzle with balsamic"],
      category: "snack",
      prep_time_minutes: 15,
      cook_time_minutes: 5,
      servings: 6,
      image_url: ""
    },
    {
      name: "Chocolate Chip Cookies",
      description: "Classic homemade chocolate chip cookies",
      ingredients: ["2.25 cups flour", "1 cup butter", "3/4 cup sugar", "3/4 cup brown sugar", "2 eggs", "1 tsp vanilla", "1 tsp baking soda", "2 cups chocolate chips"],
      instructions: ["Cream butter and sugars", "Beat in eggs and vanilla", "Mix dry ingredients", "Combine and add chocolate chips", "Bake at 375°F for 9-11 minutes"],
      category: "dessert",
      prep_time_minutes: 15,
      cook_time_minutes: 11,
      servings: 48,
      image_url: ""
    },
    {
      name: "Brownies",
      description: "Rich and fudgy chocolate brownies",
      ingredients: ["1/2 cup butter", "1 cup sugar", "2 eggs", "1/3 cup cocoa powder", "1/2 cup flour", "1/4 tsp salt", "1 tsp vanilla"],
      instructions: ["Melt butter", "Mix in sugar, eggs, vanilla", "Add dry ingredients", "Pour into greased pan", "Bake at 350°F for 25-30 minutes"],
      category: "dessert",
      prep_time_minutes: 10,
      cook_time_minutes: 30,
      servings: 16,
      image_url: ""
    },
    {
      name: "Banana Bread",
      description: "Moist and delicious banana bread",
      ingredients: ["3 ripe bananas", "1/3 cup melted butter", "3/4 cup sugar", "1 egg", "1 tsp vanilla", "1 tsp baking soda", "1.5 cups flour"],
      instructions: ["Mash bananas", "Mix in butter", "Add sugar, egg, vanilla", "Add baking soda and flour", "Bake at 350°F for 55-60 minutes"],
      category: "dessert",
      prep_time_minutes: 15,
      cook_time_minutes: 60,
      servings: 10,
      image_url: ""
    },
    {
      name: "Cheesecake",
      description: "Creamy New York style cheesecake",
      ingredients: ["2 lbs cream cheese", "1 cup sugar", "5 eggs", "2 tsp vanilla", "1/4 cup flour", "1 cup sour cream", "Graham cracker crust"],
      instructions: ["Beat cream cheese and sugar", "Add eggs one at a time", "Mix in vanilla, flour, sour cream", "Pour over crust", "Bake at 325°F for 1 hour", "Cool slowly"],
      category: "dessert",
      prep_time_minutes: 30,
      cook_time_minutes: 60,
      servings: 12,
      image_url: ""
    },
    {
      name: "Apple Pie",
      description: "Classic American apple pie with cinnamon",
      ingredients: ["6 apples", "1 pie crust", "3/4 cup sugar", "1 tsp cinnamon", "1/4 tsp nutmeg", "2 tbsp flour", "2 tbsp butter"],
      instructions: ["Slice apples", "Mix with sugar and spices", "Place in crust", "Dot with butter", "Cover with top crust", "Bake at 425°F for 40-50 minutes"],
      category: "dessert",
      prep_time_minutes: 45,
      cook_time_minutes: 50,
      servings: 8,
      image_url: ""
    },
    {
      name: "Tiramisu",
      description: "Italian coffee-flavored layered dessert",
      ingredients: ["500g mascarpone", "4 eggs", "1/2 cup sugar", "2 cups espresso", "Ladyfingers", "Cocoa powder", "Kahlua"],
      instructions: ["Whisk egg yolks with sugar", "Mix in mascarpone", "Whip egg whites and fold in", "Dip ladyfingers in coffee", "Layer with cream", "Dust with cocoa", "Chill overnight"],
      category: "dessert",
      prep_time_minutes: 45,
      cook_time_minutes: 0,
      servings: 8,
      image_url: ""
    }
  ]

  async function seedRecipes() {
    if (!confirm("This will add 20 sample recipes. Continue?")) return
    
    setLoading(true)
    const { error } = await supabase.from("recipes").insert(sampleRecipes)
    
    if (error) {
      alert("Error seeding recipes: " + error.message)
    } else {
      alert("Successfully seeded 20 recipes!")
      loadRecipes()
    }
    setLoading(false)
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
    <div className="min-h-screen bg-background pb-safe">
      <DesktopNav />
      <MobileNav />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Recipe Management</h2>
            <p className="text-muted-foreground">Add, edit, or remove recipes from the database</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={seedRecipes}>
              🌱 Seed 20 Recipes
            </Button>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? "Cancel" : "➕ Add Recipe"}
            </Button>
          </div>
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
