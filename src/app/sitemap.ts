import { MetadataRoute } from 'next'
import { createServerClient } from '@supabase/ssr'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {},
    }
  )

  // Fetch all recipes with slugs (using anon key - recipes should be public readable)
  const { data: recipes } = await supabase
    .from('recipes')
    .select('slug, updated_at')
    .not('slug', 'is', null)

  // Base URL
  const baseUrl = 'https://mealclaw.com'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Dynamic recipe pages
  const recipePages: MetadataRoute.Sitemap = (recipes || []).map((recipe) => ({
    url: `${baseUrl}/recipe/${recipe.slug}`,
    lastModified: recipe.updated_at ? new Date(recipe.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...recipePages]
}
