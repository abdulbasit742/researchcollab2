
-- Knowledge Monitor Profiles
CREATE TABLE public.knowledge_monitor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.research_workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  monitoring_scope TEXT NOT NULL DEFAULT 'claims',
  frequency TEXT NOT NULL DEFAULT 'weekly',
  drift_sensitivity_level TEXT NOT NULL DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  last_scan_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_monitor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own monitor profiles" ON public.knowledge_monitor_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Drift Events
CREATE TABLE public.drift_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.research_workspaces(id) ON DELETE CASCADE NOT NULL,
  drift_type TEXT NOT NULL,
  related_claim_ids UUID[] DEFAULT '{}',
  affected_policy_model_ids UUID[] DEFAULT '{}',
  affected_funding_plan_ids UUID[] DEFAULT '{}',
  impact_score NUMERIC DEFAULT 0,
  confidence_score NUMERIC DEFAULT 0.5,
  summary TEXT,
  detection_trace JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'medium',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drift_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view workspace drift events" ON public.drift_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.research_workspaces w WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR w.visibility = 'public'))
  );
CREATE POLICY "System can insert drift events" ON public.drift_events
  FOR INSERT WITH CHECK (true);

-- Monitor Alerts
CREATE TABLE public.monitor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drift_event_id UUID REFERENCES public.drift_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  alert_status TEXT NOT NULL DEFAULT 'new',
  priority_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  viewed_at TIMESTAMPTZ
);

ALTER TABLE public.monitor_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own alerts" ON public.monitor_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.monitor_alerts;
