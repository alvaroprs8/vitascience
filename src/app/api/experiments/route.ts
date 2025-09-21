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
      .from('experiments')
      .select('*')
      .eq('team_id', teamId)
      .order('started_at', { ascending: false })
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
    const body = await request.json().catch(() => null)
    if (!body) return Response.json({ error: 'Invalid JSON body' }, { status: 400 })

    const { teamId, name } = body || {}
    if (!teamId || !name) return Response.json({ error: 'Missing teamId or name' }, { status: 400 })
    await assertAnyTeamMembership(teamId, user.id)

    const { data, error } = await supabaseAdmin
      .from('experiments')
      .insert({ team_id: teamId, name, created_by: user.id })
      .select('*')
      .maybeSingle()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ item: data })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


