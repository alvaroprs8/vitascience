import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function LeadLayout({ children }: { children: ReactNode }) {
  const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!hasSupabaseEnv) {
    // Torna público quando variáveis não estão configuradas (evita 500 em produção)
    return <>{children}</>
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      // Opcional: tornar público se não autenticado
      return <>{children}</>
      // Se preferir exigir login, troque pela linha abaixo:
      // redirect('/auth/login')
    }
  } catch (e) {
    // Falha segura: não quebra a página se Supabase falhar
    return <>{children}</>
  }

  return <>{children}</>
}


