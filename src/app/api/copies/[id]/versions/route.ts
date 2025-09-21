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
      .from('copy_versions')
      .select('*')
      .eq('copy_id', copyId)
      .order('version_number', { ascending: false })

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
    const copyId = params.id
    const body = await request.json().catch(() => null)
    if (!body) return Response.json({ error: 'Invalid JSON body' }, { status: 400 })

    const teamId = await getCopyTeam(copyId)
    if (!teamId) return Response.json({ error: 'Not found' }, { status: 404 })
    await assertAnyTeamMembership(teamId, user.id)

    const { data: maxRow, error: maxErr } = await supabaseAdmin
      .from('copy_versions')
      .select('version_number')
      .eq('copy_id', copyId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (maxErr) return Response.json({ error: maxErr.message }, { status: 500 })
    const nextVersion = (maxRow?.version_number ?? 0) + 1

    const insert = {
      copy_id: copyId,
      version_number: nextVersion,
      content: body.content || '',
      author_id: user.id,
      diff_base_version_id: body.diffBaseVersionId || null,
      metadata: body.metadata || null,
    }

    const { data, error } = await supabaseAdmin
      .from('copy_versions')
      .insert(insert)
      .select('*')
      .maybeSingle()
    if (error) return Response.json({ error: error.message }, { status: 500 })

    // Optionally set current_version_id on copies
    await supabaseAdmin
      .from('copies')
      .update({ current_version_id: data?.id })
      .eq('id', copyId)

    return Response.json({ item: data })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


