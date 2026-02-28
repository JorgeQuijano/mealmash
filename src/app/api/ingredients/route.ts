import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET /api/ingredients - List all or search
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const category = searchParams.get('category')

  try {
    let result

    if (query) {
      // Search ingredients using the database function
      const { data, error } = await supabase
        .rpc('search_ingredients', { query_text: query })
      
      if (error) throw error
      result = data
    } else if (category) {
      // Filter by category
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('category', category)
        .order('name')
      
      if (error) throw error
      result = data
    } else {
      // List all ingredients
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
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

// POST /api/ingredients - Add custom ingredient
export async function POST(request: NextRequest) {
  try {
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
        aliases: aliases || []
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
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
