
-- Proof-of-Value Snapshots table for caching computed impact metrics
CREATE TABLE public.proof_of_value_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID,
  sponsor_id UUID,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_to_funding_days NUMERIC,
  time_to_completion_days NUMERIC,
  milestone_success_rate NUMERIC,
  escrow_accuracy_rate NUMERIC,
  sponsor_satisfaction_score NUMERIC,
  student_completion_rate NUMERIC,
  trust_delta_avg NUMERIC,
  hiring_conversion_rate NUMERIC,
  startup_count INTEGER DEFAULT 0,
  repeat_sponsor_rate NUMERIC,
  platform_impact_index NUMERIC,
  total_escrow_volume NUMERIC DEFAULT 0,
  total_funded_fyps INTEGER DEFAULT 0,
  total_hires INTEGER DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, sponsor_id, snapshot_date)
);

-- Enable RLS
ALTER TABLE public.proof_of_value_snapshots ENABLE ROW LEVEL SECURITY;

-- Read-only for authenticated users (no client-side INSERT/UPDATE/DELETE)
CREATE POLICY "Authenticated users can read snapshots"
  ON public.proof_of_value_snapshots
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
