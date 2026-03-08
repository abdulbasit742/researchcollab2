
-- Autonomous AI Agent Network (AIAN)

-- Platform event log for AI consumption
CREATE TABLE public.aian_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  actor_id uuid,
  institution_id uuid,
  payload jsonb DEFAULT '{}',
  processed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- AI agent run log
CREATE TABLE public.aian_agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type text NOT NULL,
  status text NOT NULL DEFAULT 'running',
  events_processed integer DEFAULT 0,
  insights_generated integer DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  error_message text
);

-- AI-generated insights & recommendations
CREATE TABLE public.aian_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type text NOT NULL,
  agent_run_id uuid REFERENCES public.aian_agent_runs(id),
  insight_type text NOT NULL,
  title text NOT NULL,
  summary text,
  confidence_score numeric DEFAULT 0,
  priority text DEFAULT 'medium',
  target_user_id uuid,
  target_institution_id uuid,
  target_entity_id uuid,
  target_entity_type text,
  action_suggested text,
  action_url text,
  metadata jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Personalized opportunity feed items
CREATE TABLE public.aian_feed_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feed_type text NOT NULL DEFAULT 'opportunity',
  title text NOT NULL,
  description text,
  relevance_score numeric DEFAULT 0,
  source_agent text,
  source_insight_id uuid REFERENCES public.aian_insights(id),
  action_url text,
  is_seen boolean DEFAULT false,
  is_acted boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Knowledge synthesis reports
CREATE TABLE public.aian_knowledge_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  report_type text NOT NULL DEFAULT 'trend',
  title text NOT NULL,
  content text,
  key_findings jsonb DEFAULT '[]',
  data_sources integer DEFAULT 0,
  generated_by text DEFAULT 'knowledge_synthesis',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.aian_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aian_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aian_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aian_feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aian_knowledge_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read events" ON public.aian_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert events" ON public.aian_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can read agent runs" ON public.aian_agent_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert agent runs" ON public.aian_agent_runs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "System can update agent runs" ON public.aian_agent_runs FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read own insights" ON public.aian_insights FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert insights" ON public.aian_insights FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own insights" ON public.aian_insights FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users read own feed" ON public.aian_feed_items FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System can insert feed items" ON public.aian_feed_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own feed items" ON public.aian_feed_items FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Authenticated can read reports" ON public.aian_knowledge_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert reports" ON public.aian_knowledge_reports FOR INSERT TO authenticated WITH CHECK (true);
