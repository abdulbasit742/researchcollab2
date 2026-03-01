
-- Milestone Delay Predictions
CREATE TABLE IF NOT EXISTS public.milestone_delay_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID NOT NULL,
  institution_id UUID,
  predicted_delay_days INT DEFAULT 0,
  delay_probability NUMERIC(5,2) DEFAULT 0,
  confidence_score NUMERIC(5,2) DEFAULT 0,
  model_version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.milestone_delay_predictions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read ms delay preds" ON public.milestone_delay_predictions FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_ms_delay_preds_ms ON public.milestone_delay_predictions(milestone_id, created_at DESC);

-- Project Completion Predictions
CREATE TABLE IF NOT EXISTS public.project_completion_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  institution_id UUID,
  predicted_completion_probability NUMERIC(5,2) DEFAULT 0,
  predicted_completion_date TIMESTAMPTZ,
  risk_score NUMERIC(5,2) DEFAULT 0,
  confidence_score NUMERIC(5,2) DEFAULT 0,
  model_version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_completion_predictions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read proj comp preds" ON public.project_completion_predictions FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_proj_comp_preds ON public.project_completion_predictions(project_id, created_at DESC);

-- Dispute Risk Forecasts
CREATE TABLE IF NOT EXISTS public.dispute_risk_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID NOT NULL,
  institution_id UUID,
  predicted_dispute_probability NUMERIC(5,2) DEFAULT 0,
  risk_factors JSONB DEFAULT '{}',
  confidence_score NUMERIC(5,2) DEFAULT 0,
  model_version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dispute_risk_forecasts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read dispute forecasts" ON public.dispute_risk_forecasts FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_dispute_forecasts_ms ON public.dispute_risk_forecasts(milestone_id, created_at DESC);

-- Institution Stability Predictions
CREATE TABLE IF NOT EXISTS public.institution_stability_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  predicted_completion_trend NUMERIC(5,2) DEFAULT 0,
  predicted_engagement_trend NUMERIC(5,2) DEFAULT 0,
  predicted_dispute_trend NUMERIC(5,2) DEFAULT 0,
  stability_score NUMERIC(5,2) DEFAULT 0,
  confidence_score NUMERIC(5,2) DEFAULT 0,
  model_version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institution_stability_predictions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read stability preds" ON public.institution_stability_predictions FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_stability_preds_inst ON public.institution_stability_predictions(institution_id, created_at DESC);

-- Engagement Dropout Predictions
CREATE TABLE IF NOT EXISTS public.engagement_dropout_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  institution_id UUID,
  dropout_risk_probability NUMERIC(5,2) DEFAULT 0,
  inactivity_forecast_days INT DEFAULT 0,
  confidence_score NUMERIC(5,2) DEFAULT 0,
  model_version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.engagement_dropout_predictions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read dropout preds" ON public.engagement_dropout_predictions FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_dropout_preds_user ON public.engagement_dropout_predictions(user_id, created_at DESC);

-- Risk Simulation Results
CREATE TABLE IF NOT EXISTS public.risk_simulation_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  simulation_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  institution_id UUID,
  simulated_parameters JSONB DEFAULT '{}',
  projected_outcome TEXT,
  risk_shift NUMERIC(5,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.risk_simulation_results ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read simulations" ON public.risk_simulation_results FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth insert simulations" ON public.risk_simulation_results FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Prediction Accuracy Tracking
CREATE TABLE IF NOT EXISTS public.prediction_accuracy_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  predicted_value NUMERIC(10,2),
  actual_value NUMERIC(10,2),
  accuracy_score NUMERIC(5,2),
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prediction_accuracy_tracking ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read pred accuracy" ON public.prediction_accuracy_tracking FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_pred_accuracy_type ON public.prediction_accuracy_tracking(prediction_type, evaluated_at DESC);
