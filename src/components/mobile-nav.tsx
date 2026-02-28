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
      const { dataUser: { user } } = await import("@/lib/supabase").then(m => m.supabase.auth.getUser())
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

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 safe-area-pb">
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
          
          {showMore && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border rounded-lg shadow-xl py-2 min-w-[160px]">
              <Link
                href="/settings"
                className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                onClick={() => setShowMore(false)}
              >
                ⚙️ Settings
              </Link>
              {profile?.is_admin && (
                <Link
                  href="/admin"
                  className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
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
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-muted transition-colors"
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
