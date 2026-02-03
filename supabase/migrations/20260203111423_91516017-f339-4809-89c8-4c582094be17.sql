
-- =====================================================
-- PHASE 11: INSTITUTIONAL & NATIONAL RESEARCH INTELLIGENCE
-- =====================================================

-- 1️⃣ Institution Research Snapshots (aggregated metrics)
CREATE TABLE public.institution_research_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  active_research_timelines INTEGER DEFAULT 0,
  completed_research_timelines INTEGER DEFAULT 0,
  total_publications INTEGER DEFAULT 0,
  total_researchers INTEGER DEFAULT 0,
  funding_received NUMERIC(15, 2) DEFAULT 0,
  funding_utilized NUMERIC(15, 2) DEFAULT 0,
  collaborations_count INTEGER DEFAULT 0,
  external_collaborations INTEGER DEFAULT 0,
  interdisciplinary_score NUMERIC(5, 2) DEFAULT 0,
  avg_project_completion_rate NUMERIC(5, 2) DEFAULT 0,
  research_domains JSONB DEFAULT '[]'::jsonb,
  snapshot_period TEXT NOT NULL DEFAULT 'monthly',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(institution_id, period_start, period_end)
);

-- 2️⃣ National Research Snapshots (country-level intelligence)
CREATE TABLE public.national_research_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  total_institutions INTEGER DEFAULT 0,
  total_researchers INTEGER DEFAULT 0,
  total_active_research INTEGER DEFAULT 0,
  total_publications INTEGER DEFAULT 0,
  research_domains JSONB DEFAULT '{}'::jsonb,
  funding_distribution JSONB DEFAULT '{}'::jsonb,
  institution_participation JSONB DEFAULT '[]'::jsonb,
  talent_flow_metrics JSONB DEFAULT '{}'::jsonb,
  collaboration_density NUMERIC(5, 2) DEFAULT 0,
  international_collaboration_rate NUMERIC(5, 2) DEFAULT 0,
  avg_funding_per_researcher NUMERIC(15, 2) DEFAULT 0,
  top_research_areas JSONB DEFAULT '[]'::jsonb,
  emerging_domains JSONB DEFAULT '[]'::jsonb,
  snapshot_period TEXT NOT NULL DEFAULT 'monthly',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(country_code, period_start, period_end)
);

-- 3️⃣ Institution Research Links (scholar-institution anchoring)
CREATE TABLE public.institution_research_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'researcher', 'faculty', 'postdoc', 'visiting', 'affiliate')),
  department TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(institution_id, scholar_passport_id, start_date)
);

-- 4️⃣ Policy Insight Flags (system-generated insights)
CREATE TABLE public.policy_insight_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL CHECK (scope IN ('institution', 'national', 'regional', 'global')),
  scope_id TEXT,
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'underfunded_domain',
    'high_output_low_funding',
    'brain_drain_risk',
    'brain_gain_opportunity',
    'collaboration_gap',
    'emerging_strength',
    'declining_activity',
    'funding_efficiency_issue',
    'talent_concentration',
    'interdisciplinary_opportunity'
  )),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'attention', 'warning', 'critical')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  detailed_analysis JSONB DEFAULT '{}'::jsonb,
  affected_domains TEXT[] DEFAULT '{}',
  recommendations JSONB DEFAULT '[]'::jsonb,
  data_sources JSONB DEFAULT '[]'::jsonb,
  confidence_score NUMERIC(3, 2) DEFAULT 0.5,
  is_active BOOLEAN DEFAULT true,
  acknowledged_by UUID REFERENCES public.profiles(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5️⃣ Institution Dashboard Access (governance)
CREATE TABLE public.institution_dashboard_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'viewer' CHECK (access_level IN ('viewer', 'analyst', 'admin')),
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(institution_id, user_id)
);

-- 6️⃣ National Dashboard Access (governance for government/policy users)
CREATE TABLE public.national_dashboard_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'viewer' CHECK (access_level IN ('viewer', 'analyst', 'policy_maker', 'admin')),
  organization_affiliation TEXT,
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(country_code, user_id)
);

-- 7️⃣ Research Domain Registry (standardized domains)
CREATE TABLE public.research_domain_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_code TEXT NOT NULL UNIQUE,
  domain_name TEXT NOT NULL,
  parent_domain_id UUID REFERENCES public.research_domain_registry(id),
  description TEXT,
  is_interdisciplinary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8️⃣ Dashboard Audit Logs (compliance & governance)
CREATE TABLE public.dashboard_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_type TEXT NOT NULL CHECK (dashboard_type IN ('institution', 'national', 'regional')),
  scope_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  data_accessed JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_inst_research_snapshots_institution ON public.institution_research_snapshots(institution_id);
CREATE INDEX idx_inst_research_snapshots_period ON public.institution_research_snapshots(period_start, period_end);
CREATE INDEX idx_national_snapshots_country ON public.national_research_snapshots(country_code);
CREATE INDEX idx_national_snapshots_period ON public.national_research_snapshots(period_start, period_end);
CREATE INDEX idx_inst_research_links_institution ON public.institution_research_links(institution_id);
CREATE INDEX idx_inst_research_links_scholar ON public.institution_research_links(scholar_passport_id);
CREATE INDEX idx_inst_research_links_user ON public.institution_research_links(user_id);
CREATE INDEX idx_inst_research_links_current ON public.institution_research_links(is_current) WHERE is_current = true;
CREATE INDEX idx_policy_insights_scope ON public.policy_insight_flags(scope, scope_id);
CREATE INDEX idx_policy_insights_type ON public.policy_insight_flags(insight_type);
CREATE INDEX idx_policy_insights_active ON public.policy_insight_flags(is_active) WHERE is_active = true;
CREATE INDEX idx_inst_dashboard_access_institution ON public.institution_dashboard_access(institution_id);
CREATE INDEX idx_inst_dashboard_access_user ON public.institution_dashboard_access(user_id);
CREATE INDEX idx_national_dashboard_access_country ON public.national_dashboard_access(country_code);
CREATE INDEX idx_dashboard_audit_scope ON public.dashboard_audit_logs(dashboard_type, scope_id);
CREATE INDEX idx_dashboard_audit_user ON public.dashboard_audit_logs(user_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.institution_research_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.national_research_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_research_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_insight_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_dashboard_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.national_dashboard_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_domain_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_audit_logs ENABLE ROW LEVEL SECURITY;

-- Institution Research Snapshots: Users with dashboard access or admins
CREATE POLICY "Institution snapshots viewable by authorized users"
  ON public.institution_research_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.institution_dashboard_access
      WHERE institution_id = institution_research_snapshots.institution_id
      AND user_id = auth.uid()
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
    OR is_admin(auth.uid())
  );

-- National Research Snapshots: Users with national dashboard access or admins
CREATE POLICY "National snapshots viewable by authorized users"
  ON public.national_research_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.national_dashboard_access
      WHERE country_code = national_research_snapshots.country_code
      AND user_id = auth.uid()
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
    OR is_admin(auth.uid())
  );

-- Institution Research Links: Members can see their own, institutions can see their links
CREATE POLICY "Users can view their own institution links"
  ON public.institution_research_links FOR SELECT
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can create their own institution links"
  ON public.institution_research_links FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own institution links"
  ON public.institution_research_links FOR UPDATE
  USING (user_id = auth.uid());

-- Policy Insight Flags: Based on scope access
CREATE POLICY "Policy insights viewable by authorized users"
  ON public.policy_insight_flags FOR SELECT
  USING (
    CASE 
      WHEN scope = 'institution' THEN
        EXISTS (
          SELECT 1 FROM public.institution_dashboard_access
          WHERE institution_id::text = policy_insight_flags.scope_id
          AND user_id = auth.uid()
          AND is_active = true
        )
      WHEN scope = 'national' THEN
        EXISTS (
          SELECT 1 FROM public.national_dashboard_access
          WHERE country_code = policy_insight_flags.scope_id
          AND user_id = auth.uid()
          AND is_active = true
        )
      ELSE false
    END
    OR is_admin(auth.uid())
  );

-- Institution Dashboard Access: Institution admins and platform admins
CREATE POLICY "Dashboard access viewable by relevant users"
  ON public.institution_dashboard_access FOR SELECT
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage dashboard access"
  ON public.institution_dashboard_access FOR ALL
  USING (is_admin(auth.uid()));

-- National Dashboard Access: Platform admins only
CREATE POLICY "National dashboard access managed by admins"
  ON public.national_dashboard_access FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own national access"
  ON public.national_dashboard_access FOR SELECT
  USING (user_id = auth.uid());

-- Research Domain Registry: Public read
CREATE POLICY "Research domains are publicly readable"
  ON public.research_domain_registry FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage research domains"
  ON public.research_domain_registry FOR ALL
  USING (is_admin(auth.uid()));

-- Dashboard Audit Logs: Admins only
CREATE POLICY "Audit logs viewable by admins"
  ON public.dashboard_audit_logs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Audit logs insertable by system"
  ON public.dashboard_audit_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- SEED RESEARCH DOMAINS
-- =====================================================

INSERT INTO public.research_domain_registry (domain_code, domain_name, description, is_interdisciplinary) VALUES
  ('CS', 'Computer Science', 'Computing, algorithms, AI, software engineering', false),
  ('MATH', 'Mathematics', 'Pure and applied mathematics', false),
  ('PHYS', 'Physics', 'Theoretical and experimental physics', false),
  ('CHEM', 'Chemistry', 'Chemical sciences and biochemistry', false),
  ('BIO', 'Biology', 'Life sciences and biological research', false),
  ('MED', 'Medicine', 'Medical sciences and healthcare research', false),
  ('ENG', 'Engineering', 'All engineering disciplines', false),
  ('SOC', 'Social Sciences', 'Sociology, psychology, anthropology', false),
  ('ECON', 'Economics', 'Economic theory and applied economics', false),
  ('LAW', 'Law', 'Legal studies and jurisprudence', false),
  ('ARTS', 'Arts & Humanities', 'Literature, history, philosophy, arts', false),
  ('ENV', 'Environmental Science', 'Climate, ecology, environmental studies', false),
  ('DATA', 'Data Science', 'Data analytics, ML, statistical methods', true),
  ('BIOTECH', 'Biotechnology', 'Applied biological sciences', true),
  ('NEURO', 'Neuroscience', 'Brain and cognitive sciences', true),
  ('ENERGY', 'Energy Research', 'Renewable energy, sustainability', true),
  ('HEALTH', 'Public Health', 'Population health, epidemiology', true),
  ('EDU', 'Education', 'Educational research and pedagogy', false);

-- =====================================================
-- TRIGGER: Update is_current on institution_research_links
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_institution_link_current_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_current := NEW.end_date IS NULL OR NEW.end_date > CURRENT_DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER tr_update_institution_link_current
  BEFORE INSERT OR UPDATE ON public.institution_research_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_institution_link_current_status();
