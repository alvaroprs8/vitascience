import React from 'react'
import { SaaSLayout } from '@/components/layouts/SaaSLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SaaSLayout>
      {children}
    </SaaSLayout>
  )
}


