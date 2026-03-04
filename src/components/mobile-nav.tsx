"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { getUserProfile } from "@/lib/supabase"

const navItems = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/recipes", label: "Recipes", icon: "📖" },
  { href: "/recipes/favorites", label: "Favorites", icon: "❤️" },
  { href: "/pantry", label: "Pantry", icon: "🥕" },
  { href: "/random", label: "Random", icon: "🎲" },
]

export default function MobileNav() {
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [showMore, setShowMore] = useState(false)

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

  const isLoggedIn = !!profile

  return (
    <>
      {/* Main Nav */}
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
          
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              showMore ? "text-primary" : "text-black"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span className="text-xs mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet - Only shows when showMore is true */}
      {showMore && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMore(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl p-4 pb-8 shadow-xl z-50">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
            <div className="space-y-2">
              {isLoggedIn ? (
                <>
                  <a href="/settings" className="flex items-center justify-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors">
                    ⚙️ Settings
                  </a>
                  <a href="/shopping-list" className="flex items-center justify-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors">
                    🛒 Shopping List
                  </a>
                  <a href="/meal-plan" className="flex items-center justify-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors">
                    📅 Meal Plan
                  </a>
                  {profile?.is_admin && (
                    <a href="/admin" className="flex items-center justify-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors">
                      🛠️ Admin
                    </a>
                  )}
                  <button onClick={async () => { await import("@/lib/supabase").then(m => m.signOut()); window.location.href = "/"}} className="flex items-center justify-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-muted rounded-lg transition-colors w-full">
                    🚪 Sign Out
                  </button>
                </>
              ) : (
                <a href="/login" className="flex items-center justify-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors">
                  🔑 Login
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
