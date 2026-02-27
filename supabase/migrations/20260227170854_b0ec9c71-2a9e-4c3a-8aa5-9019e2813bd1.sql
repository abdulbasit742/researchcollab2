
-- ============================================================
-- ARGE: Autonomous Research Governance Engine
-- ============================================================

-- Governance Events
CREATE TABLE public.governance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('trust_anomaly','citation_inflation','funding_misuse','collusion','bias_pattern','ai_misuse','policy_manipulation','systemic_risk')),
  related_entity_type TEXT NOT NULL,
  related_entity_id TEXT NOT NULL,
  severity_level TEXT NOT NULL DEFAULT 'low' CHECK (severity_level IN ('low','medium','high','critical')),
  detection_source TEXT NOT NULL DEFAULT 'automated' CHECK (detection_source IN ('automated','flagged','manual')),
  description TEXT,
  evidence JSONB DEFAULT '{}'::jsonb,
  detection_trace JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','under_review','resolved','dismissed')),
  node_id UUID,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.governance_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read governance_events" ON public.governance_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert governance_events" ON public.governance_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update governance_events" ON public.governance_events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Governance Actions
CREATE TABLE public.governance_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  governance_event_id UUID REFERENCES public.governance_events(id) NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('warning','trust_adjustment','funding_freeze','review_required','temporary_suspension','escalation','monitoring_increase')),
  executed_by TEXT NOT NULL DEFAULT 'ai_system' CHECK (executed_by IN ('ai_system','super_admin','institutional_admin')),
  justification TEXT NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  is_reversible BOOLEAN DEFAULT true,
  reversed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.governance_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read governance_actions" ON public.governance_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert governance_actions" ON public.governance_actions FOR INSERT TO authenticated WITH CHECK (true);

-- Governance Appeals
CREATE TABLE public.governance_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  governance_event_id UUID REFERENCES public.governance_events(id) NOT NULL,
  appellant_id UUID NOT NULL,
  appeal_reason TEXT NOT NULL,
  evidence_submitted JSONB DEFAULT '{}'::jsonb,
  peer_endorsements TEXT[] DEFAULT '{}',
  institution_verification TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','under_review','upheld','overturned','partially_overturned')),
  reviewed_by UUID,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.governance_appeals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read appeals" ON public.governance_appeals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own appeals" ON public.governance_appeals FOR INSERT TO authenticated WITH CHECK (auth.uid() = appellant_id);
CREATE POLICY "Auth update appeals" ON public.governance_appeals FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Enable realtime for governance events
ALTER PUBLICATION supabase_realtime ADD TABLE public.governance_events;
