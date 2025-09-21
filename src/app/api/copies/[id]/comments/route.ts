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
      .from('copy_comments')
      .select('*')
      .eq('copy_id', copyId)
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
    const copyId = params.id
    const body = await request.json().catch(() => null)
    if (!body) return Response.json({ error: 'Invalid JSON body' }, { status: 400 })

    const teamId = await getCopyTeam(copyId)
    if (!teamId) return Response.json({ error: 'Not found' }, { status: 404 })
    await assertAnyTeamMembership(teamId, user.id)

    const { versionId, selection, comment } = body || {}
    if (!comment) return Response.json({ error: 'Missing comment' }, { status: 400 })

    const insert = {
      copy_id: copyId,
      version_id: versionId || null,
      author_id: user.id,
      selection: selection || null,
      body: comment,
    }

    const { data, error } = await supabaseAdmin
      .from('copy_comments')
      .insert(insert)
      .select('*')
      .maybeSingle()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ item: data })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


