"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { getUser, isUserAdmin, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"

import MobileNav from "@/components/mobile-nav"
import IngredientSearch from "@/components/ingredient-search"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type SelectedIngredient = {
  ingredient_id: string
  name: string
  quantity: string
  unit: string
  category: string
}

type Recipe = {
  id: string
  name: string
  description: string
  ingredients: any
  instructions: string[]
  category: string[]
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  image_url: string
}

// Helper to parse category from any format to string array
function parseCategory(cat: any): string[] {
  if (Array.isArray(cat)) return cat
  if (typeof cat === 'string') {
    try {
      const parsed = JSON.parse(cat)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return [cat]
    }
  }
  return [String(cat)]
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // New recipe form
  const [newRecipe, setNewRecipe] = useState({
    name: "",
    description: "",
    instructions: "",
    category: ["dinner"] as string[],
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    servings: 2,
    image_url: "",
    cuisine: [] as string[],
    dietary_tags: [] as string[],
    difficulty: "Medium" as string,
  })

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Image upload function
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setImagePreview(URL.createObjectURL(file))

    try {
      // If there's an old image, try to delete it first
      const oldUrl = newRecipe.image_url
      if (oldUrl && oldUrl.includes('recipe-images')) {
        try {
          // Extract filename from URL
          const oldFilename = oldUrl.split('/recipe-images/')[1]
          if (oldFilename) {
            await supabase.storage
              .from('recipe-images')
              .remove([oldFilename])
          }
        } catch (deleteErr) {
          // Ignore delete errors - maybe file didn't exist
          console.log('Could not delete old image:', deleteErr)
        }
      }

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      const { data, error } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(fileName)

      setNewRecipe({ ...newRecipe, image_url: publicUrl })
      toast.success('Image uploaded!')
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  // Clear image
  const clearImage = async () => {
    const oldUrl = newRecipe.image_url
    
    // Try to delete the old image from storage
    if (oldUrl && oldUrl.includes('recipe-images')) {
      try {
        const oldFilename = oldUrl.split('/recipe-images/')[1]
        if (oldFilename) {
          await supabase.storage
            .from('recipe-images')
            .remove([oldFilename])
        }
      } catch (err) {
        console.log('Could not delete image:', err)
      }
    }
    
    setNewRecipe({ ...newRecipe, image_url: '' })
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // Normalized ingredients
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([])

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

  // Responsive items per page + reset to page 1 when recipes change
  useEffect(() => {
    const updateItemsPerPage = () => {
      // Taller screens (≥900px height) get 20, smaller get 10
      setItemsPerPage(window.innerHeight >= 900 ? 20 : 10)
    }
    
    updateItemsPerPage()
    window.addEventListener('resize', updateItemsPerPage)
    return () => window.removeEventListener('resize', updateItemsPerPage)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [recipes.length])

  async function loadRecipes() {
    const { data } = await supabase.from("recipes").select("*")
    if (data) setRecipes(data)
  }

  async function handleAddRecipe(e: React.FormEvent) {
    e.preventDefault()
    
    // Create the recipe first
    const recipeData = {
      name: newRecipe.name,
      description: newRecipe.description,
      ingredients: JSON.stringify(selectedIngredients.map(i => `${i.quantity} ${i.unit} ${i.name}`.trim()).filter(Boolean)),
      instructions: newRecipe.instructions.split("\n").filter(Boolean),
      category: newRecipe.category,
      prep_time_minutes: newRecipe.prep_time_minutes,
      cook_time_minutes: newRecipe.cook_time_minutes,
      servings: newRecipe.servings,
      image_url: newRecipe.image_url,
      cuisine: newRecipe.cuisine,
      dietary_tags: newRecipe.dietary_tags,
      difficulty: newRecipe.difficulty,
    }

    const { data: recipe, error } = await supabase.from("recipes").insert(recipeData).select().single()
    
    if (error) {
      toast.error("Error adding recipe: " + error.message)
      return
    }

    // Add recipe_ingredients if we have any
    if (selectedIngredients.length > 0) {
      const recipeIngredientsData = selectedIngredients
        .filter(i => i.ingredient_id) // Only save if ingredient was actually created/selected
        .map(i => ({
          recipe_id: recipe.id,
          ingredient_id: i.ingredient_id,
          quantity: i.quantity || null,
          quantity_num: i.quantity ? parseFloat(i.quantity) : null,
          unit: i.unit || null
        }))

      if (recipeIngredientsData.length > 0) {
        const { error: riError } = await supabase.from("recipe_ingredients").insert(recipeIngredientsData)
        if (riError) {
          toast.error("Recipe saved but error adding ingredients: " + riError.message)
        }
      }
    }
    
    toast.success("Recipe added successfully!")
    setShowAddForm(false)
    setNewRecipe({
      name: "",
      description: "",
      instructions: "",
      category: ["dinner"],
      prep_time_minutes: 10,
      cook_time_minutes: 20,
      servings: 2,
      image_url: "",
      cuisine: [],
      dietary_tags: [],
      difficulty: "Medium",
    })
    setSelectedIngredients([])
    loadRecipes()
  }

  // Handle update recipe
  const handleUpdateRecipe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingRecipe) return

    const instructionsArray = newRecipe.instructions
      .split('\n')
      .filter(line => line.trim())
    
    const recipeData = {
      name: newRecipe.name,
      description: newRecipe.description,
      instructions: instructionsArray,
      category: newRecipe.category,
      prep_time_minutes: newRecipe.prep_time_minutes,
      cook_time_minutes: newRecipe.cook_time_minutes,
      servings: newRecipe.servings,
      image_url: newRecipe.image_url,
      cuisine: newRecipe.cuisine,
      dietary_tags: newRecipe.dietary_tags,
      difficulty: newRecipe.difficulty,
    }

    const { error } = await supabase
      .from("recipes")
      .update(recipeData)
      .eq("id", editingRecipe.id)
    
    if (error) {
      toast.error("Error updating recipe: " + error.message)
      return
    }

    // Delete existing recipe_ingredients and re-add
    await supabase.from("recipe_ingredients").delete().eq("recipe_id", editingRecipe.id)
    
    if (selectedIngredients.length > 0) {
      const recipeIngredientsData = selectedIngredients
        .filter(i => i.ingredient_id)
        .map(i => ({
          recipe_id: editingRecipe.id,
          ingredient_id: i.ingredient_id,
          quantity: i.quantity || null,
          quantity_num: i.quantity ? parseFloat(i.quantity) : null,
          unit: i.unit || null
        }))

      if (recipeIngredientsData.length > 0) {
        await supabase.from("recipe_ingredients").insert(recipeIngredientsData)
      }
    }
    
    toast.success("Recipe updated successfully!")
    setEditingRecipe(null)
    setShowAddForm(false)
    setNewRecipe({
      name: "",
      description: "",
      instructions: "",
      category: ["dinner"],
      prep_time_minutes: 10,
      cook_time_minutes: 20,
      servings: 2,
      image_url: "",
      cuisine: [],
      dietary_tags: [],
      difficulty: "Medium",
    })
    setSelectedIngredients([])
    loadRecipes()
  }

  // Function to start editing a recipe
  const startEditing = async (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setShowAddForm(true)
    setNewRecipe({
      name: recipe.name,
      description: recipe.description || "",
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : "",
      category: parseCategory(recipe.category),
      prep_time_minutes: recipe.prep_time_minutes,
      cook_time_minutes: recipe.cook_time_minutes,
      servings: recipe.servings,
      image_url: recipe.image_url || "",
      cuisine: (recipe as any).cuisine || [],
      dietary_tags: (recipe as any).dietary_tags || [],
      difficulty: (recipe as any).difficulty || "Medium",
    })
    
    // Set image preview if there's an existing image
    if (recipe.image_url) {
      setImagePreview(recipe.image_url)
    } else {
      setImagePreview(null)
    }
    
    // Load existing ingredients
    const { data: existingIngs } = await supabase
      .from("recipe_ingredients")
      .select("*, ingredients(name, category)")
      .eq("recipe_id", recipe.id)
    
    if (existingIngs && existingIngs.length > 0) {
      const mapped = existingIngs.map((ri: any) => ({
        ingredient_id: ri.ingredient_id,
        name: ri.ingredients?.name || "",
        quantity: ri.quantity || "",
        unit: ri.unit || "",
        category: ri.ingredients?.category || ""
      }))
      setSelectedIngredients(mapped)
    } else {
      setSelectedIngredients([])
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
      toast.error("Error seeding recipes: " + error.message)
    } else {
      toast.success("Successfully seeded 20 recipes!")
      loadRecipes()
    }
    setLoading(false)
  }

  async function handleDeleteRecipe(id: string) {
    if (!confirm("Are you sure you want to delete this recipe?")) return
    
    const { error } = await supabase.from("recipes").delete().eq("id", id)
    
    if (error) {
      toast.error("Error deleting recipe: " + error.message)
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
      
      <MobileNav />

      <Dialog open={showAddForm} onOpenChange={(open) => {
        setShowAddForm(open)
        if (!open) {
          // Reset form when modal closes
          setEditingRecipe(null)
          setNewRecipe({
            name: "",
            description: "",
            instructions: "",
            category: ["dinner"],
            prep_time_minutes: 10,
            cook_time_minutes: 20,
            servings: 2,
            image_url: "",
            cuisine: [],
            dietary_tags: [],
            difficulty: "Medium",
          })
          setSelectedIngredients([])
          setImagePreview(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
      }}>
        <DialogTrigger asChild>
          {/* Hidden trigger - we control open state manually */}
          <Button className="hidden">Open</Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecipe ? "Edit Recipe" : "Add New Recipe"}</DialogTitle>
            <DialogDescription>{editingRecipe ? "Update the recipe details" : "Fill in the details to add a new recipe"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={editingRecipe ? handleUpdateRecipe : handleAddRecipe} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <div className="flex gap-2 flex-wrap">
                  {["breakfast", "lunch", "dinner", "snack", "dessert"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        const current = newRecipe.category || []
                        const newCats = current.includes(cat)
                          ? current.filter(c => c !== cat)
                          : [...current, cat]
                        setNewRecipe({ ...newRecipe, category: newCats })
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors ${
                        (newRecipe.category || []).includes(cat)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cuisine Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cuisine</label>
              <div className="flex gap-2 flex-wrap">
                {['Italian', 'Mexican', 'Asian', 'American', 'Indian', 'Mediterranean', 'French', 'Japanese', 'Thai', 'Chinese'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      const current = newRecipe.cuisine || []
                      const updated = current.includes(c)
                        ? current.filter(x => x !== c)
                        : [...current, c]
                      setNewRecipe({ ...newRecipe, cuisine: updated })
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      (newRecipe.cuisine || []).includes(c)
                        ? "bg-orange-500 text-white"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Dietary</label>
              <div className="flex gap-2 flex-wrap">
                {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb', 'Nut-Free'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      const current = newRecipe.dietary_tags || []
                      const updated = current.includes(d)
                        ? current.filter(x => x !== d)
                        : [...current, d]
                      setNewRecipe({ ...newRecipe, dietary_tags: updated })
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      (newRecipe.dietary_tags || []).includes(d)
                        ? "bg-green-600 text-white"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <div className="flex gap-2">
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setNewRecipe({ ...newRecipe, difficulty: d })}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      newRecipe.difficulty === d
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {d}
                  </button>
                ))}
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
              <label className="text-sm font-medium">Ingredients</label>
              <IngredientSearch
                selectedIngredients={selectedIngredients}
                onChange={setSelectedIngredients}
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                <label className="text-sm font-medium">Recipe Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                {uploadingImage && <p className="text-sm text-muted-foreground">Uploading...</p>}
                {imagePreview || newRecipe.image_url ? (
                  <div className="relative mt-2">
                    <img 
                      src={imagePreview || newRecipe.image_url} 
                      alt="Preview" 
                      className="h-32 w-32 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2"
                      onClick={clearImage}
                    >
                      ✕
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddForm(false)
                setEditingRecipe(null)
                setNewRecipe({ name: "", description: "", instructions: "", category: ["dinner"], prep_time_minutes: 10, cook_time_minutes: 20, servings: 2, image_url: "", cuisine: [], dietary_tags: [], difficulty: "Medium" })
                setSelectedIngredients([])
                setImagePreview(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingRecipe ? "Update Recipe" : "Add Recipe"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <main className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-2xl font-bold">Recipe Management</h2>
          </div>
          <Button onClick={() => { setShowAddForm(true); setSelectedIngredients([]); }}>
            ➕ Add Recipe
          </Button>
        </div>

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
            <>
              {/* Sorted and paginated recipes */}
              {(() => {
                const sortedRecipes = [...recipes].sort((a, b) => a.name.localeCompare(b.name))
                const totalPages = Math.ceil(sortedRecipes.length / itemsPerPage)
                const startIndex = (currentPage - 1) * itemsPerPage
                const paginatedRecipes = sortedRecipes.slice(startIndex, startIndex + itemsPerPage)
                
                return (
                  <>
                    <div className="space-y-2">
                      {paginatedRecipes.map((recipe) => (
                <Card key={recipe.id} className="py-0">
                  <CardContent className="p-2 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{recipe.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {parseCategory(recipe.category).slice(0, 2).map((cat) => (
                          <Badge key={cat} variant="outline" className="capitalize text-[10px] py-0 px-1">
                            {cat}
                          </Badge>
                        ))}
                        <span className="text-[10px] text-muted-foreground">
                          {recipe.prep_time_minutes + recipe.cook_time_minutes}m
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => startEditing(recipe)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleDeleteRecipe(recipe.id)}
                      >
                        Del
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                      ))}
                    </div>
                    
                    {/* Pagination Controls */}
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
                )
              })()}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
