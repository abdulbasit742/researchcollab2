-- FGTMW: Full Global Go-To-Market War Strategy

CREATE TABLE IF NOT EXISTS fgtmw_fortress_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning',
  active_seids INTEGER DEFAULT 0,
  funded_projects INTEGER DEFAULT 0,
  institutional_integrations INTEGER DEFAULT 0,
  enterprise_pilots INTEGER DEFAULT 0,
  public_funding_integrations INTEGER DEFAULT 0,
  milestone_punctuality NUMERIC DEFAULT 0,
  dispute_rate NUMERIC DEFAULT 0,
  capital_efficiency_gain NUMERIC DEFAULT 0,
  density_score NUMERIC DEFAULT 0,
  density_ready BOOLEAN DEFAULT false,
  established_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fgtmw_capital_anchors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_name TEXT NOT NULL,
  anchor_type TEXT NOT NULL,
  region_id UUID REFERENCES fgtmw_fortress_regions(id),
  capital_committed NUMERIC DEFAULT 0,
  capital_routed NUMERIC DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'prospect',
  contact_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fgtmw_enterprise_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_name TEXT NOT NULL,
  entry_vector TEXT NOT NULL,
  region_id UUID REFERENCES fgtmw_fortress_regions(id),
  stage TEXT NOT NULL DEFAULT 'prospect',
  switching_cost_level TEXT DEFAULT 'low',
  integration_depth TEXT DEFAULT 'initial',
  annual_value NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fgtmw_competitor_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor TEXT NOT NULL,
  region TEXT,
  threat_level TEXT NOT NULL DEFAULT 'low',
  containment_action TEXT,
  our_advantage_demonstrated TEXT,
  last_assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS fgtmw_failure_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES fgtmw_fortress_regions(id),
  trigger_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  description TEXT NOT NULL,
  immediate_action_taken TEXT,
  stabilization_status TEXT DEFAULT 'pending',
  recovery_status TEXT DEFAULT 'pending',
  expansion_frozen BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS fgtmw_win_condition_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_key TEXT NOT NULL,
  current_indicator_value TEXT,
  target_indicator TEXT NOT NULL,
  met BOOLEAN DEFAULT false,
  last_assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  evidence JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE fgtmw_fortress_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fgtmw_capital_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE fgtmw_enterprise_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fgtmw_competitor_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE fgtmw_failure_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fgtmw_win_condition_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Auth view fortress" ON fgtmw_fortress_regions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage fortress" ON fgtmw_fortress_regions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update fortress" ON fgtmw_fortress_regions FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view capital anchors" ON fgtmw_capital_anchors FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage capital anchors" ON fgtmw_capital_anchors FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update capital anchors" ON fgtmw_capital_anchors FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view enterprise entries" ON fgtmw_enterprise_entries FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage enterprise entries" ON fgtmw_enterprise_entries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update enterprise entries" ON fgtmw_enterprise_entries FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view competitor tracking" ON fgtmw_competitor_tracking FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage competitor tracking" ON fgtmw_competitor_tracking FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view failure events" ON fgtmw_failure_events FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage failure events" ON fgtmw_failure_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update failure events" ON fgtmw_failure_events FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view win conditions" ON fgtmw_win_condition_tracking FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage win conditions" ON fgtmw_win_condition_tracking FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update win conditions" ON fgtmw_win_condition_tracking FOR UPDATE USING (auth.uid() IS NOT NULL);