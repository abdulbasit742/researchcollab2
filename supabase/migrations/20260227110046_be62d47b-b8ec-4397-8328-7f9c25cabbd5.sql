
-- =====================================================
-- PROFESSIONAL LONGITUDINAL MEMORY SYSTEM (PLMS)
-- =====================================================

-- 1. Career Trajectory Snapshots (Section 1)
CREATE TABLE IF NOT EXISTS public.plms_career_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  snapshot_year INTEGER NOT NULL,
  skill_count INTEGER DEFAULT 0,
  funding_total NUMERIC DEFAULT 0,
  trust_index NUMERIC DEFAULT 0,
  domain_count INTEGER DEFAULT 0,
  collaboration_count INTEGER DEFAULT 0,
  startup_equity_changes JSONB DEFAULT '{}',
  patent_filings INTEGER DEFAULT 0,
  industry_deployments INTEGER DEFAULT 0,
  institutional_affiliations INTEGER DEFAULT 0,
  execution_stability NUMERIC DEFAULT 0,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, snapshot_year)
);

-- 2. Project Lifecycle Memory (Section 2)
CREATE TABLE IF NOT EXISTS public.plms_project_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  initial_proposal TEXT,
  team_composition JSONB DEFAULT '[]',
  funding_structure JSONB DEFAULT '{}',
  milestone_timeline JSONB DEFAULT '[]',
  deliverables TEXT[] DEFAULT '{}',
  disputes JSONB DEFAULT '[]',
  outcomes TEXT[] DEFAULT '{}',
  long_term_impact TEXT,
  startup_conversion BOOLEAN DEFAULT false,
  patent_filings INTEGER DEFAULT 0,
  industry_adoption TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Trust Evolution History (Section 3)
CREATE TABLE IF NOT EXISTS public.plms_trust_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trust_index NUMERIC DEFAULT 0,
  high_trust_collaborations INTEGER DEFAULT 0,
  trust_declines INTEGER DEFAULT 0,
  trust_recoveries INTEGER DEFAULT 0,
  institutional_trust_shifts JSONB DEFAULT '{}',
  domain_trust JSONB DEFAULT '{}',
  conflict_resolutions INTEGER DEFAULT 0,
  stability_score NUMERIC DEFAULT 0
);

-- 4. Funding Progression (Section 4)
CREATE TABLE IF NOT EXISTS public.plms_funding_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  milestone_type TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  role TEXT,
  cross_border BOOLEAN DEFAULT false,
  institution_id UUID,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- 5. Global Mobility History (Section 5)
CREATE TABLE IF NOT EXISTS public.plms_global_mobility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  country_code TEXT NOT NULL,
  collaboration_type TEXT,
  project_id UUID,
  institution_id UUID,
  regulatory_exposure TEXT,
  cultural_depth_score NUMERIC DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- 6. Skill Compounding (Section 6)
CREATE TABLE IF NOT EXISTS public.plms_skill_compounding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  application_count INTEGER DEFAULT 0,
  domain TEXT,
  specialization_depth NUMERIC DEFAULT 0,
  cross_domain_stacks TEXT[] DEFAULT '{}',
  obsolescence_risk NUMERIC DEFAULT 0,
  mastery_level NUMERIC DEFAULT 0,
  last_applied_at TIMESTAMPTZ,
  UNIQUE(user_id, skill_name)
);

-- 7. Collaboration Network Evolution (Section 7)
CREATE TABLE IF NOT EXISTS public.plms_collaboration_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  collaborator_id UUID NOT NULL,
  first_collaboration_at TIMESTAMPTZ,
  collaboration_count INTEGER DEFAULT 1,
  trust_level NUMERIC DEFAULT 0,
  is_institutional_bridge BOOLEAN DEFAULT false,
  is_cross_domain BOOLEAN DEFAULT false,
  domains TEXT[] DEFAULT '{}',
  last_collaboration_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, collaborator_id)
);

-- 8. Dispute & Recovery History (Section 8)
CREATE TABLE IF NOT EXISTS public.plms_dispute_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dispute_id UUID,
  dispute_type TEXT,
  resolution_outcome TEXT,
  lessons_applied TEXT,
  trust_before NUMERIC DEFAULT 0,
  trust_after NUMERIC DEFAULT 0,
  recovery_duration_days INTEGER DEFAULT 0,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- 9. Institutional Memory (Section 9)
CREATE TABLE IF NOT EXISTS public.plms_institutional_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  memory_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  metrics JSONB DEFAULT '{}',
  participants JSONB DEFAULT '[]',
  outcomes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Professional Anniversaries (Section 12)
CREATE TABLE IF NOT EXISTS public.plms_anniversaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  anniversary_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  original_date TIMESTAMPTZ NOT NULL,
  years_milestone INTEGER DEFAULT 1,
  linked_entity_id UUID,
  linked_entity_type TEXT,
  celebrated BOOLEAN DEFAULT false,
  resurfaced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Data Portability & Legacy (Section 13)
CREATE TABLE IF NOT EXISTS public.plms_data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  export_format TEXT DEFAULT 'json',
  export_scope TEXT[] DEFAULT '{}',
  export_data JSONB DEFAULT '{}',
  successor_account_id UUID,
  is_legacy_preservation BOOLEAN DEFAULT false,
  verification_hash TEXT,
  exported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Initiative Memory Archive (Section 11)
CREATE TABLE IF NOT EXISTS public.plms_initiative_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID,
  title TEXT NOT NULL,
  participant_evolution JSONB DEFAULT '[]',
  funding_progression JSONB DEFAULT '[]',
  milestone_completion_rate NUMERIC DEFAULT 0,
  economic_impact NUMERIC DEFAULT 0,
  policy_alignment JSONB DEFAULT '{}',
  innovation_adoption JSONB DEFAULT '{}',
  startup_pipeline JSONB DEFAULT '[]',
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plms_career_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plms_project_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plms_trust_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plms_funding_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plms_global_mobility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plms_skill_compounding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plms_collaboration_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plms_dispute_recovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plms_institutional_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plms_anniversaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plms_data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plms_initiative_archive ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Auth read plms_career" ON public.plms_career_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read plms_project" ON public.plms_project_memory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read plms_trust" ON public.plms_trust_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read plms_funding" ON public.plms_funding_progression FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read plms_mobility" ON public.plms_global_mobility FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read plms_skill" ON public.plms_skill_compounding FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read plms_collab" ON public.plms_collaboration_evolution FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read plms_dispute" ON public.plms_dispute_recovery FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read plms_inst" ON public.plms_institutional_memory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read plms_anniv" ON public.plms_anniversaries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read plms_export" ON public.plms_data_exports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read plms_initiative" ON public.plms_initiative_archive FOR SELECT TO authenticated USING (true);

-- Insert policies
CREATE POLICY "Auth insert plms_career" ON public.plms_career_snapshots FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert plms_project" ON public.plms_project_memory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert plms_trust" ON public.plms_trust_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert plms_funding" ON public.plms_funding_progression FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert plms_mobility" ON public.plms_global_mobility FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert plms_skill" ON public.plms_skill_compounding FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert plms_collab" ON public.plms_collaboration_evolution FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert plms_dispute" ON public.plms_dispute_recovery FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert plms_inst" ON public.plms_institutional_memory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert plms_anniv" ON public.plms_anniversaries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert plms_export" ON public.plms_data_exports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert plms_initiative" ON public.plms_initiative_archive FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies
CREATE POLICY "Auth update plms_career" ON public.plms_career_snapshots FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update plms_skill" ON public.plms_skill_compounding FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update plms_collab" ON public.plms_collaboration_evolution FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update plms_anniv" ON public.plms_anniversaries FOR UPDATE TO authenticated USING (true);
