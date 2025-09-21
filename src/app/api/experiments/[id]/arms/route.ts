import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/services/supabase'
import { assertAnyTeamMembership, getSessionUser } from '@/lib/auth/rbac'

export const dynamic = 'force-dynamic'

async function getExperimentTeam(experimentId: string) {
  const { data, error } = await supabaseAdmin
    .from('experiments')
    .select('team_id')
    .eq('id', experimentId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data?.team_id as string | undefined
}

export async function GET(_request: NextRequest, { params }: any) {
  try {
    const user = await getSessionUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const experimentId = params.id
    const teamId = await getExperimentTeam(experimentId)
    if (!teamId) return Response.json({ error: 'Not found' }, { status: 404 })
    await assertAnyTeamMembership(teamId, user.id)

    const { data, error } = await supabaseAdmin
      .from('experiment_arms')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('created_at', { ascending: false })
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ items: data || [] })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: any) {
  try {
    const user = await getSessionUser(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const experimentId = params.id
    const body = await request.json().catch(() => null)
    if (!body) return Response.json({ error: 'Invalid JSON body' }, { status: 400 })

    const teamId = await getExperimentTeam(experimentId)
    if (!teamId) return Response.json({ error: 'Not found' }, { status: 404 })
    await assertAnyTeamMembership(teamId, user.id)

    const { copyId, versionId, allocation } = body || {}
    if (!copyId || !versionId || typeof allocation !== 'number') return Response.json({ error: 'Missing fields' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('experiment_arms')
      .insert({ experiment_id: experimentId, copy_id: copyId, version_id: versionId, allocation, status: 'active' })
      .select('*')
      .maybeSingle()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ item: data })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


