import { SaaSLayout } from "@/components/layouts/SaaSLayout"
import { Timeline } from "@/components/modern-timeline"

export default function PortfolioVitascience() {
  const tasks: Array<{
    section: string
    items: Array<{ name: string; done: boolean; href?: string }>
  }> = [
    {
      section: "Planejamento e Pesquisa",
      items: [
        { name: "Documento de Concepção (Markdown)", done: true, href: "/deliverables/CONCEPCAO.md" },
        { name: "Diagrama Mermaid (arquitetura da solução)", done: true, href: "/deliverables/DIAGRAMA.mmd" },
      ],
    },
    {
      section: "O Sistema Funcionando",
      items: [
        { name: "Workflow do n8n exportado em JSON", done: true, href: "/deliverables/n8n-workflow.json" },
        { name: "Estrutura do banco de dados", done: true, href: "/deliverables/DB_SCHEMA.sql" },
        { name: "Documentação dos prompts (fundamental)", done: true, href: "/deliverables/PROMPTS.md" },
        { name: "Livro Breakthrough Advertising vetorizado no agente", done: true },
      ],
    },
    {
      section: "Validação e Testes",
      items: [
        { name: "Análise completa da Lead da VSL enviada", done: true, href: "/deliverables/VALIDATION.md" },
        { name: "Evidência de qualidade do clone (como foi medido)", done: true, href: "/deliverables/VALIDATION.md" },
      ],
    },
    {
      section: "Apresentação",
      items: [
        { name: "Vídeo Loom (5–10 min) mostrando o sistema funcionando", done: true, href: "/deliverables/LOOM.md" },
        { name: "README com instruções de uso", done: true, href: "https://github.com/alvaroprs8/vitascience#readme" },
        { name: "Repositório no GitHub com todos os arquivos e documentação", done: true, href: "https://github.com/alvaroprs8/vitascience" },
      ],
    },
    {
      section: "Output Esperado (formato JSON)",
      items: [
        { name: "Análise do nível de consciência (1–5) + justificativa", done: true },
        { name: "Dissecação da estrutura da Lead (framework PAS, AIDA etc.)", done: true },
        { name: "Mínimo 5 pontos de melhoria (com exemplo reescrito)", done: true },
        { name: "Mínimo 3 novos ângulos (headlines e justificativas)", done: true },
      ],
    },
  ]

  const computeSectionProgress = (items: ReadonlyArray<{ done: boolean }>) => {
    const total = items.length
    const done = items.filter(i => i.done).length
    return Math.round((done / total) * 100)
  }

  return (
    <SaaSLayout>
      <div className="min-h-screen bg-white px-6 py-10">
        <header className="mx-auto mb-10 max-w-5xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Case: Clone Digital Eugene Schwartz — Vitascience
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Desafio entregue em 96h: criação de sistema no n8n para análise de VSL usando metodologia de Eugene Schwartz. Abaixo, as etapas concluídas e entregáveis.
          </p>
        </header>

        <main className="mx-auto grid max-w-5xl gap-6">
          {tasks.map((section, idx) => {
            const percent = computeSectionProgress(section.items)
			return (
				<section key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="mb-4 flex items-center justify-between gap-4">
						<h2 className="text-lg font-semibold text-slate-900">{section.section}</h2>
						<div className="flex items-center gap-2">
							<span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
								{percent === 100 ? "Concluído" : "Em progresso"}
							</span>
						</div>
					</div>

					<Timeline
						className="mt-2"
						items={section.items.map((item) => ({
							title: item.name,
							description: item.done ? "Entregável concluído" : "Entregável pendente",
							status: item.done ? "completed" : "upcoming",
							category: section.section,
						}))}
					/>
				</section>
			)
          })}
        </main>
      </div>
    </SaaSLayout>
  )
}


