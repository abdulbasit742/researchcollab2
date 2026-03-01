
-- Activation Funnel Events
CREATE TABLE public.activation_funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_type)
);
ALTER TABLE public.activation_funnel_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own activation events" ON public.activation_funnel_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own activation events" ON public.activation_funnel_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_activation_funnel_user ON public.activation_funnel_events(user_id);

-- Project Momentum Metrics
CREATE TABLE public.project_momentum_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  weekly_activity_count INT NOT NULL DEFAULT 0,
  milestone_velocity NUMERIC(5,2) DEFAULT 0,
  task_completion_velocity NUMERIC(5,2) DEFAULT 0,
  engagement_score NUMERIC(5,2) DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_momentum_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read momentum" ON public.project_momentum_metrics FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_momentum_project ON public.project_momentum_metrics(project_id);

-- Inactivity Flags
CREATE TABLE public.inactivity_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  inactivity_days INT NOT NULL DEFAULT 0,
  flagged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dismissed BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE public.inactivity_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read inactivity" ON public.inactivity_flags FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users dismiss inactivity" ON public.inactivity_flags FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_inactivity_entity ON public.inactivity_flags(entity_type, entity_id);

-- Platform Reminders
CREATE TABLE public.platform_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dismissed BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE public.platform_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own reminders" ON public.platform_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users dismiss own reminders" ON public.platform_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_reminders_user ON public.platform_reminders(user_id, dismissed);

-- Institution Engagement Metrics
CREATE TABLE public.institution_engagement_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  active_users_7d INT NOT NULL DEFAULT 0,
  active_projects_7d INT NOT NULL DEFAULT 0,
  completion_rate NUMERIC(5,2) DEFAULT 0,
  review_turnaround_avg NUMERIC(8,2) DEFAULT 0,
  dispute_ratio NUMERIC(5,4) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institution_engagement_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read institution metrics" ON public.institution_engagement_metrics FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_inst_engagement ON public.institution_engagement_metrics(institution_id, generated_at DESC);
