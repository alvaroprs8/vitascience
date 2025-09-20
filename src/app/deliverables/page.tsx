import { BentoGrid, BentoCard } from "@/components/ui/bento-grid"
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
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Entregáveis — Clone Digital Eugene Schwartz</h1>
            <p className="mt-1 text-sm text-slate-600">
              Artefatos do teste (documentos, diagrama, workflow n8n, schema de banco e validações), além de links rápidos para executar e validar.
            </p>
          </div>
        </div>
      </div>

      <APIsSection apiLinks={apiLinks} />

      <ArtefatosSection items={items} />

      <footer className="mt-10 text-xs text-slate-500">
        <p>
          Observação: os arquivos acima ficam em <code>/public/deliverables/</code>. Substitua pelos definitivos conforme for finalizando.
        </p>
      </footer>
    </div>
  )
}


function APIsSection({
  apiLinks,
}: {
  apiLinks: Array<{ label: string; href: string }>
}) {
  return (
    <section id="apis" className="mb-8">
      <h2 className="text-xl font-medium mb-3 text-slate-900">APIs</h2>
      <BentoGrid className="auto-rows-[16rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {apiLinks.map((l) => (
          <BentoCard
            key={l.href}
            name={l.label}
            description="Endpoints para validação e execução do fluxo"
            href={l.href}
            cta="Abrir"
            Icon={CodeIcon}
            className="col-span-1"
            background={
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800" />
            }
          />
        ))}
      </BentoGrid>
    </section>
  )
}

function ArtefatosSection({
  items,
}: {
  items: Array<{ title: string; description: string; href: string }>
}) {
  return (
    <section id="artefatos">
      <h2 className="text-xl font-medium mb-4 text-slate-900">Artefatos</h2>
      <BentoGrid className="auto-rows-[18rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <BentoCard
            key={it.title}
            name={it.title}
            description={it.description}
            href={it.href}
            cta="Abrir"
            Icon={FileTextIcon}
            className="col-span-1"
            background={
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-slate-900 dark:to-slate-800" />
            }
            extraActions={
              <Button variant="ghost" size="sm" asChild>
                <a href={it.href} download>
                  Download
                  <DownloadIcon className="ml-2 h-4 w-4" />
                </a>
              </Button>
            }
          />
        ))}
      </BentoGrid>
    </section>
  )
}

