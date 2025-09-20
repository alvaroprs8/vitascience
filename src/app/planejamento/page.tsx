export default function PlanejamentoPage() {
  return (
    <div className="mx-auto max-w-[1200px]">
      <header className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Planejamento e Pesquisa</h1>
        <p className="mt-1 text-sm text-slate-600">Documento de concepção e diagrama da arquitetura da solução.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <a href="/planejamento/concepcao" className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <h2 className="mb-1 text-base font-semibold leading-none text-slate-900">Documento de concepção (Markdown)</h2>
          <p className="text-sm text-slate-600">Arquitetura, decisões e trade-offs da solução.</p>
        </a>
        <a href="/planejamento/diagrama" className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <h2 className="mb-1 text-base font-semibold leading-none text-slate-900">Diagrama Mermaid (arquitetura)</h2>
          <p className="text-sm text-slate-600">Fluxo e componentes principais da solução.</p>
        </a>
      </section>
    </div>
  )
}
