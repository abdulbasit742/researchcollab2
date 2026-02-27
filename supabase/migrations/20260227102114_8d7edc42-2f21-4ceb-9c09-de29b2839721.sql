
-- =====================================================
-- NEURO-RESPONSIBLE UX & COGNITIVE WELLNESS ENGINE
-- =====================================================

-- 1. Session-Based Feed Tracking (Section 1, 2)
CREATE TABLE IF NOT EXISTS public.user_feed_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_intent TEXT,
  items_loaded INTEGER DEFAULT 0,
  deep_engagement_count INTEGER DEFAULT 0,
  passive_scroll_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  reflection_completed BOOLEAN DEFAULT false
);

-- 2. Time Awareness Metrics (Section 2)
CREATE TABLE IF NOT EXISTS public.time_awareness_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  period TEXT NOT NULL,
  total_time_seconds INTEGER DEFAULT 0,
  learning_time_seconds INTEGER DEFAULT 0,
  collaboration_time_seconds INTEGER DEFAULT 0,
  browsing_time_seconds INTEGER DEFAULT 0,
  deep_engagement_ratio NUMERIC DEFAULT 0,
  professional_value_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Notification Preferences (Section 3)
CREATE TABLE IF NOT EXISTS public.notification_tier_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tier1_enabled BOOLEAN DEFAULT true,
  tier2_enabled BOOLEAN DEFAULT true,
  tier3_enabled BOOLEAN DEFAULT true,
  tier3_batched BOOLEAN DEFAULT true,
  batch_delivery_time TEXT DEFAULT '09:00',
  scheduled_delivery BOOLEAN DEFAULT false,
  schedule_times TEXT[] DEFAULT '{"09:00","14:00","18:00"}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Focus Mode Sessions (Section 9)
CREATE TABLE IF NOT EXISTS public.focus_mode_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  hide_social_feed BOOLEAN DEFAULT true,
  silence_non_critical BOOLEAN DEFAULT true,
  daily_goals JSONB DEFAULT '[]',
  active_deliverables TEXT[] DEFAULT '{}',
  funding_deadlines JSONB DEFAULT '[]',
  collaboration_commitments JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- 5. Healthy Engagement Scores (Section 11)
CREATE TABLE IF NOT EXISTS public.healthy_engagement_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  deep_reading_count INTEGER DEFAULT 0,
  structured_feedback_count INTEGER DEFAULT 0,
  collaboration_initiation_count INTEGER DEFAULT 0,
  funding_application_count INTEGER DEFAULT 0,
  skill_development_count INTEGER DEFAULT 0,
  composite_health_score NUMERIC DEFAULT 0,
  period TEXT NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Weekly Reflection Reports (Section 12)
CREATE TABLE IF NOT EXISTS public.weekly_reflection_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  projects_progressed INTEGER DEFAULT 0,
  skills_improved INTEGER DEFAULT 0,
  collaborations_initiated INTEGER DEFAULT 0,
  funding_explored INTEGER DEFAULT 0,
  value_generated NUMERIC DEFAULT 0,
  passive_browsing_pct NUMERIC DEFAULT 0,
  reflection_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Growth Visualizations (Section 14)
CREATE TABLE IF NOT EXISTS public.long_term_growth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_mastery_score NUMERIC DEFAULT 0,
  funding_trajectory NUMERIC DEFAULT 0,
  collaboration_network_size INTEGER DEFAULT 0,
  innovation_impact_cumulative NUMERIC DEFAULT 0,
  reliability_score NUMERIC DEFAULT 0,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Delayed Metric Preferences (Section 7)
CREATE TABLE IF NOT EXISTS public.metric_visibility_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  hide_like_counts BOOLEAN DEFAULT true,
  hide_view_counts BOOLEAN DEFAULT true,
  hide_follower_count BOOLEAN DEFAULT true,
  show_engagement_on_expand BOOLEAN DEFAULT true,
  emphasize_qualitative BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_feed_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_awareness_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_tier_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_mode_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthy_engagement_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reflection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.long_term_growth_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_visibility_preferences ENABLE ROW LEVEL SECURITY;

-- RLS: Owner only
CREATE POLICY "Own read feed_sessions" ON public.user_feed_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own insert feed_sessions" ON public.user_feed_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update feed_sessions" ON public.user_feed_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Own read time_awareness" ON public.time_awareness_metrics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own insert time_awareness" ON public.time_awareness_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own read notif_prefs" ON public.notification_tier_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own insert notif_prefs" ON public.notification_tier_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update notif_prefs" ON public.notification_tier_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Own read focus_mode" ON public.focus_mode_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own insert focus_mode" ON public.focus_mode_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update focus_mode" ON public.focus_mode_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Own read engagement_scores" ON public.healthy_engagement_scores FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own insert engagement_scores" ON public.healthy_engagement_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own read reflections" ON public.weekly_reflection_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own insert reflections" ON public.weekly_reflection_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own read growth_snapshots" ON public.long_term_growth_snapshots FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own insert growth_snapshots" ON public.long_term_growth_snapshots FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own read metric_prefs" ON public.metric_visibility_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own insert metric_prefs" ON public.metric_visibility_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update metric_prefs" ON public.metric_visibility_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);
