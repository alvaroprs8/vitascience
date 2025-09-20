import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        // Next.js cookies set signature: (name, value, options)
        // @ts-ignore
        cookieStore.set(name, value, options)
      },
      remove(name: string, options: any) {
        // @ts-ignore
        cookieStore.set(name, '', { ...options, maxAge: 0 })
      },
    },
  })
}


