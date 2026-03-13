import { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getImageUrl } from "@/lib/images"
import RecipeClientPage from './recipe-client-page'

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )
  
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
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )
  
  const slug = params.slug
  
  // Fetch recipe
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

  // Fetch favorite count from the view
  let favoriteCount = 0
  if (recipe) {
    const { data: countData } = await supabase
      .from('recipe_favorite_counts')
      .select('favorite_count')
      .eq('recipe_id', recipe.id)
      .single()
    
    favoriteCount = countData?.favorite_count || 0
  }

  // Check if current user has favorited this recipe
  const { data: { user } } = await supabase.auth.getUser()
  let isFavorited = false
  
  if (user && recipe) {
    const { data: existingFavorite } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('recipe_id', recipe.id)
      .single()
    
    isFavorited = !!existingFavorite
  }

  // Pass data to client component for rendering
  return <RecipeClientPage 
    recipe={recipe} 
    favoriteCount={favoriteCount}
    isFavorited={isFavorited}
    isLoggedIn={!!user}
  />
}
