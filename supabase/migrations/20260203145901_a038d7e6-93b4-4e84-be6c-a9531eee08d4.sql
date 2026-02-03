-- =====================================================
-- TRUST-GATED AFFILIATE SYSTEM
-- Outcome-based, institution-safe, anti-spam affiliate infrastructure
-- =====================================================

-- Enum for affiliate lifecycle states
CREATE TYPE public.affiliate_lifecycle_status AS ENUM (
  'not_applied',
  'applied',
  'under_review',
  'approved',
  'active',
  'paused',
  'suspended',
  'revoked'
);

-- Enum for affiliate type
CREATE TYPE public.affiliate_type AS ENUM (
  'standard',
  'institutional',
  'ambassador'
);

-- Enum for violation severity
CREATE TYPE public.violation_severity AS ENUM (
  'warning',
  'minor',
  'major',
  'critical'
);

-- Enum for referral outcome type
CREATE TYPE public.referral_outcome_type AS ENUM (
  'signup',
  'onboarding_complete',
  'first_project_completed',
  'first_subscription',
  'first_earning',
  'milestone_delivered',
  'tool_purchase',
  'bundle_purchase'
);

-- =====================================================
-- AFFILIATE APPLICATIONS TABLE
-- Trust-gated application process
-- =====================================================
CREATE TABLE public.affiliate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Application details
  motivation TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  value_proposition TEXT NOT NULL,
  acknowledged_rules BOOLEAN NOT NULL DEFAULT false,
  
  -- Eligibility snapshot at application time
  trust_score_at_application INTEGER NOT NULL,
  trust_tier_at_application TEXT NOT NULL,
  account_age_days INTEGER NOT NULL,
  has_completed_outcomes BOOLEAN NOT NULL DEFAULT false,
  has_unresolved_disputes BOOLEAN NOT NULL DEFAULT false,
  has_spam_flags BOOLEAN NOT NULL DEFAULT false,
  
  -- Application state
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Affiliate type requested
  affiliate_type affiliate_type NOT NULL DEFAULT 'standard',
  institution_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- =====================================================
-- UPDATE AFFILIATES TABLE
-- Add lifecycle status and trust-linked fields
-- =====================================================
ALTER TABLE public.affiliates 
  ADD COLUMN IF NOT EXISTS lifecycle_status affiliate_lifecycle_status DEFAULT 'not_applied',
  ADD COLUMN IF NOT EXISTS affiliate_type affiliate_type DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS trust_score_at_activation INTEGER,
  ADD COLUMN IF NOT EXISTS current_trust_weight NUMERIC(3,2) DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS base_commission_rate NUMERIC(5,2) DEFAULT 10.00,
  ADD COLUMN IF NOT EXISTS effective_commission_rate NUMERIC(5,2) GENERATED ALWAYS AS (base_commission_rate * current_trust_weight) STORED,
  ADD COLUMN IF NOT EXISTS institution_id UUID,
  ADD COLUMN IF NOT EXISTS total_outcomes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS outcome_conversion_rate NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_quality_score INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS violation_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_violation_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS paused_reason TEXT,
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS revoked_reason TEXT,
  ADD COLUMN IF NOT EXISTS application_id UUID;

-- =====================================================
-- AFFILIATE REFERRAL OUTCOMES TABLE
-- Track meaningful conversions, not just clicks
-- =====================================================
CREATE TABLE public.affiliate_referral_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Outcome tracking
  outcome_type referral_outcome_type NOT NULL,
  outcome_value NUMERIC(12,2) DEFAULT 0,
  
  -- Commission calculation
  commission_earned NUMERIC(12,2) DEFAULT 0,
  commission_status TEXT NOT NULL DEFAULT 'pending' CHECK (commission_status IN ('pending', 'approved', 'released', 'reversed')),
  
  -- Quality metrics
  referred_user_trust_score INTEGER,
  referred_user_retained BOOLEAN DEFAULT true,
  retention_days INTEGER DEFAULT 0,
  
  -- Context
  related_entity_type TEXT,
  related_entity_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  reversed_at TIMESTAMP WITH TIME ZONE,
  reversal_reason TEXT
);

-- =====================================================
-- AFFILIATE VIOLATIONS TABLE
-- Anti-spam enforcement tracking
-- =====================================================
CREATE TABLE public.affiliate_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  
  -- Violation details
  violation_type TEXT NOT NULL,
  severity violation_severity NOT NULL DEFAULT 'warning',
  description TEXT NOT NULL,
  evidence JSONB,
  
  -- Impact
  trust_penalty INTEGER DEFAULT 0,
  commission_penalty_percent NUMERIC(5,2) DEFAULT 0,
  resulted_in_pause BOOLEAN DEFAULT false,
  resulted_in_revocation BOOLEAN DEFAULT false,
  
  -- Resolution
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'appealed', 'resolved', 'dismissed')),
  appeal_text TEXT,
  resolution_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reported_by UUID,
  auto_detected BOOLEAN DEFAULT false
);

-- =====================================================
-- AFFILIATE ELIGIBILITY RULES TABLE (ADMIN CONFIGURABLE)
-- =====================================================
CREATE TABLE public.affiliate_eligibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  rule_key TEXT NOT NULL UNIQUE,
  rule_value INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default eligibility rules
INSERT INTO public.affiliate_eligibility_rules (rule_name, rule_key, rule_value, description) VALUES
  ('Minimum Trust Score', 'min_trust_score', 40, 'Minimum trust score required to apply'),
  ('Minimum Account Age (Days)', 'min_account_age_days', 14, 'Account must be at least this many days old'),
  ('Required Outcomes', 'min_outcomes_required', 1, 'At least one completed project, earning, or subscription'),
  ('Max Unresolved Disputes', 'max_unresolved_disputes', 0, 'Must have zero unresolved disputes to apply'),
  ('Spam Flag Threshold', 'max_spam_flags', 0, 'Must have zero spam flags to apply');

-- =====================================================
-- COMMISSION TIERS TABLE (Trust-linked)
-- =====================================================
CREATE TABLE public.affiliate_commission_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL,
  min_trust_score INTEGER NOT NULL,
  max_trust_score INTEGER,
  trust_weight NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  base_commission_rate NUMERIC(5,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default commission tiers
INSERT INTO public.affiliate_commission_tiers (tier_name, min_trust_score, max_trust_score, trust_weight, base_commission_rate, description) VALUES
  ('Bronze Affiliate', 40, 54, 0.70, 10.00, 'Entry-level affiliates with basic trust'),
  ('Silver Affiliate', 55, 69, 0.85, 12.00, 'Established affiliates with good track record'),
  ('Gold Affiliate', 70, 84, 1.00, 15.00, 'High-trust affiliates with proven outcomes'),
  ('Platinum Affiliate', 85, 100, 1.20, 18.00, 'Elite affiliates with exceptional performance'),
  ('Institutional Partner', 70, 100, 1.30, 20.00, 'Verified institutional representatives');

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE public.affiliate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referral_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commission_tiers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Affiliate Applications: Users can view/create their own, admins can view all
CREATE POLICY "Users can view own application" ON public.affiliate_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own application" ON public.affiliate_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON public.affiliate_applications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications" ON public.affiliate_applications
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Affiliate Outcomes: Affiliates can view their own outcomes
CREATE POLICY "Affiliates can view own outcomes" ON public.affiliate_referral_outcomes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.affiliates 
      WHERE affiliates.id = affiliate_referral_outcomes.affiliate_id 
      AND affiliates.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage outcomes" ON public.affiliate_referral_outcomes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Affiliate Violations: Affiliates can view their own violations
CREATE POLICY "Affiliates can view own violations" ON public.affiliate_violations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.affiliates 
      WHERE affiliates.id = affiliate_violations.affiliate_id 
      AND affiliates.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage violations" ON public.affiliate_violations
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Eligibility Rules: Public read, admin write
CREATE POLICY "Anyone can view eligibility rules" ON public.affiliate_eligibility_rules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage eligibility rules" ON public.affiliate_eligibility_rules
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Commission Tiers: Public read
CREATE POLICY "Anyone can view commission tiers" ON public.affiliate_commission_tiers
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage commission tiers" ON public.affiliate_commission_tiers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- HELPER FUNCTION: Check Affiliate Eligibility
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_affiliate_eligibility(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trust_profile RECORD;
  v_account_age INTEGER;
  v_outcomes_count INTEGER;
  v_unresolved_disputes INTEGER;
  v_spam_flags INTEGER;
  v_rules RECORD;
  v_eligible BOOLEAN := true;
  v_reasons JSONB := '[]'::JSONB;
BEGIN
  -- Get user trust profile
  SELECT * INTO v_trust_profile FROM user_trust_profiles WHERE user_id = p_user_id;
  
  IF v_trust_profile IS NULL THEN
    RETURN jsonb_build_object('eligible', false, 'reasons', '["No trust profile found"]'::JSONB);
  END IF;
  
  -- Calculate account age
  SELECT EXTRACT(DAY FROM (now() - created_at))::INTEGER INTO v_account_age
  FROM profiles WHERE id = p_user_id;
  
  -- Count completed outcomes (projects, earnings)
  SELECT COUNT(*) INTO v_outcomes_count FROM (
    SELECT 1 FROM offers WHERE posted_by = p_user_id AND status = 'completed'
    UNION ALL
    SELECT 1 FROM milestones m 
    JOIN offers o ON m.offer_id = o.id 
    WHERE o.accepted_freelancer_id = p_user_id AND m.status = 'approved'
  ) outcomes;
  
  -- Count unresolved disputes
  SELECT COUNT(*) INTO v_unresolved_disputes 
  FROM disputes 
  WHERE (raised_by = p_user_id OR against = p_user_id) 
  AND status NOT IN ('resolved', 'closed', 'dismissed');
  
  -- Check spam flags (from feed_reports or similar)
  SELECT COUNT(*) INTO v_spam_flags
  FROM feed_reports
  WHERE reported_by = p_user_id AND outcome = 'spam_confirmed';
  
  -- Check each rule
  FOR v_rules IN SELECT * FROM affiliate_eligibility_rules WHERE is_active = true LOOP
    CASE v_rules.rule_key
      WHEN 'min_trust_score' THEN
        IF v_trust_profile.trust_score < v_rules.rule_value THEN
          v_eligible := false;
          v_reasons := v_reasons || jsonb_build_object('rule', v_rules.rule_name, 'required', v_rules.rule_value, 'current', v_trust_profile.trust_score);
        END IF;
      WHEN 'min_account_age_days' THEN
        IF v_account_age < v_rules.rule_value THEN
          v_eligible := false;
          v_reasons := v_reasons || jsonb_build_object('rule', v_rules.rule_name, 'required', v_rules.rule_value, 'current', v_account_age);
        END IF;
      WHEN 'min_outcomes_required' THEN
        IF v_outcomes_count < v_rules.rule_value THEN
          v_eligible := false;
          v_reasons := v_reasons || jsonb_build_object('rule', v_rules.rule_name, 'required', v_rules.rule_value, 'current', v_outcomes_count);
        END IF;
      WHEN 'max_unresolved_disputes' THEN
        IF v_unresolved_disputes > v_rules.rule_value THEN
          v_eligible := false;
          v_reasons := v_reasons || jsonb_build_object('rule', v_rules.rule_name, 'max_allowed', v_rules.rule_value, 'current', v_unresolved_disputes);
        END IF;
      WHEN 'max_spam_flags' THEN
        IF v_spam_flags > v_rules.rule_value THEN
          v_eligible := false;
          v_reasons := v_reasons || jsonb_build_object('rule', v_rules.rule_name, 'max_allowed', v_rules.rule_value, 'current', v_spam_flags);
        END IF;
    END CASE;
  END LOOP;
  
  RETURN jsonb_build_object(
    'eligible', v_eligible,
    'reasons', v_reasons,
    'snapshot', jsonb_build_object(
      'trust_score', v_trust_profile.trust_score,
      'trust_tier', v_trust_profile.trust_tier,
      'account_age_days', v_account_age,
      'outcomes_count', v_outcomes_count,
      'unresolved_disputes', v_unresolved_disputes,
      'spam_flags', v_spam_flags
    )
  );
END;
$$;

-- =====================================================
-- FUNCTION: Calculate Trust-Weighted Commission Rate
-- =====================================================
CREATE OR REPLACE FUNCTION public.calculate_affiliate_commission_rate(p_affiliate_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_affiliate RECORD;
  v_user_trust INTEGER;
  v_tier RECORD;
  v_commission_rate NUMERIC;
BEGIN
  -- Get affiliate
  SELECT * INTO v_affiliate FROM affiliates WHERE id = p_affiliate_id;
  IF v_affiliate IS NULL THEN RETURN 0; END IF;
  
  -- Get current user trust score
  SELECT trust_score INTO v_user_trust FROM user_trust_profiles WHERE user_id = v_affiliate.user_id;
  IF v_user_trust IS NULL THEN v_user_trust := 0; END IF;
  
  -- Find matching tier
  SELECT * INTO v_tier FROM affiliate_commission_tiers 
  WHERE min_trust_score <= v_user_trust 
  AND (max_trust_score IS NULL OR max_trust_score >= v_user_trust)
  AND is_active = true
  ORDER BY min_trust_score DESC
  LIMIT 1;
  
  IF v_tier IS NULL THEN
    RETURN 10.00; -- Default rate
  END IF;
  
  -- Calculate rate with trust weight
  v_commission_rate := v_tier.base_commission_rate * v_tier.trust_weight;
  
  -- Apply violation penalty if any
  IF v_affiliate.violation_count > 0 THEN
    v_commission_rate := v_commission_rate * (1 - (v_affiliate.violation_count * 0.05));
  END IF;
  
  RETURN GREATEST(v_commission_rate, 5.00); -- Minimum 5%
END;
$$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_user_id ON public.affiliate_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_status ON public.affiliate_applications(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referral_outcomes_affiliate_id ON public.affiliate_referral_outcomes(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referral_outcomes_outcome_type ON public.affiliate_referral_outcomes(outcome_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_violations_affiliate_id ON public.affiliate_violations(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_violations_status ON public.affiliate_violations(status);