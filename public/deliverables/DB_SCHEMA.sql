-- Estrutura de banco (Supabase/PostgreSQL)
CREATE TABLE IF NOT EXISTS public.lead_results (
  correlation_id text PRIMARY KEY,
  status text NOT NULL,
  improved_lead text NULL,
  data jsonb NULL,
  received_at timestamptz NULL
);

-- Índice para listagens por data
CREATE INDEX IF NOT EXISTS lead_results_received_at_idx ON public.lead_results (received_at DESC);
