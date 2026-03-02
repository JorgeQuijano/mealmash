"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase, getUser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import MobileNav from "@/components/mobile-nav"
import RecipeModal from "@/components/recipe-modal"

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
  category: string
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  image_url: string
  recipe_ingredients?: RecipeIngredient[]
}

// Wheel colors matching MealMash theme
const wheelColors = [
  "#f97316", // orange
  "#84cc16", // green
  "#fbbf24", // yellow
  "#22c55e", // emerald
  "#eab308", // amber
  "#f97316", // orange
  "#84cc16", // green
  "#fbbf24", // yellow
]

const categories = ["all", "breakfast", "lunch", "dinner", "snack", "dessert"]

export default function RandomPage() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [user, setUser] = useState<any>(null)
  const [pantryItems, setPantryItems] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showOnlyMatch, setShowOnlyMatch] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadRecipes()
  }, [selectedCategory, showOnlyMatch])

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    const currentUser = await getUser()
    if (currentUser) {
      setUser(currentUser)
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
    if (selectedCategory !== "all") {
      query = query.eq("category", selectedCategory)
    }
    
    const { data, error } = await query
    
    if (data && data.length > 0) {
      let filtered = data
      
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

  function spinWheel() {
    if (isSpinning || recipes.length === 0) return
    
    setIsSpinning(true)
    setSelectedRecipe(null)
    
    // Calculate random spin
    const spinCount = 5 + Math.floor(Math.random() * 3) // 5-7 full rotations
    const randomDegree = Math.floor(Math.random() * 360)
    const totalRotation = spinCount * 360 + randomDegree
    
    setRotation(prev => prev + totalRotation)
    
    // Calculate which segment is selected
    setTimeout(() => {
      // Normalize rotation to 0-360
      const normalizedRotation = (rotation + totalRotation) % 360
      // Each segment is 360 / number of recipes degrees
      const segmentSize = 360 / recipes.length
      // The pointer is at the top (0 degrees), so we need to calculate which segment it points to
      const selectedIndex = Math.floor((360 - normalizedRotation + segmentSize / 2) % 360 / segmentSize)
      
      setSelectedRecipe(recipes[selectedIndex])
      setIsSpinning(false)
    }, 4000) // Match with CSS animation duration
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      breakfast: "bg-yellow-100 text-yellow-800",
      lunch: "bg-green-100 text-green-800",
      dinner: "bg-orange-100 text-orange-800",
      snack: "bg-purple-100 text-purple-800",
      dessert: "bg-pink-100 text-pink-800"
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dots">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-safe">
      
      <MobileNav />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
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

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          {/* Wheel Section */}
          <div className="relative">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-primary drop-shadow-lg"></div>
            </div>
            
            {/* Wheel */}
            <div 
              ref={wheelRef}
              className="relative w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-full shadow-2xl"
              style={{
                background: `conic-gradient(${recipes.map((_, i) => 
                  `${wheelColors[i % wheelColors.length]} ${(i * 360 / recipes.length)}deg ${((i + 1) * 360 / recipes.length)}deg`
                ).join(', ')})`,
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              }}
            >
              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 bg-white rounded-full shadow-inner flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl md:text-4xl">🍽️</span>
                </div>
              </div>
              
              {/* Recipe labels around the wheel */}
              {recipes.map((recipe, i) => {
                const angle = (i * 360 / recipes.length) + (180 / recipes.length)
                const radians = (angle * Math.PI) / 180
                const radius = 150 // Adjust for label distance from center
                const x = 180 + radius * Math.sin(radians) // Center of wheel + offset
                const y = 180 - radius * Math.cos(radians)
                
                return (
                  <div
                    key={recipe.id}
                    className="absolute text-xs font-medium text-white text-center px-1 leading-tight drop-shadow-md"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-140px) rotate(-${angle}deg)`,
                      maxWidth: '80px',
                    }}
                  >
                    {recipe.name.length > 15 ? recipe.name.substring(0, 15) + '...' : recipe.name}
                  </div>
                )
              })}
            </div>

            {/* Spin Button */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 mt-32">
              <Button
                onClick={spinWheel}
                disabled={isSpinning}
                className={`w-32 h-32 rounded-full text-xl font-bold shadow-2xl ${isSpinning ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-glow hover:scale-110'} bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600`}
              >
                {isSpinning ? (
                  <span className="flex flex-col items-center">
                    <span className="animate-spin text-2xl mb-1">⚙️</span>
                    <span>Spinning...</span>
                  </span>
                ) : (
                  <span>SPIN!</span>
                )}
              </Button>
            </div>
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
                      {selectedRecipe.category}
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
                      onClick={spinWheel}
                      disabled={isSpinning}
                    >
                      🎲 Spin Again
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
                    Click the spin button and let your next meal be a surprise!
                  </p>
                  <Button 
                    onClick={spinWheel}
                    disabled={isSpinning}
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
