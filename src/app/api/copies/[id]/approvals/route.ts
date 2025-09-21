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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(request)
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const copyId = params.id
    const body = await request.json().catch(() => null)
    if (!body) return Response.json({ error: 'Invalid JSON body' }, { status: 400 })

    const { versionId, status, note } = body || {}
    if (!versionId || !status) return Response.json({ error: 'Missing versionId or status' }, { status: 400 })

    const teamId = await getCopyTeam(copyId)
    if (!teamId) return Response.json({ error: 'Not found' }, { status: 404 })
    await assertAnyTeamMembership(teamId, user.id)

    const { data, error } = await supabaseAdmin
      .from('copy_approvals')
      .insert({ copy_id: copyId, version_id: versionId, approver_id: user.id, status, note: note || null })
      .select('*')
      .maybeSingle()
    if (error) return Response.json({ error: error.message }, { status: 500 })

    // Update copy status based on approval
    if (status === 'approved') {
      await supabaseAdmin.from('copies').update({ status: 'approved', current_version_id: versionId }).eq('id', copyId)
    }

    return Response.json({ item: data })
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


