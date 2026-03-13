"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getImageUrl } from "@/lib/images"
import Image from "next/image"

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

// Helper to parse category from any format to string array
function parseCategory(cat: any): string[] {
  if (Array.isArray(cat)) return cat
  if (typeof cat === "string") {
    try {
      const parsed = JSON.parse(cat)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return [cat]
    }
  }
  return [String(cat)]
}

export default function PublicRecipePage() {
  const params = useParams()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRecipe() {
      setLoading(true)
      
      const slug = params.slug as string
      
      // Fetch by slug
      const { data, error: fetchError } = await supabase
        .from("recipes")
        .select(`
          *,
          recipe_ingredients (
            ingredient_id,
            quantity,
            quantity_num,
            unit,
            ingredients (name, category)
          )
        `)
        .eq("slug", slug)
        .single()

      if (fetchError || !data) {
        setError("Recipe not found")
        setLoading(false)
        return
      }

      setRecipe(data)
      setLoading(false)
    }

    if (params.slug) {
      loadRecipe()
    }
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Recipe Not Found</h1>
        <p className="text-muted-foreground">This recipe doesn't exist or has been removed.</p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    )
  }

  const getCategoryColor = (category: any) => {
    const cats = parseCategory(category)
    const cat = cats[0]
    const colors: Record<string, string> = {
      breakfast: "bg-yellow-100 text-yellow-800",
      lunch: "bg-green-100 text-green-800",
      dinner: "bg-orange-100 text-orange-800",
      snack: "bg-purple-100 text-purple-800",
      dessert: "bg-pink-100 text-pink-800"
    }
    return colors[cat] || "bg-gray-100 text-gray-800"
  }

  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back link */}
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
          ← Back to MealClaw
        </Link>

        {/* Hero Image */}
        {recipe.image_url && (
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-6">
            <Image
              src={getImageUrl(recipe.image_url)!}
              alt={recipe.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Title & Meta */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{recipe.name}</h1>
          <p className="text-muted-foreground text-lg mb-4">{recipe.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {parseCategory(recipe.category).map((cat) => (
              <Badge key={cat} className={getCategoryColor(cat)}>
                {cat}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>⏱️ Prep: {recipe.prep_time_minutes} min</span>
            <span>🔥 Cook: {recipe.cook_time_minutes} min</span>
            <span>📊 Total: {totalTime} min</span>
            <span>👥 Serves: {recipe.servings}</span>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Ingredients */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">🥕 Ingredients</h2>
          <ul className="space-y-2">
            {recipe.recipe_ingredients?.map((ing, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span>
                  <strong>{ing.quantity_num || ing.quantity} {ing.unit || ""}</strong> {ing.ingredients?.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Separator className="my-6" />

        {/* Instructions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">👨‍🍳 Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <p className="pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <Separator className="my-6" />

        {/* CTA */}
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="py-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Want to save this recipe?</h3>
            <p className="text-muted-foreground mb-4">
              Create a free account to save recipes, build your pantry, and get personalized meal plans.
            </p>
            <Link href="/login?tab=signup">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500">
                Sign Up Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
