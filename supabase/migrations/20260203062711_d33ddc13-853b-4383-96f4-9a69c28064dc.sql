-- ============================================
-- PHASE 9: MONETIZATION, ANALYTICS, LEARNING & SECURITY (CORRECTED)
-- ============================================

-- ==========================================
-- SECTION 1: SUBSCRIPTION ENHANCEMENTS
-- ==========================================

-- Add missing columns to existing subscription_tiers if needed
ALTER TABLE public.subscription_tiers 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS max_saved_searches INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS max_boosts_monthly INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS advanced_analytics BOOLEAN DEFAULT false;

-- Feature entitlements (fine-grained gating)
CREATE TABLE IF NOT EXISTS public.feature_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  min_tier_name TEXT NOT NULL DEFAULT 'Free',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Paid boosts (one-off monetization)
CREATE TABLE IF NOT EXISTS public.paid_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('profile', 'project', 'post', 'job')),
  entity_id UUID NOT NULL,
  boost_type TEXT NOT NULL CHECK (boost_type IN ('visibility', 'highlight', 'featured')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI credit transactions
CREATE TABLE IF NOT EXISTS public.ai_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'grant', 'use', 'refund', 'expire')),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- SECTION 2: ANALYTICS & INTELLIGENCE
-- ==========================================

-- Analytics events (raw, append-only)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics snapshots (pre-aggregated)
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type TEXT NOT NULL CHECK (scope_type IN ('user', 'organization', 'platform')),
  scope_id UUID,
  metric_key TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  period_start DATE NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(scope_type, scope_id, metric_key, period, period_start)
);

-- Profile analytics (user-facing)
CREATE TABLE IF NOT EXISTS public.profile_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_views INTEGER NOT NULL DEFAULT 0,
  search_appearances INTEGER NOT NULL DEFAULT 0,
  connection_requests_received INTEGER NOT NULL DEFAULT 0,
  endorsements_received INTEGER NOT NULL DEFAULT 0,
  publication_views INTEGER NOT NULL DEFAULT 0,
  post_impressions INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project analytics
CREATE TABLE IF NOT EXISTS public.project_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE,
  views INTEGER NOT NULL DEFAULT 0,
  bids_count INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  avg_bid_amount NUMERIC DEFAULT 0,
  completion_rate NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- SECTION 3: LEARNING & COURSES
-- ==========================================

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('research_methods', 'academic_writing', 'statistics', 'ai_ml', 'ethics', 'tools', 'career', 'other')),
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  language TEXT DEFAULT 'en',
  thumbnail_url TEXT,
  instructor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  instructor_org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  estimated_hours NUMERIC,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  total_enrollments INTEGER NOT NULL DEFAULT 0,
  avg_rating NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Course modules
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  module_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Course lessons
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('video', 'article', 'quiz', 'assignment', 'resource')),
  content_url TEXT,
  content_text TEXT,
  lesson_order INTEGER NOT NULL DEFAULT 1,
  duration_minutes INTEGER,
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
  progress_percent NUMERIC NOT NULL DEFAULT 0,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(course_id, user_id)
);

-- Lesson progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE(lesson_id, user_id)
);

-- Course certificates
CREATE TABLE IF NOT EXISTS public.course_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  verification_hash TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  certificate_url TEXT,
  is_revoked BOOLEAN DEFAULT false,
  revoked_reason TEXT,
  UNIQUE(course_id, user_id)
);

-- Course reviews
CREATE TABLE IF NOT EXISTS public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  is_verified_enrollment BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- ==========================================
-- SECTION 4: SECURITY & COMPLIANCE
-- ==========================================

-- Policy acceptances (legal compliance) - add if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'policy_acceptances') THEN
    CREATE TABLE public.policy_acceptances (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      policy_type TEXT NOT NULL CHECK (policy_type IN ('terms_of_service', 'privacy_policy', 'cookie_policy', 'ai_disclosure', 'data_processing')),
      policy_version TEXT NOT NULL,
      accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ip_address INET,
      user_agent TEXT,
      UNIQUE(user_id, policy_type, policy_version)
    );
  END IF;
END $$;

-- Admin role scopes
CREATE TABLE IF NOT EXISTS public.admin_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('super_admin', 'moderator', 'read_only', 'finance', 'support')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, scope)
);

-- RLS audit checklist (internal tracking)
CREATE TABLE IF NOT EXISTS public.rls_audit_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL UNIQUE,
  has_rls_enabled BOOLEAN DEFAULT false,
  select_policy_verified BOOLEAN DEFAULT false,
  insert_policy_verified BOOLEAN DEFAULT false,
  update_policy_verified BOOLEAN DEFAULT false,
  delete_policy_verified BOOLEAN DEFAULT false,
  cross_user_tested BOOLEAN DEFAULT false,
  blocked_user_tested BOOLEAN DEFAULT false,
  admin_access_tested BOOLEAN DEFAULT false,
  last_audited_at TIMESTAMPTZ,
  audited_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- SECTION 5: SEED DATA
-- ==========================================

-- Seed feature entitlements
INSERT INTO public.feature_entitlements (feature_key, display_name, description, min_tier_name)
VALUES
  ('advanced_search_filters', 'Advanced Search Filters', 'Filter by trust score, verification, location, and more', 'Pro'),
  ('profile_analytics', 'Profile Analytics', 'See who viewed your profile and search appearances', 'Pro'),
  ('skill_endorsement_insights', 'Skill Insights', 'Detailed endorsement analytics and recommendations', 'Pro'),
  ('unlimited_saved_searches', 'Unlimited Saved Searches', 'Save and get alerts for search results', 'Pro'),
  ('inmail_messaging', 'InMail Messaging', 'Message anyone even without connection', 'Elite'),
  ('boosted_visibility', 'Boosted Visibility', 'Appear higher in search and discovery', 'Elite'),
  ('ai_matching_insights', 'AI Matching Insights', 'Advanced AI-powered collaboration recommendations', 'Elite'),
  ('priority_support', 'Priority Support', '24-hour response time guarantee', 'Elite'),
  ('bulk_licenses', 'Bulk Licenses', 'Manage team subscriptions', 'Institution'),
  ('compliance_exports', 'Compliance Exports', 'Export data for institutional compliance', 'Institution'),
  ('analytics_dashboard', 'Organization Analytics', 'Full organizational analytics dashboard', 'Institution')
ON CONFLICT (feature_key) DO NOTHING;

-- ==========================================
-- SECTION 6: RLS POLICIES
-- ==========================================

-- Enable RLS on all new tables
ALTER TABLE public.feature_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paid_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rls_audit_checklist ENABLE ROW LEVEL SECURITY;

-- Feature entitlements (public read)
CREATE POLICY "Anyone can view feature entitlements" ON public.feature_entitlements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage entitlements" ON public.feature_entitlements FOR ALL USING (public.is_admin(auth.uid()));

-- Paid boosts
CREATE POLICY "Users can view own boosts" ON public.paid_boosts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own boosts" ON public.paid_boosts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage boosts" ON public.paid_boosts FOR ALL USING (public.is_admin(auth.uid()));

-- AI credit transactions
CREATE POLICY "Users can view own credit transactions" ON public.ai_credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert credit transactions" ON public.ai_credit_transactions FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Analytics events (write-only for users)
CREATE POLICY "Users can insert analytics events" ON public.analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can read analytics events" ON public.analytics_events FOR SELECT USING (public.is_admin(auth.uid()));

-- Analytics snapshots
CREATE POLICY "Users can view own analytics snapshots" ON public.analytics_snapshots FOR SELECT USING (
  (scope_type = 'user' AND scope_id = auth.uid()) OR public.is_admin(auth.uid())
);
CREATE POLICY "Admins can manage snapshots" ON public.analytics_snapshots FOR ALL USING (public.is_admin(auth.uid()));

-- Profile analytics
CREATE POLICY "Users can view own profile analytics" ON public.profile_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can update profile analytics" ON public.profile_analytics FOR ALL USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- Project analytics
CREATE POLICY "Admins can manage project analytics" ON public.project_analytics FOR ALL USING (public.is_admin(auth.uid()));

-- Courses
CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (is_published = true OR instructor_user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Instructors can create courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() = instructor_user_id);
CREATE POLICY "Instructors can update own courses" ON public.courses FOR UPDATE USING (auth.uid() = instructor_user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete courses" ON public.courses FOR DELETE USING (public.is_admin(auth.uid()));

-- Course modules
CREATE POLICY "Anyone can view modules of published courses" ON public.course_modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND (is_published = true OR instructor_user_id = auth.uid()))
);
CREATE POLICY "Instructors can manage modules" ON public.course_modules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_user_id = auth.uid()) OR public.is_admin(auth.uid())
);

-- Course lessons
CREATE POLICY "Enrolled users can view lessons" ON public.course_lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.course_modules m
    JOIN public.courses c ON m.course_id = c.id
    WHERE m.id = module_id AND (
      c.is_published = true AND (
        is_preview = true OR
        EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_id = c.id AND user_id = auth.uid())
      )
      OR c.instructor_user_id = auth.uid()
    )
  )
);
CREATE POLICY "Instructors can manage lessons" ON public.course_lessons FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.course_modules m
    JOIN public.courses c ON m.course_id = c.id
    WHERE m.id = module_id AND c.instructor_user_id = auth.uid()
  ) OR public.is_admin(auth.uid())
);

-- Course enrollments
CREATE POLICY "Users can view own enrollments" ON public.course_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll themselves" ON public.course_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON public.course_enrollments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage enrollments" ON public.course_enrollments FOR ALL USING (public.is_admin(auth.uid()));

-- Lesson progress
CREATE POLICY "Users can manage own lesson progress" ON public.lesson_progress FOR ALL USING (auth.uid() = user_id);

-- Course certificates
CREATE POLICY "Anyone can verify certificates" ON public.course_certificates FOR SELECT USING (true);
CREATE POLICY "System can issue certificates" ON public.course_certificates FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage certificates" ON public.course_certificates FOR ALL USING (public.is_admin(auth.uid()));

-- Course reviews
CREATE POLICY "Anyone can view course reviews" ON public.course_reviews FOR SELECT USING (true);
CREATE POLICY "Enrolled users can create reviews" ON public.course_reviews FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_id = course_reviews.course_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own reviews" ON public.course_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete reviews" ON public.course_reviews FOR DELETE USING (public.is_admin(auth.uid()));

-- Admin scopes
CREATE POLICY "Users can view own admin scopes" ON public.admin_scopes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage admin scopes" ON public.admin_scopes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_scopes WHERE user_id = auth.uid() AND scope = 'super_admin' AND is_active = true)
  OR public.is_admin(auth.uid())
);

-- RLS audit checklist (admins only)
CREATE POLICY "Admins can manage RLS audit" ON public.rls_audit_checklist FOR ALL USING (public.is_admin(auth.uid()));

-- ==========================================
-- SECTION 7: INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_paid_boosts_user ON public.paid_boosts(user_id);
CREATE INDEX IF NOT EXISTS idx_paid_boosts_entity ON public.paid_boosts(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_scope ON public.analytics_snapshots(scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses(instructor_user_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_certificates_user ON public.course_certificates(user_id);