import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const MAX_FLAG_COUNT = 5

// GET /api/ingredients - List enabled ingredients
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const category = searchParams.get('category')

  try {
    let result

    if (query) {
      const { data, error } = await supabase
        .rpc('search_ingredients', { query_text: query })
      
      if (error) throw error
      result = data
    } else if (category) {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('category', category)
        .eq('is_enabled', true)
        .order('name')
      
      if (error) throw error
      result = data
    } else {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('is_enabled', true)
        .order('category')
        .order('name')
      
      if (error) throw error
      result = data
    }

    return NextResponse.json(result || [])
  } catch (error) {
    console.error('Error fetching ingredients:', error)
    return NextResponse.json({ error: 'Failed to fetch ingredients' }, { status: 500 })
  }
}

// POST /api/ingredients - Add custom ingredient with user tracking
export async function POST(request: NextRequest) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check user's flag_count for spam prevention
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('flag_count')
      .eq('id', userId)
      .single()

    const flagCount = profile?.flag_count || 0

    if (flagCount > MAX_FLAG_COUNT) {
      return NextResponse.json(
        { error: 'Too many flagged ingredients. Contact support.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, category, aliases } = body

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('ingredients')
      .insert({
        name: name.trim(),
        category,
        aliases: aliases || [],
        created_by: userId,
        is_enabled: true
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ingredient already exists' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating ingredient:', error)
    return NextResponse.json(
      { error: 'Failed to create ingredient' },
      { status: 500 }
    )
  }
}

// PUT /api/ingredients - Flag ingredient as not useful (spam prevention)
export async function PUT(request: NextRequest) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ingredient_id, action } = body

    if (action === 'flag') {
      // Get current flag count for user
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('flag_count')
        .eq('id', session.user.id)
        .single()

      const newFlagCount = (profile?.flag_count || 0) + 1

      // Update user's flag_count
      await supabase
        .from('user_profiles')
        .update({ flag_count: newFlagCount })
        .eq('id', session.user.id)

      // Disable the flagged ingredient
      await supabase
        .from('ingredients')
        .update({ is_enabled: false })
        .eq('id', ingredient_id)

      return NextResponse.json({ success: true, flag_count: newFlagCount })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error flagging ingredient:', error)
    return NextResponse.json(
      { error: 'Failed to flag ingredient' },
      { status: 500 }
    )
  }
}
