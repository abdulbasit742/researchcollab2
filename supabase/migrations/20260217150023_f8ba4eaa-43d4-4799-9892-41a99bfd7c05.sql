
-- ============================================
-- LIMSE Layer 8: Market Intelligence & Liquidity Optimization
-- ============================================

-- 1. Institution Economic Health (A-F grading per institution)
CREATE TABLE public.institution_economic_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.organizations(id),
  revenue_per_member NUMERIC DEFAULT 0,
  avg_trust_growth NUMERIC DEFAULT 0,
  deal_completion_rate NUMERIC DEFAULT 0,
  skill_utilization_ratio NUMERIC DEFAULT 0,
  idle_talent_percent NUMERIC DEFAULT 0,
  health_grade TEXT DEFAULT 'C',
  health_score NUMERIC DEFAULT 50,
  early_warnings JSONB DEFAULT '[]'::jsonb,
  intervention_suggestions JSONB DEFAULT '[]'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ieh_institution ON public.institution_economic_health(institution_id);
CREATE INDEX idx_ieh_grade ON public.institution_economic_health(health_grade);

ALTER TABLE public.institution_economic_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all institution health" ON public.institution_economic_health
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Institution admins can view own health" ON public.institution_economic_health
  FOR SELECT USING (public.is_institution_admin(auth.uid(), institution_id));

-- 2. Skill Forecasts (predicted skill trends)
CREATE TABLE public.skill_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_name TEXT NOT NULL,
  forecast_period TEXT NOT NULL DEFAULT '30d',
  predicted_demand_change NUMERIC DEFAULT 0,
  predicted_supply_change NUMERIC DEFAULT 0,
  predicted_price_change NUMERIC DEFAULT 0,
  confidence_score NUMERIC DEFAULT 0,
  signal TEXT DEFAULT 'neutral',
  ai_reasoning TEXT,
  ai_model_version TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sf_skill ON public.skill_forecasts(skill_name);
CREATE INDEX idx_sf_signal ON public.skill_forecasts(signal);

ALTER TABLE public.skill_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view forecasts" ON public.skill_forecasts
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 3. Global Liquidity Flows (regional deal flow tracking)
CREATE TABLE public.global_liquidity_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_region TEXT NOT NULL,
  target_region TEXT NOT NULL,
  skill_name TEXT,
  deal_volume INTEGER DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'PKR',
  flow_period TEXT NOT NULL DEFAULT 'monthly',
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_glf_regions ON public.global_liquidity_flows(source_region, target_region);
CREATE INDEX idx_glf_skill ON public.global_liquidity_flows(skill_name);
CREATE INDEX idx_glf_period ON public.global_liquidity_flows(period_start, period_end);

ALTER TABLE public.global_liquidity_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view flows" ON public.global_liquidity_flows
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 4. Market Adjustments Log (audit trail for stabilization actions)
CREATE TABLE public.market_adjustments_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  adjustment_type TEXT NOT NULL,
  skill_name TEXT,
  region TEXT,
  trigger_condition TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  is_reversible BOOLEAN DEFAULT true,
  reversed_at TIMESTAMPTZ,
  reversed_by UUID,
  applied_by TEXT DEFAULT 'system',
  ai_confidence NUMERIC,
  ai_model_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mal_type ON public.market_adjustments_log(adjustment_type);
CREATE INDEX idx_mal_skill ON public.market_adjustments_log(skill_name);

ALTER TABLE public.market_adjustments_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage adjustments" ON public.market_adjustments_log
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view adjustments" ON public.market_adjustments_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 5. Add liquidity category to skill_market_metrics
ALTER TABLE public.skill_market_metrics
  ADD COLUMN IF NOT EXISTS liquidity_category TEXT DEFAULT 'balanced',
  ADD COLUMN IF NOT EXISTS fill_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_deal_time_hours NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS abandonment_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS region TEXT;

CREATE INDEX IF NOT EXISTS idx_smm_category ON public.skill_market_metrics(liquidity_category);
CREATE INDEX IF NOT EXISTS idx_smm_region ON public.skill_market_metrics(region);
