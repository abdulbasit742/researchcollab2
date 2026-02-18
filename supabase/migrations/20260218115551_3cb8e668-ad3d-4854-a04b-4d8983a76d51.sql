-- Create the missing execute_escrow_refund function
CREATE OR REPLACE FUNCTION public.execute_escrow_refund(p_offer_id uuid, p_refund_reason text DEFAULT 'Deal cancelled')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offer offers%ROWTYPE;
  v_buyer_wallet wallets%ROWTYPE;
  v_total_locked numeric;
  v_released_amount numeric;
  v_refund_amount numeric;
BEGIN
  -- Get offer details
  SELECT * INTO v_offer FROM offers WHERE id = p_offer_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer not found: %', p_offer_id;
  END IF;

  -- Calculate total locked = sum of milestone amounts that haven't been released
  SELECT COALESCE(SUM(amount), 0) INTO v_total_locked
  FROM milestones
  WHERE offer_id = p_offer_id
  AND status NOT IN ('released', 'cancelled');

  -- Calculate already released
  SELECT COALESCE(SUM(amount), 0) INTO v_released_amount
  FROM milestones
  WHERE offer_id = p_offer_id
  AND status = 'released';

  v_refund_amount := v_total_locked;

  IF v_refund_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', true,
      'refund_amount', 0,
      'message', 'No funds to refund'
    );
  END IF;

  -- Lock buyer wallet
  SELECT * INTO v_buyer_wallet FROM wallets WHERE user_id = v_offer.recipient_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Buyer wallet not found';
  END IF;

  -- Verify sufficient escrow balance
  IF v_buyer_wallet.escrow_balance < v_refund_amount THEN
    RAISE EXCEPTION 'Insufficient escrow balance for refund. Escrow: %, Refund: %', v_buyer_wallet.escrow_balance, v_refund_amount;
  END IF;

  -- Move funds from escrow back to available
  UPDATE wallets
  SET escrow_balance = escrow_balance - v_refund_amount,
      available_balance = available_balance + v_refund_amount,
      updated_at = now()
  WHERE id = v_buyer_wallet.id;

  -- Record refund transaction
  INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_after, description, reference_type, reference_id, status)
  VALUES (v_buyer_wallet.id, v_offer.recipient_id, 'escrow_refund', v_refund_amount,
          v_buyer_wallet.available_balance + v_refund_amount,
          'Escrow refund: ' || p_refund_reason, 'offer', p_offer_id::text, 'completed');

  -- Cancel unreleased milestones
  UPDATE milestones
  SET status = 'cancelled', updated_at = now()
  WHERE offer_id = p_offer_id
  AND status NOT IN ('released', 'cancelled');

  RETURN jsonb_build_object(
    'success', true,
    'refund_amount', v_refund_amount,
    'previously_released', v_released_amount,
    'available_after', v_buyer_wallet.available_balance + v_refund_amount,
    'escrow_after', v_buyer_wallet.escrow_balance - v_refund_amount
  );
END;
$$;

-- Fix 4 functions with mutable search_path
CREATE OR REPLACE FUNCTION public.compute_consequence_ledger(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_stats RECORD;
  v_trust_score INTEGER;
  v_peak INTEGER;
  v_lowest INTEGER;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE initiator_id = p_user_id OR executor_id = p_user_id) as attempted,
    COUNT(*) FILTER (WHERE outcome_status = 'completed' AND (initiator_id = p_user_id OR executor_id = p_user_id)) as completed,
    COUNT(*) FILTER (WHERE outcome_status = 'failed' AND (initiator_id = p_user_id OR executor_id = p_user_id)) as failed,
    COUNT(*) FILTER (WHERE outcome_status = 'abandoned' AND (initiator_id = p_user_id OR executor_id = p_user_id)) as abandoned,
    COALESCE(SUM(escrow_amount) FILTER (WHERE initiator_id = p_user_id OR executor_id = p_user_id), 0) as total_escrow,
    COALESCE(SUM(total_paid) FILTER (WHERE outcome_status = 'completed' AND (initiator_id = p_user_id OR executor_id = p_user_id)), 0) as released,
    COALESCE(SUM(escrow_amount) FILTER (WHERE outcome_status = 'disputed' AND (initiator_id = p_user_id OR executor_id = p_user_id)), 0) as disputed
  INTO v_stats
  FROM accountability_records;
  
  SELECT trust_score INTO v_trust_score FROM user_trust_profiles WHERE user_id = p_user_id;
  SELECT COALESCE(MAX(trust_after), 0), COALESCE(MIN(trust_after), 0) 
  INTO v_peak, v_lowest
  FROM trust_events WHERE user_id = p_user_id;
  
  INSERT INTO consequence_ledgers (
    user_id, projects_attempted, projects_completed, projects_failed, projects_abandoned,
    total_escrow_handled, total_escrow_released, total_escrow_disputed,
    completion_rate, trust_score_current, trust_score_peak, trust_score_lowest,
    trust_trajectory, computed_at
  ) VALUES (
    p_user_id, v_stats.attempted, v_stats.completed, v_stats.failed, v_stats.abandoned,
    v_stats.total_escrow, v_stats.released, v_stats.disputed,
    CASE WHEN v_stats.attempted > 0 THEN (v_stats.completed::DECIMAL / v_stats.attempted * 100) ELSE 0 END,
    COALESCE(v_trust_score, 0), COALESCE(v_peak, v_trust_score, 0), COALESCE(v_lowest, v_trust_score, 0),
    CASE WHEN v_trust_score > v_peak - 10 THEN 'rising' WHEN v_trust_score < v_lowest + 10 THEN 'declining' ELSE 'stable' END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    projects_attempted = EXCLUDED.projects_attempted, projects_completed = EXCLUDED.projects_completed,
    projects_failed = EXCLUDED.projects_failed, projects_abandoned = EXCLUDED.projects_abandoned,
    total_escrow_handled = EXCLUDED.total_escrow_handled, total_escrow_released = EXCLUDED.total_escrow_released,
    total_escrow_disputed = EXCLUDED.total_escrow_disputed, completion_rate = EXCLUDED.completion_rate,
    trust_score_current = EXCLUDED.trust_score_current, trust_score_peak = EXCLUDED.trust_score_peak,
    trust_score_lowest = EXCLUDED.trust_score_lowest, trust_trajectory = EXCLUDED.trust_trajectory,
    computed_at = EXCLUDED.computed_at;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_trust_on_accountability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_initiator_delta INTEGER;
  v_executor_delta INTEGER;
  v_initiator_trust_before INTEGER;
  v_executor_trust_before INTEGER;
  v_initiator_trust_after INTEGER;
  v_executor_trust_after INTEGER;
BEGIN
  IF NEW.outcome_status IN ('completed', 'failed', 'disputed') AND 
     OLD.outcome_status = 'in_progress' AND
     NEW.trust_impact_applied = FALSE THEN
    
    SELECT COALESCE(trust_score, 0) INTO v_initiator_trust_before FROM user_trust_profiles WHERE user_id = NEW.initiator_id;
    SELECT COALESCE(trust_score, 0) INTO v_executor_trust_before FROM user_trust_profiles WHERE user_id = NEW.executor_id;
    
    IF NEW.outcome_status = 'completed' THEN
      v_initiator_delta := 2;
      v_executor_delta := 5 + COALESCE(FLOOR(NEW.escrow_amount / 1000), 0)::INTEGER;
    ELSIF NEW.outcome_status = 'failed' THEN
      IF NEW.failure_attributed_to = NEW.executor_id THEN v_executor_delta := -10; v_initiator_delta := 1;
      ELSIF NEW.failure_attributed_to = NEW.initiator_id THEN v_initiator_delta := -10; v_executor_delta := 2;
      ELSE v_initiator_delta := -3; v_executor_delta := -3; END IF;
    ELSIF NEW.outcome_status = 'disputed' THEN
      v_initiator_delta := -5; v_executor_delta := -5;
    END IF;
    
    v_initiator_trust_after := GREATEST(0, LEAST(100, v_initiator_trust_before + v_initiator_delta));
    v_executor_trust_after := GREATEST(0, LEAST(100, v_executor_trust_before + v_executor_delta));
    
    UPDATE user_trust_profiles SET trust_score = v_initiator_trust_after, updated_at = now() WHERE user_id = NEW.initiator_id;
    UPDATE user_trust_profiles SET trust_score = v_executor_trust_after, updated_at = now() WHERE user_id = NEW.executor_id;
    
    INSERT INTO trust_events (user_id, event_type, event_source, trust_delta, trust_before, trust_after, reference_type, reference_id, evidence_summary)
    VALUES 
      (NEW.initiator_id, CASE WHEN NEW.outcome_status = 'completed' THEN 'project_completed' ELSE 'project_failed' END,
       'escrow_system', v_initiator_delta, v_initiator_trust_before, v_initiator_trust_after, 'accountability_record', NEW.id, 'Project: ' || COALESCE(NEW.promised_deliverables[1], 'Unnamed')),
      (NEW.executor_id, CASE WHEN NEW.outcome_status = 'completed' THEN 'project_completed' ELSE 'project_failed' END,
       'escrow_system', v_executor_delta, v_executor_trust_before, v_executor_trust_after, 'accountability_record', NEW.id, 'Project: ' || COALESCE(NEW.promised_deliverables[1], 'Unnamed'));
    
    NEW.trust_impact_applied := TRUE;
    NEW.trust_impact_initiator := v_initiator_delta;
    NEW.trust_impact_executor := v_executor_delta;
    
    INSERT INTO reality_feed_events (event_type, primary_actor_id, secondary_actor_id, title, summary, amount_involved, reference_type, reference_id, trust_impact, is_verified)
    VALUES (
      CASE WHEN NEW.outcome_status = 'completed' THEN 'project_completed' ELSE 'project_failed' END,
      NEW.executor_id, NEW.initiator_id,
      CASE WHEN NEW.outcome_status = 'completed' THEN 'Project Completed Successfully' ELSE 'Project Failed' END,
      NEW.outcome_verdict, NEW.total_paid, 'accountability_record', NEW.id, v_executor_delta, TRUE
    );
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_trust_gate(p_user_id uuid, p_gate_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_gate RECORD;
  v_user RECORD;
  v_ledger RECORD;
  v_passed BOOLEAN := TRUE;
  v_denial_reasons TEXT[] := '{}';
BEGIN
  SELECT * INTO v_gate FROM trust_access_gates WHERE gate_name = p_gate_name AND is_active = TRUE;
  IF NOT FOUND THEN RETURN jsonb_build_object('allowed', TRUE, 'gate_not_found', TRUE); END IF;
  
  SELECT * INTO v_user FROM user_trust_profiles WHERE user_id = p_user_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('allowed', FALSE, 'reason', 'No trust profile'); END IF;
  
  SELECT * INTO v_ledger FROM consequence_ledgers WHERE user_id = p_user_id;
  
  IF v_user.trust_score < v_gate.min_trust_score THEN v_passed := FALSE; v_denial_reasons := array_append(v_denial_reasons, 'Trust score too low'); END IF;
  IF v_user.total_projects_completed < v_gate.min_projects_completed THEN v_passed := FALSE; v_denial_reasons := array_append(v_denial_reasons, 'Not enough completed projects'); END IF;
  IF COALESCE(v_ledger.escrow_success_rate, 0) < v_gate.min_escrow_success_rate THEN v_passed := FALSE; v_denial_reasons := array_append(v_denial_reasons, 'Escrow success rate too low'); END IF;
  IF v_gate.requires_verification AND NOT (v_user.is_verified_student OR v_user.is_verified_researcher OR v_user.is_verified_partner) THEN v_passed := FALSE; v_denial_reasons := array_append(v_denial_reasons, 'Verification required'); END IF;
  
  RETURN jsonb_build_object(
    'allowed', v_passed, 'gate_name', v_gate.gate_name, 'denial_reasons', v_denial_reasons, 'denial_message', v_gate.denial_message,
    'requirements', jsonb_build_object('min_trust_score', v_gate.min_trust_score, 'min_projects', v_gate.min_projects_completed, 'min_success_rate', v_gate.min_escrow_success_rate),
    'current', jsonb_build_object('trust_score', v_user.trust_score, 'projects_completed', v_user.total_projects_completed, 'escrow_success_rate', COALESCE(v_ledger.escrow_success_rate, 0))
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_collective_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$function$;
