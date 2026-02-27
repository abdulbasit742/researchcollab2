
-- REIE: Real-Time Execution & Innovation Engine

-- 1. Live Sessions
CREATE TABLE public.reie_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_type TEXT NOT NULL DEFAULT 'project_sprint',
  title TEXT NOT NULL,
  description TEXT,
  purpose TEXT,
  linked_entity_id UUID,
  linked_entity_type TEXT,
  expected_deliverables JSONB DEFAULT '[]',
  compliance_context TEXT,
  recording_policy TEXT DEFAULT 'recorded',
  outcome_metrics JSONB DEFAULT '{}',
  status TEXT DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_by UUID,
  is_public BOOLEAN DEFAULT false,
  domain_classification TEXT,
  region TEXT,
  funding_type TEXT,
  institutional_host_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Session Participants
CREATE TABLE public.reie_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.reie_sessions(id) NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'observer',
  is_domain_authority BOOLEAN DEFAULT false,
  is_moderator BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  contribution_summary TEXT
);

-- 3. Real-Time Action Items
CREATE TABLE public.reie_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.reie_sessions(id) NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'task',
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID,
  milestone_tag TEXT,
  deadline TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  linked_project_id UUID,
  compliance_note TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- 4. Decision Log
CREATE TABLE public.reie_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.reie_sessions(id) NOT NULL,
  decision_type TEXT NOT NULL DEFAULT 'general',
  summary TEXT NOT NULL,
  rationale TEXT,
  decided_by UUID,
  funding_implications JSONB DEFAULT '{}',
  compliance_notes TEXT,
  risk_flags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Escrow Visibility Panel
CREATE TABLE public.reie_escrow_panel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.reie_sessions(id) NOT NULL,
  escrow_balance NUMERIC DEFAULT 0,
  milestone_status JSONB DEFAULT '{}',
  funding_release_conditions JSONB DEFAULT '[]',
  sponsor_oversight BOOLEAN DEFAULT false,
  budget_allocation JSONB DEFAULT '{}',
  compliance_checklist JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Cross-Border Session Context
CREATE TABLE public.reie_cross_border (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.reie_sessions(id) NOT NULL,
  time_zones JSONB DEFAULT '[]',
  jurisdictional_notes TEXT,
  currency_references JSONB DEFAULT '[]',
  regulatory_reminders JSONB DEFAULT '[]',
  ip_disclosure_warnings TEXT,
  cultural_guidance TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Live Document Co-Creation
CREATE TABLE public.reie_live_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.reie_sessions(id) NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'proposal',
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  version INTEGER DEFAULT 1,
  contributors JSONB DEFAULT '[]',
  role_assignments JSONB DEFAULT '{}',
  citations JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Session Impact Index
CREATE TABLE public.reie_impact_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.reie_sessions(id) NOT NULL,
  tasks_created INTEGER DEFAULT 0,
  milestones_clarified INTEGER DEFAULT 0,
  funding_alignment_improved BOOLEAN DEFAULT false,
  new_collaborators_added INTEGER DEFAULT 0,
  risk_factors_resolved INTEGER DEFAULT 0,
  deliverables_defined INTEGER DEFAULT 0,
  cross_border_established BOOLEAN DEFAULT false,
  institutional_commitments INTEGER DEFAULT 0,
  composite_impact_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 9. AI Session Summary
CREATE TABLE public.reie_ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.reie_sessions(id) NOT NULL,
  executive_summary TEXT,
  action_items JSONB DEFAULT '[]',
  decision_log JSONB DEFAULT '[]',
  risk_log JSONB DEFAULT '[]',
  funding_implications JSONB DEFAULT '{}',
  compliance_notes JSONB DEFAULT '[]',
  participant_contributions JSONB DEFAULT '[]',
  next_steps JSONB DEFAULT '[]',
  timeline_impact TEXT,
  suggested_followup TEXT,
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Session Archive
CREATE TABLE public.reie_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.reie_sessions(id) NOT NULL,
  video_recording_url TEXT,
  transcript TEXT,
  linked_documents JSONB DEFAULT '[]',
  versioned_edits JSONB DEFAULT '[]',
  funding_references JSONB DEFAULT '[]',
  search_keywords TEXT[] DEFAULT '{}',
  archived_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Real-Time Risk Flags
CREATE TABLE public.reie_risk_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.reie_sessions(id) NOT NULL,
  risk_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  flagged_by TEXT DEFAULT 'ai',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.reie_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reie_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reie_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reie_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reie_escrow_panel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reie_cross_border ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reie_live_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reie_impact_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reie_ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reie_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reie_risk_flags ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "reie_sessions_read" ON public.reie_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "reie_participants_read" ON public.reie_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "reie_actions_read" ON public.reie_action_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "reie_decisions_read" ON public.reie_decisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "reie_escrow_read" ON public.reie_escrow_panel FOR SELECT TO authenticated USING (true);
CREATE POLICY "reie_crossborder_read" ON public.reie_cross_border FOR SELECT TO authenticated USING (true);
CREATE POLICY "reie_docs_read" ON public.reie_live_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "reie_impact_read" ON public.reie_impact_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "reie_summaries_read" ON public.reie_ai_summaries FOR SELECT TO authenticated USING (true);
CREATE POLICY "reie_archives_read" ON public.reie_archives FOR SELECT TO authenticated USING (true);
CREATE POLICY "reie_risks_read" ON public.reie_risk_flags FOR SELECT TO authenticated USING (true);

-- Insert policies
CREATE POLICY "reie_sessions_insert" ON public.reie_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reie_participants_insert" ON public.reie_participants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reie_actions_insert" ON public.reie_action_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reie_decisions_insert" ON public.reie_decisions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reie_escrow_insert" ON public.reie_escrow_panel FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reie_crossborder_insert" ON public.reie_cross_border FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reie_docs_insert" ON public.reie_live_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reie_impact_insert" ON public.reie_impact_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reie_summaries_insert" ON public.reie_ai_summaries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reie_archives_insert" ON public.reie_archives FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reie_risks_insert" ON public.reie_risk_flags FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies
CREATE POLICY "reie_sessions_update" ON public.reie_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "reie_actions_update" ON public.reie_action_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "reie_docs_update" ON public.reie_live_documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "reie_risks_update" ON public.reie_risk_flags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "reie_escrow_update" ON public.reie_escrow_panel FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
