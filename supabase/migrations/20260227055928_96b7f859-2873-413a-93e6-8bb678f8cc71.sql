
-- Thread context types for execution-linked communication
CREATE TYPE public.thread_context_type AS ENUM (
  'deal', 'opportunity', 'institutional', 'verified_introduction', 'general'
);

-- Thread priority levels
CREATE TYPE public.thread_priority AS ENUM (
  'financial_action', 'milestone_pending', 'document_review', 'institutional_escalation', 'informational'
);

-- Introduction reason types
CREATE TYPE public.introduction_reason AS ENUM (
  'collaboration_interest', 'hiring_inquiry', 'institutional_inquiry', 'funding_discussion'
);

-- Add context columns to existing message_threads table
ALTER TABLE public.message_threads
  ADD COLUMN IF NOT EXISTS context_type public.thread_context_type DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS context_entity_id uuid,
  ADD COLUMN IF NOT EXISTS context_entity_type text,
  ADD COLUMN IF NOT EXISTS priority public.thread_priority DEFAULT 'informational',
  ADD COLUMN IF NOT EXISTS introduction_reason public.introduction_reason,
  ADD COLUMN IF NOT EXISTS is_auditable boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS escrow_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS milestone_count integer DEFAULT 0;

-- Communication analytics per user
CREATE TABLE IF NOT EXISTS public.communication_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  period text NOT NULL,
  avg_response_time_minutes numeric DEFAULT 0,
  milestone_feedback_latency_minutes numeric DEFAULT 0,
  approval_delay_minutes numeric DEFAULT 0,
  communication_consistency_score numeric DEFAULT 50,
  total_messages_sent integer DEFAULT 0,
  total_threads_active integer DEFAULT 0,
  responsiveness_tier text DEFAULT 'standard',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period)
);

ALTER TABLE public.communication_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own communication analytics"
  ON public.communication_analytics FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Communication trust badges
CREATE TABLE IF NOT EXISTS public.communication_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_type text NOT NULL,
  awarded_at timestamptz DEFAULT now(),
  evidence jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  UNIQUE(user_id, badge_type)
);

ALTER TABLE public.communication_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view communication badges"
  ON public.communication_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System inserts communication badges"
  ON public.communication_badges FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Structured negotiation records (pre-escrow)
CREATE TABLE IF NOT EXISTS public.negotiation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES public.message_threads(id) ON DELETE CASCADE,
  initiator_id uuid NOT NULL,
  respondent_id uuid NOT NULL,
  scope_summary text,
  budget_proposed numeric,
  budget_revised numeric,
  timeline_proposed text,
  timeline_revised text,
  risk_disclosures jsonb DEFAULT '[]',
  revision_count integer DEFAULT 0,
  status text DEFAULT 'active',
  finalized_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.negotiation_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view negotiation records"
  ON public.negotiation_records FOR SELECT
  TO authenticated
  USING (initiator_id = auth.uid() OR respondent_id = auth.uid());

CREATE POLICY "Initiator can create negotiation records"
  ON public.negotiation_records FOR INSERT
  TO authenticated
  WITH CHECK (initiator_id = auth.uid());

CREATE POLICY "Participants can update negotiation records"
  ON public.negotiation_records FOR UPDATE
  TO authenticated
  USING (initiator_id = auth.uid() OR respondent_id = auth.uid());

-- Dispute prevention signals
CREATE TABLE IF NOT EXISTS public.dispute_prevention_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES public.message_threads(id) ON DELETE CASCADE,
  signal_type text NOT NULL,
  severity text DEFAULT 'low',
  detected_at timestamptz DEFAULT now(),
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  metadata jsonb DEFAULT '{}'
);

ALTER TABLE public.dispute_prevention_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Thread participants can view dispute signals"
  ON public.dispute_prevention_signals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.message_threads mt
      WHERE mt.id = thread_id
      AND (mt.user_a = auth.uid() OR mt.user_b = auth.uid())
    )
  );
