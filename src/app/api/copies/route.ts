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
    if (!teamId) return Response.json({ error: 'Missing teamId' }, { status: 400 })

    await assertAnyTeamMembership(teamId, user.id)

    const { data, error } = await supabaseAdmin
      .from('copies')
      .select('*')
      .eq('team_id', teamId)
      .order('updated_at', { ascending: false })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ items: data || [] })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await request.json().catch(() => null)
    if (!payload) return Response.json({ error: 'Invalid JSON body' }, { status: 400 })

    const { teamId, title, channel, persona, promise, uniqueMechanism, targetConsciousnessLevel, cta, assets } = payload || {}
    if (!teamId || !title) return Response.json({ error: 'Missing teamId or title' }, { status: 400 })

    await assertAnyTeamMembership(teamId, user.id)

    const insert = {
      team_id: teamId,
      title,
      channel: channel || null,
      persona: persona || null,
      promise: promise || null,
      unique_mechanism: uniqueMechanism || null,
      target_consciousness_level: typeof targetConsciousnessLevel === 'number' ? targetConsciousnessLevel : null,
      cta: cta || null,
      assets: assets || null,
      status: 'draft',
      created_by: user.id,
    }

    const { data, error } = await supabaseAdmin
      .from('copies')
      .insert(insert)
      .select('*')
      .maybeSingle()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ item: data })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


