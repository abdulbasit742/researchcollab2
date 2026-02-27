
-- =====================================================
-- CAREER INTELLIGENCE & ACCELERATION ENGINE (CIAE)
-- =====================================================

-- 1. Professional Trajectory Map (Section 1)
CREATE TABLE IF NOT EXISTS public.career_trajectory_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_evolution JSONB DEFAULT '[]',
  funding_progression JSONB DEFAULT '[]',
  institutional_mobility JSONB DEFAULT '[]',
  domain_specialization_shifts JSONB DEFAULT '[]',
  patent_startup_milestones JSONB DEFAULT '[]',
  industry_deployment_timeline JSONB DEFAULT '[]',
  collaboration_expansion JSONB DEFAULT '[]',
  trust_score_evolution JSONB DEFAULT '[]',
  innovation_intensity_trend JSONB DEFAULT '[]',
  compliance_stability_history JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Skill Mastery Progression (Section 2)
CREATE TABLE IF NOT EXISTS public.skill_mastery_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  mastery_level TEXT DEFAULT 'beginner',
  project_application_count INTEGER DEFAULT 0,
  complexity_score NUMERIC DEFAULT 0,
  cross_domain_integration NUMERIC DEFAULT 0,
  industry_validation_count INTEGER DEFAULT 0,
  grant_utilization_count INTEGER DEFAULT 0,
  peer_evaluation_avg NUMERIC DEFAULT 0,
  reproducibility_evidence NUMERIC DEFAULT 0,
  retention_score NUMERIC DEFAULT 0,
  composite_mastery NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

-- 3. Funding Ladder Intelligence (Section 3)
CREATE TABLE IF NOT EXISTS public.funding_ladder_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  funding_stage TEXT NOT NULL,
  grant_id UUID,
  role TEXT,
  amount NUMERIC DEFAULT 0,
  cross_border BOOLEAN DEFAULT false,
  institution_id UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  success BOOLEAN DEFAULT true,
  ai_next_step_suggestion TEXT
);

-- 4. Professional Leverage Index (Section 4)
CREATE TABLE IF NOT EXISTS public.professional_leverage_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_uniqueness NUMERIC DEFAULT 0,
  funding_independence NUMERIC DEFAULT 0,
  collaboration_network_strength NUMERIC DEFAULT 0,
  institutional_recognition NUMERIC DEFAULT 0,
  patent_commercialization NUMERIC DEFAULT 0,
  startup_equity NUMERIC DEFAULT 0,
  domain_authority NUMERIC DEFAULT 0,
  industry_deployment NUMERIC DEFAULT 0,
  compliance_reliability NUMERIC DEFAULT 0,
  composite_leverage NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 5. Global Mobility Intelligence (Section 5)
CREATE TABLE IF NOT EXISTS public.global_mobility_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cross_border_compat NUMERIC DEFAULT 0,
  domain_demand_by_region JSONB DEFAULT '{}',
  institutional_transfer_prob NUMERIC DEFAULT 0,
  international_collab_readiness NUMERIC DEFAULT 0,
  global_funding_eligibility NUMERIC DEFAULT 0,
  cultural_adaptability NUMERIC DEFAULT 0,
  composite_mobility NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 6. Longitudinal Stability Index (Section 6)
CREATE TABLE IF NOT EXISTS public.career_stability_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  funding_volatility NUMERIC DEFAULT 0,
  project_completion_consistency NUMERIC DEFAULT 0,
  collaboration_continuity NUMERIC DEFAULT 0,
  skill_focus_stability NUMERIC DEFAULT 0,
  domain_coherence NUMERIC DEFAULT 0,
  integrity_stability NUMERIC DEFAULT 0,
  reputation_volatility NUMERIC DEFAULT 0,
  composite_stability NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 7. Career Risk Monitor (Section 7)
CREATE TABLE IF NOT EXISTS public.career_risk_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  risk_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  description TEXT,
  mitigation_suggestion TEXT,
  metrics JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN DEFAULT false
);

-- 8. Career Path Simulation (Section 10)
CREATE TABLE IF NOT EXISTS public.career_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  scenario TEXT NOT NULL,
  parameters JSONB DEFAULT '{}',
  funding_prob_change NUMERIC DEFAULT 0,
  trust_impact NUMERIC DEFAULT 0,
  leverage_change NUMERIC DEFAULT 0,
  risk_impact NUMERIC DEFAULT 0,
  opportunity_growth NUMERIC DEFAULT 0,
  explanation TEXT,
  simulated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Compounding Growth Snapshots (Section 14)
CREATE TABLE IF NOT EXISTS public.career_growth_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  projection_years INTEGER NOT NULL DEFAULT 1,
  domain_mastery_projection NUMERIC DEFAULT 0,
  funding_progression_curve NUMERIC DEFAULT 0,
  trust_accumulation_curve NUMERIC DEFAULT 0,
  leverage_growth_projection NUMERIC DEFAULT 0,
  composite_growth NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Brand vs Capability Panel (Section 12)
CREATE TABLE IF NOT EXISTS public.brand_vs_capability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand_visibility_score NUMERIC DEFAULT 0,
  capability_score NUMERIC DEFAULT 0,
  brand_driven_growth_pct NUMERIC DEFAULT 0,
  capability_driven_growth_pct NUMERIC DEFAULT 0,
  recommendation TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.career_trajectory_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_mastery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_ladder_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_leverage_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_mobility_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_stability_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_risk_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_growth_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_vs_capability ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Auth read career_traj" ON public.career_trajectory_map FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read skill_mastery" ON public.skill_mastery_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read funding_ladder" ON public.funding_ladder_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read leverage_idx" ON public.professional_leverage_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read mobility" ON public.global_mobility_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read career_stab" ON public.career_stability_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read career_risk" ON public.career_risk_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read career_sim" ON public.career_simulations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read career_proj" ON public.career_growth_projections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read brand_cap" ON public.brand_vs_capability FOR SELECT TO authenticated USING (true);

-- Insert policies
CREATE POLICY "Auth insert career_traj" ON public.career_trajectory_map FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert skill_mastery" ON public.skill_mastery_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert funding_ladder" ON public.funding_ladder_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert leverage_idx" ON public.professional_leverage_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert mobility" ON public.global_mobility_intelligence FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert career_stab" ON public.career_stability_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert career_risk" ON public.career_risk_signals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert career_sim" ON public.career_simulations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert career_proj" ON public.career_growth_projections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert brand_cap" ON public.brand_vs_capability FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies
CREATE POLICY "Auth update career_traj" ON public.career_trajectory_map FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update skill_mastery" ON public.skill_mastery_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update leverage_idx" ON public.professional_leverage_index FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update mobility" ON public.global_mobility_intelligence FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update career_stab" ON public.career_stability_index FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update brand_cap" ON public.brand_vs_capability FOR UPDATE TO authenticated USING (true);
