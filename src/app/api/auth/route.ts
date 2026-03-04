import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Rate limiter for auth endpoints (5 requests per 60 seconds)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  prefix: "ratelimit:auth:",
})

// Get client IP for rate limiting
function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  return forwarded?.split(",")[0]?.trim() || "unknown"
}

export async function POST(request: Request) {
  try {
    // Apply rate limiting for signin/signup actions
    const body = await request.json()
    const { action, email } = body

    if (action === "signin" || action === "signup") {
      // Use email as identifier for more targeted rate limiting
      const identifier = email || getClientIP(request)
      const { success } = await ratelimit.limit(identifier)

      if (!success) {
        return NextResponse.json(
          { error: "Too many attempts. Please try again in 60 seconds." },
          { status: 429 }
        )
      }
    }

    // Re-parse body after rate limit check
    const { action: authAction, email: authEmail, password, name } = body

    switch (authAction) {
      case "signin": {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password
        })
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        
        // Only return user - Supabase client manages tokens automatically
        return NextResponse.json({ user: data.user })
      }

      case "signup": {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: {
            data: {
              name
            }
          }
        })
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        
        // Only return user - Supabase client manages tokens automatically
        return NextResponse.json({ user: data.user })
      }

      case "signout": {
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        
        return NextResponse.json({ success: true })
      }

      case "getuser": {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        
        return NextResponse.json({ user })
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }
    
    return NextResponse.json({ 
      authenticated: !!user,
      user: user ? { id: user.id, email: user.email } : null 
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
}
