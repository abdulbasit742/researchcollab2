
-- Omnichannel AI Agent Layer - Core Tables

-- Unified contacts (cross-channel identity)
CREATE TABLE public.omni_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linked_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  linked_institution_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  contact_type TEXT NOT NULL DEFAULT 'anonymous',
  lead_score INTEGER DEFAULT 0,
  lead_status TEXT DEFAULT 'new',
  budget_range TEXT,
  institution_size TEXT,
  decision_authority TEXT,
  urgency TEXT,
  country TEXT,
  preferred_channel TEXT,
  preferred_language TEXT DEFAULT 'en',
  consent_status JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  merged_from UUID[],
  merge_confidence NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations (unified threads)
CREATE TABLE public.omni_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE CASCADE NOT NULL,
  channel_type TEXT NOT NULL,
  external_thread_id TEXT,
  status TEXT DEFAULT 'open',
  assigned_agent TEXT DEFAULT 'ai',
  assigned_human_id UUID,
  current_intent TEXT,
  current_sub_agent TEXT,
  priority TEXT DEFAULT 'normal',
  sales_stage TEXT,
  support_ticket_id TEXT,
  sentiment TEXT,
  summary TEXT,
  last_message_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE public.omni_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.omni_conversations(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE CASCADE NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound','system')),
  sender_type TEXT NOT NULL DEFAULT 'user',
  channel_type TEXT NOT NULL,
  content TEXT,
  message_type TEXT DEFAULT 'text',
  attachments JSONB,
  intent TEXT,
  sentiment TEXT,
  ai_confidence NUMERIC(3,2),
  delivery_status TEXT DEFAULT 'sent',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI memory (per contact)
CREATE TABLE public.omni_agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE CASCADE NOT NULL,
  memory_type TEXT NOT NULL,
  memory_key TEXT NOT NULL,
  memory_value TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Human escalation queue
CREATE TABLE public.omni_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.omni_conversations(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  ai_summary TEXT,
  detected_intent TEXT,
  suggested_action TEXT,
  priority TEXT DEFAULT 'normal',
  assigned_to UUID,
  assigned_team TEXT,
  sla_deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Campaign definitions
CREATE TABLE public.omni_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  target_segment JSONB DEFAULT '{}',
  template_content TEXT,
  schedule JSONB,
  status TEXT DEFAULT 'draft',
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_replied INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Campaign sends
CREATE TABLE public.omni_campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.omni_campaigns(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL,
  status TEXT DEFAULT 'queued',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CRM notes/tasks on conversations
CREATE TABLE public.omni_crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.omni_conversations(id) ON DELETE CASCADE,
  note_type TEXT DEFAULT 'note',
  content TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Analytics events
CREATE TABLE public.omni_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  channel TEXT,
  contact_id UUID,
  conversation_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Consent tracking
CREATE TABLE public.omni_consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.omni_contacts(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL,
  consent_type TEXT NOT NULL,
  granted BOOLEAN DEFAULT false,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.omni_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_campaign_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_consent_records ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read/write omni tables
CREATE POLICY "auth_read_omni_contacts" ON public.omni_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_omni_contacts" ON public.omni_contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_omni_contacts" ON public.omni_contacts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "auth_read_omni_conversations" ON public.omni_conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_omni_conversations" ON public.omni_conversations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_omni_conversations" ON public.omni_conversations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "auth_read_omni_messages" ON public.omni_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_omni_messages" ON public.omni_messages FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_read_omni_memory" ON public.omni_agent_memory FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_omni_memory" ON public.omni_agent_memory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_omni_memory" ON public.omni_agent_memory FOR UPDATE TO authenticated USING (true);

CREATE POLICY "auth_read_omni_escalations" ON public.omni_escalations FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_omni_escalations" ON public.omni_escalations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_omni_escalations" ON public.omni_escalations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "auth_read_omni_campaigns" ON public.omni_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_omni_campaigns" ON public.omni_campaigns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_omni_campaigns" ON public.omni_campaigns FOR UPDATE TO authenticated USING (true);

CREATE POLICY "auth_read_omni_sends" ON public.omni_campaign_sends FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_omni_sends" ON public.omni_campaign_sends FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_read_omni_notes" ON public.omni_crm_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_omni_notes" ON public.omni_crm_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_omni_notes" ON public.omni_crm_notes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "auth_read_omni_analytics" ON public.omni_analytics_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_omni_analytics" ON public.omni_analytics_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_read_omni_consent" ON public.omni_consent_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_omni_consent" ON public.omni_consent_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_omni_consent" ON public.omni_consent_records FOR UPDATE TO authenticated USING (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.omni_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.omni_conversations;

-- Indexes
CREATE INDEX idx_omni_messages_conversation ON public.omni_messages(conversation_id, created_at);
CREATE INDEX idx_omni_conversations_contact ON public.omni_conversations(contact_id);
CREATE INDEX idx_omni_contacts_email ON public.omni_contacts(email);
CREATE INDEX idx_omni_contacts_phone ON public.omni_contacts(phone);
CREATE INDEX idx_omni_contacts_linked_user ON public.omni_contacts(linked_user_id);
CREATE INDEX idx_omni_memory_contact ON public.omni_agent_memory(contact_id, memory_key);
CREATE INDEX idx_omni_escalations_status ON public.omni_escalations(status);
CREATE INDEX idx_omni_analytics_type ON public.omni_analytics_events(event_type, created_at);
