
-- Agent Registry: formal catalog of all AI agents
CREATE TABLE public.aian_agent_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key text UNIQUE NOT NULL,
  agent_name text NOT NULL,
  agent_type text NOT NULL DEFAULT 'autonomous',
  description text,
  capabilities jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active',
  version text DEFAULT '1.0.0',
  config jsonb DEFAULT '{}'::jsonb,
  permission_scopes text[] DEFAULT '{}',
  max_concurrency int DEFAULT 1,
  last_active_at timestamptz,
  tasks_completed int DEFAULT 0,
  total_errors int DEFAULT 0,
  avg_response_ms int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.aian_agent_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read agent registry" ON public.aian_agent_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage agent registry" ON public.aian_agent_registry FOR ALL TO service_role USING (true);

-- Agent Task Queue
CREATE TABLE public.aian_task_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key text NOT NULL,
  task_type text NOT NULL,
  priority text DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending',
  payload jsonb DEFAULT '{}'::jsonb,
  result jsonb,
  error_message text,
  retry_count int DEFAULT 0,
  max_retries int DEFAULT 3,
  scheduled_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.aian_task_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read task queue" ON public.aian_task_queue FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create tasks" ON public.aian_task_queue FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Service role can manage tasks" ON public.aian_task_queue FOR ALL TO service_role USING (true);

-- Agent Communication Bus (event signals between agents)
CREATE TABLE public.aian_agent_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_agent text NOT NULL,
  target_agent text,
  signal_type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  acknowledged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.aian_agent_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read signals" ON public.aian_agent_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage signals" ON public.aian_agent_signals FOR ALL TO service_role USING (true);

-- Seed the agent registry with existing agent types
INSERT INTO public.aian_agent_registry (agent_key, agent_name, agent_type, description, capabilities, permission_scopes) VALUES
  ('opportunity_discovery', 'Opportunity Discovery Agent', 'autonomous', 'Scans platform for new collaboration and funding opportunities', '["scan_projects","match_opportunities","generate_recommendations"]', '{"read:projects","read:offers","read:contacts"}'),
  ('talent_matching', 'Talent Matching Agent', 'autonomous', 'Matches researchers and professionals to project requirements', '["analyze_skills","match_profiles","rank_candidates"]', '{"read:profiles","read:projects","read:capabilities"}'),
  ('growth', 'Growth Agent', 'autonomous', 'Identifies growth levers and suggests engagement campaigns', '["analyze_trends","suggest_campaigns","track_activation"]', '{"read:analytics","read:contacts"}'),
  ('sponsor_discovery', 'Sponsor Discovery Agent', 'autonomous', 'Identifies potential sponsors and funding sources', '["scan_sponsors","analyze_fit","generate_leads"]', '{"read:contacts","read:offers"}'),
  ('market_intelligence', 'Market Intelligence Agent', 'autonomous', 'Gathers market insights and competitive intelligence', '["analyze_market","track_trends","generate_reports"]', '{"read:analytics"}'),
  ('knowledge_synthesis', 'Knowledge Synthesis Agent', 'autonomous', 'Synthesizes research outputs into actionable knowledge', '["analyze_papers","summarize_datasets","link_knowledge"]', '{"read:research","read:datasets"}'),
  ('operator_assistant', 'Operator Assistant Agent', 'autonomous', 'Assists platform operators with routine tasks and monitoring', '["monitor_health","suggest_actions","automate_responses"]', '{"read:system","read:conversations"}'),
  ('sponsor_intake', 'Sponsor Intake Agent', 'conversational', 'Captures and structures sponsor problem statements from conversations', '["parse_problems","classify_domains","estimate_budgets"]', '{"read:conversations","write:intake"}'),
  ('institution_onboarding', 'Institution Onboarding Agent', 'conversational', 'Guides institutions through platform onboarding', '["collect_info","validate_data","register_institution"]', '{"read:conversations","write:onboarding"}'),
  ('personal_assistant', 'Personal AI Assistant', 'conversational', 'Helps users navigate opportunities and manage projects', '["chat","recommend","summarize"]', '{"read:projects","read:offers","read:profiles"}');

ALTER PUBLICATION supabase_realtime ADD TABLE public.aian_task_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aian_agent_signals;
