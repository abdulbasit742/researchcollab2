
-- Multi-Dimensional Impact Index (MDII)
CREATE TABLE public.academic_impact_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  citation_impact_score numeric DEFAULT 0,
  funding_impact_score numeric DEFAULT 0,
  execution_completion_score numeric DEFAULT 0,
  grant_reliability_score numeric DEFAULT 0,
  institutional_collaboration_score numeric DEFAULT 0,
  cross_discipline_influence_score numeric DEFAULT 0,
  research_commercialization_score numeric DEFAULT 0,
  milestone_efficiency_score numeric DEFAULT 0,
  industry_adoption_score numeric DEFAULT 0,
  longitudinal_contribution_score numeric DEFAULT 0,
  overall_mdii numeric DEFAULT 0,
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.academic_impact_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aii_owner" ON public.academic_impact_index FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "aii_read" ON public.academic_impact_index FOR SELECT TO authenticated USING (true);

-- Funding-linked paper index
CREATE TABLE public.research_paper_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  abstract text,
  authors text[] DEFAULT '{}',
  doi text,
  journal text,
  publication_date date,
  associated_grant_ids uuid[] DEFAULT '{}',
  escrow_managed boolean DEFAULT false,
  funding_amount numeric DEFAULT 0,
  funding_duration_months integer,
  sponsor_category text,
  milestone_count integer DEFAULT 0,
  deliverables_validated integer DEFAULT 0,
  institutional_oversight boolean DEFAULT false,
  grant_compliance_status text DEFAULT 'compliant',
  citation_count integer DEFAULT 0,
  citation_quality_index numeric DEFAULT 0,
  domain text,
  keywords text[] DEFAULT '{}',
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.research_paper_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rpi_owner" ON public.research_paper_index FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rpi_read" ON public.research_paper_index FOR SELECT TO authenticated USING (is_public = true);

-- Grant execution tracking
CREATE TABLE public.grant_execution_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_title text NOT NULL,
  principal_investigator_id uuid NOT NULL,
  institution_id uuid,
  approval_date date,
  funding_amount numeric DEFAULT 0,
  escrow_locked_amount numeric DEFAULT 0,
  milestone_releases integer DEFAULT 0,
  total_milestones integer DEFAULT 0,
  paper_outputs integer DEFAULT 0,
  commercial_prototypes integer DEFAULT 0,
  patent_filings integer DEFAULT 0,
  industry_licenses integer DEFAULT 0,
  completion_reliability numeric DEFAULT 0,
  grant_status text DEFAULT 'active',
  funding_source text,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.grant_execution_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "get_owner" ON public.grant_execution_tracking FOR ALL TO authenticated USING (auth.uid() = principal_investigator_id) WITH CHECK (auth.uid() = principal_investigator_id);
CREATE POLICY "get_read" ON public.grant_execution_tracking FOR SELECT TO authenticated USING (true);

-- Research lifecycle timeline
CREATE TABLE public.research_lifecycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid REFERENCES public.research_paper_index(id) ON DELETE CASCADE,
  grant_id uuid REFERENCES public.grant_execution_tracking(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  event_title text NOT NULL,
  event_description text,
  event_data jsonb DEFAULT '{}',
  occurred_at timestamptz DEFAULT now(),
  is_immutable boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.research_lifecycle_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rle_owner" ON public.research_lifecycle_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rle_read" ON public.research_lifecycle_events FOR SELECT TO authenticated USING (true);

-- Institutional Execution Index
CREATE TABLE public.institutional_execution_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL UNIQUE,
  grant_success_rate numeric DEFAULT 0,
  completion_reliability numeric DEFAULT 0,
  industry_conversion_pct numeric DEFAULT 0,
  funding_diversity_score numeric DEFAULT 0,
  cross_institution_collab_index numeric DEFAULT 0,
  patent_output integer DEFAULT 0,
  commercial_spinoffs integer DEFAULT 0,
  graduate_industry_placement_pct numeric DEFAULT 0,
  research_milestone_punctuality numeric DEFAULT 0,
  overall_iei numeric DEFAULT 0,
  last_computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.institutional_execution_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iei_read" ON public.institutional_execution_index FOR SELECT TO authenticated USING (true);

-- Research integrity flags
CREATE TABLE public.research_integrity_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid,
  target_paper_id uuid REFERENCES public.research_paper_index(id) ON DELETE SET NULL,
  target_institution_id uuid,
  flag_type text NOT NULL,
  severity text DEFAULT 'low',
  description text,
  evidence jsonb DEFAULT '{}',
  detected_by text DEFAULT 'system',
  status text DEFAULT 'open',
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.research_integrity_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rif_read" ON public.research_integrity_flags FOR SELECT TO authenticated USING (true);

-- Global innovation map
CREATE TABLE public.global_innovation_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  region text,
  domain text NOT NULL,
  funding_density numeric DEFAULT 0,
  collaboration_density numeric DEFAULT 0,
  innovation_cluster_score numeric DEFAULT 0,
  institution_count integer DEFAULT 0,
  active_grants integer DEFAULT 0,
  patent_output integer DEFAULT 0,
  grant_reliability_avg numeric DEFAULT 0,
  period text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.global_innovation_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gim_read" ON public.global_innovation_map FOR SELECT TO authenticated USING (true);
