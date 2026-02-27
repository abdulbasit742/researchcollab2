
-- RPIE: Regional Professional Intelligence Engine

-- 1. Regional Professional Hubs
CREATE TABLE public.rpie_regional_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_name TEXT NOT NULL,
  hub_type TEXT NOT NULL DEFAULT 'city',
  country_code TEXT,
  state_province TEXT,
  city TEXT,
  economic_zone TEXT,
  parent_hub_id UUID REFERENCES public.rpie_regional_hubs(id),
  domain_specializations JSONB DEFAULT '[]',
  skill_density_map JSONB DEFAULT '{}',
  institutional_presence JSONB DEFAULT '[]',
  funding_inflow NUMERIC DEFAULT 0,
  startup_formation_rate NUMERIC DEFAULT 0,
  patent_activity INTEGER DEFAULT 0,
  industry_integration_score NUMERIC DEFAULT 0,
  trust_density NUMERIC DEFAULT 0,
  economic_output NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  managed_by_institution_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Regional Skill Mapping
CREATE TABLE public.rpie_skill_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES public.rpie_regional_hubs(id) NOT NULL,
  skill_name TEXT NOT NULL,
  concentration_score NUMERIC DEFAULT 0,
  gap_severity TEXT DEFAULT 'none',
  growth_rate NUMERIC DEFAULT 0,
  saturation_index NUMERIC DEFAULT 0,
  talent_import_ratio NUMERIC DEFAULT 0,
  talent_export_ratio NUMERIC DEFAULT 0,
  institutional_specialization JSONB DEFAULT '[]',
  cross_domain_integration JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Funding Cluster Intelligence
CREATE TABLE public.rpie_funding_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES public.rpie_regional_hubs(id) NOT NULL,
  period TEXT NOT NULL,
  grant_volume NUMERIC DEFAULT 0,
  venture_funding_density NUMERIC DEFAULT 0,
  institutional_funding_performance NUMERIC DEFAULT 0,
  cross_border_capital_flow NUMERIC DEFAULT 0,
  industry_rd_spending NUMERIC DEFAULT 0,
  public_funding_concentration NUMERIC DEFAULT 0,
  domain_specific_acceleration JSONB DEFAULT '{}',
  trend_data JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Startup Ecosystem Analytics
CREATE TABLE public.rpie_startup_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES public.rpie_regional_hubs(id) NOT NULL,
  period TEXT NOT NULL,
  formation_rate NUMERIC DEFAULT 0,
  survival_rate NUMERIC DEFAULT 0,
  funding_stage_progression JSONB DEFAULT '{}',
  patent_to_product_conversion NUMERIC DEFAULT 0,
  industry_pilot_success NUMERIC DEFAULT 0,
  founder_trust_density NUMERIC DEFAULT 0,
  cross_border_scaling_rate NUMERIC DEFAULT 0,
  exit_events INTEGER DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Cross-Border Corridor Mapping
CREATE TABLE public.rpie_cross_border_corridors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_hub_id UUID REFERENCES public.rpie_regional_hubs(id) NOT NULL,
  target_hub_id UUID REFERENCES public.rpie_regional_hubs(id) NOT NULL,
  collaboration_strength NUMERIC DEFAULT 0,
  funding_exchange_volume NUMERIC DEFAULT 0,
  institutional_bridges INTEGER DEFAULT 0,
  startup_scaling_pathways INTEGER DEFAULT 0,
  skill_mobility_flow NUMERIC DEFAULT 0,
  policy_alignment_score NUMERIC DEFAULT 0,
  trust_weighted_strength NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Regional Trust Density Index
CREATE TABLE public.rpie_trust_density (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES public.rpie_regional_hubs(id) NOT NULL,
  avg_trust_index NUMERIC DEFAULT 0,
  execution_reliability_rate NUMERIC DEFAULT 0,
  funding_compliance_stability NUMERIC DEFAULT 0,
  collaboration_longevity NUMERIC DEFAULT 0,
  dispute_frequency NUMERIC DEFAULT 0,
  institutional_integrity_score NUMERIC DEFAULT 0,
  period TEXT NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Industry Integration Panel
CREATE TABLE public.rpie_industry_integration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES public.rpie_regional_hubs(id) NOT NULL,
  corporate_rd_presence JSONB DEFAULT '[]',
  industry_academia_collaboration NUMERIC DEFAULT 0,
  patent_commercialization_rate NUMERIC DEFAULT 0,
  pilot_deployment_activity INTEGER DEFAULT 0,
  industry_funding_inflow NUMERIC DEFAULT 0,
  innovation_adoption_velocity NUMERIC DEFAULT 0,
  period TEXT NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Regional Performance Index
CREATE TABLE public.rpie_performance_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES public.rpie_regional_hubs(id) NOT NULL,
  innovation_output_score NUMERIC DEFAULT 0,
  funding_efficiency_score NUMERIC DEFAULT 0,
  startup_survival_score NUMERIC DEFAULT 0,
  trust_density_score NUMERIC DEFAULT 0,
  cross_border_connectivity_score NUMERIC DEFAULT 0,
  skill_specialization_depth NUMERIC DEFAULT 0,
  institutional_collaboration_strength NUMERIC DEFAULT 0,
  economic_impact_multiplier NUMERIC DEFAULT 1,
  composite_score NUMERIC DEFAULT 0,
  rank INTEGER,
  period TEXT NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Talent Retention & Mobility
CREATE TABLE public.rpie_talent_mobility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES public.rpie_regional_hubs(id) NOT NULL,
  talent_inflow INTEGER DEFAULT 0,
  talent_outflow INTEGER DEFAULT 0,
  brain_drain_risk TEXT DEFAULT 'low',
  institutional_transfers INTEGER DEFAULT 0,
  cross_border_migration INTEGER DEFAULT 0,
  domain_specialization_migration JSONB DEFAULT '{}',
  funding_relocation_volume NUMERIC DEFAULT 0,
  period TEXT NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Longitudinal Regional Memory
CREATE TABLE public.rpie_regional_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES public.rpie_regional_hubs(id) NOT NULL,
  memory_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  impact_data JSONB DEFAULT '{}',
  related_entities JSONB DEFAULT '[]',
  archived_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Collaboration Matching
CREATE TABLE public.rpie_collaboration_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES public.rpie_regional_hubs(id) NOT NULL,
  match_type TEXT NOT NULL,
  entity_a_id UUID NOT NULL,
  entity_a_type TEXT NOT NULL,
  entity_b_id UUID NOT NULL,
  entity_b_type TEXT NOT NULL,
  compatibility_score NUMERIC DEFAULT 0,
  skill_complementarity JSONB DEFAULT '{}',
  trust_alignment NUMERIC DEFAULT 0,
  suggested_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'suggested'
);

-- RLS
ALTER TABLE public.rpie_regional_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpie_skill_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpie_funding_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpie_startup_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpie_cross_border_corridors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpie_trust_density ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpie_industry_integration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpie_performance_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpie_talent_mobility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpie_regional_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpie_collaboration_matches ENABLE ROW LEVEL SECURITY;

-- Read policies (authenticated users can read all regional data)
CREATE POLICY "rpie_hubs_read" ON public.rpie_regional_hubs FOR SELECT TO authenticated USING (true);
CREATE POLICY "rpie_skill_read" ON public.rpie_skill_mapping FOR SELECT TO authenticated USING (true);
CREATE POLICY "rpie_funding_read" ON public.rpie_funding_clusters FOR SELECT TO authenticated USING (true);
CREATE POLICY "rpie_startup_read" ON public.rpie_startup_analytics FOR SELECT TO authenticated USING (true);
CREATE POLICY "rpie_corridors_read" ON public.rpie_cross_border_corridors FOR SELECT TO authenticated USING (true);
CREATE POLICY "rpie_trust_read" ON public.rpie_trust_density FOR SELECT TO authenticated USING (true);
CREATE POLICY "rpie_industry_read" ON public.rpie_industry_integration FOR SELECT TO authenticated USING (true);
CREATE POLICY "rpie_perf_read" ON public.rpie_performance_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "rpie_talent_read" ON public.rpie_talent_mobility FOR SELECT TO authenticated USING (true);
CREATE POLICY "rpie_memory_read" ON public.rpie_regional_memory FOR SELECT TO authenticated USING (true);
CREATE POLICY "rpie_matches_read" ON public.rpie_collaboration_matches FOR SELECT TO authenticated USING (true);

-- Insert policies
CREATE POLICY "rpie_hubs_insert" ON public.rpie_regional_hubs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rpie_skill_insert" ON public.rpie_skill_mapping FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rpie_funding_insert" ON public.rpie_funding_clusters FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rpie_startup_insert" ON public.rpie_startup_analytics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rpie_corridors_insert" ON public.rpie_cross_border_corridors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rpie_trust_insert" ON public.rpie_trust_density FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rpie_industry_insert" ON public.rpie_industry_integration FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rpie_perf_insert" ON public.rpie_performance_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rpie_talent_insert" ON public.rpie_talent_mobility FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rpie_memory_insert" ON public.rpie_regional_memory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rpie_matches_insert" ON public.rpie_collaboration_matches FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies
CREATE POLICY "rpie_hubs_update" ON public.rpie_regional_hubs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rpie_matches_update" ON public.rpie_collaboration_matches FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
