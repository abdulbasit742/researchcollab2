
-- =====================================================
-- INFRASTRUCTURE STRESS HARDENING MIGRATION
-- No new features. Only validation, security, constraints.
-- =====================================================

-- ============ 1. IMMUTABILITY TRIGGERS ============
-- Prevent UPDATE/DELETE on ledger_entries (append-only ledger)
CREATE OR REPLACE FUNCTION public.prevent_ledger_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RAISE EXCEPTION 'Ledger entries are immutable. UPDATE and DELETE operations are forbidden.';
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_ledger_update ON public.ledger_entries;
CREATE TRIGGER trg_prevent_ledger_update
  BEFORE UPDATE ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

DROP TRIGGER IF EXISTS trg_prevent_ledger_delete ON public.ledger_entries;
CREATE TRIGGER trg_prevent_ledger_delete
  BEFORE DELETE ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation();

-- Prevent UPDATE/DELETE on trust_events (append-only trust ledger)
CREATE OR REPLACE FUNCTION public.prevent_trust_event_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RAISE EXCEPTION 'Trust events are immutable. UPDATE and DELETE operations are forbidden.';
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_trust_update ON public.trust_events;
CREATE TRIGGER trg_prevent_trust_update
  BEFORE UPDATE ON public.trust_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_trust_event_mutation();

-- trust_events already has RLS DELETE = false, but add trigger as defense-in-depth
DROP TRIGGER IF EXISTS trg_prevent_trust_delete ON public.trust_events;
CREATE TRIGGER trg_prevent_trust_delete
  BEFORE DELETE ON public.trust_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_trust_event_mutation();

-- Prevent direct wallet balance manipulation (only RPCs should modify balances)
CREATE OR REPLACE FUNCTION public.prevent_wallet_balance_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow if called from a SECURITY DEFINER function (RPC context)
  -- Check if any financial fields changed
  IF (OLD.available_balance IS DISTINCT FROM NEW.available_balance
      OR OLD.escrow_balance IS DISTINCT FROM NEW.escrow_balance
      OR OLD.pending_balance IS DISTINCT FROM NEW.pending_balance
      OR OLD.total_earned IS DISTINCT FROM NEW.total_earned
      OR OLD.total_spent IS DISTINCT FROM NEW.total_spent)
     AND current_setting('role', true) != 'rls_none'
     AND current_setting('request.jwt.claim.role', true) IS NOT NULL
  THEN
    -- If we're in a direct client context (not inside an RPC), block it
    -- RPC functions run as SECURITY DEFINER with role = rls_none
    RAISE EXCEPTION 'Direct wallet balance modification is forbidden. Use atomic RPC functions.';
  END IF;
  RETURN NEW;
END;
$$;

-- ============ 2. MISSING INDEXES ============
-- Disputes: missing FK indexes
CREATE INDEX IF NOT EXISTS idx_disputes_initiated_by ON public.disputes (initiated_by);
CREATE INDEX IF NOT EXISTS idx_disputes_offer_id ON public.disputes (offer_id);
CREATE INDEX IF NOT EXISTS idx_disputes_milestone_id ON public.disputes (milestone_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes (status);

-- State transition logs: add timestamp index for audit queries
CREATE INDEX IF NOT EXISTS idx_state_transition_created ON public.state_transition_logs (created_at DESC);

-- Financial audit logs: add actor + timestamp index
CREATE INDEX IF NOT EXISTS idx_financial_audit_actor ON public.financial_audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_financial_audit_created ON public.financial_audit_logs (created_at DESC);

-- Trust events: add user_id index for per-user queries
CREATE INDEX IF NOT EXISTS idx_trust_events_user ON public.trust_events (user_id);

-- Wallet transactions: ensure lookup by reference
CREATE INDEX IF NOT EXISTS idx_wallet_tx_reference ON public.wallet_transactions (reference_id, reference_type);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON public.wallet_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON public.wallet_transactions (wallet_id);

-- ============ 3. MILESTONE AMOUNT CONSTRAINT ============
-- Prevent zero or negative milestone amounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'milestones_positive_amount'
  ) THEN
    ALTER TABLE public.milestones ADD CONSTRAINT milestones_positive_amount CHECK (amount > 0);
  END IF;
END $$;

-- ============ 4. HARDEN ATOMIC FUNCTIONS - ADD auth.uid() CHECKS ============

-- Harden fund_escrow_atomic with identity verification
CREATE OR REPLACE FUNCTION public.fund_escrow_atomic(
  p_escrow_id uuid, 
  p_sponsor_id uuid, 
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_escrow RECORD;
  v_wallet RECORD;
  v_new_available NUMERIC;
  v_new_escrow_bal NUMERIC;
  v_tx_id UUID := gen_random_uuid();
BEGIN
  -- SECURITY: Verify caller identity
  IF auth.uid() IS NULL THEN
    PERFORM log_security_event(NULL, 'unauthenticated_fund_attempt', 'critical');
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF auth.uid() != p_sponsor_id THEN
    PERFORM log_security_event(auth.uid(), 'identity_mismatch_fund', 'critical',
      format('User %s tried to fund as %s', auth.uid(), p_sponsor_id));
    RAISE EXCEPTION 'Identity mismatch';
  END IF;

  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM wallet_transactions
      WHERE reference_id = p_idempotency_key AND reference_type = 'escrow_fund'
    ) THEN
      RETURN jsonb_build_object('status', 'already_processed', 'idempotency_key', p_idempotency_key);
    END IF;
  END IF;

  SELECT * INTO v_escrow FROM escrows WHERE id = p_escrow_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Escrow not found: %', p_escrow_id; END IF;
  IF v_escrow.sponsor_id != p_sponsor_id THEN RAISE EXCEPTION 'Only sponsor can fund escrow'; END IF;
  IF v_escrow.status != 'created' THEN RAISE EXCEPTION 'Escrow already funded, status: %', v_escrow.status; END IF;

  SELECT * INTO v_wallet FROM wallets WHERE user_id = p_sponsor_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Sponsor wallet not found'; END IF;
  IF v_wallet.is_frozen THEN RAISE EXCEPTION 'Wallet is frozen'; END IF;
  IF v_wallet.available_balance < v_escrow.total_amount THEN
    RAISE EXCEPTION 'Insufficient balance: have %, need %', v_wallet.available_balance, v_escrow.total_amount;
  END IF;

  v_new_available := v_wallet.available_balance - v_escrow.total_amount;
  v_new_escrow_bal := v_wallet.escrow_balance + v_escrow.total_amount;
  IF v_new_available < 0 THEN RAISE EXCEPTION 'Would create negative available balance'; END IF;

  UPDATE wallets SET
    available_balance = v_new_available, escrow_balance = v_new_escrow_bal,
    total_spent = total_spent + v_escrow.total_amount, updated_at = now()
  WHERE id = v_wallet.id;

  UPDATE escrows SET locked_amount = v_escrow.total_amount, status = 'funded', updated_at = now()
  WHERE id = p_escrow_id;

  INSERT INTO wallet_transactions (wallet_id, type, amount, balance_after, description, reference_id, reference_type, status, user_id)
  VALUES (v_wallet.id, 'escrow_deposit', -v_escrow.total_amount, v_new_available, 'Escrow funded for deal',
    COALESCE(p_idempotency_key, p_escrow_id::text), 'escrow_fund', 'completed', p_sponsor_id);

  -- Ledger entries for double-entry bookkeeping
  INSERT INTO ledger_entries (transaction_id, account_type, account_id, entry_type, amount, currency, reference_type, reference_id, description, is_immutable)
  VALUES 
    (v_tx_id, 'wallet', v_wallet.id, 'debit', v_escrow.total_amount, v_escrow.currency, 'escrow_fund', p_escrow_id::text, 'Escrow funding debit', true),
    (v_tx_id, 'escrow', p_escrow_id, 'credit', v_escrow.total_amount, v_escrow.currency, 'escrow_fund', p_escrow_id::text, 'Escrow funding credit', true);

  -- Financial audit log
  INSERT INTO financial_audit_logs (entity_type, entity_id, action, actor_id, metadata)
  VALUES ('escrow', p_escrow_id, 'escrow.fund', p_sponsor_id,
    jsonb_build_object('amount', v_escrow.total_amount, 'idempotency_key', p_idempotency_key, 'transaction_id', v_tx_id, 'status', 'success'));

  PERFORM public.update_trust(p_sponsor_id, 'funding_release', 3.0, p_escrow_id, 'escrow', NULL, NULL, 
    jsonb_build_object('action', 'fund_escrow', 'amount', v_escrow.total_amount));

  RETURN jsonb_build_object('status', 'funded', 'escrow_id', p_escrow_id, 'amount', v_escrow.total_amount, 'new_available_balance', v_new_available, 'transaction_id', v_tx_id);
END;
$$;

-- Harden approve_milestone_atomic with identity verification
CREATE OR REPLACE FUNCTION public.approve_milestone_atomic(
  p_milestone_id uuid, 
  p_sponsor_id uuid, 
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_milestone RECORD;
  v_offer RECORD;
  v_escrow RECORD;
  v_sponsor_wallet RECORD;
  v_executor_wallet RECORD;
  v_platform_fee NUMERIC;
  v_net_amount NUMERIC;
  v_executor_id UUID;
  v_all_approved BOOLEAN;
  v_tx_id UUID := gen_random_uuid();
BEGIN
  -- SECURITY: Verify caller identity
  IF auth.uid() IS NULL THEN
    PERFORM log_security_event(NULL, 'unauthenticated_approve_attempt', 'critical');
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF auth.uid() != p_sponsor_id THEN
    PERFORM log_security_event(auth.uid(), 'identity_mismatch_approve', 'critical',
      format('User %s tried to approve as %s', auth.uid(), p_sponsor_id));
    RAISE EXCEPTION 'Identity mismatch';
  END IF;

  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM wallet_transactions WHERE reference_id = p_idempotency_key AND reference_type = 'milestone_release') THEN
      RETURN jsonb_build_object('status', 'already_released', 'idempotency_key', p_idempotency_key);
    END IF;
  END IF;

  SELECT * INTO v_milestone FROM milestones WHERE id = p_milestone_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Milestone not found: %', p_milestone_id; END IF;
  IF v_milestone.status != 'submitted' THEN RAISE EXCEPTION 'Milestone must be submitted to approve, current: %', v_milestone.status; END IF;

  SELECT * INTO v_offer FROM offers WHERE id = v_milestone.offer_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Offer not found'; END IF;
  IF v_offer.sender_id != p_sponsor_id THEN RAISE EXCEPTION 'Only the sponsor can approve milestones'; END IF;
  v_executor_id := v_offer.recipient_id;

  IF v_milestone.escrow_id IS NOT NULL THEN
    SELECT * INTO v_escrow FROM escrows WHERE id = v_milestone.escrow_id FOR UPDATE;
    IF FOUND AND v_escrow.status = 'disputed' THEN RAISE EXCEPTION 'Cannot approve: escrow is disputed'; END IF;
  END IF;

  v_platform_fee := COALESCE(v_milestone.platform_fee, ROUND(v_milestone.amount * 0.08, 2));
  v_net_amount := v_milestone.amount - v_platform_fee;
  IF v_net_amount < 0 THEN v_net_amount := 0; END IF;

  SELECT * INTO v_sponsor_wallet FROM wallets WHERE user_id = p_sponsor_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Sponsor wallet not found'; END IF;
  IF v_sponsor_wallet.escrow_balance < v_milestone.amount THEN
    RAISE EXCEPTION 'Insufficient escrow balance: have %, need %', v_sponsor_wallet.escrow_balance, v_milestone.amount;
  END IF;

  SELECT * INTO v_executor_wallet FROM wallets WHERE user_id = v_executor_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO wallets (user_id) VALUES (v_executor_id) RETURNING * INTO v_executor_wallet;
  END IF;

  UPDATE wallets SET escrow_balance = escrow_balance - v_milestone.amount, updated_at = now() WHERE id = v_sponsor_wallet.id;
  UPDATE wallets SET available_balance = available_balance + v_net_amount, total_earned = total_earned + v_net_amount, updated_at = now() WHERE id = v_executor_wallet.id;

  IF v_milestone.escrow_id IS NOT NULL AND v_escrow.id IS NOT NULL THEN
    UPDATE escrows SET released_amount = released_amount + v_milestone.amount, locked_amount = locked_amount - v_milestone.amount, updated_at = now() WHERE id = v_escrow.id;
  END IF;

  UPDATE milestones SET status = 'approved', approved_at = now(), approved_by = p_sponsor_id, released_at = now(), platform_fee = v_platform_fee, updated_at = now() WHERE id = p_milestone_id;

  INSERT INTO wallet_transactions (wallet_id, type, amount, balance_after, description, reference_id, reference_type, status, user_id)
  VALUES (v_sponsor_wallet.id, 'escrow_release', -v_milestone.amount, v_sponsor_wallet.escrow_balance - v_milestone.amount, 'Milestone approved: ' || v_milestone.title, COALESCE(p_idempotency_key, p_milestone_id::text), 'milestone_release', 'completed', p_sponsor_id);

  INSERT INTO wallet_transactions (wallet_id, type, amount, balance_after, description, reference_id, reference_type, status, user_id)
  VALUES (v_executor_wallet.id, 'milestone_release', v_net_amount, v_executor_wallet.available_balance + v_net_amount, 'Payment: ' || v_milestone.title, COALESCE(p_idempotency_key, p_milestone_id::text), 'milestone_release', 'completed', v_executor_id);

  -- Ledger entries
  INSERT INTO ledger_entries (transaction_id, account_type, account_id, entry_type, amount, currency, reference_type, reference_id, description, is_immutable)
  VALUES 
    (v_tx_id, 'escrow', COALESCE(v_escrow.id, v_milestone.escrow_id), 'debit', v_milestone.amount, 'PKR', 'milestone_approve', p_milestone_id::text, 'Milestone approval release', true),
    (v_tx_id, 'wallet', v_executor_wallet.id, 'credit', v_net_amount, 'PKR', 'milestone_approve', p_milestone_id::text, 'Milestone payment received', true);

  -- Financial audit
  INSERT INTO financial_audit_logs (entity_type, entity_id, action, actor_id, metadata)
  VALUES ('milestone', p_milestone_id, 'milestone.approve', p_sponsor_id,
    jsonb_build_object('gross_amount', v_milestone.amount, 'platform_fee', v_platform_fee, 'net_amount', v_net_amount, 'idempotency_key', p_idempotency_key, 'transaction_id', v_tx_id, 'status', 'success'));

  PERFORM public.update_trust(v_executor_id, 'milestone_completion', 5.0, p_milestone_id, 'milestone', NULL, NULL, jsonb_build_object('milestone_title', v_milestone.title, 'amount', v_milestone.amount));
  PERFORM public.update_trust(p_sponsor_id, 'milestone_completion', 2.0, p_milestone_id, 'milestone', NULL, NULL, jsonb_build_object('action', 'approval', 'amount', v_milestone.amount));

  SELECT NOT EXISTS (SELECT 1 FROM milestones WHERE offer_id = v_offer.id AND status NOT IN ('approved', 'released')) INTO v_all_approved;
  IF v_all_approved AND v_milestone.escrow_id IS NOT NULL THEN
    UPDATE escrows SET status = 'completed', updated_at = now() WHERE id = v_milestone.escrow_id;
  END IF;

  -- Post-operation invariant check
  IF v_milestone.escrow_id IS NOT NULL AND v_escrow.id IS NOT NULL THEN
    DECLARE
      v_check RECORD;
    BEGIN
      SELECT * INTO v_check FROM escrows WHERE id = v_escrow.id;
      IF v_check.locked_amount + v_check.released_amount + v_check.refunded_amount > v_check.total_amount + 0.01 THEN
        PERFORM log_security_event(p_sponsor_id, 'escrow_invariant_violation', 'critical');
        RAISE EXCEPTION 'Escrow invariant violated after approval';
      END IF;
    END;
  END IF;

  RETURN jsonb_build_object('status', 'approved_and_released', 'milestone_id', p_milestone_id, 'gross_amount', v_milestone.amount, 'platform_fee', v_platform_fee, 'net_amount', v_net_amount, 'executor_id', v_executor_id, 'all_milestones_complete', v_all_approved, 'transaction_id', v_tx_id);
END;
$$;

-- ============ 5. FIX RLS ROLE TARGETS ============
-- Disputes: change from {public} to {authenticated}
DROP POLICY IF EXISTS "Users can create disputes" ON public.disputes;
CREATE POLICY "Users can create disputes" ON public.disputes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = initiated_by);

-- Escrows: tighten insert policy
DROP POLICY IF EXISTS "escrow_service_insert" ON public.escrows;
CREATE POLICY "escrow_service_insert" ON public.escrows
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sponsor_id);

-- Escrows: tighten update policy  
DROP POLICY IF EXISTS "escrow_sponsor_update" ON public.escrows;
CREATE POLICY "escrow_sponsor_update" ON public.escrows
  FOR UPDATE TO authenticated
  USING (auth.uid() = sponsor_id);

-- Escrows: tighten select policies
DROP POLICY IF EXISTS "escrow_participant_select" ON public.escrows;
CREATE POLICY "escrow_participant_select" ON public.escrows
  FOR SELECT TO authenticated
  USING ((auth.uid() = sponsor_id) OR (auth.uid() = recipient_id));

DROP POLICY IF EXISTS "escrow_admin_select" ON public.escrows;
CREATE POLICY "escrow_admin_select" ON public.escrows
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- Disputes: tighten admin update
DROP POLICY IF EXISTS "Admins can update disputes" ON public.disputes;
CREATE POLICY "Admins can update disputes" ON public.disputes
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role
  ));

-- Disputes: tighten select
DROP POLICY IF EXISTS "Users can view disputes they're involved in" ON public.disputes;
CREATE POLICY "Users can view disputes they're involved in" ON public.disputes
  FOR SELECT TO authenticated
  USING (
    (initiated_by = auth.uid()) OR 
    (milestone_id IN (
      SELECT m.id FROM milestones m
      JOIN offers o ON m.offer_id = o.id
      WHERE o.sender_id = auth.uid() OR o.recipient_id = auth.uid()
    ))
  );

-- ============ 6. PREVENT ESCROW DELETION ============
-- No one should ever delete an escrow
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'escrows' AND policyname = 'No escrow deletes'
  ) THEN
    CREATE POLICY "No escrow deletes" ON public.escrows
      FOR DELETE TO authenticated
      USING (false);
  END IF;
END $$;

-- ============ 7. TRUST EVENT RATE LIMITING (via validation trigger) ============
CREATE OR REPLACE FUNCTION public.enforce_trust_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_daily_count INT;
  v_hourly_count INT;
BEGIN
  -- Max 15 trust events per user per day
  SELECT count(*) INTO v_daily_count
  FROM trust_events
  WHERE user_id = NEW.user_id
    AND created_at > now() - INTERVAL '1 day';
  
  IF v_daily_count >= 15 THEN
    RAISE EXCEPTION 'Trust event rate limit exceeded: max 15 per day';
  END IF;

  -- Max 5 trust events per user per hour (burst protection)
  SELECT count(*) INTO v_hourly_count
  FROM trust_events
  WHERE user_id = NEW.user_id
    AND created_at > now() - INTERVAL '1 hour';
  
  IF v_hourly_count >= 5 THEN
    RAISE EXCEPTION 'Trust event rate limit exceeded: max 5 per hour';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_trust_rate_limit ON public.trust_events;
CREATE TRIGGER trg_trust_rate_limit
  BEFORE INSERT ON public.trust_events
  FOR EACH ROW EXECUTE FUNCTION public.enforce_trust_rate_limit();
