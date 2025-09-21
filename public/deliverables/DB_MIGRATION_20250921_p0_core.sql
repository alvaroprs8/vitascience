-- Migration: P0 Core Schema (RBAC, Copies, Versions, Comments, Approvals, Deployments,
--             Events, Leads, Conversions, Ad Costs, Experiments)
-- Safe to run multiple times. Uses IF NOT EXISTS safeguards.

BEGIN;

-- =========================
-- RBAC / Teams
-- =========================
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('copywriter','editor','approver','admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS team_members_user_idx ON public.team_members(user_id);

-- =========================
-- Copies & Versioning
-- =========================
CREATE TABLE IF NOT EXISTS public.copies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title text NOT NULL,
  channel text NULL,               -- ex: 'vsl','lp','ad','email'
  persona text NULL,
  promise text NULL,
  unique_mechanism text NULL,
  target_consciousness_level int NULL,
  cta text NULL,
  assets jsonb NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','approved','deployed')),
  current_version_id uuid NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS copies_team_idx ON public.copies(team_id);

CREATE TABLE IF NOT EXISTS public.copy_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_id uuid NOT NULL REFERENCES public.copies(id) ON DELETE CASCADE,
  version_number int NOT NULL,
  content text NOT NULL,
  author_id uuid NOT NULL,
  diff_base_version_id uuid NULL REFERENCES public.copy_versions(id) ON DELETE SET NULL,
  metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(copy_id, version_number)
);

CREATE INDEX IF NOT EXISTS copy_versions_copy_idx ON public.copy_versions(copy_id);

-- =========================
-- Comments & Approvals
-- =========================
CREATE TABLE IF NOT EXISTS public.copy_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_id uuid NOT NULL REFERENCES public.copies(id) ON DELETE CASCADE,
  version_id uuid NULL REFERENCES public.copy_versions(id) ON DELETE SET NULL,
  author_id uuid NOT NULL,
  selection jsonb NULL,            -- eg: { startOffset, endOffset, path }
  body text NOT NULL,
  resolved boolean NOT NULL DEFAULT false,
  resolved_by uuid NULL,
  resolved_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS copy_comments_copy_idx ON public.copy_comments(copy_id);

CREATE TABLE IF NOT EXISTS public.copy_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_id uuid NOT NULL REFERENCES public.copies(id) ON DELETE CASCADE,
  version_id uuid NOT NULL REFERENCES public.copy_versions(id) ON DELETE CASCADE,
  approver_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('approved','rejected')),
  note text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS copy_approvals_copy_idx ON public.copy_approvals(copy_id);

-- =========================
-- Deployments (Registro de Uso)
-- =========================
CREATE TABLE IF NOT EXISTS public.deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  copy_id uuid NOT NULL REFERENCES public.copies(id) ON DELETE CASCADE,
  version_id uuid NOT NULL REFERENCES public.copy_versions(id) ON DELETE CASCADE,
  channel text NOT NULL,           -- 'lp','ad','email','video','social'
  url text NULL,
  utm jsonb NULL,
  budget numeric NULL,
  currency text NULL,
  copy_id_token text NULL,         -- public token to embed in links (CopyID)
  variant_id_token text NULL,      -- public token to embed in links (VariantID)
  start_at timestamptz NOT NULL DEFAULT now(),
  end_at timestamptz NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS deployments_team_idx ON public.deployments(team_id);
CREATE INDEX IF NOT EXISTS deployments_copy_idx ON public.deployments(copy_id);

-- =========================
-- Telemetry & Performance Data
-- =========================
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL CHECK (event_type IN ('view','click','scroll','submit')),
  team_id uuid NULL,
  deployment_id uuid NULL REFERENCES public.deployments(id) ON DELETE SET NULL,
  copy_id uuid NULL REFERENCES public.copies(id) ON DELETE SET NULL,
  version_id uuid NULL REFERENCES public.copy_versions(id) ON DELETE SET NULL,
  session_id text NULL,
  user_agent text NULL,
  ip_address text NULL,
  properties jsonb NULL
);

CREATE INDEX IF NOT EXISTS events_deployment_idx ON public.events(deployment_id);
CREATE INDEX IF NOT EXISTS events_copy_idx ON public.events(copy_id);
CREATE INDEX IF NOT EXISTS events_type_time_idx ON public.events(event_type, occurred_at);

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  team_id uuid NULL,
  deployment_id uuid NULL REFERENCES public.deployments(id) ON DELETE SET NULL,
  copy_id uuid NULL REFERENCES public.copies(id) ON DELETE SET NULL,
  version_id uuid NULL REFERENCES public.copy_versions(id) ON DELETE SET NULL,
  external_lead_id text NULL,
  email text NULL,
  attributes jsonb NULL
);

CREATE INDEX IF NOT EXISTS leads_deployment_idx ON public.leads(deployment_id);

CREATE TABLE IF NOT EXISTS public.conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  team_id uuid NULL,
  deployment_id uuid NULL REFERENCES public.deployments(id) ON DELETE SET NULL,
  copy_id uuid NULL REFERENCES public.copies(id) ON DELETE SET NULL,
  version_id uuid NULL REFERENCES public.copy_versions(id) ON DELETE SET NULL,
  lead_id uuid NULL REFERENCES public.leads(id) ON DELETE SET NULL,
  amount numeric NULL,
  currency text NULL,
  attributes jsonb NULL
);

CREATE INDEX IF NOT EXISTS conversions_deployment_idx ON public.conversions(deployment_id);

CREATE TABLE IF NOT EXISTS public.ad_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day date NOT NULL,
  channel text NOT NULL,           -- 'meta','google','tiktok','email','other'
  campaign text NULL,
  adset text NULL,
  ad text NULL,
  impressions int NULL,
  clicks int NULL,
  spend numeric NOT NULL,
  currency text NULL,
  team_id uuid NULL,
  deployment_id uuid NULL REFERENCES public.deployments(id) ON DELETE SET NULL,
  copy_id uuid NULL REFERENCES public.copies(id) ON DELETE SET NULL,
  version_id uuid NULL REFERENCES public.copy_versions(id) ON DELETE SET NULL,
  source text NULL                 -- 'import','api'
);

CREATE INDEX IF NOT EXISTS ad_costs_day_channel_idx ON public.ad_costs(day, channel);

-- =========================
-- Experiments (A/B testing simples)
-- =========================
CREATE TABLE IF NOT EXISTS public.experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','ended')),
  created_by uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.experiment_arms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  copy_id uuid NOT NULL REFERENCES public.copies(id) ON DELETE CASCADE,
  version_id uuid NOT NULL REFERENCES public.copy_versions(id) ON DELETE CASCADE,
  allocation numeric NOT NULL CHECK (allocation > 0 AND allocation <= 1),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','ended')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS experiment_arms_experiment_idx ON public.experiment_arms(experiment_id);

COMMIT;


