"use client"

import Link from "next/link"
import { ChefHat } from "lucide-react"

export default function BlogHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-400 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">MealClaw</span>
          </Link>
          <Link
            href="/"
            className="text-stone-600 dark:text-stone-300 hover:text-orange-600 font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </nav>
      </div>
    </header>
  )
}
