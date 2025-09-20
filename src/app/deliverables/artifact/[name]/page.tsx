import { notFound } from 'next/navigation'
import fs from 'fs/promises'
import path from 'path'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Highlight, { defaultProps } from 'prism-react-renderer'
import dracula from 'prism-react-renderer/themes/dracula'

type ArtifactInfo = { title: string; filename: string; type: 'md' | 'sql' | 'json' | 'mmd' | 'txt' }

const ARTIFACTS: Record<string, ArtifactInfo> = {
  concepcao: { title: 'Documento de Concepção', filename: 'CONCEPCAO.md', type: 'md' },
  prompts: { title: 'Documentação dos Prompts', filename: 'PROMPTS.md', type: 'md' },
  diagrama: { title: 'Diagrama (Mermaid)', filename: 'DIAGRAMA.mmd', type: 'mmd' },
  db_schema: { title: 'Estrutura do Banco (SQL)', filename: 'DB_SCHEMA.sql', type: 'sql' },
  validation: { title: 'Validação e Testes', filename: 'VALIDATION.md', type: 'md' },
  loom: { title: 'Loom', filename: 'LOOM.md', type: 'md' },
  n8n: { title: 'Workflow n8n (JSON)', filename: 'n8n-workflow.json', type: 'json' },
}

export const dynamic = 'force-dynamic'

export default async function ArtifactPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const info = ARTIFACTS[name]
  if (!info) return notFound()

  const abs = path.join(process.cwd(), 'public', 'deliverables', info.filename)
  let raw = ''
  try {
    raw = await fs.readFile(abs, 'utf-8')
  } catch {
    return notFound()
  }

  const downloadHref = `/deliverables/${info.filename}`

  // Pretty formatting where applicable
  let content = raw
  if (info.type === 'json') {
    try { content = JSON.stringify(JSON.parse(raw), null, 2) } catch {}
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{info.title}</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="/deliverables">Voltar</a>
          </Button>
          <Button asChild size="sm">
            <a href={downloadHref} download>
              Baixar
            </a>
          </Button>
        </div>
      </div>

      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900">Pré-visualização</CardTitle>
        </CardHeader>
        <CardContent>
          {info.type === 'md' ? (
            <article className="prose prose-slate max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    if (inline) {
                      return (
                        <code className="px-1 py-0.5 rounded bg-slate-100" {...props}>
                          {children}
                        </code>
                      )
                    }
                    return (
                      <Highlight {...defaultProps} theme={dracula} code={String(children).trim()} language={(match?.[1] as any) || 'markdown'}>
                        {({ className: cls, style, tokens, getLineProps, getTokenProps }) => (
                          <pre className={`${cls} rounded-md p-4 overflow-auto`} style={style}>
                            {tokens.map((line, i) => (
                              <div key={i} {...getLineProps({ line, key: i })}>
                                {line.map((token, key) => (
                                  <span key={key} {...getTokenProps({ token, key })} />
                                ))}
                              </div>
                            ))}
                          </pre>
                        )}
                      </Highlight>
                    )
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
          ) : (
            <pre className="whitespace-pre-wrap text-sm leading-relaxed overflow-auto rounded-md border bg-slate-50 p-4 text-slate-800">
{content}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


