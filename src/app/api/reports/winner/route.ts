import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/services/supabase'
import { assertAnyTeamMembership, getSessionUser } from '@/lib/auth/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId') || ''
    const since = searchParams.get('since') || ''
    const until = searchParams.get('until') || ''
    if (!teamId) return Response.json({ error: 'Missing teamId' }, { status: 400 })
    await assertAnyTeamMembership(teamId, user.id)

    // Basic aggregated KPIs by copy/version
    const { data: events } = await supabaseAdmin
      .from('events')
      .select('copy_id, version_id, event_type')
      .eq('team_id', teamId)
    const { data: leads } = await supabaseAdmin
      .from('leads')
      .select('copy_id, version_id')
      .eq('team_id', teamId)
    const { data: convs } = await supabaseAdmin
      .from('conversions')
      .select('copy_id, version_id, amount')
      .eq('team_id', teamId)
    const { data: costs } = await supabaseAdmin
      .from('ad_costs')
      .select('copy_id, version_id, spend')
      .eq('team_id', teamId)

    type Key = string
    const key = (c?: string | null, v?: string | null) => `${c || 'null'}::${v || 'null'}`
    const agg: Record<Key, any> = {}

    for (const e of events || []) {
      const k = key(e.copy_id as any, e.version_id as any)
      agg[k] ||= { copyId: e.copy_id, versionId: e.version_id, views: 0, clicks: 0 }
      if (e.event_type === 'view') agg[k].views++
      if (e.event_type === 'click') agg[k].clicks++
    }
    for (const l of leads || []) {
      const k = key(l.copy_id as any, l.version_id as any)
      agg[k] ||= { copyId: l.copy_id, versionId: l.version_id, views: 0, clicks: 0 }
      agg[k].leads = (agg[k].leads || 0) + 1
    }
    for (const c of convs || []) {
      const k = key(c.copy_id as any, c.version_id as any)
      agg[k] ||= { copyId: c.copy_id, versionId: c.version_id, views: 0, clicks: 0 }
      agg[k].conversions = (agg[k].conversions || 0) + 1
      agg[k].revenue = (agg[k].revenue || 0) + (Number(c.amount) || 0)
    }
    for (const s of costs || []) {
      const k = key(s.copy_id as any, s.version_id as any)
      agg[k] ||= { copyId: s.copy_id, versionId: s.version_id, views: 0, clicks: 0 }
      agg[k].spend = (agg[k].spend || 0) + (Number(s.spend) || 0)
    }

    const items = Object.values(agg).map((x: any) => {
      const ctr = x.views ? (x.clicks || 0) / x.views : null
      const cvrLead = (x.clicks || x.views) ? (x.leads || 0) / (x.clicks || x.views) : null
      const cvrSale = (x.leads || 0) ? (x.conversions || 0) / (x.leads || 1) : null
      const cpa = (x.spend || 0) && (x.leads || 0) ? (x.spend || 0) / (x.leads || 1) : null
      const roas = (x.spend || 0) ? (x.revenue || 0) / (x.spend || 1) : null
      return { ...x, ctr, cvrLead, cvrSale, cpa, roas }
    })

    // Simple ranking: highest ROAS, then highest conversions
    items.sort((a: any, b: any) => (b.roas ?? -1) - (a.roas ?? -1) || (b.conversions || 0) - (a.conversions || 0))

    return Response.json({ items })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


