
-- Capital Efficiency Optimization
CREATE TABLE public.capital_efficiency_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES public.country_nodes(id),
  sector TEXT,
  allocation_confidence NUMERIC NOT NULL CHECK (allocation_confidence BETWEEN 0 AND 100),
  portfolio_risk NUMERIC,
  sector_correlation NUMERIC,
  talent_density_weight NUMERIC,
  innovation_saturation NUMERIC,
  cost_adjusted_return NUMERIC,
  requires_human_approval BOOLEAN NOT NULL DEFAULT true,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capital_efficiency_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read capital_efficiency" ON public.capital_efficiency_scores FOR SELECT USING (true);

-- Startup Survival Probability
CREATE TABLE public.startup_survival_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_entity_id UUID,
  founder_track_record NUMERIC,
  fyp_origin_score NUMERIC,
  sector_volatility NUMERIC,
  capital_stage TEXT,
  equity_health NUMERIC,
  arbitration_history_score NUMERIC,
  survival_probability NUMERIC NOT NULL CHECK (survival_probability BETWEEN 0 AND 100),
  confidence_band TEXT,
  top_factors JSONB,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.startup_survival_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read startup_survival" ON public.startup_survival_scores FOR SELECT USING (true);

-- Employment Conversion Forecasts
CREATE TABLE public.employment_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES public.country_nodes(id),
  sector TEXT,
  hiring_likelihood NUMERIC,
  demand_surge_detected BOOLEAN DEFAULT false,
  talent_oversupply_risk TEXT CHECK (talent_oversupply_risk IN ('low','medium','high')),
  university_employability_trajectory TEXT,
  forecast_period TEXT,
  forecast_date TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employment_forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read employment_forecasts" ON public.employment_forecasts FOR SELECT USING (true);

-- Sector Acceleration Detection
CREATE TABLE public.sector_acceleration_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('funding_spike','employment_cluster','cross_node_momentum','emerging_hub')),
  intensity NUMERIC,
  node_id UUID REFERENCES public.country_nodes(id),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);
ALTER TABLE public.sector_acceleration_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read sector_signals" ON public.sector_acceleration_signals FOR SELECT USING (true);

-- Innovation Risk Warnings
CREATE TABLE public.innovation_risk_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_type TEXT NOT NULL CHECK (risk_type IN ('dispute_trend','capital_concentration','governance_imbalance','ai_bias','regional_underperformance')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  description TEXT,
  node_id UUID REFERENCES public.country_nodes(id),
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.innovation_risk_warnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read risk_warnings" ON public.innovation_risk_warnings FOR SELECT USING (true);

-- Scenario Simulations
CREATE TABLE public.scenario_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_name TEXT NOT NULL,
  variables JSONB NOT NULL,
  projected_startup_yield NUMERIC,
  projected_employment_gain NUMERIC,
  projected_capital_efficiency NUMERIC,
  projected_risk_level TEXT,
  projected_dispute_likelihood NUMERIC,
  confidence_band TEXT,
  explainability JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scenario_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read simulations" ON public.scenario_simulations FOR SELECT USING (true);

-- Model Performance Tracking
CREATE TABLE public.ai_model_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES public.ai_model_registry(id),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  outcome_variance NUMERIC,
  retraining_triggered BOOLEAN DEFAULT false,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_model_performance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read model_perf" ON public.ai_model_performance_logs FOR SELECT USING (true);

-- Add missing columns to ai_model_registry for v2
ALTER TABLE public.ai_model_registry
  ADD COLUMN IF NOT EXISTS model_layer INTEGER,
  ADD COLUMN IF NOT EXISTS layer_label TEXT,
  ADD COLUMN IF NOT EXISTS access_tier TEXT DEFAULT 'internal',
  ADD COLUMN IF NOT EXISTS is_exportable BOOLEAN DEFAULT false;
