
-- ============================================================
-- SPRINT 3: EXECUTION ENGINE RELIABILITY
-- Idempotency, orphan detection, retry-safe operations
-- ============================================================

-- 1. IDEMPOTENCY KEYS TABLE — prevents double-execution of any financial RPC
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  function_name TEXT NOT NULL,
  user_id UUID NOT NULL,
  request_params JSONB,
  response JSONB,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX idx_idempotency_keys_key ON public.idempotency_keys(idempotency_key);
CREATE INDEX idx_idempotency_keys_expiry ON public.idempotency_keys(expires_at) WHERE status = 'processing';

ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own idempotency keys"
  ON public.idempotency_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert idempotency keys"
  ON public.idempotency_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. ORPHANED STATE DETECTION TABLE — tracks detected anomalies
CREATE TABLE IF NOT EXISTS public.orphaned_state_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'offer', 'milestone', 'escrow', 'wallet'
  entity_id UUID NOT NULL,
  anomaly_type TEXT NOT NULL, -- 'stuck_state', 'balance_mismatch', 'orphaned_escrow', 'stale_milestone'
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  auto_resolved BOOLEAN NOT NULL DEFAULT false,
  resolution_action TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_orphaned_state_unresolved ON public.orphaned_state_logs(auto_resolved, severity) WHERE auto_resolved = false;

ALTER TABLE public.orphaned_state_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage orphaned state logs"
  ON public.orphaned_state_logs FOR ALL
  USING (public.is_admin(auth.uid()));

-- 3. EXECUTION HEALTH SNAPSHOTS — periodic system health records
CREATE TABLE IF NOT EXISTS public.execution_health_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stuck_offers INTEGER NOT NULL DEFAULT 0,
  stuck_milestones INTEGER NOT NULL DEFAULT 0,
  orphaned_escrows INTEGER NOT NULL DEFAULT 0,
  wallet_mismatches INTEGER NOT NULL DEFAULT 0,
  failed_jobs_24h INTEGER NOT NULL DEFAULT 0,
  stale_processing_keys INTEGER NOT NULL DEFAULT 0,
  overall_health TEXT NOT NULL DEFAULT 'healthy' CHECK (overall_health IN ('healthy', 'degraded', 'critical')),
  details JSONB DEFAULT '{}'
);

ALTER TABLE public.execution_health_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view health snapshots"
  ON public.execution_health_snapshots FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert health snapshots"
  ON public.execution_health_snapshots FOR INSERT
  WITH CHECK (true);

-- 4. IDEMPOTENT ESCROW LOCK — wraps existing with idempotency guard
CREATE OR REPLACE FUNCTION public.idempotent_escrow_lock(
  p_idempotency_key TEXT,
  p_offer_id UUID,
  p_buyer_id UUID,
  p_total_amount NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_existing idempotency_keys%ROWTYPE;
  v_result JSONB;
BEGIN
  -- Check for existing completed request
  SELECT * INTO v_existing FROM idempotency_keys
  WHERE idempotency_key = p_idempotency_key AND function_name = 'escrow_lock';

  IF v_existing.id IS NOT NULL THEN
    IF v_existing.status = 'completed' THEN
      RETURN v_existing.response;
    ELSIF v_existing.status = 'processing' AND v_existing.created_at > now() - INTERVAL '5 minutes' THEN
      RETURN jsonb_build_object('error', 'Request already processing', 'idempotency_key', p_idempotency_key);
    END IF;
    -- Stale processing record — delete and retry
    DELETE FROM idempotency_keys WHERE id = v_existing.id;
  END IF;

  -- Record the attempt
  INSERT INTO idempotency_keys (idempotency_key, function_name, user_id, request_params, status)
  VALUES (p_idempotency_key, 'escrow_lock', p_buyer_id,
    jsonb_build_object('offer_id', p_offer_id, 'buyer_id', p_buyer_id, 'amount', p_total_amount),
    'processing');

  -- Execute the actual lock
  BEGIN
    v_result := execute_escrow_lock(p_offer_id, p_buyer_id, p_total_amount);
  EXCEPTION WHEN OTHERS THEN
    UPDATE idempotency_keys SET status = 'failed', completed_at = now(),
      response = jsonb_build_object('error', SQLERRM)
    WHERE idempotency_key = p_idempotency_key AND function_name = 'escrow_lock';
    RAISE;
  END;

  -- Mark completed
  UPDATE idempotency_keys SET status = 'completed', completed_at = now(), response = v_result
  WHERE idempotency_key = p_idempotency_key AND function_name = 'escrow_lock';

  RETURN v_result;
END;
$$;

-- 5. IDEMPOTENT ESCROW RELEASE — wraps existing with idempotency guard
CREATE OR REPLACE FUNCTION public.idempotent_escrow_release(
  p_idempotency_key TEXT,
  p_milestone_id UUID
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_existing idempotency_keys%ROWTYPE;
  v_milestone milestones%ROWTYPE;
  v_offer offers%ROWTYPE;
  v_fee NUMERIC;
  v_net NUMERIC;
BEGIN
  -- Idempotency check
  SELECT * INTO v_existing FROM idempotency_keys
  WHERE idempotency_key = p_idempotency_key AND function_name = 'escrow_release';

  IF v_existing.id IS NOT NULL THEN
    IF v_existing.status = 'completed' THEN RETURN v_existing.response; END IF;
    IF v_existing.status = 'processing' AND v_existing.created_at > now() - INTERVAL '5 minutes' THEN
      RETURN jsonb_build_object('error', 'Request already processing');
    END IF;
    DELETE FROM idempotency_keys WHERE id = v_existing.id;
  END IF;

  -- Get milestone and offer
  SELECT * INTO v_milestone FROM milestones WHERE id = p_milestone_id;
  IF v_milestone.id IS NULL THEN
    RETURN jsonb_build_object('error', 'Milestone not found');
  END IF;
  IF v_milestone.status = 'released' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already released', 'milestone_id', p_milestone_id);
  END IF;

  SELECT * INTO v_offer FROM offers WHERE id = v_milestone.offer_id;

  -- Record attempt
  INSERT INTO idempotency_keys (idempotency_key, function_name, user_id, request_params, status)
  VALUES (p_idempotency_key, 'escrow_release', auth.uid(),
    jsonb_build_object('milestone_id', p_milestone_id), 'processing');

  BEGIN
    -- Calculate fee
    v_fee := get_platform_fee(v_offer.sender_id, v_milestone.amount);
    v_net := v_milestone.amount - v_fee;

    -- Move funds: buyer escrow → provider available + platform fee
    UPDATE wallets SET escrow_balance = escrow_balance - v_milestone.amount, updated_at = now()
    WHERE user_id = v_offer.recipient_id;

    UPDATE wallets SET available_balance = available_balance + v_net,
      total_earned = total_earned + v_net, updated_at = now()
    WHERE user_id = v_offer.sender_id;

    -- Mark milestone released
    UPDATE milestones SET status = 'released', updated_at = now() WHERE id = p_milestone_id;

    -- Record transactions
    INSERT INTO wallet_transactions (wallet_id, type, amount, description, reference_type, reference_id)
    SELECT w.id, 'escrow_release', v_net, 'Milestone payment released', 'milestone', p_milestone_id
    FROM wallets w WHERE w.user_id = v_offer.sender_id;

    -- Record ledger entries (double-entry)
    INSERT INTO ledger_entries (entry_type, debit_account, credit_account, amount, reference_type, reference_id, description)
    VALUES ('escrow_release', 'escrow:' || v_offer.recipient_id, 'available:' || v_offer.sender_id,
      v_net, 'milestone', p_milestone_id, 'Milestone released');

    IF v_fee > 0 THEN
      INSERT INTO ledger_entries (entry_type, debit_account, credit_account, amount, reference_type, reference_id, description)
      VALUES ('platform_fee', 'escrow:' || v_offer.recipient_id, 'platform:fees',
        v_fee, 'milestone', p_milestone_id, 'Platform fee on milestone');
    END IF;

  EXCEPTION WHEN OTHERS THEN
    UPDATE idempotency_keys SET status = 'failed', completed_at = now(),
      response = jsonb_build_object('error', SQLERRM)
    WHERE idempotency_key = p_idempotency_key AND function_name = 'escrow_release';
    RAISE;
  END;

  -- Mark completed
  UPDATE idempotency_keys SET status = 'completed', completed_at = now(),
    response = jsonb_build_object('success', true, 'milestone_id', p_milestone_id, 'net_amount', v_net, 'fee', v_fee)
  WHERE idempotency_key = p_idempotency_key AND function_name = 'escrow_release';

  RETURN jsonb_build_object('success', true, 'milestone_id', p_milestone_id, 'net_amount', v_net, 'fee', v_fee);
END;
$$;

-- 6. IDEMPOTENT ESCROW REFUND — wraps existing with idempotency guard
CREATE OR REPLACE FUNCTION public.idempotent_escrow_refund(
  p_idempotency_key TEXT,
  p_offer_id UUID,
  p_refund_reason TEXT DEFAULT 'Deal cancelled'
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_existing idempotency_keys%ROWTYPE;
  v_result JSONB;
BEGIN
  SELECT * INTO v_existing FROM idempotency_keys
  WHERE idempotency_key = p_idempotency_key AND function_name = 'escrow_refund';

  IF v_existing.id IS NOT NULL THEN
    IF v_existing.status = 'completed' THEN RETURN v_existing.response; END IF;
    IF v_existing.status = 'processing' AND v_existing.created_at > now() - INTERVAL '5 minutes' THEN
      RETURN jsonb_build_object('error', 'Request already processing');
    END IF;
    DELETE FROM idempotency_keys WHERE id = v_existing.id;
  END IF;

  INSERT INTO idempotency_keys (idempotency_key, function_name, user_id, request_params, status)
  VALUES (p_idempotency_key, 'escrow_refund', auth.uid(),
    jsonb_build_object('offer_id', p_offer_id, 'reason', p_refund_reason), 'processing');

  BEGIN
    v_result := execute_escrow_refund(p_offer_id, p_refund_reason);
  EXCEPTION WHEN OTHERS THEN
    UPDATE idempotency_keys SET status = 'failed', completed_at = now(),
      response = jsonb_build_object('error', SQLERRM)
    WHERE idempotency_key = p_idempotency_key AND function_name = 'escrow_refund';
    RAISE;
  END;

  UPDATE idempotency_keys SET status = 'completed', completed_at = now(), response = v_result
  WHERE idempotency_key = p_idempotency_key AND function_name = 'escrow_refund';

  RETURN v_result;
END;
$$;

-- 7. ORPHANED STATE DETECTOR — finds stuck/inconsistent states
CREATE OR REPLACE FUNCTION public.detect_orphaned_states()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_stuck_offers INTEGER := 0;
  v_stuck_milestones INTEGER := 0;
  v_orphaned_escrows INTEGER := 0;
  v_wallet_mismatches INTEGER := 0;
  v_stale_keys INTEGER := 0;
  v_health TEXT := 'healthy';
BEGIN
  -- 1. Offers stuck in 'accepted' for >14 days with no milestone activity
  INSERT INTO orphaned_state_logs (entity_type, entity_id, anomaly_type, description, severity)
  SELECT 'offer', o.id, 'stuck_state',
    'Offer accepted ' || EXTRACT(DAY FROM now() - o.updated_at)::INTEGER || ' days ago with no progress',
    CASE WHEN EXTRACT(DAY FROM now() - o.updated_at) > 30 THEN 'high' ELSE 'medium' END
  FROM offers o
  WHERE o.status = 'accepted'
    AND o.updated_at < now() - INTERVAL '14 days'
    AND NOT EXISTS (SELECT 1 FROM milestones m WHERE m.offer_id = o.id AND m.updated_at > now() - INTERVAL '14 days')
    AND NOT EXISTS (SELECT 1 FROM orphaned_state_logs osl WHERE osl.entity_id = o.id AND osl.anomaly_type = 'stuck_state' AND osl.detected_at > now() - INTERVAL '7 days');
  GET DIAGNOSTICS v_stuck_offers = ROW_COUNT;

  -- 2. Milestones stuck in 'submitted' past auto_release_at
  INSERT INTO orphaned_state_logs (entity_type, entity_id, anomaly_type, description, severity)
  SELECT 'milestone', m.id, 'stale_milestone',
    'Milestone submitted but not reviewed, past auto-release deadline',
    'high'
  FROM milestones m
  WHERE m.status = 'submitted'
    AND m.auto_release_at IS NOT NULL
    AND m.auto_release_at < now()
    AND NOT EXISTS (SELECT 1 FROM orphaned_state_logs osl WHERE osl.entity_id = m.id AND osl.anomaly_type = 'stale_milestone' AND osl.detected_at > now() - INTERVAL '1 day');
  GET DIAGNOSTICS v_stuck_milestones = ROW_COUNT;

  -- 3. Wallets with escrow_balance > 0 but no active offers
  INSERT INTO orphaned_state_logs (entity_type, entity_id, anomaly_type, description, severity, metadata)
  SELECT 'wallet', w.id, 'orphaned_escrow',
    'Wallet has escrow balance ' || w.escrow_balance || ' but no active offers',
    'critical',
    jsonb_build_object('escrow_balance', w.escrow_balance, 'user_id', w.user_id)
  FROM wallets w
  WHERE w.escrow_balance > 0
    AND NOT EXISTS (
      SELECT 1 FROM offers o
      WHERE (o.sender_id = w.user_id OR o.recipient_id = w.user_id)
        AND o.status IN ('accepted', 'in_progress')
    )
    AND NOT EXISTS (SELECT 1 FROM orphaned_state_logs osl WHERE osl.entity_id = w.id AND osl.anomaly_type = 'orphaned_escrow' AND osl.detected_at > now() - INTERVAL '1 day');
  GET DIAGNOSTICS v_orphaned_escrows = ROW_COUNT;

  -- 4. Wallet balance mismatches (available + escrow != total_earned - total_withdrawn)
  SELECT COUNT(*) INTO v_wallet_mismatches
  FROM wallets w
  WHERE ABS((w.available_balance + w.escrow_balance) - (w.total_earned - COALESCE(w.total_withdrawn, 0))) > 1;

  -- 5. Stale processing idempotency keys (>10 min old)
  SELECT COUNT(*) INTO v_stale_keys FROM idempotency_keys
  WHERE status = 'processing' AND created_at < now() - INTERVAL '10 minutes';

  -- Clean up stale keys
  UPDATE idempotency_keys SET status = 'failed', completed_at = now(),
    response = jsonb_build_object('error', 'Timed out')
  WHERE status = 'processing' AND created_at < now() - INTERVAL '10 minutes';

  -- Determine health
  IF v_orphaned_escrows > 0 OR v_wallet_mismatches > 0 THEN
    v_health := 'critical';
  ELSIF v_stuck_offers > 3 OR v_stuck_milestones > 3 THEN
    v_health := 'degraded';
  END IF;

  -- Record snapshot
  INSERT INTO execution_health_snapshots (
    stuck_offers, stuck_milestones, orphaned_escrows, wallet_mismatches,
    stale_processing_keys, overall_health, details
  ) VALUES (
    v_stuck_offers, v_stuck_milestones, v_orphaned_escrows, v_wallet_mismatches,
    v_stale_keys, v_health,
    jsonb_build_object(
      'stuck_offers', v_stuck_offers, 'stuck_milestones', v_stuck_milestones,
      'orphaned_escrows', v_orphaned_escrows, 'wallet_mismatches', v_wallet_mismatches,
      'stale_keys', v_stale_keys
    )
  );

  RETURN jsonb_build_object(
    'health', v_health,
    'stuck_offers', v_stuck_offers,
    'stuck_milestones', v_stuck_milestones,
    'orphaned_escrows', v_orphaned_escrows,
    'wallet_mismatches', v_wallet_mismatches,
    'stale_processing_keys', v_stale_keys
  );
END;
$$;

-- 8. AUTO-RESOLVE STALE MILESTONES — releases past-deadline milestones
CREATE OR REPLACE FUNCTION public.auto_release_stale_milestones()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_count INTEGER := 0;
  v_milestone RECORD;
BEGIN
  FOR v_milestone IN
    SELECT m.id, m.amount, m.offer_id, o.sender_id, o.recipient_id
    FROM milestones m
    JOIN offers o ON o.id = m.offer_id
    WHERE m.status = 'submitted'
      AND m.auto_release_at IS NOT NULL
      AND m.auto_release_at < now()
  LOOP
    -- Mark as approved then released
    UPDATE milestones SET status = 'released', updated_at = now() WHERE id = v_milestone.id;

    -- Move funds
    UPDATE wallets SET escrow_balance = escrow_balance - v_milestone.amount, updated_at = now()
    WHERE user_id = v_milestone.recipient_id;

    UPDATE wallets SET available_balance = available_balance + v_milestone.amount,
      total_earned = total_earned + v_milestone.amount, updated_at = now()
    WHERE user_id = v_milestone.sender_id;

    -- Record in ledger
    INSERT INTO ledger_entries (entry_type, debit_account, credit_account, amount, reference_type, reference_id, description)
    VALUES ('auto_release', 'escrow:' || v_milestone.recipient_id, 'available:' || v_milestone.sender_id,
      v_milestone.amount, 'milestone', v_milestone.id, 'Auto-released: review deadline passed');

    -- Notify both parties
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES
      (v_milestone.sender_id, 'milestone_auto_released', 'Milestone Auto-Released',
       'Your milestone payment was auto-released as the review deadline passed.',
       jsonb_build_object('milestone_id', v_milestone.id, 'amount', v_milestone.amount)),
      (v_milestone.recipient_id, 'milestone_auto_released', 'Milestone Auto-Released',
       'A milestone was auto-released as the review deadline passed.',
       jsonb_build_object('milestone_id', v_milestone.id, 'amount', v_milestone.amount));

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- 9. CLEANUP EXPIRED IDEMPOTENCY KEYS — garbage collection
CREATE OR REPLACE FUNCTION public.cleanup_expired_idempotency_keys()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_count INTEGER;
BEGIN
  DELETE FROM idempotency_keys WHERE expires_at < now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
