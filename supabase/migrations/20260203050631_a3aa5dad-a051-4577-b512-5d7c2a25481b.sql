-- Phase 1: Advanced Trust & Reputation Engine
-- Create trust tier enum
CREATE TYPE public.trust_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');

-- Extend user_trust_profiles with new columns
ALTER TABLE public.user_trust_profiles
ADD COLUMN IF NOT EXISTS trust_tier trust_tier DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS decay_applied_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS financial_reliability_score INTEGER DEFAULT 50 CHECK (financial_reliability_score >= 0 AND financial_reliability_score <= 100),
ADD COLUMN IF NOT EXISTS dispute_rate NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_milestone_approval_hours NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS frozen_reason TEXT,
ADD COLUMN IF NOT EXISTS frozen_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS frozen_by UUID;

-- Create trust_score_history table
CREATE TABLE public.trust_score_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  previous_score INTEGER NOT NULL,
  new_score INTEGER NOT NULL,
  change_reason TEXT NOT NULL,
  change_source TEXT NOT NULL DEFAULT 'system' CHECK (change_source IN ('system', 'admin', 'project', 'review', 'decay')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trust_tier_requirements table
CREATE TABLE public.trust_tier_requirements (
  tier TEXT PRIMARY KEY CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  min_trust_score INTEGER NOT NULL,
  min_projects_completed INTEGER NOT NULL DEFAULT 0,
  requires_verification BOOLEAN NOT NULL DEFAULT false,
  max_budget_access NUMERIC DEFAULT NULL,
  org_access_allowed BOOLEAN NOT NULL DEFAULT false,
  priority_support BOOLEAN NOT NULL DEFAULT false,
  description TEXT
);

-- Insert default tier requirements
INSERT INTO public.trust_tier_requirements (tier, min_trust_score, min_projects_completed, requires_verification, max_budget_access, org_access_allowed, priority_support, description) VALUES
('bronze', 0, 0, false, 50000, false, false, 'Entry tier for new users'),
('silver', 25, 3, false, 200000, false, false, 'Established users with some history'),
('gold', 50, 10, true, 500000, true, false, 'Verified users with strong track record'),
('platinum', 75, 25, true, NULL, true, true, 'Top-tier trusted users with full access');

-- Enable RLS on new tables
ALTER TABLE public.trust_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_tier_requirements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trust_score_history
CREATE POLICY "Users can view their own trust history"
ON public.trust_score_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all trust history"
ON public.trust_score_history FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert trust history"
ON public.trust_score_history FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for trust_tier_requirements (public read, admin write)
CREATE POLICY "Anyone can view tier requirements"
ON public.trust_tier_requirements FOR SELECT
USING (true);

CREATE POLICY "Admins can manage tier requirements"
ON public.trust_tier_requirements FOR ALL
USING (is_admin(auth.uid()));

-- Create function to calculate dynamic trust score
CREATE OR REPLACE FUNCTION public.calculate_dynamic_trust_score(p_user_id UUID)
RETURNS TABLE (new_score INTEGER, new_tier trust_tier)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_verification_points INTEGER := 0;
  v_projects_points INTEGER := 0;
  v_delivery_points INTEGER := 0;
  v_dispute_points INTEGER := 0;
  v_financial_points INTEGER := 0;
  v_rating_points INTEGER := 0;
  v_total_score INTEGER := 0;
  v_tier trust_tier := 'bronze';
  v_old_score INTEGER := 0;
  v_trust_profile user_trust_profiles%ROWTYPE;
  v_completed_projects INTEGER := 0;
  v_disputes_count INTEGER := 0;
BEGIN
  -- Get current trust profile
  SELECT * INTO v_trust_profile FROM user_trust_profiles WHERE user_id = p_user_id;
  v_old_score := COALESCE(v_trust_profile.trust_score, 0);
  
  -- Calculate verification points (max 30)
  IF v_trust_profile.is_verified_student THEN v_verification_points := v_verification_points + 10; END IF;
  IF v_trust_profile.is_verified_researcher THEN v_verification_points := v_verification_points + 15; END IF;
  IF v_trust_profile.is_verified_partner THEN v_verification_points := v_verification_points + 5; END IF;
  
  -- Calculate completed projects points (max 20)
  v_completed_projects := COALESCE(v_trust_profile.total_projects_completed, 0);
  v_projects_points := LEAST(v_completed_projects * 2, 20);
  
  -- Calculate on-time delivery points (max 15)
  IF v_trust_profile.successful_rate IS NOT NULL THEN
    v_delivery_points := LEAST(FLOOR(v_trust_profile.successful_rate::NUMERIC * 0.15), 15);
  END IF;
  
  -- Calculate dispute penalty (max -15)
  SELECT COUNT(*) INTO v_disputes_count FROM disputes d
  JOIN milestones m ON d.milestone_id = m.id
  JOIN offers o ON m.offer_id = o.id
  WHERE (o.sender_id = p_user_id OR o.recipient_id = p_user_id)
  AND d.status IN ('open', 'escalated');
  v_dispute_points := GREATEST(-v_disputes_count * 5, -15);
  
  -- Calculate financial reliability points (max 15)
  v_financial_points := LEAST(FLOOR(COALESCE(v_trust_profile.financial_reliability_score, 50)::NUMERIC * 0.15), 15);
  
  -- Calculate rating points (will be enhanced when review system is added) (max 15)
  v_rating_points := 0; -- Placeholder for now
  
  -- Calculate total score
  v_total_score := v_verification_points + v_projects_points + v_delivery_points + v_dispute_points + v_financial_points + v_rating_points;
  v_total_score := GREATEST(0, LEAST(v_total_score, 100)); -- Clamp between 0-100
  
  -- Determine tier
  IF v_total_score >= 75 THEN v_tier := 'platinum';
  ELSIF v_total_score >= 50 THEN v_tier := 'gold';
  ELSIF v_total_score >= 25 THEN v_tier := 'silver';
  ELSE v_tier := 'bronze';
  END IF;
  
  -- Update trust profile
  UPDATE user_trust_profiles
  SET trust_score = v_total_score,
      trust_tier = v_tier,
      dispute_rate = CASE WHEN v_completed_projects > 0 THEN v_disputes_count::NUMERIC / v_completed_projects * 100 ELSE 0 END,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record history if score changed
  IF v_total_score != v_old_score THEN
    INSERT INTO trust_score_history (user_id, previous_score, new_score, change_reason, change_source, metadata)
    VALUES (p_user_id, v_old_score, v_total_score, 'Automatic recalculation', 'system', 
      jsonb_build_object(
        'verification_points', v_verification_points,
        'projects_points', v_projects_points,
        'delivery_points', v_delivery_points,
        'dispute_points', v_dispute_points,
        'financial_points', v_financial_points,
        'rating_points', v_rating_points
      ));
  END IF;
  
  new_score := v_total_score;
  new_tier := v_tier;
  RETURN NEXT;
END;
$$;

-- Create trigger function to recalculate trust on milestone completion
CREATE OR REPLACE FUNCTION public.on_milestone_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offer offers%ROWTYPE;
BEGIN
  -- Only act on milestone approval
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    SELECT * INTO v_offer FROM offers WHERE id = NEW.offer_id;
    
    -- Update approval time tracking
    IF NEW.submitted_at IS NOT NULL THEN
      UPDATE user_trust_profiles
      SET avg_milestone_approval_hours = COALESCE(
        (avg_milestone_approval_hours * total_projects_completed + 
         EXTRACT(EPOCH FROM (now() - NEW.submitted_at)) / 3600) / 
        NULLIF(total_projects_completed + 1, 0),
        EXTRACT(EPOCH FROM (now() - NEW.submitted_at)) / 3600
      ),
      last_activity_at = now()
      WHERE user_id IN (v_offer.sender_id, v_offer.recipient_id);
    END IF;
    
    -- Recalculate trust scores for both parties
    PERFORM calculate_dynamic_trust_score(v_offer.sender_id);
    PERFORM calculate_dynamic_trust_score(v_offer.recipient_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_milestone_status_change ON milestones;
CREATE TRIGGER trigger_milestone_status_change
AFTER UPDATE ON milestones
FOR EACH ROW
EXECUTE FUNCTION on_milestone_status_change();

-- Admin function to freeze/unfreeze trust profile
CREATE OR REPLACE FUNCTION public.admin_freeze_trust_profile(
  p_user_id UUID,
  p_freeze BOOLEAN,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can freeze trust profiles';
  END IF;
  
  UPDATE user_trust_profiles
  SET is_frozen = p_freeze,
      frozen_reason = CASE WHEN p_freeze THEN p_reason ELSE NULL END,
      frozen_at = CASE WHEN p_freeze THEN now() ELSE NULL END,
      frozen_by = CASE WHEN p_freeze THEN auth.uid() ELSE NULL END,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the action
  INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), CASE WHEN p_freeze THEN 'freeze_trust' ELSE 'unfreeze_trust' END, 
          'user', p_user_id, jsonb_build_object('reason', p_reason));
  
  RETURN true;
END;
$$;

-- Admin function to manually override trust score
CREATE OR REPLACE FUNCTION public.admin_override_trust_score(
  p_user_id UUID,
  p_new_score INTEGER,
  p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_score INTEGER;
  v_new_tier trust_tier;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can override trust scores';
  END IF;
  
  IF p_new_score < 0 OR p_new_score > 100 THEN
    RAISE EXCEPTION 'Trust score must be between 0 and 100';
  END IF;
  
  -- Get current score
  SELECT trust_score INTO v_old_score FROM user_trust_profiles WHERE user_id = p_user_id;
  
  -- Determine new tier
  IF p_new_score >= 75 THEN v_new_tier := 'platinum';
  ELSIF p_new_score >= 50 THEN v_new_tier := 'gold';
  ELSIF p_new_score >= 25 THEN v_new_tier := 'silver';
  ELSE v_new_tier := 'bronze';
  END IF;
  
  -- Update profile
  UPDATE user_trust_profiles
  SET trust_score = p_new_score,
      trust_tier = v_new_tier,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record history
  INSERT INTO trust_score_history (user_id, previous_score, new_score, change_reason, change_source)
  VALUES (p_user_id, COALESCE(v_old_score, 0), p_new_score, p_reason, 'admin');
  
  -- Log the action
  INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), 'override_trust_score', 'user', p_user_id, 
          jsonb_build_object('old_score', v_old_score, 'new_score', p_new_score, 'reason', p_reason));
  
  RETURN true;
END;
$$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_trust_score_history_user_created 
ON trust_score_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_trust_profiles_tier 
ON user_trust_profiles(trust_tier);