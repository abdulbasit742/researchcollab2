
-- Fix orphaned state detector: offers table uses created_at, not updated_at
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
    'Offer accepted ' || EXTRACT(DAY FROM now() - o.created_at)::INTEGER || ' days ago with no progress',
    CASE WHEN EXTRACT(DAY FROM now() - o.created_at) > 30 THEN 'high' ELSE 'medium' END
  FROM offers o
  WHERE o.status = 'accepted'
    AND o.created_at < now() - INTERVAL '14 days'
    AND NOT EXISTS (SELECT 1 FROM milestones m WHERE m.offer_id = o.id AND m.created_at > now() - INTERVAL '14 days')
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

  -- 4. Wallet balance mismatches
  SELECT COUNT(*) INTO v_wallet_mismatches
  FROM wallets w
  WHERE ABS((w.available_balance + w.escrow_balance) - (w.total_earned - COALESCE(w.total_withdrawn, 0))) > 1;

  -- 5. Stale processing idempotency keys
  SELECT COUNT(*) INTO v_stale_keys FROM idempotency_keys
  WHERE status = 'processing' AND created_at < now() - INTERVAL '10 minutes';

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
