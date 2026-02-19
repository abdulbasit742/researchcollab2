
-- ============================================
-- PILOT MODE: CONTROLLED LIVE CAPITAL SYSTEM
-- ============================================

-- 1. Pilot Participants — who is allowed in the pilot
CREATE TABLE public.pilot_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  participant_role TEXT NOT NULL CHECK (participant_role IN ('student', 'sponsor', 'faculty', 'admin')),
  institution_id UUID REFERENCES public.organizations(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'removed')),
  added_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.pilot_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pilot participants"
  ON public.pilot_participants FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Participants can view own record"
  ON public.pilot_participants FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Pilot Transaction Log — every financial action logged separately
CREATE TABLE public.pilot_transaction_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID,
  milestone_id UUID,
  actor_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'deposit', 'escrow_lock', 'milestone_submit', 'milestone_approve',
    'partial_release', 'final_release', 'refund', 'manual_override',
    'freeze_triggered', 'cap_blocked'
  )),
  amount NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'PKR',
  ledger_entry_id UUID,
  reconciliation_status TEXT DEFAULT 'pending' CHECK (reconciliation_status IN ('pending', 'verified', 'mismatch')),
  reconciliation_checked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pilot_transaction_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all pilot transactions"
  ON public.pilot_transaction_log FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert pilot transactions"
  ON public.pilot_transaction_log FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = actor_id);

-- 3. Pilot Circuit Breaker — system state
CREATE TABLE public.pilot_circuit_breaker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_frozen BOOLEAN NOT NULL DEFAULT false,
  frozen_at TIMESTAMPTZ,
  frozen_reason TEXT,
  frozen_by TEXT, -- 'system' or admin user_id
  incident_count INT NOT NULL DEFAULT 0,
  last_incident_at TIMESTAMPTZ,
  last_reconciliation_at TIMESTAMPTZ,
  total_escrow_locked NUMERIC(14,2) DEFAULT 0,
  total_released NUMERIC(14,2) DEFAULT 0,
  total_refunded NUMERIC(14,2) DEFAULT 0,
  transaction_cap_pkr NUMERIC(12,2) DEFAULT 50000,
  manual_review_threshold_pkr NUMERIC(12,2) DEFAULT 25000,
  max_students INT DEFAULT 10,
  max_sponsors INT DEFAULT 3,
  max_institutions INT DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pilot_circuit_breaker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage circuit breaker"
  ON public.pilot_circuit_breaker FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. Pilot Execution Metrics — per-deal tracking for PMF
CREATE TABLE public.pilot_execution_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID,
  milestone_id UUID,
  metric_type TEXT NOT NULL CHECK (metric_type IN (
    'time_to_first_funding', 'time_to_milestone_approval',
    'dispute_frequency', 'sponsor_response_time',
    'student_completion_rate', 'trust_score_delta',
    'hiring_conversion', 'sponsor_satisfaction',
    'student_clarity', 'ui_friction_point'
  )),
  value NUMERIC(12,4),
  text_value TEXT,
  actor_id UUID,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pilot_execution_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage execution metrics"
  ON public.pilot_execution_metrics FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 5. Pilot Incidents — failure containment log
CREATE TABLE public.pilot_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type TEXT NOT NULL CHECK (incident_type IN (
    'ledger_mismatch', 'escrow_discrepancy', 'duplicate_release',
    'trust_anomaly', 'unauthorized_access', 'cap_exceeded', 'other'
  )),
  severity TEXT NOT NULL DEFAULT 'high' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  affected_deal_id UUID,
  affected_user_id UUID,
  auto_action_taken TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pilot_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pilot incidents"
  ON public.pilot_incidents FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6. Insert initial circuit breaker state
INSERT INTO public.pilot_circuit_breaker (
  is_frozen, transaction_cap_pkr, manual_review_threshold_pkr,
  max_students, max_sponsors, max_institutions
) VALUES (
  false, 50000, 25000, 10, 3, 1
);

-- 7. Insert pilot_mode feature flag
INSERT INTO public.feature_flags (feature_key, description, enabled, scope, is_kill_switch, priority)
VALUES (
  'pilot_mode',
  'Controls Live Capital Pilot Mode. When disabled, all real-money transactions are blocked.',
  false,
  'global',
  true,
  100
) ON CONFLICT (feature_key) DO UPDATE SET
  description = EXCLUDED.description,
  is_kill_switch = true,
  priority = 100;

-- 8. Validation function: check if user is a pilot participant
CREATE OR REPLACE FUNCTION public.is_pilot_participant(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pilot_participants
    WHERE user_id = p_user_id AND status = 'active'
  );
$$;

-- 9. Validation function: check if pilot is frozen
CREATE OR REPLACE FUNCTION public.is_pilot_frozen()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_frozen FROM public.pilot_circuit_breaker LIMIT 1),
    true
  );
$$;

-- 10. Validation function: check transaction cap
CREATE OR REPLACE FUNCTION public.check_pilot_transaction_cap(p_amount NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cap NUMERIC;
  v_review_threshold NUMERIC;
  v_result JSONB;
BEGIN
  SELECT transaction_cap_pkr, manual_review_threshold_pkr
  INTO v_cap, v_review_threshold
  FROM public.pilot_circuit_breaker LIMIT 1;

  IF p_amount > v_cap THEN
    v_result := jsonb_build_object('allowed', false, 'reason', 'exceeds_cap', 'cap', v_cap);
  ELSIF p_amount > v_review_threshold THEN
    v_result := jsonb_build_object('allowed', true, 'requires_review', true, 'threshold', v_review_threshold);
  ELSE
    v_result := jsonb_build_object('allowed', true, 'requires_review', false);
  END IF;

  RETURN v_result;
END;
$$;
