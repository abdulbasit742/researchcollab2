
-- ============================================================
-- OMNICHANNEL AI AGENT ECOSYSTEM — EXPANDED SCHEMA
-- Systems 9-50 additive tables
-- ============================================================

-- Agent Runs: Track every AI agent execution
CREATE TABLE public.omni_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.omni_conversations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE SET NULL,
  agent_type TEXT NOT NULL DEFAULT 'orchestrator',
  sub_agent TEXT,
  intent_detected TEXT,
  entities_extracted JSONB DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0,
  tools_called JSONB DEFAULT '[]',
  response_generated TEXT,
  should_escalate BOOLEAN DEFAULT false,
  escalation_reason TEXT,
  latency_ms INTEGER,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agent Decisions: Audit trail for agent routing decisions
CREATE TABLE public.omni_agent_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.omni_agent_runs(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL,
  decision_value TEXT NOT NULL,
  reasoning TEXT,
  confidence NUMERIC DEFAULT 0,
  alternatives JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Support Tickets
CREATE TABLE public.omni_support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.omni_conversations(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  assigned_to TEXT,
  resolution TEXT,
  sla_target_hours INTEGER DEFAULT 24,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lead Records: Enhanced CRM lead tracking
CREATE TABLE public.omni_lead_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE CASCADE NOT NULL,
  lead_source TEXT DEFAULT 'organic',
  channel_source TEXT DEFAULT 'webchat',
  persona_fit TEXT,
  budget_signal TEXT,
  urgency_signal TEXT,
  decision_maker_confidence NUMERIC DEFAULT 0,
  organization_size TEXT,
  institution_type TEXT,
  country TEXT,
  industry TEXT,
  interest_domain TEXT,
  engagement_depth NUMERIC DEFAULT 0,
  demo_intent BOOLEAN DEFAULT false,
  product_fit_score NUMERIC DEFAULT 0,
  conversion_probability NUMERIC DEFAULT 0,
  pipeline_stage TEXT DEFAULT 'new_lead',
  estimated_contract_value NUMERIC DEFAULT 0,
  sales_cycle_days INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sales Pipelines
CREATE TABLE public.omni_sales_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_name TEXT NOT NULL,
  pipeline_type TEXT NOT NULL DEFAULT 'institution',
  stages JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks & Follow-ups
CREATE TABLE public.omni_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.omni_conversations(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.omni_lead_records(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL DEFAULT 'follow_up',
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  assigned_to TEXT,
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Operator Notes
CREATE TABLE public.omni_operator_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.omni_conversations(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.omni_lead_records(id) ON DELETE SET NULL,
  note_text TEXT NOT NULL,
  note_type TEXT DEFAULT 'general',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Delivery Logs
CREATE TABLE public.omni_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID,
  conversation_id UUID REFERENCES public.omni_conversations(id) ON DELETE SET NULL,
  channel_type TEXT NOT NULL,
  delivery_state TEXT DEFAULT 'pending',
  external_message_id TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Message Templates
CREATE TABLE public.omni_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  channel_type TEXT NOT NULL DEFAULT 'all',
  category TEXT DEFAULT 'general',
  content_template TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_approved BOOLEAN DEFAULT false,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Offer Recommendations
CREATE TABLE public.omni_offer_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.omni_lead_records(id) ON DELETE SET NULL,
  offer_type TEXT NOT NULL,
  offer_name TEXT NOT NULL,
  match_score NUMERIC DEFAULT 0,
  reasoning TEXT,
  status TEXT DEFAULT 'pending',
  presented_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversion Predictions
CREATE TABLE public.omni_conversion_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.omni_lead_records(id) ON DELETE SET NULL,
  prediction_type TEXT NOT NULL DEFAULT 'conversion',
  probability NUMERIC DEFAULT 0,
  best_next_message TEXT,
  best_channel TEXT,
  best_send_time TIMESTAMPTZ,
  model_version TEXT DEFAULT 'v1',
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- SLA Targets
CREATE TABLE public.omni_sla_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_name TEXT NOT NULL,
  persona_type TEXT,
  priority TEXT DEFAULT 'medium',
  first_response_minutes INTEGER DEFAULT 60,
  resolution_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Channel Health
CREATE TABLE public.omni_channel_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_type TEXT NOT NULL,
  status TEXT DEFAULT 'healthy',
  last_webhook_at TIMESTAMPTZ,
  last_error TEXT,
  error_count_24h INTEGER DEFAULT 0,
  messages_sent_24h INTEGER DEFAULT 0,
  messages_received_24h INTEGER DEFAULT 0,
  avg_delivery_ms INTEGER DEFAULT 0,
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- Knowledge Base
CREATE TABLE public.omni_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'faq',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  channel_types TEXT[] DEFAULT '{all}',
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversation Summaries
CREATE TABLE public.omni_conversation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.omni_conversations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE SET NULL,
  summary_type TEXT DEFAULT 'thread',
  summary_text TEXT NOT NULL,
  key_topics TEXT[] DEFAULT '{}',
  action_items JSONB DEFAULT '[]',
  generated_by TEXT DEFAULT 'ai',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Policy Flags
CREATE TABLE public.omni_policy_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.omni_conversations(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE SET NULL,
  flag_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  severity TEXT DEFAULT 'warning',
  auto_action TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agent Performance Metrics
CREATE TABLE public.omni_agent_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_runs INTEGER DEFAULT 0,
  containment_rate NUMERIC DEFAULT 0,
  avg_confidence NUMERIC DEFAULT 0,
  handoff_count INTEGER DEFAULT 0,
  conversion_contribution NUMERIC DEFAULT 0,
  avg_latency_ms INTEGER DEFAULT 0,
  policy_incidents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_omni_agent_runs_conv ON public.omni_agent_runs(conversation_id);
CREATE INDEX idx_omni_agent_runs_type ON public.omni_agent_runs(agent_type);
CREATE INDEX idx_omni_support_tickets_status ON public.omni_support_tickets(status);
CREATE INDEX idx_omni_lead_records_contact ON public.omni_lead_records(contact_id);
CREATE INDEX idx_omni_lead_records_stage ON public.omni_lead_records(pipeline_stage);
CREATE INDEX idx_omni_tasks_status ON public.omni_tasks(status);
CREATE INDEX idx_omni_tasks_due ON public.omni_tasks(due_at);
CREATE INDEX idx_omni_delivery_logs_conv ON public.omni_delivery_logs(conversation_id);
CREATE INDEX idx_omni_knowledge_base_category ON public.omni_knowledge_base(category);
CREATE INDEX idx_omni_conv_summaries_conv ON public.omni_conversation_summaries(conversation_id);
CREATE INDEX idx_omni_policy_flags_conv ON public.omni_policy_flags(conversation_id);

-- RLS policies
ALTER TABLE public.omni_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_agent_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_lead_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_sales_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_operator_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_offer_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_conversion_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_sla_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_channel_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_conversation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_policy_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_agent_performance ENABLE ROW LEVEL SECURITY;

-- Authenticated user policies (all new tables)
CREATE POLICY "auth_select_agent_runs" ON public.omni_agent_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_agent_runs" ON public.omni_agent_runs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_select_agent_decisions" ON public.omni_agent_decisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_agent_decisions" ON public.omni_agent_decisions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_all_support_tickets" ON public.omni_support_tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_lead_records" ON public.omni_lead_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_sales_pipelines" ON public.omni_sales_pipelines FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_tasks" ON public.omni_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_operator_notes" ON public.omni_operator_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_delivery_logs" ON public.omni_delivery_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_message_templates" ON public.omni_message_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_offer_recommendations" ON public.omni_offer_recommendations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_conversion_predictions" ON public.omni_conversion_predictions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_sla_targets" ON public.omni_sla_targets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_channel_health" ON public.omni_channel_health FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_knowledge_base" ON public.omni_knowledge_base FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_conv_summaries" ON public.omni_conversation_summaries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_policy_flags" ON public.omni_policy_flags FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_agent_performance" ON public.omni_agent_performance FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Service role policies for edge functions
CREATE POLICY "service_all_agent_runs" ON public.omni_agent_runs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_agent_decisions" ON public.omni_agent_decisions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_support_tickets" ON public.omni_support_tickets FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_lead_records" ON public.omni_lead_records FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_tasks" ON public.omni_tasks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_delivery_logs" ON public.omni_delivery_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_knowledge_base" ON public.omni_knowledge_base FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_conv_summaries" ON public.omni_conversation_summaries FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_policy_flags" ON public.omni_policy_flags FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.omni_support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.omni_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.omni_delivery_logs;
