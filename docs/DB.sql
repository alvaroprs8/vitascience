-- Estrutura da tabela lead_results (Supabase / Postgres)
create table if not exists public.lead_results (
  correlation_id text primary key,
  status text not null default 'ready',
  improved_lead text,
  data jsonb,
  received_at timestamptz not null default now()
);

-- Índices auxiliares
create index if not exists idx_lead_results_received_at on public.lead_results (received_at desc);
