import { supabase } from './supabase';

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

interface RecipeIngredient {
  ingredient_id: string;
  quantity: number;
  recipe_id: string;
  ingredients: {
    name: string;
    category: string;
    unit: string;
  };
}

// Aggregate ingredients from multiple recipes
export async function generateShoppingListFromRecipes(
  userId: string, 
  recipeIds: string[]
): Promise<Ingredient[]> {
  if (recipeIds.length === 0) return [];

  // Fetch all recipe ingredients
  const { data: recipeIngredients, error } = await supabase
    .from('recipe_ingredients')
    .select(`
      ingredient_id,
      quantity,
      recipe_id,
      ingredients (
        name,
        category,
        unit
      )
    `)
    .in('recipe_id', recipeIds);

  if (error || !recipeIngredients) {
    console.error('Error fetching recipe ingredients:', error);
    return [];
  }

  // Aggregate by ingredient
  const aggregated = new Map<string, Ingredient>();

  for (const ri of recipeIngredients as any[]) {
    if (!ri.ingredients) continue;
    
    const ing = ri.ingredients;
    const key = ing.name.toLowerCase();
    
    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.quantity += ri.quantity || 0;
    } else {
      aggregated.set(key, {
        id: ri.ingredient_id,
        name: ing.name,
        quantity: ri.quantity || 0,
        unit: ing.unit || '',
        category: ing.category || 'other'
      });
    }
  }

  // Sort by category, then name
  const result = Array.from(aggregated.values());
  return result.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });
}

// Generate from meal plan
export async function generateShoppingListFromMealPlan(userId: string): Promise<Ingredient[]> {
  // Get user's meal plan for current week
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  const { data: mealPlans, error } = await supabase
    .from('meal_plans')
    .select('recipe_id')
    .eq('user_id', userId)
    .gte('planned_date', weekStart)
    .lte('planned_date', weekEnd);

  if (error || !mealPlans || mealPlans.length === 0) {
    console.log('No meal plans found for this week');
    return [];
  }

  const recipeIds = mealPlans
    .map(mp => mp.recipe_id)
    .filter(Boolean);

  if (recipeIds.length === 0) return [];

  return generateShoppingListFromRecipes(userId, recipeIds);
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  const start = new Date(now.setDate(diff));
  return start.toISOString().split('T')[0];
}

function getWeekEnd(): string {
  const start = getWeekStart();
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end.toISOString().split('T')[0];
}
