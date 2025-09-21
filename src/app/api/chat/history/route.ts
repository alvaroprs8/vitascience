import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/services/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const copyId = searchParams.get('copyId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10) || 200, 500)
    if (!copyId) {
      return Response.json({ error: 'Missing copyId' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('copy_id', copyId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ items: data || [] })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


