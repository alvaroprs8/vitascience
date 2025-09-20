export default function DeliverablesPage() {
  const items: Array<{
    title: string
    description: string
    href: string
    actions?: Array<{ label: string, href: string }>
  }> = [
    {
      title: 'Documento de Concepção',
      description: 'Arquitetura, decisões e trade-offs da solução (Markdown).',
      href: '/deliverables/artifact/concepcao',
    },
    {
      title: 'Diagrama (Mermaid)',
      description: 'Fluxo end-to-end: ingestão RAG, análise no n8n, callback e consumo.',
      href: '/deliverables/artifact/diagrama',
    },
    {
      title: 'Documentação dos Prompts',
      description: 'Todos os prompts usados (consciência, estrutura, melhorias, ângulos, agente Eugene).',
      href: '/deliverables/artifact/prompts',
    },
    {
      title: 'Workflow do n8n (JSON)',
      description: 'Export do workflow para import direto no n8n.',
      href: '/deliverables/artifact/n8n',
    },
    {
      title: 'Estrutura do Banco de Dados',
      description: 'DDL da tabela lead_results e índices (PostgreSQL/Supabase).',
      href: '/deliverables/artifact/db_schema',
    },
    {
      title: 'Validação e Testes',
      description: 'Análise completa da VSL enviada e critérios de avaliação do clone.',
      href: '/deliverables/artifact/validation',
    },
    {
      title: 'Link do Loom',
      description: 'Vídeo (5–10 min) demonstrando tudo funcionando.',
      href: '/deliverables/artifact/loom',
    },
  ]

  const quickLinks = [
    { label: 'Enviar Lead (UI)', href: '/lead' },
  ]

  const apiLinks = [
    { label: 'POST /api/submit-lead', href: '/api/submit-lead' },
    { label: 'GET  /api/lead/status?id={correlationId}', href: '/api/lead/status' },
    { label: 'POST /api/lead/callback', href: '/api/lead/callback' },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Entregáveis — Clone Digital Eugene Schwartz</h1>
            <p className="mt-1 text-sm text-slate-600">
              Artefatos do teste (documentos, diagrama, workflow n8n, schema de banco e validações), além de links rápidos para executar e validar.
            </p>
          </div>
          <a
            href="/lead"
            className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Abrir UI de Envio
          </a>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3 text-slate-900">Acesso Rápido</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
            >
              {l.label}
            </a>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3 text-slate-900">APIs</h2>
        <div className="flex flex-wrap gap-3">
          {apiLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
            >
              {l.label}
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-medium mb-4 text-slate-900">Artefatos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <article key={it.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-base font-semibold leading-none mb-1 text-slate-900">{it.title}</h3>
              <p className="text-sm text-slate-600 mb-3">{it.description}</p>
              <div className="flex gap-2">
                <a
                  href={it.href}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Abrir
                </a>
                <a
                  href={it.href}
                  download
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Download
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="mt-10 text-xs text-slate-500">
        <p>
          Observação: os arquivos acima ficam em <code>/public/deliverables/</code>. Substitua pelos definitivos conforme for finalizando.
        </p>
      </footer>
    </div>
  )
}


