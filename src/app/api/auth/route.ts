import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, email, password, name } = body

    switch (action) {
      case "signin": {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        
        return NextResponse.json({ user: data.user, session: data.session })
      }

      case "signup": {
        const { data, error } = await supabase.auth.signUp({
          email,
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
        
        return NextResponse.json({ user: data.user, session: data.session })
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
