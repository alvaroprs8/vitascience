import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/services/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200)

    const { data, error } = await supabaseAdmin
      .from('lead_results')
      .select('*')
      .order('received_at', { ascending: false })
      .limit(limit)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    const items = (data || []).map((row: any) => {
      const info = row?.data || {}
      const title = info?.title || info?.data?.title || null
      return {
        id: row.correlation_id,
        status: row.status,
        receivedAt: row.received_at ? new Date(row.received_at).getTime() : null,
        title,
        hasImproved: Boolean(row.improved_lead && String(row.improved_lead).trim()),
      }
    })

    return Response.json({ items })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


