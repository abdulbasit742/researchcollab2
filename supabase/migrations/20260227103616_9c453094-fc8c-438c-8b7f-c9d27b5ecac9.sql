
-- =====================================================
-- INSTITUTIONAL INTELLIGENCE & MEDIA ENGINE (IIME)
-- =====================================================

-- 1. Institutional Operating Profile (Section 1)
CREATE TABLE IF NOT EXISTS public.institutional_operating_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  research_domains TEXT[] DEFAULT '{}',
  active_grants INTEGER DEFAULT 0,
  grant_success_rate NUMERIC DEFAULT 0,
  funding_diversity_index NUMERIC DEFAULT 0,
  patent_output INTEGER DEFAULT 0,
  startup_spinoffs INTEGER DEFAULT 0,
  industry_partnerships INTEGER DEFAULT 0,
  compliance_record NUMERIC DEFAULT 0,
  execution_reliability_index NUMERIC DEFAULT 0,
  institutional_trust_score NUMERIC DEFAULT 0,
  innovation_velocity_index NUMERIC DEFAULT 0,
  cross_border_collab_density NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id)
);

-- 2. Lab & Department Sub-Channels (Section 2)
CREATE TABLE IF NOT EXISTS public.institutional_sub_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  channel_type TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  domain_focus TEXT[] DEFAULT '{}',
  active_projects INTEGER DEFAULT 0,
  grant_portfolio_size INTEGER DEFAULT 0,
  milestone_completion_rate NUMERIC DEFAULT 0,
  collaboration_network_size INTEGER DEFAULT 0,
  talent_needs TEXT[] DEFAULT '{}',
  funding_calls INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Institutional Innovation Timeline (Section 3)
CREATE TABLE IF NOT EXISTS public.institutional_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  evidence_url TEXT,
  verified BOOLEAN DEFAULT false,
  event_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Institutional Impact Index (Section 4)
CREATE TABLE IF NOT EXISTS public.institutional_impact_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  funding_efficiency NUMERIC DEFAULT 0,
  execution_reliability NUMERIC DEFAULT 0,
  patent_to_product NUMERIC DEFAULT 0,
  startup_survival_rate NUMERIC DEFAULT 0,
  industry_adoption NUMERIC DEFAULT 0,
  cross_domain_innovation NUMERIC DEFAULT 0,
  research_reproducibility NUMERIC DEFAULT 0,
  compliance_integrity NUMERIC DEFAULT 0,
  talent_retention NUMERIC DEFAULT 0,
  international_collaboration NUMERIC DEFAULT 0,
  composite_iii NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id)
);

-- 5. Talent Flow Intelligence (Section 6)
CREATE TABLE IF NOT EXISTS public.institutional_talent_flow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  incoming_diversity NUMERIC DEFAULT 0,
  outgoing_brain_drain NUMERIC DEFAULT 0,
  alumni_startup_formation INTEGER DEFAULT 0,
  alumni_grant_success NUMERIC DEFAULT 0,
  alumni_industry_placement NUMERIC DEFAULT 0,
  cross_institution_mobility NUMERIC DEFAULT 0,
  domain_specialization_concentration NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id)
);

-- 6. Industry Integration Panel (Section 7)
CREATE TABLE IF NOT EXISTS public.institutional_industry_integration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  corporate_partnerships INTEGER DEFAULT 0,
  co_developed_patents INTEGER DEFAULT 0,
  joint_rd_labs INTEGER DEFAULT 0,
  pilot_deployments INTEGER DEFAULT 0,
  licensing_revenue NUMERIC DEFAULT 0,
  long_term_collaborations INTEGER DEFAULT 0,
  corporate_funding_dependence NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id)
);

-- 7. Institutional Media Publications (Section 9)
CREATE TABLE IF NOT EXISTS public.institutional_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  sub_channel_id UUID,
  post_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  media_url TEXT,
  linked_project_id UUID,
  linked_grant_id UUID,
  operational_data_ref JSONB DEFAULT '{}',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Cross-Institution Compatibility (Section 13)
CREATE TABLE IF NOT EXISTS public.institution_compatibility_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_a_id UUID NOT NULL,
  institution_b_id UUID NOT NULL,
  domain_overlap_pct NUMERIC DEFAULT 0,
  funding_alignment_pct NUMERIC DEFAULT 0,
  compliance_compat_pct NUMERIC DEFAULT 0,
  collab_history_score NUMERIC DEFAULT 0,
  startup_synergy NUMERIC DEFAULT 0,
  patent_co_ownership_compat NUMERIC DEFAULT 0,
  innovation_complementarity NUMERIC DEFAULT 0,
  composite_compat NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Institutional Longitudinal Stability (Section 14)
CREATE TABLE IF NOT EXISTS public.institutional_stability_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  funding_volatility NUMERIC DEFAULT 0,
  leadership_change_impact NUMERIC DEFAULT 0,
  domain_shift_stability NUMERIC DEFAULT 0,
  compliance_consistency NUMERIC DEFAULT 0,
  innovation_durability NUMERIC DEFAULT 0,
  startup_survival_rate NUMERIC DEFAULT 0,
  reputation_volatility NUMERIC DEFAULT 0,
  composite_stability NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id)
);

-- Enable RLS
ALTER TABLE public.institutional_operating_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_sub_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_impact_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_talent_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_industry_integration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_compatibility_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_stability_scores ENABLE ROW LEVEL SECURITY;

-- RLS: Read (all public for authenticated)
CREATE POLICY "Auth read inst_profiles" ON public.institutional_operating_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read inst_channels" ON public.institutional_sub_channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read inst_timeline" ON public.institutional_timeline_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read inst_impact" ON public.institutional_impact_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read inst_talent" ON public.institutional_talent_flow FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read inst_industry" ON public.institutional_industry_integration FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read inst_media" ON public.institutional_media_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read inst_compat" ON public.institution_compatibility_checks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read inst_stability" ON public.institutional_stability_scores FOR SELECT TO authenticated USING (true);

-- RLS: Insert
CREATE POLICY "Auth insert inst_profiles" ON public.institutional_operating_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update inst_profiles" ON public.institutional_operating_profiles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth insert inst_channels" ON public.institutional_sub_channels FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert inst_timeline" ON public.institutional_timeline_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert inst_impact" ON public.institutional_impact_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update inst_impact" ON public.institutional_impact_index FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth insert inst_talent" ON public.institutional_talent_flow FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update inst_talent" ON public.institutional_talent_flow FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth insert inst_industry" ON public.institutional_industry_integration FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update inst_industry" ON public.institutional_industry_integration FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth insert inst_media" ON public.institutional_media_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert inst_compat" ON public.institution_compatibility_checks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert inst_stability" ON public.institutional_stability_scores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update inst_stability" ON public.institutional_stability_scores FOR UPDATE TO authenticated USING (true);
