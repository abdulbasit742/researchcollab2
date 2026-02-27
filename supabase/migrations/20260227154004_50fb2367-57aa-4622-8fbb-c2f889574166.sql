-- GASIMS: Government Adoption & Sovereign Integration Master Strategy

CREATE TABLE IF NOT EXISTS gasims_gov_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'ministry',
  country_code TEXT NOT NULL,
  entry_vector TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'prospect',
  pilot_scope TEXT,
  pilot_duration TEXT,
  contact_name TEXT,
  success_metrics JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS gasims_pilot_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES gasims_gov_partnerships(id),
  metric_key TEXT NOT NULL,
  metric_label TEXT NOT NULL,
  baseline_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  target_value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gasims_transparency_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES gasims_gov_partnerships(id),
  report_period_start TIMESTAMPTZ NOT NULL,
  report_period_end TIMESTAMPTZ NOT NULL,
  approved_projects INTEGER DEFAULT 0,
  milestone_completion_rate NUMERIC DEFAULT 0,
  funding_released NUMERIC DEFAULT 0,
  dispute_rate NUMERIC DEFAULT 0,
  regional_distribution JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gasims_corridor_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corridor_name TEXT NOT NULL,
  country_a TEXT NOT NULL,
  country_b TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed',
  regulatory_compatibility_score NUMERIC DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  capital_routed NUMERIC DEFAULT 0,
  compliance_status TEXT DEFAULT 'pending',
  established_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gasims_anticorruption_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  description TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  detection_mechanism TEXT NOT NULL,
  action_taken TEXT,
  resolved BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE gasims_gov_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE gasims_pilot_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE gasims_transparency_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE gasims_corridor_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE gasims_anticorruption_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Auth view gov partnerships" ON gasims_gov_partnerships FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage gov partnerships" ON gasims_gov_partnerships FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update gov partnerships" ON gasims_gov_partnerships FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view pilot metrics" ON gasims_pilot_metrics FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage pilot metrics" ON gasims_pilot_metrics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update pilot metrics" ON gasims_pilot_metrics FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public view transparency reports" ON gasims_transparency_reports FOR SELECT USING (is_public = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage transparency reports" ON gasims_transparency_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update transparency reports" ON gasims_transparency_reports FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view corridors" ON gasims_corridor_tracking FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage corridors" ON gasims_corridor_tracking FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update corridors" ON gasims_corridor_tracking FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view anticorruption" ON gasims_anticorruption_events FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage anticorruption" ON gasims_anticorruption_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);