
-- Capital Flow Efficiency Metrics
CREATE TABLE IF NOT EXISTS public.capital_flow_efficiency_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  average_release_time NUMERIC(8,2) DEFAULT 0,
  average_lock_duration NUMERIC(8,2) DEFAULT 0,
  capital_velocity_index NUMERIC(5,2) DEFAULT 0,
  stagnation_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capital_flow_efficiency_metrics ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read capital flow" ON public.capital_flow_efficiency_metrics FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_capital_flow_inst ON public.capital_flow_efficiency_metrics(institution_id, generated_at DESC);

-- Capital Bottlenecks
CREATE TABLE IF NOT EXISTS public.capital_bottlenecks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  institution_id UUID,
  bottleneck_type TEXT NOT NULL,
  bottleneck_score NUMERIC(5,2) DEFAULT 0,
  estimated_capital_delay NUMERIC(8,2) DEFAULT 0,
  suggested_resolution TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capital_bottlenecks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read capital bottlenecks" ON public.capital_bottlenecks FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_capital_bottleneck_proj ON public.capital_bottlenecks(project_id);

-- Funding Allocation Insights
CREATE TABLE IF NOT EXISTS public.funding_allocation_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  high_efficiency_projects INT DEFAULT 0,
  low_efficiency_projects INT DEFAULT 0,
  capital_risk_clusters JSONB DEFAULT '[]',
  optimization_suggestions JSONB DEFAULT '[]',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.funding_allocation_insights ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read funding insights" ON public.funding_allocation_insights FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_funding_insights_inst ON public.funding_allocation_insights(institution_id, generated_at DESC);

-- Capital Risk Predictions
CREATE TABLE IF NOT EXISTS public.capital_risk_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID NOT NULL,
  project_id UUID,
  predicted_lock_extension_days NUMERIC(5,2) DEFAULT 0,
  dispute_probability NUMERIC(5,4) DEFAULT 0,
  capital_exposure_risk_score NUMERIC(5,2) DEFAULT 0,
  confidence_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capital_risk_predictions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read capital risk" ON public.capital_risk_predictions FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_capital_risk_milestone ON public.capital_risk_predictions(milestone_id);

-- Capital Simulation Results
CREATE TABLE IF NOT EXISTS public.capital_simulation_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  simulation_type TEXT NOT NULL,
  institution_id UUID NOT NULL,
  simulated_parameter_changes JSONB DEFAULT '{}',
  projected_capital_velocity_change NUMERIC(5,2) DEFAULT 0,
  projected_dispute_impact NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capital_simulation_results ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read capital sim" ON public.capital_simulation_results FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Institution Capital Health
CREATE TABLE IF NOT EXISTS public.institution_capital_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  liquidity_efficiency_score NUMERIC(5,2) DEFAULT 0,
  dispute_impact_score NUMERIC(5,2) DEFAULT 0,
  release_consistency_score NUMERIC(5,2) DEFAULT 0,
  capital_velocity_score NUMERIC(5,2) DEFAULT 0,
  overall_capital_health NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institution_capital_health ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read capital health" ON public.institution_capital_health FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_capital_health_inst ON public.institution_capital_health(institution_id, generated_at DESC);

-- Capital Governance Flags
CREATE TABLE IF NOT EXISTS public.capital_governance_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  institution_id UUID,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capital_governance_flags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read capital flags" ON public.capital_governance_flags FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_capital_flags_entity ON public.capital_governance_flags(entity_type, entity_id);
