
-- ============================================================
-- UPGRADE 1: Verified Research Compute Engine (VRCE)
-- ============================================================

CREATE TABLE public.experiment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  execution_environment JSONB DEFAULT '{}',
  dataset_signature TEXT,
  status TEXT NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  compute_duration_seconds INTEGER,
  gpu_type TEXT,
  reproducibility_hash TEXT,
  linked_milestone_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.experiment_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own experiments"
  ON public.experiment_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experiments"
  ON public.experiment_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiments"
  ON public.experiment_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_experiment_sessions_user ON public.experiment_sessions(user_id);
CREATE INDEX idx_experiment_sessions_project ON public.experiment_sessions(project_id);
CREATE INDEX idx_experiment_sessions_status ON public.experiment_sessions(status);

-- Compute usage ledger (append-only)
CREATE TABLE public.compute_usage_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_session_id UUID NOT NULL REFERENCES public.experiment_sessions(id),
  user_id UUID NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'cpu',
  units_consumed NUMERIC NOT NULL DEFAULT 0,
  unit_type TEXT NOT NULL DEFAULT 'seconds',
  cost_estimate NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'PKR',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.compute_usage_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own compute usage"
  ON public.compute_usage_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own compute usage"
  ON public.compute_usage_ledger FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Append-only: no update/delete policies
CREATE INDEX idx_compute_usage_session ON public.compute_usage_ledger(experiment_session_id);
CREATE INDEX idx_compute_usage_user ON public.compute_usage_ledger(user_id);

-- Prevent mutations on compute ledger (append-only)
CREATE OR REPLACE FUNCTION prevent_compute_ledger_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Compute usage ledger is append-only. Updates and deletes are prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_compute_ledger_update
  BEFORE UPDATE OR DELETE ON public.compute_usage_ledger
  FOR EACH ROW EXECUTE FUNCTION prevent_compute_ledger_mutation();

-- ============================================================
-- UPGRADE 2: Institutional Trust Index
-- ============================================================

CREATE TABLE public.institutional_trust_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  institution_name TEXT NOT NULL,
  execution_score NUMERIC NOT NULL DEFAULT 0,
  dispute_ratio NUMERIC NOT NULL DEFAULT 0,
  capital_efficiency NUMERIC NOT NULL DEFAULT 0,
  peer_validation_score NUMERIC NOT NULL DEFAULT 0,
  cross_border_collab_score NUMERIC NOT NULL DEFAULT 0,
  research_output_score NUMERIC NOT NULL DEFAULT 0,
  composite_trust_score NUMERIC NOT NULL DEFAULT 0,
  rank_position INTEGER,
  tier TEXT DEFAULT 'unrated',
  period TEXT NOT NULL DEFAULT 'current',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.institutional_trust_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view institutional trust"
  ON public.institutional_trust_index FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert institutional trust"
  ON public.institutional_trust_index FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_institutional_trust_institution ON public.institutional_trust_index(institution_id);
CREATE INDEX idx_institutional_trust_composite ON public.institutional_trust_index(composite_trust_score DESC);
CREATE INDEX idx_institutional_trust_period ON public.institutional_trust_index(period);

-- ============================================================
-- UPGRADE 3: AI Funding Intelligence (predictions table)
-- ============================================================

CREATE TABLE public.funding_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  prediction_type TEXT NOT NULL,
  risk_score NUMERIC DEFAULT 0,
  confidence NUMERIC DEFAULT 0,
  predicted_outcome TEXT,
  factors JSONB DEFAULT '[]',
  recommendation TEXT,
  severity TEXT DEFAULT 'low',
  flagged_issues JSONB DEFAULT '[]',
  model_version TEXT DEFAULT 'v1',
  computed_by UUID,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active'
);

ALTER TABLE public.funding_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view predictions"
  ON public.funding_predictions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert predictions"
  ON public.funding_predictions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_funding_predictions_entity ON public.funding_predictions(entity_type, entity_id);
CREATE INDEX idx_funding_predictions_type ON public.funding_predictions(prediction_type);
CREATE INDEX idx_funding_predictions_risk ON public.funding_predictions(risk_score DESC);

-- ============================================================
-- UPGRADE 5: Research Asset Registry
-- ============================================================

CREATE TABLE public.research_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  asset_type TEXT NOT NULL DEFAULT 'research_output',
  linked_milestone_id UUID,
  linked_experiment_id UUID REFERENCES public.experiment_sessions(id),
  reproducibility_hash TEXT,
  validation_status TEXT NOT NULL DEFAULT 'pending',
  validation_count INTEGER DEFAULT 0,
  valuation_score NUMERIC DEFAULT 0,
  valuation_currency TEXT DEFAULT 'PKR',
  ip_status TEXT DEFAULT 'open',
  licensing_terms JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.research_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own research assets"
  ON public.research_assets FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Authenticated can view validated assets"
  ON public.research_assets FOR SELECT
  TO authenticated
  USING (validation_status = 'validated');

CREATE POLICY "Users can insert own research assets"
  ON public.research_assets FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own research assets"
  ON public.research_assets FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE INDEX idx_research_assets_creator ON public.research_assets(creator_id);
CREATE INDEX idx_research_assets_status ON public.research_assets(validation_status);
CREATE INDEX idx_research_assets_type ON public.research_assets(asset_type);
CREATE INDEX idx_research_assets_valuation ON public.research_assets(valuation_score DESC);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.institutional_trust_index;
ALTER PUBLICATION supabase_realtime ADD TABLE public.funding_predictions;
