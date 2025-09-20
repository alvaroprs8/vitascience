import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/deliverables')
}

import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function HomeRedirect() {
  redirect('/lead')
}


