import { MetadataRoute } from 'next'

// Use fetch directly to avoid Supabase client issues in serverless
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Fetch recipes directly via REST API
  const response = await fetch(
    `${supabaseUrl}/rest/v1/recipes?select=slug,updated_at&slug=not.is.null`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    }
  )

  const recipes = response.ok ? await response.json() : []

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
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Dynamic recipe pages
  const recipePages: MetadataRoute.Sitemap = (recipes || []).map((recipe: any) => ({
    url: `${baseUrl}/recipe/${recipe.slug}`,
    lastModified: recipe.updated_at ? new Date(recipe.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...recipePages]
}
