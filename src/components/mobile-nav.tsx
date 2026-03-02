"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { getUserProfile } from "@/lib/supabase"

const navItems = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/recipes", label: "Recipes", icon: "📖" },
  { href: "/pantry", label: "Pantry", icon: "🥕" },
  { href: "/random", label: "Random", icon: "🎲" },
]

export default function MobileNav() {
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [showMore, setShowMore] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await import("@/lib/supabase").then(m => m.supabase.auth.getUser())
      if (user) {
        const { data } = await getUserProfile(user.id)
        setProfile(data)
      }
    }
    loadProfile()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await import("@/lib/supabase").then(m => m.signOut())
    window.location.href = "/"
  }

  const isLoggedIn = !!profile

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50 safe-area-pb">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === "/dashboard" && pathname === "/") ||
            (item.href === "/recipes" && pathname.startsWith("/recipes"))
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs mt-0.5">{item.label}</span>
            </a>
          )
        })}
        
        <div className="flex flex-col items-center justify-center flex-1 h-full relative" ref={moreRef}>
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              showMore ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span className="text-lg">☰</span>
            <span className="text-xs mt-0.5">More</span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet Overlay */}
      {showMore && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMore(false)}
          />
          
          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl p-4 pb-8 shadow-xl z-50">
            {/* Drag handle */}
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
            
            <div className="space-y-2">
              {isLoggedIn ? (
                <>
                  <a
                    href="/settings"
                    className="flex items-center justify-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors"
                  >
                    ⚙️ Settings
                  </a>
                  <a
                    href="/shopping-list"
                    className="flex items-center justify-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors"
                  >
                    🛒 Shopping List
                  </a>
                  <a
                    href="/meal-plan"
                    className="flex items-center justify-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors"
                  >
                    📅 Meal Plan
                  </a>
                  {profile?.is_admin && (
                    <a
                      href="/admin"
                      className="flex items-center justify-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors"
                    >
                      🛠️ Admin
                    </a>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-muted rounded-lg transition-colors w-full"
                  >
                    🚪 Sign Out
                  </button>
                </>
              ) : (
                <a
                  href="/login"
                  className="flex items-center justify-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors"
                >
                  🔑 Login
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
