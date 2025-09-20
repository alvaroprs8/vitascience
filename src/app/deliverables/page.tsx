import IntegrationsSection, { IntegrationCard } from "@/components/integrations-component"
import { Button } from "@/components/ui/button"
import { FileTextIcon, CodeIcon, DownloadIcon } from "@radix-ui/react-icons"

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
      <div className="py-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Eugene Schwartz</h1>
      </div>

      <section className="mb-10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {apiLinks.map((l) => (
              <IntegrationCard key={l.href} title={l.label} description="Endpoint da API" actions={[{ label: 'Abrir', href: l.href }]}>
                <CodeIcon className="size-10" />
              </IntegrationCard>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <IntegrationCard
                key={it.title}
                title={it.title}
                description={it.description}
                actions={[
                  { label: 'Abrir', href: it.href },
                  { label: 'Download', href: it.href, download: true },
                ]}
              >
                <FileTextIcon className="size-10" />
              </IntegrationCard>
            ))}
          </div>
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
