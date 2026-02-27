
-- TWODE fix: create remaining tables and policies that failed

-- Check if tables exist and create only missing ones
DO $$ BEGIN
  -- Only create if twode_opportunities doesn't exist (meaning migration failed)
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'twode_opportunities') THEN
    RAISE NOTICE 'Tables do not exist, full migration needed';
  END IF;
END $$;

-- 1. Opportunities
CREATE TABLE IF NOT EXISTS public.twode_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_type TEXT NOT NULL DEFAULT 'grant',
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  required_skills TEXT[] DEFAULT '{}',
  trust_threshold NUMERIC DEFAULT 0,
  geographic_scope TEXT[] DEFAULT '{}',
  funding_structure JSONB DEFAULT '{}',
  timeline JSONB DEFAULT '{}',
  compliance_requirements JSONB DEFAULT '[]',
  expected_deliverables JSONB DEFAULT '[]',
  evaluation_criteria JSONB DEFAULT '[]',
  institutional_sponsor_id UUID,
  is_institutional BOOLEAN DEFAULT false,
  compliance_documents JSONB DEFAULT '[]',
  escrow_linked BOOLEAN DEFAULT false,
  require_domain_authority BOOLEAN DEFAULT false,
  require_funding_experience BOOLEAN DEFAULT false,
  require_institutional_verification BOOLEAN DEFAULT false,
  require_compliance_history BOOLEAN DEFAULT false,
  require_cross_border_clearance BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twode_distribution_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.twode_opportunities(id) NOT NULL,
  user_id UUID NOT NULL,
  skill_alignment_pct NUMERIC DEFAULT 0,
  domain_expertise_overlap NUMERIC DEFAULT 0,
  execution_reliability NUMERIC DEFAULT 0,
  funding_experience_match NUMERIC DEFAULT 0,
  trust_density_compatibility NUMERIC DEFAULT 0,
  institutional_affiliation_fit NUMERIC DEFAULT 0,
  cross_border_eligibility NUMERIC DEFAULT 0,
  collaboration_history_strength NUMERIC DEFAULT 0,
  past_outcome_performance NUMERIC DEFAULT 0,
  risk_compatibility NUMERIC DEFAULT 0,
  composite_rank NUMERIC DEFAULT 0,
  was_shown BOOLEAN DEFAULT false,
  was_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twode_match_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.twode_distribution_matches(id) NOT NULL,
  reason_summary TEXT NOT NULL,
  skill_match_detail JSONB DEFAULT '{}',
  trust_threshold_met BOOLEAN DEFAULT false,
  domain_alignment_detail TEXT,
  funding_compatibility_detail TEXT,
  geographic_relevance TEXT,
  institutional_fit_detail TEXT,
  risk_exposure_level TEXT DEFAULT 'low',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twode_cross_border_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.twode_opportunities(id) NOT NULL,
  target_region TEXT NOT NULL,
  jurisdiction_compatible BOOLEAN DEFAULT false,
  funding_eligible BOOLEAN DEFAULT false,
  export_control_clear BOOLEAN DEFAULT false,
  data_sharing_restrictions JSONB DEFAULT '{}',
  ip_legal_considerations TEXT,
  currency_constraints TEXT,
  checked_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twode_fair_distribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.twode_opportunities(id) NOT NULL,
  emerging_talent_exposure NUMERIC DEFAULT 0,
  regional_diversity_score NUMERIC DEFAULT 0,
  institutional_balance NUMERIC DEFAULT 0,
  domain_diversity NUMERIC DEFAULT 0,
  anti_monopoly_cap_applied BOOLEAN DEFAULT false,
  anti_elite_clustering BOOLEAN DEFAULT false,
  newcomer_access_pct NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twode_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.twode_opportunities(id) NOT NULL,
  application_quality_rate NUMERIC DEFAULT 0,
  milestone_success_rate NUMERIC DEFAULT 0,
  funding_completion NUMERIC DEFAULT 0,
  collaboration_longevity NUMERIC DEFAULT 0,
  startup_formation INTEGER DEFAULT 0,
  patent_conversion INTEGER DEFAULT 0,
  industry_deployment INTEGER DEFAULT 0,
  cross_border_success NUMERIC DEFAULT 0,
  trust_growth_impact NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twode_manipulation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_type TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  target_user_id UUID,
  target_opportunity_id UUID,
  evidence JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twode_impact_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.twode_opportunities(id) NOT NULL,
  execution_success NUMERIC DEFAULT 0,
  funding_efficiency NUMERIC DEFAULT 0,
  economic_multiplier NUMERIC DEFAULT 0,
  innovation_output NUMERIC DEFAULT 0,
  cross_border_collaboration NUMERIC DEFAULT 0,
  institutional_integration NUMERIC DEFAULT 0,
  long_term_stability NUMERIC DEFAULT 0,
  trust_growth_impact NUMERIC DEFAULT 0,
  composite_impact NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twode_ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.twode_opportunities(id) NOT NULL,
  suggestion_type TEXT NOT NULL,
  suggestion_text TEXT NOT NULL,
  reasoning TEXT,
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twode_user_dashboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_gap_suggestions JSONB DEFAULT '[]',
  trust_upgrade_suggestions JSONB DEFAULT '[]',
  funding_readiness_alerts JSONB DEFAULT '[]',
  institutional_compatibility JSONB DEFAULT '[]',
  cross_border_alerts JSONB DEFAULT '[]',
  risk_warnings JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.twode_global_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  opportunity_density INTEGER DEFAULT 0,
  funding_corridor_strength NUMERIC DEFAULT 0,
  domain_clusters JSONB DEFAULT '[]',
  cross_border_routes JSONB DEFAULT '[]',
  institutional_hiring_concentration NUMERIC DEFAULT 0,
  startup_cofounder_hotspots JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.twode_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twode_distribution_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twode_match_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twode_cross_border_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twode_fair_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twode_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twode_manipulation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twode_impact_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twode_ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twode_user_dashboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twode_global_map ENABLE ROW LEVEL SECURITY;

-- Read policies (use IF NOT EXISTS pattern via DO block)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_opps_read') THEN
    EXECUTE 'CREATE POLICY "twode_opps_read" ON public.twode_opportunities FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_matches_read') THEN
    EXECUTE 'CREATE POLICY "twode_matches_read" ON public.twode_distribution_matches FOR SELECT TO authenticated USING (user_id = auth.uid())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_explain_read') THEN
    EXECUTE 'CREATE POLICY "twode_explain_read" ON public.twode_match_explanations FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_xborder_read') THEN
    EXECUTE 'CREATE POLICY "twode_xborder_read" ON public.twode_cross_border_checks FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_fair_read') THEN
    EXECUTE 'CREATE POLICY "twode_fair_read" ON public.twode_fair_distribution FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_perf_read') THEN
    EXECUTE 'CREATE POLICY "twode_perf_read" ON public.twode_performance FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_flags_read') THEN
    EXECUTE 'CREATE POLICY "twode_flags_read" ON public.twode_manipulation_flags FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_impact_read') THEN
    EXECUTE 'CREATE POLICY "twode_impact_read" ON public.twode_impact_index FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_ai_read') THEN
    EXECUTE 'CREATE POLICY "twode_ai_read" ON public.twode_ai_suggestions FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_dash_read') THEN
    EXECUTE 'CREATE POLICY "twode_dash_read" ON public.twode_user_dashboard FOR SELECT TO authenticated USING (user_id = auth.uid())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_map_read') THEN
    EXECUTE 'CREATE POLICY "twode_map_read" ON public.twode_global_map FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- Insert policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_opps_insert') THEN
    EXECUTE 'CREATE POLICY "twode_opps_insert" ON public.twode_opportunities FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_matches_insert') THEN
    EXECUTE 'CREATE POLICY "twode_matches_insert" ON public.twode_distribution_matches FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_explain_insert') THEN
    EXECUTE 'CREATE POLICY "twode_explain_insert" ON public.twode_match_explanations FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_xborder_insert') THEN
    EXECUTE 'CREATE POLICY "twode_xborder_insert" ON public.twode_cross_border_checks FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_fair_insert') THEN
    EXECUTE 'CREATE POLICY "twode_fair_insert" ON public.twode_fair_distribution FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_perf_insert') THEN
    EXECUTE 'CREATE POLICY "twode_perf_insert" ON public.twode_performance FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_flags_insert') THEN
    EXECUTE 'CREATE POLICY "twode_flags_insert" ON public.twode_manipulation_flags FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_impact_insert') THEN
    EXECUTE 'CREATE POLICY "twode_impact_insert" ON public.twode_impact_index FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_ai_insert') THEN
    EXECUTE 'CREATE POLICY "twode_ai_insert" ON public.twode_ai_suggestions FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_dash_insert') THEN
    EXECUTE 'CREATE POLICY "twode_dash_insert" ON public.twode_user_dashboard FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_map_insert') THEN
    EXECUTE 'CREATE POLICY "twode_map_insert" ON public.twode_global_map FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
END $$;

-- Update policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_opps_update') THEN
    EXECUTE 'CREATE POLICY "twode_opps_update" ON public.twode_opportunities FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_matches_update') THEN
    EXECUTE 'CREATE POLICY "twode_matches_update" ON public.twode_distribution_matches FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_flags_update') THEN
    EXECUTE 'CREATE POLICY "twode_flags_update" ON public.twode_manipulation_flags FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'twode_ai_update') THEN
    EXECUTE 'CREATE POLICY "twode_ai_update" ON public.twode_ai_suggestions FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;
