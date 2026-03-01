
-- Institution Subscription Plans
CREATE TABLE IF NOT EXISTS public.institution_subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL UNIQUE,
  max_projects INT DEFAULT 5,
  advanced_analytics_enabled BOOLEAN DEFAULT false,
  ai_features_enabled BOOLEAN DEFAULT false,
  certification_module_enabled BOOLEAN DEFAULT false,
  executive_dashboard_enabled BOOLEAN DEFAULT false,
  export_enabled BOOLEAN DEFAULT false,
  monthly_price_pkr NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institution_subscription_plans ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can read sub plans" ON public.institution_subscription_plans FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO public.institution_subscription_plans (plan_name, max_projects, advanced_analytics_enabled, ai_features_enabled, certification_module_enabled, executive_dashboard_enabled, export_enabled, monthly_price_pkr)
VALUES
  ('Starter', 5, false, false, false, false, false, 0),
  ('Pro', 25, true, true, true, false, true, 9999),
  ('Enterprise', -1, true, true, true, true, true, 49999)
ON CONFLICT (plan_name) DO NOTHING;

-- Feature Access Logs
CREATE TABLE IF NOT EXISTS public.feature_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  access_granted BOOLEAN NOT NULL DEFAULT true,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_access_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read feature access logs" ON public.feature_access_logs FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth insert feature access logs" ON public.feature_access_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_feature_access_logs_inst ON public.feature_access_logs(institution_id, created_at DESC);

-- Revenue Metrics Snapshots
CREATE TABLE IF NOT EXISTS public.revenue_metrics_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_mrr NUMERIC(12,2) DEFAULT 0,
  total_arr NUMERIC(14,2) DEFAULT 0,
  active_subscriptions INT DEFAULT 0,
  churn_rate NUMERIC(5,2) DEFAULT 0,
  upgrade_rate NUMERIC(5,2) DEFAULT 0,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_metrics_snapshots ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read rev snapshots" ON public.revenue_metrics_snapshots FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Upgrade Recommendations
CREATE TABLE IF NOT EXISTS public.upgrade_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  recommended_plan TEXT NOT NULL,
  reason TEXT NOT NULL,
  projected_benefit TEXT,
  recommended_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.upgrade_recommendations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read upgrade recs" ON public.upgrade_recommendations FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_upgrade_recs_inst ON public.upgrade_recommendations(institution_id, recommended_at DESC);

-- Revenue Forecast Models
CREATE TABLE IF NOT EXISTS public.revenue_forecast_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_period TEXT NOT NULL,
  projected_mrr NUMERIC(12,2) DEFAULT 0,
  projected_arr NUMERIC(14,2) DEFAULT 0,
  churn_projection NUMERIC(5,2) DEFAULT 0,
  growth_projection NUMERIC(5,2) DEFAULT 0,
  forecast_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_forecast_models ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read rev forecasts" ON public.revenue_forecast_models FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
