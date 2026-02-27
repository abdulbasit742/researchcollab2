
-- Multi-Layer Academic Impact Engine (MAIE) scores
CREATE TABLE public.maie_impact_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  citation_quality_index numeric DEFAULT 0,
  funding_impact_score numeric DEFAULT 0,
  execution_impact_score numeric DEFAULT 0,
  policy_impact_index numeric DEFAULT 0,
  commercialization_impact_index numeric DEFAULT 0,
  cross_discipline_impact_index numeric DEFAULT 0,
  institutional_contribution_score numeric DEFAULT 0,
  longitudinal_consistency_index numeric DEFAULT 0,
  educational_impact_score numeric DEFAULT 0,
  open_science_contribution numeric DEFAULT 0,
  overall_maie numeric DEFAULT 0,
  field_normalized boolean DEFAULT false,
  normalization_field text,
  global_equity_weight numeric DEFAULT 1.0,
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.maie_impact_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maie_owner" ON public.maie_impact_scores FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "maie_read" ON public.maie_impact_scores FOR SELECT TO authenticated USING (true);

-- Citation quality detail records
CREATE TABLE public.citation_quality_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid REFERENCES public.research_paper_index(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  journal_quality_weight numeric DEFAULT 1.0,
  cross_discipline_weight numeric DEFAULT 0,
  industry_citation_weight numeric DEFAULT 0,
  policy_citation_weight numeric DEFAULT 0,
  patent_citation_weight numeric DEFAULT 0,
  international_diversity_weight numeric DEFAULT 0,
  self_citation_penalty numeric DEFAULT 0,
  citation_velocity_decay numeric DEFAULT 0,
  citation_concentration_penalty numeric DEFAULT 0,
  computed_cqi numeric DEFAULT 0,
  last_computed_at timestamptz DEFAULT now()
);
ALTER TABLE public.citation_quality_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cqd_owner" ON public.citation_quality_details FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cqd_read" ON public.citation_quality_details FOR SELECT TO authenticated USING (true);

-- Policy impact tracking
CREATE TABLE public.policy_impact_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  paper_id uuid REFERENCES public.research_paper_index(id) ON DELETE SET NULL,
  impact_type text NOT NULL,
  policy_document_title text,
  issuing_body text,
  country_code text,
  citation_date date,
  impact_level text DEFAULT 'local',
  verification_status text DEFAULT 'unverified',
  evidence_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.policy_impact_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pir_owner" ON public.policy_impact_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pir_read" ON public.policy_impact_records FOR SELECT TO authenticated USING (true);

-- Anti-manipulation detection logs
CREATE TABLE public.citation_manipulation_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid,
  target_paper_id uuid REFERENCES public.research_paper_index(id) ON DELETE SET NULL,
  flag_type text NOT NULL,
  severity text DEFAULT 'low',
  description text,
  evidence jsonb DEFAULT '{}',
  pattern_data jsonb DEFAULT '{}',
  detected_at timestamptz DEFAULT now(),
  status text DEFAULT 'open',
  reviewed_by uuid,
  resolved_at timestamptz
);
ALTER TABLE public.citation_manipulation_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cmf_read" ON public.citation_manipulation_flags FOR SELECT TO authenticated USING (true);

-- Field normalization reference data
CREATE TABLE public.field_normalization_baselines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name text NOT NULL UNIQUE,
  avg_citation_density numeric DEFAULT 0,
  avg_funding_norm numeric DEFAULT 0,
  avg_grant_size numeric DEFAULT 0,
  commercialization_likelihood numeric DEFAULT 0,
  typical_h_index_senior numeric DEFAULT 0,
  typical_funding_volume numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.field_normalization_baselines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fnb_read" ON public.field_normalization_baselines FOR SELECT TO authenticated USING (true);

-- Global equity weighting config
CREATE TABLE public.global_equity_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  country_code text,
  institution_tier text,
  funding_normalization_factor numeric DEFAULT 1.0,
  citation_normalization_factor numeric DEFAULT 1.0,
  emerging_market_boost numeric DEFAULT 0,
  underrepresented_domain_boost numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.global_equity_weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gew_read" ON public.global_equity_weights FOR SELECT TO authenticated USING (true);

-- Impact evolution history (for dashboard)
CREATE TABLE public.impact_evolution_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  citation_quality_index numeric DEFAULT 0,
  funding_impact_score numeric DEFAULT 0,
  execution_impact_score numeric DEFAULT 0,
  commercialization_impact numeric DEFAULT 0,
  policy_impact numeric DEFAULT 0,
  overall_maie numeric DEFAULT 0,
  domain_at_snapshot text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.impact_evolution_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ies_owner" ON public.impact_evolution_snapshots FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ies_read" ON public.impact_evolution_snapshots FOR SELECT TO authenticated USING (true);
