"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Recipe = {
  id: string
  name: string
  description: string
  ingredients: any
  instructions: string[]
  category: string
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  image_url: string
}

// Sample recipes for when database is empty
const sampleRecipes: Recipe[] = [
  { id: "1", name: "Classic Spaghetti Carbonara", description: "Creamy Italian pasta with crispy pancetta", ingredients: ["spaghetti", "eggs", "pancetta", "parmesan", "black pepper"], instructions: ["Cook pasta", "Fry pancetta", "Mix eggs and cheese", "Combine all"], category: "dinner", prep_time_minutes: 10, cook_time_minutes: 20, servings: 4, image_url: "" },
  { id: "2", name: "Grilled Chicken Salad", description: "Fresh and healthy salad with grilled chicken", ingredients: ["chicken breast", "lettuce", "tomatoes", "cucumber", "olive oil"], instructions: ["Grill chicken", "Chop vegetables", "Mix dressing", "Combine"], category: "lunch", prep_time_minutes: 15, cook_time_minutes: 15, servings: 2, image_url: "" },
  { id: "3", name: "Fluffy Pancakes", description: "Light and fluffy breakfast pancakes", ingredients: ["flour", "eggs", "milk", "butter", "maple syrup"], instructions: ["Mix dry ingredients", "Add wet ingredients", "Cook on griddle", "Serve with syrup"], category: "breakfast", prep_time_minutes: 10, cook_time_minutes: 15, servings: 4, image_url: "" },
  { id: "4", name: "Beef Tacos", description: "Seasoned beef tacos with fresh toppings", ingredients: ["ground beef", "taco shells", "lettuce", "tomatoes", "cheese", "sour cream"], instructions: ["Cook beef with spices", "Warm taco shells", "Assemble tacos", "Add toppings"], category: "dinner", prep_time_minutes: 10, cook_time_minutes: 15, servings: 4, image_url: "" },
  { id: "5", name: "Vegetable Stir Fry", description: "Quick and healthy vegetable stir fry", ingredients: ["broccoli", "bell peppers", "carrots", "soy sauce", "garlic", "ginger"], instructions: ["Chop vegetables", "Heat wok", "Stir fry vegetables", "Add sauce"], category: "dinner", prep_time_minutes: 15, cook_time_minutes: 10, servings: 3, image_url: "" },
  { id: "6", name: "Chocolate Chip Cookies", description: "Classic homemade chocolate chip cookies", ingredients: ["flour", "butter", "sugar", "eggs", "chocolate chips"], instructions: ["Cream butter and sugar", "Mix in eggs", "Add flour and chips", "Bake"], category: "dessert", prep_time_minutes: 15, cook_time_minutes: 12, servings: 24, image_url: "" },
  { id: "7", name: "Caesar Salad", description: "Classic Caesar salad with homemade dressing", ingredients: ["romaine lettuce", "parmesan", "croutons", "caesar dressing", "lemon"], instructions: ["Chop lettuce", "Make dressing", "Toss everything", "Top with parmesan"], category: "lunch", prep_time_minutes: 10, cook_time_minutes: 0, servings: 2, image_url: "" },
  { id: "8", name: "Mushroom Risotto", description: "Creamy Italian risotto with mushrooms", ingredients: ["arborio rice", "mushrooms", "onion", "white wine", "parmesan", "butter"], instructions: ["Sauté mushrooms", "Cook onion", "Add rice and wine", "Slowly add broth"], category: "dinner", prep_time_minutes: 10, cook_time_minutes: 30, servings: 4, image_url: "" },
]

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

export default function RandomPage() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadRecipes()
  }, [])

  async function loadRecipes() {
    setLoading(true)
    
    const { data, error } = await supabase.from("recipes").select("*")
    
    if (data && data.length > 0) {
      setRecipes(data)
    } else {
      // Use sample recipes if database is empty
      setRecipes(sampleRecipes)
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold gradient-text">MealMash</h1>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="text-sm hover:text-primary transition-colors">Dashboard</a>
            <a href="/recipes" className="text-sm hover:text-primary transition-colors">Recipes</a>
            <a href="/pantry" className="text-sm hover:text-primary transition-colors">Pantry</a>
            <a href="/shopping-list" className="text-sm hover:text-primary transition-colors">Shopping List</a>
            <a href="/admin" className="text-sm hover:text-primary transition-colors">Admin</a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">🎲 Can&apos;t Decide? Let Fate Choose!</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Spin the wheel and let the universe pick your next meal. Adventure awaits!
          </p>
        </div>

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
                      {Array.isArray(selectedRecipe.ingredients) 
                        ? selectedRecipe.ingredients.slice(0, 5).map((ing: any, i: number) => (
                            <li key={i}>• {typeof ing === 'string' ? ing : `${ing.amount} ${ing.item}`}</li>
                          ))
                        : <li>{selectedRecipe.ingredients}</li>
                      }
                      {Array.isArray(selectedRecipe.ingredients) && selectedRecipe.ingredients.length > 5 && (
                        <li className="text-primary">+ {selectedRecipe.ingredients.length - 5} more...</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500"
                      onClick={() => router.push(`/recipes?id=${selectedRecipe.id}`)}
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
      </main>
    </div>
  )
}
