import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/services/supabase'
import { assertAnyTeamMembership, getSessionUser } from '@/lib/auth/rbac'
import { randomUUID } from 'crypto'

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
      .from('deployments')
      .select('*')
      .eq('team_id', teamId)
      .order('start_at', { ascending: false })
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

    const { teamId, copyId, versionId, channel, url, utm, budget, currency, startAt, endAt } = body || {}
    if (!teamId || !copyId || !versionId || !channel) return Response.json({ error: 'Missing required fields' }, { status: 400 })
    await assertAnyTeamMembership(teamId, user.id)

    const copyToken = randomUUID()
    const variantToken = randomUUID()

    const insert = {
      team_id: teamId,
      copy_id: copyId,
      version_id: versionId,
      channel,
      url: url || null,
      utm: utm || null,
      budget: budget ?? null,
      currency: currency || null,
      copy_id_token: copyToken,
      variant_id_token: variantToken,
      start_at: startAt ? new Date(startAt).toISOString() : undefined,
      end_at: endAt ? new Date(endAt).toISOString() : null,
      created_by: user.id,
    }

    const { data, error } = await supabaseAdmin
      .from('deployments')
      .insert(insert)
      .select('*')
      .maybeSingle()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ item: data })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


