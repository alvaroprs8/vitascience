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

    const originalLead = (() => {
      const d: any = data?.data || {}
      // Prefer explicit keys
      if (typeof d.vsl_copy === 'string' && d.vsl_copy.trim()) return d.vsl_copy
      if (typeof d.lead === 'string' && d.lead.trim()) return d.lead
      // Common wrappers
      const wrappers = ['input', 'request', 'payload', 'params', 'body', 'data'] as const
      for (const w of wrappers) {
        const nested: any = d?.[w]
        if (!nested) continue
        if (typeof nested === 'string' && nested.trim()) return nested
        if (typeof nested?.lead === 'string' && nested.lead.trim()) return nested.lead
        if (typeof nested?.vsl_copy === 'string' && nested.vsl_copy.trim()) return nested.vsl_copy
      }
      return undefined
    })()

    return Response.json({
      status: data.status,
      improvedLead: data.improved_lead || undefined,
      originalLead: originalLead || undefined,
      data: data.data || undefined,
      receivedAt: data.received_at ? new Date(data.received_at).getTime() : null,
      correlationId: data.correlation_id,
    })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


