import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/services/supabase'
import { assertAnyTeamMembership, getSessionUser } from '@/lib/auth/rbac'

export const dynamic = 'force-dynamic'

async function getCopyTeam(copyId: string) {
  const { data, error } = await supabaseAdmin
    .from('copies')
    .select('team_id')
    .eq('id', copyId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data?.team_id as string | undefined
}

export async function GET(_request: NextRequest, { params }: any) {
  try {
    const user = await getSessionUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const copyId = params.id

    const teamId = await getCopyTeam(copyId)
    if (!teamId) return Response.json({ error: 'Not found' }, { status: 404 })
    await assertAnyTeamMembership(teamId, user.id)

    const { data, error } = await supabaseAdmin
      .from('copies')
      .select('*')
      .eq('id', copyId)
      .maybeSingle()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    if (!data) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json({ item: data })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: any) {
  try {
    const user = await getSessionUser(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const copyId = params.id
    const body = await request.json().catch(() => null)
    if (!body) return Response.json({ error: 'Invalid JSON body' }, { status: 400 })

    const teamId = await getCopyTeam(copyId)
    if (!teamId) return Response.json({ error: 'Not found' }, { status: 404 })
    await assertAnyTeamMembership(teamId, user.id)

    const allowed = ['title','channel','persona','promise','unique_mechanism','target_consciousness_level','cta','assets','status','current_version_id']
    const update: any = {}
    for (const key of allowed) if (key in body) update[key] = body[key]
    if (Object.keys(update).length === 0) return Response.json({ error: 'No updatable fields' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('copies')
      .update(update)
      .eq('id', copyId)
      .select('*')
      .maybeSingle()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ item: data })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: any) {
  try {
    const user = await getSessionUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const copyId = params.id
    const teamId = await getCopyTeam(copyId)
    if (!teamId) return Response.json({ error: 'Not found' }, { status: 404 })
    await assertAnyTeamMembership(teamId, user.id)

    const { error } = await supabaseAdmin
      .from('copies')
      .delete()
      .eq('id', copyId)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


