-- WDIHP: World-Class Dominance & Infrastructure Hardening Protocol
-- Database tables for trust hardening, escrow security, risk simulation, and enterprise readiness

CREATE TABLE IF NOT EXISTS wdihp_trust_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  anomaly_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  evidence JSONB DEFAULT '{}',
  auto_mitigation_applied BOOLEAN DEFAULT false,
  mitigation_action TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT
);

CREATE TABLE IF NOT EXISTS wdihp_trust_dampening (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  raw_delta NUMERIC NOT NULL,
  dampened_delta NUMERIC NOT NULL,
  volatility_factor NUMERIC NOT NULL,
  age_factor NUMERIC NOT NULL,
  explanation TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wdihp_trust_concentration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  gini_coefficient NUMERIC NOT NULL,
  concentration_risk TEXT NOT NULL,
  top_source_percentage NUMERIC NOT NULL,
  source_count INTEGER NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wdihp_trust_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pre_dispute_score NUMERIC NOT NULL,
  post_dispute_score NUMERIC NOT NULL,
  current_recovered_score NUMERIC,
  recovery_percentage NUMERIC DEFAULT 0,
  dispute_id UUID,
  days_since_dispute INTEGER DEFAULT 0,
  consistent_positive_actions INTEGER DEFAULT 0,
  institutional_mediation BOOLEAN DEFAULT false,
  projected_full_recovery_days INTEGER,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wdihp_escrow_freeze_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL,
  reason TEXT NOT NULL,
  frozen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  frozen_by UUID NOT NULL,
  auto_detected BOOLEAN DEFAULT false,
  evidence JSONB DEFAULT '{}',
  estimated_resolution_hours INTEGER,
  requires_governance_review BOOLEAN DEFAULT false,
  unfrozen_at TIMESTAMPTZ,
  unfrozen_by UUID,
  resolution_notes TEXT
);

CREATE TABLE IF NOT EXISTS wdihp_escrow_security_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID NOT NULL,
  validation_result JSONB NOT NULL,
  risk_level TEXT NOT NULL,
  blockers TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wdihp_risk_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario TEXT NOT NULL,
  impact_severity TEXT NOT NULL,
  affected_pillars TEXT[] NOT NULL,
  estimated_users_affected INTEGER,
  estimated_capital_at_risk NUMERIC,
  mitigation_steps TEXT[],
  cascade_risk NUMERIC,
  recovery_time_days INTEGER,
  simulated_by UUID,
  simulated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  platform_metrics_snapshot JSONB
);

CREATE TABLE IF NOT EXISTS wdihp_enterprise_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  tier TEXT NOT NULL DEFAULT 'standard',
  sso_enabled BOOLEAN DEFAULT false,
  sso_provider TEXT,
  bulk_seid_verification BOOLEAN DEFAULT false,
  compliance_mode TEXT NOT NULL DEFAULT 'standard',
  procurement_api_enabled BOOLEAN DEFAULT false,
  grant_integration_enabled BOOLEAN DEFAULT false,
  audit_export_enabled BOOLEAN DEFAULT true,
  policy_tracking_enabled BOOLEAN DEFAULT false,
  data_localization TEXT,
  custom_branding BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wdihp_government_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  jurisdiction_code TEXT NOT NULL,
  regulatory_framework TEXT NOT NULL,
  public_funding_audit_required BOOLEAN DEFAULT true,
  policy_advisory_tracking BOOLEAN DEFAULT true,
  procurement_check_integration BOOLEAN DEFAULT false,
  data_residency_enforced BOOLEAN DEFAULT true,
  encryption_standard TEXT DEFAULT 'AES-256-GCM',
  retention_policy_years INTEGER DEFAULT 10,
  transparency_report_frequency TEXT DEFAULT 'quarterly',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wdihp_coherence_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type TEXT NOT NULL DEFAULT 'full',
  total_features INTEGER NOT NULL,
  passed INTEGER NOT NULL,
  failed INTEGER NOT NULL,
  orphan_features TEXT[],
  report JSONB NOT NULL,
  audited_by UUID,
  audited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wdihp_execution_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type TEXT NOT NULL,
  actor_id UUID NOT NULL,
  entity_id UUID,
  entity_type TEXT,
  signal_weight NUMERIC NOT NULL DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wdihp_hardening_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar TEXT NOT NULL,
  component TEXT NOT NULL,
  hardening_level TEXT NOT NULL DEFAULT 'standard',
  last_audit_at TIMESTAMPTZ,
  compliance_score NUMERIC DEFAULT 0,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE wdihp_trust_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE wdihp_trust_dampening ENABLE ROW LEVEL SECURITY;
ALTER TABLE wdihp_trust_concentration ENABLE ROW LEVEL SECURITY;
ALTER TABLE wdihp_trust_recovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE wdihp_escrow_freeze_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE wdihp_escrow_security_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE wdihp_risk_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wdihp_enterprise_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wdihp_government_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wdihp_coherence_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE wdihp_execution_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wdihp_hardening_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users view own trust anomalies" ON wdihp_trust_anomalies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own dampening" ON wdihp_trust_dampening FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own concentration" ON wdihp_trust_concentration FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own recovery" ON wdihp_trust_recovery FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Auth view escrow freezes" ON wdihp_escrow_freeze_events FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth view escrow logs" ON wdihp_escrow_security_log FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth view risk sims" ON wdihp_risk_simulations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert risk sims" ON wdihp_risk_simulations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth view enterprise" ON wdihp_enterprise_configs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage enterprise" ON wdihp_enterprise_configs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update enterprise" ON wdihp_enterprise_configs FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth view gov" ON wdihp_government_configs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth manage gov" ON wdihp_government_configs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth view audits" ON wdihp_coherence_audits FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert audits" ON wdihp_coherence_audits FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Public view signals" ON wdihp_execution_signals FOR SELECT USING (true);
CREATE POLICY "Auth insert signals" ON wdihp_execution_signals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Public view hardening" ON wdihp_hardening_status FOR SELECT USING (true);
CREATE POLICY "Auth manage hardening" ON wdihp_hardening_status FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update hardening" ON wdihp_hardening_status FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert anomalies" ON wdihp_trust_anomalies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert dampening" ON wdihp_trust_dampening FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert concentration" ON wdihp_trust_concentration FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert recovery" ON wdihp_trust_recovery FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update recovery" ON wdihp_trust_recovery FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth insert escrow freezes" ON wdihp_escrow_freeze_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert escrow logs" ON wdihp_escrow_security_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);