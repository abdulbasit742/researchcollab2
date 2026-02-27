
-- =====================================================
-- VERIFIED AUTHORITY & CREDIBILITY ENGINE (VACE)
-- =====================================================

-- 1. Domain-Specific Authority Index (Section 1)
CREATE TABLE IF NOT EXISTS public.domain_authority_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  skill_depth NUMERIC DEFAULT 0,
  verified_projects NUMERIC DEFAULT 0,
  grant_participation NUMERIC DEFAULT 0,
  patent_contribution NUMERIC DEFAULT 0,
  startup_involvement NUMERIC DEFAULT 0,
  collaboration_trust NUMERIC DEFAULT 0,
  peer_validation NUMERIC DEFAULT 0,
  compliance_integrity NUMERIC DEFAULT 0,
  longitudinal_consistency NUMERIC DEFAULT 0,
  innovation_yield NUMERIC DEFAULT 0,
  composite_authority NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain)
);

-- 2. Execution Authority Score (Section 2)
CREATE TABLE IF NOT EXISTS public.execution_authority_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  on_time_milestone_pct NUMERIC DEFAULT 0,
  deliverable_acceptance_rate NUMERIC DEFAULT 0,
  budget_compliance NUMERIC DEFAULT 0,
  sponsor_retention NUMERIC DEFAULT 0,
  repeat_collaboration NUMERIC DEFAULT 0,
  escrow_integrity NUMERIC DEFAULT 0,
  dispute_frequency NUMERIC DEFAULT 0,
  composite_eas NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Knowledge Contribution Authority (Section 3)
CREATE TABLE IF NOT EXISTS public.knowledge_authority_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  open_science_contribution NUMERIC DEFAULT 0,
  replication_success_rate NUMERIC DEFAULT 0,
  peer_validation_quality NUMERIC DEFAULT 0,
  educational_content_value NUMERIC DEFAULT 0,
  code_dataset_reuse NUMERIC DEFAULT 0,
  domain_insight_recognition NUMERIC DEFAULT 0,
  long_term_usefulness NUMERIC DEFAULT 0,
  composite_kca NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Collaboration Trust Authority (Section 4)
CREATE TABLE IF NOT EXISTS public.collaboration_trust_authority (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  multi_grant_continuity NUMERIC DEFAULT 0,
  cross_institution_partnerships NUMERIC DEFAULT 0,
  industry_integration NUMERIC DEFAULT 0,
  co_execution_success NUMERIC DEFAULT 0,
  network_resilience NUMERIC DEFAULT 0,
  dispute_free_collaborations NUMERIC DEFAULT 0,
  team_leadership_credibility NUMERIC DEFAULT 0,
  composite_cta NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Authority Decay Records (Section 6)
CREATE TABLE IF NOT EXISTS public.authority_decay_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  domain TEXT,
  decay_reason TEXT NOT NULL,
  decay_amount NUMERIC NOT NULL,
  previous_score NUMERIC,
  new_score NUMERIC,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Peer Validation Records (Section 12)
CREATE TABLE IF NOT EXISTS public.authority_peer_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_user_id UUID NOT NULL,
  endorser_user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  endorser_authority_weight NUMERIC DEFAULT 0,
  domain_alignment NUMERIC DEFAULT 0,
  collaboration_depth NUMERIC DEFAULT 0,
  verified_project_overlap BOOLEAN DEFAULT false,
  institutional_backing BOOLEAN DEFAULT false,
  weighted_endorsement NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Authority Manipulation Flags (Section 8)
CREATE TABLE IF NOT EXISTS public.authority_manipulation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  flag_type TEXT NOT NULL,
  description TEXT,
  evidence JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'low',
  resolved BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Verified Impact Badges (Section 9)
CREATE TABLE IF NOT EXISTS public.authority_impact_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  evidence_summary TEXT,
  data_backing JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.domain_authority_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_authority_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_authority_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_trust_authority ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authority_decay_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authority_peer_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authority_manipulation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authority_impact_badges ENABLE ROW LEVEL SECURITY;

-- RLS: Public read for authority scores
CREATE POLICY "Auth read domain_auth" ON public.domain_authority_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read exec_auth" ON public.execution_authority_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read knowledge_auth" ON public.knowledge_authority_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read collab_auth" ON public.collaboration_trust_authority FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read decay" ON public.authority_decay_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth read peer_val" ON public.authority_peer_validations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read manip" ON public.authority_manipulation_flags FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth read impact_badges" ON public.authority_impact_badges FOR SELECT TO authenticated USING (true);

-- RLS: Insert
CREATE POLICY "Own insert domain_auth" ON public.domain_authority_index FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update domain_auth" ON public.domain_authority_index FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own insert exec_auth" ON public.execution_authority_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own insert knowledge_auth" ON public.knowledge_authority_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own insert collab_auth" ON public.collaboration_trust_authority FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth insert decay" ON public.authority_decay_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert peer_val" ON public.authority_peer_validations FOR INSERT TO authenticated WITH CHECK (auth.uid() = endorser_user_id);
CREATE POLICY "Auth insert manip" ON public.authority_manipulation_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert impact_badges" ON public.authority_impact_badges FOR INSERT TO authenticated WITH CHECK (true);
