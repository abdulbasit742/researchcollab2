
-- =====================================================
-- VERIFIED PROFESSIONAL VISUAL IDENTITY ENGINE
-- =====================================================

-- 1. Reputation Stack Profiles (Section 2)
CREATE TABLE IF NOT EXISTS public.reputation_stack_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  execution_score NUMERIC DEFAULT 0,
  innovation_score NUMERIC DEFAULT 0,
  collaboration_score NUMERIC DEFAULT 0,
  integrity_score NUMERIC DEFAULT 0,
  funding_impact_score NUMERIC DEFAULT 0,
  open_contribution_score NUMERIC DEFAULT 0,
  longitudinal_stability_score NUMERIC DEFAULT 0,
  skill_diversity_score NUMERIC DEFAULT 0,
  composite_reputation NUMERIC DEFAULT 0,
  breakdown JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Professional Identity Timeline Events (Section 3)
CREATE TABLE IF NOT EXISTS public.identity_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_description TEXT,
  linked_entity_type TEXT,
  linked_entity_id TEXT,
  institution_id TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verified_by TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Skill Matrix Entries (Section 4)
CREATE TABLE IF NOT EXISTS public.skill_matrix_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_category TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  depth_score NUMERIC DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  cross_domain_integration BOOLEAN DEFAULT false,
  project_linkages TEXT[] DEFAULT '{}',
  industry_validated BOOLEAN DEFAULT false,
  grant_linked BOOLEAN DEFAULT false,
  peer_endorsement_weight NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Verified Badges (Section 6)
CREATE TABLE IF NOT EXISTS public.verified_identity_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  earned_reason TEXT,
  evidence_entity_type TEXT,
  evidence_entity_id TEXT,
  is_active BOOLEAN DEFAULT true,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Global Footprint Points (Section 5)
CREATE TABLE IF NOT EXISTS public.professional_global_footprint (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  country_code TEXT NOT NULL,
  engagement_type TEXT NOT NULL,
  institution_name TEXT,
  description TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Long-Term Stability Index (Section 12)
CREATE TABLE IF NOT EXISTS public.professional_stability_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  funding_continuity NUMERIC DEFAULT 0,
  output_consistency NUMERIC DEFAULT 0,
  collaboration_longevity NUMERIC DEFAULT 0,
  compliance_stability NUMERIC DEFAULT 0,
  innovation_durability NUMERIC DEFAULT 0,
  composite_stability NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Institutional Verifications (Section 11)
CREATE TABLE IF NOT EXISTS public.institutional_identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  institution_id TEXT NOT NULL,
  verification_type TEXT NOT NULL,
  verification_details TEXT,
  verified_by_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reputation_stack_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_matrix_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_identity_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_global_footprint ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_stability_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_identity_verifications ENABLE ROW LEVEL SECURITY;

-- RLS: Auth read all
CREATE POLICY "Auth read rep_stack" ON public.reputation_stack_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read id_timeline" ON public.identity_timeline_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read skill_matrix" ON public.skill_matrix_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read id_badges" ON public.verified_identity_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read footprint" ON public.professional_global_footprint FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read stability" ON public.professional_stability_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read inst_verify" ON public.institutional_identity_verifications FOR SELECT TO authenticated USING (true);

-- RLS: Owner insert/update
CREATE POLICY "Own insert rep_stack" ON public.reputation_stack_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own insert id_timeline" ON public.identity_timeline_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own insert skill_matrix" ON public.skill_matrix_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own insert footprint" ON public.professional_global_footprint FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own insert stability" ON public.professional_stability_index FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Badges and verifications inserted by system/institutions
CREATE POLICY "Auth insert id_badges" ON public.verified_identity_badges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert inst_verify" ON public.institutional_identity_verifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update inst_verify" ON public.institutional_identity_verifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Owner update
CREATE POLICY "Own update skill_matrix" ON public.skill_matrix_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own update id_timeline" ON public.identity_timeline_events FOR UPDATE TO authenticated USING (auth.uid() = user_id);
