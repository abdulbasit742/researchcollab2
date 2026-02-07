
-- ============================================================
-- POST-LAUNCH OPERATIONS CENTER: Database Schema
-- Incident tracking, feedback triage, change freeze, daily ops
-- ============================================================

-- 1. Incidents table (P0-P3 severity tracking)
CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('p0', 'p1', 'p2', 'p3')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'mitigating', 'resolved', 'postmortem')),
  affected_system TEXT NOT NULL,
  reported_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  postmortem_url TEXT,
  root_cause TEXT,
  impact_summary TEXT,
  users_affected INTEGER DEFAULT 0,
  money_at_risk NUMERIC DEFAULT 0,
  systems_frozen TEXT[] DEFAULT '{}',
  communication_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage incidents"
  ON public.incidents FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 2. Feedback triage table
CREATE TABLE public.feedback_triage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('user_report', 'support_ticket', 'in_app', 'email', 'social', 'internal')),
  raw_feedback TEXT NOT NULL,
  classification TEXT NOT NULL DEFAULT 'unclassified' CHECK (classification IN ('signal', 'noise', 'unclassified')),
  category TEXT CHECK (category IN ('bug', 'ux_friction', 'feature_request', 'performance', 'trust_issue', 'money_issue', 'safety', 'other')),
  frequency INTEGER DEFAULT 1,
  is_blocking BOOLEAN DEFAULT false,
  affects_outcomes BOOLEAN DEFAULT false,
  user_count INTEGER DEFAULT 1,
  priority TEXT DEFAULT 'low' CHECK (priority IN ('critical', 'high', 'medium', 'low', 'ignore')),
  resolution_status TEXT DEFAULT 'open' CHECK (resolution_status IN ('open', 'triaged', 'scheduled', 'resolved', 'wont_fix', 'deferred')),
  resolution_notes TEXT,
  triaged_by UUID REFERENCES public.profiles(id),
  triaged_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback_triage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage feedback"
  ON public.feedback_triage FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can submit feedback"
  ON public.feedback_triage FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

-- 3. Change freeze policy table
CREATE TABLE public.change_freeze_policy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  freeze_type TEXT NOT NULL CHECK (freeze_type IN ('full', 'schema', 'ui', 'feature')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  exceptions TEXT[] DEFAULT '{}',
  allowed_changes TEXT[] DEFAULT ARRAY['bug_fix', 'safety_patch', 'clarity_improvement'],
  reason TEXT NOT NULL,
  enforced_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.change_freeze_policy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage freeze policies"
  ON public.change_freeze_policy FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 4. Daily operating log
CREATE TABLE public.operating_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  log_type TEXT NOT NULL CHECK (log_type IN ('daily_check', 'weekly_review', 'incident_scan', 'health_check', 'money_audit', 'trust_audit', 'abuse_scan')),
  summary TEXT NOT NULL,
  findings JSONB DEFAULT '{}',
  action_items TEXT[] DEFAULT '{}',
  do_not_touch TEXT[] DEFAULT '{}',
  logged_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.operating_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage operating logs"
  ON public.operating_log FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 5. Founder discipline log (idea cooling + data requirements)
CREATE TABLE public.founder_discipline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_title TEXT NOT NULL,
  idea_description TEXT,
  idea_type TEXT NOT NULL CHECK (idea_type IN ('feature', 'ui_change', 'schema_change', 'optimization', 'integration', 'other')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cooling_expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  status TEXT NOT NULL DEFAULT 'cooling' CHECK (status IN ('cooling', 'approved', 'rejected', 'expired')),
  supporting_data TEXT,
  has_usage_proof BOOLEAN DEFAULT false,
  has_incident_report BOOLEAN DEFAULT false,
  requires_schema_change BOOLEAN DEFAULT false,
  decision_reason TEXT,
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES public.profiles(id),
  submitted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_discipline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage founder discipline"
  ON public.founder_discipline FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 6. Post-launch metrics snapshots (only the 5 that matter)
CREATE TABLE public.ops_metrics_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_outcomes INTEGER NOT NULL DEFAULT 0,
  deals_closed_cleanly INTEGER NOT NULL DEFAULT 0,
  trust_variance NUMERIC NOT NULL DEFAULT 0,
  money_flow_incidents INTEGER NOT NULL DEFAULT 0,
  organic_return_rate NUMERIC NOT NULL DEFAULT 0,
  -- Vanity metrics tracked but flagged
  dau INTEGER DEFAULT 0,
  time_spent_avg_minutes NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date)
);

ALTER TABLE public.ops_metrics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage metrics snapshots"
  ON public.ops_metrics_snapshots FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Add updated_at triggers
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_triage_updated_at
  BEFORE UPDATE ON public.feedback_triage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
