
-- =====================================================
-- PROMPT 8: GLOBAL RESEARCH GOVERNANCE & COMPLIANCE SYSTEM (GRGCS)
-- =====================================================

-- 1. Grant Compliance Checkpoints
CREATE TABLE public.grant_compliance_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID NOT NULL,
  checkpoint_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  responsible_user_id UUID,
  institution_id UUID,
  evidence JSONB DEFAULT '{}',
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  ledger_entry_id UUID,
  version_snapshot JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Compliance Integrity Scores
CREATE TABLE public.compliance_integrity_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  overall_cis NUMERIC DEFAULT 0,
  on_time_reporting NUMERIC DEFAULT 0,
  budget_variance NUMERIC DEFAULT 0,
  audit_pass_rate NUMERIC DEFAULT 0,
  escrow_adherence NUMERIC DEFAULT 0,
  dispute_frequency NUMERIC DEFAULT 0,
  regulatory_violations NUMERIC DEFAULT 0,
  ethical_breach_flags NUMERIC DEFAULT 0,
  documentation_completeness NUMERIC DEFAULT 0,
  renewal_trust_factor NUMERIC DEFAULT 0,
  cross_border_stability NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Ethics & Research Integrity Records
CREATE TABLE public.research_ethics_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID,
  project_id UUID,
  researcher_id UUID,
  institution_id UUID,
  record_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approval_reference TEXT,
  expiry_date DATE,
  review_body TEXT,
  notes TEXT,
  flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Regulatory Templates
CREATE TABLE public.regulatory_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regulation_name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  category TEXT NOT NULL,
  requirements JSONB DEFAULT '[]',
  reporting_frequency TEXT,
  data_localization_required BOOLEAN DEFAULT false,
  export_control_applicable BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Cross-Border Compliance Matrix
CREATE TABLE public.cross_border_compliance_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID,
  country_a TEXT NOT NULL,
  country_b TEXT NOT NULL,
  regulatory_conflicts JSONB DEFAULT '[]',
  reporting_mismatches JSONB DEFAULT '[]',
  ip_ownership_clarity TEXT DEFAULT 'unclear',
  export_control_conflicts BOOLEAN DEFAULT false,
  sanction_risk_detected BOOLEAN DEFAULT false,
  funding_body_compatible BOOLEAN DEFAULT true,
  overall_risk_level TEXT DEFAULT 'low',
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Compliance Anomaly Flags
CREATE TABLE public.compliance_anomaly_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  anomaly_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  evidence JSONB DEFAULT '{}',
  ai_confidence NUMERIC DEFAULT 0,
  human_reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Compliance Forecasts
CREATE TABLE public.compliance_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  compliance_failure_risk NUMERIC DEFAULT 0,
  budget_overrun_risk NUMERIC DEFAULT 0,
  reporting_delay_risk NUMERIC DEFAULT 0,
  regulatory_breach_risk NUMERIC DEFAULT 0,
  audit_failure_risk NUMERIC DEFAULT 0,
  ethics_review_delay_risk NUMERIC DEFAULT 0,
  explanation JSONB DEFAULT '{}',
  model_version TEXT DEFAULT 'v1',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Research Data Governance
CREATE TABLE public.research_data_governance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID,
  project_id UUID,
  institution_id UUID,
  data_storage_compliant BOOLEAN DEFAULT false,
  access_control_validated BOOLEAN DEFAULT false,
  data_sharing_approved BOOLEAN DEFAULT false,
  retention_period_compliant BOOLEAN DEFAULT false,
  cross_border_transfer_flagged BOOLEAN DEFAULT false,
  encryption_verified BOOLEAN DEFAULT false,
  sensitive_classification TEXT,
  access_violations INTEGER DEFAULT 0,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Government Oversight Views
CREATE TABLE public.government_oversight_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  period TEXT NOT NULL,
  funding_distribution JSONB DEFAULT '{}',
  compliance_ranking JSONB DEFAULT '[]',
  domain_risk_clusters JSONB DEFAULT '[]',
  audit_pass_fail_trends JSONB DEFAULT '{}',
  escrow_integrity_metrics JSONB DEFAULT '{}',
  cross_border_compliance JSONB DEFAULT '{}',
  emerging_ethics_risks JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grant_compliance_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_integrity_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_ethics_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_border_compliance_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_anomaly_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_data_governance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_oversight_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated read
CREATE POLICY "Auth read grant_compliance_checkpoints" ON public.grant_compliance_checkpoints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read compliance_integrity_scores" ON public.compliance_integrity_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read research_ethics_records" ON public.research_ethics_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read regulatory_templates" ON public.regulatory_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read cross_border_compliance" ON public.cross_border_compliance_matrix FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read compliance_anomaly_flags" ON public.compliance_anomaly_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read compliance_forecasts" ON public.compliance_forecasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read research_data_governance" ON public.research_data_governance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read government_oversight" ON public.government_oversight_snapshots FOR SELECT TO authenticated USING (true);

-- RLS: Write
CREATE POLICY "Auth insert compliance_checkpoints" ON public.grant_compliance_checkpoints FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert compliance_scores" ON public.compliance_integrity_scores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert ethics_records" ON public.research_ethics_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert regulatory_templates" ON public.regulatory_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert cross_border" ON public.cross_border_compliance_matrix FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert compliance_anomalies" ON public.compliance_anomaly_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert compliance_forecasts" ON public.compliance_forecasts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert data_governance" ON public.research_data_governance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert gov_oversight" ON public.government_oversight_snapshots FOR INSERT TO authenticated WITH CHECK (true);

-- Public read for regulatory templates
CREATE POLICY "Anon read regulatory_templates" ON public.regulatory_templates FOR SELECT TO anon USING (true);
