-- Migration: Add original_lead column to public.lead_results
-- Safe to run multiple times

BEGIN;

ALTER TABLE public.lead_results
  ADD COLUMN IF NOT EXISTS original_lead text NULL;

-- Optional: add a comment for documentation
COMMENT ON COLUMN public.lead_results.original_lead IS 'Lead original enviada no submit';

COMMIT;


