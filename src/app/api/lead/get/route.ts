import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/services/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('correlationId')
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('lead_results')
      .select('*')
      .eq('correlation_id', id)
      .maybeSingle()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    if (!data) return Response.json({ error: 'Not found' }, { status: 404 })

    return Response.json({
      status: data.status,
      improvedLead: data.improved_lead || undefined,
      data: data.data || undefined,
      receivedAt: data.received_at ? new Date(data.received_at).getTime() : null,
      correlationId: data.correlation_id,
    })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


