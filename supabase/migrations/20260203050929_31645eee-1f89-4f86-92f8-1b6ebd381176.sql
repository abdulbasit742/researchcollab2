-- Phase 5-6: Enterprise/University Mode & Admin Safety Controls

-- Extend organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS parent_org_id UUID REFERENCES organizations(id),
ADD COLUMN IF NOT EXISTS org_trust_score INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS sla_tier TEXT DEFAULT 'standard' CHECK (sla_tier IN ('standard', 'premium', 'enterprise')),
ADD COLUMN IF NOT EXISTS custom_pricing_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS invoice_prefix TEXT,
ADD COLUMN IF NOT EXISTS data_retention_days INTEGER DEFAULT 365;

-- Create org_departments table
CREATE TABLE public.org_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  head_user_id UUID,
  budget_limit NUMERIC,
  member_limit INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Extend organization_members table
ALTER TABLE public.organization_members
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES org_departments(id),
ADD COLUMN IF NOT EXISTS is_faculty_admin BOOLEAN DEFAULT false;

-- Create student_cohorts table
CREATE TABLE public.student_cohorts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  supervisor_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cohort_members table
CREATE TABLE public.cohort_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort_id UUID NOT NULL REFERENCES student_cohorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  enrollment_status TEXT NOT NULL DEFAULT 'active' CHECK (enrollment_status IN ('active', 'inactive', 'graduated', 'withdrawn')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cohort_id, user_id)
);

-- Create org_internal_projects table
CREATE TABLE public.org_internal_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES org_departments(id),
  earning_project_id UUID NOT NULL REFERENCES earning_projects(id) ON DELETE CASCADE,
  visibility TEXT NOT NULL DEFAULT 'org_only' CHECK (visibility IN ('org_only', 'department_only', 'public')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(earning_project_id)
);

-- Phase 6: Admin Safety Controls

-- Create user_restrictions table
CREATE TABLE public.user_restrictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  restriction_type TEXT NOT NULL CHECK (restriction_type IN ('shadow_ban', 'rate_limit', 'feature_block', 'posting_ban', 'bidding_ban', 'withdrawal_hold')),
  reason TEXT NOT NULL,
  applied_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_notes table
CREATE TABLE public.admin_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'project', 'org', 'offer', 'dispute', 'wallet')),
  entity_id UUID NOT NULL,
  note TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rate_limits table
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL CHECK (action_type IN ('bid', 'message', 'project', 'offer', 'withdrawal', 'report')),
  role TEXT NOT NULL CHECK (role IN ('student', 'researcher', 'all')),
  max_per_hour INTEGER NOT NULL,
  max_per_day INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(action_type, role)
);

-- Insert default rate limits
INSERT INTO public.rate_limits (action_type, role, max_per_hour, max_per_day) VALUES
('bid', 'all', 10, 50),
('message', 'all', 60, 500),
('project', 'all', 5, 10),
('offer', 'all', 10, 30),
('withdrawal', 'all', 3, 5),
('report', 'all', 5, 10);

-- Create flagged_behaviors table
CREATE TABLE public.flagged_behaviors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  behavior_type TEXT NOT NULL CHECK (behavior_type IN ('spam', 'abuse', 'fraud', 'impersonation', 'harassment', 'policy_violation', 'suspicious_activity')),
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  auto_flagged BOOLEAN NOT NULL DEFAULT false,
  ai_confidence NUMERIC(5,2),
  reviewed BOOLEAN NOT NULL DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.org_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_internal_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flagged_behaviors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for org_departments
CREATE POLICY "Org members can view their departments"
ON public.org_departments FOR SELECT
USING (
  org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid())
  OR is_admin(auth.uid())
);

CREATE POLICY "Admins and org admins can manage departments"
ON public.org_departments FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for student_cohorts
CREATE POLICY "Org members can view cohorts"
ON public.student_cohorts FOR SELECT
USING (
  org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid())
  OR is_admin(auth.uid())
);

CREATE POLICY "Admins can manage cohorts"
ON public.student_cohorts FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for cohort_members
CREATE POLICY "Users can view their cohort membership"
ON public.cohort_members FOR SELECT
USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage cohort members"
ON public.cohort_members FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for org_internal_projects
CREATE POLICY "Org members can view internal projects"
ON public.org_internal_projects FOR SELECT
USING (
  org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid())
  OR is_admin(auth.uid())
);

CREATE POLICY "Admins can manage internal projects"
ON public.org_internal_projects FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for user_restrictions
CREATE POLICY "Admins can manage restrictions"
ON public.user_restrictions FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for admin_notes
CREATE POLICY "Admins can manage notes"
ON public.admin_notes FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for rate_limits
CREATE POLICY "Anyone can view rate limits"
ON public.rate_limits FOR SELECT
USING (true);

CREATE POLICY "Admins can manage rate limits"
ON public.rate_limits FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for flagged_behaviors
CREATE POLICY "Admins can manage flagged behaviors"
ON public.flagged_behaviors FOR ALL
USING (is_admin(auth.uid()));

-- Function to check if user is restricted
CREATE OR REPLACE FUNCTION public.is_user_restricted(p_user_id UUID, p_restriction_type TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_restrictions
    WHERE user_id = p_user_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (p_restriction_type IS NULL OR restriction_type = p_restriction_type)
  );
$$;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_user_id UUID, p_action_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_limit rate_limits%ROWTYPE;
  v_hourly_count INTEGER;
  v_daily_count INTEGER;
BEGIN
  -- Get user role
  SELECT role INTO v_role FROM profiles WHERE id = p_user_id;
  
  -- Get applicable limit (role-specific first, then 'all')
  SELECT * INTO v_limit FROM rate_limits 
  WHERE action_type = p_action_type AND role = v_role AND is_active = true
  LIMIT 1;
  
  IF v_limit.id IS NULL THEN
    SELECT * INTO v_limit FROM rate_limits 
    WHERE action_type = p_action_type AND role = 'all' AND is_active = true
    LIMIT 1;
  END IF;
  
  IF v_limit.id IS NULL THEN
    RETURN true; -- No limit configured
  END IF;
  
  -- Count recent actions (implementation depends on action type)
  -- This is a placeholder - actual implementation would query relevant tables
  RETURN true;
END;
$$;

-- Function to apply restriction
CREATE OR REPLACE FUNCTION public.apply_user_restriction(
  p_user_id UUID,
  p_restriction_type TEXT,
  p_reason TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_restriction_id UUID;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can apply restrictions';
  END IF;
  
  INSERT INTO user_restrictions (user_id, restriction_type, reason, applied_by, expires_at)
  VALUES (p_user_id, p_restriction_type, p_reason, auth.uid(), p_expires_at)
  RETURNING id INTO v_restriction_id;
  
  -- Log the action
  INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), 'apply_restriction', 'user', p_user_id, 
          jsonb_build_object('type', p_restriction_type, 'reason', p_reason, 'expires_at', p_expires_at));
  
  -- Notify user (if not shadow ban)
  IF p_restriction_type != 'shadow_ban' THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (p_user_id, 'restriction_applied', 'Account Restriction', 
            'A restriction has been applied to your account. Please contact support for details.',
            jsonb_build_object('type', p_restriction_type));
  END IF;
  
  RETURN v_restriction_id;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_departments_org ON org_departments(org_id);
CREATE INDEX IF NOT EXISTS idx_student_cohorts_org ON student_cohorts(org_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_cohort ON cohort_members(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_user ON cohort_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_internal_projects_org ON org_internal_projects(org_id);
CREATE INDEX IF NOT EXISTS idx_user_restrictions_user ON user_restrictions(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_admin_notes_entity ON admin_notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_flagged_behaviors_severity ON flagged_behaviors(severity) WHERE reviewed = false;
CREATE INDEX IF NOT EXISTS idx_flagged_behaviors_user ON flagged_behaviors(user_id);