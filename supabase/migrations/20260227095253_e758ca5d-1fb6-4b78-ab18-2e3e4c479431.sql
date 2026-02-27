
-- =====================================================
-- PROMPT 10: ACADEMIC CAREER INTELLIGENCE & REPUTATION OS (ACIRO)
-- =====================================================

-- 1. Unified Academic Career Profiles
CREATE TABLE IF NOT EXISTS public.academic_career_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  verified_identity BOOLEAN DEFAULT false,
  current_institution_id UUID,
  historical_affiliations JSONB DEFAULT '[]',
  institutional_leadership_roles JSONB DEFAULT '[]',
  policy_advisory_roles JSONB DEFAULT '[]',
  industry_engagements JSONB DEFAULT '[]',
  mentorship_completions INTEGER DEFAULT 0,
  graduate_supervisions_completed INTEGER DEFAULT 0,
  grant_committee_participations INTEGER DEFAULT 0,
  governance_contributions JSONB DEFAULT '[]',
  career_start_date DATE,
  career_stage TEXT DEFAULT 'early',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Multi-Dimensional Reputation Score (MDRS)
CREATE TABLE IF NOT EXISTS public.multi_dimensional_reputation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  citation_quality_index NUMERIC DEFAULT 0,
  grant_reliability_score NUMERIC DEFAULT 0,
  funding_efficiency_score NUMERIC DEFAULT 0,
  commercialization_impact_score NUMERIC DEFAULT 0,
  reproducibility_reliability_index NUMERIC DEFAULT 0,
  collaboration_trust_score NUMERIC DEFAULT 0,
  institutional_contribution_score NUMERIC DEFAULT 0,
  policy_influence_score NUMERIC DEFAULT 0,
  open_science_contribution_score NUMERIC DEFAULT 0,
  compliance_integrity_score NUMERIC DEFAULT 0,
  longitudinal_stability_score NUMERIC DEFAULT 0,
  cross_discipline_influence_score NUMERIC DEFAULT 0,
  overall_mdrs NUMERIC DEFAULT 0,
  weight_breakdown JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Execution Reliability Profile
CREATE TABLE IF NOT EXISTS public.execution_reliability_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  on_time_milestone_pct NUMERIC DEFAULT 0,
  budget_variance_pct NUMERIC DEFAULT 0,
  grant_renewal_rate NUMERIC DEFAULT 0,
  deliverable_acceptance_pct NUMERIC DEFAULT 0,
  sponsor_satisfaction NUMERIC DEFAULT 0,
  escrow_integrity_compliance NUMERIC DEFAULT 0,
  dispute_count INTEGER DEFAULT 0,
  reporting_punctuality NUMERIC DEFAULT 0,
  audit_pass_rate NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Adaptability Index
CREATE TABLE IF NOT EXISTS public.adaptability_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cross_domain_participation NUMERIC DEFAULT 0,
  interdisciplinary_grants NUMERIC DEFAULT 0,
  collaboration_diversity NUMERIC DEFAULT 0,
  funding_body_diversity NUMERIC DEFAULT 0,
  geographic_spread NUMERIC DEFAULT 0,
  skill_evolution_rate NUMERIC DEFAULT 0,
  innovation_pivot_frequency NUMERIC DEFAULT 0,
  overall_adaptability NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Career Risk Indicators
CREATE TABLE IF NOT EXISTS public.career_risk_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  funding_dependency_risk NUMERIC DEFAULT 0,
  collaboration_concentration_risk NUMERIC DEFAULT 0,
  compliance_instability NUMERIC DEFAULT 0,
  publication_stagnation NUMERIC DEFAULT 0,
  innovation_decline NUMERIC DEFAULT 0,
  domain_obsolescence NUMERIC DEFAULT 0,
  high_grant_failure_cluster NUMERIC DEFAULT 0,
  reputation_volatility NUMERIC DEFAULT 0,
  overall_risk_level TEXT DEFAULT 'low',
  early_warnings JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Career Trajectory Snapshots
CREATE TABLE IF NOT EXISTS public.career_trajectory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  snapshot_date DATE NOT NULL,
  funding_total NUMERIC DEFAULT 0,
  active_grants INTEGER DEFAULT 0,
  publications_count INTEGER DEFAULT 0,
  patents_count INTEGER DEFAULT 0,
  startups_count INTEGER DEFAULT 0,
  collaboration_count INTEGER DEFAULT 0,
  domains TEXT[] DEFAULT '{}',
  industry_engagements INTEGER DEFAULT 0,
  compliance_score NUMERIC DEFAULT 0,
  overall_mdrs NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Academic Identity Exports
CREATE TABLE IF NOT EXISTS public.academic_identity_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  export_format TEXT NOT NULL DEFAULT 'json',
  export_data JSONB DEFAULT '{}',
  includes_reputation BOOLEAN DEFAULT true,
  includes_grants BOOLEAN DEFAULT true,
  includes_innovation BOOLEAN DEFAULT true,
  includes_collaboration BOOLEAN DEFAULT true,
  includes_compliance BOOLEAN DEFAULT true,
  verification_hash TEXT,
  exported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.academic_career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multi_dimensional_reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_reliability_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptability_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_risk_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_trajectory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_identity_exports ENABLE ROW LEVEL SECURITY;

-- RLS: Auth read
CREATE POLICY "Auth read academic_career_profiles" ON public.academic_career_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read mdrs" ON public.multi_dimensional_reputation_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read execution_reliability" ON public.execution_reliability_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read adaptability" ON public.adaptability_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read career_risk" ON public.career_risk_indicators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read career_trajectory" ON public.career_trajectory_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read identity_exports" ON public.academic_identity_exports FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- RLS: Auth insert
CREATE POLICY "Auth insert academic_career_profiles" ON public.academic_career_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert mdrs" ON public.multi_dimensional_reputation_scores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert execution_reliability" ON public.execution_reliability_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert adaptability" ON public.adaptability_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert career_risk" ON public.career_risk_indicators FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert career_trajectory" ON public.career_trajectory_snapshots FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert identity_exports" ON public.academic_identity_exports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
