
-- =====================================================
-- GLOBAL PROFESSIONAL ORCHESTRATION ENGINE (GPOE)
-- =====================================================

-- 1. Global Initiatives (Section 1)
CREATE TABLE IF NOT EXISTS public.global_initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  problem_statement TEXT,
  domain_classification TEXT[] DEFAULT '{}',
  geographic_scope TEXT[] DEFAULT '{}',
  required_skills TEXT[] DEFAULT '{}',
  funding_structure JSONB DEFAULT '{}',
  milestone_roadmap JSONB DEFAULT '[]',
  compliance_requirements TEXT[] DEFAULT '{}',
  institutional_partners UUID[] DEFAULT '{}',
  execution_phases JSONB DEFAULT '[]',
  expected_outcomes JSONB DEFAULT '[]',
  impact_metrics JSONB DEFAULT '{}',
  governance_structure JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Initiative Participants (Section 2)
CREATE TABLE IF NOT EXISTS public.initiative_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES public.global_initiatives(id) ON DELETE CASCADE,
  user_id UUID,
  institution_id UUID,
  role TEXT NOT NULL,
  responsibilities TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Ecosystem Alignment Analytics (Section 3)
CREATE TABLE IF NOT EXISTS public.ecosystem_alignment_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES public.global_initiatives(id) ON DELETE CASCADE,
  existing_grants_alignment NUMERIC DEFAULT 0,
  institutional_strategy_alignment NUMERIC DEFAULT 0,
  industry_demand_alignment NUMERIC DEFAULT 0,
  startup_ecosystem_alignment NUMERIC DEFAULT 0,
  patent_cluster_alignment NUMERIC DEFAULT 0,
  national_priority_alignment NUMERIC DEFAULT 0,
  skill_supply_alignment NUMERIC DEFAULT 0,
  innovation_velocity NUMERIC DEFAULT 0,
  ecosystem_readiness_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Mobilization Dashboard (Section 4)
CREATE TABLE IF NOT EXISTS public.initiative_mobilization_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES public.global_initiatives(id) ON DELETE CASCADE,
  active_participants INTEGER DEFAULT 0,
  geographic_distribution JSONB DEFAULT '{}',
  funding_secured NUMERIC DEFAULT 0,
  milestones_completed INTEGER DEFAULT 0,
  skill_coverage_pct NUMERIC DEFAULT 0,
  trust_density NUMERIC DEFAULT 0,
  cross_border_diversity NUMERIC DEFAULT 0,
  risk_exposure NUMERIC DEFAULT 0,
  timeline_progress_pct NUMERIC DEFAULT 0,
  industry_engagement_status TEXT DEFAULT 'none',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(initiative_id)
);

-- 5. Cross-Border Coordination (Section 5)
CREATE TABLE IF NOT EXISTS public.initiative_cross_border (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES public.global_initiatives(id) ON DELETE CASCADE,
  regulatory_compatibility NUMERIC DEFAULT 0,
  funding_jurisdiction_rules JSONB DEFAULT '{}',
  ip_ownership_structure TEXT,
  compliance_obligations TEXT[] DEFAULT '{}',
  currency_flows JSONB DEFAULT '{}',
  data_localization TEXT[] DEFAULT '{}',
  cultural_friction NUMERIC DEFAULT 0,
  institutional_trust_strength NUMERIC DEFAULT 0,
  cross_border_viability NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Funding Orchestration (Section 7)
CREATE TABLE IF NOT EXISTS public.initiative_funding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES public.global_initiatives(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id UUID,
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  escrow_protected BOOLEAN DEFAULT true,
  milestone_linked UUID,
  status TEXT DEFAULT 'pledged',
  transparency_report JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Integrity & Oversight (Section 8)
CREATE TABLE IF NOT EXISTS public.initiative_governance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES public.global_initiatives(id) ON DELETE CASCADE,
  governance_board_members UUID[] DEFAULT '{}',
  compliance_officer_id UUID,
  reporting_cadence TEXT DEFAULT 'monthly',
  dispute_resolution_method TEXT DEFAULT 'arbitration',
  conflict_disclosures JSONB DEFAULT '[]',
  audit_trail JSONB DEFAULT '[]',
  appeal_mechanism TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Skill Mobilization (Section 9)
CREATE TABLE IF NOT EXISTS public.initiative_skill_mobilization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES public.global_initiatives(id) ON DELETE CASCADE,
  skill_shortages TEXT[] DEFAULT '{}',
  underutilized_professionals UUID[] DEFAULT '{}',
  geographic_talent_pools JSONB DEFAULT '{}',
  cross_domain_candidates UUID[] DEFAULT '{}',
  high_liquidity_talent UUID[] DEFAULT '{}',
  trust_verified_contributors UUID[] DEFAULT '{}',
  recruitment_suggestions JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Startup Ecosystem Tracking (Section 12)
CREATE TABLE IF NOT EXISTS public.initiative_startup_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES public.global_initiatives(id) ON DELETE CASCADE,
  startup_id UUID,
  startup_name TEXT,
  venture_funding NUMERIC DEFAULT 0,
  patents_converted INTEGER DEFAULT 0,
  commercialization_stage TEXT,
  industry_pilot_status TEXT,
  revenue_milestones JSONB DEFAULT '[]',
  exit_events JSONB DEFAULT '[]',
  tracked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Global Movement Index (Section 13)
CREATE TABLE IF NOT EXISTS public.initiative_movement_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES public.global_initiatives(id) ON DELETE CASCADE,
  execution_progress NUMERIC DEFAULT 0,
  funding_efficiency NUMERIC DEFAULT 0,
  innovation_output NUMERIC DEFAULT 0,
  collaboration_density NUMERIC DEFAULT 0,
  compliance_stability NUMERIC DEFAULT 0,
  cross_border_reach NUMERIC DEFAULT 0,
  economic_impact NUMERIC DEFAULT 0,
  long_term_sustainability NUMERIC DEFAULT 0,
  composite_movement_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(initiative_id)
);

-- 11. Coordination Memory (Section 14)
CREATE TABLE IF NOT EXISTS public.initiative_coordination_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES public.global_initiatives(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.global_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecosystem_alignment_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_mobilization_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_cross_border ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_funding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_governance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_skill_mobilization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_startup_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_movement_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_coordination_memory ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Auth read global_init" ON public.global_initiatives FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read init_parts" ON public.initiative_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read eco_align" ON public.ecosystem_alignment_analytics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read init_mobil" ON public.initiative_mobilization_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read init_xborder" ON public.initiative_cross_border FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read init_fund" ON public.initiative_funding FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read init_gov" ON public.initiative_governance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read init_skill" ON public.initiative_skill_mobilization FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read init_startup" ON public.initiative_startup_tracking FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read init_mvmt" ON public.initiative_movement_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read init_memory" ON public.initiative_coordination_memory FOR SELECT TO authenticated USING (true);

-- Insert policies
CREATE POLICY "Auth insert global_init" ON public.global_initiatives FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert init_parts" ON public.initiative_participants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert eco_align" ON public.ecosystem_alignment_analytics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert init_mobil" ON public.initiative_mobilization_metrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert init_xborder" ON public.initiative_cross_border FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert init_fund" ON public.initiative_funding FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert init_gov" ON public.initiative_governance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert init_skill" ON public.initiative_skill_mobilization FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert init_startup" ON public.initiative_startup_tracking FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert init_mvmt" ON public.initiative_movement_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert init_memory" ON public.initiative_coordination_memory FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies
CREATE POLICY "Auth update global_init" ON public.global_initiatives FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update init_mobil" ON public.initiative_mobilization_metrics FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update init_mvmt" ON public.initiative_movement_index FOR UPDATE TO authenticated USING (true);
