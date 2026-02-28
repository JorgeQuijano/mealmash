"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getUserProfile } from "@/lib/supabase"

interface DesktopNavProps {
  currentPath?: string
}

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/suggestions", label: "🍳 What Can I Make?" },
  { href: "/recipes", label: "Recipes" },
  { href: "/pantry", label: "Pantry" },
  { href: "/shopping-list", label: "Shopping List" },
  { href: "/meal-plan", label: "📅 Meal Plan" },
  { href: "/settings", label: "⚙️ Settings" },
]

export default function DesktopNav({ currentPath = "" }: DesktopNavProps) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await import("@/lib/supabase").then(m => m.supabase.auth.getUser())
      setUser(user)
      if (user) {
        const { data } = await getUserProfile(user.id)
        setProfile(data)
      }
    }
    loadUser()
  }, [])

  const handleSignOut = async () => {
    await import("@/lib/supabase").then(m => m.signOut())
    window.location.href = "/"
  }

  return (
    <header className="hidden lg:flex border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between w-full">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-xl font-bold gradient-text">
            MealMash
          </Link>
          <nav className="flex items-center gap-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors hover:text-primary ${
                  currentPath === item.href
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {profile?.is_admin && (
              <Link
                href="/admin"
                className={`text-sm transition-colors hover:text-primary ${
                  currentPath === "/admin"
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}
