
-- ============================================================
-- PRODUCTION INFRASTRUCTURE ARMOR — Nightly Reconciliation
-- ============================================================

-- Server-side reconciliation function (runs via pg_cron)
CREATE OR REPLACE FUNCTION public.run_nightly_reconciliation()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_discrepancies TEXT[] := '{}';
  v_total_wallet_available NUMERIC := 0;
  v_total_wallet_escrow NUMERIC := 0;
  v_total_escrow_locked NUMERIC := 0;
  v_total_escrow_released NUMERIC := 0;
  v_ledger_credits NUMERIC := 0;
  v_ledger_debits NUMERIC := 0;
  v_negative_wallets INT := 0;
  v_orphan_milestones INT := 0;
  v_duplicate_ledger INT := 0;
  v_status TEXT := 'balanced';
BEGIN
  -- 1. Sum wallet balances
  SELECT 
    COALESCE(SUM(available_balance), 0),
    COALESCE(SUM(escrow_balance), 0)
  INTO v_total_wallet_available, v_total_wallet_escrow
  FROM wallets;

  -- 2. Sum escrow locked/released amounts
  SELECT 
    COALESCE(SUM(locked_amount), 0),
    COALESCE(SUM(released_amount), 0)
  INTO v_total_escrow_locked, v_total_escrow_released
  FROM escrows
  WHERE status NOT IN ('refunded', 'cancelled');

  -- 3. Check escrow vs wallet consistency
  IF ABS(v_total_wallet_escrow - v_total_escrow_locked) > 1 THEN
    v_discrepancies := array_append(v_discrepancies, 
      format('Escrow mismatch: wallet_escrow=%s vs escrow_locked=%s (diff=%s)', 
        v_total_wallet_escrow, v_total_escrow_locked, v_total_wallet_escrow - v_total_escrow_locked));
  END IF;

  -- 4. Ledger credit/debit balance
  SELECT 
    COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0)
  INTO v_ledger_credits, v_ledger_debits
  FROM ledger_entries;

  IF ABS(v_ledger_credits - v_ledger_debits) > 1 THEN
    v_discrepancies := array_append(v_discrepancies,
      format('Ledger imbalance: credits=%s debits=%s net=%s', 
        v_ledger_credits, v_ledger_debits, v_ledger_credits - v_ledger_debits));
  END IF;

  -- 5. Negative balance wallets
  SELECT COUNT(*) INTO v_negative_wallets
  FROM wallets
  WHERE available_balance < 0 OR escrow_balance < 0;

  IF v_negative_wallets > 0 THEN
    v_discrepancies := array_append(v_discrepancies,
      format('%s wallet(s) with negative balance', v_negative_wallets));
    -- Log critical security event
    PERFORM log_security_event(NULL, 'negative_balance_detected', 'critical',
      format('%s wallets with negative balance found during reconciliation', v_negative_wallets));
  END IF;

  -- 6. Orphaned milestones (milestone with no valid deal)
  SELECT COUNT(*) INTO v_orphan_milestones
  FROM milestones m
  LEFT JOIN deal_rooms d ON m.deal_id = d.id OR m.offer_id = d.id
  WHERE d.id IS NULL AND m.deal_id IS NOT NULL;

  IF v_orphan_milestones > 0 THEN
    v_discrepancies := array_append(v_discrepancies,
      format('%s orphaned milestone(s) found', v_orphan_milestones));
  END IF;

  -- 7. Duplicate ledger entries (same transaction_id + account_id + entry_type)
  SELECT COUNT(*) INTO v_duplicate_ledger
  FROM (
    SELECT transaction_id, account_id, entry_type, COUNT(*) as cnt
    FROM ledger_entries
    GROUP BY transaction_id, account_id, entry_type
    HAVING COUNT(*) > 1
  ) dupes;

  IF v_duplicate_ledger > 0 THEN
    v_discrepancies := array_append(v_discrepancies,
      format('%s duplicate ledger entry group(s)', v_duplicate_ledger));
    PERFORM log_security_event(NULL, 'duplicate_ledger_entries', 'critical',
      format('%s duplicate ledger groups detected', v_duplicate_ledger));
  END IF;

  -- Set status
  IF array_length(v_discrepancies, 1) > 0 THEN
    v_status := 'discrepancy_detected';
  END IF;

  -- Log result to platform_integrity_logs if table exists
  BEGIN
    INSERT INTO platform_integrity_logs (check_type, status, details, created_at)
    VALUES ('nightly_reconciliation', v_status, 
      jsonb_build_object(
        'wallet_available', v_total_wallet_available,
        'wallet_escrow', v_total_wallet_escrow,
        'escrow_locked', v_total_escrow_locked,
        'escrow_released', v_total_escrow_released,
        'ledger_credits', v_ledger_credits,
        'ledger_debits', v_ledger_debits,
        'negative_wallets', v_negative_wallets,
        'orphan_milestones', v_orphan_milestones,
        'duplicate_ledger', v_duplicate_ledger,
        'discrepancies', to_jsonb(v_discrepancies)
      ), now());
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, skip
    NULL;
  END;

  -- Alert if critical
  IF v_negative_wallets > 0 OR v_duplicate_ledger > 0 THEN
    BEGIN
      INSERT INTO platform_alerts (alert_type, severity, title, description, source_component)
      VALUES ('reconciliation_failure', 'critical', 'Nightly Reconciliation Failed',
        format('%s discrepancies found: %s', array_length(v_discrepancies, 1), array_to_string(v_discrepancies, '; ')),
        'reconciliation_engine');
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END IF;

  RETURN jsonb_build_object(
    'status', v_status,
    'timestamp', now(),
    'wallet_available', v_total_wallet_available,
    'wallet_escrow', v_total_wallet_escrow,
    'escrow_locked', v_total_escrow_locked,
    'ledger_credits', v_ledger_credits,
    'ledger_debits', v_ledger_debits,
    'negative_wallets', v_negative_wallets,
    'orphan_milestones', v_orphan_milestones,
    'duplicate_ledger', v_duplicate_ledger,
    'discrepancies', to_jsonb(v_discrepancies)
  );
END;
$$;

-- Escrow invariant validation function (callable from admin or cron)
CREATE OR REPLACE FUNCTION public.validate_all_escrow_invariants()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_violations TEXT[] := '{}';
  v_escrow RECORD;
  v_total_checked INT := 0;
BEGIN
  FOR v_escrow IN 
    SELECT id, deal_id, total_amount, locked_amount, released_amount, refunded_amount, status
    FROM escrows
    WHERE status NOT IN ('cancelled')
  LOOP
    v_total_checked := v_total_checked + 1;
    
    -- Invariant 1: locked + released + refunded <= total
    IF v_escrow.locked_amount + v_escrow.released_amount + v_escrow.refunded_amount > v_escrow.total_amount + 0.01 THEN
      v_violations := array_append(v_violations,
        format('Escrow %s: sum (%s) exceeds total (%s)', v_escrow.id, 
          v_escrow.locked_amount + v_escrow.released_amount + v_escrow.refunded_amount, v_escrow.total_amount));
    END IF;
    
    -- Invariant 2: no negative amounts
    IF v_escrow.locked_amount < 0 OR v_escrow.released_amount < 0 OR v_escrow.refunded_amount < 0 OR v_escrow.total_amount < 0 THEN
      v_violations := array_append(v_violations,
        format('Escrow %s: negative amount detected', v_escrow.id));
    END IF;
    
    -- Invariant 3: completed escrow must have 0 locked
    IF v_escrow.status = 'completed' AND v_escrow.locked_amount > 0.01 THEN
      v_violations := array_append(v_violations,
        format('Escrow %s: completed but still has %s locked', v_escrow.id, v_escrow.locked_amount));
    END IF;
    
    -- Invariant 4: refunded escrow must have 0 locked
    IF v_escrow.status = 'refunded' AND v_escrow.locked_amount > 0.01 THEN
      v_violations := array_append(v_violations,
        format('Escrow %s: refunded but still has %s locked', v_escrow.id, v_escrow.locked_amount));
    END IF;
  END LOOP;

  -- Log violations as security events
  IF array_length(v_violations, 1) > 0 THEN
    PERFORM log_security_event(NULL, 'escrow_invariant_batch_failure', 'critical',
      format('%s violations found in %s escrows', array_length(v_violations, 1), v_total_checked));
  END IF;

  RETURN jsonb_build_object(
    'valid', array_length(v_violations, 1) IS NULL,
    'total_checked', v_total_checked,
    'violations', to_jsonb(v_violations),
    'checked_at', now()
  );
END;
$$;
