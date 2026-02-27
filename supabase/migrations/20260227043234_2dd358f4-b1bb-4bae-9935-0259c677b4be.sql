
-- Atomic escrow funding function (runs server-side in a single transaction)
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
  -- Idempotency check
  IF EXISTS (
    SELECT 1 FROM financial_audit_logs 
    WHERE metadata->>'idempotency_key' = p_idempotency_key 
      AND action = 'escrow.fund'
      AND metadata->>'status' = 'success'
  ) THEN
    SELECT id INTO v_escrow_id FROM escrows WHERE deal_id = p_deal_id LIMIT 1;
    RETURN jsonb_build_object('success', true, 'escrow_id', v_escrow_id, 'idempotent', true);
  END IF;

  -- 1. Validate deal
  SELECT * INTO v_deal FROM deal_rooms WHERE id = p_deal_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Deal not found: %', p_deal_id; END IF;
  IF v_deal.buyer_id != p_sponsor_id THEN RAISE EXCEPTION 'Only the sponsor can fund escrow'; END IF;
  
  v_amount := COALESCE(v_deal.agreed_amount, 0);
  IF v_amount <= 0 THEN RAISE EXCEPTION 'No agreed amount on deal'; END IF;

  -- 2. Lock and validate wallet
  SELECT * INTO v_wallet FROM wallets WHERE user_id = p_sponsor_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found for sponsor'; END IF;
  IF v_wallet.is_frozen = true THEN RAISE EXCEPTION 'Wallet is frozen'; END IF;
  IF v_wallet.available_balance < v_amount THEN RAISE EXCEPTION 'Insufficient balance: have %, need %', v_wallet.available_balance, v_amount; END IF;

  -- 3. Check existing escrow
  SELECT * INTO v_escrow FROM escrows WHERE deal_id = p_deal_id FOR UPDATE;
  IF FOUND AND v_escrow.status != 'created' THEN 
    RAISE EXCEPTION 'Escrow already funded'; 
  END IF;

  -- 4. Create or update escrow
  IF NOT FOUND THEN
    INSERT INTO escrows (deal_id, sponsor_id, recipient_id, total_amount, locked_amount, released_amount, refunded_amount, currency, status)
    VALUES (p_deal_id, p_sponsor_id, v_deal.seller_id, v_amount, v_amount, 0, 0, v_wallet.currency, 'funded')
    RETURNING * INTO v_escrow;
  ELSE
    UPDATE escrows SET locked_amount = v_amount, status = 'funded', updated_at = now() WHERE id = v_escrow.id RETURNING * INTO v_escrow;
  END IF;

  -- 5. Deduct wallet
  UPDATE wallets SET 
    available_balance = available_balance - v_amount,
    escrow_balance = escrow_balance + v_amount,
    total_spent = total_spent + v_amount,
    updated_at = now()
  WHERE id = v_wallet.id;

  -- Verify no negative
  IF (SELECT available_balance FROM wallets WHERE id = v_wallet.id) < 0 THEN
    RAISE EXCEPTION 'Wallet balance went negative - aborting';
  END IF;

  -- 6. Double-entry ledger
  INSERT INTO ledger_entries (transaction_id, account_type, account_id, entry_type, amount, currency, reference_type, reference_id, description, is_immutable)
  VALUES 
    (v_tx_id, 'wallet', v_wallet.id, 'debit', v_amount, v_wallet.currency, 'escrow', v_escrow.id::text, 'Escrow funded for deal ' || p_deal_id, true),
    (v_tx_id, 'escrow', v_escrow.id, 'credit', v_amount, v_wallet.currency, 'escrow', v_escrow.id::text, 'Escrow funded for deal ' || p_deal_id, true);

  -- 7. Audit log
  INSERT INTO financial_audit_logs (entity_type, entity_id, action, actor_id, metadata)
  VALUES ('escrow', v_escrow.id::text, 'escrow.fund', p_sponsor_id::text, 
    jsonb_build_object('deal_id', p_deal_id, 'amount', v_amount, 'idempotency_key', p_idempotency_key, 'transaction_id', v_tx_id, 'status', 'success'));

  -- 8. Invariant check
  IF v_escrow.locked_amount + v_escrow.released_amount + v_escrow.refunded_amount > v_escrow.total_amount + 0.01 THEN
    RAISE EXCEPTION 'Escrow invariant violated after funding';
  END IF;

  RETURN jsonb_build_object('success', true, 'escrow_id', v_escrow.id, 'amount', v_amount, 'transaction_id', v_tx_id);
END;
$$;

-- Atomic milestone release function
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
  -- Idempotency
  IF EXISTS (
    SELECT 1 FROM financial_audit_logs 
    WHERE metadata->>'idempotency_key' = p_idempotency_key 
      AND action = 'milestone.release'
      AND metadata->>'status' = 'success'
  ) THEN
    RETURN jsonb_build_object('success', true, 'milestone_id', p_milestone_id, 'idempotent', true);
  END IF;

  -- 1. Lock milestone
  SELECT * INTO v_milestone FROM milestones WHERE id = p_milestone_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Milestone not found'; END IF;
  IF v_milestone.status = 'released' THEN RAISE EXCEPTION 'Milestone already released'; END IF;
  IF v_milestone.status != 'submitted' THEN RAISE EXCEPTION 'Milestone must be in submitted status, got: %', v_milestone.status; END IF;

  v_amount := v_milestone.amount;
  IF v_amount <= 0 THEN RAISE EXCEPTION 'Invalid milestone amount'; END IF;

  -- 2. Lock escrow
  IF v_milestone.escrow_id IS NOT NULL THEN
    SELECT * INTO v_escrow FROM escrows WHERE id = v_milestone.escrow_id FOR UPDATE;
  ELSIF v_milestone.deal_id IS NOT NULL THEN
    SELECT * INTO v_escrow FROM escrows WHERE deal_id = v_milestone.deal_id FOR UPDATE;
  ELSE
    SELECT * INTO v_escrow FROM escrows WHERE deal_id = (SELECT id FROM deal_rooms WHERE id = v_milestone.offer_id LIMIT 1) FOR UPDATE;
  END IF;
  IF NOT FOUND THEN RAISE EXCEPTION 'Escrow not found for milestone'; END IF;
  IF v_escrow.sponsor_id != p_sponsor_id THEN RAISE EXCEPTION 'Only sponsor can approve'; END IF;

  IF v_amount > v_escrow.locked_amount THEN
    RAISE EXCEPTION 'Milestone amount % exceeds locked amount %', v_amount, v_escrow.locked_amount;
  END IF;

  -- 3. Update escrow
  v_new_locked := v_escrow.locked_amount - v_amount;
  v_new_released := v_escrow.released_amount + v_amount;
  v_new_status := CASE WHEN v_new_locked = 0 THEN 'completed' ELSE 'partially_released' END;

  UPDATE escrows SET locked_amount = v_new_locked, released_amount = v_new_released, status = v_new_status, updated_at = now()
  WHERE id = v_escrow.id;

  -- 4. Update sponsor wallet
  SELECT * INTO v_sponsor_wallet FROM wallets WHERE user_id = p_sponsor_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Sponsor wallet not found'; END IF;
  UPDATE wallets SET escrow_balance = escrow_balance - v_amount, updated_at = now() WHERE id = v_sponsor_wallet.id;

  -- 5. Update recipient wallet (create if needed)
  SELECT * INTO v_recipient_wallet FROM wallets WHERE user_id = v_escrow.recipient_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO wallets (user_id, available_balance, escrow_balance, pending_balance, total_earned, total_spent, currency)
    VALUES (v_escrow.recipient_id, v_amount, 0, 0, v_amount, 0, v_escrow.currency)
    RETURNING * INTO v_recipient_wallet;
  ELSE
    UPDATE wallets SET available_balance = available_balance + v_amount, total_earned = total_earned + v_amount, updated_at = now() WHERE id = v_recipient_wallet.id;
  END IF;

  -- 6. Double-entry ledger
  INSERT INTO ledger_entries (transaction_id, account_type, account_id, entry_type, amount, currency, reference_type, reference_id, description, is_immutable)
  VALUES 
    (v_tx_id, 'escrow', v_escrow.id, 'debit', v_amount, v_escrow.currency, 'milestone', p_milestone_id::text, 'Milestone release ' || p_milestone_id, true),
    (v_tx_id, 'wallet', v_recipient_wallet.id, 'credit', v_amount, v_escrow.currency, 'milestone', p_milestone_id::text, 'Milestone release ' || p_milestone_id, true);

  -- 7. Update milestone
  UPDATE milestones SET status = 'released', approved_at = now(), approved_by = p_sponsor_id, released_at = now(), updated_at = now()
  WHERE id = p_milestone_id;

  -- 8. Audit
  INSERT INTO financial_audit_logs (entity_type, entity_id, action, actor_id, metadata)
  VALUES ('milestone', p_milestone_id::text, 'milestone.release', p_sponsor_id::text,
    jsonb_build_object('escrow_id', v_escrow.id, 'amount', v_amount, 'idempotency_key', p_idempotency_key, 'transaction_id', v_tx_id, 'status', 'success'));

  -- 9. Invariant check
  IF v_new_locked + v_new_released + v_escrow.refunded_amount > v_escrow.total_amount + 0.01 THEN
    RAISE EXCEPTION 'Escrow invariant violated after milestone release';
  END IF;

  RETURN jsonb_build_object('success', true, 'milestone_id', p_milestone_id, 'escrow_id', v_escrow.id, 'amount', v_amount, 'new_escrow_status', v_new_status, 'transaction_id', v_tx_id);
END;
$$;

-- Atomic refund function
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
  -- Idempotency
  IF EXISTS (
    SELECT 1 FROM financial_audit_logs 
    WHERE metadata->>'idempotency_key' = p_idempotency_key 
      AND action = 'escrow.refund'
      AND metadata->>'status' = 'success'
  ) THEN
    RETURN jsonb_build_object('success', true, 'escrow_id', p_escrow_id, 'idempotent', true);
  END IF;

  -- Lock escrow
  SELECT * INTO v_escrow FROM escrows WHERE id = p_escrow_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Escrow not found'; END IF;
  IF v_escrow.sponsor_id != p_sponsor_id THEN RAISE EXCEPTION 'Only sponsor can refund'; END IF;
  IF v_escrow.status NOT IN ('funded', 'disputed') THEN RAISE EXCEPTION 'Cannot refund from status: %', v_escrow.status; END IF;

  v_refund_amount := v_escrow.locked_amount;
  IF v_refund_amount <= 0 THEN RAISE EXCEPTION 'Nothing to refund'; END IF;

  -- Update escrow
  UPDATE escrows SET locked_amount = 0, refunded_amount = refunded_amount + v_refund_amount, status = 'refunded', updated_at = now()
  WHERE id = p_escrow_id;

  -- Restore wallet
  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_escrow.sponsor_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Sponsor wallet not found'; END IF;
  UPDATE wallets SET escrow_balance = escrow_balance - v_refund_amount, available_balance = available_balance + v_refund_amount, updated_at = now()
  WHERE id = v_wallet.id;

  -- Ledger
  INSERT INTO ledger_entries (transaction_id, account_type, account_id, entry_type, amount, currency, reference_type, reference_id, description, is_immutable)
  VALUES 
    (v_tx_id, 'escrow', v_escrow.id, 'debit', v_refund_amount, v_escrow.currency, 'refund', p_escrow_id::text, 'Escrow refund', true),
    (v_tx_id, 'wallet', v_wallet.id, 'credit', v_refund_amount, v_escrow.currency, 'refund', p_escrow_id::text, 'Escrow refund', true);

  -- Audit
  INSERT INTO financial_audit_logs (entity_type, entity_id, action, actor_id, metadata)
  VALUES ('escrow', p_escrow_id::text, 'escrow.refund', p_sponsor_id::text,
    jsonb_build_object('amount', v_refund_amount, 'idempotency_key', p_idempotency_key, 'transaction_id', v_tx_id, 'status', 'success'));

  RETURN jsonb_build_object('success', true, 'escrow_id', p_escrow_id, 'refunded_amount', v_refund_amount, 'transaction_id', v_tx_id);
END;
$$;
