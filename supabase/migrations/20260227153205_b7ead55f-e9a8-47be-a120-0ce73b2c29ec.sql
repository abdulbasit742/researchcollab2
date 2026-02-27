-- GADEB: Global Adoption & Dominance Execution Blueprint
-- Database tables for adoption tracking, cluster health, and dominance roadmap

CREATE TABLE IF NOT EXISTS gadeb_cluster_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id TEXT NOT NULL,
  region TEXT NOT NULL,
  phase TEXT NOT NULL DEFAULT 'cluster_seeding',
  institutions_active INTEGER DEFAULT 0,
  users_active INTEGER DEFAULT 0,
  capital_routed NUMERIC DEFAULT 0,
  milestone_completion_rate NUMERIC DEFAULT 0,
  trust_density NUMERIC DEFAULT 0,
  network_effect_strength NUMERIC DEFAULT 0,
  switching_cost_index NUMERIC DEFAULT 0,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gadeb_phase_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  current_value NUMERIC DEFAULT 0,
  target_value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID
);

CREATE TABLE IF NOT EXISTS gadeb_network_effect_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loop_id TEXT NOT NULL,
  loop_name TEXT NOT NULL,
  cycle_count INTEGER DEFAULT 0,
  growth_rate NUMERIC DEFAULT 0,
  current_strength NUMERIC DEFAULT 0,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gadeb_lock_in_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  trust_ledger_entries INTEGER DEFAULT 0,
  active_escrow_contracts INTEGER DEFAULT 0,
  institutional_verifications INTEGER DEFAULT 0,
  years_on_platform NUMERIC DEFAULT 0,
  cross_border_compliance INTEGER DEFAULT 0,
  knowledge_publications INTEGER DEFAULT 0,
  switching_cost_index NUMERIC DEFAULT 0,
  switching_cost_level TEXT DEFAULT 'low',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gadeb_capital_magnet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ecs_score NUMERIC NOT NULL,
  tier_name TEXT NOT NULL,
  escrow_fee_discount NUMERIC DEFAULT 0,
  release_speed_multiplier NUMERIC DEFAULT 1.0,
  capital_matching_priority TEXT DEFAULT 'standard',
  institutional_bonus_rate NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gadeb_enterprise_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_name TEXT NOT NULL,
  contact_name TEXT,
  stage TEXT NOT NULL DEFAULT 'prospect',
  capability_interest TEXT[],
  estimated_value NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS gadeb_government_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'ministry',
  country_code TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'prospect',
  capability_interest TEXT[],
  pilot_scope TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS gadeb_roadmap_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  milestone TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  target_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  evidence JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gadeb_competitor_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor TEXT NOT NULL,
  intelligence_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  our_advantage TEXT,
  action_required TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recorded_by UUID
);

CREATE TABLE IF NOT EXISTS gadeb_adoption_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  phase TEXT NOT NULL,
  region TEXT,
  impact_description TEXT,
  metadata JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE gadeb_cluster_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE gadeb_phase_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE gadeb_network_effect_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE gadeb_lock_in_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE gadeb_capital_magnet ENABLE ROW LEVEL SECURITY;
ALTER TABLE gadeb_enterprise_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE gadeb_government_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE gadeb_roadmap_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE gadeb_competitor_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE gadeb_adoption_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Auth view cluster health" ON gadeb_cluster_health FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert cluster health" ON gadeb_cluster_health FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view phase progress" ON gadeb_phase_progress FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage phase progress" ON gadeb_phase_progress FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update phase progress" ON gadeb_phase_progress FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view network effects" ON gadeb_network_effect_tracking FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert network effects" ON gadeb_network_effect_tracking FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users view own lock-in" ON gadeb_lock_in_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Auth insert lock-in" ON gadeb_lock_in_metrics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users view own capital magnet" ON gadeb_capital_magnet FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Auth insert capital magnet" ON gadeb_capital_magnet FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view enterprise pipeline" ON gadeb_enterprise_pipeline FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage enterprise pipeline" ON gadeb_enterprise_pipeline FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update enterprise pipeline" ON gadeb_enterprise_pipeline FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view gov pipeline" ON gadeb_government_pipeline FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage gov pipeline" ON gadeb_government_pipeline FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update gov pipeline" ON gadeb_government_pipeline FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view roadmap" ON gadeb_roadmap_milestones FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage roadmap" ON gadeb_roadmap_milestones FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update roadmap" ON gadeb_roadmap_milestones FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth view competitor intel" ON gadeb_competitor_intelligence FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert competitor intel" ON gadeb_competitor_intelligence FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public view adoption events" ON gadeb_adoption_events FOR SELECT USING (true);
CREATE POLICY "Auth insert adoption events" ON gadeb_adoption_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);