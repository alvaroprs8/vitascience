import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/services/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    let body: any
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const id: string | undefined = typeof body?.id === 'string' ? body.id : undefined
    const improvedLead: string | undefined = typeof body?.improvedLead === 'string' ? body.improvedLead : undefined

    if (!id || !id.trim()) {
      return Response.json({ error: 'id is required' }, { status: 400 })
    }
    if (typeof improvedLead !== 'string') {
      return Response.json({ error: 'improvedLead is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('lead_results')
      .update({ improved_lead: improvedLead })
      .eq('correlation_id', id)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


