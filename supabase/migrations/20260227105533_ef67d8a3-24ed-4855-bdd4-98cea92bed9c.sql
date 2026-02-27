
-- =====================================================
-- EXECUTION COMMUNICATION & COLLABORATION ENGINE (ECCE)
-- =====================================================

-- 1. Context-Linked Chat Rooms (Section 1)
CREATE TABLE IF NOT EXISTS public.ecce_chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  linked_entity_type TEXT,
  linked_entity_id UUID,
  privacy_level TEXT DEFAULT 'standard',
  is_confidential BOOLEAN DEFAULT false,
  nda_required BOOLEAN DEFAULT false,
  encryption_mode TEXT DEFAULT 'standard',
  created_by UUID NOT NULL,
  institution_id UUID,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Chat Room Members with trust-weighted visibility (Section 7)
CREATE TABLE IF NOT EXISTS public.ecce_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.ecce_chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  trust_weight NUMERIC DEFAULT 0,
  is_domain_authority BOOLEAN DEFAULT false,
  is_compliance_officer BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  nda_acknowledged_at TIMESTAMPTZ,
  UNIQUE(room_id, user_id)
);

-- 3. Decision Logging (Section 3)
CREATE TABLE IF NOT EXISTS public.ecce_decision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.ecce_chat_rooms(id) ON DELETE CASCADE,
  message_id UUID,
  decision_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  logged_by UUID NOT NULL,
  linked_entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Action Items (Section 3 & 4)
CREATE TABLE IF NOT EXISTS public.ecce_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.ecce_chat_rooms(id) ON DELETE CASCADE,
  message_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID,
  deadline TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  ai_extracted BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Escrow Integration Context (Section 6)
CREATE TABLE IF NOT EXISTS public.ecce_escrow_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.ecce_chat_rooms(id) ON DELETE CASCADE,
  escrow_id UUID,
  deal_id UUID,
  locked_amount NUMERIC DEFAULT 0,
  next_release_condition TEXT,
  milestone_status TEXT,
  compliance_reminders TEXT[] DEFAULT '{}',
  payment_timeline JSONB DEFAULT '{}',
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id)
);

-- 6. Dispute Management (Section 8)
CREATE TABLE IF NOT EXISTS public.ecce_dispute_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.ecce_chat_rooms(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL,
  dispute_type TEXT DEFAULT 'general',
  description TEXT,
  evidence JSONB DEFAULT '[]',
  mediator_id UUID,
  escrow_frozen BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'open',
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Meeting Integration (Section 10)
CREATE TABLE IF NOT EXISTS public.ecce_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.ecce_chat_rooms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  agenda JSONB DEFAULT '[]',
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 60,
  transcription TEXT,
  ai_summary TEXT,
  decisions_extracted JSONB DEFAULT '[]',
  action_items_extracted JSONB DEFAULT '[]',
  compliance_notes TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'scheduled',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Communication Health Analytics (Section 14)
CREATE TABLE IF NOT EXISTS public.ecce_health_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.ecce_chat_rooms(id) ON DELETE CASCADE,
  response_time_avg_hours NUMERIC DEFAULT 0,
  unresolved_action_items INTEGER DEFAULT 0,
  conflict_frequency NUMERIC DEFAULT 0,
  topic_drift_score NUMERIC DEFAULT 0,
  execution_delay_risk NUMERIC DEFAULT 0,
  communication_density NUMERIC DEFAULT 0,
  leadership_balance NUMERIC DEFAULT 0,
  alert_level TEXT DEFAULT 'healthy',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id)
);

-- 9. Communication Archive (Section 12)
CREATE TABLE IF NOT EXISTS public.ecce_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.ecce_chat_rooms(id) ON DELETE CASCADE,
  archive_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  archived_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ecce_chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecce_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecce_decision_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecce_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecce_escrow_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecce_dispute_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecce_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecce_health_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecce_archive ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Auth read ecce_rooms" ON public.ecce_chat_rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read ecce_members" ON public.ecce_room_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read ecce_decisions" ON public.ecce_decision_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read ecce_actions" ON public.ecce_action_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read ecce_escrow" ON public.ecce_escrow_context FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read ecce_disputes" ON public.ecce_dispute_threads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read ecce_meetings" ON public.ecce_meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read ecce_health" ON public.ecce_health_analytics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read ecce_archive" ON public.ecce_archive FOR SELECT TO authenticated USING (true);

-- Insert policies
CREATE POLICY "Auth insert ecce_rooms" ON public.ecce_chat_rooms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert ecce_members" ON public.ecce_room_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert ecce_decisions" ON public.ecce_decision_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert ecce_actions" ON public.ecce_action_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert ecce_escrow" ON public.ecce_escrow_context FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert ecce_disputes" ON public.ecce_dispute_threads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert ecce_meetings" ON public.ecce_meetings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert ecce_health" ON public.ecce_health_analytics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert ecce_archive" ON public.ecce_archive FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies
CREATE POLICY "Auth update ecce_rooms" ON public.ecce_chat_rooms FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update ecce_actions" ON public.ecce_action_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update ecce_disputes" ON public.ecce_dispute_threads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update ecce_meetings" ON public.ecce_meetings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update ecce_health" ON public.ecce_health_analytics FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update ecce_escrow" ON public.ecce_escrow_context FOR UPDATE TO authenticated USING (true);
