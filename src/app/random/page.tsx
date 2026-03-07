"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase, getUser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import MobileNav from "@/components/mobile-nav"
import RecipeModal from "@/components/recipe-modal"
import { getWheelSpinLimit } from "@/lib/feature-gate"

type RecipeIngredient = {
  ingredient_id: string
  quantity: string
  quantity_num?: number
  unit?: string
  ingredients: {
    name: string
    category: string
  }
}

type Recipe = {
  id: string
  name: string
  description: string
  instructions: string[]
  category: string[]  // Now supports multiple categories
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  image_url: string
  recipe_ingredients?: RecipeIngredient[]
}

const categories = ["all", "breakfast", "lunch", "dinner", "snack", "dessert"]

// Card colors for visual variety
const cardColors = [
  "from-orange-500 to-amber-500",
  "from-green-500 to-emerald-500",
  "from-yellow-500 to-amber-400",
  "from-emerald-500 to-teal-500",
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-500",
]

export default function RandomPage() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [user, setUser] = useState<any>(null)
  const [pantryItems, setPantryItems] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showOnlyMatch, setShowOnlyMatch] = useState(false)
  
  // Card shuffle state
  const [shufflePhase, setShufflePhase] = useState<"idle" | "shuffling" | "revealing">("idle")
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [winnerIndex, setWinnerIndex] = useState(-1)

  useEffect(() => {
    loadRecipes()
  }, [selectedCategory, showOnlyMatch])

  useEffect(() => {
    loadUser()
  }, [])

  const [profile, setProfile] = useState<any>(null)
  const [todaySpins, setTodaySpins] = useState(0)

  async function loadUser() {
    const currentUser = await getUser()
    if (currentUser) {
      setUser(currentUser)
      // Get user profile for subscription tier
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()
      if (profileData) {
        setProfile(profileData)
      }
      const { data } = await supabase
        .from("pantry_items")
        .select("id, name, quantity, ingredient_id, user_id")
        .eq("user_id", currentUser.id)
      if (data) setPantryItems(data)
    }
  }

  async function loadRecipes() {
    setLoading(true)
    
    let query = supabase.from("recipes").select(`
      *,
      recipe_ingredients (
        ingredient_id,
        quantity,
        ingredients (name, category)
      )
    `)
    // Fetch all and filter in JS for array category support
    const { data, error } = await query
    
    if (data && data.length > 0) {
      let filtered = data
      
      // Filter by category if selected
      if (selectedCategory !== "all") {
        filtered = filtered.filter((r: Recipe) => 
          r.category && r.category.includes(selectedCategory)
        )
      }
      
      // Filter for 100% match if toggle is on and user has pantry items
      if (showOnlyMatch && pantryItems.length > 0) {
        const pantryIds = new Set(pantryItems.map(p => p.ingredient_id).filter(Boolean))
        filtered = data.filter(recipe => {
          const recipeIngIds = recipe.recipe_ingredients?.map((ri: RecipeIngredient) => ri.ingredient_id) || []
          // If recipe has no ingredients defined, include it
          if (recipeIngIds.length === 0) return true
          // Check if user has ALL ingredients
          return recipeIngIds.every((id: string) => pantryIds.has(id))
        })
      }
      
      setRecipes(filtered)
    }
    setLoading(false)
  }

  function shuffleCards() {
    if (isSpinning || recipes.length === 0) return

    // Check spin limit
    const tier = profile?.subscription_tier || 'free'
    const spinLimit = getWheelSpinLimit(tier)
    if (spinLimit !== -1 && todaySpins >= spinLimit) {
      alert(`Free plan limited to ${spinLimit} spins per day. Upgrade to Pro for unlimited spins!`)
      return
    }

    setTodaySpins(prev => prev + 1)
    setIsSpinning(true)
    setSelectedRecipe(null)
    setShufflePhase("shuffling")
    setWinnerIndex(-1)

    // Pick a random winner index
    const winIdx = Math.floor(Math.random() * recipes.length)
    setWinnerIndex(winIdx)
    const selected = recipes[winIdx]

    // Start cycling through cards - fast at first, then slow down
    setCurrentCardIndex(0)
    
    let speed = 80  // Starting speed (ms per card)
    let cardCounter = 0
    let maxCards = 15 + Math.floor(Math.random() * 10) // Show 15-25 cards total
    
    function cycleCard() {
      setCurrentCardIndex(prev => {
        const next = (prev + 1) % recipes.length
        cardCounter++
        
        // Check if we should slow down
        const remaining = maxCards - cardCounter
        
        if (remaining <= 0) {
          // Done! Reveal the winner
          setShufflePhase("revealing")
          setTimeout(() => {
            setSelectedRecipe(selected)
            setCurrentCardIndex(winIdx) // Ensure we show the winner
            setIsSpinning(false)
            setShufflePhase("idle")
          }, 600)
          return next
        }
        
        // Slow down exponentially as we approach the end
        if (remaining < 8) {
          speed = speed * 1.25 // Slow down gradually
        } else if (remaining < 4) {
          speed = speed * 1.5 // Last few cards slow down more
        }
        
        setTimeout(cycleCard, speed)
        return next
      })
    }
    
    // Start the cycling
    setTimeout(cycleCard, speed)
  }

  const getCategoryColor = (category: string | string[]) => {
    const cat = Array.isArray(category) ? category[0] : category
    const colors: Record<string, string> = {
      breakfast: "bg-yellow-100 text-yellow-800",
      lunch: "bg-green-100 text-green-800",
      dinner: "bg-orange-100 text-orange-800",
      snack: "bg-purple-100 text-purple-800",
      dessert: "bg-pink-100 text-pink-800"
    }
    return colors[cat] || "bg-gray-100 text-gray-800"
  }

  // Show inline loading spinner during filter changes
  const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl z-30">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
  )

  if (loading && recipes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Get current card being shown
  const currentCard = recipes[currentCardIndex]

  return (
    <div className="min-h-screen bg-background pb-safe">
      
      <MobileNav />

      <main className="container mx-auto px-4 py-3 md:py-8">
        {/* Hero Section - hidden on mobile */}
        <div className="text-center mb-4 hidden md:block">
          <h2 className="text-4xl font-bold mb-4">🎲 Can&apos;t Decide? Let Fate Choose!</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Shuffle the cards and let the universe pick your next meal. Adventure awaits!
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-4">
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>
          
          {/* Can Cook Now Filter - only show for logged in users with pantry items */}
          {user && pantryItems.length > 0 && (
            <div className="flex justify-center">
              <Button
                variant={showOnlyMatch ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyMatch(!showOnlyMatch)}
                className={showOnlyMatch ? "bg-green-600 hover:bg-green-700" : "border-green-500 text-green-600"}
              >
                ✅ Can Cook Now
              </Button>
            </div>
          )}
        </div>

        {/* No matches message */}
        {showOnlyMatch && recipes.length === 0 && !loading && (
          <div className="text-center mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800">
              😔 No recipes with all ingredients found. 
              <button 
                onClick={() => setShowOnlyMatch(false)}
                className="underline ml-1"
              >
                Show all recipes
              </button>
              {' '}or add more to your pantry!
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          {/* Card Cycling Section */}
          <div className="relative w-full max-w-sm flex flex-col items-center">
            
            {/* Card Display Area */}
            <div className="w-56 h-80 mb-6 relative flex items-center justify-center">
              {/* Background cards to show motion blur effect when spinning */}
              {shufflePhase === "shuffling" && (
                <>
                  <div className="absolute w-52 h-72 -translate-x-16 rotate-[-8deg] opacity-40">
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-gray-400 to-gray-600" />
                  </div>
                  <div className="absolute w-52 h-72 translate-x-16 rotate-[8deg] opacity-40">
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-gray-400 to-gray-600" />
                  </div>
                </>
              )}
              
              {/* Main Card */}
              {currentCard && (
                <div 
                  key={currentCard.id}
                  className={`w-52 h-72 rounded-2xl shadow-2xl bg-gradient-to-br ${cardColors[currentCardIndex % cardColors.length]} flex flex-col items-center justify-center p-5 text-white transition-all duration-300 ${shufflePhase === "revealing" ? 'scale-110 ring-4 ring-white ring-offset-4' : ''}`}
                >
                  {shufflePhase === "shuffling" ? (
                    // Show card backs during shuffle
                    <>
                      <div className="text-6xl mb-3">🎴</div>
                      <div className="text-2xl font-bold">???</div>
                    </>
                  ) : (
                    // Show actual card content
                    <>
                      <div className="text-5xl mb-3">🍽️</div>
                      <h3 className="text-xl font-bold text-center leading-tight">{currentCard.name}</h3>
                      <p className="text-xs text-white/80 text-center mt-2 line-clamp-2">{currentCard.description}</p>
                      <div className="mt-auto pt-3 flex gap-2">
                        <Badge className="bg-white/20 text-white text-xs">
                          {Array.isArray(currentCard.category) ? currentCard.category[0] : currentCard.category}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Loading overlay */}
              {loading && <LoadingSpinner />}
            </div>

            {/* Shuffle Button */}
            <Button
              onClick={shuffleCards}
              disabled={isSpinning || recipes.length === 0}
              className={`w-40 h-14 rounded-full text-lg font-bold shadow-2xl ${isSpinning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600`}
            >
              {isSpinning ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">🔄</span>
                  {shufflePhase === "revealing" ? "Revealing..." : "Shuffling..."}
                </span>
              ) : (
                <span>🎴 Shuffle!</span>
              )}
            </Button>
            
            {/* Recipe count */}
            <p className="text-sm text-muted-foreground mt-3">
              {recipes.length} recipes to choose from
            </p>
          </div>

          {/* Result Section */}
          <div className="w-full max-w-md">
            {selectedRecipe ? (
              <Card className="animate-slide-up shadow-xl border-2 border-primary/20">
                <CardHeader className="text-center pb-2">
                  <div className="text-6xl mb-4">✨ Your Choice! ✨</div>
                  <CardTitle className="text-2xl gradient-text">{selectedRecipe.name}</CardTitle>
                  <CardDescription>{selectedRecipe.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center gap-2 flex-wrap">
                    <Badge className={getCategoryColor(selectedRecipe.category)}>
                      {Array.isArray(selectedRecipe.category) ? selectedRecipe.category.join(', ') : selectedRecipe.category}
                    </Badge>
                    <Badge variant="outline">⏱️ {selectedRecipe.prep_time_minutes + selectedRecipe.cook_time_minutes} min</Badge>
                    <Badge variant="outline">👥 {selectedRecipe.servings} servings</Badge>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="font-semibold mb-2">🥕 Ingredients</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedRecipe.recipe_ingredients?.slice(0, 5).map((ing: any, i: number) => (
                        <li key={i}>• {ing.quantity_num || ing.quantity} {ing.unit} {ing.ingredients?.name}</li>
                      ))}
                      {selectedRecipe.recipe_ingredients && selectedRecipe.recipe_ingredients.length > 5 && (
                        <li className="text-primary">+ {selectedRecipe.recipe_ingredients.length - 5} more...</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500"
                      onClick={() => setShowModal(true)}
                    >
                      👨‍🍳 Start Cooking
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={shuffleCards}
                      disabled={isSpinning}
                    >
                      🎴 Shuffle Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-xl border-2 border-dashed border-muted">
                <CardContent className="py-12 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Discover?</h3>
                  <p className="text-muted-foreground mb-4">
                    Click shuffle and let your next meal be a surprise!
                  </p>
                  <Button 
                    onClick={shuffleCards}
                    disabled={isSpinning || recipes.length === 0}
                    className="bg-gradient-to-r from-orange-500 to-amber-500"
                  >
                    🎴 Shuffle Cards
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recipe Modal */}
        {showModal && selectedRecipe && (
          <RecipeModal
            recipe={selectedRecipe}
            user={user}
            pantryItems={pantryItems}
            onClose={() => setShowModal(false)}
          />
        )}
      </main>
    </div>
  )
}
