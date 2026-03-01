"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type RecipeIngredient = {
  ingredient_id: string
  quantity: string
  ingredients: {
    name: string
    category: string
  }
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
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadRecipe()
  }, [params.id])

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
            <Card>
              <CardContent className="p-4">
                <ul className="space-y-3">
                  {ingredientList.map((ing: RecipeIngredient, index: number) => {
                    const isChecked = checkedIngredients.has(index)
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
                        <span>{ing.quantity} {ing.ingredients?.name}</span>
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
