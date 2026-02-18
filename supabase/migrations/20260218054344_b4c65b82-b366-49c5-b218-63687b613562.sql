
-- 1. Governance Role Assignments
CREATE TABLE IF NOT EXISTS public.governance_role_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  external_name TEXT,
  external_org TEXT,
  appointed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  term_ends_at TIMESTAMPTZ,
  vote_weight NUMERIC NOT NULL DEFAULT 1.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sunset_schedule JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_role_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read role_assignments" ON public.governance_role_assignments FOR SELECT USING (true);
CREATE POLICY "Admin manage role_assignments" ON public.governance_role_assignments FOR ALL USING (public.is_admin(auth.uid()));

-- 2. Succession Events
CREATE TABLE IF NOT EXISTS public.succession_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_type TEXT NOT NULL,
  outgoing_role TEXT,
  outgoing_user_id UUID,
  incoming_user_id UUID,
  interim_appointed BOOLEAN DEFAULT false,
  board_vote_scheduled_at TIMESTAMPTZ,
  audit_review_status TEXT DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'initiated',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.succession_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read succession_events" ON public.succession_events FOR SELECT USING (true);
CREATE POLICY "Admin manage succession_events" ON public.succession_events FOR ALL USING (public.is_admin(auth.uid()));

-- 3. Institutional Memory Archive
CREATE TABLE IF NOT EXISTS public.institutional_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT,
  decided_by UUID,
  impact_assessment JSONB,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institutional_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read institutional_memory" ON public.institutional_memory FOR SELECT USING (is_public = true);
CREATE POLICY "Admin manage institutional_memory" ON public.institutional_memory FOR ALL USING (public.is_admin(auth.uid()));

-- 4. Anti-Capture Alerts
CREATE TABLE IF NOT EXISTS public.anti_capture_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  description TEXT NOT NULL,
  detected_values JSONB,
  threshold_breached NUMERIC,
  review_status TEXT DEFAULT 'open',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.anti_capture_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read anti_capture_alerts" ON public.anti_capture_alerts FOR SELECT USING (true);
CREATE POLICY "Admin manage anti_capture_alerts" ON public.anti_capture_alerts FOR ALL USING (public.is_admin(auth.uid()));

-- 5. Strategic Investors
CREATE TABLE IF NOT EXISTS public.strategic_investors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_name TEXT NOT NULL,
  investor_type TEXT NOT NULL,
  share_class TEXT NOT NULL DEFAULT 'class_b',
  investment_amount NUMERIC DEFAULT 0,
  equity_percentage NUMERIC DEFAULT 0,
  voting_rights_percentage NUMERIC DEFAULT 0,
  horizon_years INTEGER DEFAULT 10,
  screening_status TEXT DEFAULT 'pending',
  screening_criteria JSONB DEFAULT '{}',
  governance_protection_clauses JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.strategic_investors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read strategic_investors" ON public.strategic_investors FOR SELECT USING (true);
CREATE POLICY "Admin manage strategic_investors" ON public.strategic_investors FOR ALL USING (public.is_admin(auth.uid()));

-- 6. Capital Raise Rounds
CREATE TABLE IF NOT EXISTS public.capital_raise_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_name TEXT NOT NULL,
  round_type TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  raised_amount NUMERIC DEFAULT 0,
  pre_money_valuation NUMERIC,
  post_money_valuation NUMERIC,
  share_class_issued TEXT DEFAULT 'class_b',
  governance_clauses JSONB DEFAULT '[]',
  max_single_investor_pct NUMERIC DEFAULT 15,
  status TEXT DEFAULT 'planning',
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capital_raise_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read capital_raise_rounds" ON public.capital_raise_rounds FOR SELECT USING (true);
CREATE POLICY "Admin manage capital_raise_rounds" ON public.capital_raise_rounds FOR ALL USING (public.is_admin(auth.uid()));

-- 7. Founder Equity Safeguards
CREATE TABLE IF NOT EXISTS public.founder_equity_safeguards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  safeguard_type TEXT NOT NULL,
  description TEXT NOT NULL,
  threshold_value NUMERIC,
  current_value NUMERIC,
  is_breached BOOLEAN DEFAULT false,
  enforcement_mechanism TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.founder_equity_safeguards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read founder_safeguards" ON public.founder_equity_safeguards FOR SELECT USING (true);
CREATE POLICY "Admin manage founder_safeguards" ON public.founder_equity_safeguards FOR ALL USING (public.is_admin(auth.uid()));
