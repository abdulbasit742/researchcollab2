-- =====================================================
-- FORMAL PERMISSION MATRIX (RBAC) - PRE-STRIPE SECURITY
-- =====================================================

-- 1️⃣ permission_definitions: All possible actions in the system
CREATE TABLE public.permission_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_key TEXT NOT NULL UNIQUE,
  entity_type TEXT NOT NULL,
  description TEXT,
  is_stripe_related BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2️⃣ role_permissions: Maps roles → allowed actions
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  action_key TEXT NOT NULL REFERENCES public.permission_definitions(action_key) ON DELETE CASCADE,
  allowed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role, action_key)
);

-- 3️⃣ contextual_permissions: User-specific overrides in context
CREATE TABLE public.contextual_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL, -- 'organization', 'project', 'institution'
  context_id UUID NOT NULL,
  action_key TEXT NOT NULL REFERENCES public.permission_definitions(action_key) ON DELETE CASCADE,
  allowed BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, context_type, context_id, action_key)
);

-- 4️⃣ permission_audit_logs: All permission changes logged
CREATE TABLE public.permission_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- 'grant', 'revoke', 'modify'
  target_table TEXT NOT NULL, -- 'role_permissions', 'contextual_permissions'
  target_id UUID,
  action_key TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.permission_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contextual_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CORE PERMISSION CHECK FUNCTION (SINGLE SOURCE OF TRUTH)
-- =====================================================

CREATE OR REPLACE FUNCTION public.check_permission(
  _user_id UUID,
  _action_key TEXT,
  _context_type TEXT DEFAULT NULL,
  _context_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_role app_role;
  _is_admin BOOLEAN;
  _contextual_allowed BOOLEAN;
  _role_allowed BOOLEAN;
  _permission_exists BOOLEAN;
BEGIN
  -- Check if permission exists at all
  SELECT EXISTS(SELECT 1 FROM permission_definitions WHERE action_key = _action_key)
  INTO _permission_exists;
  
  IF NOT _permission_exists THEN
    RETURN false; -- Unknown permission = deny
  END IF;

  -- Check if user is admin (admins always allowed)
  SELECT public.is_admin(_user_id) INTO _is_admin;
  IF _is_admin THEN
    RETURN true;
  END IF;

  -- Get user's role
  SELECT role INTO _user_role
  FROM user_roles
  WHERE user_id = _user_id
  LIMIT 1;

  IF _user_role IS NULL THEN
    RETURN false; -- No role = deny
  END IF;

  -- Check contextual override (highest priority after admin)
  IF _context_type IS NOT NULL AND _context_id IS NOT NULL THEN
    SELECT allowed INTO _contextual_allowed
    FROM contextual_permissions
    WHERE user_id = _user_id
      AND context_type = _context_type
      AND context_id = _context_id
      AND action_key = _action_key
      AND (expires_at IS NULL OR expires_at > now());
    
    IF _contextual_allowed IS NOT NULL THEN
      RETURN _contextual_allowed;
    END IF;
  END IF;

  -- Check role-based permission (fallback)
  SELECT allowed INTO _role_allowed
  FROM role_permissions
  WHERE role = _user_role
    AND action_key = _action_key;

  IF _role_allowed IS NOT NULL THEN
    RETURN _role_allowed;
  END IF;

  -- Default: deny
  RETURN false;
END;
$$;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Permission definitions: Everyone can read, only admins can modify
CREATE POLICY "Anyone can view permission definitions"
  ON public.permission_definitions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage permission definitions"
  ON public.permission_definitions FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Role permissions: Everyone can read, only admins can modify
CREATE POLICY "Anyone can view role permissions"
  ON public.role_permissions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage role permissions"
  ON public.role_permissions FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Contextual permissions: Users see their own, admins see all
CREATE POLICY "Users can view own contextual permissions"
  ON public.contextual_permissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage contextual permissions"
  ON public.contextual_permissions FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Audit logs: Only admins can view
CREATE POLICY "Admins can view audit logs"
  ON public.permission_audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs"
  ON public.permission_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (admin_id = auth.uid() AND public.is_admin(auth.uid()));

-- =====================================================
-- SEED PERMISSION DEFINITIONS
-- =====================================================

INSERT INTO public.permission_definitions (action_key, entity_type, description, is_stripe_related) VALUES
-- Wallet permissions
('wallet.view', 'wallet', 'View wallet balance and transactions', false),
('wallet.topup', 'wallet', 'Add funds to wallet', true),
('wallet.withdraw', 'wallet', 'Withdraw funds from wallet', true),

-- Escrow permissions
('escrow.fund', 'escrow', 'Fund an escrow for a milestone', true),
('escrow.release', 'escrow', 'Release escrow funds to recipient', true),
('escrow.dispute', 'escrow', 'Raise a dispute on escrow', false),

-- Project permissions
('project.create', 'project', 'Create new projects', false),
('project.edit', 'project', 'Edit own projects', false),
('project.delete', 'project', 'Delete own projects', false),
('project.bid', 'project', 'Place bids on projects', false),
('project.manage', 'project', 'Manage project settings', false),
('project.approve_bid', 'project', 'Approve bids on own projects', false),

-- Message permissions
('message.send', 'message', 'Send messages', false),
('message.read', 'message', 'Read messages', false),
('message.delete', 'message', 'Delete own messages', false),

-- Admin permissions
('admin.access', 'admin', 'Access admin portal', false),
('admin.manage_users', 'admin', 'Manage user accounts', false),
('admin.manage_finance', 'admin', 'Access financial dashboards', false),
('admin.manage_verifications', 'admin', 'Approve/reject verifications', false),
('admin.manage_reports', 'admin', 'Handle user reports', false),
('admin.manage_permissions', 'admin', 'Modify permission matrix', false),

-- Verification permissions
('verification.submit', 'verification', 'Submit verification request', false),
('verification.approve', 'verification', 'Approve verifications', false),
('verification.reject', 'verification', 'Reject verifications', false),

-- Dataset permissions
('dataset.create', 'dataset', 'Create datasets', false),
('dataset.request_access', 'dataset', 'Request access to datasets', false),
('dataset.approve_access', 'dataset', 'Approve dataset access requests', false),

-- Publication permissions
('publication.create', 'publication', 'Create publications', false),
('publication.edit', 'publication', 'Edit own publications', false),

-- Tool permissions
('tool.create', 'tool', 'List tools for sale', false),
('tool.purchase', 'tool', 'Purchase tools', true),

-- Organization permissions
('org.create', 'organization', 'Create organizations', false),
('org.manage', 'organization', 'Manage organization settings', false),
('org.invite', 'organization', 'Invite members to organization', false),

-- Feed permissions
('feed.post', 'feed', 'Create feed posts', false),
('feed.comment', 'feed', 'Comment on posts', false),
('feed.moderate', 'feed', 'Moderate feed content', false);

-- =====================================================
-- SEED ROLE PERMISSIONS
-- =====================================================

-- Student permissions
INSERT INTO public.role_permissions (role, action_key, allowed) VALUES
('student', 'wallet.view', true),
('student', 'wallet.topup', false), -- Stripe not yet enabled
('student', 'wallet.withdraw', false),
('student', 'escrow.fund', false),
('student', 'escrow.release', false),
('student', 'escrow.dispute', true),
('student', 'project.create', false),
('student', 'project.edit', false),
('student', 'project.delete', false),
('student', 'project.bid', true),
('student', 'project.manage', false),
('student', 'project.approve_bid', false),
('student', 'message.send', true),
('student', 'message.read', true),
('student', 'message.delete', true),
('student', 'admin.access', false),
('student', 'admin.manage_users', false),
('student', 'admin.manage_finance', false),
('student', 'admin.manage_verifications', false),
('student', 'admin.manage_reports', false),
('student', 'admin.manage_permissions', false),
('student', 'verification.submit', true),
('student', 'verification.approve', false),
('student', 'verification.reject', false),
('student', 'dataset.create', false),
('student', 'dataset.request_access', true),
('student', 'dataset.approve_access', false),
('student', 'publication.create', false),
('student', 'publication.edit', false),
('student', 'tool.create', false),
('student', 'tool.purchase', false),
('student', 'org.create', false),
('student', 'org.manage', false),
('student', 'org.invite', false),
('student', 'feed.post', true),
('student', 'feed.comment', true),
('student', 'feed.moderate', false);

-- Researcher permissions
INSERT INTO public.role_permissions (role, action_key, allowed) VALUES
('researcher', 'wallet.view', true),
('researcher', 'wallet.topup', false), -- Stripe not yet enabled
('researcher', 'wallet.withdraw', false),
('researcher', 'escrow.fund', false),
('researcher', 'escrow.release', false),
('researcher', 'escrow.dispute', true),
('researcher', 'project.create', true),
('researcher', 'project.edit', true),
('researcher', 'project.delete', true),
('researcher', 'project.bid', true),
('researcher', 'project.manage', true),
('researcher', 'project.approve_bid', true),
('researcher', 'message.send', true),
('researcher', 'message.read', true),
('researcher', 'message.delete', true),
('researcher', 'admin.access', false),
('researcher', 'admin.manage_users', false),
('researcher', 'admin.manage_finance', false),
('researcher', 'admin.manage_verifications', false),
('researcher', 'admin.manage_reports', false),
('researcher', 'admin.manage_permissions', false),
('researcher', 'verification.submit', true),
('researcher', 'verification.approve', false),
('researcher', 'verification.reject', false),
('researcher', 'dataset.create', true),
('researcher', 'dataset.request_access', true),
('researcher', 'dataset.approve_access', true),
('researcher', 'publication.create', true),
('researcher', 'publication.edit', true),
('researcher', 'tool.create', true),
('researcher', 'tool.purchase', false),
('researcher', 'org.create', true),
('researcher', 'org.manage', true),
('researcher', 'org.invite', true),
('researcher', 'feed.post', true),
('researcher', 'feed.comment', true),
('researcher', 'feed.moderate', false);

-- Admin permissions (all allowed)
INSERT INTO public.role_permissions (role, action_key, allowed) VALUES
('admin', 'wallet.view', true),
('admin', 'wallet.topup', true),
('admin', 'wallet.withdraw', true),
('admin', 'escrow.fund', true),
('admin', 'escrow.release', true),
('admin', 'escrow.dispute', true),
('admin', 'project.create', true),
('admin', 'project.edit', true),
('admin', 'project.delete', true),
('admin', 'project.bid', true),
('admin', 'project.manage', true),
('admin', 'project.approve_bid', true),
('admin', 'message.send', true),
('admin', 'message.read', true),
('admin', 'message.delete', true),
('admin', 'admin.access', true),
('admin', 'admin.manage_users', true),
('admin', 'admin.manage_finance', true),
('admin', 'admin.manage_verifications', true),
('admin', 'admin.manage_reports', true),
('admin', 'admin.manage_permissions', true),
('admin', 'verification.submit', true),
('admin', 'verification.approve', true),
('admin', 'verification.reject', true),
('admin', 'dataset.create', true),
('admin', 'dataset.request_access', true),
('admin', 'dataset.approve_access', true),
('admin', 'publication.create', true),
('admin', 'publication.edit', true),
('admin', 'tool.create', true),
('admin', 'tool.purchase', true),
('admin', 'org.create', true),
('admin', 'org.manage', true),
('admin', 'org.invite', true),
('admin', 'feed.post', true),
('admin', 'feed.comment', true),
('admin', 'feed.moderate', true);

-- Create indexes for performance
CREATE INDEX idx_role_permissions_role ON public.role_permissions(role);
CREATE INDEX idx_role_permissions_action ON public.role_permissions(action_key);
CREATE INDEX idx_contextual_permissions_user ON public.contextual_permissions(user_id);
CREATE INDEX idx_contextual_permissions_context ON public.contextual_permissions(context_type, context_id);
CREATE INDEX idx_contextual_permissions_expires ON public.contextual_permissions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_permission_audit_logs_admin ON public.permission_audit_logs(admin_id);
CREATE INDEX idx_permission_audit_logs_action ON public.permission_audit_logs(action_key);
CREATE INDEX idx_permission_audit_logs_created ON public.permission_audit_logs(created_at DESC);