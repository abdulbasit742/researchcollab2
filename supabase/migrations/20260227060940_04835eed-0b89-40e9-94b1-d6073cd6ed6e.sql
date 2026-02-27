
-- Economic Health Index snapshots
CREATE TABLE IF NOT EXISTS public.economic_health_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type text NOT NULL DEFAULT 'platform',
  scope_id uuid,
  escrow_reliability_pct numeric DEFAULT 0,
  dispute_frequency_pct numeric DEFAULT 0,
  completion_rate_pct numeric DEFAULT 0,
  reconciliation_consistency_pct numeric DEFAULT 0,
  sponsor_repeat_pct numeric DEFAULT 0,
  institutional_retention_pct numeric DEFAULT 0,
  overall_ehi numeric DEFAULT 0,
  total_escrow_volume numeric DEFAULT 0,
  total_milestone_releases numeric DEFAULT 0,
  total_refunds numeric DEFAULT 0,
  ledger_integrity_status text DEFAULT 'healthy',
  snapshot_at timestamptz DEFAULT now()
);

ALTER TABLE public.economic_health_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "EHI publicly visible"
  ON public.economic_health_index FOR SELECT
  TO authenticated
  USING (true);

-- Capital flow events for visualization
CREATE TABLE IF NOT EXISTS public.capital_flow_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  source_type text,
  source_id uuid,
  destination_type text,
  destination_id uuid,
  project_id uuid,
  institution_id uuid,
  milestone_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.capital_flow_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Capital flow visible to participants"
  ON public.capital_flow_events FOR SELECT
  TO authenticated
  USING (
    source_id = auth.uid() OR destination_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
  );

-- Financial risk signals
CREATE TABLE IF NOT EXISTS public.financial_risk_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_type text NOT NULL,
  severity text DEFAULT 'low',
  entity_type text NOT NULL,
  entity_id uuid,
  description text NOT NULL,
  metrics jsonb DEFAULT '{}',
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  detected_at timestamptz DEFAULT now()
);

ALTER TABLE public.financial_risk_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Risk signals visible to authenticated"
  ON public.financial_risk_signals FOR SELECT
  TO authenticated
  USING (true);

-- Financial transparency reports (annual/quarterly)
CREATE TABLE IF NOT EXISTS public.financial_transparency_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL DEFAULT 'annual',
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  total_escrow_volume numeric DEFAULT 0,
  total_milestone_releases numeric DEFAULT 0,
  dispute_rate_pct numeric DEFAULT 0,
  refund_rate_pct numeric DEFAULT 0,
  completion_reliability_pct numeric DEFAULT 0,
  escrow_invariant_stability_pct numeric DEFAULT 0,
  ledger_integrity_verified boolean DEFAULT true,
  sponsor_count integer DEFAULT 0,
  institution_count integer DEFAULT 0,
  project_count integer DEFAULT 0,
  report_data jsonb DEFAULT '{}',
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.financial_transparency_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transparency reports publicly visible"
  ON public.financial_transparency_reports FOR SELECT
  TO authenticated
  USING (published_at IS NOT NULL);

-- Sponsor capital intelligence
CREATE TABLE IF NOT EXISTS public.sponsor_capital_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL,
  total_funded numeric DEFAULT 0,
  total_released numeric DEFAULT 0,
  total_disputed numeric DEFAULT 0,
  milestone_adherence_pct numeric DEFAULT 0,
  avg_roi_score numeric DEFAULT 0,
  funding_velocity_trend text DEFAULT 'stable',
  cross_project_efficiency numeric DEFAULT 0,
  institutional_reliability_rank integer,
  dispute_risk_score numeric DEFAULT 0,
  project_count integer DEFAULT 0,
  repeat_funding_count integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.sponsor_capital_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sponsors view own intelligence"
  ON public.sponsor_capital_intelligence FOR SELECT
  TO authenticated
  USING (sponsor_id = auth.uid());

CREATE POLICY "Sponsors manage own intelligence"
  ON public.sponsor_capital_intelligence FOR ALL
  TO authenticated
  USING (sponsor_id = auth.uid())
  WITH CHECK (sponsor_id = auth.uid());
