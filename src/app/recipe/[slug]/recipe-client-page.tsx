"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  slug?: string
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

// Convert minutes to ISO 8601 duration format
function toISODuration(minutes: number): string {
  return `PT${minutes}M`
}

interface RecipeClientPageProps {
  recipe: Recipe | null
  favoriteCount?: number
  isFavorited?: boolean
  isLoggedIn?: boolean
}

export default function RecipeClientPage({ 
  recipe, 
  favoriteCount = 0, 
  isFavorited = false,
  isLoggedIn = false 
}: RecipeClientPageProps) {
  const [jsonLd, setJsonLd] = useState<any>(null)
  const [favCount, setFavCount] = useState(favoriteCount)
  const [favorited, setFavorited] = useState(isFavorited)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Generate JSON-LD structured data
  useEffect(() => {
    if (!recipe) return

    const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes
    const ingredients = recipe.recipe_ingredients?.map(ing => 
      `${ing.quantity_num || ing.quantity} ${ing.unit || ''} ${ing.ingredients?.name}`.trim()
    ) || []

    const structuredData = {
      "@context": "https://schema.org/",
      "@type": "Recipe",
      "name": recipe.name,
      "description": recipe.description,
      "image": recipe.image_url ? [getImageUrl(recipe.image_url)] : [],
      "author": {
        "@type": "Organization",
        "name": "MealClaw"
      },
      "datePublished": new Date().toISOString().split('T')[0],
      "prepTime": toISODuration(recipe.prep_time_minutes),
      "cookTime": toISODuration(recipe.cook_time_minutes),
      "totalTime": toISODuration(totalTime),
      "recipeYield": recipe.servings,
      "recipeCategory": parseCategory(recipe.category)[0],
      "recipeIngredient": ingredients,
      "recipeInstructions": recipe.instructions.map((step, index) => ({
        "@type": "HowToStep",
        "position": index + 1,
        "text": step
      })),
      "keywords": parseCategory(recipe.category).join(', '),
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "ratingCount": "10"
      }
    }

    setJsonLd(structuredData)
  }, [recipe])

  // Handle favorite toggle
  const handleFavorite = async () => {
    if (!isLoggedIn) {
      router.push('/login?tab=signup&redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    setLoading(true)
    
    if (favorited) {
      // Remove from favorites
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('recipe_id', recipe!.id)
      
      if (!error) {
        setFavorited(false)
        setFavCount(prev => Math.max(0, prev - 1))
      }
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('user_favorites')
        .insert({ recipe_id: recipe!.id })
      
      if (!error) {
        setFavorited(true)
        setFavCount(prev => prev + 1)
      }
    }
    
    setLoading(false)
  }

  if (!recipe) {
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
      {/* JSON-LD Structured Data for SEO */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

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

        {/* Favorite Button */}
        <div className="mb-6">
          DEBUG: favCount={favCount}, favorited={favorited ? 'yes' : 'no'}
          <Button
            variant={favorited ? "default" : "outline"}
            size="lg"
            onClick={handleFavorite}
            disabled={loading}
            className={favorited ? "bg-red-500 hover:bg-red-600" : ""}
          >
            <span className="mr-2">{favorited ? "❤️" : "🤍"}</span>
            {favCount > 0 ? `${favCount} saved` : "Save Recipe"}
          </Button>
          
          {favCount > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {favCount} {favCount === 1 ? "person has" : "people have"} saved this recipe
            </p>
          )}
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
