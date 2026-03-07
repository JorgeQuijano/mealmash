"use client"

import { useEffect, useState } from "react"
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

// Helper to parse category from any format to string array
function parseCategory(cat: any): string[] {
  if (Array.isArray(cat)) return cat
  if (typeof cat === 'string') {
    try {
      const parsed = JSON.parse(cat)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return [cat]
    }
  }
  return [String(cat)]
}

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
  
  // Cycling text state
  const [cycleIndex, setCycleIndex] = useState(0)
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

  function spin() {
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

    // Pick a random winner
    const winIdx = Math.floor(Math.random() * recipes.length)
    setWinnerIndex(winIdx)
    const selected = recipes[winIdx]

    // Start cycling through names - fast at first, then slow down
    let speed = 60  // Starting speed (ms per name)
    let cardCounter = 0
    let maxCards = 20 + Math.floor(Math.random() * 15) // Show 20-35 names total
    
    function cycleName() {
      setCycleIndex(prev => {
        const next = (prev + 1) % recipes.length
        cardCounter++
        
        const remaining = maxCards - cardCounter
        
        if (remaining <= 0) {
          // Done! Show the winner
          setTimeout(() => {
            setSelectedRecipe(selected)
            setCycleIndex(winIdx)
            setIsSpinning(false)
          }, 400)
          return next
        }
        
        // Slow down exponentially as we approach the end
        if (remaining < 10) {
          speed = speed * 1.3
        } else if (remaining < 5) {
          speed = speed * 1.5
        }
        
        setTimeout(cycleName, speed)
        return next
      })
    }
    
    setTimeout(cycleName, speed)
  }

  const getCategoryColor = (category: any) => {
    const cats = parseCategory(category)
    const cat = cats[0]
    const colors: Record<string, string> = {
      breakfast: "bg-yellow-100 text-yellow-800",
      lunch: "bg-green-100 text-green-800",
      dinner: "bg-orange-100 text-orange-800",
      snack: "bg-purple-100 text-purple-800",
      dessert: "bg-pink-100 text-pink-800"
    }
    return colors[cat] || "bg-gray-100 text-gray-800"
  }

  if (loading && recipes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const currentRecipe = recipes[cycleIndex]

  return (
    <div className="min-h-screen bg-background pb-safe">
      
      <MobileNav />

      <main className="container mx-auto px-4 py-3 md:py-8">
        {/* Hero Section - hidden on mobile */}
        <div className="text-center mb-4 hidden md:block">
          <h2 className="text-4xl font-bold mb-4">🎲 Can&apos;t Decide? Let Fate Choose!</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Spin the wheel and let the universe pick your next meal. Adventure awaits!
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

        <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
          {/* Cycling Text Display */}
          <div className="w-full max-w-sm flex flex-col items-center">
            
            {/* Display Box - Compact */}
            <div className="w-full mb-4">
              {/* Emoji - Smaller */}
              <div className="text-center mb-2">
                <div className={`text-5xl transition-all duration-200 ${isSpinning ? 'animate-bounce' : ''}`}>
                  {isSpinning ? '🎲' : selectedRecipe ? '✨' : '🎯'}
                </div>
              </div>
              
              {/* Cycling Name Display - More compact */}
              <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-xl p-4 shadow-lg">
                <div className="text-center">
                  <p className="text-white/60 text-xs mb-1 uppercase tracking-wider font-medium">
                    {isSpinning ? 'Picking...' : selectedRecipe ? 'Your Choice!' : 'Ready?'}
                  </p>
                  <h3 className={`text-2xl md:text-3xl font-bold text-white transition-all duration-300 ${isSpinning ? 'blur-sm' : ''}`}>
                    {currentRecipe?.name || '???'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Spin Button - Smaller */}
            <Button
              onClick={spin}
              disabled={isSpinning || recipes.length === 0}
              className={`w-36 h-12 rounded-full text-lg font-bold shadow-lg ${isSpinning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600`}
            >
              {isSpinning ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⚙️</span>
                  Picking...
                </span>
              ) : (
                <span>🎲 SPIN!</span>
              )}
            </Button>
            
            {/* Recipe count - Smaller text */}
            <p className="text-xs text-muted-foreground mt-2">
              {recipes.length} recipes
            </p>
          </div>

          {/* Result Section - More compact */}
          <div className="w-full max-w-md">
            {selectedRecipe ? (
              <Card className="animate-slide-up shadow-lg border-2 border-primary/20">
                <CardHeader className="text-center pb-2">
                  <div className="text-4xl mb-2">✨ Your Choice! ✨</div>
                  <CardTitle className="text-xl gradient-text">{selectedRecipe.name}</CardTitle>
                  <CardDescription className="text-sm">{selectedRecipe.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-center gap-1 flex-wrap">
                    <Badge className={getCategoryColor(selectedRecipe.category)}>
                      {parseCategory(selectedRecipe.category).join(', ')}
                    </Badge>
                    <Badge variant="outline" className="text-xs">⏱️ {selectedRecipe.prep_time_minutes + selectedRecipe.cook_time_minutes}m</Badge>
                    <Badge variant="outline" className="text-xs">👥 {selectedRecipe.servings}</Badge>
                  </div>

                  <div className="bg-muted rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-1">🥕 Ingredients</h4>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {selectedRecipe.recipe_ingredients?.slice(0, 5).map((ing: any, i: number) => (
                        <li key={i}>• {ing.quantity_num || ing.quantity} {ing.unit} {ing.ingredients?.name}</li>
                      ))}
                      {selectedRecipe.recipe_ingredients && selectedRecipe.recipe_ingredients.length > 5 && (
                        <li className="text-primary text-xs">+ {selectedRecipe.recipe_ingredients.length - 5} more...</li>
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
                      onClick={spin}
                      disabled={isSpinning}
                    >
                      🎲 Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg border-2 border-dashed border-muted">
                <CardContent className="py-8 text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <h3 className="text-lg font-semibold mb-1">Ready to Discover?</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Click spin and let your next meal be a surprise!
                  </p>
                  <Button 
                    onClick={spin}
                    disabled={isSpinning || recipes.length === 0}
                    className="bg-gradient-to-r from-orange-500 to-amber-500"
                  >
                    🎲 Spin the Wheel
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
