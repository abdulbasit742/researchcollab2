
-- =====================================================
-- PROMPT 5: GLOBAL RESEARCH COMMERCIALIZATION & INNOVATION ENGINE (GRCIE)
-- PROMPT 6: INTELLIGENT RESEARCH DISCOVERY & PREDICTIVE KNOWLEDGE ENGINE (IRDPKE)
-- PROMPT 7: GLOBAL INSTITUTIONAL EXECUTION & INNOVATION RANKING ENGINE (GIEIRE)
-- =====================================================

-- 1. Patent Pipeline Tracking
CREATE TABLE public.patent_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_project_id UUID,
  grant_id UUID,
  institution_id UUID,
  title TEXT NOT NULL,
  filing_date DATE,
  grant_date DATE,
  patent_number TEXT,
  classification_codes TEXT[] DEFAULT '{}',
  co_inventors TEXT[] DEFAULT '{}',
  ownership_type TEXT DEFAULT 'institutional',
  licensing_status TEXT DEFAULT 'none',
  technology_readiness_level INTEGER DEFAULT 1,
  patent_family_ids UUID[] DEFAULT '{}',
  international_filings JSONB DEFAULT '[]',
  forward_citation_count INTEGER DEFAULT 0,
  industry_citation_count INTEGER DEFAULT 0,
  litigation_defense_success NUMERIC DEFAULT 0,
  commercial_adoption_score NUMERIC DEFAULT 0,
  market_penetration NUMERIC DEFAULT 0,
  technology_longevity_years NUMERIC DEFAULT 0,
  patent_quality_index NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Commercialization Conversion Metrics
CREATE TABLE public.commercialization_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_project_id UUID,
  patent_id UUID REFERENCES public.patent_pipeline(id),
  institution_id UUID,
  researcher_id UUID,
  time_publication_to_patent_days INTEGER,
  time_patent_to_licensing_days INTEGER,
  licensing_revenue NUMERIC DEFAULT 0,
  startup_formation_rate NUMERIC DEFAULT 0,
  venture_capital_attracted NUMERIC DEFAULT 0,
  product_deployment_days INTEGER,
  industry_pilot_success_rate NUMERIC DEFAULT 0,
  adoption_scale TEXT,
  revenue_per_research_dollar NUMERIC DEFAULT 0,
  commercial_survival_rate NUMERIC DEFAULT 0,
  rcci NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Startup & Spin-off Intelligence
CREATE TABLE public.research_startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  founding_date DATE,
  founding_team_ids UUID[] DEFAULT '{}',
  original_grant_id UUID,
  original_patent_id UUID REFERENCES public.patent_pipeline(id),
  institution_id UUID,
  venture_capital_raised NUMERIC DEFAULT 0,
  valuation_milestones JSONB DEFAULT '[]',
  revenue_growth JSONB DEFAULT '[]',
  survival_status TEXT DEFAULT 'active',
  exit_type TEXT,
  exit_date DATE,
  industry_adoption_footprint JSONB DEFAULT '{}',
  sector TEXT,
  region TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Innovation Cluster Map Data
CREATE TABLE public.innovation_cluster_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_name TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT,
  domains TEXT[] DEFAULT '{}',
  institution_ids UUID[] DEFAULT '{}',
  total_patents INTEGER DEFAULT 0,
  total_startups INTEGER DEFAULT 0,
  total_licensing_revenue NUMERIC DEFAULT 0,
  commercialization_density NUMERIC DEFAULT 0,
  cross_border_flow_score NUMERIC DEFAULT 0,
  growth_rate NUMERIC DEFAULT 0,
  is_emerging BOOLEAN DEFAULT false,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Innovation Risk & Failure Tracking
CREATE TABLE public.innovation_failure_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patent_id UUID REFERENCES public.patent_pipeline(id),
  startup_id UUID REFERENCES public.research_startups(id),
  failure_type TEXT NOT NULL,
  failure_date DATE,
  root_cause TEXT,
  lessons_learned TEXT,
  funding_exhausted BOOLEAN DEFAULT false,
  regulatory_rejection BOOLEAN DEFAULT false,
  market_adoption_failure BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Industry Influence Score
CREATE TABLE public.industry_influence_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  advisory_participation NUMERIC DEFAULT 0,
  licensing_revenue_contribution NUMERIC DEFAULT 0,
  corporate_rd_collaboration NUMERIC DEFAULT 0,
  joint_patent_ownership NUMERIC DEFAULT 0,
  industry_funding_diversity NUMERIC DEFAULT 0,
  technology_adoption_scale NUMERIC DEFAULT 0,
  overall_iis NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Research Discovery Search Index
CREATE TABLE public.research_discovery_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT,
  domains TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  citation_quality_score NUMERIC DEFAULT 0,
  funding_impact_score NUMERIC DEFAULT 0,
  grant_reliability_score NUMERIC DEFAULT 0,
  milestone_efficiency NUMERIC DEFAULT 0,
  patent_quality_score NUMERIC DEFAULT 0,
  commercialization_score NUMERIC DEFAULT 0,
  policy_influence_score NUMERIC DEFAULT 0,
  institutional_execution_score NUMERIC DEFAULT 0,
  collaboration_trust_score NUMERIC DEFAULT 0,
  innovation_yield NUMERIC DEFAULT 0,
  cross_discipline_influence NUMERIC DEFAULT 0,
  longitudinal_consistency NUMERIC DEFAULT 0,
  composite_rank_score NUMERIC DEFAULT 0,
  rank_explanation JSONB DEFAULT '{}',
  indexed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Research Trajectory Predictions
CREATE TABLE public.research_trajectory_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  citation_growth_forecast JSONB DEFAULT '{}',
  commercialization_probability NUMERIC DEFAULT 0,
  grant_renewal_likelihood NUMERIC DEFAULT 0,
  domain_expansion_potential NUMERIC DEFAULT 0,
  cross_border_collaboration_likelihood NUMERIC DEFAULT 0,
  policy_adoption_probability NUMERIC DEFAULT 0,
  funding_gap_risk NUMERIC DEFAULT 0,
  explanation JSONB DEFAULT '{}',
  model_version TEXT DEFAULT 'v1',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Emerging Domain Detection
CREATE TABLE public.emerging_domain_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  funding_concentration_shift NUMERIC DEFAULT 0,
  cross_discipline_convergence NUMERIC DEFAULT 0,
  patent_surge_rate NUMERIC DEFAULT 0,
  collaboration_cluster_formation NUMERIC DEFAULT 0,
  regional_acceleration JSONB DEFAULT '{}',
  confidence NUMERIC DEFAULT 0,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Knowledge Graph Connections
CREATE TABLE public.knowledge_graph_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  relationship_type TEXT NOT NULL,
  weight NUMERIC DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Funding Gap Intelligence
CREATE TABLE public.funding_gap_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  region TEXT,
  citation_density NUMERIC DEFAULT 0,
  funding_density NUMERIC DEFAULT 0,
  output_density NUMERIC DEFAULT 0,
  gap_type TEXT NOT NULL,
  severity NUMERIC DEFAULT 0,
  recommendation TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Institutional Execution Ranking
CREATE TABLE public.institutional_execution_ranking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  institution_name TEXT NOT NULL,
  overall_rank NUMERIC DEFAULT 0,
  research_impact_score NUMERIC DEFAULT 0,
  grant_execution_score NUMERIC DEFAULT 0,
  funding_efficiency_score NUMERIC DEFAULT 0,
  commercialization_impact_score NUMERIC DEFAULT 0,
  collaboration_strength_index NUMERIC DEFAULT 0,
  institutional_reliability_index NUMERIC DEFAULT 0,
  innovation_yield_ratio NUMERIC DEFAULT 0,
  policy_societal_influence NUMERIC DEFAULT 0,
  global_collaboration_diversity NUMERIC DEFAULT 0,
  longitudinal_stability NUMERIC DEFAULT 0,
  graduate_industry_placement NUMERIC DEFAULT 0,
  escrow_integrity_score NUMERIC DEFAULT 0,
  research_to_market_velocity NUMERIC DEFAULT 0,
  cross_discipline_integration NUMERIC DEFAULT 0,
  compliance_audit_integrity NUMERIC DEFAULT 0,
  weight_breakdown JSONB DEFAULT '{}',
  field_normalization_applied BOOLEAN DEFAULT false,
  ranking_period TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Ranking Manipulation Detection
CREATE TABLE public.ranking_manipulation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  manipulation_type TEXT NOT NULL,
  evidence JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'medium',
  ai_confidence NUMERIC DEFAULT 0,
  human_reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patent_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercialization_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_cluster_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_failure_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_influence_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_discovery_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_trajectory_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emerging_domain_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_graph_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_gap_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_execution_ranking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_manipulation_flags ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated read
CREATE POLICY "Auth read patent_pipeline" ON public.patent_pipeline FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read commercialization_metrics" ON public.commercialization_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read research_startups" ON public.research_startups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read innovation_cluster_map" ON public.innovation_cluster_map FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read innovation_failure_records" ON public.innovation_failure_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read industry_influence_scores" ON public.industry_influence_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read research_discovery_index" ON public.research_discovery_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read research_trajectory_predictions" ON public.research_trajectory_predictions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read emerging_domain_signals" ON public.emerging_domain_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read knowledge_graph_connections" ON public.knowledge_graph_connections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read funding_gap_intelligence" ON public.funding_gap_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read institutional_execution_ranking" ON public.institutional_execution_ranking FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read ranking_manipulation_flags" ON public.ranking_manipulation_flags FOR SELECT TO authenticated USING (true);

-- RLS: Write policies
CREATE POLICY "Auth insert patent_pipeline" ON public.patent_pipeline FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert commercialization_metrics" ON public.commercialization_metrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert research_startups" ON public.research_startups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert innovation_cluster_map" ON public.innovation_cluster_map FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert innovation_failure_records" ON public.innovation_failure_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert industry_influence_scores" ON public.industry_influence_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth insert research_discovery_index" ON public.research_discovery_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert research_trajectory_predictions" ON public.research_trajectory_predictions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert emerging_domain_signals" ON public.emerging_domain_signals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert knowledge_graph_connections" ON public.knowledge_graph_connections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert funding_gap_intelligence" ON public.funding_gap_intelligence FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert institutional_execution_ranking" ON public.institutional_execution_ranking FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert ranking_manipulation_flags" ON public.ranking_manipulation_flags FOR INSERT TO authenticated WITH CHECK (true);

-- Public read for innovation map and rankings
CREATE POLICY "Anon read innovation_cluster_map" ON public.innovation_cluster_map FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read institutional_execution_ranking" ON public.institutional_execution_ranking FOR SELECT TO anon USING (true);
