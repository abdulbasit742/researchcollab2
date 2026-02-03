-- Phase 7-8: UX Optimization & Monetization Expansion (Fixed)

-- Create subscription_tiers table
CREATE TABLE public.subscription_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (name IN ('Free', 'Pro', 'Elite')),
  price_monthly NUMERIC NOT NULL DEFAULT 0,
  price_yearly NUMERIC NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]',
  max_projects_month INTEGER,
  max_bids_month INTEGER,
  priority_support BOOLEAN NOT NULL DEFAULT false,
  featured_profile BOOLEAN NOT NULL DEFAULT false,
  ai_credits_included INTEGER NOT NULL DEFAULT 0,
  badge_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (name, price_monthly, price_yearly, features, max_projects_month, max_bids_month, priority_support, featured_profile, ai_credits_included, badge_name) VALUES
('Free', 0, 0, '["Basic project access", "5 bids per month", "Standard support", "Basic profile"]'::jsonb, 3, 5, false, false, 5, NULL),
('Pro', 2999, 29990, '["Unlimited projects", "50 bids per month", "Priority support", "Featured profile badge", "AI insights", "Advanced analytics"]'::jsonb, NULL, 50, true, true, 100, 'Pro Member'),
('Elite', 7999, 79990, '["Everything in Pro", "Unlimited bids", "Dedicated support", "Premium badge", "Priority matching", "Custom AI assistance", "API access"]'::jsonb, NULL, NULL, true, true, 500, 'Elite Member');

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tier_id UUID NOT NULL REFERENCES subscription_tiers(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  payment_method_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create featured_listings table
CREATE TABLE public.featured_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('project', 'profile')),
  listing_id UUID NOT NULL,
  user_id UUID NOT NULL,
  boost_level INTEGER NOT NULL DEFAULT 1 CHECK (boost_level >= 1 AND boost_level <= 3),
  amount_paid NUMERIC NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_credit_packs table
CREATE TABLE public.ai_credit_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  bonus_credits INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default AI credit packs
INSERT INTO public.ai_credit_packs (name, credits, price, bonus_credits) VALUES
('Starter Pack', 50, 499, 0),
('Value Pack', 150, 1299, 20),
('Pro Pack', 500, 3999, 100),
('Enterprise Pack', 2000, 14999, 500);

-- Create user_ai_credits table
CREATE TABLE public.user_ai_credits (
  user_id UUID PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_used INTEGER NOT NULL DEFAULT 0,
  last_refill_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_drafts table for draft saving
CREATE TABLE public.user_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  draft_type TEXT NOT NULL CHECK (draft_type IN ('project', 'bid', 'offer', 'message')),
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  auto_saved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create onboarding_progress table
CREATE TABLE public.onboarding_progress (
  user_id UUID PRIMARY KEY,
  steps_completed JSONB NOT NULL DEFAULT '[]',
  current_step TEXT,
  dismissed_tips JSONB NOT NULL DEFAULT '[]',
  first_project_posted BOOLEAN NOT NULL DEFAULT false,
  first_bid_placed BOOLEAN NOT NULL DEFAULT false,
  first_offer_sent BOOLEAN NOT NULL DEFAULT false,
  first_milestone_completed BOOLEAN NOT NULL DEFAULT false,
  profile_strength_score INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_credit_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_tiers (public read)
CREATE POLICY "Anyone can view active subscription tiers"
ON public.subscription_tiers FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage subscription tiers"
ON public.subscription_tiers FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.user_subscriptions FOR SELECT
USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can create their own subscriptions"
ON public.user_subscriptions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions"
ON public.user_subscriptions FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all subscriptions"
ON public.user_subscriptions FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for featured_listings
CREATE POLICY "Anyone can view active featured listings"
ON public.featured_listings FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can create their own featured listings"
ON public.featured_listings FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all featured listings"
ON public.featured_listings FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for ai_credit_packs (public read)
CREATE POLICY "Anyone can view active AI credit packs"
ON public.ai_credit_packs FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage AI credit packs"
ON public.ai_credit_packs FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for user_ai_credits
CREATE POLICY "Users can view their own AI credits"
ON public.user_ai_credits FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own AI credits"
ON public.user_ai_credits FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own AI credits"
ON public.user_ai_credits FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all AI credits"
ON public.user_ai_credits FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for user_drafts
CREATE POLICY "Users can manage their own drafts"
ON public.user_drafts FOR ALL
USING (user_id = auth.uid());

-- RLS Policies for onboarding_progress
CREATE POLICY "Users can manage their own onboarding progress"
ON public.onboarding_progress FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all onboarding progress"
ON public.onboarding_progress FOR SELECT
USING (is_admin(auth.uid()));

-- Function to get user's current subscription tier
CREATE OR REPLACE FUNCTION public.get_user_subscription_tier(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT st.name 
     FROM user_subscriptions us
     JOIN subscription_tiers st ON us.tier_id = st.id
     WHERE us.user_id = p_user_id
     AND us.status = 'active'
     AND (us.expires_at IS NULL OR us.expires_at > now())
     ORDER BY us.created_at DESC
     LIMIT 1),
    'Free'
  );
$$;

-- Function to check if user has feature access
CREATE OR REPLACE FUNCTION public.user_has_feature(p_user_id UUID, p_feature TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_features JSONB;
BEGIN
  SELECT st.features INTO v_features
  FROM user_subscriptions us
  JOIN subscription_tiers st ON us.tier_id = st.id
  WHERE us.user_id = p_user_id
  AND us.status = 'active'
  AND (us.expires_at IS NULL OR us.expires_at > now())
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  IF v_features IS NULL THEN
    SELECT features INTO v_features FROM subscription_tiers WHERE name = 'Free';
  END IF;
  
  RETURN v_features ? p_feature;
END;
$$;

-- Function to deduct AI credits
CREATE OR REPLACE FUNCTION public.use_ai_credits(p_user_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  SELECT balance INTO v_current_balance FROM user_ai_credits WHERE user_id = p_user_id;
  
  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN false;
  END IF;
  
  UPDATE user_ai_credits
  SET balance = balance - p_amount,
      lifetime_used = lifetime_used + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$;

-- Trigger to initialize onboarding progress on profile creation
CREATE OR REPLACE FUNCTION public.init_onboarding_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO onboarding_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO user_ai_credits (user_id, balance)
  VALUES (NEW.id, 5)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_init_onboarding ON profiles;
CREATE TRIGGER trigger_init_onboarding
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION init_onboarding_progress();

-- Create indexes for performance (without time-based predicates)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_featured_listings_type ON featured_listings(listing_type, is_active);
CREATE INDEX IF NOT EXISTS idx_featured_listings_expires ON featured_listings(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_drafts_user ON user_drafts(user_id, draft_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_activity ON onboarding_progress(last_activity_at DESC);