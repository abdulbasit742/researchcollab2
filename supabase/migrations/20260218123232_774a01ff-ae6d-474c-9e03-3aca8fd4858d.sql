
-- Drop existing functions with parameter default conflicts
DROP FUNCTION IF EXISTS public.execute_escrow_refund(uuid, text);
DROP FUNCTION IF EXISTS public.execute_escrow_lock(uuid, uuid, numeric);

-- ============================================================
-- PART 1: Escrow functions with ledger + idempotency
-- ============================================================

CREATE OR REPLACE FUNCTION public.execute_escrow_refund(p_offer_id uuid, p_refund_reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  v_offer offers%ROWTYPE; v_buyer_wallet wallets%ROWTYPE;
  v_total_locked numeric; v_released_amount numeric; v_refund_amount numeric;
BEGIN
  IF EXISTS (SELECT 1 FROM wallet_transactions WHERE reference_type = 'offer' AND reference_id = p_offer_id::text AND type = 'escrow_refund') THEN
    RETURN jsonb_build_object('success', true, 'refund_amount', 0, 'message', 'Already processed');
  END IF;
  SELECT * INTO v_offer FROM offers WHERE id = p_offer_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Offer not found: %', p_offer_id; END IF;
  SELECT COALESCE(SUM(amount), 0) INTO v_total_locked FROM milestones WHERE offer_id = p_offer_id AND status NOT IN ('released', 'cancelled');
  SELECT COALESCE(SUM(amount), 0) INTO v_released_amount FROM milestones WHERE offer_id = p_offer_id AND status = 'released';
  v_refund_amount := v_total_locked;
  IF v_refund_amount <= 0 THEN RETURN jsonb_build_object('success', true, 'refund_amount', 0, 'message', 'No funds to refund'); END IF;
  SELECT * INTO v_buyer_wallet FROM wallets WHERE user_id = v_offer.recipient_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Buyer wallet not found'; END IF;
  IF v_buyer_wallet.escrow_balance < v_refund_amount THEN RAISE EXCEPTION 'Insufficient escrow. Escrow: %, Refund: %', v_buyer_wallet.escrow_balance, v_refund_amount; END IF;
  UPDATE wallets SET escrow_balance = escrow_balance - v_refund_amount, available_balance = available_balance + v_refund_amount, updated_at = now() WHERE id = v_buyer_wallet.id;
  INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_after, description, reference_type, reference_id, status) VALUES (v_buyer_wallet.id, v_offer.recipient_id, 'escrow_refund', v_refund_amount, v_buyer_wallet.available_balance + v_refund_amount, 'Escrow refund: ' || p_refund_reason, 'offer', p_offer_id::text, 'completed');
  INSERT INTO ledger_entries (entry_type, debit_account, credit_account, amount, currency, reference_type, reference_id, description, created_by) VALUES ('escrow_refund', 'escrow:' || v_offer.recipient_id::text, 'available:' || v_offer.recipient_id::text, v_refund_amount, 'PKR', 'offer', p_offer_id::text, 'Escrow refund: ' || p_refund_reason, v_offer.recipient_id);
  UPDATE milestones SET status = 'cancelled', updated_at = now() WHERE offer_id = p_offer_id AND status NOT IN ('released', 'cancelled');
  INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, details) VALUES (COALESCE(auth.uid(), v_offer.recipient_id), 'escrow_refund', 'offer', p_offer_id::text, jsonb_build_object('refund_amount', v_refund_amount, 'reason', p_refund_reason));
  RETURN jsonb_build_object('success', true, 'refund_amount', v_refund_amount, 'previously_released', v_released_amount, 'available_after', v_buyer_wallet.available_balance + v_refund_amount, 'escrow_after', v_buyer_wallet.escrow_balance - v_refund_amount);
END; $function$;

CREATE OR REPLACE FUNCTION public.execute_escrow_lock(p_offer_id uuid, p_buyer_id uuid, p_total_amount numeric)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_wallet wallets%ROWTYPE; v_new_available numeric; v_new_escrow numeric;
BEGIN
  IF EXISTS (SELECT 1 FROM wallet_transactions WHERE reference_type = 'offer' AND reference_id = p_offer_id::text AND type = 'escrow_deposit') THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already locked');
  END IF;
  SELECT * INTO v_wallet FROM wallets WHERE user_id = p_buyer_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found for %', p_buyer_id; END IF;
  IF v_wallet.available_balance < p_total_amount THEN RAISE EXCEPTION 'Insufficient funds. Available: %, Required: %', v_wallet.available_balance, p_total_amount; END IF;
  v_new_available := v_wallet.available_balance - p_total_amount;
  v_new_escrow := v_wallet.escrow_balance + p_total_amount;
  UPDATE wallets SET available_balance = v_new_available, escrow_balance = v_new_escrow, total_spent = total_spent + p_total_amount, updated_at = now() WHERE id = v_wallet.id;
  INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_after, description, reference_type, reference_id, status) VALUES (v_wallet.id, p_buyer_id, 'escrow_deposit', -p_total_amount, v_new_available, 'Escrow lock', 'offer', p_offer_id::text, 'completed');
  INSERT INTO ledger_entries (entry_type, debit_account, credit_account, amount, currency, reference_type, reference_id, description, created_by) VALUES ('escrow_lock', 'available:' || p_buyer_id::text, 'escrow:' || p_buyer_id::text, p_total_amount, 'PKR', 'offer', p_offer_id::text, 'Escrow lock', p_buyer_id);
  RETURN jsonb_build_object('success', true, 'locked_amount', p_total_amount, 'available_after', v_new_available, 'escrow_after', v_new_escrow);
END; $function$;

-- Upgrade milestone release with ledger
CREATE OR REPLACE FUNCTION public.execute_milestone_release(p_milestone_id uuid, p_released_by uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  v_milestone milestones%ROWTYPE; v_offer offers%ROWTYPE;
  v_buyer_wallet wallets%ROWTYPE; v_provider_wallet wallets%ROWTYPE;
  v_platform_fee numeric; v_net_amount numeric; v_provider_id uuid; v_buyer_id uuid;
BEGIN
  SELECT * INTO v_milestone FROM milestones WHERE id = p_milestone_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Milestone not found: %', p_milestone_id; END IF;
  IF v_milestone.status != 'approved' THEN RAISE EXCEPTION 'Must be approved. Current: %', v_milestone.status; END IF;
  SELECT * INTO v_offer FROM offers WHERE id = v_milestone.offer_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Offer not found'; END IF;
  v_provider_id := v_offer.sender_id; v_buyer_id := v_offer.recipient_id;
  v_platform_fee := get_platform_fee(v_provider_id, v_milestone.amount);
  v_net_amount := v_milestone.amount - v_platform_fee;
  SELECT * INTO v_buyer_wallet FROM wallets WHERE user_id = v_buyer_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Buyer wallet not found'; END IF;
  SELECT * INTO v_provider_wallet FROM wallets WHERE user_id = v_provider_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Provider wallet not found'; END IF;
  IF v_buyer_wallet.escrow_balance < v_milestone.amount THEN RAISE EXCEPTION 'Insufficient escrow'; END IF;
  UPDATE wallets SET escrow_balance = escrow_balance - v_milestone.amount, updated_at = now() WHERE id = v_buyer_wallet.id;
  UPDATE wallets SET available_balance = available_balance + v_net_amount, total_earned = total_earned + v_net_amount, updated_at = now() WHERE id = v_provider_wallet.id;
  INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_after, description, reference_type, reference_id, status) VALUES (v_buyer_wallet.id, v_buyer_id, 'escrow_release', -v_milestone.amount, v_buyer_wallet.escrow_balance - v_milestone.amount, 'Released: ' || v_milestone.title, 'milestone', p_milestone_id::text, 'completed');
  INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_after, description, reference_type, reference_id, status) VALUES (v_provider_wallet.id, v_provider_id, 'milestone_release', v_net_amount, v_provider_wallet.available_balance + v_net_amount, 'Payment: ' || v_milestone.title, 'milestone', p_milestone_id::text, 'completed');
  INSERT INTO ledger_entries (entry_type, debit_account, credit_account, amount, currency, reference_type, reference_id, description, created_by) VALUES ('milestone_release', 'escrow:' || v_buyer_id::text, 'available:' || v_provider_id::text, v_net_amount, 'PKR', 'milestone', p_milestone_id::text, 'Milestone: ' || v_milestone.title, p_released_by);
  IF v_platform_fee > 0 THEN
    INSERT INTO ledger_entries (entry_type, debit_account, credit_account, amount, currency, reference_type, reference_id, description, created_by) VALUES ('platform_fee', 'escrow:' || v_buyer_id::text, 'revenue:platform_fees', v_platform_fee, 'PKR', 'milestone', p_milestone_id::text, 'Platform fee', p_released_by);
  END IF;
  UPDATE milestones SET status = 'released', released_at = now(), platform_fee = v_platform_fee, updated_at = now() WHERE id = p_milestone_id;
  RETURN jsonb_build_object('success', true, 'milestone_id', p_milestone_id, 'gross_amount', v_milestone.amount, 'platform_fee', v_platform_fee, 'net_to_provider', v_net_amount);
END; $function$;


-- ============================================================
-- PART 2: RLS Policy Hardening (fixed — no invalid column refs)
-- ============================================================

DROP POLICY IF EXISTS "System insert ai gov logs" ON ai_governance_logs;
CREATE POLICY "Authenticated insert ai gov logs" ON ai_governance_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert ai_usage_logs" ON ai_usage_logs;
CREATE POLICY "Authenticated insert ai_usage_logs" ON ai_usage_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "System can create insights for users" ON ambient_insights;
CREATE POLICY "Authenticated insert ambient_insights" ON ambient_insights FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- credential_verifications has no user_id column — keep permissive but restrict to authenticated
DROP POLICY IF EXISTS "Anyone can create verification requests" ON credential_verifications;
CREATE POLICY "Authenticated create verification requests" ON credential_verifications FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Audit logs insertable by system" ON dashboard_audit_logs;
CREATE POLICY "Authenticated insert audit logs" ON dashboard_audit_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "dpl_insert" ON dispute_prediction_logs;
CREATE POLICY "Authenticated insert dispute predictions" ON dispute_prediction_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "srp_extlog_insert" ON external_verification_logs;
CREATE POLICY "Authenticated insert ext verification logs" ON external_verification_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "System inserts evasion logs" ON fee_evasion_logs;
CREATE POLICY "Authenticated insert evasion logs" ON fee_evasion_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "System can create escrow" ON fyp_escrow_links;
CREATE POLICY "Authenticated insert fyp escrow" ON fyp_escrow_links FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "System can create execution tracks" ON fyp_execution_tracks;
CREATE POLICY "Authenticated insert execution tracks" ON fyp_execution_tracks FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert metrics" ON fyp_impact_metrics;
CREATE POLICY "Authenticated insert impact metrics" ON fyp_impact_metrics FOR INSERT TO authenticated WITH CHECK (true);

-- fyp_problem_briefs has no user_id — public submission form, keep permissive for authenticated
DROP POLICY IF EXISTS "Anyone can submit problem brief" ON fyp_problem_briefs;
CREATE POLICY "Authenticated submit problem brief" ON fyp_problem_briefs FOR INSERT TO authenticated WITH CHECK (true);

-- fyp_teams has no created_by — keep permissive for authenticated
DROP POLICY IF EXISTS "Authenticated can create teams" ON fyp_teams;
CREATE POLICY "Authenticated create teams" ON fyp_teams FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "inst_perf_insert" ON institutional_performance_metrics;
CREATE POLICY "Admin insert inst perf metrics" ON institutional_performance_metrics FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "inst_skill_gaps_insert" ON institutional_skill_gaps;
CREATE POLICY "Admin insert skill gaps" ON institutional_skill_gaps FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "inst_snapshot_insert" ON institutional_talent_snapshots;
CREATE POLICY "Admin insert talent snapshots" ON institutional_talent_snapshots FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Track usage" ON knowledge_usage_events;
CREATE POLICY "Authenticated track usage" ON knowledge_usage_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "srp_verif_insert" ON passport_verifications;
CREATE POLICY "Authenticated insert passport verifications" ON passport_verifications FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "System inserts fees" ON platform_fees;
CREATE POLICY "Authenticated insert platform fees" ON platform_fees FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "pem_insert" ON pod_execution_metrics;
CREATE POLICY "Authenticated insert pod metrics" ON pod_execution_metrics FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can record views" ON profile_views;
CREATE POLICY "Authenticated record views" ON profile_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = viewer_id);

DROP POLICY IF EXISTS "audit_insert" ON research_ethics_audit;
CREATE POLICY "Authenticated insert ethics audit" ON research_ethics_audit FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "rss_insert" ON revenue_split_simulations;
CREATE POLICY "Authenticated insert revenue simulations" ON revenue_split_simulations FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can log searches" ON search_events;
CREATE POLICY "Authenticated log searches" ON search_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert transition logs" ON state_transition_logs;
CREATE POLICY "Authenticated insert transition logs" ON state_transition_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "System creates recommendations" ON system_recommendations;
CREATE POLICY "Authenticated insert recommendations" ON system_recommendations FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "System creates signals" ON system_signals;
CREATE POLICY "Authenticated insert signals" ON system_signals FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "talent_forecasts_insert" ON talent_forecasts;
CREATE POLICY "Admin insert talent forecasts" ON talent_forecasts FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "System insert trust audit" ON trust_calculation_audit;
CREATE POLICY "Authenticated insert trust audit" ON trust_calculation_audit FOR INSERT TO authenticated WITH CHECK (true);


-- ============================================================
-- PART 3: Trust velocity enforcement
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_trust_velocity(p_user_id uuid, p_delta integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_daily_total integer; v_weekly_total integer;
BEGIN
  SELECT COALESCE(SUM(ABS(trust_delta)), 0) INTO v_daily_total FROM trust_events WHERE user_id = p_user_id AND trust_delta > 0 AND created_at > now() - INTERVAL '24 hours';
  SELECT COALESCE(SUM(ABS(trust_delta)), 0) INTO v_weekly_total FROM trust_events WHERE user_id = p_user_id AND trust_delta > 0 AND created_at > now() - INTERVAL '7 days';
  IF p_delta > 0 AND (v_daily_total + p_delta) > 15 THEN RETURN false; END IF;
  IF p_delta > 0 AND (v_weekly_total + p_delta) > 40 THEN RETURN false; END IF;
  RETURN true;
END; $function$;


-- ============================================================
-- PART 4: Background job tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS public.background_job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  records_processed integer DEFAULT 0,
  records_affected integer DEFAULT 0,
  error_message text,
  metadata jsonb DEFAULT '{}'
);

ALTER TABLE public.background_job_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read job runs" ON background_job_runs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "System insert job runs" ON background_job_runs FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "System update job runs" ON background_job_runs FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));


-- ============================================================
-- PART 5: Auto-release milestone processor
-- ============================================================

CREATE OR REPLACE FUNCTION public.process_auto_release_milestones()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_job_id uuid; v_count integer := 0; v_released integer := 0; v_milestone RECORD; v_result jsonb;
BEGIN
  INSERT INTO background_job_runs (job_name) VALUES ('auto_release_milestones') RETURNING id INTO v_job_id;
  FOR v_milestone IN
    SELECT m.id, m.offer_id, o.recipient_id FROM milestones m JOIN offers o ON m.offer_id = o.id
    WHERE m.status = 'submitted' AND m.auto_release_at IS NOT NULL AND m.auto_release_at <= now()
  LOOP
    v_count := v_count + 1;
    BEGIN
      UPDATE milestones SET status = 'approved', updated_at = now() WHERE id = v_milestone.id;
      v_result := execute_milestone_release(v_milestone.id, v_milestone.recipient_id);
      IF (v_result->>'success')::boolean THEN v_released := v_released + 1; END IF;
    EXCEPTION WHEN OTHERS THEN
      UPDATE background_job_runs SET metadata = metadata || jsonb_build_object('err_' || v_milestone.id::text, SQLERRM) WHERE id = v_job_id;
    END;
  END LOOP;
  UPDATE background_job_runs SET completed_at = now(), status = 'completed', records_processed = v_count, records_affected = v_released WHERE id = v_job_id;
  RETURN jsonb_build_object('processed', v_count, 'released', v_released, 'job_id', v_job_id);
END; $function$;


-- ============================================================
-- PART 6: Trust decay processor
-- ============================================================

CREATE OR REPLACE FUNCTION public.process_trust_decay()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_job_id uuid; v_count integer := 0; v_decayed integer := 0; v_user RECORD; v_inactive_months integer; v_decay integer; v_new_score integer;
BEGIN
  INSERT INTO background_job_runs (job_name) VALUES ('trust_decay') RETURNING id INTO v_job_id;
  FOR v_user IN SELECT user_id, trust_score, last_activity_at FROM user_trust_profiles WHERE is_frozen = false AND trust_score > 0 AND last_activity_at < now() - INTERVAL '90 days'
  LOOP
    v_count := v_count + 1;
    v_inactive_months := EXTRACT(EPOCH FROM (now() - v_user.last_activity_at))::integer / (30 * 86400);
    v_decay := LEAST(v_inactive_months - 2, 5);
    IF v_decay > 0 THEN
      v_new_score := GREATEST(0, v_user.trust_score - v_decay);
      UPDATE user_trust_profiles SET trust_score = v_new_score, updated_at = now() WHERE user_id = v_user.user_id;
      INSERT INTO trust_events (user_id, event_type, event_source, trust_delta, trust_before, trust_after, evidence_summary) VALUES (v_user.user_id, 'trust_decay', 'background_job', -v_decay, v_user.trust_score, v_new_score, 'Inactivity: ' || v_inactive_months || ' months');
      v_decayed := v_decayed + 1;
    END IF;
  END LOOP;
  UPDATE background_job_runs SET completed_at = now(), status = 'completed', records_processed = v_count, records_affected = v_decayed WHERE id = v_job_id;
  RETURN jsonb_build_object('checked', v_count, 'decayed', v_decayed, 'job_id', v_job_id);
END; $function$;


-- ============================================================
-- PART 7: Suspicious activity detection
-- ============================================================

CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_job_id uuid; v_alerts integer := 0; v_count integer;
BEGIN
  INSERT INTO background_job_runs (job_name) VALUES ('suspicious_activity_detection') RETURNING id INTO v_job_id;
  INSERT INTO platform_alerts (alert_type, severity, message, context)
  SELECT 'rapid_escrow', 'high', 'User ' || user_id::text || ': ' || COUNT(*) || ' escrow ops/1h', jsonb_build_object('user_id', user_id, 'count', COUNT(*))
  FROM wallet_transactions WHERE type IN ('escrow_deposit', 'escrow_release', 'escrow_refund') AND created_at > now() - INTERVAL '1 hour' GROUP BY user_id HAVING COUNT(*) > 5;
  GET DIAGNOSTICS v_count = ROW_COUNT; v_alerts := v_alerts + v_count;

  INSERT INTO platform_alerts (alert_type, severity, message, context)
  SELECT 'trust_gaming', 'medium', 'User ' || user_id::text || ': ' || COUNT(*) || ' trust events/24h', jsonb_build_object('user_id', user_id, 'count', COUNT(*))
  FROM trust_events WHERE created_at > now() - INTERVAL '24 hours' GROUP BY user_id HAVING COUNT(*) > 10;
  GET DIAGNOSTICS v_count = ROW_COUNT; v_alerts := v_alerts + v_count;

  UPDATE background_job_runs SET completed_at = now(), status = 'completed', records_affected = v_alerts WHERE id = v_job_id;
  RETURN jsonb_build_object('alerts_created', v_alerts, 'job_id', v_job_id);
END; $function$;
