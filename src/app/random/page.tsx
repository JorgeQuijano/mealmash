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

// Card shuffle colors
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
  const [visibleCards, setVisibleCards] = useState<Recipe[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

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

    // Pick a random recipe from the filtered list
    const randomIndex = Math.floor(Math.random() * recipes.length)
    const selected = recipes[randomIndex]
    
    // Get 5-7 cards for the shuffle (or fewer if not enough recipes)
    const numVisibleCards = Math.min(7, recipes.length)
    let shuffleCards: Recipe[] = []
    
    // Create an array of indices and shuffle them
    const indices = Array.from({ length: recipes.length }, (_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    // Take the first N indices for visible cards
    const visibleIndices = indices.slice(0, numVisibleCards)
    shuffleCards = visibleIndices.map(i => recipes[i])
    
    // Make sure our selected recipe is in the visible cards
    if (!shuffleCards.find(r => r.id === selected.id)) {
      shuffleCards[Math.floor(Math.random() * shuffleCards.length)] = selected
    }
    
    setVisibleCards(shuffleCards)
    setSelectedIndex(shuffleCards.findIndex(r => r.id === selected.id))

    // Shuffle animation - cards swap positions multiple times
    let shuffleCount = 0
    const shuffleInterval = setInterval(() => {
      setVisibleCards((prev: Recipe[]) => {
        if (prev.length <= 1) return prev
        const shuffled: Recipe[] = [...prev]
        // Swap 2 random cards
        const i1 = Math.floor(Math.random() * shuffled.length)
        let i2 = Math.floor(Math.random() * shuffled.length)
        while (i2 === i1 && shuffled.length > 1) {
          i2 = Math.floor(Math.random() * shuffled.length)
        }
        const temp = shuffled[i1]
        shuffled[i1] = shuffled[i2]
        shuffled[i2] = temp
        return shuffled
      })
      shuffleCount++
      if (shuffleCount >= 15) {
        clearInterval(shuffleInterval)
        // Reveal phase
        setShufflePhase("revealing")
        setTimeout(() => {
          setSelectedRecipe(selected)
          setIsSpinning(false)
          setShufflePhase("idle")
        }, 800)
      }
    }, 150)
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
          {/* Card Shuffle Section */}
          <div className="relative w-full max-w-md h-[320px] flex items-center justify-center">
            {/* Card Stack */}
            <div className="relative w-48 h-64">
              {visibleCards.length > 0 ? (
                visibleCards.map((recipe, index) => {
                  // Calculate card position - fan out effect
                  const totalCards = visibleCards.length
                  const centerIndex = (totalCards - 1) / 2
                  const offset = (index - centerIndex) * 30
                  const isSelected = index === selectedIndex && shufflePhase === "revealing"
                  
                  // During shuffle, randomize positions slightly
                  let translateX = offset
                  let translateY = 0
                  let rotate = offset * 0.5
                  let scale = 1
                  let zIndex = totalCards - Math.abs(index - centerIndex)
                  
                  if (shufflePhase === "shuffling") {
                    // Add some chaos during shuffle
                    translateX = offset + (Math.random() - 0.5) * 20
                    translateY = (Math.random() - 0.5) * 10
                    rotate = offset * 0.5 + (Math.random() - 0.5) * 10
                    zIndex = Math.random() * 100
                  }
                  
                  if (isSelected) {
                    scale = 1.1
                    zIndex = 100
                    translateY = -20
                  }
                  
                  return (
                    <div
                      key={`${recipe.id}-${index}`}
                      className="absolute w-48 h-64 transition-all duration-300"
                      style={{
                        transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                        zIndex,
                      }}
                    >
                      <div className={`w-full h-full rounded-xl shadow-2xl bg-gradient-to-br ${cardColors[index % cardColors.length]} flex flex-col items-center justify-center p-4 text-white ${isSelected ? 'ring-4 ring-white ring-offset-4' : ''}`}>
                        {isSelected ? (
                          <>
                            <div className="text-4xl mb-2">✨</div>
                            <h3 className="text-lg font-bold text-center">{recipe.name}</h3>
                            <p className="text-xs text-white/80 text-center mt-1 line-clamp-2">{recipe.description}</p>
                          </>
                        ) : (
                          <>
                            <div className="text-5xl mb-3">🍽️</div>
                            <div className="text-3xl font-bold">?</div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                // Empty state - show placeholder card
                <div className="w-48 h-64 rounded-xl shadow-2xl bg-gradient-to-br from-gray-400 to-gray-600 flex flex-col items-center justify-center p-4 text-white">
                  <div className="text-5xl mb-3">🎴</div>
                  <div className="text-xl font-bold">Ready to Shuffle</div>
                </div>
              )}
              
              {/* Loading overlay */}
              {loading && <LoadingSpinner />}
            </div>

            {/* Shuffle Button */}
            <Button
              onClick={shuffleCards}
              disabled={isSpinning || recipes.length === 0}
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-14 rounded-full text-lg font-bold shadow-2xl ${isSpinning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600`}
            >
              {isSpinning ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">🔄</span>
                  Shuffling...
                </span>
              ) : (
                <span>🎴 Shuffle!</span>
              )}
            </Button>
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
