export default function PlanejamentoPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Planejamento e Pesquisa</h1>
        <p className="mt-1 text-sm text-slate-600">Documento de concepção e diagrama da arquitetura da solução.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <a href="/planejamento/concepcao" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-base font-semibold leading-none mb-1 text-slate-900">Documento de concepção (Markdown)</h2>
          <p className="text-sm text-slate-600">Arquitetura, decisões e trade-offs da solução.</p>
        </a>
        <a href="/planejamento/diagrama" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-base font-semibold leading-none mb-1 text-slate-900">Diagrama Mermaid (arquitetura)</h2>
          <p className="text-sm text-slate-600">Fluxo e componentes principais da solução.</p>
        </a>
      </div>
    </div>
  )
}
