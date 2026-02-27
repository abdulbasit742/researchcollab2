
-- Drop old function signatures that conflict
DROP FUNCTION IF EXISTS public.fund_escrow_atomic(UUID, UUID, TEXT);

-- Phase 1B: Atomic Escrow Server Functions

-- ============================================================
-- 1. FUND ESCROW (Atomic)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fund_escrow_atomic(
  p_escrow_id UUID,
  p_sponsor_id UUID,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_escrow RECORD;
  v_wallet RECORD;
  v_new_available NUMERIC;
  v_new_escrow_bal NUMERIC;
BEGIN
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

  PERFORM public.update_trust(p_sponsor_id, 'funding_release', 3.0, p_escrow_id, 'escrow', NULL, NULL, 
    jsonb_build_object('action', 'fund_escrow', 'amount', v_escrow.total_amount));

  RETURN jsonb_build_object('status', 'funded', 'escrow_id', p_escrow_id, 'amount', v_escrow.total_amount, 'new_available_balance', v_new_available);
END;
$$;

-- ============================================================
-- 2. SUBMIT MILESTONE
-- ============================================================
CREATE OR REPLACE FUNCTION public.submit_milestone_atomic(
  p_milestone_id UUID,
  p_executor_id UUID,
  p_submission_notes TEXT DEFAULT NULL,
  p_deliverable_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_milestone RECORD;
  v_offer RECORD;
BEGIN
  SELECT * INTO v_milestone FROM milestones WHERE id = p_milestone_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Milestone not found: %', p_milestone_id; END IF;
  IF v_milestone.status NOT IN ('pending', 'in_progress') THEN
    RAISE EXCEPTION 'Milestone must be pending or in_progress, current: %', v_milestone.status;
  END IF;

  SELECT * INTO v_offer FROM offers WHERE id = v_milestone.offer_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Offer not found'; END IF;
  IF v_offer.recipient_id != p_executor_id THEN
    RAISE EXCEPTION 'Only the executor can submit milestones';
  END IF;

  UPDATE milestones SET status = 'submitted', submitted_at = now(),
    submission_notes = COALESCE(p_submission_notes, submission_notes),
    deliverable_url = COALESCE(p_deliverable_url, deliverable_url), updated_at = now()
  WHERE id = p_milestone_id;

  RETURN jsonb_build_object('status', 'submitted', 'milestone_id', p_milestone_id, 'submitted_at', now());
END;
$$;

-- ============================================================
-- 3. APPROVE MILESTONE + RELEASE (Atomic)
-- ============================================================
CREATE OR REPLACE FUNCTION public.approve_milestone_atomic(
  p_milestone_id UUID,
  p_sponsor_id UUID,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
BEGIN
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

  PERFORM public.update_trust(v_executor_id, 'milestone_completion', 5.0, p_milestone_id, 'milestone', NULL, NULL, jsonb_build_object('milestone_title', v_milestone.title, 'amount', v_milestone.amount));
  PERFORM public.update_trust(p_sponsor_id, 'milestone_completion', 2.0, p_milestone_id, 'milestone', NULL, NULL, jsonb_build_object('action', 'approval', 'amount', v_milestone.amount));

  SELECT NOT EXISTS (SELECT 1 FROM milestones WHERE offer_id = v_offer.id AND status NOT IN ('approved', 'released')) INTO v_all_approved;
  IF v_all_approved AND v_milestone.escrow_id IS NOT NULL THEN
    UPDATE escrows SET status = 'completed', updated_at = now() WHERE id = v_milestone.escrow_id;
  END IF;

  RETURN jsonb_build_object('status', 'approved_and_released', 'milestone_id', p_milestone_id, 'gross_amount', v_milestone.amount, 'platform_fee', v_platform_fee, 'net_amount', v_net_amount, 'executor_id', v_executor_id, 'all_milestones_complete', v_all_approved);
END;
$$;

-- ============================================================
-- 4. OPEN DISPUTE
-- ============================================================
CREATE OR REPLACE FUNCTION public.open_dispute_atomic(
  p_milestone_id UUID,
  p_user_id UUID,
  p_reason TEXT,
  p_evidence_files JSONB DEFAULT '[]'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_milestone RECORD;
  v_offer RECORD;
  v_dispute_id UUID;
BEGIN
  SELECT * INTO v_milestone FROM milestones WHERE id = p_milestone_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Milestone not found'; END IF;

  SELECT * INTO v_offer FROM offers WHERE id = v_milestone.offer_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Offer not found'; END IF;
  IF p_user_id != v_offer.sender_id AND p_user_id != v_offer.recipient_id THEN
    RAISE EXCEPTION 'Only deal participants can open disputes';
  END IF;

  IF EXISTS (SELECT 1 FROM disputes WHERE milestone_id = p_milestone_id AND status IN ('open', 'under_review')) THEN
    RAISE EXCEPTION 'An open dispute already exists for this milestone';
  END IF;

  INSERT INTO disputes (milestone_id, offer_id, initiated_by, reason, evidence_files, status, arbitration_deadline)
  VALUES (p_milestone_id, v_offer.id, p_user_id, p_reason, p_evidence_files, 'open', now() + INTERVAL '14 days')
  RETURNING id INTO v_dispute_id;

  IF v_milestone.escrow_id IS NOT NULL THEN
    UPDATE escrows SET status = 'disputed', updated_at = now()
    WHERE id = v_milestone.escrow_id AND status NOT IN ('completed', 'refunded');
  END IF;

  PERFORM public.update_trust(p_user_id, 'dispute_initiation', -2.0, v_dispute_id, 'dispute', NULL, NULL, jsonb_build_object('reason', p_reason, 'milestone_id', p_milestone_id));

  RETURN jsonb_build_object('status', 'dispute_opened', 'dispute_id', v_dispute_id, 'milestone_id', p_milestone_id, 'arbitration_deadline', now() + INTERVAL '14 days');
END;
$$;

-- ============================================================
-- 5. RESOLVE DISPUTE
-- ============================================================
CREATE OR REPLACE FUNCTION public.resolve_dispute_atomic(
  p_dispute_id UUID,
  p_resolver_id UUID,
  p_resolution_type TEXT,
  p_resolution_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dispute RECORD;
  v_milestone RECORD;
  v_offer RECORD;
  v_sponsor_wallet RECORD;
  v_executor_wallet RECORD;
  v_amount NUMERIC;
BEGIN
  IF p_resolution_type NOT IN ('refund', 'release') THEN
    RAISE EXCEPTION 'Resolution must be refund or release';
  END IF;

  SELECT * INTO v_dispute FROM disputes WHERE id = p_dispute_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Dispute not found'; END IF;
  IF v_dispute.status NOT IN ('open', 'under_review') THEN RAISE EXCEPTION 'Dispute not open: %', v_dispute.status; END IF;

  SELECT * INTO v_milestone FROM milestones WHERE id = v_dispute.milestone_id FOR UPDATE;
  SELECT * INTO v_offer FROM offers WHERE id = v_milestone.offer_id;
  v_amount := v_milestone.amount;

  UPDATE disputes SET status = 'resolved', resolution = p_resolution_type, resolved_by = p_resolver_id, resolved_at = now(), updated_at = now() WHERE id = p_dispute_id;

  IF p_resolution_type = 'refund' THEN
    SELECT * INTO v_sponsor_wallet FROM wallets WHERE user_id = v_offer.sender_id FOR UPDATE;
    IF FOUND THEN
      UPDATE wallets SET available_balance = available_balance + v_amount, escrow_balance = GREATEST(0, escrow_balance - v_amount), updated_at = now() WHERE id = v_sponsor_wallet.id;
      INSERT INTO wallet_transactions (wallet_id, type, amount, balance_after, description, reference_id, reference_type, status, user_id)
      VALUES (v_sponsor_wallet.id, 'refund', v_amount, v_sponsor_wallet.available_balance + v_amount, 'Dispute refund: ' || v_milestone.title, p_dispute_id::text, 'dispute_refund', 'completed', v_offer.sender_id);
    END IF;
    IF v_milestone.escrow_id IS NOT NULL THEN
      UPDATE escrows SET refunded_amount = refunded_amount + v_amount, locked_amount = GREATEST(0, locked_amount - v_amount), updated_at = now() WHERE id = v_milestone.escrow_id;
    END IF;
    UPDATE milestones SET status = 'rejected', updated_at = now() WHERE id = v_milestone.id;
    PERFORM public.update_trust(v_offer.recipient_id, 'dispute_resolution', -3.0, p_dispute_id, 'dispute', NULL, NULL, jsonb_build_object('resolution', 'refund', 'amount', v_amount));
    PERFORM public.update_trust(v_offer.sender_id, 'dispute_resolution', 1.0, p_dispute_id, 'dispute', NULL, NULL, jsonb_build_object('resolution', 'refund_received'));

  ELSIF p_resolution_type = 'release' THEN
    SELECT * INTO v_sponsor_wallet FROM wallets WHERE user_id = v_offer.sender_id FOR UPDATE;
    SELECT * INTO v_executor_wallet FROM wallets WHERE user_id = v_offer.recipient_id FOR UPDATE;
    IF NOT FOUND THEN INSERT INTO wallets (user_id) VALUES (v_offer.recipient_id) RETURNING * INTO v_executor_wallet; END IF;
    IF v_sponsor_wallet.id IS NOT NULL THEN
      UPDATE wallets SET escrow_balance = GREATEST(0, escrow_balance - v_amount), updated_at = now() WHERE id = v_sponsor_wallet.id;
    END IF;
    UPDATE wallets SET available_balance = available_balance + v_amount, total_earned = total_earned + v_amount, updated_at = now() WHERE id = v_executor_wallet.id;
    INSERT INTO wallet_transactions (wallet_id, type, amount, balance_after, description, reference_id, reference_type, status, user_id)
    VALUES (v_executor_wallet.id, 'milestone_release', v_amount, v_executor_wallet.available_balance + v_amount, 'Dispute release: ' || v_milestone.title, p_dispute_id::text, 'dispute_release', 'completed', v_offer.recipient_id);
    IF v_milestone.escrow_id IS NOT NULL THEN
      UPDATE escrows SET released_amount = released_amount + v_amount, locked_amount = GREATEST(0, locked_amount - v_amount), updated_at = now() WHERE id = v_milestone.escrow_id;
    END IF;
    UPDATE milestones SET status = 'approved', released_at = now(), updated_at = now() WHERE id = v_milestone.id;
    PERFORM public.update_trust(v_offer.recipient_id, 'dispute_resolution', 3.0, p_dispute_id, 'dispute', NULL, NULL, jsonb_build_object('resolution', 'release', 'amount', v_amount));
  END IF;

  -- Unfreeze escrow if no more open disputes
  IF v_milestone.escrow_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM disputes d JOIN milestones m ON m.id = d.milestone_id WHERE m.escrow_id = v_milestone.escrow_id AND d.status IN ('open', 'under_review')) THEN
      UPDATE escrows SET status = 'funded', updated_at = now() WHERE id = v_milestone.escrow_id AND status = 'disputed';
    END IF;
  END IF;

  RETURN jsonb_build_object('status', 'resolved', 'dispute_id', p_dispute_id, 'resolution', p_resolution_type, 'amount', v_amount);
END;
$$;
