
-- =============================================
-- REVENUE ENGINE: Core Tables
-- =============================================

-- 1. Platform Revenue Ledger
CREATE TABLE public.platform_revenue_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  institution_id UUID,
  revenue_type TEXT NOT NULL CHECK (revenue_type IN ('subscription', 'commission', 'intelligence_api', 'enterprise', 'ads', 'premium_boost')),
  source_id TEXT,
  gross_amount NUMERIC NOT NULL DEFAULT 0,
  platform_cut NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'PKR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_revenue_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all revenue ledger entries"
  ON public.platform_revenue_ledger FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert revenue ledger entries"
  ON public.platform_revenue_ledger FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX idx_revenue_ledger_type_created ON public.platform_revenue_ledger (revenue_type, created_at DESC);
CREATE INDEX idx_revenue_ledger_user ON public.platform_revenue_ledger (user_id);
CREATE INDEX idx_revenue_ledger_institution ON public.platform_revenue_ledger (institution_id);

-- 2. Revenue Metrics Daily
CREATE TABLE public.revenue_metrics_daily (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  subscription_revenue NUMERIC NOT NULL DEFAULT 0,
  transaction_revenue NUMERIC NOT NULL DEFAULT 0,
  enterprise_revenue NUMERIC NOT NULL DEFAULT 0,
  ai_revenue NUMERIC NOT NULL DEFAULT 0,
  affiliate_revenue NUMERIC NOT NULL DEFAULT 0,
  boost_revenue NUMERIC NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.revenue_metrics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read revenue metrics"
  ON public.revenue_metrics_daily FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage revenue metrics"
  ON public.revenue_metrics_daily FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE INDEX idx_revenue_metrics_date ON public.revenue_metrics_daily (date DESC);

-- 3. Commission Rules
CREATE TABLE public.commission_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  min_trust_score INTEGER NOT NULL DEFAULT 0,
  max_trust_score INTEGER DEFAULT 100,
  min_volume NUMERIC NOT NULL DEFAULT 0,
  max_volume NUMERIC,
  commission_rate NUMERIC NOT NULL DEFAULT 10,
  bonus_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage commission rules"
  ON public.commission_rules FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can read active commission rules"
  ON public.commission_rules FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE INDEX idx_commission_rules_trust ON public.commission_rules (min_trust_score, max_trust_score);

-- 4. Visibility Boosts
CREATE TABLE public.visibility_boosts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  boost_type TEXT NOT NULL CHECK (boost_type IN ('profile', 'bid', 'project', 'opportunity')),
  target_id UUID,
  multiplier NUMERIC NOT NULL DEFAULT 1.5,
  cost NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'PKR',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.visibility_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own boosts"
  ON public.visibility_boosts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create boosts"
  ON public.visibility_boosts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all boosts"
  ON public.visibility_boosts FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE INDEX idx_boosts_user ON public.visibility_boosts (user_id, expires_at DESC);
CREATE INDEX idx_boosts_type ON public.visibility_boosts (boost_type, status);

-- 5. Enterprise Contracts
CREATE TABLE public.enterprise_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  contract_name TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 50,
  intelligence_access BOOLEAN NOT NULL DEFAULT false,
  custom_modules JSONB DEFAULT '[]'::jsonb,
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('flat', 'per_seat', 'usage_based', 'hybrid')),
  contract_value NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'PKR',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  renewal_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.enterprise_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage enterprise contracts"
  ON public.enterprise_contracts FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Institution admins can read own contracts"
  ON public.enterprise_contracts FOR SELECT
  USING (public.is_institution_admin(auth.uid(), institution_id));

CREATE INDEX idx_enterprise_contracts_institution ON public.enterprise_contracts (institution_id, status);

-- 6. Institution Usage Metrics
CREATE TABLE public.institution_usage_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  period DATE NOT NULL,
  active_seats INTEGER NOT NULL DEFAULT 0,
  ai_credits_consumed INTEGER NOT NULL DEFAULT 0,
  deals_executed INTEGER NOT NULL DEFAULT 0,
  revenue_generated NUMERIC NOT NULL DEFAULT 0,
  storage_used_mb NUMERIC NOT NULL DEFAULT 0,
  api_calls INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id, period)
);

ALTER TABLE public.institution_usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage institution usage"
  ON public.institution_usage_metrics FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Institution admins can read own usage"
  ON public.institution_usage_metrics FOR SELECT
  USING (public.is_institution_admin(auth.uid(), institution_id));

CREATE INDEX idx_institution_usage_period ON public.institution_usage_metrics (institution_id, period DESC);

-- 7. AI Credit Wallets
CREATE TABLE public.ai_credit_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_purchased INTEGER NOT NULL DEFAULT 0,
  lifetime_consumed INTEGER NOT NULL DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise')),
  monthly_quota INTEGER NOT NULL DEFAULT 100,
  quota_reset_at TIMESTAMPTZ DEFAULT (date_trunc('month', now()) + interval '1 month'),
  institution_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_credit_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own AI wallet"
  ON public.ai_credit_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own AI wallet"
  ON public.ai_credit_wallets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all AI wallets"
  ON public.ai_credit_wallets FOR ALL
  USING (public.is_admin(auth.uid()));

-- 8. Revenue Forecasts
CREATE TABLE public.revenue_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_date DATE NOT NULL,
  projected_mrr NUMERIC NOT NULL DEFAULT 0,
  projected_transaction_volume NUMERIC NOT NULL DEFAULT 0,
  projected_enterprise_revenue NUMERIC NOT NULL DEFAULT 0,
  projected_ai_revenue NUMERIC NOT NULL DEFAULT 0,
  churn_risk NUMERIC NOT NULL DEFAULT 0,
  enterprise_pipeline_value NUMERIC NOT NULL DEFAULT 0,
  confidence_score NUMERIC NOT NULL DEFAULT 0.5,
  model_version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.revenue_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage forecasts"
  ON public.revenue_forecasts FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE INDEX idx_revenue_forecasts_date ON public.revenue_forecasts (forecast_date DESC);

-- 9. Leakage Detection
CREATE TABLE public.leakage_detection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  detection_type TEXT NOT NULL CHECK (detection_type IN ('no_deal_messages', 'external_contact', 'abnormal_pricing', 'repeated_cancellation')),
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  evidence JSONB DEFAULT '{}'::jsonb,
  flagged_entity_id UUID,
  flagged_entity_type TEXT,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leakage_detection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage leakage detections"
  ON public.leakage_detection FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE INDEX idx_leakage_user ON public.leakage_detection (user_id, created_at DESC);
CREATE INDEX idx_leakage_unresolved ON public.leakage_detection (resolved, severity) WHERE resolved = false;
