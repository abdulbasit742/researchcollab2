
-- KYC Profiles
CREATE TABLE public.kyc_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id),
  region_id UUID REFERENCES public.regions(id),
  document_type TEXT NOT NULL,
  document_hash TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compliance Risk Profiles
CREATE TABLE public.compliance_risk_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  aml_score NUMERIC NOT NULL DEFAULT 0,
  compliance_risk_score NUMERIC NOT NULL DEFAULT 0,
  flagged BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,
  last_assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Suspicious Transactions
CREATE TABLE public.suspicious_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Capital Source Profiles
CREATE TABLE public.capital_source_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contributor_id UUID NOT NULL,
  pool_id UUID REFERENCES public.capital_pools(id),
  declared_source TEXT NOT NULL,
  source_verified BOOLEAN NOT NULL DEFAULT false,
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compliance Alerts
CREATE TABLE public.compliance_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  region_id UUID REFERENCES public.regions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compliance Audit Logs
CREATE TABLE public.compliance_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  user_id UUID,
  region_id UUID REFERENCES public.regions(id),
  compliance_flag BOOLEAN DEFAULT false,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_kyc_profiles_user ON public.kyc_profiles(user_id);
CREATE INDEX idx_kyc_profiles_status ON public.kyc_profiles(verification_status);
CREATE INDEX idx_compliance_risk_user ON public.compliance_risk_profiles(user_id);
CREATE INDEX idx_suspicious_tx_user ON public.suspicious_transactions(user_id);
CREATE INDEX idx_capital_source_contributor ON public.capital_source_profiles(contributor_id);
CREATE INDEX idx_compliance_alerts_user ON public.compliance_alerts(user_id);
CREATE INDEX idx_compliance_alerts_resolved ON public.compliance_alerts(resolved);
CREATE INDEX idx_compliance_audit_logs_user ON public.compliance_audit_logs(user_id);

-- RLS
ALTER TABLE public.kyc_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspicious_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_source_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own KYC
CREATE POLICY "Users view own KYC" ON public.kyc_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users insert own KYC" ON public.kyc_profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Risk profiles: own only
CREATE POLICY "Users view own risk profile" ON public.compliance_risk_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Suspicious transactions: own only
CREATE POLICY "Users view own suspicious tx" ON public.suspicious_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Capital source: own only
CREATE POLICY "Users view own capital source" ON public.capital_source_profiles FOR SELECT TO authenticated
  USING (contributor_id = auth.uid());
CREATE POLICY "Users insert own capital source" ON public.capital_source_profiles FOR INSERT TO authenticated
  WITH CHECK (contributor_id = auth.uid());

-- Compliance alerts: own only
CREATE POLICY "Users view own compliance alerts" ON public.compliance_alerts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Audit logs: admin via service role
CREATE POLICY "Service manage compliance_audit_logs" ON public.compliance_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Service role for all compliance tables (admin operations)
CREATE POLICY "Service manage kyc_profiles" ON public.kyc_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage compliance_risk_profiles" ON public.compliance_risk_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage suspicious_transactions" ON public.suspicious_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage capital_source_profiles" ON public.capital_source_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage compliance_alerts" ON public.compliance_alerts FOR ALL TO service_role USING (true) WITH CHECK (true);
