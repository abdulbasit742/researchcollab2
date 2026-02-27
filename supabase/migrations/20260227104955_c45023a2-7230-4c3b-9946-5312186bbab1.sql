
-- =====================================================
-- PROFESSIONAL GROUP INTELLIGENCE SYSTEM (PGIS)
-- =====================================================

-- 1. Professional Groups (Section 1)
CREATE TABLE IF NOT EXISTS public.professional_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT NOT NULL,
  purpose TEXT,
  execution_focus TEXT,
  governance_model TEXT DEFAULT 'moderated',
  moderation_structure JSONB DEFAULT '{}',
  expected_outcomes TEXT[] DEFAULT '{}',
  membership_criteria JSONB DEFAULT '{}',
  posting_rules TEXT[] DEFAULT '{}',
  privacy_level TEXT DEFAULT 'public',
  nda_protected BOOLEAN DEFAULT false,
  escrow_protected BOOLEAN DEFAULT false,
  institution_id UUID,
  status TEXT DEFAULT 'active',
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Group Members & Roles (Section 2)
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.professional_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active',
  contribution_score NUMERIC DEFAULT 0,
  UNIQUE(group_id, user_id)
);

-- 3. Group Posts (Section 3)
CREATE TABLE IF NOT EXISTS public.group_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.professional_groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  post_type TEXT NOT NULL,
  title TEXT,
  content TEXT,
  linked_project_id UUID,
  linked_grant_id UUID,
  metadata JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  is_solution_marked BOOLEAN DEFAULT false,
  peer_validation_score NUMERIC DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Group Threads / Replies (Section 6)
CREATE TABLE IF NOT EXISTS public.group_thread_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.group_posts(id) ON DELETE CASCADE,
  parent_reply_id UUID,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  authority_weight NUMERIC DEFAULT 0,
  peer_validations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Group Trust Density (Section 4)
CREATE TABLE IF NOT EXISTS public.group_trust_density (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.professional_groups(id) ON DELETE CASCADE,
  avg_member_trust NUMERIC DEFAULT 0,
  execution_reliability_density NUMERIC DEFAULT 0,
  funding_success_density NUMERIC DEFAULT 0,
  collaboration_stability_density NUMERIC DEFAULT 0,
  integrity_confidence_density NUMERIC DEFAULT 0,
  composite_credibility NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id)
);

-- 6. Group Outcomes (Section 5)
CREATE TABLE IF NOT EXISTS public.group_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.professional_groups(id) ON DELETE CASCADE,
  outcome_type TEXT NOT NULL,
  description TEXT,
  linked_entity_id UUID,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Group Intelligence Metrics (Section 9)
CREATE TABLE IF NOT EXISTS public.group_intelligence_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.professional_groups(id) ON DELETE CASCADE,
  active_members INTEGER DEFAULT 0,
  execution_threads INTEGER DEFAULT 0,
  collaboration_success_rate NUMERIC DEFAULT 0,
  funding_conversion NUMERIC DEFAULT 0,
  skill_exchange_frequency NUMERIC DEFAULT 0,
  knowledge_retention_depth NUMERIC DEFAULT 0,
  topic_growth_signals JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id)
);

-- 8. Group Anti-Toxicity Flags (Section 8)
CREATE TABLE IF NOT EXISTS public.group_toxicity_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.professional_groups(id) ON DELETE CASCADE,
  post_id UUID,
  flagged_user_id UUID,
  flag_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  description TEXT,
  evidence JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Group Memory / Archive (Section 14)
CREATE TABLE IF NOT EXISTS public.group_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.professional_groups(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT,
  summary TEXT,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.professional_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_thread_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_trust_density ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_intelligence_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_toxicity_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memory ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Auth read prof_groups" ON public.professional_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read grp_members" ON public.group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read grp_posts" ON public.group_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read grp_replies" ON public.group_thread_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read grp_trust" ON public.group_trust_density FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read grp_outcomes" ON public.group_outcomes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read grp_intel" ON public.group_intelligence_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read grp_tox" ON public.group_toxicity_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read grp_memory" ON public.group_memory FOR SELECT TO authenticated USING (true);

-- Insert policies
CREATE POLICY "Auth insert prof_groups" ON public.professional_groups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert grp_members" ON public.group_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert grp_posts" ON public.group_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert grp_replies" ON public.group_thread_replies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert grp_trust" ON public.group_trust_density FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert grp_outcomes" ON public.group_outcomes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert grp_intel" ON public.group_intelligence_metrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert grp_tox" ON public.group_toxicity_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert grp_memory" ON public.group_memory FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies
CREATE POLICY "Auth update prof_groups" ON public.professional_groups FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update grp_members" ON public.group_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update grp_posts" ON public.group_posts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update grp_replies" ON public.group_thread_replies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update grp_trust" ON public.group_trust_density FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update grp_intel" ON public.group_intelligence_metrics FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update grp_tox" ON public.group_toxicity_flags FOR UPDATE TO authenticated USING (true);
