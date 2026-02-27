
-- =====================================================
-- EXECUTION ECONOMY CREATOR SYSTEM
-- =====================================================

-- 1. Skill-Based Earning Channels (Section 1)
CREATE TABLE IF NOT EXISTS public.earning_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  channel_type TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  description TEXT,
  skill_tags TEXT[] DEFAULT '{}',
  trust_requirement NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  total_earned NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Project Marketplace Listings (Section 2)
CREATE TABLE IF NOT EXISTS public.execution_marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  listing_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  deliverables JSONB DEFAULT '[]',
  budget NUMERIC,
  currency TEXT DEFAULT 'PKR',
  timeline_days INTEGER,
  skill_requirements TEXT[] DEFAULT '{}',
  trust_requirement NUMERIC DEFAULT 0,
  escrow_protected BOOLEAN DEFAULT true,
  institution_id TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  applicant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Marketplace Applications (Section 2)
CREATE TABLE IF NOT EXISTS public.marketplace_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.execution_marketplace_listings(id),
  applicant_id UUID NOT NULL,
  cover_note TEXT,
  proposed_budget NUMERIC,
  proposed_timeline_days INTEGER,
  skill_evidence JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Revenue Share Records (Section 6)
CREATE TABLE IF NOT EXISTS public.execution_revenue_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT,
  user_id UUID NOT NULL,
  share_percentage NUMERIC NOT NULL,
  earned_amount NUMERIC DEFAULT 0,
  consistency_bonus NUMERIC DEFAULT 0,
  innovation_bonus NUMERIC DEFAULT 0,
  period TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Collaboration Revenue Splits (Section 7)
CREATE TABLE IF NOT EXISTS public.collaboration_revenue_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  milestone_id TEXT,
  user_id UUID NOT NULL,
  contribution_weight NUMERIC NOT NULL,
  split_amount NUMERIC DEFAULT 0,
  is_finalized BOOLEAN DEFAULT false,
  dispute_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Income Stability Metrics (Section 9)
CREATE TABLE IF NOT EXISTS public.income_stability_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  total_earnings NUMERIC DEFAULT 0,
  funding_source_diversity NUMERIC DEFAULT 0,
  income_volatility_index NUMERIC DEFAULT 0,
  growth_trend NUMERIC DEFAULT 0,
  risk_exposure NUMERIC DEFAULT 0,
  sponsor_retention_rate NUMERIC DEFAULT 0,
  skill_monetization_distribution JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Skill Liquidity Map (Section 13)
CREATE TABLE IF NOT EXISTS public.skill_liquidity_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL,
  region_code TEXT,
  demand_score NUMERIC DEFAULT 0,
  supply_score NUMERIC DEFAULT 0,
  funding_hotspot BOOLEAN DEFAULT false,
  emerging_demand BOOLEAN DEFAULT false,
  cross_border_potential NUMERIC DEFAULT 0,
  avg_earning_rate NUMERIC DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Professional Subscriptions (Section 5)
CREATE TABLE IF NOT EXISTS public.professional_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  subscriber_id UUID NOT NULL,
  subscription_type TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'PKR',
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.earning_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_revenue_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_revenue_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_stability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_liquidity_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS: Auth read all
CREATE POLICY "Auth read earning_channels" ON public.earning_channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read marketplace_listings" ON public.execution_marketplace_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read marketplace_apps" ON public.marketplace_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read revenue_shares" ON public.execution_revenue_shares FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth read revenue_splits" ON public.collaboration_revenue_splits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth read income_stability" ON public.income_stability_metrics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth read skill_liquidity" ON public.skill_liquidity_map FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read subscriptions" ON public.professional_subscriptions FOR SELECT TO authenticated USING (auth.uid() = creator_id OR auth.uid() = subscriber_id);

-- RLS: Owner insert
CREATE POLICY "Own insert earning_channels" ON public.earning_channels FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own insert marketplace_listings" ON public.execution_marketplace_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Own insert marketplace_apps" ON public.marketplace_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Own insert revenue_shares" ON public.execution_revenue_shares FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own insert revenue_splits" ON public.collaboration_revenue_splits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Own insert income_stability" ON public.income_stability_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth insert skill_liquidity" ON public.skill_liquidity_map FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert subscriptions" ON public.professional_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = subscriber_id);

-- Owner update
CREATE POLICY "Own update earning_channels" ON public.earning_channels FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own update marketplace_listings" ON public.execution_marketplace_listings FOR UPDATE TO authenticated USING (auth.uid() = creator_id);
CREATE POLICY "Own update marketplace_apps" ON public.marketplace_applications FOR UPDATE TO authenticated USING (true);
