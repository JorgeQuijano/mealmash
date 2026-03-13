import { Metadata } from 'next'
import { supabase } from "@/lib/supabase"
import { getImageUrl } from "@/lib/images"
import RecipeClientPage from './recipe-client-page'

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug
  
  const { data: recipe } = await supabase
    .from("recipes")
    .select("name, description, image_url, prep_time_minutes, cook_time_minutes, servings")
    .eq("slug", slug)
    .single()

  if (!recipe) {
    return {
      title: 'Recipe Not Found | MealClaw',
    }
  }

  const imageUrl = recipe.image_url ? getImageUrl(recipe.image_url) : null
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes

  return {
    title: `${recipe.name} | MealClaw`,
    description: recipe.description || `Learn how to make ${recipe.name}. A delicious recipe ready in ${totalTime} minutes.`,
    openGraph: {
      title: recipe.name,
      description: recipe.description || `Learn how to make ${recipe.name}. Ready in ${totalTime} minutes.`,
      type: 'article',
      url: `https://mealclaw.com/recipe/${slug}`,
      siteName: 'MealClaw',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: recipe.name,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.name,
      description: recipe.description || `Learn how to make ${recipe.name}. Ready in ${totalTime} minutes.`,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `https://mealclaw.com/recipe/${slug}`,
    },
  }
}

// Server component that fetches data and passes to client component
export default async function PublicRecipePage({ params }: { params: { slug: string } }) {
  const slug = params.slug
  
  const { data: recipe } = await supabase
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

  // Pass data to client component for rendering
  return <RecipeClientPage recipe={recipe} />
}
