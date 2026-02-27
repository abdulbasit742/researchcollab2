
-- Unified Execution Identity Layer
CREATE TABLE IF NOT EXISTS public.unified_execution_identity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  escrow_backed_projects integer DEFAULT 0,
  total_escrow_volume numeric DEFAULT 0,
  institutional_validations integer DEFAULT 0,
  sponsor_funding_footprint numeric DEFAULT 0,
  visual_deliverables_count integer DEFAULT 0,
  research_outputs_count integer DEFAULT 0,
  economic_trust_weight numeric DEFAULT 0,
  talent_readiness_score numeric DEFAULT 0,
  communication_reliability numeric DEFAULT 0,
  collaboration_clusters integer DEFAULT 0,
  career_trajectory_trend text DEFAULT 'emerging',
  identity_completeness_pct numeric DEFAULT 0,
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.unified_execution_identity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own identity" ON public.unified_execution_identity
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public identity readable" ON public.unified_execution_identity
  FOR SELECT TO authenticated USING (true);

-- Professional lifecycle stages tracking
CREATE TABLE IF NOT EXISTS public.professional_lifecycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid,
  stage text NOT NULL,
  stage_data jsonb DEFAULT '{}',
  entered_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_hours numeric,
  outcome text
);

ALTER TABLE public.professional_lifecycle_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own lifecycle" ON public.professional_lifecycle_events
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Execution marketplace listings (structured, not gig spam)
CREATE TABLE IF NOT EXISTS public.execution_marketplace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  listing_type text DEFAULT 'project_proposal',
  domain text,
  required_skills text[] DEFAULT '{}',
  budget_range_min numeric,
  budget_range_max numeric,
  escrow_required boolean DEFAULT true,
  institutional_oversight boolean DEFAULT false,
  institution_id uuid,
  faculty_collaboration boolean DEFAULT false,
  complexity_tier text DEFAULT 'standard',
  milestone_count integer DEFAULT 1,
  expected_duration_days integer,
  sponsor_id uuid,
  status text DEFAULT 'open',
  applications_count integer DEFAULT 0,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.execution_marketplace ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators manage listings" ON public.execution_marketplace
  FOR ALL TO authenticated USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Public listings visible" ON public.execution_marketplace
  FOR SELECT TO authenticated USING (is_public = true AND status = 'open');

-- Execution marketplace applications
CREATE TABLE IF NOT EXISTS public.marketplace_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.execution_marketplace(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL,
  proposal_text text,
  proposed_budget numeric,
  proposed_timeline_days integer,
  relevant_portfolio_ids uuid[] DEFAULT '{}',
  trust_score_at_application numeric DEFAULT 0,
  escrow_history_summary jsonb DEFAULT '{}',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.marketplace_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applicants manage own" ON public.marketplace_applications
  FOR ALL TO authenticated USING (auth.uid() = applicant_id) WITH CHECK (auth.uid() = applicant_id);

-- AI Growth Advisor records
CREATE TABLE IF NOT EXISTS public.ai_growth_advisor_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  advisor_type text NOT NULL,
  skill_gaps_detected jsonb DEFAULT '[]',
  execution_weaknesses jsonb DEFAULT '[]',
  communication_suggestions jsonb DEFAULT '[]',
  domain_expansion_recommendations jsonb DEFAULT '[]',
  institutional_opportunities jsonb DEFAULT '[]',
  risk_mitigation_alerts jsonb DEFAULT '[]',
  overall_growth_score numeric DEFAULT 0,
  action_items jsonb DEFAULT '[]',
  model_version text DEFAULT '1.0',
  generated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_growth_advisor_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own advisor" ON public.ai_growth_advisor_records
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Platform category positioning
CREATE TABLE IF NOT EXISTS public.platform_category_positioning (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_label text NOT NULL,
  positioning_statement text NOT NULL,
  competitor_comparison jsonb DEFAULT '{}',
  differentiators jsonb DEFAULT '[]',
  moat_factors jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.platform_category_positioning ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Positioning publicly readable" ON public.platform_category_positioning
  FOR SELECT TO authenticated USING (is_active = true);

-- Execution discovery index (materialized search layer)
CREATE TABLE IF NOT EXISTS public.execution_discovery_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL,
  entity_type text NOT NULL,
  display_name text,
  domain text,
  escrow_reliability numeric DEFAULT 0,
  institutional_performance numeric DEFAULT 0,
  economic_graph_weight numeric DEFAULT 0,
  sponsor_repeat_rate numeric DEFAULT 0,
  completion_velocity numeric DEFAULT 0,
  deliverable_depth numeric DEFAULT 0,
  risk_profile numeric DEFAULT 0,
  overall_discovery_score numeric DEFAULT 0,
  skills text[] DEFAULT '{}',
  institution_ids uuid[] DEFAULT '{}',
  last_indexed_at timestamptz DEFAULT now()
);

ALTER TABLE public.execution_discovery_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discovery index readable" ON public.execution_discovery_index
  FOR SELECT TO authenticated USING (true);
