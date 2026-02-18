
-- Survival Prediction Engine v3
CREATE TABLE public.survival_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID,
  founder_id UUID,
  survival_probability NUMERIC DEFAULT 0,
  risk_band TEXT DEFAULT 'moderate',
  capital_efficiency_score NUMERIC DEFAULT 0,
  ai_confidence_score NUMERIC DEFAULT 0,
  founder_delivery_consistency NUMERIC DEFAULT 0,
  capital_stage_timing NUMERIC DEFAULT 0,
  equity_dilution_pattern NUMERIC DEFAULT 0,
  arbitration_exposure NUMERIC DEFAULT 0,
  sector_volatility NUMERIC DEFAULT 0,
  trust_trajectory_slope NUMERIC DEFAULT 0,
  corporate_sponsor_behavior NUMERIC DEFAULT 0,
  milestone_adherence NUMERIC DEFAULT 0,
  model_version TEXT DEFAULT 'v3.0',
  predicted_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.survival_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage survival predictions" ON public.survival_predictions FOR ALL USING (public.is_admin(auth.uid()));

-- Capital Allocation Confidence
CREATE TABLE public.capital_allocation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_name TEXT NOT NULL,
  total_capital NUMERIC DEFAULT 0,
  sector_allocation JSONB DEFAULT '{}',
  projected_startup_yield NUMERIC DEFAULT 0,
  projected_employment_conversion NUMERIC DEFAULT 0,
  projected_capital_efficiency NUMERIC DEFAULT 0,
  projected_dispute_risk NUMERIC DEFAULT 0,
  projected_survival_variance NUMERIC DEFAULT 0,
  confidence_score NUMERIC DEFAULT 0,
  historical_roi_proxy NUMERIC DEFAULT 0,
  risk_clustering_detected BOOLEAN DEFAULT false,
  requires_human_approval BOOLEAN DEFAULT true,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.capital_allocation_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage allocation scores" ON public.capital_allocation_scores FOR ALL USING (public.is_admin(auth.uid()));

-- Dispute Prevention Engine
CREATE TABLE public.dispute_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID,
  milestone_id UUID,
  risk_level TEXT DEFAULT 'low',
  failure_likelihood NUMERIC DEFAULT 0,
  sponsor_dispute_probability NUMERIC DEFAULT 0,
  founder_burnout_indicator NUMERIC DEFAULT 0,
  recommended_actions TEXT[] DEFAULT '{}',
  prevention_triggered BOOLEAN DEFAULT false,
  actual_outcome TEXT,
  prediction_accurate BOOLEAN,
  predicted_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.dispute_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage dispute predictions" ON public.dispute_predictions FOR ALL USING (public.is_admin(auth.uid()));

-- Sector Acceleration Detection
CREATE TABLE public.sector_acceleration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_name TEXT NOT NULL,
  node_id UUID,
  momentum_score NUMERIC DEFAULT 0,
  acceleration_confidence NUMERIC DEFAULT 0,
  volatility_band TEXT DEFAULT 'medium',
  funding_velocity_spike BOOLEAN DEFAULT false,
  hiring_surge_detected BOOLEAN DEFAULT false,
  founder_clustering BOOLEAN DEFAULT false,
  sponsor_density_growth NUMERIC DEFAULT 0,
  government_targeting_shift BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sector_acceleration ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sector acceleration" ON public.sector_acceleration FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Auth read sector acceleration" ON public.sector_acceleration FOR SELECT TO authenticated USING (true);

-- Model Accuracy Tracking
CREATE TABLE public.model_accuracy_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  model_version TEXT NOT NULL,
  prediction_accuracy NUMERIC DEFAULT 0,
  forecast_error_band NUMERIC DEFAULT 0,
  survival_prediction_variance NUMERIC DEFAULT 0,
  allocation_accuracy_delta NUMERIC DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  retraining_due TIMESTAMPTZ,
  drift_detected BOOLEAN DEFAULT false,
  bias_risk_score NUMERIC DEFAULT 0,
  measured_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.model_accuracy_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage model accuracy" ON public.model_accuracy_index FOR ALL USING (public.is_admin(auth.uid()));
