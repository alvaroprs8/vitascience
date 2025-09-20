import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/services/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const providedSecret = request.headers.get('x-callback-secret') || request.headers.get('X-Callback-Secret')
    const expectedSecret = process.env.N8N_CALLBACK_SECRET
    if (!expectedSecret || providedSecret !== expectedSecret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let payload: any
    try {
      payload = await request.json()
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { correlationId, improvedLead, ...rest } = payload || {}
    if (!correlationId) {
      return Response.json({ error: 'Missing correlationId' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('lead_results')
      .upsert({
        correlation_id: correlationId,
        status: 'ready',
        improved_lead: typeof improvedLead === 'string' ? improvedLead : null,
        data: Object.keys(rest || {}).length ? rest : null,
        received_at: new Date().toISOString(),
      }, { onConflict: 'correlation_id' })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


