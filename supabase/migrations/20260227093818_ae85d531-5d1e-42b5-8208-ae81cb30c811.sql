
-- =====================================================
-- GLOBAL GRANT LIFECYCLE INTELLIGENCE SYSTEM (GGLIS)
-- + GLOBAL ACADEMIC COLLABORATION INTELLIGENCE GRAPH (GACIG)
-- =====================================================

-- 1. Grant Lifecycle Stages (immutable log)
CREATE TABLE public.grant_lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID NOT NULL,
  stage TEXT NOT NULL, -- proposal_submission, peer_review, approval, escrow_lock, milestone_planning, active_execution, deliverable_submission, compliance_review, publication_output, commercialization, closure_audit
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  institution_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Grant Performance Metrics
CREATE TABLE public.grant_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID NOT NULL,
  pi_user_id UUID NOT NULL,
  milestone_completion_rate NUMERIC DEFAULT 0,
  on_time_delivery_pct NUMERIC DEFAULT 0,
  budget_efficiency_ratio NUMERIC DEFAULT 0,
  cost_to_output_ratio NUMERIC DEFAULT 0,
  publication_yield_ratio NUMERIC DEFAULT 0,
  patent_conversion_rate NUMERIC DEFAULT 0,
  commercialization_likelihood NUMERIC DEFAULT 0,
  compliance_reliability NUMERIC DEFAULT 0,
  cross_institution_strength NUMERIC DEFAULT 0,
  risk_exposure_index NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Grant Reliability Score (per PI)
CREATE TABLE public.grant_reliability_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  overall_grs NUMERIC DEFAULT 0,
  milestone_punctuality NUMERIC DEFAULT 0,
  budget_variance NUMERIC DEFAULT 0,
  renewal_success NUMERIC DEFAULT 0,
  deliverable_acceptance NUMERIC DEFAULT 0,
  compliance_audit_score NUMERIC DEFAULT 0,
  sponsor_satisfaction NUMERIC DEFAULT 0,
  dispute_history_score NUMERIC DEFAULT 0,
  reporting_consistency NUMERIC DEFAULT 0,
  escrow_adherence NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Institutional Funding Intelligence
CREATE TABLE public.institutional_funding_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  total_active_grants INTEGER DEFAULT 0,
  department_distribution JSONB DEFAULT '{}',
  completion_pct_by_dept JSONB DEFAULT '{}',
  budget_variance_heatmap JSONB DEFAULT '{}',
  sponsor_diversification_index NUMERIC DEFAULT 0,
  renewal_probability NUMERIC DEFAULT 0,
  risk_cluster_alerts JSONB DEFAULT '[]',
  funding_dependency_concentration NUMERIC DEFAULT 0,
  multi_year_stability_projection NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Grant Fraud & Anomaly Flags
CREATE TABLE public.grant_anomaly_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID,
  pi_user_id UUID,
  anomaly_type TEXT NOT NULL, -- budget_inflation, milestone_delay_loop, compliance_repeat, deliverable_inflation, citation_without_deliverable, sponsor_pi_collusion, ghost_milestone
  severity TEXT NOT NULL DEFAULT 'medium',
  evidence JSONB DEFAULT '{}',
  ai_confidence NUMERIC DEFAULT 0,
  human_reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Grant Impact Forecasts
CREATE TABLE public.grant_impact_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID NOT NULL,
  completion_probability NUMERIC DEFAULT 0,
  publication_yield_probability NUMERIC DEFAULT 0,
  commercialization_probability NUMERIC DEFAULT 0,
  budget_overrun_risk NUMERIC DEFAULT 0,
  renewal_success_probability NUMERIC DEFAULT 0,
  policy_adoption_probability NUMERIC DEFAULT 0,
  explanation JSONB DEFAULT '{}',
  model_version TEXT DEFAULT 'v1',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Grant Discipline Normalization
CREATE TABLE public.grant_discipline_norms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipline TEXT NOT NULL UNIQUE,
  avg_funding_amount NUMERIC DEFAULT 0,
  avg_publication_cycle_months NUMERIC DEFAULT 0,
  patent_likelihood NUMERIC DEFAULT 0,
  regulatory_burden_factor NUMERIC DEFAULT 1,
  grant_size_norm NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- GLOBAL ACADEMIC COLLABORATION INTELLIGENCE GRAPH (GACIG)
-- =====================================================

-- 8. Collaboration Nodes
CREATE TABLE public.collaboration_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type TEXT NOT NULL, -- pi, co_pi, researcher, institution, research_center, sponsor, industry_partner, government_agency, grant_program, domain_cluster
  entity_id UUID,
  entity_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Collaboration Edges (weighted)
CREATE TABLE public.collaboration_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID NOT NULL REFERENCES public.collaboration_nodes(id),
  target_node_id UUID NOT NULL REFERENCES public.collaboration_nodes(id),
  total_joint_funding NUMERIC DEFAULT 0,
  shared_grant_count INTEGER DEFAULT 0,
  milestone_punctuality_rate NUMERIC DEFAULT 0,
  budget_compliance_rate NUMERIC DEFAULT 0,
  publication_yield NUMERIC DEFAULT 0,
  patent_output NUMERIC DEFAULT 0,
  renewal_rate NUMERIC DEFAULT 0,
  cross_institution_distance NUMERIC DEFAULT 0,
  dispute_history_flag BOOLEAN DEFAULT false,
  collaboration_years NUMERIC DEFAULT 0,
  cross_discipline_depth NUMERIC DEFAULT 0,
  industry_engagement NUMERIC DEFAULT 0,
  edge_strength NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Collaboration Trust Scores (per pair)
CREATE TABLE public.collaboration_trust_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL,
  user_b_id UUID NOT NULL,
  overall_cts NUMERIC DEFAULT 0,
  milestone_performance NUMERIC DEFAULT 0,
  budget_efficiency NUMERIC DEFAULT 0,
  renewal_success NUMERIC DEFAULT 0,
  deliverable_acceptance NUMERIC DEFAULT 0,
  compliance_clean NUMERIC DEFAULT 0,
  multi_year_continuity NUMERIC DEFAULT 0,
  sponsor_feedback NUMERIC DEFAULT 0,
  cross_domain_effectiveness NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_a_id, user_b_id)
);

-- 11. Collaboration Stability Index
CREATE TABLE public.collaboration_stability_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL,
  user_b_id UUID NOT NULL,
  avg_years_active NUMERIC DEFAULT 0,
  grant_renewal_continuity NUMERIC DEFAULT 0,
  publication_frequency_stability NUMERIC DEFAULT 0,
  budget_deviation_trend NUMERIC DEFAULT 0,
  punctuality_improvement NUMERIC DEFAULT 0,
  decline_risk NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Collaboration Diversity Index
CREATE TABLE public.collaboration_diversity_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  geographic_diversity NUMERIC DEFAULT 0,
  institutional_diversity NUMERIC DEFAULT 0,
  domain_diversity NUMERIC DEFAULT 0,
  funding_body_diversity NUMERIC DEFAULT 0,
  industry_inclusion NUMERIC DEFAULT 0,
  overall_cdi NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Collaboration Evolution Events
CREATE TABLE public.collaboration_evolution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL,
  user_b_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- first_grant, milestone_breakthrough, renewal, domain_expansion, funding_growth, decline_detected
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Domain Cluster Intelligence
CREATE TABLE public.domain_cluster_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_name TEXT NOT NULL,
  domains TEXT[] DEFAULT '{}',
  institution_ids UUID[] DEFAULT '{}',
  total_funding NUMERIC DEFAULT 0,
  avg_performance NUMERIC DEFAULT 0,
  growth_rate NUMERIC DEFAULT 0,
  trust_density NUMERIC DEFAULT 0,
  is_emerging BOOLEAN DEFAULT false,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.grant_lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_reliability_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_funding_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_anomaly_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_impact_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_discipline_norms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_stability_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_diversity_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_evolution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_cluster_intelligence ENABLE ROW LEVEL SECURITY;

-- RLS Policies: authenticated read access
CREATE POLICY "Authenticated users can read grant lifecycle events" ON public.grant_lifecycle_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read grant performance metrics" ON public.grant_performance_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read grant reliability scores" ON public.grant_reliability_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read institutional funding intelligence" ON public.institutional_funding_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read grant anomaly flags" ON public.grant_anomaly_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read grant impact forecasts" ON public.grant_impact_forecasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read grant discipline norms" ON public.grant_discipline_norms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read collaboration nodes" ON public.collaboration_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read collaboration edges" ON public.collaboration_edges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read collaboration trust scores" ON public.collaboration_trust_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read collaboration stability index" ON public.collaboration_stability_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read collaboration diversity index" ON public.collaboration_diversity_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read collaboration evolution events" ON public.collaboration_evolution_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read domain cluster intelligence" ON public.domain_cluster_intelligence FOR SELECT TO authenticated USING (true);

-- Write policies for own data
CREATE POLICY "Users can insert grant lifecycle events" ON public.grant_lifecycle_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can insert grant performance metrics" ON public.grant_performance_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() = pi_user_id);
CREATE POLICY "Users can manage own grant reliability" ON public.grant_reliability_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert grant anomaly flags" ON public.grant_anomaly_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can insert grant impact forecasts" ON public.grant_impact_forecasts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can insert collaboration nodes" ON public.collaboration_nodes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can insert collaboration edges" ON public.collaboration_edges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can insert collaboration trust scores" ON public.collaboration_trust_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "Users can insert collaboration stability" ON public.collaboration_stability_index FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "Users can insert collaboration diversity" ON public.collaboration_diversity_index FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert collaboration evolution events" ON public.collaboration_evolution_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "Users can insert institutional funding intel" ON public.institutional_funding_intelligence FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can insert domain cluster intelligence" ON public.domain_cluster_intelligence FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read discipline norms" ON public.grant_discipline_norms FOR SELECT TO anon USING (true);
