
-- ============================================================
-- INSTITUTIONAL OPERATIONS DOMINANCE SYSTEM
-- ============================================================

-- 1. Fraud signal monitoring table
CREATE TABLE IF NOT EXISTS public.fraud_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'flagged' CHECK (status IN ('flagged', 'investigating', 'confirmed', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE fraud_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fraud_signals_admin_read" ON fraud_signals
  FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "fraud_signals_admin_update" ON fraud_signals
  FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "fraud_signals_no_client_insert" ON fraud_signals
  FOR INSERT WITH CHECK (false);
CREATE POLICY "fraud_signals_no_delete" ON fraud_signals
  FOR DELETE USING (false);

-- 2. Dispute classifications table
CREATE TABLE IF NOT EXISTS public.dispute_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'financial_critical')),
  classification_reason TEXT NOT NULL,
  evidence JSONB DEFAULT '{}'::jsonb,
  escrow_frozen BOOLEAN DEFAULT false,
  case_owner UUID REFERENCES auth.users(id),
  sla_deadline TIMESTAMPTZ,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dispute_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dispute_class_admin_read" ON dispute_classifications
  FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "dispute_class_admin_manage" ON dispute_classifications
  FOR ALL USING (is_admin(auth.uid()));

-- 3. Ops daily metrics (aggregated daily snapshots beyond launch health)
CREATE TABLE IF NOT EXISTS public.ops_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Financial
  total_escrow_locked NUMERIC DEFAULT 0,
  total_escrow_released NUMERIC DEFAULT 0,
  funding_attempts INT DEFAULT 0,
  failed_funding_attempts INT DEFAULT 0,
  -- Stability
  api_error_rate NUMERIC DEFAULT 0,
  avg_transaction_latency_ms NUMERIC DEFAULT 0,
  concurrency_retries INT DEFAULT 0,
  rate_limit_triggers INT DEFAULT 0,
  security_alerts INT DEFAULT 0,
  -- Institutional
  active_institutions INT DEFAULT 0,
  active_sponsors INT DEFAULT 0,
  project_completion_pct NUMERIC DEFAULT 0,
  sla_compliance_pct NUMERIC DEFAULT 0,
  dispute_rate_pct NUMERIC DEFAULT 0,
  -- Support
  open_tickets INT DEFAULT 0,
  avg_resolution_hours NUMERIC,
  escalated_cases INT DEFAULT 0,
  -- Risk
  max_institution_exposure NUMERIC DEFAULT 0,
  max_sponsor_exposure NUMERIC DEFAULT 0,
  total_platform_exposure NUMERIC DEFAULT 0,
  funding_concentration_hhi NUMERIC DEFAULT 0,
  -- Trust health index
  escrow_reliability_pct NUMERIC DEFAULT 100,
  ledger_integrity_pct NUMERIC DEFAULT 100,
  sponsor_repeat_pct NUMERIC DEFAULT 0,
  institutional_retention_pct NUMERIC DEFAULT 0,
  trust_health_index NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(metric_date)
);

ALTER TABLE ops_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ops_metrics_admin_read" ON ops_daily_metrics
  FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "ops_metrics_no_client_write" ON ops_daily_metrics
  FOR INSERT WITH CHECK (false);
CREATE POLICY "ops_metrics_no_update" ON ops_daily_metrics
  FOR UPDATE USING (false);
CREATE POLICY "ops_metrics_no_delete" ON ops_daily_metrics
  FOR DELETE USING (false);

-- 4. Capture daily ops metrics function
CREATE OR REPLACE FUNCTION public.capture_ops_daily_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_locked NUMERIC;
  v_released NUMERIC;
  v_funding_attempts INT;
  v_failed_funding INT;
  v_security_alerts INT;
  v_active_institutions INT;
  v_active_sponsors INT;
  v_completion_pct NUMERIC;
  v_dispute_rate NUMERIC;
  v_max_inst_exposure NUMERIC;
  v_max_sponsor_exposure NUMERIC;
  v_total_exposure NUMERIC;
  v_escrow_reliability NUMERIC;
  v_trust_index NUMERIC;
BEGIN
  -- Financial
  SELECT COALESCE(SUM(locked_amount), 0), COALESCE(SUM(released_amount), 0)
  INTO v_locked, v_released
  FROM escrows WHERE status IN ('funded', 'partially_released', 'completed');

  SELECT COALESCE(SUM(locked_amount), 0) INTO v_total_exposure
  FROM escrows WHERE status IN ('funded', 'partially_released');

  -- Funding attempts today
  SELECT COUNT(*) FILTER (WHERE (metadata->>'status') = 'success'),
         COUNT(*) FILTER (WHERE (metadata->>'status') != 'success' OR metadata->>'status' IS NULL)
  INTO v_funding_attempts, v_failed_funding
  FROM financial_audit_logs WHERE action = 'escrow.fund' AND created_at >= v_today::timestamptz;

  -- Security
  SELECT COUNT(*) INTO v_security_alerts
  FROM security_events WHERE created_at >= v_today::timestamptz;

  -- Institutional
  SELECT COUNT(DISTINCT institution_id) INTO v_active_institutions
  FROM pilot_participants WHERE status = 'active' AND institution_id IS NOT NULL;

  SELECT COUNT(DISTINCT user_id) INTO v_active_sponsors
  FROM escrows WHERE status IN ('funded', 'partially_released');

  -- Completion
  SELECT CASE WHEN COUNT(*) = 0 THEN 0
    ELSE (COUNT(*) FILTER (WHERE status IN ('completed', 'archived')))::NUMERIC / COUNT(*) * 100
  END INTO v_completion_pct
  FROM deal_rooms WHERE status NOT IN ('draft');

  -- Dispute rate
  SELECT CASE WHEN COUNT(*) = 0 THEN 0
    ELSE (COUNT(*) FILTER (WHERE status = 'disputed'))::NUMERIC / COUNT(*) * 100
  END INTO v_dispute_rate
  FROM deal_rooms WHERE status NOT IN ('draft');

  -- Risk exposure concentration
  SELECT COALESCE(MAX(inst_exposure), 0) INTO v_max_inst_exposure
  FROM (SELECT SUM(locked_amount) AS inst_exposure FROM escrows
    WHERE status IN ('funded', 'partially_released')
    GROUP BY sponsor_id) sub;

  SELECT COALESCE(MAX(sp_exposure), 0) INTO v_max_sponsor_exposure
  FROM (SELECT SUM(locked_amount) AS sp_exposure FROM escrows
    WHERE status IN ('funded', 'partially_released')
    GROUP BY sponsor_id) sub;

  -- Escrow reliability (% of escrows without invariant violations)
  DECLARE v_invariant_fails INT;
  BEGIN
    SELECT COUNT(*) INTO v_invariant_fails
    FROM security_events WHERE event_type LIKE '%invariant%' AND created_at >= now() - interval '30 days';
    v_escrow_reliability := CASE WHEN v_invariant_fails = 0 THEN 100 ELSE GREATEST(0, 100 - v_invariant_fails * 5) END;
  END;

  -- Trust Health Index (composite)
  v_trust_index := (v_escrow_reliability * 0.4) + ((100 - LEAST(v_dispute_rate, 100)) * 0.3) + (v_completion_pct * 0.3);

  INSERT INTO ops_daily_metrics (
    metric_date, total_escrow_locked, total_escrow_released,
    funding_attempts, failed_funding_attempts,
    security_alerts, active_institutions, active_sponsors,
    project_completion_pct, dispute_rate_pct,
    max_institution_exposure, max_sponsor_exposure, total_platform_exposure,
    escrow_reliability_pct, trust_health_index
  ) VALUES (
    v_today, v_locked, v_released,
    v_funding_attempts, v_failed_funding,
    v_security_alerts, v_active_institutions, v_active_sponsors,
    ROUND(v_completion_pct, 2), ROUND(v_dispute_rate, 2),
    v_max_inst_exposure, v_max_sponsor_exposure, v_total_exposure,
    ROUND(v_escrow_reliability, 2), ROUND(v_trust_index, 2)
  )
  ON CONFLICT (metric_date) DO UPDATE SET
    total_escrow_locked = EXCLUDED.total_escrow_locked,
    total_escrow_released = EXCLUDED.total_escrow_released,
    funding_attempts = EXCLUDED.funding_attempts,
    failed_funding_attempts = EXCLUDED.failed_funding_attempts,
    security_alerts = EXCLUDED.security_alerts,
    active_institutions = EXCLUDED.active_institutions,
    active_sponsors = EXCLUDED.active_sponsors,
    project_completion_pct = EXCLUDED.project_completion_pct,
    dispute_rate_pct = EXCLUDED.dispute_rate_pct,
    max_institution_exposure = EXCLUDED.max_institution_exposure,
    max_sponsor_exposure = EXCLUDED.max_sponsor_exposure,
    total_platform_exposure = EXCLUDED.total_platform_exposure,
    escrow_reliability_pct = EXCLUDED.escrow_reliability_pct,
    trust_health_index = EXCLUDED.trust_health_index;

  RETURN jsonb_build_object(
    'date', v_today, 'escrow_locked', v_locked, 'escrow_released', v_released,
    'disputes_pct', v_dispute_rate, 'trust_index', v_trust_index,
    'total_exposure', v_total_exposure, 'security_alerts', v_security_alerts
  );
END;
$$;

-- 5. Fraud signal detection function (called from edge function or cron)
CREATE OR REPLACE FUNCTION public.detect_fraud_signals()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_signals INT := 0;
  v_record RECORD;
BEGIN
  -- Pattern 1: Repeated micro-funding attempts (>5 in 1 hour from same user)
  FOR v_record IN
    SELECT actor_id, COUNT(*) AS cnt
    FROM financial_audit_logs
    WHERE action = 'escrow.fund' AND created_at >= now() - interval '1 hour'
    GROUP BY actor_id HAVING COUNT(*) > 5
  LOOP
    INSERT INTO fraud_signals (signal_type, severity, user_id, description, evidence)
    VALUES ('rapid_funding', 'high', v_record.actor_id,
      format('User made %s funding attempts in 1 hour', v_record.cnt),
      jsonb_build_object('attempts', v_record.cnt, 'window', '1h'));
    v_signals := v_signals + 1;
  END LOOP;

  -- Pattern 2: Funding immediately followed by dispute (within 24h)
  FOR v_record IN
    SELECT e.sponsor_id, e.deal_id
    FROM escrows e
    JOIN deal_rooms d ON d.id = e.deal_id
    WHERE e.status = 'funded' AND d.status = 'disputed'
      AND d.updated_at - e.created_at < interval '24 hours'
      AND e.created_at >= now() - interval '7 days'
      AND NOT EXISTS (SELECT 1 FROM fraud_signals WHERE signal_type = 'fund_then_dispute'
        AND evidence->>'deal_id' = e.deal_id::text AND created_at >= now() - interval '7 days')
  LOOP
    INSERT INTO fraud_signals (signal_type, severity, user_id, description, evidence)
    VALUES ('fund_then_dispute', 'critical', v_record.sponsor_id,
      'Escrow funded then immediately disputed within 24h',
      jsonb_build_object('deal_id', v_record.deal_id));
    v_signals := v_signals + 1;
  END LOOP;

  -- Pattern 3: Rapid milestone approvals (>10 in 1 hour)
  FOR v_record IN
    SELECT actor_id, COUNT(*) AS cnt
    FROM financial_audit_logs
    WHERE action = 'milestone.release' AND created_at >= now() - interval '1 hour'
    GROUP BY actor_id HAVING COUNT(*) > 10
  LOOP
    INSERT INTO fraud_signals (signal_type, severity, user_id, description, evidence)
    VALUES ('rapid_approvals', 'high', v_record.actor_id,
      format('User approved %s milestones in 1 hour', v_record.cnt),
      jsonb_build_object('approvals', v_record.cnt, 'window', '1h'));
    v_signals := v_signals + 1;
  END LOOP;

  RETURN jsonb_build_object('signals_detected', v_signals, 'checked_at', now());
END;
$$;

-- 6. Operational readiness gate check
CREATE OR REPLACE FUNCTION public.check_ops_readiness_gate()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_critical_incidents INT;
  v_invariant_ok BOOLEAN;
  v_sla_pct NUMERIC;
  v_dispute_backlog INT;
  v_ready BOOLEAN;
BEGIN
  -- 60 days zero critical incidents
  SELECT COUNT(*) INTO v_critical_incidents
  FROM security_events WHERE severity = 'critical' AND created_at >= now() - interval '60 days';

  -- Latest invariant check
  v_invariant_ok := v_critical_incidents = 0;

  -- SLA compliance (from latest ops metric)
  SELECT COALESCE(sla_compliance_pct, 0) INTO v_sla_pct
  FROM ops_daily_metrics ORDER BY metric_date DESC LIMIT 1;

  -- Unresolved disputes
  SELECT COUNT(*) INTO v_dispute_backlog
  FROM dispute_classifications WHERE resolved_at IS NULL;

  v_ready := v_critical_incidents = 0
    AND v_sla_pct >= 90
    AND v_dispute_backlog = 0;

  RETURN jsonb_build_object(
    'ready', v_ready,
    'critical_incidents_60d', v_critical_incidents,
    'sla_compliance_pct', v_sla_pct,
    'unresolved_disputes', v_dispute_backlog,
    'checked_at', now()
  );
END;
$$;
