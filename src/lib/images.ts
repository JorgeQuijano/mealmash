// Image URL helper for Supabase Storage
// This ensures we always have a valid image URL

const SUPABASE_URL = 'https://owmwdsypvvaxsckflbxx.supabase.co'
const STORAGE_BUCKET = 'recipe-images'

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  
  // If it's already a full URL, return as-is
  if (path.startsWith('http')) return path
  
  // Otherwise, construct the Supabase Storage URL
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`
}

export function getImageUrlFromFull(url: string | null | undefined): string | null {
  if (!url) return null
  
  // If already a full URL, return it
  if (url.startsWith('http')) return url
  
  // If it's a path, construct full URL
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${url}`
}
