
-- Phase 12: Open Science, AI Research Assistant & Career Infrastructure (Fixed)
-- =====================================================================

-- ===========================================
-- PART A: DATASETS & OPEN SCIENCE
-- ===========================================

-- 1. Research Datasets - Core dataset registry
CREATE TABLE IF NOT EXISTS public.research_datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  research_timeline_id UUID REFERENCES public.research_timelines(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  dataset_type TEXT NOT NULL CHECK (dataset_type IN ('experimental', 'survey', 'simulation', 'observational', 'mixed', 'derived')),
  size_mb NUMERIC DEFAULT 0,
  access_level TEXT NOT NULL DEFAULT 'restricted' CHECK (access_level IN ('open', 'restricted', 'embargoed', 'private')),
  embargo_until TIMESTAMPTZ,
  license TEXT DEFAULT 'CC-BY-4.0',
  doi TEXT,
  keywords TEXT[],
  methodology_summary TEXT,
  ethical_approval_ref TEXT,
  consent_type TEXT CHECK (consent_type IN ('full', 'limited', 'anonymized', 'exempt')),
  storage_location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Dataset Versions - Version control for datasets
CREATE TABLE IF NOT EXISTS public.dataset_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id UUID NOT NULL REFERENCES public.research_datasets(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  change_log TEXT NOT NULL,
  file_manifest JSONB DEFAULT '[]'::jsonb,
  checksum TEXT,
  total_records INTEGER,
  schema_definition JSONB,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(dataset_id, version_number)
);

-- 3. Dataset Access Requests - Controlled access
CREATE TABLE IF NOT EXISTS public.dataset_access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id UUID NOT NULL REFERENCES public.research_datasets(id) ON DELETE CASCADE,
  requester_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  intended_use TEXT,
  institution TEXT,
  ethics_approval_ref TEXT,
  data_management_plan TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revoked', 'expired')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  access_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Reproducibility Records
CREATE TABLE IF NOT EXISTS public.reproducibility_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('publication', 'research_timeline', 'research_entry')),
  target_id UUID NOT NULL,
  reproducibility_level TEXT NOT NULL DEFAULT 'not_attempted' CHECK (reproducibility_level IN ('not_attempted', 'partial', 'full', 'failed')),
  reproduction_notes TEXT,
  methodology_documented BOOLEAN DEFAULT false,
  data_available BOOLEAN DEFAULT false,
  code_available BOOLEAN DEFAULT false,
  environment_specified BOOLEAN DEFAULT false,
  reproduced_by UUID REFERENCES public.profiles(id),
  verification_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Open Science Badges
CREATE TABLE IF NOT EXISTS public.open_science_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('publication', 'research_timeline', 'dataset', 'scholar_passport')),
  target_id UUID NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('open_data', 'open_code', 'open_materials', 'reproducible_results', 'preregistered', 'transparent_methods')),
  issued_by TEXT NOT NULL DEFAULT 'system' CHECK (issued_by IN ('system', 'admin', 'institution', 'funder')),
  issuer_entity_id UUID,
  verification_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(target_type, target_id, badge_type)
);

-- 6. Dataset Usage Logs
CREATE TABLE IF NOT EXISTS public.dataset_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id UUID NOT NULL REFERENCES public.research_datasets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('view', 'download', 'cite', 'derive')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================
-- PART B: AI RESEARCH ASSISTANT
-- ===========================================

-- 7. AI Context Snapshots
CREATE TABLE IF NOT EXISTS public.ai_context_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL CHECK (context_type IN ('research_timeline', 'publication', 'dataset', 'funding_application', 'peer_review', 'career')),
  context_id UUID NOT NULL,
  context_summary TEXT NOT NULL,
  context_tokens INTEGER,
  is_active BOOLEAN DEFAULT true,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, context_type, context_id)
);

-- 8. AI Assistant Sessions
CREATE TABLE IF NOT EXISTS public.ai_assistant_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scope_type TEXT CHECK (scope_type IN ('research_timeline', 'publication', 'dataset', 'funding_application', 'peer_review', 'general')),
  scope_id UUID,
  intent TEXT NOT NULL CHECK (intent IN ('brainstorm', 'critique', 'summarize', 'plan', 'check', 'outline', 'review_response', 'methodology')),
  session_title TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- 9. AI Assistant Outputs
CREATE TABLE IF NOT EXISTS public.ai_assistant_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.ai_assistant_sessions(id) ON DELETE CASCADE,
  prompt_summary TEXT NOT NULL,
  ai_output TEXT NOT NULL,
  confidence_level TEXT NOT NULL DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
  citations_used JSONB DEFAULT '[]'::jsonb,
  tokens_used INTEGER,
  model_used TEXT,
  processing_time_ms INTEGER,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  was_helpful BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. AI Guardrail Events
CREATE TABLE IF NOT EXISTS public.ai_guardrail_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.ai_assistant_sessions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guardrail_type TEXT NOT NULL CHECK (guardrail_type IN ('hallucination_risk', 'ethical_flag', 'missing_data', 'citation_needed', 'uncertainty_high', 'sensitive_content', 'rate_limit', 'policy_violation')),
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  was_blocked BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. AI Usage Quotas
CREATE TABLE IF NOT EXISTS public.ai_usage_quotas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quota_type TEXT NOT NULL CHECK (quota_type IN ('daily', 'weekly', 'monthly')),
  tokens_used INTEGER DEFAULT 0,
  tokens_limit INTEGER NOT NULL DEFAULT 50000,
  sessions_count INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, quota_type, period_start)
);

-- ===========================================
-- PART C: CAREER & MENTORSHIP
-- ===========================================

-- 12. Career Profiles
CREATE TABLE IF NOT EXISTS public.career_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id) ON DELETE CASCADE UNIQUE,
  current_stage TEXT NOT NULL DEFAULT 'undergraduate' CHECK (current_stage IN ('undergraduate', 'masters', 'phd', 'postdoc', 'faculty', 'senior_researcher', 'emeritus', 'industry', 'independent')),
  primary_domain TEXT,
  secondary_domains TEXT[],
  career_goal_statement TEXT,
  years_in_academia INTEGER,
  is_open_to_mentoring BOOLEAN DEFAULT false,
  max_mentees INTEGER DEFAULT 3,
  mentoring_interests TEXT[],
  seeking_mentorship BOOLEAN DEFAULT false,
  mentorship_needs TEXT[],
  privacy_level TEXT DEFAULT 'connections' CHECK (privacy_level IN ('public', 'connections', 'private')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Career Milestones
CREATE TABLE IF NOT EXISTS public.career_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  career_profile_id UUID NOT NULL REFERENCES public.career_profiles(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('degree_completed', 'first_publication', 'grant_awarded', 'supervision_started', 'tenure', 'major_transition', 'award_received', 'leadership_role', 'industry_collaboration', 'teaching_excellence', 'citation_milestone')),
  title TEXT NOT NULL,
  description TEXT,
  related_entity_type TEXT CHECK (related_entity_type IN ('publication', 'funding_allocation', 'organization', 'research_timeline', 'course', 'award')),
  related_entity_id UUID,
  institution TEXT,
  achieved_at DATE NOT NULL,
  verification_status TEXT DEFAULT 'self_reported' CHECK (verification_status IN ('self_reported', 'pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES public.profiles(id),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Mentorship Relationships
CREATE TABLE IF NOT EXISTS public.mentorship_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id) ON DELETE CASCADE,
  mentee_scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id) ON DELETE CASCADE,
  mentorship_type TEXT NOT NULL CHECK (mentorship_type IN ('research', 'career', 'teaching', 'industry_transition', 'writing', 'leadership')),
  goals TEXT,
  expected_frequency TEXT CHECK (expected_frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'as_needed')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'terminated')),
  initiated_by TEXT NOT NULL CHECK (initiated_by IN ('mentor', 'mentee')),
  termination_reason TEXT,
  mentor_consent_at TIMESTAMPTZ,
  mentee_consent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT different_parties CHECK (mentor_scholar_passport_id != mentee_scholar_passport_id)
);

-- 15. Mentorship Interactions
CREATE TABLE IF NOT EXISTS public.mentorship_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentorship_relationship_id UUID NOT NULL REFERENCES public.mentorship_relationships(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('meeting', 'feedback', 'review', 'guidance', 'milestone_check', 'resource_shared', 'introduction')),
  summary TEXT,
  duration_minutes INTEGER,
  occurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Career Risk Flags
CREATE TABLE IF NOT EXISTS public.career_risk_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  career_profile_id UUID NOT NULL REFERENCES public.career_profiles(id) ON DELETE CASCADE,
  risk_type TEXT NOT NULL CHECK (risk_type IN ('publication_gap', 'funding_gap', 'isolation', 'burnout_signal', 'career_stall', 'mentorship_needed', 'skill_gap')),
  description TEXT,
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  is_visible_to_user BOOLEAN DEFAULT true
);

-- ===========================================
-- ENABLE RLS ON ALL TABLES
-- ===========================================

ALTER TABLE public.research_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reproducibility_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_science_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_context_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assistant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assistant_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_guardrail_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_risk_flags ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS POLICIES - DATASETS & OPEN SCIENCE
-- ===========================================

CREATE POLICY "Users can view open datasets" ON public.research_datasets
  FOR SELECT USING (access_level = 'open' OR owner_user_id = auth.uid());

CREATE POLICY "Owners can manage their datasets" ON public.research_datasets
  FOR ALL USING (owner_user_id = auth.uid());

CREATE POLICY "Users can view versions of accessible datasets" ON public.dataset_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.research_datasets 
      WHERE id = dataset_versions.dataset_id 
      AND (access_level = 'open' OR owner_user_id = auth.uid())
    )
  );

CREATE POLICY "Dataset owners can manage versions" ON public.dataset_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.research_datasets 
      WHERE id = dataset_versions.dataset_id 
      AND owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own access requests" ON public.dataset_access_requests
  FOR SELECT USING (requester_user_id = auth.uid());

CREATE POLICY "Dataset owners can view requests" ON public.dataset_access_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.research_datasets 
      WHERE id = dataset_access_requests.dataset_id 
      AND owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create access requests" ON public.dataset_access_requests
  FOR INSERT WITH CHECK (requester_user_id = auth.uid());

CREATE POLICY "Dataset owners can update requests" ON public.dataset_access_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.research_datasets 
      WHERE id = dataset_access_requests.dataset_id 
      AND owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Public reproducibility records" ON public.reproducibility_records
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create records" ON public.reproducibility_records
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Reproducers can update their records" ON public.reproducibility_records
  FOR UPDATE USING (reproduced_by = auth.uid());

CREATE POLICY "Public badges" ON public.open_science_badges
  FOR SELECT USING (true);

CREATE POLICY "Dataset owners can view usage" ON public.dataset_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.research_datasets 
      WHERE id = dataset_usage_logs.dataset_id 
      AND owner_user_id = auth.uid()
    )
  );

CREATE POLICY "System can log usage" ON public.dataset_usage_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ===========================================
-- RLS POLICIES - AI ASSISTANT
-- ===========================================

CREATE POLICY "Users manage own contexts" ON public.ai_context_snapshots
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users manage own sessions" ON public.ai_assistant_sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users view own outputs" ON public.ai_assistant_outputs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ai_assistant_sessions 
      WHERE id = ai_assistant_outputs.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users create outputs in sessions" ON public.ai_assistant_outputs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_assistant_sessions 
      WHERE id = ai_assistant_outputs.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users update output ratings" ON public.ai_assistant_outputs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.ai_assistant_sessions 
      WHERE id = ai_assistant_outputs.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users view own guardrails" ON public.ai_guardrail_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System creates guardrails" ON public.ai_guardrail_events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users view own quotas" ON public.ai_usage_quotas
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System manages quotas" ON public.ai_usage_quotas
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ===========================================
-- RLS POLICIES - CAREER & MENTORSHIP
-- ===========================================

CREATE POLICY "Public career profiles visible" ON public.career_profiles
  FOR SELECT USING (
    privacy_level = 'public' OR 
    EXISTS (
      SELECT 1 FROM public.scholar_passports sp 
      WHERE sp.id = career_profiles.scholar_passport_id 
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage own career profile" ON public.career_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.scholar_passports sp 
      WHERE sp.id = career_profiles.scholar_passport_id 
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Public milestones visible" ON public.career_milestones
  FOR SELECT USING (
    is_public = true OR 
    EXISTS (
      SELECT 1 FROM public.career_profiles cp
      JOIN public.scholar_passports sp ON sp.id = cp.scholar_passport_id
      WHERE cp.id = career_milestones.career_profile_id 
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage own milestones" ON public.career_milestones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.career_profiles cp
      JOIN public.scholar_passports sp ON sp.id = cp.scholar_passport_id
      WHERE cp.id = career_milestones.career_profile_id 
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants view mentorships" ON public.mentorship_relationships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scholar_passports sp 
      WHERE sp.user_id = auth.uid() 
      AND (sp.id = mentorship_relationships.mentor_scholar_passport_id 
           OR sp.id = mentorship_relationships.mentee_scholar_passport_id)
    )
  );

CREATE POLICY "Users create mentorship requests" ON public.mentorship_relationships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scholar_passports sp 
      WHERE sp.user_id = auth.uid() 
      AND (sp.id = mentorship_relationships.mentor_scholar_passport_id 
           OR sp.id = mentorship_relationships.mentee_scholar_passport_id)
    )
  );

CREATE POLICY "Participants update mentorships" ON public.mentorship_relationships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.scholar_passports sp 
      WHERE sp.user_id = auth.uid() 
      AND (sp.id = mentorship_relationships.mentor_scholar_passport_id 
           OR sp.id = mentorship_relationships.mentee_scholar_passport_id)
    )
  );

CREATE POLICY "Participants view interactions" ON public.mentorship_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mentorship_relationships mr
      JOIN public.scholar_passports sp ON sp.user_id = auth.uid()
      WHERE mr.id = mentorship_interactions.mentorship_relationship_id
      AND (sp.id = mr.mentor_scholar_passport_id OR sp.id = mr.mentee_scholar_passport_id)
    )
  );

CREATE POLICY "Participants log interactions" ON public.mentorship_interactions
  FOR INSERT WITH CHECK (logged_by = auth.uid());

CREATE POLICY "Users view own risk flags" ON public.career_risk_flags
  FOR SELECT USING (
    is_visible_to_user = true AND EXISTS (
      SELECT 1 FROM public.career_profiles cp
      JOIN public.scholar_passports sp ON sp.id = cp.scholar_passport_id
      WHERE cp.id = career_risk_flags.career_profile_id 
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "System manages risk flags" ON public.career_risk_flags
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_research_datasets_owner ON public.research_datasets(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_research_datasets_timeline ON public.research_datasets(research_timeline_id);
CREATE INDEX IF NOT EXISTS idx_research_datasets_access ON public.research_datasets(access_level);
CREATE INDEX IF NOT EXISTS idx_dataset_versions_dataset ON public.dataset_versions(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_access_requests_dataset ON public.dataset_access_requests(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_access_requests_requester ON public.dataset_access_requests(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_reproducibility_target ON public.reproducibility_records(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_open_science_badges_target ON public.open_science_badges(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_dataset_usage_dataset ON public.dataset_usage_logs(dataset_id);

CREATE INDEX IF NOT EXISTS idx_ai_context_user ON public.ai_context_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON public.ai_assistant_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_session ON public.ai_assistant_outputs(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_guardrails_session ON public.ai_guardrail_events(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_quotas_user ON public.ai_usage_quotas(user_id);

CREATE INDEX IF NOT EXISTS idx_career_profiles_passport ON public.career_profiles(scholar_passport_id);
CREATE INDEX IF NOT EXISTS idx_career_milestones_profile ON public.career_milestones(career_profile_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_mentor ON public.mentorship_relationships(mentor_scholar_passport_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_mentee ON public.mentorship_relationships(mentee_scholar_passport_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_interactions_rel ON public.mentorship_interactions(mentorship_relationship_id);
CREATE INDEX IF NOT EXISTS idx_career_risk_profile ON public.career_risk_flags(career_profile_id);

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Auto-create career profile when scholar passport is created
CREATE OR REPLACE FUNCTION public.create_career_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.career_profiles (scholar_passport_id, current_stage, primary_domain)
  VALUES (NEW.id, COALESCE(NEW.academic_role, 'undergraduate'), NULL)
  ON CONFLICT (scholar_passport_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_scholar_passport_created_career ON public.scholar_passports;
CREATE TRIGGER on_scholar_passport_created_career
  AFTER INSERT ON public.scholar_passports
  FOR EACH ROW
  EXECUTE FUNCTION public.create_career_profile();

-- Auto-release embargo when date passes
CREATE OR REPLACE FUNCTION public.release_expired_embargoes()
RETURNS void AS $$
BEGIN
  UPDATE public.research_datasets
  SET access_level = 'open', updated_at = now()
  WHERE access_level = 'embargoed' 
  AND embargo_until IS NOT NULL 
  AND embargo_until <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Track dataset version on insert
CREATE OR REPLACE FUNCTION public.auto_increment_dataset_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM public.dataset_versions WHERE dataset_id = NEW.dataset_id;
  NEW.version_number := next_version;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS auto_dataset_version ON public.dataset_versions;
CREATE TRIGGER auto_dataset_version
  BEFORE INSERT ON public.dataset_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_increment_dataset_version();
