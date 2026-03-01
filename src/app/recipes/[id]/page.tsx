"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getUser, getUserProfile, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type RecipeIngredient = {
  ingredient_id: string
  quantity: string
  quantity_num?: number
  unit?: string
  ingredients: {
    name: string
    category: string
  }
}

type PantryItem = {
  id: string
  name: string
  quantity: string
  ingredient_id: string | null
  user_id: string
}

type Recipe = {
  id: string
  name: string
  description: string
  instructions: string[]
  category: string
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  image_url: string
  recipe_ingredients?: RecipeIngredient[]
}

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())
  const [matchedIndices, setMatchedIndices] = useState<number[]>([])
  const [missingIndices, setMissingIndices] = useState<number[]>([])
  const [showAddToListModal, setShowAddToListModal] = useState(false)
  const [addingToList, setAddingToList] = useState(false)
  const [addedToList, setAddedToList] = useState(false)

  useEffect(() => {
    async function init() {
      const currentUser = await getUser()
      if (currentUser) {
        setUser(currentUser)
        await loadPantryItems(currentUser.id)
      }
      await loadRecipe()
    }
    init()
  }, [params.id])

  // Recalculate matches when pantryItems or recipe changes
  useEffect(() => {
    if (!recipe?.recipe_ingredients || pantryItems.length === 0) return
    
    const matched: number[] = []
    const missing: number[] = []
    
    const pantryIngredientIds = new Set(
      pantryItems.filter(p => p.ingredient_id).map(p => p.ingredient_id)
    )
    
    recipe.recipe_ingredients.forEach((ri, index) => {
      if (pantryIngredientIds.has(ri.ingredient_id)) {
        matched.push(index)
      } else {
        missing.push(index)
      }
    })
    
    setMatchedIndices(matched)
    setMissingIndices(missing)
  }, [pantryItems, recipe?.recipe_ingredients])

  async function loadPantryItems(userId: string) {
    const { data, error } = await supabase
      .from("pantry_items")
      .select("id, name, quantity, ingredient_id, user_id")
      .eq("user_id", userId)
    
    if (!error && data) {
      setPantryItems(data)
    }
  }

  async function loadRecipe() {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from("recipes")
      .select(`
        *,
        recipe_ingredients (
          ingredient_id,
          quantity,
          ingredients (name, category)
        )
      `)
      .eq("id", params.id)
      .single()

    if (data) {
      setRecipe(data)
      
      // Match ingredients with pantry
      if (data.recipe_ingredients && pantryItems.length > 0) {
        const matched: number[] = []
        const missing: number[] = []
        
        const pantryIngredientIds = new Set(
          pantryItems.filter(p => p.ingredient_id).map(p => p.ingredient_id)
        )
        
        data.recipe_ingredients.forEach((ri: RecipeIngredient, index: number) => {
          if (pantryIngredientIds.has(ri.ingredient_id)) {
            matched.push(index)
          } else {
            missing.push(index)
          }
        })
        
        setMatchedIndices(matched)
        setMissingIndices(missing)
      }
    } else if (fetchError) {
      console.error("Error loading recipe:", fetchError)
      setError("Recipe not found")
    }
    setLoading(false)
  }

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedIngredients(newChecked)
  }

  const handleAddMissingToShoppingList = async () => {
    if (!user || missingIndices.length === 0) return
    
    setAddingToList(true)
    
    const ingredientList = recipe?.recipe_ingredients || []
    
    for (const index of missingIndices) {
      const ing = ingredientList[index]
      const itemName = ing.ingredients?.name || ''
      const quantity = `${ing.quantity_num || ing.quantity || ''} ${ing.unit || ''}`.trim()
      
      // Check if already in shopping list
      const { data: existing } = await supabase
        .from("shopping_list")
        .select("id, quantity")
        .eq("user_id", user.id)
        .ilike("item_name", itemName)
        .single()
      
      if (existing) {
        // Update quantity (append)
        const newQty = `${existing.quantity} + ${quantity}`
        await supabase
          .from("shopping_list")
          .update({ quantity: newQty })
          .eq("id", existing.id)
      } else {
        // Insert new
        await supabase.from("shopping_list").insert({
          user_id: user.id,
          item_name: itemName,
          quantity: quantity || "1",
          ingredient_id: ing.ingredient_id,
          is_checked: false
        })
      }
    }
    
    setAddingToList(false)
    setShowAddToListModal(false)
    setAddedToList(true)
    
    // Reset success message after 3 seconds
    setTimeout(() => setAddedToList(false), 3000)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      breakfast: "bg-yellow-100 text-yellow-800",
      lunch: "bg-green-100 text-green-800",
      dinner: "bg-orange-100 text-orange-800",
      snack: "bg-purple-100 text-purple-800",
      dessert: "bg-pink-100 text-pink-800"
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const formatIngredient = (ing: any, index: number): string => {
    if (typeof ing === 'string') return ing
    if (typeof ing === 'object' && ing !== null) {
      return `${ing.amount || ''} ${ing.item || ''}`.trim()
    }
    return String(ing)
  }

  const printRecipe = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Recipe Not Found 😔</h1>
        <p className="text-muted-foreground">The recipe you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/recipes")}>← Back to Recipes</Button>
      </div>
    )
  }

  const ingredientList = recipe.recipe_ingredients || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card print:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/recipes">
              <Button variant="ghost" size="sm">← Back</Button>
            </Link>
            <h1 className="text-2xl font-bold gradient-text">MealMash</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="text-sm hover:text-primary transition-colors">Dashboard</a>
            <a href="/suggestions" className="text-sm hover:text-primary transition-colors">🍳 What Can I Make?</a>
            <a href="/recipes" className="text-sm text-primary font-medium">Recipes</a>
            <a href="/pantry" className="text-sm hover:text-primary transition-colors">Pantry</a>
            <a href="/shopping-list" className="text-sm hover:text-primary transition-colors">Shopping List</a>
            <a href="/admin" className="text-sm hover:text-primary transition-colors">Admin</a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Print Header */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-3xl font-bold">{recipe.name}</h1>
          <p className="text-muted-foreground">MealMash Recipe</p>
        </div>

        {/* Recipe Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <Badge className={`${getCategoryColor(recipe.category)} mb-3`}>
                {recipe.category}
              </Badge>
              <h1 className="text-4xl font-bold mb-3">{recipe.name}</h1>
              <p className="text-lg text-muted-foreground">{recipe.description}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" onClick={printRecipe}>
                🖨️ Print
              </Button>
              <Button>❤️ Save</Button>
            </div>
          </div>
        </div>

        {/* Recipe Stats */}
        <Card className="mb-8">
          <CardContent className="flex flex-wrap justify-center gap-6 md:gap-12 py-6">
            <div className="text-center">
              <div className="text-3xl mb-1">⏱️</div>
              <div className="text-sm text-muted-foreground">Prep Time</div>
              <div className="text-xl font-semibold">{recipe.prep_time_minutes} min</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">🍳</div>
              <div className="text-sm text-muted-foreground">Cook Time</div>
              <div className="text-xl font-semibold">{recipe.cook_time_minutes} min</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">👥</div>
              <div className="text-sm text-muted-foreground">Servings</div>
              <div className="text-xl font-semibold">{recipe.servings}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">⏲️</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
              <div className="text-xl font-semibold">{recipe.prep_time_minutes + recipe.cook_time_minutes} min</div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-[1fr_1.5fr] gap-8">
          {/* Ingredients */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🛒 Ingredients
            </h2>
            
            {/* Pantry Status Summary */}
            {user && ingredientList.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  ✅ {matchedIndices.length} in pantry
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  ❌ {missingIndices.length} missing
                </Badge>
              </div>
            )}
            
            {/* Add Missing to Shopping List Button */}
            {user && missingIndices.length > 0 && (
              <Button 
                onClick={() => setShowAddToListModal(true)}
                className="mb-4 bg-orange-500 hover:bg-orange-600"
              >
                🛒 Add {missingIndices.length} Missing to Shopping List
              </Button>
            )}
            
            {/* Success Message */}
            {addedToList && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                ✅ Added to shopping list!
              </div>
            )}
            
            <Card>
              <CardContent className="p-4">
                <ul className="space-y-3">
                  {ingredientList.map((ing: RecipeIngredient, index: number) => {
                    const isChecked = checkedIngredients.has(index)
                    const isMatched = matchedIndices.includes(index)
                    const isMissing = missingIndices.includes(index)
                    
                    return (
                      <li 
                        key={index} 
                        className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors hover:bg-muted ${isChecked ? 'line-through text-muted-foreground opacity-60' : ''}`}
                        onClick={() => toggleIngredient(index)}
                      >
                        <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={isMatched ? 'text-green-600' : isMissing ? 'text-red-500' : ''}>
                          {isMatched && '✅ '}
                          {isMissing && '❌ '}
                          {ing.quantity_num || ing.quantity}{ing.unit ? ` ${ing.unit}` : ''} {ing.ingredients?.name}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              📝 Instructions
            </h2>
            <Card>
              <CardContent className="p-4">
                <ol className="space-y-4">
                  {recipe.instructions?.map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <p className="text-muted-foreground pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center print:hidden">
          <Link href="/recipes">
            <Button variant="outline" size="lg">
              ← Browse More Recipes
            </Button>
          </Link>
        </div>

        {/* Add Missing to Shopping List Modal */}
        {showAddToListModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-6 max-w-md w-full shadow-xl">
              <h3 className="text-xl font-bold mb-2">Add Missing Ingredients</h3>
              <p className="text-muted-foreground mb-4">
                Add the following {missingIndices.length} items to your shopping list?
              </p>
              
              <ul className="mb-4 max-h-60 overflow-auto border rounded p-2">
                {missingIndices.map(index => {
                  const ing = ingredientList[index]
                  return (
                    <li key={index} className="py-1 text-red-500">
                      ❌ {ing.quantity_num || ing.quantity}{ing.unit ? ` ${ing.unit}` : ''} {ing.ingredients?.name}
                    </li>
                  )
                })}
              </ul>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddToListModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMissingToShoppingList}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  disabled={addingToList}
                >
                  {addingToList ? "Adding..." : "Add to Shopping List"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { 
            background: white !important; 
          }
          .print\\:hidden { 
            display: none !important; 
          }
          .hidden\\:print\\:block { 
            display: block !important; 
          }
        }
      `}</style>
    </div>
  )
}
