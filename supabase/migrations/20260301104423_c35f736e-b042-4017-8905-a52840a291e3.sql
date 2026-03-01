
-- Platform Identity Config
CREATE TABLE IF NOT EXISTS public.platform_identity_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  positioning_statement TEXT NOT NULL DEFAULT 'Institutional Execution Infrastructure for structured accountability, capital coordination, and verified outcomes.',
  category_label TEXT NOT NULL DEFAULT 'Institutional Execution Infrastructure',
  value_proposition TEXT NOT NULL DEFAULT 'The only platform that unifies escrow-backed execution, trust-weighted governance, and verifiable institutional outcomes into a single coordinated system.',
  differentiation_points JSONB DEFAULT '["Escrow-backed milestone execution","Trust-weighted governance intelligence","Federation-ready multi-node architecture","Predictive execution orchestration","Accreditation-grade compliance reporting"]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_identity_config ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read identity config" ON public.platform_identity_config FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth update identity config" ON public.platform_identity_config FOR UPDATE USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed default row
INSERT INTO public.platform_identity_config (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- Competitive Positioning Matrix
CREATE TABLE IF NOT EXISTS public.competitive_positioning_matrix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_name TEXT NOT NULL,
  competitor_category TEXT DEFAULT 'general',
  execution_depth_score NUMERIC(5,2) DEFAULT 0,
  governance_score NUMERIC(5,2) DEFAULT 0,
  capital_integration_score NUMERIC(5,2) DEFAULT 0,
  compliance_score NUMERIC(5,2) DEFAULT 0,
  orchestration_score NUMERIC(5,2) DEFAULT 0,
  differentiation_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.competitive_positioning_matrix ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read competitive matrix" ON public.competitive_positioning_matrix FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Value Proof Metrics
CREATE TABLE IF NOT EXISTS public.value_proof_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID,
  completion_rate_improvement NUMERIC(5,2) DEFAULT 0,
  dispute_reduction_rate NUMERIC(5,2) DEFAULT 0,
  review_efficiency_gain NUMERIC(5,2) DEFAULT 0,
  execution_velocity_increase NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.value_proof_metrics ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read value proof" ON public.value_proof_metrics FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Impact Reports
CREATE TABLE IF NOT EXISTS public.impact_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  period TEXT NOT NULL,
  execution_growth NUMERIC(5,2) DEFAULT 0,
  governance_stability_change NUMERIC(5,2) DEFAULT 0,
  engagement_change NUMERIC(5,2) DEFAULT 0,
  certification_volume INT DEFAULT 0,
  compliance_improvement NUMERIC(5,2) DEFAULT 0,
  file_url TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.impact_reports ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read impact reports" ON public.impact_reports FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_impact_reports_inst ON public.impact_reports(institution_id, generated_at DESC);

-- Market Differentiation Insights
CREATE TABLE IF NOT EXISTS public.market_differentiation_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID,
  execution_strength_score NUMERIC(5,2) DEFAULT 0,
  governance_strength_score NUMERIC(5,2) DEFAULT 0,
  predictive_intelligence_score NUMERIC(5,2) DEFAULT 0,
  accreditation_depth_score NUMERIC(5,2) DEFAULT 0,
  federation_readiness_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.market_differentiation_insights ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read market diff" ON public.market_differentiation_insights FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
