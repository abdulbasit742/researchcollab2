-- =====================================================
-- TRUST MATH & ABUSE PREVENTION INFRASTRUCTURE
-- Brutally focused MVP: Work → Escrow → Trust → Access
-- =====================================================

-- 1. COLLABORATION COOLDOWNS (Anti-gaming: prevent circular trust farming)
CREATE TABLE IF NOT EXISTS public.collaboration_cooldowns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a_id UUID NOT NULL,
  user_b_id UUID NOT NULL,
  last_collaboration_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  collaboration_count INTEGER NOT NULL DEFAULT 1,
  trust_dampening_factor NUMERIC(4,3) NOT NULL DEFAULT 1.0,
  next_full_credit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_a_id, user_b_id)
);

-- 2. PROJECT THRESHOLDS (Minimum requirements to prevent fake micro-projects)
CREATE TABLE IF NOT EXISTS public.project_thresholds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  threshold_type TEXT NOT NULL, -- 'minimum_budget', 'minimum_duration', 'evidence_required'
  threshold_value NUMERIC NOT NULL,
  applies_to TEXT NOT NULL DEFAULT 'all', -- 'all', 'new_users', 'low_trust'
  trust_level_required INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TRUST SCORE COMPONENTS (5-dimension weighted system)
CREATE TABLE IF NOT EXISTS public.trust_score_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Delivery Score (40% weight)
  delivery_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  projects_completed INTEGER NOT NULL DEFAULT 0,
  projects_failed INTEGER NOT NULL DEFAULT 0,
  partial_deliveries INTEGER NOT NULL DEFAULT 0,
  on_time_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  -- Financial Reliability (25% weight)
  financial_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  escrow_releases_successful INTEGER NOT NULL DEFAULT 0,
  disputes_raised INTEGER NOT NULL DEFAULT 0,
  disputes_lost INTEGER NOT NULL DEFAULT 0,
  refunds_issued INTEGER NOT NULL DEFAULT 0,
  escrow_cancellations INTEGER NOT NULL DEFAULT 0,
  -- Collaboration Quality (15% weight)
  collaboration_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  peer_reviews_received INTEGER NOT NULL DEFAULT 0,
  avg_peer_rating NUMERIC(3,2) DEFAULT NULL,
  repeat_collaborations INTEGER NOT NULL DEFAULT 0,
  abandoned_collaborations INTEGER NOT NULL DEFAULT 0,
  avg_response_hours NUMERIC(6,2) DEFAULT NULL,
  -- Institutional Confidence (10% weight)
  institutional_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  verifications_count INTEGER NOT NULL DEFAULT 0,
  institutional_affiliations INTEGER NOT NULL DEFAULT 0,
  grants_executed INTEGER NOT NULL DEFAULT 0,
  institutional_disputes INTEGER NOT NULL DEFAULT 0,
  -- Time & Consistency (10% weight)
  consistency_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  active_months INTEGER NOT NULL DEFAULT 0,
  longest_inactive_days INTEGER NOT NULL DEFAULT 0,
  trust_volatility NUMERIC(5,2) NOT NULL DEFAULT 0,
  trend_direction TEXT DEFAULT 'stable', -- 'improving', 'stable', 'declining'
  -- Computed total
  total_trust_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  last_decay_applied_at TIMESTAMPTZ,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 4. TRUST DECAY TRACKING (Inactivity penalty)
CREATE TABLE IF NOT EXISTS public.trust_decay_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  decay_amount NUMERIC(5,2) NOT NULL,
  decay_reason TEXT NOT NULL, -- 'inactivity', 'time_based', 'stale_verification'
  days_inactive INTEGER,
  previous_score NUMERIC(5,2) NOT NULL,
  new_score NUMERIC(5,2) NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. HARD PENALTIES (Immediate severe consequences)
CREATE TABLE IF NOT EXISTS public.trust_hard_penalties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  penalty_type TEXT NOT NULL, -- 'abandoned_escrow', 'proven_fraud', 'multi_account', 'repeated_dispute_loss', 'off_platform_avoidance'
  penalty_points INTEGER NOT NULL,
  recovery_months INTEGER NOT NULL, -- How long to recover
  evidence_reference TEXT,
  applied_by UUID,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ, -- NULL = permanent
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 6. ACCESS GATES (Feature locking based on trust)
CREATE TABLE IF NOT EXISTS public.feature_access_gates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT NOT NULL UNIQUE,
  minimum_trust_score INTEGER NOT NULL DEFAULT 0,
  minimum_projects_completed INTEGER NOT NULL DEFAULT 0,
  minimum_account_age_days INTEGER NOT NULL DEFAULT 0,
  requires_verification BOOLEAN NOT NULL DEFAULT false,
  requires_escrow_history BOOLEAN NOT NULL DEFAULT false,
  max_disputes_allowed INTEGER DEFAULT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. COLLUSION DETECTION LOG
CREATE TABLE IF NOT EXISTS public.collusion_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a_id UUID NOT NULL,
  user_b_id UUID NOT NULL,
  flag_type TEXT NOT NULL, -- 'circular_collaboration', 'rapid_trust_farming', 'suspicious_escrow_pattern'
  confidence_score NUMERIC(4,3) NOT NULL,
  evidence_data JSONB,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  resolution TEXT, -- 'dismissed', 'confirmed', 'pending'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. SERIOUS ACTION CONFIRMATIONS (Friction for important actions)
CREATE TABLE IF NOT EXISTS public.action_confirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'start_project', 'lock_escrow', 'approve_milestone', 'raise_dispute', 'cancel_project'
  action_target_id UUID NOT NULL,
  confirmation_data JSONB NOT NULL, -- Summary shown to user
  confirmed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collaboration_cooldowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_score_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_decay_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_hard_penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_access_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collusion_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_confirmations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own cooldowns" ON public.collaboration_cooldowns
  FOR SELECT USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Anyone can view thresholds" ON public.project_thresholds
  FOR SELECT USING (true);

CREATE POLICY "Users can view own trust components" ON public.trust_score_components
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own decay log" ON public.trust_decay_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own penalties" ON public.trust_hard_penalties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view access gates" ON public.feature_access_gates
  FOR SELECT USING (true);

CREATE POLICY "Admins can view collusion flags" ON public.collusion_flags
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own action confirmations" ON public.action_confirmations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own confirmations" ON public.action_confirmations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own confirmations" ON public.action_confirmations
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert default thresholds
INSERT INTO public.project_thresholds (threshold_type, threshold_value, applies_to, rationale) VALUES
  ('minimum_budget', 50, 'all', 'Minimum $50 budget to prevent micro-project trust farming'),
  ('minimum_budget_new_user', 25, 'new_users', 'Lower threshold for new users building initial record'),
  ('minimum_duration_days', 3, 'all', 'Projects must have at least 3 day duration'),
  ('evidence_required', 1, 'all', 'At least 1 evidence attachment required for completion'),
  ('cooldown_same_collaborator_days', 14, 'all', 'Must wait 14 days before full trust credit with same collaborator');

-- Insert default feature gates
INSERT INTO public.feature_access_gates (feature_name, minimum_trust_score, minimum_projects_completed, description) VALUES
  ('messaging_unlimited', 20, 1, 'Unlimited messaging to any user'),
  ('bid_high_value_projects', 40, 3, 'Bid on projects over $500'),
  ('post_projects', 10, 0, 'Post projects to the marketplace'),
  ('instant_messaging', 30, 2, 'Message users without connection'),
  ('grant_applications', 50, 5, 'Apply for institutional grants');

-- Function to calculate weighted trust score
CREATE OR REPLACE FUNCTION public.calculate_trust_score(p_user_id UUID)
RETURNS NUMERIC(5,2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_components trust_score_components%ROWTYPE;
  v_delivery NUMERIC := 0;
  v_financial NUMERIC := 0;
  v_collaboration NUMERIC := 0;
  v_institutional NUMERIC := 0;
  v_consistency NUMERIC := 0;
  v_total NUMERIC := 0;
  v_penalty_deduction NUMERIC := 0;
BEGIN
  -- Get or create components
  SELECT * INTO v_components FROM trust_score_components WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO trust_score_components (user_id) VALUES (p_user_id);
    RETURN 0;
  END IF;
  
  -- 1. DELIVERY SCORE (40% weight) - Failures hurt more than success helps
  v_delivery := GREATEST(0, LEAST(100, 
    (v_components.projects_completed * 10) -- +10 per success
    + (v_components.partial_deliveries * 5) -- +5 per partial
    - (v_components.projects_failed * 20) -- -20 per failure (2x penalty)
    + (v_components.on_time_rate * 0.5) -- Bonus for on-time
  ));
  
  -- 2. FINANCIAL RELIABILITY (25% weight)
  v_financial := GREATEST(0, LEAST(100,
    (v_components.escrow_releases_successful * 8) -- +8 per release
    - (v_components.disputes_raised * 5) -- -5 per dispute raised
    - (v_components.disputes_lost * 25) -- -25 per dispute lost (major)
    - (v_components.refunds_issued * 10) -- -10 per refund
    - (v_components.escrow_cancellations * 15) -- -15 per cancellation
  ));
  
  -- 3. COLLABORATION QUALITY (15% weight)
  v_collaboration := GREATEST(0, LEAST(100,
    COALESCE(v_components.avg_peer_rating * 20, 0) -- Up to 100 from 5-star ratings
    + (v_components.repeat_collaborations * 5) -- +5 per repeat
    - (v_components.abandoned_collaborations * 30) -- -30 per abandon (severe)
  ));
  
  -- 4. INSTITUTIONAL CONFIDENCE (10% weight)
  v_institutional := GREATEST(0, LEAST(100,
    (v_components.verifications_count * 20) -- +20 per verification
    + (v_components.institutional_affiliations * 10)
    + (v_components.grants_executed * 15)
    - (v_components.institutional_disputes * 25)
  ));
  
  -- 5. TIME & CONSISTENCY (10% weight)
  v_consistency := GREATEST(0, LEAST(100,
    LEAST(v_components.active_months * 5, 50) -- Cap at 50 from longevity
    - LEAST(v_components.longest_inactive_days / 10, 30) -- Penalty for long gaps
    - (v_components.trust_volatility * 10) -- Penalty for instability
  ));
  
  -- Calculate penalty deductions from hard penalties
  SELECT COALESCE(SUM(penalty_points), 0) INTO v_penalty_deduction
  FROM trust_hard_penalties
  WHERE user_id = p_user_id AND is_active = true;
  
  -- WEIGHTED TOTAL (5-dimension formula)
  v_total := (v_delivery * 0.40)  -- 40% Delivery
           + (v_financial * 0.25)  -- 25% Financial
           + (v_collaboration * 0.15)  -- 15% Collaboration
           + (v_institutional * 0.10)  -- 10% Institutional
           + (v_consistency * 0.10);  -- 10% Consistency
  
  -- Apply hard penalties
  v_total := GREATEST(0, v_total - v_penalty_deduction);
  
  -- Update components with computed scores
  UPDATE trust_score_components SET
    delivery_score = v_delivery,
    financial_score = v_financial,
    collaboration_score = v_collaboration,
    institutional_score = v_institutional,
    consistency_score = v_consistency,
    total_trust_score = v_total,
    computed_at = now()
  WHERE user_id = p_user_id;
  
  -- Also update user_trust_profiles for backward compatibility
  UPDATE user_trust_profiles SET
    trust_score = v_total::INTEGER,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN v_total;
END;
$$;

-- Function to check if user passes access gate
CREATE OR REPLACE FUNCTION public.check_feature_access(p_user_id UUID, p_feature_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gate feature_access_gates%ROWTYPE;
  v_trust_score NUMERIC;
  v_projects_completed INTEGER;
  v_account_age_days INTEGER;
  v_has_verification BOOLEAN;
  v_has_escrow_history BOOLEAN;
  v_disputes_count INTEGER;
BEGIN
  -- Get gate requirements
  SELECT * INTO v_gate FROM feature_access_gates 
  WHERE feature_name = p_feature_name AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN true; -- No gate = access granted
  END IF;
  
  -- Get user stats
  SELECT total_trust_score, projects_completed INTO v_trust_score, v_projects_completed
  FROM trust_score_components WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    v_trust_score := 0;
    v_projects_completed := 0;
  END IF;
  
  -- Account age
  SELECT EXTRACT(DAY FROM now() - created_at)::INTEGER INTO v_account_age_days
  FROM profiles WHERE id = p_user_id;
  
  -- Verification status
  SELECT (is_verified_student OR is_verified_researcher OR is_verified_partner) INTO v_has_verification
  FROM user_trust_profiles WHERE user_id = p_user_id;
  
  -- Escrow history
  SELECT EXISTS(SELECT 1 FROM accountability_records WHERE executor_id = p_user_id OR initiator_id = p_user_id) INTO v_has_escrow_history;
  
  -- Disputes count
  SELECT COALESCE(disputes_raised, 0) INTO v_disputes_count
  FROM trust_score_components WHERE user_id = p_user_id;
  
  -- Check all requirements
  IF v_trust_score < v_gate.minimum_trust_score THEN RETURN false; END IF;
  IF v_projects_completed < v_gate.minimum_projects_completed THEN RETURN false; END IF;
  IF COALESCE(v_account_age_days, 0) < v_gate.minimum_account_age_days THEN RETURN false; END IF;
  IF v_gate.requires_verification AND NOT COALESCE(v_has_verification, false) THEN RETURN false; END IF;
  IF v_gate.requires_escrow_history AND NOT v_has_escrow_history THEN RETURN false; END IF;
  IF v_gate.max_disputes_allowed IS NOT NULL AND v_disputes_count > v_gate.max_disputes_allowed THEN RETURN false; END IF;
  
  RETURN true;
END;
$$;

-- Function to apply trust decay
CREATE OR REPLACE FUNCTION public.apply_trust_decay(p_user_id UUID, p_days_inactive INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_score NUMERIC;
  v_decay_rate NUMERIC := 0.02; -- 2% decay per 30 days
  v_decay_amount NUMERIC;
  v_new_score NUMERIC;
BEGIN
  SELECT total_trust_score INTO v_current_score
  FROM trust_score_components WHERE user_id = p_user_id;
  
  IF NOT FOUND OR v_current_score <= 0 THEN RETURN; END IF;
  
  -- Calculate decay: 2% per 30 days of inactivity
  v_decay_amount := v_current_score * v_decay_rate * (p_days_inactive / 30.0);
  v_new_score := GREATEST(0, v_current_score - v_decay_amount);
  
  -- Log the decay
  INSERT INTO trust_decay_log (user_id, decay_amount, decay_reason, days_inactive, previous_score, new_score)
  VALUES (p_user_id, v_decay_amount, 'inactivity', p_days_inactive, v_current_score, v_new_score);
  
  -- Apply decay
  UPDATE trust_score_components SET
    total_trust_score = v_new_score,
    last_decay_applied_at = now()
  WHERE user_id = p_user_id;
  
  -- Update user_trust_profiles
  UPDATE user_trust_profiles SET trust_score = v_new_score::INTEGER, updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Function to get collaboration dampening factor
CREATE OR REPLACE FUNCTION public.get_collaboration_dampening(p_user_a UUID, p_user_b UUID)
RETURNS NUMERIC(4,3)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cooldown collaboration_cooldowns%ROWTYPE;
  v_factor NUMERIC := 1.0;
BEGIN
  -- Order IDs consistently
  SELECT * INTO v_cooldown FROM collaboration_cooldowns
  WHERE (user_a_id = LEAST(p_user_a, p_user_b) AND user_b_id = GREATEST(p_user_a, p_user_b));
  
  IF NOT FOUND THEN
    -- First collaboration = full credit
    INSERT INTO collaboration_cooldowns (user_a_id, user_b_id)
    VALUES (LEAST(p_user_a, p_user_b), GREATEST(p_user_a, p_user_b));
    RETURN 1.0;
  END IF;
  
  -- Diminishing returns: 1.0 -> 0.5 -> 0.25 -> 0.1 for repeated collaborations
  v_factor := GREATEST(0.1, 1.0 / POWER(2, v_cooldown.collaboration_count - 1));
  
  -- Update cooldown record
  UPDATE collaboration_cooldowns SET
    collaboration_count = collaboration_count + 1,
    trust_dampening_factor = v_factor,
    last_collaboration_at = now(),
    updated_at = now()
  WHERE id = v_cooldown.id;
  
  RETURN v_factor;
END;
$$;