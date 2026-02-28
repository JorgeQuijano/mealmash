import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export { createClient }

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
export async function signUp(email: string, password: string) {
  return await supabase.auth.signUp({ email, password })
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
