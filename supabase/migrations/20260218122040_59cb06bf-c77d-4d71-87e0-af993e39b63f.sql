
-- =====================================================
-- PART 1: Fix permissive INSERT policies on financial/critical tables
-- =====================================================

DROP POLICY IF EXISTS "Authenticated can create allocations" ON public.equity_allocations;
CREATE POLICY "Owner or admin can create allocations"
  ON public.equity_allocations FOR INSERT TO authenticated
  WITH CHECK (holder_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated can create rounds" ON public.funding_rounds;
CREATE POLICY "Admin can create funding rounds"
  ON public.funding_rounds FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated can create vesting" ON public.vesting_schedules;
CREATE POLICY "Admin can create vesting schedules"
  ON public.vesting_schedules FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated can create SIP events" ON public.sip_events;
CREATE POLICY "Users can create own SIP events"
  ON public.sip_events FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

DROP POLICY IF EXISTS "pm_insert" ON public.pod_members;
CREATE POLICY "Users can join pods as themselves"
  ON public.pod_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated can create equity logs" ON public.equity_transaction_logs;
CREATE POLICY "Admin can create equity logs"
  ON public.equity_transaction_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- =====================================================
-- PART 2: Double-entry ledger system
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL,
  account_type text NOT NULL,
  account_id uuid NOT NULL,
  entry_type text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'PKR',
  reference_type text,
  reference_id text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_immutable boolean NOT NULL DEFAULT true
);

CREATE OR REPLACE FUNCTION public.validate_ledger_entry()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.account_type NOT IN ('user_available', 'user_escrow', 'user_pending', 'platform_revenue', 'platform_escrow') THEN
    RAISE EXCEPTION 'Invalid account_type: %', NEW.account_type;
  END IF;
  IF NEW.entry_type NOT IN ('debit', 'credit') THEN
    RAISE EXCEPTION 'Invalid entry_type: %', NEW.entry_type;
  END IF;
  IF NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Ledger amount must be positive';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_ledger_entry_trigger
  BEFORE INSERT ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.validate_ledger_entry();

CREATE OR REPLACE FUNCTION public.prevent_ledger_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF OLD.is_immutable THEN
    RAISE EXCEPTION 'Ledger entries are immutable and cannot be modified or deleted';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

CREATE TRIGGER prevent_ledger_mutation_trigger
  BEFORE UPDATE OR DELETE ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all ledger entries"
  ON public.ledger_entries FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can read own ledger entries"
  ON public.ledger_entries FOR SELECT TO authenticated
  USING (account_id = auth.uid());

CREATE POLICY "No direct ledger inserts"
  ON public.ledger_entries FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_transaction ON public.ledger_entries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_account ON public.ledger_entries(account_id, account_type);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_created ON public.ledger_entries(created_at);

CREATE OR REPLACE FUNCTION public.record_ledger_entry(
  p_debit_account_type text, p_debit_account_id uuid,
  p_credit_account_type text, p_credit_account_id uuid,
  p_amount numeric, p_currency text DEFAULT 'PKR',
  p_reference_type text DEFAULT NULL, p_reference_id text DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_txn_id uuid := gen_random_uuid();
BEGIN
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Ledger amount must be positive'; END IF;

  INSERT INTO ledger_entries (transaction_id, account_type, account_id, entry_type, amount, currency, reference_type, reference_id, description)
  VALUES (v_txn_id, p_debit_account_type, p_debit_account_id, 'debit', p_amount, p_currency, p_reference_type, p_reference_id, p_description);

  INSERT INTO ledger_entries (transaction_id, account_type, account_id, entry_type, amount, currency, reference_type, reference_id, description)
  VALUES (v_txn_id, p_credit_account_type, p_credit_account_id, 'credit', p_amount, p_currency, p_reference_type, p_reference_id, p_description);

  RETURN v_txn_id;
END;
$$;

-- =====================================================
-- PART 3: Real rate limiting
-- =====================================================

CREATE TABLE IF NOT EXISTS public.rate_limit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to rate limit events"
  ON public.rate_limit_events FOR ALL TO authenticated
  USING (false);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_lookup ON public.rate_limit_events(user_id, action_type, created_at);

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_user_id uuid, p_action_type text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_limit rate_limits%ROWTYPE;
  v_hourly_count integer;
  v_daily_count integer;
  v_role text;
BEGIN
  SELECT role::text INTO v_role FROM user_roles WHERE user_id = p_user_id LIMIT 1;

  SELECT * INTO v_limit FROM rate_limits
  WHERE action_type = p_action_type AND role = COALESCE(v_role, 'user') AND is_active = true LIMIT 1;

  IF v_limit.id IS NULL THEN
    SELECT * INTO v_limit FROM rate_limits
    WHERE action_type = p_action_type AND role = 'all' AND is_active = true LIMIT 1;
  END IF;

  IF v_limit.id IS NULL THEN RETURN true; END IF;

  SELECT COUNT(*) INTO v_hourly_count FROM rate_limit_events
  WHERE user_id = p_user_id AND action_type = p_action_type AND created_at > now() - interval '1 hour';
  IF v_hourly_count >= v_limit.max_per_hour THEN RETURN false; END IF;

  SELECT COUNT(*) INTO v_daily_count FROM rate_limit_events
  WHERE user_id = p_user_id AND action_type = p_action_type AND created_at > now() - interval '1 day';
  IF v_daily_count >= v_limit.max_per_day THEN RETURN false; END IF;

  INSERT INTO rate_limit_events (user_id, action_type) VALUES (p_user_id, p_action_type);
  RETURN true;
END;
$$;

-- =====================================================
-- PART 4: Escrow reconciliation function
-- =====================================================

CREATE OR REPLACE FUNCTION public.reconcile_escrow_balances()
RETURNS TABLE(user_id uuid, wallet_escrow numeric, calculated_escrow numeric, discrepancy numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT w.user_id, w.escrow_balance,
    COALESCE(SUM(m.amount - COALESCE(m.partial_release_amount, 0)), 0),
    w.escrow_balance - COALESCE(SUM(m.amount - COALESCE(m.partial_release_amount, 0)), 0)
  FROM wallets w
  LEFT JOIN offers o ON o.recipient_id = w.user_id AND o.status IN ('active', 'in_progress')
  LEFT JOIN milestones m ON m.offer_id = o.id AND m.status IN ('pending', 'in_progress', 'submitted', 'approved')
  WHERE w.escrow_balance > 0
  GROUP BY w.user_id, w.escrow_balance
  HAVING ABS(w.escrow_balance - COALESCE(SUM(m.amount - COALESCE(m.partial_release_amount, 0)), 0)) > 0.01;
END;
$$;
