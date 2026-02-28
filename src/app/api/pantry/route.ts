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
      return NextResponse.json({ error: 'ID and quantity required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('pantry_items')
      .update({ quantity: String(quantity) })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error updating pantry item:', error)
    return NextResponse.json({ error: 'Failed to update pantry item' }, { status: 500 })
  }
}
