
-- =============================================
-- TRUST SYSTEM IMMUNITY: Velocity Caps, Gaming Detection, Score Hardening
-- =============================================

-- 1. Trust velocity enforcement trigger: caps daily/weekly trust changes
CREATE OR REPLACE FUNCTION public.enforce_trust_velocity_cap()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_daily_delta NUMERIC;
  v_weekly_delta NUMERIC;
  v_max_daily CONSTANT INTEGER := 15;
  v_max_weekly CONSTANT INTEGER := 40;
  v_profile RECORD;
BEGIN
  -- Skip if admin override or system event
  IF NEW.event_source IN ('admin_override', 'system_penalty', 'hard_penalty') THEN
    RETURN NEW;
  END IF;

  -- Get current velocity
  SELECT trust_velocity_24h, trust_velocity_7d, is_frozen, is_under_review
  INTO v_profile
  FROM user_trust_profiles WHERE user_id = NEW.user_id;

  -- Block changes to frozen profiles
  IF v_profile.is_frozen THEN
    RAISE EXCEPTION 'Trust profile is frozen for user %', NEW.user_id;
  END IF;

  -- Calculate accumulated delta in last 24h and 7d
  SELECT COALESCE(SUM(ABS(trust_delta)), 0) INTO v_daily_delta
  FROM trust_events
  WHERE user_id = NEW.user_id AND created_at > now() - INTERVAL '24 hours'
    AND event_source NOT IN ('admin_override', 'system_penalty', 'hard_penalty');

  SELECT COALESCE(SUM(ABS(trust_delta)), 0) INTO v_weekly_delta
  FROM trust_events
  WHERE user_id = NEW.user_id AND created_at > now() - INTERVAL '7 days'
    AND event_source NOT IN ('admin_override', 'system_penalty', 'hard_penalty');

  -- Cap the delta if velocity exceeded
  IF v_daily_delta + ABS(NEW.trust_delta) > v_max_daily THEN
    NEW.trust_delta := SIGN(NEW.trust_delta) * GREATEST(v_max_daily - v_daily_delta, 0);
    NEW.evidence_summary := COALESCE(NEW.evidence_summary, '') || ' [VELOCITY CAPPED: daily limit]';
  END IF;

  IF v_weekly_delta + ABS(NEW.trust_delta) > v_max_weekly THEN
    NEW.trust_delta := SIGN(NEW.trust_delta) * GREATEST(v_max_weekly - v_weekly_delta, 0);
    NEW.evidence_summary := COALESCE(NEW.evidence_summary, '') || ' [VELOCITY CAPPED: weekly limit]';
  END IF;

  -- If delta was capped to 0, still allow insert but mark it
  IF NEW.trust_delta = 0 THEN
    NEW.evidence_summary := COALESCE(NEW.evidence_summary, '') || ' [ZERO DELTA: velocity saturated]';
  END IF;

  -- Update velocity trackers
  UPDATE user_trust_profiles SET
    trust_velocity_24h = v_daily_delta + ABS(NEW.trust_delta),
    trust_velocity_7d = v_weekly_delta + ABS(NEW.trust_delta),
    last_activity_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_trust_velocity_cap ON trust_events;
CREATE TRIGGER trg_trust_velocity_cap
  BEFORE INSERT ON trust_events
  FOR EACH ROW
  EXECUTE FUNCTION enforce_trust_velocity_cap();


-- 2. Gaming pattern detection function (called by background jobs)
CREATE OR REPLACE FUNCTION public.detect_trust_gaming_patterns()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_reciprocal_rings INTEGER := 0;
  v_rapid_bursts INTEGER := 0;
  v_single_source INTEGER := 0;
  v_total_flagged INTEGER := 0;
BEGIN
  -- Pattern 1: Reciprocal trust boosting (A rates B, B rates A within 48h)
  WITH reciprocal AS (
    SELECT e1.user_id AS user_a, e2.user_id AS user_b
    FROM trust_events e1
    JOIN trust_events e2 ON e1.user_id = CAST(e2.reference_id AS UUID)
      AND e2.user_id = CAST(e1.reference_id AS UUID)
      AND e1.trust_delta > 0 AND e2.trust_delta > 0
      AND ABS(EXTRACT(EPOCH FROM e1.created_at - e2.created_at)) < 172800  -- 48h
      AND e1.created_at > now() - INTERVAL '30 days'
  )
  SELECT COUNT(DISTINCT user_a) INTO v_reciprocal_rings FROM reciprocal;

  -- Flag users with high reciprocal ratios
  UPDATE user_trust_profiles SET
    is_under_review = true,
    review_reason = 'High reciprocal trust ratio detected'
  WHERE reciprocal_ratio > 0.7
    AND user_id IN (
      SELECT user_id FROM trust_events
      WHERE created_at > now() - INTERVAL '30 days'
      GROUP BY user_id HAVING COUNT(*) > 5
    )
    AND is_under_review = false;
  GET DIAGNOSTICS v_reciprocal_rings = ROW_COUNT;

  -- Pattern 2: Rapid burst scoring (>5 positive events in 1 hour)
  WITH bursts AS (
    SELECT user_id, date_trunc('hour', created_at) AS hour_window, COUNT(*) AS cnt
    FROM trust_events
    WHERE trust_delta > 0 AND created_at > now() - INTERVAL '7 days'
    GROUP BY user_id, date_trunc('hour', created_at)
    HAVING COUNT(*) > 5
  )
  SELECT COUNT(DISTINCT user_id) INTO v_rapid_bursts FROM bursts;

  UPDATE user_trust_profiles SET
    is_under_review = true,
    review_reason = 'Rapid burst trust activity detected'
  WHERE user_id IN (
    SELECT user_id FROM trust_events
    WHERE trust_delta > 0 AND created_at > now() - INTERVAL '7 days'
    GROUP BY user_id, date_trunc('hour', created_at)
    HAVING COUNT(*) > 5
  ) AND is_under_review = false;

  -- Pattern 3: Single-source dependency (>60% of trust from one counterparty)
  WITH source_dependency AS (
    SELECT user_id, reference_id,
      SUM(trust_delta) AS source_total,
      SUM(SUM(trust_delta)) OVER (PARTITION BY user_id) AS user_total
    FROM trust_events
    WHERE trust_delta > 0 AND reference_id IS NOT NULL
      AND created_at > now() - INTERVAL '90 days'
    GROUP BY user_id, reference_id
  )
  SELECT COUNT(DISTINCT user_id) INTO v_single_source
  FROM source_dependency
  WHERE user_total > 0 AND (source_total::NUMERIC / user_total) > 0.6;

  -- Update unique counterparties count
  UPDATE user_trust_profiles utp SET
    unique_counterparties_30d = sub.cnt
  FROM (
    SELECT user_id, COUNT(DISTINCT reference_id) AS cnt
    FROM trust_events
    WHERE created_at > now() - INTERVAL '30 days' AND reference_id IS NOT NULL
    GROUP BY user_id
  ) sub
  WHERE utp.user_id = sub.user_id;

  -- Update reciprocal ratios
  UPDATE user_trust_profiles utp SET
    reciprocal_ratio = sub.ratio
  FROM (
    SELECT e1.user_id,
      COUNT(DISTINCT e2.id)::NUMERIC / NULLIF(COUNT(DISTINCT e1.id), 0) AS ratio
    FROM trust_events e1
    LEFT JOIN trust_events e2 ON e1.user_id = CAST(e2.reference_id AS UUID)
      AND e2.user_id = CAST(e1.reference_id AS UUID)
      AND e2.trust_delta > 0
      AND ABS(EXTRACT(EPOCH FROM e1.created_at - e2.created_at)) < 172800
    WHERE e1.trust_delta > 0 AND e1.created_at > now() - INTERVAL '30 days'
    GROUP BY e1.user_id
  ) sub
  WHERE utp.user_id = sub.user_id;

  v_total_flagged := v_reciprocal_rings + v_rapid_bursts + v_single_source;

  -- Log to admin audit if patterns found
  IF v_total_flagged > 0 THEN
    INSERT INTO admin_audit_logs (admin_id, action, entity_type, details) VALUES (
      '00000000-0000-0000-0000-000000000000', 'trust_gaming_detected', 'system',
      jsonb_build_object('reciprocal_rings', v_reciprocal_rings, 'rapid_bursts', v_rapid_bursts,
        'single_source_dependency', v_single_source, 'total_flagged', v_total_flagged)
    );
  END IF;

  RETURN jsonb_build_object(
    'reciprocal_rings', v_reciprocal_rings,
    'rapid_bursts', v_rapid_bursts,
    'single_source_dependency', v_single_source,
    'total_flagged', v_total_flagged
  );
END;
$$;


-- 3. Non-linear trust score curve (diminishing returns at high trust)
CREATE OR REPLACE FUNCTION public.apply_trust_curve(raw_score NUMERIC)
RETURNS INTEGER
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  -- Logarithmic curve: fast early gains, diminishing returns above 70
  -- Floor at 0, ceiling at 100
  IF raw_score <= 0 THEN RETURN 0; END IF;
  IF raw_score >= 100 THEN RETURN 100; END IF;
  IF raw_score <= 70 THEN RETURN ROUND(raw_score)::INTEGER; END IF;
  -- Above 70: diminishing returns (70 + 30 * ln(1 + (raw-70)/30) / ln(2))
  RETURN LEAST(100, ROUND(70 + 30 * LN(1 + (raw_score - 70) / 30.0) / LN(2))::INTEGER);
END;
$$;


-- 4. Add gaming detection to the hourly health monitor
-- Schedule gaming detection every 30 minutes
SELECT cron.schedule(
  'detect-trust-gaming',
  '*/30 * * * *',
  $$SELECT detect_trust_gaming_patterns()$$
);
