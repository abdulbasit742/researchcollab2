
-- ============================================================
-- PART 1: System Integrity Checks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.system_integrity_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  status text NOT NULL DEFAULT 'pass' CHECK (status IN ('pass', 'fail', 'warning')),
  description text,
  detected_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_integrity_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only read integrity checks"
  ON public.system_integrity_checks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_integrity_checks_type ON public.system_integrity_checks(check_type);
CREATE INDEX idx_integrity_checks_status ON public.system_integrity_checks(status);
CREATE INDEX idx_integrity_checks_detected ON public.system_integrity_checks(detected_at DESC);

-- ============================================================
-- PART 2: RLS Validation Results
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rls_validation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  rls_enabled boolean NOT NULL DEFAULT false,
  policy_count integer NOT NULL DEFAULT 0,
  validation_status text NOT NULL DEFAULT 'unchecked' CHECK (validation_status IN ('pass', 'fail', 'warning', 'unchecked')),
  checked_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rls_validation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only read rls validation"
  ON public.rls_validation_results FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- PART 3: Execution Flow Audit
-- ============================================================
CREATE TABLE IF NOT EXISTS public.execution_flow_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid,
  milestone_id uuid,
  flow_state_valid boolean NOT NULL DEFAULT true,
  anomaly_detected boolean NOT NULL DEFAULT false,
  anomaly_description text,
  checked_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.execution_flow_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only read execution flow audit"
  ON public.execution_flow_audit FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_execution_flow_anomaly ON public.execution_flow_audit(anomaly_detected) WHERE anomaly_detected = true;

-- ============================================================
-- PART 4: Frontend Error Logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.frontend_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  route text,
  error_message text NOT NULL,
  stack_trace text,
  component_stack text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.frontend_error_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own errors
CREATE POLICY "Users can log own errors"
  ON public.frontend_error_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin can read all
CREATE POLICY "Admin only read error logs"
  ON public.frontend_error_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_frontend_errors_occurred ON public.frontend_error_logs(occurred_at DESC);
CREATE INDEX idx_frontend_errors_route ON public.frontend_error_logs(route);

-- ============================================================
-- PART 5: Reconciliation Reports
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reconciliation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date NOT NULL DEFAULT CURRENT_DATE,
  check_type text NOT NULL,
  status text NOT NULL DEFAULT 'pass' CHECK (status IN ('pass', 'fail', 'warning')),
  issues_found integer NOT NULL DEFAULT 0,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reconciliation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only read reconciliation"
  ON public.reconciliation_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- RPC: run_integrity_checks (read-only verification)
-- ============================================================
CREATE OR REPLACE FUNCTION public.run_integrity_checks()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  check_result jsonb;
  v_count integer;
BEGIN
  -- Check 1: Escrow invariant (locked + released + refunded <= total)
  SELECT count(*) INTO v_count
  FROM public.escrow_accounts
  WHERE (COALESCE(locked_amount, 0) + COALESCE(released_amount, 0) + COALESCE(refunded_amount, 0)) > COALESCE(total_amount, 0);
  
  IF v_count > 0 THEN
    INSERT INTO public.system_integrity_checks (check_type, entity_type, status, description)
    VALUES ('escrow_invariant', 'escrow_accounts', 'fail', 
      format('%s escrow accounts violate locked+released+refunded <= total', v_count));
  END IF;
  
  result := result || jsonb_build_object('escrow_invariant', CASE WHEN v_count = 0 THEN 'pass' ELSE 'fail' END, 'violations', v_count);

  -- Check 2: No negative wallet balances
  SELECT count(*) INTO v_count
  FROM public.wallets
  WHERE available_balance < 0 OR escrow_balance < 0;
  
  IF v_count > 0 THEN
    INSERT INTO public.system_integrity_checks (check_type, entity_type, status, description)
    VALUES ('negative_balance', 'wallets', 'fail', 
      format('%s wallets have negative balances', v_count));
  END IF;
  
  result := result || jsonb_build_object('negative_balances', CASE WHEN v_count = 0 THEN 'pass' ELSE 'fail' END, 'negative_count', v_count);

  -- Check 3: No negative milestone amounts
  SELECT count(*) INTO v_count
  FROM public.milestones
  WHERE amount < 0;
  
  IF v_count > 0 THEN
    INSERT INTO public.system_integrity_checks (check_type, entity_type, status, description)
    VALUES ('negative_milestone_amount', 'milestones', 'fail',
      format('%s milestones have negative amounts', v_count));
  END IF;
  
  result := result || jsonb_build_object('negative_milestones', CASE WHEN v_count = 0 THEN 'pass' ELSE 'fail' END);

  -- Check 4: Approved milestones should have submission record
  SELECT count(*) INTO v_count
  FROM public.milestones m
  WHERE m.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM public.milestone_submissions ms WHERE ms.milestone_id = m.id
  );

  IF v_count > 0 THEN
    INSERT INTO public.system_integrity_checks (check_type, entity_type, status, description)
    VALUES ('approved_without_submission', 'milestones', 'warning',
      format('%s approved milestones lack submission records', v_count));
  END IF;

  result := result || jsonb_build_object('approved_without_submission', CASE WHEN v_count = 0 THEN 'pass' ELSE 'warning' END);

  -- Check 5: Orphan milestones (no valid project)
  SELECT count(*) INTO v_count
  FROM public.milestones m
  WHERE NOT EXISTS (
    SELECT 1 FROM public.offers o WHERE o.id = m.offer_id
  );

  IF v_count > 0 THEN
    INSERT INTO public.system_integrity_checks (check_type, entity_type, status, description)
    VALUES ('orphan_milestones', 'milestones', 'warning',
      format('%s milestones reference non-existent offers', v_count));
  END IF;

  result := result || jsonb_build_object('orphan_milestones', CASE WHEN v_count = 0 THEN 'pass' ELSE 'warning' END);

  RETURN result;
END;
$$;

-- ============================================================
-- RPC: validate_rls_policies (admin-only read)
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_rls_policies()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec record;
  result jsonb := '[]'::jsonb;
  v_policy_count integer;
BEGIN
  -- Truncate old results
  DELETE FROM public.rls_validation_results WHERE checked_at < now() - interval '1 day';
  
  FOR rec IN
    SELECT schemaname, tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  LOOP
    SELECT count(*) INTO v_policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = rec.tablename;
    
    INSERT INTO public.rls_validation_results (table_name, rls_enabled, policy_count, validation_status)
    VALUES (
      rec.tablename,
      rec.rowsecurity,
      v_policy_count,
      CASE
        WHEN NOT rec.rowsecurity THEN 'fail'
        WHEN v_policy_count = 0 THEN 'warning'
        ELSE 'pass'
      END
    );
    
    result := result || jsonb_build_object(
      'table', rec.tablename,
      'rls_enabled', rec.rowsecurity,
      'policies', v_policy_count,
      'status', CASE WHEN NOT rec.rowsecurity THEN 'fail' WHEN v_policy_count = 0 THEN 'warning' ELSE 'pass' END
    );
  END LOOP;
  
  RETURN result;
END;
$$;
