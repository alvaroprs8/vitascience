import fs from 'fs/promises'
import path from 'path'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const dynamic = 'force-dynamic'

export default async function ConcepcaoPage() {
  const abs = path.join(process.cwd(), 'public', 'deliverables', 'CONCEPCAO.md')
  let content = ''
  try {
    content = await fs.readFile(abs, 'utf-8')
  } catch {
    content = '# Documento de Concepção\n\nArquivo não encontrado.'
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <header className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Documento de concepção</h1>
        <a href="/planejamento" className="text-sm text-slate-600 hover:underline">Voltar</a>
      </header>

      <article className="prose prose-slate max-w-none rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </article>
    </div>
  )
}
