
-- ============================================================
-- SECURITY HARDENING MIGRATION (FIXED)
-- ============================================================

-- 1. Tighten financial_audit_logs: only own entries + admin
DROP POLICY IF EXISTS "audit_logs_read" ON financial_audit_logs;
CREATE POLICY "audit_logs_own_read" ON financial_audit_logs
  FOR SELECT USING (
    actor_id = auth.uid()
    OR is_admin(auth.uid())
  );

-- Block all writes from client (only service_role / DB functions can insert)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'financial_audit_logs' AND policyname = 'audit_logs_no_client_insert') THEN
    CREATE POLICY "audit_logs_no_client_insert" ON financial_audit_logs FOR INSERT WITH CHECK (false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'financial_audit_logs' AND policyname = 'audit_logs_no_update') THEN
    CREATE POLICY "audit_logs_no_update" ON financial_audit_logs FOR UPDATE USING (false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'financial_audit_logs' AND policyname = 'audit_logs_no_delete') THEN
    CREATE POLICY "audit_logs_no_delete" ON financial_audit_logs FOR DELETE USING (false);
  END IF;
END $$;

-- 2. Add admin SELECT for escrows (read-only monitoring)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'escrows' AND policyname = 'escrow_admin_select') THEN
    CREATE POLICY "escrow_admin_select" ON escrows FOR SELECT USING (is_admin(auth.uid()));
  END IF;
END $$;

-- 3. Fix wallet admin policy to use is_admin function
DROP POLICY IF EXISTS "Admins can view all wallets" ON wallets;
DROP POLICY IF EXISTS "Admins can update all wallets" ON wallets;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallets' AND policyname = 'wallet_admin_select') THEN
    CREATE POLICY "wallet_admin_select" ON wallets FOR SELECT USING (is_admin(auth.uid()));
  END IF;
END $$;

-- 4. Create security_events table
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  ip_address TEXT,
  request_metadata JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC);

ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_events' AND policyname = 'security_events_admin_read') THEN
    CREATE POLICY "security_events_admin_read" ON security_events FOR SELECT USING (is_admin(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_events' AND policyname = 'security_events_no_client_write') THEN
    CREATE POLICY "security_events_no_client_write" ON security_events FOR INSERT WITH CHECK (false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_events' AND policyname = 'security_events_no_update') THEN
    CREATE POLICY "security_events_no_update" ON security_events FOR UPDATE USING (false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_events' AND policyname = 'security_events_no_delete') THEN
    CREATE POLICY "security_events_no_delete" ON security_events FOR DELETE USING (false);
  END IF;
END $$;

-- 5. Security event logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_severity TEXT DEFAULT 'medium',
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO security_events (user_id, event_type, severity, description, request_metadata)
  VALUES (p_user_id, p_event_type, p_severity, p_description, p_metadata);
END;
$$;

-- 6. Enhanced fund_escrow_atomic with auth + security logging (FIXED casts)
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
BEGIN
  IF auth.uid() IS NULL THEN
    PERFORM log_security_event(NULL, 'unauthenticated_escrow_attempt', 'critical', 'Unauthenticated escrow funding attempt');
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF auth.uid() != p_sponsor_id THEN
    PERFORM log_security_event(auth.uid(), 'identity_mismatch', 'critical', 
      format('User %s tried to fund as sponsor %s', auth.uid(), p_sponsor_id));
    RAISE EXCEPTION 'Identity mismatch: you can only fund as yourself';
  END IF;

  IF EXISTS (
    SELECT 1 FROM financial_audit_logs 
    WHERE metadata->>'idempotency_key' = p_idempotency_key 
      AND action = 'escrow.fund'
      AND (metadata->>'status') = 'success'
  ) THEN
    SELECT id INTO v_escrow_id FROM escrows WHERE deal_id = p_deal_id LIMIT 1;
    RETURN jsonb_build_object('success', true, 'escrow_id', v_escrow_id, 'idempotent', true);
  END IF;

  SELECT * INTO v_deal FROM deal_rooms WHERE id = p_deal_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Deal not found: %', p_deal_id; END IF;
  IF v_deal.buyer_id != p_sponsor_id THEN
    PERFORM log_security_event(p_sponsor_id, 'unauthorized_escrow_fund', 'high',
      format('User tried to fund deal %s they do not own', p_deal_id));
    RAISE EXCEPTION 'Only the sponsor can fund escrow';
  END IF;
  
  v_amount := COALESCE(v_deal.agreed_amount, 0);
  IF v_amount <= 0 THEN RAISE EXCEPTION 'No agreed amount on deal'; END IF;

  SELECT * INTO v_wallet FROM wallets WHERE user_id = p_sponsor_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found for sponsor'; END IF;
  IF v_wallet.is_frozen = true THEN
    PERFORM log_security_event(p_sponsor_id, 'frozen_wallet_fund_attempt', 'high', 'Attempted to fund from frozen wallet');
    RAISE EXCEPTION 'Wallet is frozen';
  END IF;
  IF v_wallet.available_balance < v_amount THEN
    PERFORM log_security_event(p_sponsor_id, 'insufficient_balance_attempt', 'medium',
      format('Tried to fund %s with balance %s', v_amount, v_wallet.available_balance));
    RAISE EXCEPTION 'Insufficient balance: have %, need %', v_wallet.available_balance, v_amount;
  END IF;

  SELECT * INTO v_escrow FROM escrows WHERE deal_id = p_deal_id FOR UPDATE;
  IF FOUND AND v_escrow.status != 'created' THEN 
    PERFORM log_security_event(p_sponsor_id, 'duplicate_escrow_fund', 'high', format('Duplicate fund attempt on deal %s', p_deal_id));
    RAISE EXCEPTION 'Escrow already funded'; 
  END IF;

  IF NOT FOUND THEN
    INSERT INTO escrows (deal_id, sponsor_id, recipient_id, total_amount, locked_amount, released_amount, refunded_amount, currency, status)
    VALUES (p_deal_id, p_sponsor_id, v_deal.seller_id, v_amount, v_amount, 0, 0, v_wallet.currency, 'funded')
    RETURNING * INTO v_escrow;
  ELSE
    UPDATE escrows SET locked_amount = v_amount, status = 'funded', updated_at = now() WHERE id = v_escrow.id RETURNING * INTO v_escrow;
  END IF;

  UPDATE wallets SET 
    available_balance = available_balance - v_amount,
    escrow_balance = escrow_balance + v_amount,
    total_spent = total_spent + v_amount,
    updated_at = now()
  WHERE id = v_wallet.id;

  IF (SELECT available_balance FROM wallets WHERE id = v_wallet.id) < 0 THEN
    PERFORM log_security_event(p_sponsor_id, 'negative_balance_detected', 'critical', 'Wallet went negative during escrow funding');
    RAISE EXCEPTION 'Wallet balance went negative - aborting';
  END IF;

  INSERT INTO ledger_entries (transaction_id, account_type, account_id, entry_type, amount, currency, reference_type, reference_id, description, is_immutable)
  VALUES 
    (v_tx_id, 'wallet', v_wallet.id, 'debit', v_amount, v_wallet.currency, 'escrow', v_escrow.id::text, 'Escrow funded for deal ' || p_deal_id, true),
    (v_tx_id, 'escrow', v_escrow.id, 'credit', v_amount, v_wallet.currency, 'escrow', v_escrow.id::text, 'Escrow funded for deal ' || p_deal_id, true);

  INSERT INTO financial_audit_logs (entity_type, entity_id, action, actor_id, metadata)
  VALUES ('escrow', v_escrow.id, 'escrow.fund', p_sponsor_id, 
    jsonb_build_object('deal_id', p_deal_id, 'amount', v_amount, 'idempotency_key', p_idempotency_key, 'transaction_id', v_tx_id, 'status', 'success'));

  IF v_escrow.locked_amount + v_escrow.released_amount + v_escrow.refunded_amount > v_escrow.total_amount + 0.01 THEN
    PERFORM log_security_event(p_sponsor_id, 'escrow_invariant_violation', 'critical', 'Escrow invariant violated after funding');
    RAISE EXCEPTION 'Escrow invariant violated after funding';
  END IF;

  RETURN jsonb_build_object('success', true, 'escrow_id', v_escrow.id, 'amount', v_amount, 'transaction_id', v_tx_id);
END;
$$;

-- 7. Enhanced release_milestone_atomic (FIXED casts)
CREATE OR REPLACE FUNCTION public.release_milestone_atomic(
  p_milestone_id UUID,
  p_sponsor_id UUID,
  p_idempotency_key TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_milestone RECORD;
  v_escrow RECORD;
  v_sponsor_wallet RECORD;
  v_recipient_wallet RECORD;
  v_amount NUMERIC;
  v_tx_id UUID := gen_random_uuid();
  v_new_locked NUMERIC;
  v_new_released NUMERIC;
  v_new_status TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    PERFORM log_security_event(NULL, 'unauthenticated_release_attempt', 'critical');
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF auth.uid() != p_sponsor_id THEN
    PERFORM log_security_event(auth.uid(), 'identity_mismatch_release', 'critical',
      format('User %s tried to release as %s', auth.uid(), p_sponsor_id));
    RAISE EXCEPTION 'Identity mismatch';
  END IF;

  IF EXISTS (
    SELECT 1 FROM financial_audit_logs 
    WHERE metadata->>'idempotency_key' = p_idempotency_key 
      AND action = 'milestone.release'
      AND (metadata->>'status') = 'success'
  ) THEN
    RETURN jsonb_build_object('success', true, 'milestone_id', p_milestone_id, 'idempotent', true);
  END IF;

  SELECT * INTO v_milestone FROM milestones WHERE id = p_milestone_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Milestone not found'; END IF;
  IF v_milestone.status = 'released' THEN RAISE EXCEPTION 'Milestone already released'; END IF;
  IF v_milestone.status != 'submitted' THEN RAISE EXCEPTION 'Milestone must be in submitted status, got: %', v_milestone.status; END IF;

  v_amount := v_milestone.amount;
  IF v_amount <= 0 THEN RAISE EXCEPTION 'Invalid milestone amount'; END IF;

  IF v_milestone.escrow_id IS NOT NULL THEN
    SELECT * INTO v_escrow FROM escrows WHERE id = v_milestone.escrow_id FOR UPDATE;
  ELSIF v_milestone.deal_id IS NOT NULL THEN
    SELECT * INTO v_escrow FROM escrows WHERE deal_id = v_milestone.deal_id FOR UPDATE;
  ELSE
    SELECT * INTO v_escrow FROM escrows WHERE deal_id = v_milestone.offer_id FOR UPDATE;
  END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'Escrow not found for milestone'; END IF;
  IF v_escrow.sponsor_id != p_sponsor_id THEN
    PERFORM log_security_event(p_sponsor_id, 'unauthorized_milestone_release', 'critical',
      format('Non-sponsor tried to release milestone %s', p_milestone_id));
    RAISE EXCEPTION 'Only sponsor can approve';
  END IF;

  IF v_amount > v_escrow.locked_amount THEN
    PERFORM log_security_event(p_sponsor_id, 'over_release_attempt', 'high',
      format('Tried to release %s but only %s locked', v_amount, v_escrow.locked_amount));
    RAISE EXCEPTION 'Milestone amount % exceeds locked amount %', v_amount, v_escrow.locked_amount;
  END IF;

  v_new_locked := v_escrow.locked_amount - v_amount;
  v_new_released := v_escrow.released_amount + v_amount;
  v_new_status := CASE WHEN v_new_locked = 0 THEN 'completed' ELSE 'partially_released' END;

  UPDATE escrows SET locked_amount = v_new_locked, released_amount = v_new_released, status = v_new_status, updated_at = now()
  WHERE id = v_escrow.id;

  SELECT * INTO v_sponsor_wallet FROM wallets WHERE user_id = p_sponsor_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Sponsor wallet not found'; END IF;
  UPDATE wallets SET escrow_balance = escrow_balance - v_amount, updated_at = now() WHERE id = v_sponsor_wallet.id;

  SELECT * INTO v_recipient_wallet FROM wallets WHERE user_id = v_escrow.recipient_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO wallets (user_id, available_balance, escrow_balance, pending_balance, total_earned, total_spent, currency)
    VALUES (v_escrow.recipient_id, v_amount, 0, 0, v_amount, 0, v_escrow.currency)
    RETURNING * INTO v_recipient_wallet;
  ELSE
    UPDATE wallets SET available_balance = available_balance + v_amount, total_earned = total_earned + v_amount, updated_at = now() WHERE id = v_recipient_wallet.id;
  END IF;

  INSERT INTO ledger_entries (transaction_id, account_type, account_id, entry_type, amount, currency, reference_type, reference_id, description, is_immutable)
  VALUES 
    (v_tx_id, 'escrow', v_escrow.id, 'debit', v_amount, v_escrow.currency, 'milestone', p_milestone_id::text, 'Milestone release ' || p_milestone_id, true),
    (v_tx_id, 'wallet', v_recipient_wallet.id, 'credit', v_amount, v_escrow.currency, 'milestone', p_milestone_id::text, 'Milestone release ' || p_milestone_id, true);

  UPDATE milestones SET status = 'released', approved_at = now(), approved_by = p_sponsor_id, released_at = now(), updated_at = now()
  WHERE id = p_milestone_id;

  INSERT INTO financial_audit_logs (entity_type, entity_id, action, actor_id, metadata)
  VALUES ('milestone', p_milestone_id, 'milestone.release', p_sponsor_id,
    jsonb_build_object('escrow_id', v_escrow.id, 'amount', v_amount, 'idempotency_key', p_idempotency_key, 'transaction_id', v_tx_id, 'status', 'success'));

  IF v_new_locked + v_new_released + v_escrow.refunded_amount > v_escrow.total_amount + 0.01 THEN
    PERFORM log_security_event(p_sponsor_id, 'escrow_invariant_violation', 'critical', 'Invariant violated after milestone release');
    RAISE EXCEPTION 'Escrow invariant violated after milestone release';
  END IF;

  RETURN jsonb_build_object('success', true, 'milestone_id', p_milestone_id, 'escrow_id', v_escrow.id, 'amount', v_amount, 'new_escrow_status', v_new_status, 'transaction_id', v_tx_id);
END;
$$;

-- 8. Enhanced refund (FIXED casts)
CREATE OR REPLACE FUNCTION public.refund_escrow_atomic(
  p_escrow_id UUID,
  p_sponsor_id UUID,
  p_idempotency_key TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_escrow RECORD;
  v_wallet RECORD;
  v_refund_amount NUMERIC;
  v_tx_id UUID := gen_random_uuid();
BEGIN
  IF auth.uid() IS NULL THEN
    PERFORM log_security_event(NULL, 'unauthenticated_refund_attempt', 'critical');
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF auth.uid() != p_sponsor_id THEN
    PERFORM log_security_event(auth.uid(), 'identity_mismatch_refund', 'critical');
    RAISE EXCEPTION 'Identity mismatch';
  END IF;

  IF EXISTS (
    SELECT 1 FROM financial_audit_logs 
    WHERE metadata->>'idempotency_key' = p_idempotency_key 
      AND action = 'escrow.refund'
      AND (metadata->>'status') = 'success'
  ) THEN
    RETURN jsonb_build_object('success', true, 'escrow_id', p_escrow_id, 'idempotent', true);
  END IF;

  SELECT * INTO v_escrow FROM escrows WHERE id = p_escrow_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Escrow not found'; END IF;
  IF v_escrow.sponsor_id != p_sponsor_id THEN
    PERFORM log_security_event(p_sponsor_id, 'unauthorized_refund', 'critical');
    RAISE EXCEPTION 'Only sponsor can refund';
  END IF;
  IF v_escrow.status NOT IN ('funded', 'disputed') THEN RAISE EXCEPTION 'Cannot refund from status: %', v_escrow.status; END IF;

  v_refund_amount := v_escrow.locked_amount;
  IF v_refund_amount <= 0 THEN RAISE EXCEPTION 'Nothing to refund'; END IF;

  UPDATE escrows SET locked_amount = 0, refunded_amount = refunded_amount + v_refund_amount, status = 'refunded', updated_at = now()
  WHERE id = p_escrow_id;

  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_escrow.sponsor_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Sponsor wallet not found'; END IF;
  UPDATE wallets SET escrow_balance = escrow_balance - v_refund_amount, available_balance = available_balance + v_refund_amount, updated_at = now()
  WHERE id = v_wallet.id;

  INSERT INTO ledger_entries (transaction_id, account_type, account_id, entry_type, amount, currency, reference_type, reference_id, description, is_immutable)
  VALUES 
    (v_tx_id, 'escrow', v_escrow.id, 'debit', v_refund_amount, v_escrow.currency, 'refund', p_escrow_id::text, 'Escrow refund', true),
    (v_tx_id, 'wallet', v_wallet.id, 'credit', v_refund_amount, v_escrow.currency, 'refund', p_escrow_id::text, 'Escrow refund', true);

  INSERT INTO financial_audit_logs (entity_type, entity_id, action, actor_id, metadata)
  VALUES ('escrow', p_escrow_id, 'escrow.refund', p_sponsor_id,
    jsonb_build_object('amount', v_refund_amount, 'idempotency_key', p_idempotency_key, 'transaction_id', v_tx_id, 'status', 'success'));

  RETURN jsonb_build_object('success', true, 'escrow_id', p_escrow_id, 'refunded_amount', v_refund_amount, 'transaction_id', v_tx_id);
END;
$$;

-- 9. Wallet optimistic concurrency versioning
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

CREATE OR REPLACE FUNCTION public.increment_wallet_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.version := OLD.version + 1;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wallet_version ON wallets;
CREATE TRIGGER trg_wallet_version
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION increment_wallet_version();

-- 10. Enable realtime for security_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_events;
