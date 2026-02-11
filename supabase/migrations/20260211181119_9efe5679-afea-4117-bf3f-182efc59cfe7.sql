
-- Constitutional Invariants
CREATE TABLE public.constitutional_invariants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invariant_name TEXT NOT NULL,
  description TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  monitoring_metric TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.constitutional_invariants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read invariants" ON public.constitutional_invariants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage invariants" ON public.constitutional_invariants FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Constitutional Violations
CREATE TABLE public.constitutional_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invariant_id UUID REFERENCES public.constitutional_invariants(id) NOT NULL,
  detected_value NUMERIC NOT NULL,
  severity_level TEXT NOT NULL DEFAULT 'info',
  flagged_by TEXT NOT NULL DEFAULT 'AI',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.constitutional_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read violations" ON public.constitutional_violations FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert violations" ON public.constitutional_violations FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update violations" ON public.constitutional_violations FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE INDEX idx_violations_invariant ON public.constitutional_violations(invariant_id);
CREATE INDEX idx_violations_severity ON public.constitutional_violations(severity_level);

-- Guardian Audit Logs
CREATE TABLE public.guardian_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_checked TEXT NOT NULL,
  anomaly_score NUMERIC NOT NULL DEFAULT 0,
  explanation JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guardian_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit logs" ON public.guardian_audit_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "System can insert audit logs" ON public.guardian_audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- Bias Monitoring Records
CREATE TABLE public.bias_monitoring_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_name TEXT NOT NULL,
  bias_score NUMERIC NOT NULL DEFAULT 0,
  affected_group TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bias_monitoring_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read bias records" ON public.bias_monitoring_records FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "System can insert bias records" ON public.bias_monitoring_records FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- Concentration Metrics
CREATE TABLE public.concentration_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  concentration_index NUMERIC NOT NULL DEFAULT 0,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.concentration_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read concentration" ON public.concentration_metrics FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "System can insert concentration" ON public.concentration_metrics FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX idx_concentration_type ON public.concentration_metrics(metric_type);

-- Seed default invariants
INSERT INTO public.constitutional_invariants (invariant_name, description, threshold_value, monitoring_metric) VALUES
  ('trust_distribution_skew', 'Trust scores must not concentrate above 0.6 Gini coefficient', 0.6, 'trust_gini'),
  ('capital_concentration', 'No single user may hold >15% of total platform capital', 15, 'max_capital_share_pct'),
  ('governance_vote_imbalance', 'No single institution may control >30% of governance votes', 30, 'max_vote_share_pct'),
  ('dispute_clustering', 'Dispute rate must stay below 20% platform-wide', 20, 'platform_dispute_rate'),
  ('visibility_concentration', 'Top 10% users must not capture >60% of visibility', 60, 'top10_visibility_pct'),
  ('institutional_dominance', 'No institution may exceed 25% of active deals', 25, 'max_inst_deal_share_pct');
