import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SaaSLayout } from '@/components/layouts/SaaSLayout'

export const dynamic = 'force-dynamic'

export default async function LeadLayout({ children }: { children: ReactNode }) {
  const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!hasSupabaseEnv) return <SaaSLayout>{children}</SaaSLayout>

  try {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return <SaaSLayout>{children}</SaaSLayout>
  } catch (e) {
    return <SaaSLayout>{children}</SaaSLayout>
  }

  return <SaaSLayout>{children}</SaaSLayout>
}


