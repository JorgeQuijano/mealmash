import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET /api/meal-plans - Get user's meal plans
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseWithAuth = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } }
    })

    const { data: { user } } = await supabaseWithAuth.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data, error } = await supabaseWithAuth
      .from('meal_plans')
      .select('*, recipes(*)')
      .eq('user_id', user.id)
      .order('planned_date', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/meal-plans - Add recipe to meal plan
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseWithAuth = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } }
    })

    const { data: { user } } = await supabaseWithAuth.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { recipe_id, planned_date, meal_type } = body

    if (!recipe_id || !planned_date || !meal_type) {
      return NextResponse.json({ error: 'recipe_id, planned_date, and meal_type are required' }, { status: 400 })
    }

    const { data, error } = await supabaseWithAuth
      .from('meal_plans')
      .insert({
        user_id: user.id,
        recipe_id,
        planned_date,
        meal_type
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/meal-plans - Remove recipe from meal plan
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseWithAuth = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } }
    })

    const { data: { user } } = await supabaseWithAuth.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Meal plan ID required' }, { status: 400 })
    }

    // Get contributions for this meal plan before deleting
    const { data: contributions } = await supabaseWithAuth
      .from('meal_plan_shopping_contributions')
      .select('*')
      .eq('meal_plan_id', id);

    // Reduce quantities in shopping list for each contribution
    if (contributions && contributions.length > 0) {
      for (const contrib of contributions) {
        // Get current shopping list item
        const { data: shoppingItem } = await supabaseWithAuth
          .from('shopping_list')
          .select('quantity')
          .eq('id', contrib.shopping_list_id)
          .single();

        if (shoppingItem) {
          const currentQty = parseFloat(shoppingItem.quantity) || 0;
          const newQty = currentQty - (parseFloat(contrib.quantity_contributed) || 0);

          if (newQty <= 0) {
            // Remove the shopping list item entirely
            await supabaseWithAuth
              .from('shopping_list')
              .delete()
              .eq('id', contrib.shopping_list_id);
          } else {
            // Update with reduced quantity
            await supabaseWithAuth
              .from('shopping_list')
              .update({ quantity: newQty.toString() })
              .eq('id', contrib.shopping_list_id);
          }
        }
      }

      // Delete contribution records
      await supabaseWithAuth
        .from('meal_plan_shopping_contributions')
        .delete()
        .eq('meal_plan_id', id);
    }

    // Delete the meal plan entry
    const { error } = await supabaseWithAuth
      .from('meal_plans')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
