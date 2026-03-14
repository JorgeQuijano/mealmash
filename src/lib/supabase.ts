import { createBrowserClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { PostgrestResponse } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Generic function to create a properly typed stub response
function createStubResponse<T>(data: T[] | null): PostgrestResponse<T> {
  return { data, error: null } as PostgrestResponse<T>
}

// Stub client for when Supabase isn't configured - preserves type inference
const stubFilterBuilder = <T>() => ({
  eq: () => ({ single: async () => ({ data: null as T, error: null }) }),
  order: () => createStubResponse<T[]>([]),
  in: () => createStubResponse<T[]>([]),
  limit: () => createStubResponse<T[]>([]),
  gte: () => stubFilterBuilder<T>(),
  lte: () => stubFilterBuilder<T>(),
})

const stubQueryBuilder = {
  select: () => stubFilterBuilder(),
  insert: () => ({ select: () => stubFilterBuilder() }),
  update: () => stubFilterBuilder(),
  delete: () => stubFilterBuilder(),
}

const stubAuth = {
  getUser: async () => ({ data: { user: null }, error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  signInWithPassword: async () => ({ data: { user: null }, error: null }),
  signUp: async () => ({ data: { user: null }, error: null }),
  signOut: async () => ({}),
}

// Stub client for type preservation
const stubClient = {
  auth: stubAuth,
  from: () => stubQueryBuilder,
}

// Browser client with proper cookie handling for middleware compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = isSupabaseConfigured
  ? createBrowserClient(
      supabaseUrl!,
      supabaseAnonKey!,
      {
        cookies: {
          getAll() {
            if (typeof document === 'undefined') return []
            return document.cookie.split(';').map(c => {
              const [key, ...v] = c.trim().split('=')
              return { name: key, value: v.join('=') }
            })
          },
          setAll(cookiesToSet) {
            if (typeof document === 'undefined') return
            cookiesToSet.forEach(({ name, value, options }) => {
              document.cookie = `${name}=${value}; path=${options?.path || '/'}; max-age=${options?.maxAge || 31536000}; SameSite=${options?.sameSite || 'Lax'}${options?.secure ? '; secure' : ''}`
            })
          },
        },
      }
    )
  : stubClient

// Admin client for server-side operations (uses service role key for elevated permissions)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin: any = isSupabaseConfigured && supabaseServiceKey
  ? createAdminClient(supabaseUrl!, supabaseServiceKey)
  : isSupabaseConfigured 
    ? createAdminClient(supabaseUrl!, supabaseAnonKey!)
    : stubClient // Fallback to stub when not configured

// Helper to check if user is authenticated
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper to sign in with email/password
export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password })
}

// Helper to sign up
export async function signUp(email: string, password: string, name?: string) {
  return await supabase.auth.signUp({ 
    email, 
    password,
    options: { data: { name } }
  })
}

// Helper to sign out
export async function signOut() {
  return await supabase.auth.signOut()
}

// Get user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()
  
  return data?.is_admin ?? false
}
