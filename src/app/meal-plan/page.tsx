"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Recipe {
  id: string
  name: string
  category: string
}

interface MealPlan {
  id: string
  recipe_id: string
  planned_date: string
  meal_type: string
  recipe?: Recipe
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const
const MEAL_ICONS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍿'
}

function getWeekDates(date: Date): Date[] {
  const week: Date[] = []
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Monday start
  
  const monday = new Date(date)
  monday.setDate(diff)
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    week.push(d)
  }
  return week
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function MealPlanPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    return getWeekDates(today)[0]
  })
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [selectedSlot, setSelectedSlot] = useState<{date: string, mealType: string} | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const weekDates = getWeekDates(currentWeekStart)
  const today = formatDate(new Date())

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getUser()
      
      if (!currentUser) {
        router.push("/login")
        return
      }
      
      setUser(currentUser)
      
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()
      
      setProfile(profileData)
      await loadRecipes()
      await loadMealPlans()
      setLoading(false)
    }
    
    loadUser()
  }, [router])

  async function loadRecipes() {
    const { data } = await supabase
      .from('recipes')
      .select('id, name, category')
      .order('name')
    
    if (data) setRecipes(data)
  }

  async function loadMealPlans() {
    const startDate = formatDate(weekDates[0])
    const endDate = formatDate(weekDates[6])
    
    const { data } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user?.id)
      .gte('planned_date', startDate)
      .lte('planned_date', endDate)
    
    if (data) {
      // Fetch recipe details for each meal plan
      const recipeIds = [...new Set(data.map(mp => mp.recipe_id))]
      const { data: recipeData } = await supabase
        .from('recipes')
        .select('id, name, category')
        .in('id', recipeIds)
      
      const recipeMap = new Map(recipeData?.map(r => [r.id, r]) || [])
      
      const mealPlansWithRecipes = data.map(mp => ({
        ...mp,
        recipe: recipeMap.get(mp.recipe_id)
      }))
      
      setMealPlans(mealPlansWithRecipes)
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadMealPlans()
    }
  }, [currentWeekStart, user])

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart)
    prev.setDate(prev.getDate() - 7)
    setCurrentWeekStart(prev)
  }

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart)
    next.setDate(next.getDate() + 7)
    setCurrentWeekStart(next)
  }

  const handleGoToToday = () => {
    setCurrentWeekStart(getWeekDates(new Date())[0])
  }

  const handleSlotClick = (date: string, mealType: string) => {
    const existingMeal = mealPlans.find(
      mp => mp.planned_date === date && mp.meal_type === mealType
    )
    
    if (existingMeal) {
      // Remove meal
      removeMealPlan(existingMeal.id)
    } else {
      // Open modal to add
      setSelectedSlot({ date, mealType })
      setIsModalOpen(true)
    }
  }

  async function addMealPlan(recipeId: string) {
    if (!selectedSlot || !user) return
    
    const { error } = await supabase
      .from('meal_plans')
      .insert({
        user_id: user.id,
        recipe_id: recipeId,
        planned_date: selectedSlot.date,
        meal_type: selectedSlot.mealType
      })
    
    if (!error) {
      await loadMealPlans()
    }
    
    setIsModalOpen(false)
    setSelectedSlot(null)
  }

  async function removeMealPlan(id: string) {
    await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id)
    
    setMealPlans(prev => prev.filter(mp => mp.id !== id))
  }

  const getMealForSlot = (date: string, mealType: string) => {
    return mealPlans.find(mp => mp.planned_date === date && mp.meal_type === mealType)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
            <a href="/suggestions" className="text-sm hover:text-primary transition-colors">🍳 What Can I Make?</a>
            <a href="/random" className="text-sm hover:text-primary transition-colors">🎲 Random Pick</a>
            <a href="/recipes" className="text-sm hover:text-primary transition-colors">Recipes</a>
            <a href="/pantry" className="text-sm hover:text-primary transition-colors">Pantry</a>
            <a href="/shopping-list" className="text-sm hover:text-primary transition-colors">Shopping List</a>
            <a href="/meal-plan" className="text-sm hover:text-primary transition-colors">📅 Meal Plan</a>
            <a href="/settings" className="text-sm hover:text-primary transition-colors">⚙️ Settings</a>
            {profile?.is_admin && (
              <a href="/admin" className="text-sm hover:text-primary transition-colors">Admin</a>
            )}
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold">📅 Weekly Meal Plan</h2>
            <p className="text-muted-foreground">Plan your meals for the week ahead</p>
          </div>
          
          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevWeek}>
              ← Prev
            </Button>
            <Button variant="outline" size="sm" onClick={handleGoToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              Next →
            </Button>
          </div>
        </div>

        {/* Week Range Display */}
        <div className="text-center mb-6">
          <span className="text-lg font-medium">
            {formatDisplayDate(weekDates[0])} - {formatDisplayDate(weekDates[6])}
          </span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {/* Day Headers */}
          {weekDates.map((date) => {
            const dateStr = formatDate(date)
            const isToday = dateStr === today
            
            return (
              <div 
                key={dateStr} 
                className={`text-center p-2 rounded-lg ${isToday ? 'bg-primary/10 border-2 border-primary' : ''}`}
              >
                <div className="font-semibold text-sm md:text-base">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg md:text-xl font-bold ${isToday ? 'text-primary' : ''}`}>
                  {date.getDate()}
                </div>
              </div>
            )
          })}

          {/* Meal Slots */}
          {weekDates.map((date) => {
            const dateStr = formatDate(date)
            const isToday = dateStr === today
            
            return (
              <div key={dateStr} className="space-y-2">
                {MEAL_TYPES.map((mealType) => {
                  const meal = getMealForSlot(dateStr, mealType)
                  const isFilled = !!meal
                  
                  return (
                    <Card 
                      key={`${dateStr}-${mealType}`}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isFilled 
                          ? 'bg-primary/5 border-primary' 
                          : 'bg-muted/30 hover:bg-muted/50'
                      } ${isToday ? 'ring-1 ring-primary/50' : ''}`}
                      onClick={() => handleSlotClick(dateStr, mealType)}
                    >
                      <CardHeader className="p-2 pb-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {MEAL_ICONS[mealType]} {mealType}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-2">
                        {isFilled ? (
                          <div className="text-xs md:text-sm font-medium line-clamp-2">
                            {meal.recipe?.name || 'Unknown Recipe'}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground italic">
                            Click to add
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="outline">🌅 Breakfast</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">☀️ Lunch</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">🌙 Dinner</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">🍿 Snack</Badge>
          </div>
        </div>
      </main>

      {/* Recipe Selection Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Add Recipe for {selectedSlot && (
                <span className="text-primary">
                  {MEAL_ICONS[selectedSlot.mealType]} {selectedSlot.mealType}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSlot && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                Select a recipe for {new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              
              {recipes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No recipes available. Add some recipes first!
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {recipes.map((recipe) => (
                    <Card 
                      key={recipe.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => addMealPlan(recipe.id)}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{recipe.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{recipe.category}</div>
                        </div>
                        <Button size="sm" variant="outline">Add</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <Button 
                variant="ghost" 
                className="w-full mt-4"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
