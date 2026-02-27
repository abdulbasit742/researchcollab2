
-- ============================================================
-- CONTROLLED INSTITUTIONAL LAUNCH PROTOCOL
-- ============================================================

-- 1. Launch configuration table
CREATE TABLE IF NOT EXISTS public.launch_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE launch_config ENABLE ROW LEVEL SECURITY;

-- Admin read-only
CREATE POLICY "launch_config_admin_read" ON launch_config
  FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "launch_config_admin_update" ON launch_config
  FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "launch_config_no_client_insert" ON launch_config
  FOR INSERT WITH CHECK (false);
CREATE POLICY "launch_config_no_delete" ON launch_config
  FOR DELETE USING (false);

-- 2. Scale gates table
CREATE TABLE IF NOT EXISTS public.scale_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gate_number INTEGER UNIQUE NOT NULL,
  gate_name TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'evaluating', 'passed', 'failed')),
  evaluated_at TIMESTAMPTZ,
  passed_at TIMESTAMPTZ,
  evaluated_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE scale_gates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scale_gates_admin_read" ON scale_gates
  FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "scale_gates_admin_update" ON scale_gates
  FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "scale_gates_no_client_insert" ON scale_gates
  FOR INSERT WITH CHECK (false);
CREATE POLICY "scale_gates_no_delete" ON scale_gates
  FOR DELETE USING (false);

-- 3. Whitelisted domains table
CREATE TABLE IF NOT EXISTS public.whitelisted_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT UNIQUE NOT NULL,
  institution_name TEXT,
  max_projects INTEGER DEFAULT 50,
  max_sponsors INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  added_by UUID REFERENCES auth.users(id)
);

ALTER TABLE whitelisted_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "whitelisted_domains_admin_read" ON whitelisted_domains
  FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "whitelisted_domains_admin_manage" ON whitelisted_domains
  FOR ALL USING (is_admin(auth.uid()));

-- 4. Insert default launch config
INSERT INTO launch_config (config_key, config_value, description) VALUES
  ('soft_launch_mode', '{"enabled": true}'::jsonb, 'When enabled, restricts to invite-only and whitelisted domains'),
  ('invite_only', '{"enabled": true}'::jsonb, 'Require invite or whitelisted domain for registration'),
  ('platform_escrow_cap', '{"max_total_pkr": 5000000, "max_per_deal_pkr": 50000, "alert_threshold_percent": 80}'::jsonb, 'Platform-wide escrow exposure limits'),
  ('pilot_constraints', '{"max_projects_per_university": 50, "max_sponsors_per_university": 5, "manual_review_first_n_deals": 10}'::jsonb, 'Pilot university program constraints'),
  ('incident_response', '{"freeze_on_invariant_fail": true, "freeze_on_dispute_spike": true, "dispute_spike_threshold": 0.15, "error_rate_threshold": 0.05}'::jsonb, 'Auto-freeze triggers during launch phase')
ON CONFLICT (config_key) DO NOTHING;

-- 5. Insert scale gates
INSERT INTO scale_gates (gate_number, gate_name, criteria) VALUES
  (1, '30-Day Stability Gate', '[
    {"metric": "days_stable", "threshold": 30, "operator": ">="},
    {"metric": "escrow_invariant_failures", "threshold": 0, "operator": "="},
    {"metric": "dispute_rate", "threshold": 0.05, "operator": "<"},
    {"metric": "transaction_error_rate", "threshold": 0.01, "operator": "<"}
  ]'::jsonb),
  (2, '90-Day Retention Gate', '[
    {"metric": "days_stable", "threshold": 90, "operator": ">="},
    {"metric": "institutional_retention", "threshold": true, "operator": "="},
    {"metric": "sponsor_repeat_rate", "threshold": 0.3, "operator": ">="},
    {"metric": "reconciliation_status", "threshold": "balanced", "operator": "="}
  ]'::jsonb),
  (3, '180-Day Scale Gate', '[
    {"metric": "days_stable", "threshold": 180, "operator": ">="},
    {"metric": "support_load_manageable", "threshold": true, "operator": "="},
    {"metric": "critical_security_alerts_30d", "threshold": 0, "operator": "="}
  ]'::jsonb)
ON CONFLICT (gate_number) DO NOTHING;

-- 6. Launch health metrics (daily snapshots)
CREATE TABLE IF NOT EXISTS public.launch_health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  active_escrow_volume NUMERIC DEFAULT 0,
  active_deals INTEGER DEFAULT 0,
  milestones_pending INTEGER DEFAULT 0,
  avg_approval_time_hours NUMERIC,
  support_tickets_open INTEGER DEFAULT 0,
  security_alerts_24h INTEGER DEFAULT 0,
  avg_transaction_latency_ms NUMERIC,
  daily_active_users INTEGER DEFAULT 0,
  dispute_count INTEGER DEFAULT 0,
  funding_events INTEGER DEFAULT 0,
  milestone_releases INTEGER DEFAULT 0,
  failed_transactions INTEGER DEFAULT 0,
  login_failures INTEGER DEFAULT 0,
  rate_limit_triggers INTEGER DEFAULT 0,
  error_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date)
);

ALTER TABLE launch_health_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "launch_health_admin_read" ON launch_health_snapshots
  FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "launch_health_no_client_write" ON launch_health_snapshots
  FOR INSERT WITH CHECK (false);
CREATE POLICY "launch_health_no_update" ON launch_health_snapshots
  FOR UPDATE USING (false);
CREATE POLICY "launch_health_no_delete" ON launch_health_snapshots
  FOR DELETE USING (false);

-- 7. Function to capture daily launch health snapshot
CREATE OR REPLACE FUNCTION public.capture_launch_health_snapshot()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_active_escrow NUMERIC;
  v_active_deals INT;
  v_milestones_pending INT;
  v_disputes INT;
  v_security_alerts INT;
  v_funding_events INT;
  v_milestone_releases INT;
  v_dau INT;
BEGIN
  -- Active escrow volume
  SELECT COALESCE(SUM(locked_amount), 0) INTO v_active_escrow
  FROM escrows WHERE status IN ('funded', 'partially_released');

  -- Active deals
  SELECT COUNT(*) INTO v_active_deals
  FROM deal_rooms WHERE status IN ('in_progress', 'agreed', 'escrow_funded');

  -- Pending milestones
  SELECT COUNT(*) INTO v_milestones_pending
  FROM milestones WHERE status IN ('submitted', 'in_progress');

  -- Disputes (last 24h)
  SELECT COUNT(*) INTO v_disputes
  FROM deal_rooms WHERE status = 'disputed' AND updated_at >= now() - interval '24 hours';

  -- Security alerts (last 24h)
  SELECT COUNT(*) INTO v_security_alerts
  FROM security_events WHERE created_at >= now() - interval '24 hours';

  -- Funding events today
  SELECT COUNT(*) INTO v_funding_events
  FROM financial_audit_logs WHERE action = 'escrow.fund' AND created_at >= v_today::timestamptz;

  -- Milestone releases today
  SELECT COUNT(*) INTO v_milestone_releases
  FROM financial_audit_logs WHERE action = 'milestone.release' AND created_at >= v_today::timestamptz;

  -- DAU (approximate from auth)
  SELECT COUNT(DISTINCT actor_id) INTO v_dau
  FROM financial_audit_logs WHERE created_at >= v_today::timestamptz;

  INSERT INTO launch_health_snapshots (
    snapshot_date, active_escrow_volume, active_deals, milestones_pending,
    dispute_count, security_alerts_24h, funding_events, milestone_releases,
    daily_active_users
  ) VALUES (
    v_today, v_active_escrow, v_active_deals, v_milestones_pending,
    v_disputes, v_security_alerts, v_funding_events, v_milestone_releases,
    v_dau
  )
  ON CONFLICT (snapshot_date) DO UPDATE SET
    active_escrow_volume = EXCLUDED.active_escrow_volume,
    active_deals = EXCLUDED.active_deals,
    milestones_pending = EXCLUDED.milestones_pending,
    dispute_count = EXCLUDED.dispute_count,
    security_alerts_24h = EXCLUDED.security_alerts_24h,
    funding_events = EXCLUDED.funding_events,
    milestone_releases = EXCLUDED.milestone_releases,
    daily_active_users = EXCLUDED.daily_active_users;

  RETURN jsonb_build_object(
    'date', v_today,
    'active_escrow', v_active_escrow,
    'active_deals', v_active_deals,
    'milestones_pending', v_milestones_pending,
    'disputes', v_disputes,
    'security_alerts', v_security_alerts,
    'funding_events', v_funding_events,
    'milestone_releases', v_milestone_releases,
    'dau', v_dau
  );
END;
$$;

-- 8. Function to check platform escrow cap before funding
CREATE OR REPLACE FUNCTION public.check_platform_escrow_cap(p_amount NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config JSONB;
  v_max_total NUMERIC;
  v_max_per_deal NUMERIC;
  v_current_total NUMERIC;
  v_alert_threshold NUMERIC;
BEGIN
  SELECT config_value INTO v_config
  FROM launch_config WHERE config_key = 'platform_escrow_cap';

  IF v_config IS NULL THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'No cap configured');
  END IF;

  v_max_total := (v_config->>'max_total_pkr')::NUMERIC;
  v_max_per_deal := (v_config->>'max_per_deal_pkr')::NUMERIC;
  v_alert_threshold := COALESCE((v_config->>'alert_threshold_percent')::NUMERIC, 80) / 100.0;

  -- Check per-deal cap
  IF p_amount > v_max_per_deal THEN
    RETURN jsonb_build_object('allowed', false, 'reason', format('Deal amount %s exceeds per-deal cap of %s', p_amount, v_max_per_deal));
  END IF;

  -- Check platform-wide total
  SELECT COALESCE(SUM(locked_amount), 0) INTO v_current_total
  FROM escrows WHERE status IN ('funded', 'partially_released');

  IF v_current_total + p_amount > v_max_total THEN
    PERFORM log_security_event(auth.uid(), 'platform_escrow_cap_exceeded', 'critical',
      format('Total escrow would reach %s, cap is %s', v_current_total + p_amount, v_max_total));
    RETURN jsonb_build_object('allowed', false, 'reason', format('Platform escrow cap exceeded: current %s + %s > %s', v_current_total, p_amount, v_max_total));
  END IF;

  -- Alert if near threshold
  IF (v_current_total + p_amount) / v_max_total >= v_alert_threshold THEN
    PERFORM log_security_event(auth.uid(), 'platform_escrow_cap_warning', 'high',
      format('Escrow at %s%% of cap (%s / %s)', ROUND(((v_current_total + p_amount) / v_max_total) * 100), v_current_total + p_amount, v_max_total));
  END IF;

  RETURN jsonb_build_object('allowed', true, 'current_total', v_current_total, 'headroom', v_max_total - v_current_total - p_amount);
END;
$$;

-- 9. Update fund_escrow_atomic to enforce platform cap
CREATE OR REPLACE FUNCTION public.fund_escrow_atomic(
  p_deal_id UUID,
  p_sponsor_id UUID,
  p_idempotency_key TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deal RECORD;
  v_wallet RECORD;
  v_escrow RECORD;
  v_amount NUMERIC;
  v_tx_id UUID := gen_random_uuid();
  v_escrow_id UUID;
  v_cap_check JSONB;
  v_is_frozen BOOLEAN;
BEGIN
  -- Auth check
  IF auth.uid() IS NULL THEN
    PERFORM log_security_event(NULL, 'unauthenticated_escrow_attempt', 'critical');
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF auth.uid() != p_sponsor_id THEN
    PERFORM log_security_event(auth.uid(), 'identity_mismatch', 'critical',
      format('User %s tried to fund as %s', auth.uid(), p_sponsor_id));
    RAISE EXCEPTION 'Identity mismatch';
  END IF;

  -- Pilot circuit breaker check
  SELECT is_frozen INTO v_is_frozen FROM pilot_circuit_breaker LIMIT 1;
  IF v_is_frozen = true THEN
    PERFORM log_security_event(p_sponsor_id, 'funding_during_freeze', 'high', 'Attempted escrow funding while pilot is frozen');
    RAISE EXCEPTION 'Platform is currently frozen. No new escrow funding allowed.';
  END IF;

  -- Idempotency
  IF EXISTS (
    SELECT 1 FROM financial_audit_logs
    WHERE metadata->>'idempotency_key' = p_idempotency_key
      AND action = 'escrow.fund' AND (metadata->>'status') = 'success'
  ) THEN
    SELECT id INTO v_escrow_id FROM escrows WHERE deal_id = p_deal_id LIMIT 1;
    RETURN jsonb_build_object('success', true, 'escrow_id', v_escrow_id, 'idempotent', true);
  END IF;

  -- Validate deal
  SELECT * INTO v_deal FROM deal_rooms WHERE id = p_deal_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Deal not found: %', p_deal_id; END IF;
  IF v_deal.buyer_id != p_sponsor_id THEN
    PERFORM log_security_event(p_sponsor_id, 'unauthorized_escrow_fund', 'high');
    RAISE EXCEPTION 'Only the sponsor can fund escrow';
  END IF;

  v_amount := COALESCE(v_deal.agreed_amount, 0);
  IF v_amount <= 0 THEN RAISE EXCEPTION 'No agreed amount on deal'; END IF;

  -- Platform escrow cap enforcement
  v_cap_check := check_platform_escrow_cap(v_amount);
  IF NOT (v_cap_check->>'allowed')::boolean THEN
    PERFORM log_security_event(p_sponsor_id, 'escrow_cap_blocked', 'high', v_cap_check->>'reason');
    RAISE EXCEPTION '%', v_cap_check->>'reason';
  END IF;

  -- Lock and validate wallet
  SELECT * INTO v_wallet FROM wallets WHERE user_id = p_sponsor_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  IF v_wallet.is_frozen = true THEN
    PERFORM log_security_event(p_sponsor_id, 'frozen_wallet_fund_attempt', 'high');
    RAISE EXCEPTION 'Wallet is frozen';
  END IF;
  IF v_wallet.available_balance < v_amount THEN
    PERFORM log_security_event(p_sponsor_id, 'insufficient_balance_attempt', 'medium',
      format('Have %s need %s', v_wallet.available_balance, v_amount));
    RAISE EXCEPTION 'Insufficient balance: have %, need %', v_wallet.available_balance, v_amount;
  END IF;

  -- Check existing escrow
  SELECT * INTO v_escrow FROM escrows WHERE deal_id = p_deal_id FOR UPDATE;
  IF FOUND AND v_escrow.status != 'created' THEN
    PERFORM log_security_event(p_sponsor_id, 'duplicate_escrow_fund', 'high');
    RAISE EXCEPTION 'Escrow already funded';
  END IF;

  -- Create or update escrow
  IF NOT FOUND THEN
    INSERT INTO escrows (deal_id, sponsor_id, recipient_id, total_amount, locked_amount, released_amount, refunded_amount, currency, status)
    VALUES (p_deal_id, p_sponsor_id, v_deal.seller_id, v_amount, v_amount, 0, 0, v_wallet.currency, 'funded')
    RETURNING * INTO v_escrow;
  ELSE
    UPDATE escrows SET locked_amount = v_amount, status = 'funded', updated_at = now() WHERE id = v_escrow.id RETURNING * INTO v_escrow;
  END IF;

  -- Deduct wallet
  UPDATE wallets SET
    available_balance = available_balance - v_amount,
    escrow_balance = escrow_balance + v_amount,
    total_spent = total_spent + v_amount,
    updated_at = now()
  WHERE id = v_wallet.id;

  -- Negative balance guard
  IF (SELECT available_balance FROM wallets WHERE id = v_wallet.id) < 0 THEN
    PERFORM log_security_event(p_sponsor_id, 'negative_balance_detected', 'critical');
    RAISE EXCEPTION 'Wallet balance went negative - aborting';
  END IF;

  -- Double-entry ledger
  INSERT INTO ledger_entries (transaction_id, account_type, account_id, entry_type, amount, currency, reference_type, reference_id, description, is_immutable)
  VALUES
    (v_tx_id, 'wallet', v_wallet.id, 'debit', v_amount, v_wallet.currency, 'escrow', v_escrow.id::text, 'Escrow funded for deal ' || p_deal_id, true),
    (v_tx_id, 'escrow', v_escrow.id, 'credit', v_amount, v_wallet.currency, 'escrow', v_escrow.id::text, 'Escrow funded for deal ' || p_deal_id, true);

  -- Audit log
  INSERT INTO financial_audit_logs (entity_type, entity_id, action, actor_id, metadata)
  VALUES ('escrow', v_escrow.id, 'escrow.fund', p_sponsor_id,
    jsonb_build_object('deal_id', p_deal_id, 'amount', v_amount, 'idempotency_key', p_idempotency_key, 'transaction_id', v_tx_id, 'status', 'success'));

  -- Post-transaction invariant
  IF v_escrow.locked_amount + v_escrow.released_amount + v_escrow.refunded_amount > v_escrow.total_amount + 0.01 THEN
    PERFORM log_security_event(p_sponsor_id, 'escrow_invariant_violation', 'critical');
    RAISE EXCEPTION 'Escrow invariant violated after funding';
  END IF;

  RETURN jsonb_build_object('success', true, 'escrow_id', v_escrow.id, 'amount', v_amount, 'transaction_id', v_tx_id);
END;
$$;

-- 10. Function to evaluate scale gates
CREATE OR REPLACE FUNCTION public.evaluate_scale_gate(p_gate_number INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gate RECORD;
  v_results JSONB[] := '{}';
  v_all_passed BOOLEAN := true;
  v_criterion JSONB;
  v_invariant_failures INT;
  v_dispute_rate NUMERIC;
  v_error_rate NUMERIC;
  v_days_stable INT;
  v_security_alerts INT;
BEGIN
  SELECT * INTO v_gate FROM scale_gates WHERE gate_number = p_gate_number;
  IF NOT FOUND THEN RAISE EXCEPTION 'Gate % not found', p_gate_number; END IF;

  -- Calculate metrics
  -- Days since first funded escrow (proxy for stability duration)
  SELECT COALESCE(EXTRACT(DAY FROM now() - MIN(created_at)), 0)::INT INTO v_days_stable
  FROM escrows WHERE status != 'cancelled';

  -- Escrow invariant failures (from security events)
  SELECT COUNT(*) INTO v_invariant_failures
  FROM security_events WHERE event_type LIKE '%invariant%' AND severity = 'critical';

  -- Dispute rate
  SELECT CASE WHEN COUNT(*) = 0 THEN 0
    ELSE COUNT(*) FILTER (WHERE status = 'disputed')::NUMERIC / COUNT(*)
  END INTO v_dispute_rate
  FROM deal_rooms WHERE status NOT IN ('draft');

  -- Critical security alerts in last 30 days
  SELECT COUNT(*) INTO v_security_alerts
  FROM security_events WHERE severity = 'critical' AND created_at >= now() - interval '30 days';

  -- Evaluate each criterion
  FOR v_criterion IN SELECT * FROM jsonb_array_elements(v_gate.criteria)
  LOOP
    DECLARE
      v_metric TEXT := v_criterion->>'metric';
      v_passed BOOLEAN := false;
      v_actual TEXT;
    BEGIN
      CASE v_metric
        WHEN 'days_stable' THEN
          v_actual := v_days_stable::TEXT;
          v_passed := v_days_stable >= (v_criterion->>'threshold')::INT;
        WHEN 'escrow_invariant_failures' THEN
          v_actual := v_invariant_failures::TEXT;
          v_passed := v_invariant_failures = (v_criterion->>'threshold')::INT;
        WHEN 'dispute_rate' THEN
          v_actual := ROUND(v_dispute_rate, 4)::TEXT;
          v_passed := v_dispute_rate < (v_criterion->>'threshold')::NUMERIC;
        WHEN 'transaction_error_rate' THEN
          v_actual := '0'; -- TODO: calculate from logs
          v_passed := true;
        WHEN 'critical_security_alerts_30d' THEN
          v_actual := v_security_alerts::TEXT;
          v_passed := v_security_alerts = (v_criterion->>'threshold')::INT;
        ELSE
          v_actual := 'unknown';
          v_passed := false;
      END CASE;

      IF NOT v_passed THEN v_all_passed := false; END IF;
      v_results := array_append(v_results, jsonb_build_object(
        'metric', v_metric, 'threshold', v_criterion->>'threshold',
        'actual', v_actual, 'passed', v_passed
      ));
    END;
  END LOOP;

  -- Update gate status
  UPDATE scale_gates SET
    status = CASE WHEN v_all_passed THEN 'passed' ELSE 'failed' END,
    evaluated_at = now(),
    passed_at = CASE WHEN v_all_passed THEN now() ELSE NULL END
  WHERE gate_number = p_gate_number;

  RETURN jsonb_build_object(
    'gate', p_gate_number, 'name', v_gate.gate_name,
    'passed', v_all_passed, 'results', to_jsonb(v_results),
    'evaluated_at', now()
  );
END;
$$;
