
-- =====================================================
-- MONEY SAFETY P0: Atomic Escrow, Fee Deduction, Refund
-- =====================================================

-- Step 1: Add missing columns to offers
ALTER TABLE public.offers 
  ADD COLUMN IF NOT EXISTS deal_terms text,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_reason text;

-- Step 1b: Add missing columns to milestones
ALTER TABLE public.milestones 
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS submission_notes text,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0;

-- Step 1c: Add missing column to disputes
ALTER TABLE public.disputes 
  ADD COLUMN IF NOT EXISTS offer_id uuid REFERENCES public.offers(id);

-- Step 1d: Add user_id to wallet_transactions for quick lookup
ALTER TABLE public.wallet_transactions 
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- Step 2: Atomic function - execute_escrow_lock
-- Moves funds from buyer's available_balance to escrow_balance
CREATE OR REPLACE FUNCTION public.execute_escrow_lock(
  p_offer_id uuid,
  p_buyer_id uuid,
  p_total_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_new_available numeric;
  v_new_escrow numeric;
BEGIN
  -- Lock buyer's wallet row
  SELECT * INTO v_wallet 
  FROM wallets 
  WHERE user_id = p_buyer_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found for buyer %', p_buyer_id;
  END IF;

  -- Verify sufficient funds
  IF v_wallet.available_balance < p_total_amount THEN
    RAISE EXCEPTION 'Insufficient funds. Available: %, Required: %', v_wallet.available_balance, p_total_amount;
  END IF;

  v_new_available := v_wallet.available_balance - p_total_amount;
  v_new_escrow := v_wallet.escrow_balance + p_total_amount;

  -- Move funds from available to escrow
  UPDATE wallets
  SET available_balance = v_new_available,
      escrow_balance = v_new_escrow,
      total_spent = total_spent + p_total_amount,
      updated_at = now()
  WHERE id = v_wallet.id;

  -- Record transaction
  INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_after, description, reference_type, reference_id, status)
  VALUES (v_wallet.id, p_buyer_id, 'escrow_deposit', -p_total_amount, v_new_available, 
          'Escrow lock for deal', 'offer', p_offer_id::text, 'completed');

  RETURN jsonb_build_object(
    'success', true,
    'locked_amount', p_total_amount,
    'available_after', v_new_available,
    'escrow_after', v_new_escrow
  );
END;
$function$;

-- Step 3: Atomic function - execute_milestone_release
-- Debits buyer escrow, credits provider (minus fee), stores fee on milestone
CREATE OR REPLACE FUNCTION public.execute_milestone_release(
  p_milestone_id uuid,
  p_released_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_milestone milestones%ROWTYPE;
  v_offer offers%ROWTYPE;
  v_buyer_wallet wallets%ROWTYPE;
  v_provider_wallet wallets%ROWTYPE;
  v_platform_fee numeric;
  v_net_amount numeric;
  v_provider_id uuid;
  v_buyer_id uuid;
BEGIN
  -- Lock milestone row
  SELECT * INTO v_milestone 
  FROM milestones 
  WHERE id = p_milestone_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Milestone not found: %', p_milestone_id;
  END IF;

  IF v_milestone.status != 'approved' THEN
    RAISE EXCEPTION 'Milestone must be approved before release. Current status: %', v_milestone.status;
  END IF;

  -- Get offer details
  SELECT * INTO v_offer FROM offers WHERE id = v_milestone.offer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer not found for milestone';
  END IF;

  -- sender_id = provider, recipient_id = buyer
  v_provider_id := v_offer.sender_id;
  v_buyer_id := v_offer.recipient_id;

  -- Calculate platform fee using existing DB function
  v_platform_fee := get_platform_fee(v_provider_id, v_milestone.amount);
  v_net_amount := v_milestone.amount - v_platform_fee;

  -- Lock both wallets (buyer first for consistent ordering)
  SELECT * INTO v_buyer_wallet FROM wallets WHERE user_id = v_buyer_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Buyer wallet not found'; END IF;

  SELECT * INTO v_provider_wallet FROM wallets WHERE user_id = v_provider_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Provider wallet not found'; END IF;

  -- Verify buyer has sufficient escrow
  IF v_buyer_wallet.escrow_balance < v_milestone.amount THEN
    RAISE EXCEPTION 'Insufficient escrow balance. Escrow: %, Required: %', v_buyer_wallet.escrow_balance, v_milestone.amount;
  END IF;

  -- 1. Debit buyer escrow
  UPDATE wallets
  SET escrow_balance = escrow_balance - v_milestone.amount,
      updated_at = now()
  WHERE id = v_buyer_wallet.id;

  -- 2. Credit provider available balance (minus fee)
  UPDATE wallets
  SET available_balance = available_balance + v_net_amount,
      total_earned = total_earned + v_net_amount,
      updated_at = now()
  WHERE id = v_provider_wallet.id;

  -- Record buyer transaction (escrow release)
  INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_after, description, reference_type, reference_id, status)
  VALUES (v_buyer_wallet.id, v_buyer_id, 'escrow_release', -v_milestone.amount, 
          v_buyer_wallet.escrow_balance - v_milestone.amount,
          'Escrow released for milestone: ' || v_milestone.title, 'milestone', p_milestone_id::text, 'completed');

  -- Record provider transaction (net payment)
  INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_after, description, reference_type, reference_id, status)
  VALUES (v_provider_wallet.id, v_provider_id, 'milestone_release', v_net_amount,
          v_provider_wallet.available_balance + v_net_amount,
          'Payment for milestone: ' || v_milestone.title || ' (fee: PKR ' || v_platform_fee::text || ')', 
          'milestone', p_milestone_id::text, 'completed');

  -- Update milestone: mark released + store fee for audit
  UPDATE milestones
  SET status = 'released',
      released_at = now(),
      platform_fee = v_platform_fee,
      updated_at = now()
  WHERE id = p_milestone_id;

  RETURN jsonb_build_object(
    'success', true,
    'milestone_id', p_milestone_id,
    'gross_amount', v_milestone.amount,
    'platform_fee', v_platform_fee,
    'net_to_provider', v_net_amount,
    'buyer_escrow_remaining', v_buyer_wallet.escrow_balance - v_milestone.amount
  );
END;
$function$;

-- Step 4: Atomic function - execute_escrow_refund
-- Returns unreleased escrow funds to buyer
CREATE OR REPLACE FUNCTION public.execute_escrow_refund(
  p_offer_id uuid,
  p_refund_reason text DEFAULT 'Deal cancelled'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_offer offers%ROWTYPE;
  v_buyer_wallet wallets%ROWTYPE;
  v_refund_amount numeric := 0;
  v_buyer_id uuid;
BEGIN
  -- Get offer
  SELECT * INTO v_offer FROM offers WHERE id = p_offer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer not found: %', p_offer_id;
  END IF;

  v_buyer_id := v_offer.recipient_id;

  -- Calculate total refund from unreleased milestones
  SELECT COALESCE(SUM(amount), 0) INTO v_refund_amount
  FROM milestones
  WHERE offer_id = p_offer_id
  AND status NOT IN ('released', 'cancelled');

  IF v_refund_amount <= 0 THEN
    RETURN jsonb_build_object('success', true, 'refund_amount', 0, 'message', 'No funds to refund');
  END IF;

  -- Lock buyer's wallet
  SELECT * INTO v_buyer_wallet FROM wallets WHERE user_id = v_buyer_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Buyer wallet not found';
  END IF;

  -- Move funds from escrow back to available
  UPDATE wallets
  SET escrow_balance = GREATEST(escrow_balance - v_refund_amount, 0),
      available_balance = available_balance + v_refund_amount,
      updated_at = now()
  WHERE id = v_buyer_wallet.id;

  -- Record refund transaction
  INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_after, description, reference_type, reference_id, status)
  VALUES (v_buyer_wallet.id, v_buyer_id, 'refund', v_refund_amount,
          v_buyer_wallet.available_balance + v_refund_amount,
          'Escrow refund: ' || p_refund_reason, 'offer', p_offer_id::text, 'completed');

  -- Cancel all unreleased milestones
  UPDATE milestones
  SET status = 'cancelled',
      updated_at = now()
  WHERE offer_id = p_offer_id
  AND status NOT IN ('released', 'cancelled');

  RETURN jsonb_build_object(
    'success', true,
    'refund_amount', v_refund_amount,
    'buyer_available_after', v_buyer_wallet.available_balance + v_refund_amount,
    'reason', p_refund_reason
  );
END;
$function$;
