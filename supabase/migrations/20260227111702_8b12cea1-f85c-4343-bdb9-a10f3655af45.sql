
-- EOEE: Enterprise Operating Ecosystem Engine

-- 1. Enterprise Profiles
CREATE TABLE public.eoee_enterprise_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  core_domains TEXT[] DEFAULT '{}',
  rd_investment NUMERIC DEFAULT 0,
  active_innovation_projects INTEGER DEFAULT 0,
  funding_participation NUMERIC DEFAULT 0,
  startup_partnerships INTEGER DEFAULT 0,
  institutional_collaborations INTEGER DEFAULT 0,
  patent_portfolio INTEGER DEFAULT 0,
  industry_pilots INTEGER DEFAULT 0,
  trust_index NUMERIC DEFAULT 0,
  compliance_score NUMERIC DEFAULT 0,
  cross_border_operations INTEGER DEFAULT 0,
  economic_contribution NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Innovation Pipeline
CREATE TABLE public.eoee_innovation_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES public.eoee_enterprise_profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  stage TEXT NOT NULL DEFAULT 'idea_intake',
  domain TEXT,
  funding_allocated NUMERIC DEFAULT 0,
  linked_startup_id UUID,
  linked_institution_id UUID,
  patent_filed BOOLEAN DEFAULT false,
  market_expansion_target TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Corporate Trust Index
CREATE TABLE public.eoee_trust_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES public.eoee_enterprise_profiles(id) NOT NULL,
  contract_fulfillment_rate NUMERIC DEFAULT 0,
  milestone_punctuality NUMERIC DEFAULT 0,
  funding_compliance NUMERIC DEFAULT 0,
  dispute_frequency NUMERIC DEFAULT 0,
  institutional_endorsements INTEGER DEFAULT 0,
  startup_success_rate NUMERIC DEFAULT 0,
  cross_border_reliability NUMERIC DEFAULT 0,
  longitudinal_stability NUMERIC DEFAULT 0,
  composite_trust NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Collaboration Hub
CREATE TABLE public.eoee_collaboration_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES public.eoee_enterprise_profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  call_type TEXT DEFAULT 'rd_collaboration',
  required_skills TEXT[] DEFAULT '{}',
  funding_terms JSONB DEFAULT '{}',
  escrow_milestones JSONB DEFAULT '[]',
  invited_institutions JSONB DEFAULT '[]',
  invited_startups JSONB DEFAULT '[]',
  status TEXT DEFAULT 'open',
  proposals_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Cross-Border Expansion
CREATE TABLE public.eoee_cross_border (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES public.eoee_enterprise_profiles(id) NOT NULL,
  target_region TEXT NOT NULL,
  regulatory_exposure JSONB DEFAULT '{}',
  funding_jurisdiction_compatibility NUMERIC DEFAULT 0,
  institutional_partnership_density NUMERIC DEFAULT 0,
  talent_mobility_readiness NUMERIC DEFAULT 0,
  compliance_alignment NUMERIC DEFAULT 0,
  innovation_export_capacity NUMERIC DEFAULT 0,
  trust_corridor_strength NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Procurement
CREATE TABLE public.eoee_procurement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES public.eoee_enterprise_profiles(id) NOT NULL,
  rfp_title TEXT NOT NULL,
  description TEXT,
  vendor_trust_threshold NUMERIC DEFAULT 0,
  escrow_milestones JSONB DEFAULT '[]',
  compliance_requirements JSONB DEFAULT '[]',
  institutional_linkage UUID,
  status TEXT DEFAULT 'open',
  vendor_performance JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Startup Partnerships
CREATE TABLE public.eoee_startup_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES public.eoee_enterprise_profiles(id) NOT NULL,
  startup_name TEXT NOT NULL,
  partnership_type TEXT DEFAULT 'scouting',
  equity_terms JSONB DEFAULT '{}',
  joint_venture_proposal JSONB DEFAULT '{}',
  pilot_funding NUMERIC DEFAULT 0,
  milestone_capital_released NUMERIC DEFAULT 0,
  founder_trust_score NUMERIC DEFAULT 0,
  post_pilot_performance JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Compliance Dashboard
CREATE TABLE public.eoee_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES public.eoee_enterprise_profiles(id) NOT NULL,
  regulatory_certifications JSONB DEFAULT '[]',
  audit_history JSONB DEFAULT '[]',
  funding_compliance_rate NUMERIC DEFAULT 0,
  data_governance_maturity NUMERIC DEFAULT 0,
  ip_protection_compliance NUMERIC DEFAULT 0,
  esg_metrics JSONB DEFAULT '{}',
  dispute_resolution_efficiency NUMERIC DEFAULT 0,
  policy_alignment_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Talent Pipeline
CREATE TABLE public.eoee_talent_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES public.eoee_enterprise_profiles(id) NOT NULL,
  skill_demand_gaps JSONB DEFAULT '[]',
  recruitment_success_rate NUMERIC DEFAULT 0,
  institutional_partnerships JSONB DEFAULT '[]',
  internship_pipeline INTEGER DEFAULT 0,
  alumni_startup_collaborations INTEGER DEFAULT 0,
  cross_border_hiring JSONB DEFAULT '{}',
  skill_diversification JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Enterprise Impact Index
CREATE TABLE public.eoee_impact_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES public.eoee_enterprise_profiles(id) NOT NULL,
  innovation_output NUMERIC DEFAULT 0,
  startup_incubation_success NUMERIC DEFAULT 0,
  funding_efficiency NUMERIC DEFAULT 0,
  cross_border_expansion NUMERIC DEFAULT 0,
  trust_density NUMERIC DEFAULT 0,
  institutional_collaboration_strength NUMERIC DEFAULT 0,
  compliance_stability NUMERIC DEFAULT 0,
  economic_multiplier NUMERIC DEFAULT 0,
  composite_impact NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Industry Cluster Mapping
CREATE TABLE public.eoee_industry_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES public.eoee_enterprise_profiles(id) NOT NULL,
  cluster_name TEXT NOT NULL,
  cluster_type TEXT DEFAULT 'collaboration',
  connected_enterprises JSONB DEFAULT '[]',
  startup_partnerships JSONB DEFAULT '[]',
  institutional_bridges JSONB DEFAULT '[]',
  funding_corridors JSONB DEFAULT '[]',
  patent_co_development JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Enterprise Memory
CREATE TABLE public.eoee_enterprise_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES public.eoee_enterprise_profiles(id) NOT NULL,
  memory_type TEXT NOT NULL DEFAULT 'innovation_wave',
  title TEXT NOT NULL,
  description TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  impact_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.eoee_enterprise_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eoee_innovation_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eoee_trust_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eoee_collaboration_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eoee_cross_border ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eoee_procurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eoee_startup_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eoee_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eoee_talent_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eoee_impact_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eoee_industry_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eoee_enterprise_memory ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "eoee_profiles_read" ON public.eoee_enterprise_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "eoee_pipeline_read" ON public.eoee_innovation_pipeline FOR SELECT TO authenticated USING (true);
CREATE POLICY "eoee_trust_read" ON public.eoee_trust_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "eoee_collab_read" ON public.eoee_collaboration_calls FOR SELECT TO authenticated USING (true);
CREATE POLICY "eoee_xborder_read" ON public.eoee_cross_border FOR SELECT TO authenticated USING (true);
CREATE POLICY "eoee_procurement_read" ON public.eoee_procurement FOR SELECT TO authenticated USING (true);
CREATE POLICY "eoee_startup_read" ON public.eoee_startup_partnerships FOR SELECT TO authenticated USING (true);
CREATE POLICY "eoee_compliance_read" ON public.eoee_compliance FOR SELECT TO authenticated USING (true);
CREATE POLICY "eoee_talent_read" ON public.eoee_talent_pipeline FOR SELECT TO authenticated USING (true);
CREATE POLICY "eoee_impact_read" ON public.eoee_impact_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "eoee_clusters_read" ON public.eoee_industry_clusters FOR SELECT TO authenticated USING (true);
CREATE POLICY "eoee_memory_read" ON public.eoee_enterprise_memory FOR SELECT TO authenticated USING (true);

-- Insert policies
CREATE POLICY "eoee_profiles_insert" ON public.eoee_enterprise_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "eoee_pipeline_insert" ON public.eoee_innovation_pipeline FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "eoee_trust_insert" ON public.eoee_trust_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "eoee_collab_insert" ON public.eoee_collaboration_calls FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "eoee_xborder_insert" ON public.eoee_cross_border FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "eoee_procurement_insert" ON public.eoee_procurement FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "eoee_startup_insert" ON public.eoee_startup_partnerships FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "eoee_compliance_insert" ON public.eoee_compliance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "eoee_talent_insert" ON public.eoee_talent_pipeline FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "eoee_impact_insert" ON public.eoee_impact_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "eoee_clusters_insert" ON public.eoee_industry_clusters FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "eoee_memory_insert" ON public.eoee_enterprise_memory FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies
CREATE POLICY "eoee_profiles_update" ON public.eoee_enterprise_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "eoee_pipeline_update" ON public.eoee_innovation_pipeline FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "eoee_collab_update" ON public.eoee_collaboration_calls FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "eoee_procurement_update" ON public.eoee_procurement FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "eoee_startup_update" ON public.eoee_startup_partnerships FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
