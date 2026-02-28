import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// PUT /api/pantry - Update pantry item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, quantity } = body

    if (!id || quantity === undefined) {
      return NextResponse.json(
        { error: 'ID and quantity are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('pantry_items')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating pantry item:', error)
    return NextResponse.json(
      { error: 'Failed to update pantry item' },
      { status: 500 }
    )
  }
}

// PATCH /api/pantry - Update pantry item (alternative method)
export async function PATCH(request: NextRequest) {
  return PUT(request)
}
