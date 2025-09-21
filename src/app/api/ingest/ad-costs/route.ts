import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/services/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) return Response.json({ error: 'Invalid JSON body' }, { status: 400 })

    const costs = Array.isArray(body) ? body : [body]
    const rows = costs.map((e: any) => ({
      day: e.day || new Date().toISOString().slice(0, 10),
      channel: e.channel || 'other',
      campaign: e.campaign || null,
      adset: e.adset || null,
      ad: e.ad || null,
      impressions: e.impressions ?? null,
      clicks: e.clicks ?? null,
      spend: e.spend ?? 0,
      currency: e.currency || null,
      team_id: e.teamId || null,
      deployment_id: e.deploymentId || null,
      copy_id: e.copyId || null,
      version_id: e.versionId || null,
      source: e.source || 'import',
    }))

    const { error } = await supabaseAdmin
      .from('ad_costs')
      .insert(rows)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true, count: rows.length })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


