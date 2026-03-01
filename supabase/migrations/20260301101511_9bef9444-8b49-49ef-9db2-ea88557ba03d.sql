
-- Automation Rules
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  rule_type TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  trigger_condition JSONB NOT NULL DEFAULT '{}',
  action_type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Authenticated read automation rules" ON public.automation_rules FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Authenticated insert automation rules" ON public.automation_rules FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Authenticated update automation rules" ON public.automation_rules FOR UPDATE USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_auto_rules_inst ON public.automation_rules(institution_id, enabled);

-- Milestone Templates
CREATE TABLE IF NOT EXISTS public.milestone_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  default_tasks JSONB NOT NULL DEFAULT '[]',
  default_review_points INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.milestone_templates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Authenticated read milestone templates" ON public.milestone_templates FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Authenticated insert milestone templates" ON public.milestone_templates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_milestone_tmpl_inst ON public.milestone_templates(institution_id);

-- Workflow Escalations
CREATE TABLE IF NOT EXISTS public.workflow_escalations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  escalation_type TEXT NOT NULL,
  institution_id UUID,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.workflow_escalations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Authenticated read escalations" ON public.workflow_escalations FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Authenticated insert escalations" ON public.workflow_escalations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_escalations_entity ON public.workflow_escalations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_escalations_inst ON public.workflow_escalations(institution_id, triggered_at DESC);

-- Deadline Suggestions
CREATE TABLE IF NOT EXISTS public.deadline_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID NOT NULL,
  suggested_date DATE NOT NULL,
  based_on TEXT NOT NULL DEFAULT 'historical_velocity',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deadline_suggestions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Authenticated read deadline suggestions" ON public.deadline_suggestions FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_deadline_sugg_ms ON public.deadline_suggestions(milestone_id, generated_at DESC);

-- Derived Project Status
CREATE TABLE IF NOT EXISTS public.derived_project_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  status_label TEXT NOT NULL DEFAULT 'healthy',
  derived_from JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.derived_project_status ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Authenticated read derived status" ON public.derived_project_status FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_derived_status_proj ON public.derived_project_status(project_id, generated_at DESC);

-- Review Routing Rules
CREATE TABLE IF NOT EXISTS public.review_routing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  routing_logic JSONB NOT NULL DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.review_routing_rules ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Authenticated read routing rules" ON public.review_routing_rules FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Authenticated insert routing rules" ON public.review_routing_rules FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_routing_rules_inst ON public.review_routing_rules(institution_id, enabled);

-- Auto Archive Settings
CREATE TABLE IF NOT EXISTS public.auto_archive_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL UNIQUE,
  archive_after_days INT NOT NULL DEFAULT 90,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.auto_archive_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Authenticated read archive settings" ON public.auto_archive_settings FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Authenticated upsert archive settings" ON public.auto_archive_settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Authenticated update archive settings" ON public.auto_archive_settings FOR UPDATE USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Automation Logs (append-only)
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_type TEXT NOT NULL DEFAULT 'system',
  automation_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  action_taken TEXT NOT NULL,
  institution_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Authenticated read automation logs" ON public.automation_logs FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Authenticated insert automation logs" ON public.automation_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_auto_logs_inst ON public.automation_logs(institution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auto_logs_type ON public.automation_logs(automation_type);
