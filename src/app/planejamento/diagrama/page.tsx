import fs from 'fs/promises'
import path from 'path'
import Mermaid from '@/components/Mermaid'

export const dynamic = 'force-dynamic'

export default async function DiagramaPage() {
  const abs = path.join(process.cwd(), 'public', 'deliverables', 'DIAGRAMA.mmd')
  let chart = ''
  try {
    chart = await fs.readFile(abs, 'utf-8')
  } catch {
    chart = 'graph TD; A[Arquivo não encontrado] --> B[DIAGRAMA.mmd]'
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Diagrama da arquitetura</h1>
        <a href="/planejamento" className="text-sm text-slate-600 hover:underline">Voltar</a>
      </div>

      <Mermaid chart={chart} />
    </div>
  )
}
