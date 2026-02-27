
-- Institutional Trust Score snapshots
CREATE TABLE IF NOT EXISTS public.institutional_trust_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  completion_reliability numeric DEFAULT 0,
  dispute_ratio numeric DEFAULT 0,
  sponsor_retention numeric DEFAULT 0,
  escrow_invariant_compliance numeric DEFAULT 0,
  faculty_oversight_participation numeric DEFAULT 0,
  financial_reconciliation_consistency numeric DEFAULT 0,
  overall_its numeric DEFAULT 0,
  tier text DEFAULT 'unrated',
  snapshot_at timestamptz DEFAULT now()
);

ALTER TABLE public.institutional_trust_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ITS publicly visible"
  ON public.institutional_trust_scores FOR SELECT
  TO authenticated
  USING (true);

-- Accreditation reports
CREATE TABLE IF NOT EXISTS public.accreditation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  report_period_start timestamptz NOT NULL,
  report_period_end timestamptz NOT NULL,
  student_industry_engagement_pct numeric DEFAULT 0,
  funded_fyp_participation_rate numeric DEFAULT 0,
  project_completion_reliability numeric DEFAULT 0,
  industry_collaboration_frequency integer DEFAULT 0,
  cross_institution_collaboration_index numeric DEFAULT 0,
  economic_contribution_amount numeric DEFAULT 0,
  research_commercialization_count integer DEFAULT 0,
  report_data jsonb DEFAULT '{}',
  export_format text DEFAULT 'json',
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.accreditation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution members can view reports"
  ON public.accreditation_reports FOR SELECT
  TO authenticated
  USING (true);

-- Government innovation dashboards (aggregated, anonymized)
CREATE TABLE IF NOT EXISTS public.government_innovation_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  sector text,
  total_projects integer DEFAULT 0,
  total_funding_volume numeric DEFAULT 0,
  active_institutions integer DEFAULT 0,
  active_sponsors integer DEFAULT 0,
  milestone_velocity_avg numeric DEFAULT 0,
  completion_rate_pct numeric DEFAULT 0,
  collaboration_density numeric DEFAULT 0,
  innovation_clusters jsonb DEFAULT '[]',
  snapshot_at timestamptz DEFAULT now()
);

ALTER TABLE public.government_innovation_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Innovation snapshots publicly visible"
  ON public.government_innovation_snapshots FOR SELECT
  TO authenticated
  USING (true);

-- Research commercialization tracking
CREATE TABLE IF NOT EXISTS public.research_commercialization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid,
  research_project_id uuid,
  funded_project_id uuid,
  commercialization_type text DEFAULT 'prototype',
  sponsor_id uuid,
  industry_sector text,
  conversion_status text DEFAULT 'in_progress',
  economic_value numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.research_commercialization ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Commercialization records visible"
  ON public.research_commercialization FOR SELECT
  TO authenticated
  USING (true);

-- Cross-institution collaboration agreements
CREATE TABLE IF NOT EXISTS public.cross_institution_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_a_id uuid NOT NULL,
  institution_b_id uuid NOT NULL,
  agreement_type text DEFAULT 'collaboration',
  co_funded_projects integer DEFAULT 0,
  shared_sponsors integer DEFAULT 0,
  joint_completion_rate numeric DEFAULT 0,
  innovation_cluster_domains text[] DEFAULT '{}',
  status text DEFAULT 'active',
  signed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.cross_institution_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agreements visible to participants"
  ON public.cross_institution_agreements FOR SELECT
  TO authenticated
  USING (true);

-- Grant funding management
CREATE TABLE IF NOT EXISTS public.grant_funding_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_name text NOT NULL,
  granting_body text NOT NULL,
  institution_id uuid,
  total_amount numeric NOT NULL DEFAULT 0,
  disbursed_amount numeric DEFAULT 0,
  remaining_amount numeric DEFAULT 0,
  phase_count integer DEFAULT 1,
  current_phase integer DEFAULT 1,
  compliance_status text DEFAULT 'compliant',
  milestone_release_log jsonb DEFAULT '[]',
  audit_trail jsonb DEFAULT '[]',
  utilization_pct numeric DEFAULT 0,
  status text DEFAULT 'active',
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.grant_funding_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Grant records visible to authenticated"
  ON public.grant_funding_records FOR SELECT
  TO authenticated
  USING (true);

-- Institutional public transparency settings
CREATE TABLE IF NOT EXISTS public.institutional_transparency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL UNIQUE,
  publish_completion_pct boolean DEFAULT false,
  publish_sponsor_repeat_pct boolean DEFAULT false,
  publish_funding_distribution boolean DEFAULT false,
  publish_innovation_summary boolean DEFAULT false,
  public_profile_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.institutional_transparency ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transparency settings publicly visible"
  ON public.institutional_transparency FOR SELECT
  TO authenticated
  USING (true);
