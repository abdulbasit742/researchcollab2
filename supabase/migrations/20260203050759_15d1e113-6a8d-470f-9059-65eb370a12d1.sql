-- Phase 3: Escrow & Payment Hardening

-- Extend milestones table
ALTER TABLE public.milestones
ADD COLUMN IF NOT EXISTS auto_release_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS partial_release_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS approval_reminder_sent BOOLEAN DEFAULT false;

-- Extend disputes table
ALTER TABLE public.disputes
ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 1 CHECK (escalation_level >= 1 AND escalation_level <= 3),
ADD COLUMN IF NOT EXISTS auto_mediation_result TEXT,
ADD COLUMN IF NOT EXISTS arbitration_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS evidence_files JSONB DEFAULT '[]';

-- Extend wallets table
ALTER TABLE public.wallets
ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS frozen_reason TEXT,
ADD COLUMN IF NOT EXISTS fraud_flags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100);

-- Create platform_fee_rules table
CREATE TABLE public.platform_fee_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('student', 'researcher', 'org', 'all')),
  fee_percentage NUMERIC(5,2) NOT NULL CHECK (fee_percentage >= 0 AND fee_percentage <= 50),
  min_fee NUMERIC DEFAULT 0,
  max_fee NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, is_active) -- Only one active rule per role
);

-- Insert default fee rules
INSERT INTO public.platform_fee_rules (role, fee_percentage, min_fee) VALUES
('all', 10, 100),
('student', 8, 50),
('researcher', 12, 200);

-- Create fraud_detection_logs table
CREATE TABLE public.fraud_detection_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_id UUID REFERENCES wallets(id),
  detection_type TEXT NOT NULL CHECK (detection_type IN ('rapid_withdrawal', 'large_movement', 'account_age_mismatch', 'pattern_anomaly', 'manual_flag')),
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB DEFAULT '{}',
  reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_fee_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_detection_logs ENABLE ROW LEVEL SECURITY;

-- RLS for platform_fee_rules
CREATE POLICY "Anyone can view active fee rules"
ON public.platform_fee_rules FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage fee rules"
ON public.platform_fee_rules FOR ALL
USING (is_admin(auth.uid()));

-- RLS for fraud_detection_logs
CREATE POLICY "Admins can view fraud logs"
ON public.fraud_detection_logs FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert fraud logs"
ON public.fraud_detection_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update fraud logs"
ON public.fraud_detection_logs FOR UPDATE
USING (is_admin(auth.uid()));

-- Function to get applicable fee for a user
CREATE OR REPLACE FUNCTION public.get_platform_fee(p_user_id UUID, p_amount NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_fee_rule platform_fee_rules%ROWTYPE;
  v_fee NUMERIC;
BEGIN
  -- Get user's role
  SELECT role INTO v_role FROM profiles WHERE id = p_user_id;
  
  -- Try to get role-specific rule first
  SELECT * INTO v_fee_rule FROM platform_fee_rules 
  WHERE role = v_role AND is_active = true
  LIMIT 1;
  
  -- Fall back to 'all' rule
  IF v_fee_rule.id IS NULL THEN
    SELECT * INTO v_fee_rule FROM platform_fee_rules 
    WHERE role = 'all' AND is_active = true
    LIMIT 1;
  END IF;
  
  -- Calculate fee
  v_fee := p_amount * (v_fee_rule.fee_percentage / 100);
  
  -- Apply min/max
  IF v_fee < COALESCE(v_fee_rule.min_fee, 0) THEN
    v_fee := v_fee_rule.min_fee;
  END IF;
  IF v_fee_rule.max_fee IS NOT NULL AND v_fee > v_fee_rule.max_fee THEN
    v_fee := v_fee_rule.max_fee;
  END IF;
  
  RETURN v_fee;
END;
$$;

-- Function to detect fraud patterns
CREATE OR REPLACE FUNCTION public.check_fraud_patterns(p_wallet_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_user_profile profiles%ROWTYPE;
  v_risk_score INTEGER := 0;
  v_recent_withdrawals NUMERIC;
  v_large_transactions INTEGER;
  v_account_age_days INTEGER;
BEGIN
  SELECT * INTO v_wallet FROM wallets WHERE id = p_wallet_id;
  SELECT * INTO v_user_profile FROM profiles WHERE id = v_wallet.user_id;
  
  -- Calculate account age
  v_account_age_days := EXTRACT(DAY FROM (now() - v_user_profile.created_at));
  
  -- Check for rapid withdrawals (more than 3 in last 24h)
  SELECT COALESCE(SUM(ABS(amount)), 0) INTO v_recent_withdrawals
  FROM wallet_transactions
  WHERE wallet_id = p_wallet_id
  AND type = 'withdrawal'
  AND created_at > now() - INTERVAL '24 hours';
  
  IF v_recent_withdrawals > v_wallet.total_earned * 0.5 THEN
    v_risk_score := v_risk_score + 30;
    INSERT INTO fraud_detection_logs (user_id, wallet_id, detection_type, severity, details)
    VALUES (v_wallet.user_id, p_wallet_id, 'rapid_withdrawal', 'high', 
      jsonb_build_object('amount', v_recent_withdrawals, 'total_earned', v_wallet.total_earned));
  END IF;
  
  -- Check for large single transactions
  SELECT COUNT(*) INTO v_large_transactions
  FROM wallet_transactions
  WHERE wallet_id = p_wallet_id
  AND ABS(amount) > 100000
  AND created_at > now() - INTERVAL '7 days';
  
  IF v_large_transactions > 5 THEN
    v_risk_score := v_risk_score + 25;
    INSERT INTO fraud_detection_logs (user_id, wallet_id, detection_type, severity, details)
    VALUES (v_wallet.user_id, p_wallet_id, 'large_movement', 'medium', 
      jsonb_build_object('count', v_large_transactions));
  END IF;
  
  -- Check account age vs transaction volume
  IF v_account_age_days < 30 AND v_wallet.total_earned > 500000 THEN
    v_risk_score := v_risk_score + 40;
    INSERT INTO fraud_detection_logs (user_id, wallet_id, detection_type, severity, details)
    VALUES (v_wallet.user_id, p_wallet_id, 'account_age_mismatch', 'critical', 
      jsonb_build_object('account_age_days', v_account_age_days, 'total_earned', v_wallet.total_earned));
  END IF;
  
  -- Update wallet risk score
  UPDATE wallets
  SET risk_score = LEAST(v_risk_score, 100),
      fraud_flags = CASE WHEN v_risk_score > 0 THEN 
        fraud_flags || jsonb_build_object('last_check', now(), 'score', v_risk_score)
      ELSE fraud_flags END,
      updated_at = now()
  WHERE id = p_wallet_id;
  
  RETURN v_risk_score;
END;
$$;

-- Function to freeze/unfreeze wallet
CREATE OR REPLACE FUNCTION public.admin_freeze_wallet(
  p_wallet_id UUID,
  p_freeze BOOLEAN,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can freeze wallets';
  END IF;
  
  SELECT * INTO v_wallet FROM wallets WHERE id = p_wallet_id;
  
  UPDATE wallets
  SET is_frozen = p_freeze,
      frozen_reason = CASE WHEN p_freeze THEN p_reason ELSE NULL END,
      updated_at = now()
  WHERE id = p_wallet_id;
  
  -- Log the action
  INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), CASE WHEN p_freeze THEN 'freeze_wallet' ELSE 'unfreeze_wallet' END, 
          'wallet', p_wallet_id, jsonb_build_object('reason', p_reason, 'user_id', v_wallet.user_id));
  
  -- Notify user
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (v_wallet.user_id, 
          CASE WHEN p_freeze THEN 'wallet_frozen' ELSE 'wallet_unfrozen' END,
          CASE WHEN p_freeze THEN 'Wallet Frozen' ELSE 'Wallet Unfrozen' END,
          CASE WHEN p_freeze THEN 'Your wallet has been temporarily frozen. Please contact support.' 
               ELSE 'Your wallet has been unfrozen and is now active.' END,
          jsonb_build_object('reason', p_reason));
  
  RETURN true;
END;
$$;

-- Trigger to set auto-release date on milestone submission
CREATE OR REPLACE FUNCTION public.set_milestone_auto_release()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status != 'submitted') THEN
    NEW.auto_release_at := now() + INTERVAL '7 days';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_milestone_auto_release ON milestones;
CREATE TRIGGER trigger_milestone_auto_release
BEFORE UPDATE ON milestones
FOR EACH ROW
EXECUTE FUNCTION set_milestone_auto_release();

-- Function for partial milestone release
CREATE OR REPLACE FUNCTION public.partial_release_milestone(
  p_milestone_id UUID,
  p_amount NUMERIC,
  p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_milestone milestones%ROWTYPE;
  v_offer offers%ROWTYPE;
  v_remaining NUMERIC;
BEGIN
  SELECT * INTO v_milestone FROM milestones WHERE id = p_milestone_id;
  SELECT * INTO v_offer FROM offers WHERE id = v_milestone.offer_id;
  
  -- Only participants or admins can do partial release
  IF NOT (auth.uid() = v_offer.recipient_id OR is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Only the client or admin can approve partial release';
  END IF;
  
  v_remaining := v_milestone.amount - COALESCE(v_milestone.partial_release_amount, 0);
  
  IF p_amount > v_remaining THEN
    RAISE EXCEPTION 'Release amount exceeds remaining milestone amount';
  END IF;
  
  -- Update milestone
  UPDATE milestones
  SET partial_release_amount = COALESCE(partial_release_amount, 0) + p_amount,
      updated_at = now()
  WHERE id = p_milestone_id;
  
  -- TODO: Trigger actual fund transfer via wallet transaction
  -- This would integrate with the existing wallet system
  
  -- Log the action
  INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), 'partial_release', 'milestone', p_milestone_id, 
          jsonb_build_object('amount', p_amount, 'reason', p_reason));
  
  RETURN true;
END;
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fraud_logs_user ON fraud_detection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_severity ON fraud_detection_logs(severity) WHERE reviewed = false;
CREATE INDEX IF NOT EXISTS idx_milestones_auto_release ON milestones(auto_release_at) WHERE status = 'submitted';
CREATE INDEX IF NOT EXISTS idx_wallets_frozen ON wallets(is_frozen) WHERE is_frozen = true;
CREATE INDEX IF NOT EXISTS idx_wallets_risk ON wallets(risk_score) WHERE risk_score > 50;