import { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/services/supabase'

export type TeamRole = 'copywriter' | 'editor' | 'approver' | 'admin'

export interface SessionUser {
  id: string
  email?: string | null
}

export async function getSessionUser(request?: NextRequest): Promise<SessionUser | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) return null
    return { id: session.user.id, email: (session.user.email as string | null) ?? null }
  } catch {
    return null
  }
}

export async function getUserRoleInTeam(teamId: string, userId: string): Promise<TeamRole | null> {
  const { data, error } = await supabaseAdmin
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null
  return data.role as TeamRole
}

export async function assertTeamRole(teamId: string, userId: string, allowed: TeamRole[]): Promise<void> {
  const role = await getUserRoleInTeam(teamId, userId)
  if (!role || !allowed.includes(role)) {
    const err: any = new Error('Forbidden')
    err.status = 403
    throw err
  }
}

export async function assertAnyTeamMembership(teamId: string, userId: string): Promise<void> {
  const role = await getUserRoleInTeam(teamId, userId)
  if (!role) {
    const err: any = new Error('Forbidden')
    err.status = 403
    throw err
  }
}


