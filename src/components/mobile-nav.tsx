"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { getUserProfile } from "@/lib/supabase"

const navItems = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/recipes", label: "Recipes", icon: "📖" },
  { href: "/pantry", label: "Pantry", icon: "🥕" },
  { href: "/random", label: "Random", icon: "🎲" },
]

export default function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
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
    router.push("/")
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
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs mt-0.5">{item.label}</span>
            </Link>
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
        <div className="fixed inset-0 z-50" onClick={() => setShowMore(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Sheet - slides up from bottom */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl p-4 pb-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
            
            <div className="space-y-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setShowMore(false)}
                  >
                    ⚙️ Settings
                  </Link>
                  <Link
                    href="/shopping-list"
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setShowMore(false)}
                  >
                    🛒 Shopping List
                  </Link>
                  <Link
                    href="/meal-plan"
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setShowMore(false)}
                  >
                    📅 Meal Plan
                  </Link>
                  {profile?.is_admin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setShowMore(false)}
                    >
                      🛠️ Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setShowMore(false)
                      handleSignOut()
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-muted rounded-lg transition-colors w-full"
                  >
                    🚪 Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setShowMore(false)}
                >
                  🔑 Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
