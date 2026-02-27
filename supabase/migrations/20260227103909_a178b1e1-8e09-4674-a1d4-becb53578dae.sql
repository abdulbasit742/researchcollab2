
-- =====================================================
-- AI COLLABORATION & TEAM INTELLIGENCE ENGINE (ACTIE)
-- =====================================================

-- 1. Team Compatibility Matrix (Section 1)
CREATE TABLE IF NOT EXISTS public.team_compatibility_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID,
  project_id UUID,
  skill_coverage NUMERIC DEFAULT 0,
  skill_overlap_efficiency NUMERIC DEFAULT 0,
  domain_complementarity NUMERIC DEFAULT 0,
  execution_reliability_alignment NUMERIC DEFAULT 0,
  funding_experience_alignment NUMERIC DEFAULT 0,
  collaboration_history NUMERIC DEFAULT 0,
  trust_edge_strength NUMERIC DEFAULT 0,
  institutional_diversity NUMERIC DEFAULT 0,
  geographic_compatibility NUMERIC DEFAULT 0,
  risk_tolerance_alignment NUMERIC DEFAULT 0,
  time_availability_overlap NUMERIC DEFAULT 0,
  communication_stability NUMERIC DEFAULT 0,
  composite_compatibility NUMERIC DEFAULT 0,
  member_ids UUID[] DEFAULT '{}',
  explanation JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Skill Complementarity Analysis (Section 2)
CREATE TABLE IF NOT EXISTS public.skill_complementarity_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  team_id UUID,
  missing_skills TEXT[] DEFAULT '{}',
  redundant_skills TEXT[] DEFAULT '{}',
  underrepresented_domains TEXT[] DEFAULT '{}',
  cross_domain_synergy NUMERIC DEFAULT 0,
  patent_capability NUMERIC DEFAULT 0,
  industry_deployment_expertise NUMERIC DEFAULT 0,
  grant_writing_experience NUMERIC DEFAULT 0,
  compliance_expertise NUMERIC DEFAULT 0,
  recommended_additions JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Execution Success Predictions (Section 3)
CREATE TABLE IF NOT EXISTS public.execution_success_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID,
  project_id UUID,
  milestone_completion_prob NUMERIC DEFAULT 0,
  budget_compliance_prob NUMERIC DEFAULT 0,
  grant_renewal_prob NUMERIC DEFAULT 0,
  patent_filing_prob NUMERIC DEFAULT 0,
  startup_formation_prob NUMERIC DEFAULT 0,
  industry_adoption_prob NUMERIC DEFAULT 0,
  dispute_risk NUMERIC DEFAULT 0,
  collaboration_longevity_prob NUMERIC DEFAULT 0,
  composite_success_prob NUMERIC DEFAULT 0,
  risk_breakdown JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Funding Eligibility Analysis (Section 4)
CREATE TABLE IF NOT EXISTS public.funding_eligibility_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID,
  grant_id UUID,
  grant_eligible BOOLEAN DEFAULT false,
  institutional_rules_met BOOLEAN DEFAULT false,
  cross_border_restrictions TEXT[] DEFAULT '{}',
  compliance_requirements_met BOOLEAN DEFAULT false,
  budget_category_compat NUMERIC DEFAULT 0,
  funding_history_credibility NUMERIC DEFAULT 0,
  sponsor_trust_threshold_met BOOLEAN DEFAULT false,
  alerts TEXT[] DEFAULT '{}',
  analysis_details JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Cross-Border Team Intelligence (Section 5)
CREATE TABLE IF NOT EXISTS public.cross_border_team_intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID,
  jurisdiction_compatibility NUMERIC DEFAULT 0,
  regulatory_conflicts TEXT[] DEFAULT '{}',
  ip_ownership_implications TEXT,
  currency_exposure_risk NUMERIC DEFAULT 0,
  timezone_friction NUMERIC DEFAULT 0,
  cultural_stability NUMERIC DEFAULT 0,
  historical_success_rate NUMERIC DEFAULT 0,
  composite_cross_border NUMERIC DEFAULT 0,
  summary JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Innovation Synergy Detection (Section 7)
CREATE TABLE IF NOT EXISTS public.innovation_synergy_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID,
  cross_domain_overlap NUMERIC DEFAULT 0,
  historical_breakthroughs INTEGER DEFAULT 0,
  patent_synergy NUMERIC DEFAULT 0,
  startup_formation_prob NUMERIC DEFAULT 0,
  industry_cross_pollination NUMERIC DEFAULT 0,
  emerging_convergence NUMERIC DEFAULT 0,
  innovation_multiplier NUMERIC DEFAULT 1,
  details JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Team Risk Dashboard (Section 8)
CREATE TABLE IF NOT EXISTS public.team_risk_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID,
  execution_risk NUMERIC DEFAULT 0,
  funding_volatility NUMERIC DEFAULT 0,
  compliance_risk NUMERIC DEFAULT 0,
  reputation_instability NUMERIC DEFAULT 0,
  collaboration_fragility NUMERIC DEFAULT 0,
  single_member_reliance NUMERIC DEFAULT 0,
  institutional_dependency NUMERIC DEFAULT 0,
  composite_risk NUMERIC DEFAULT 0,
  vulnerabilities JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Role Optimization (Section 9)
CREATE TABLE IF NOT EXISTS public.team_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  user_id UUID NOT NULL,
  assigned_role TEXT NOT NULL,
  role_fit_score NUMERIC DEFAULT 0,
  alternative_roles TEXT[] DEFAULT '{}',
  strengths JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. AI Team Formation Suggestions (Section 10)
CREATE TABLE IF NOT EXISTS public.ai_team_formation_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID NOT NULL,
  project_description TEXT,
  required_skills TEXT[] DEFAULT '{}',
  ideal_team_size INTEGER DEFAULT 3,
  domain_diversity NUMERIC DEFAULT 0,
  funding_alignment NUMERIC DEFAULT 0,
  trust_threshold NUMERIC DEFAULT 50,
  institutional_composition JSONB DEFAULT '{}',
  geographic_diversity NUMERIC DEFAULT 0,
  commercialization_potential NUMERIC DEFAULT 0,
  suggested_members JSONB DEFAULT '[]',
  reasoning JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Historical Team Performance (Section 12)
CREATE TABLE IF NOT EXISTS public.historical_team_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID,
  project_id UUID,
  member_ids UUID[] DEFAULT '{}',
  skill_composition JSONB DEFAULT '{}',
  domain_diversity_score NUMERIC DEFAULT 0,
  execution_success BOOLEAN DEFAULT false,
  cross_border_stable BOOLEAN DEFAULT false,
  grant_renewed BOOLEAN DEFAULT false,
  patent_converted BOOLEAN DEFAULT false,
  completion_time_days INTEGER,
  budget_variance NUMERIC DEFAULT 0,
  dispute_count INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Team Evolution Monitor (Section 14)
CREATE TABLE IF NOT EXISTS public.team_evolution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  description TEXT,
  metrics JSONB DEFAULT '{}',
  intervention_recommended BOOLEAN DEFAULT false,
  intervention_details TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_compatibility_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_complementarity_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_success_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_eligibility_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_border_team_intel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_synergy_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_risk_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_team_formation_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_team_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_evolution_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Read
CREATE POLICY "Auth read team_compat" ON public.team_compatibility_matrix FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read skill_comp" ON public.skill_complementarity_analysis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read exec_pred" ON public.execution_success_predictions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read fund_elig" ON public.funding_eligibility_analysis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read cross_border" ON public.cross_border_team_intel FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read innov_syn" ON public.innovation_synergy_analysis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read team_risk" ON public.team_risk_analysis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read role_assign" ON public.team_role_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read ai_team" ON public.ai_team_formation_suggestions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read hist_perf" ON public.historical_team_performance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read team_evol" ON public.team_evolution_events FOR SELECT TO authenticated USING (true);

-- RLS Policies: Insert
CREATE POLICY "Auth insert team_compat" ON public.team_compatibility_matrix FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert skill_comp" ON public.skill_complementarity_analysis FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert exec_pred" ON public.execution_success_predictions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert fund_elig" ON public.funding_eligibility_analysis FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert cross_border" ON public.cross_border_team_intel FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert innov_syn" ON public.innovation_synergy_analysis FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert team_risk" ON public.team_risk_analysis FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert role_assign" ON public.team_role_assignments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert ai_team" ON public.ai_team_formation_suggestions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert hist_perf" ON public.historical_team_performance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert team_evol" ON public.team_evolution_events FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies
CREATE POLICY "Auth update team_compat" ON public.team_compatibility_matrix FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update team_risk" ON public.team_risk_analysis FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update role_assign" ON public.team_role_assignments FOR UPDATE TO authenticated USING (true);
