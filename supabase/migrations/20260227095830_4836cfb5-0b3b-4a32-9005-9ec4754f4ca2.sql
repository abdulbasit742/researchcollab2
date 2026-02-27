
-- =====================================================
-- PROMPT 12: GLOBAL KNOWLEDGE EVOLUTION & HISTORICAL INTELLIGENCE ENGINE (GKEHIE)
-- =====================================================

-- 1. Longitudinal Research Data (year-indexed archive)
CREATE TABLE IF NOT EXISTS public.longitudinal_research_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  domain TEXT,
  country_code TEXT,
  institution_id TEXT,
  grants_count INTEGER DEFAULT 0,
  publications_count INTEGER DEFAULT 0,
  patents_count INTEGER DEFAULT 0,
  startups_formed INTEGER DEFAULT 0,
  venture_capital NUMERIC DEFAULT 0,
  funding_amount NUMERIC DEFAULT 0,
  compliance_score NUMERIC DEFAULT 0,
  collaboration_density NUMERIC DEFAULT 0,
  policy_citations INTEGER DEFAULT 0,
  commercialization_revenue NUMERIC DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Domain Lifecycle Phases
CREATE TABLE IF NOT EXISTS public.domain_lifecycle_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  phase TEXT NOT NULL,
  phase_start_year INTEGER NOT NULL,
  phase_end_year INTEGER,
  funding_velocity NUMERIC DEFAULT 0,
  citation_velocity NUMERIC DEFAULT 0,
  patent_velocity NUMERIC DEFAULT 0,
  startup_formation_rate NUMERIC DEFAULT 0,
  cross_discipline_convergence NUMERIC DEFAULT 0,
  policy_adoption_curve NUMERIC DEFAULT 0,
  evidence JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Paradigm Shift Events
CREATE TABLE IF NOT EXISTS public.paradigm_shift_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT,
  country_code TEXT,
  shift_type TEXT NOT NULL,
  shift_year INTEGER NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'moderate',
  affected_domains TEXT[] DEFAULT '{}',
  affected_institutions TEXT[] DEFAULT '{}',
  explanation TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Institutional Trajectory Snapshots
CREATE TABLE IF NOT EXISTS public.institutional_trajectory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  funding_total NUMERIC DEFAULT 0,
  patent_conversion_rate NUMERIC DEFAULT 0,
  commercialization_survival NUMERIC DEFAULT 0,
  collaboration_network_size INTEGER DEFAULT 0,
  compliance_stability NUMERIC DEFAULT 0,
  innovation_yield NUMERIC DEFAULT 0,
  domain_specializations TEXT[] DEFAULT '{}',
  graduate_placement_rate NUMERIC DEFAULT 0,
  trajectory_direction TEXT DEFAULT 'stable',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Generational Influence Records
CREATE TABLE IF NOT EXISTS public.generational_influence_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_user_id TEXT NOT NULL,
  mentee_user_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL DEFAULT 'phd_supervision',
  domain TEXT,
  start_year INTEGER,
  end_year INTEGER,
  grant_co_evolution_score NUMERIC DEFAULT 0,
  citation_inheritance NUMERIC DEFAULT 0,
  domain_leadership_transfer BOOLEAN DEFAULT false,
  innovation_continuity NUMERIC DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Knowledge Survival Index
CREATE TABLE IF NOT EXISTS public.knowledge_survival_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  domain TEXT,
  research_cited_after_10yr_pct NUMERIC DEFAULT 0,
  patent_survival_15yr_pct NUMERIC DEFAULT 0,
  startup_survival_5yr_pct NUMERIC DEFAULT 0,
  domain_persistence_index NUMERIC DEFAULT 0,
  policy_impact_longevity NUMERIC DEFAULT 0,
  reproducibility_consistency NUMERIC DEFAULT 0,
  overall_survival_score NUMERIC DEFAULT 0,
  period TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Innovation Wave Events
CREATE TABLE IF NOT EXISTS public.innovation_wave_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  wave_name TEXT NOT NULL,
  wave_phase TEXT NOT NULL,
  start_year INTEGER NOT NULL,
  peak_year INTEGER,
  current_year INTEGER,
  funding_acceleration NUMERIC DEFAULT 0,
  patent_acceleration NUMERIC DEFAULT 0,
  startup_surge NUMERIC DEFAULT 0,
  countries_affected TEXT[] DEFAULT '{}',
  evidence JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Historical Funding Regimes
CREATE TABLE IF NOT EXISTS public.historical_funding_regimes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  regime_name TEXT NOT NULL,
  regime_type TEXT NOT NULL,
  start_year INTEGER NOT NULL,
  end_year INTEGER,
  trigger_event TEXT,
  funding_change_pct NUMERIC DEFAULT 0,
  domains_affected TEXT[] DEFAULT '{}',
  policy_drivers TEXT[] DEFAULT '{}',
  impact_on_innovation NUMERIC DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Long-Term Sustainability Scores
CREATE TABLE IF NOT EXISTS public.long_term_sustainability_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  patent_survival_score NUMERIC DEFAULT 0,
  startup_longevity_score NUMERIC DEFAULT 0,
  institutional_resilience NUMERIC DEFAULT 0,
  funding_continuity NUMERIC DEFAULT 0,
  domain_reinvention NUMERIC DEFAULT 0,
  collaboration_stability NUMERIC DEFAULT 0,
  compliance_consistency NUMERIC DEFAULT 0,
  overall_sustainability NUMERIC DEFAULT 0,
  period TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.longitudinal_research_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_lifecycle_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paradigm_shift_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_trajectory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generational_influence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_survival_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_wave_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_funding_regimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.long_term_sustainability_scores ENABLE ROW LEVEL SECURITY;

-- RLS: Auth read all
CREATE POLICY "Auth read longitudinal_data" ON public.longitudinal_research_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read domain_lifecycle" ON public.domain_lifecycle_phases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read paradigm_shifts" ON public.paradigm_shift_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read institutional_trajectory" ON public.institutional_trajectory_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read generational_influence" ON public.generational_influence_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read knowledge_survival" ON public.knowledge_survival_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read innovation_waves" ON public.innovation_wave_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read funding_regimes" ON public.historical_funding_regimes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read sustainability_scores" ON public.long_term_sustainability_scores FOR SELECT TO authenticated USING (true);

-- RLS: Auth insert
CREATE POLICY "Auth insert longitudinal_data" ON public.longitudinal_research_data FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert domain_lifecycle" ON public.domain_lifecycle_phases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert paradigm_shifts" ON public.paradigm_shift_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert institutional_trajectory" ON public.institutional_trajectory_snapshots FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert generational_influence" ON public.generational_influence_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert knowledge_survival" ON public.knowledge_survival_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert innovation_waves" ON public.innovation_wave_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert funding_regimes" ON public.historical_funding_regimes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert sustainability_scores" ON public.long_term_sustainability_scores FOR INSERT TO authenticated WITH CHECK (true);

-- Anon read for public intelligence
CREATE POLICY "Anon read paradigm_shifts" ON public.paradigm_shift_events FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read innovation_waves" ON public.innovation_wave_events FOR SELECT TO anon USING (true);
