import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/services/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) return Response.json({ error: 'Invalid JSON body' }, { status: 400 })

    const conversions = Array.isArray(body) ? body : [body]
    const rows = conversions.map((e: any) => ({
      occurred_at: e.occurredAt ? new Date(e.occurredAt).toISOString() : undefined,
      team_id: e.teamId || null,
      deployment_id: e.deploymentId || null,
      copy_id: e.copyId || null,
      version_id: e.versionId || null,
      lead_id: e.leadId || null,
      amount: e.amount ?? null,
      currency: e.currency || null,
      attributes: e.attributes || null,
    }))

    const { error } = await supabaseAdmin
      .from('conversions')
      .insert(rows)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true, count: rows.length })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


