import { ReactNode } from 'react'
import { SaaSLayout } from '@/components/layouts/SaaSLayout'

export const dynamic = 'force-dynamic'

export default async function CopiesLayout({ children }: { children: ReactNode }) {
  return <SaaSLayout>{children}</SaaSLayout>
}


