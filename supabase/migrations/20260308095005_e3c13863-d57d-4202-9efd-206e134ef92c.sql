
-- Revenue Optimization Engine tables

-- 1. Revenue signals detected from platform activity
CREATE TABLE public.rev_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  revenue_potential NUMERIC DEFAULT 0,
  confidence_score NUMERIC DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  source_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  actioned_at TIMESTAMPTZ,
  actioned_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rev_signals_type ON public.rev_signals(signal_type);
CREATE INDEX idx_rev_signals_status ON public.rev_signals(status);

ALTER TABLE public.rev_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read rev_signals" ON public.rev_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert rev_signals" ON public.rev_signals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update rev_signals" ON public.rev_signals FOR UPDATE TO authenticated USING (true);

-- 2. Sponsor outreach leads
CREATE TABLE public.rev_sponsor_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  industry TEXT,
  contact_info JSONB DEFAULT '{}',
  match_reason TEXT,
  match_score NUMERIC DEFAULT 0,
  target_domains TEXT[] DEFAULT '{}',
  estimated_budget NUMERIC DEFAULT 0,
  outreach_status TEXT DEFAULT 'identified',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rev_sponsor_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read rev_sponsor_leads" ON public.rev_sponsor_leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert rev_sponsor_leads" ON public.rev_sponsor_leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update rev_sponsor_leads" ON public.rev_sponsor_leads FOR UPDATE TO authenticated USING (true);

-- 3. Premium upgrade candidates
CREATE TABLE public.rev_premium_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_name TEXT,
  current_tier TEXT DEFAULT 'free',
  recommended_tier TEXT,
  upgrade_reason TEXT,
  engagement_score NUMERIC DEFAULT 0,
  estimated_revenue NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'identified',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rev_premium_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read rev_premium_candidates" ON public.rev_premium_candidates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert rev_premium_candidates" ON public.rev_premium_candidates FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Pricing experiments (safe, no escrow mutation)
CREATE TABLE public.rev_pricing_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name TEXT NOT NULL,
  target_segment TEXT NOT NULL,
  pricing_model JSONB NOT NULL DEFAULT '{}',
  control_model JSONB DEFAULT '{}',
  hypothesis TEXT,
  status TEXT DEFAULT 'draft',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  results JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rev_pricing_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read rev_pricing_experiments" ON public.rev_pricing_experiments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert rev_pricing_experiments" ON public.rev_pricing_experiments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update rev_pricing_experiments" ON public.rev_pricing_experiments FOR UPDATE TO authenticated USING (true);

-- 5. Revenue forecasts
CREATE TABLE public.rev_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_period TEXT NOT NULL,
  forecast_type TEXT NOT NULL,
  projected_revenue NUMERIC DEFAULT 0,
  projected_growth_rate NUMERIC DEFAULT 0,
  confidence_interval JSONB DEFAULT '{}',
  assumptions JSONB DEFAULT '{}',
  model_version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rev_forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read rev_forecasts" ON public.rev_forecasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert rev_forecasts" ON public.rev_forecasts FOR INSERT TO authenticated WITH CHECK (true);

-- 6. Revenue alerts
CREATE TABLE public.rev_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'info',
  revenue_impact NUMERIC DEFAULT 0,
  related_entity_type TEXT,
  related_entity_id TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rev_alerts_ack ON public.rev_alerts(acknowledged);

ALTER TABLE public.rev_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read rev_alerts" ON public.rev_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert rev_alerts" ON public.rev_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update rev_alerts" ON public.rev_alerts FOR UPDATE TO authenticated USING (true);
