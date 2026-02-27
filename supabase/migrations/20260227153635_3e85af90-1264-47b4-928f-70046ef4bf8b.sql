-- IGITA: Investor-Grade Infrastructure Thesis Architecture
-- Tracking tables for investor pipeline, thesis metrics, and pitch analytics

CREATE TABLE IF NOT EXISTS igita_investor_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_name TEXT NOT NULL,
  investor_type TEXT NOT NULL DEFAULT 'institutional',
  stage TEXT NOT NULL DEFAULT 'prospect',
  thesis_alignment_score NUMERIC DEFAULT 0,
  interest_areas TEXT[],
  estimated_ticket_size NUMERIC,
  contact_name TEXT,
  last_interaction_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS igita_thesis_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_value NUMERIC DEFAULT 0,
  target_value NUMERIC,
  unit TEXT NOT NULL,
  period TEXT NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS igita_economic_impact_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  impact_metric_id TEXT NOT NULL,
  baseline_value NUMERIC,
  current_value NUMERIC,
  improvement_percentage NUMERIC,
  region TEXT,
  measurement_method TEXT,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  evidence JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS igita_pitch_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  investor_id UUID REFERENCES igita_investor_pipeline(id),
  slide_focus TEXT,
  outcome TEXT,
  feedback TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recorded_by UUID
);

-- Enable RLS
ALTER TABLE igita_investor_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE igita_thesis_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE igita_economic_impact_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE igita_pitch_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Auth view investor pipeline" ON igita_investor_pipeline FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage investor pipeline" ON igita_investor_pipeline FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update investor pipeline" ON igita_investor_pipeline FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view thesis metrics" ON igita_thesis_metrics FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage thesis metrics" ON igita_thesis_metrics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update thesis metrics" ON igita_thesis_metrics FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view economic impact" ON igita_economic_impact_tracking FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage economic impact" ON igita_economic_impact_tracking FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view pitch events" ON igita_pitch_events FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage pitch events" ON igita_pitch_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);