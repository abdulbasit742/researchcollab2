-- =============================================
-- FEATURE FLAGS & KILL-SWITCHES SYSTEM
-- =============================================

-- Feature flags table for instant feature control
CREATE TABLE public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_key TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'role', 'organization', 'country', 'user')),
  conditions JSONB DEFAULT '{}',
  is_kill_switch BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feature flag audit log - admin_id nullable for system-generated entries
CREATE TABLE public.feature_flag_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_key TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'enabled', 'disabled', 'updated', 'deleted')),
  previous_state JSONB,
  new_state JSONB,
  admin_id UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- SCHEMA VERSIONING SYSTEM
-- =============================================

CREATE TABLE public.schema_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  applied_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT false,
  rollback_sql TEXT,
  migration_sql TEXT
);

CREATE TABLE public.schema_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schema_version_id UUID REFERENCES public.schema_versions(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('add_table', 'drop_table', 'add_column', 'drop_column', 'rename_column', 'modify_column', 'add_index', 'drop_index', 'add_constraint', 'drop_constraint', 'add_trigger', 'drop_trigger', 'add_function', 'modify_function', 'add_policy', 'modify_policy')),
  table_name TEXT,
  old_definition JSONB,
  new_definition JSONB,
  backward_compatible BOOLEAN NOT NULL DEFAULT true,
  deprecation_notice TEXT,
  deprecation_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_feature_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL,
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_key)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_feature_flags_key ON public.feature_flags(feature_key);
CREATE INDEX idx_feature_flags_scope ON public.feature_flags(scope);
CREATE INDEX idx_feature_flags_kill_switch ON public.feature_flags(is_kill_switch) WHERE is_kill_switch = true;
CREATE INDEX idx_feature_flag_audits_key ON public.feature_flag_audits(feature_key);
CREATE INDEX idx_feature_flag_audits_created ON public.feature_flag_audits(created_at DESC);
CREATE INDEX idx_schema_versions_active ON public.schema_versions(is_active) WHERE is_active = true;
CREATE INDEX idx_schema_changes_version ON public.schema_changes(schema_version_id);
CREATE INDEX idx_user_feature_overrides_user ON public.user_feature_overrides(user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flag_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feature_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags_select" ON public.feature_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "feature_flags_admin_all" ON public.feature_flags FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "feature_flag_audits_admin" ON public.feature_flag_audits FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "schema_versions_admin" ON public.schema_versions FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "schema_changes_admin" ON public.schema_changes FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "user_feature_overrides_admin" ON public.user_feature_overrides FOR ALL USING (is_admin(auth.uid()));

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION public.is_feature_enabled(p_feature_key TEXT, p_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_flag feature_flags%ROWTYPE;
  v_override user_feature_overrides%ROWTYPE;
  v_user_role TEXT;
BEGIN
  SELECT * INTO v_flag FROM feature_flags WHERE feature_key = p_feature_key;
  IF v_flag.id IS NULL THEN RETURN false; END IF;
  IF v_flag.is_kill_switch AND NOT v_flag.enabled THEN RETURN false; END IF;
  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_override FROM user_feature_overrides 
    WHERE user_id = p_user_id AND feature_key = p_feature_key AND (expires_at IS NULL OR expires_at > now());
    IF v_override.id IS NOT NULL THEN RETURN v_override.enabled; END IF;
  END IF;
  CASE v_flag.scope
    WHEN 'global' THEN RETURN v_flag.enabled;
    WHEN 'role' THEN
      IF p_user_id IS NOT NULL THEN
        SELECT role INTO v_user_role FROM user_roles WHERE user_id = p_user_id LIMIT 1;
        IF v_flag.conditions ? v_user_role THEN RETURN (v_flag.conditions->>v_user_role)::boolean; END IF;
      END IF;
      RETURN v_flag.enabled;
    ELSE RETURN v_flag.enabled;
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_single_active_schema_version()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE schema_versions SET is_active = false WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER single_active_schema_version_trigger
BEFORE INSERT OR UPDATE ON public.schema_versions
FOR EACH ROW WHEN (NEW.is_active = true)
EXECUTE FUNCTION public.ensure_single_active_schema_version();

-- =============================================
-- INSERT DEFAULT DATA (No trigger to avoid audit issues)
-- =============================================

INSERT INTO public.feature_flags (feature_key, description, enabled, scope, is_kill_switch, priority) VALUES
  ('payments_enabled', 'Master switch for all payment processing (Stripe)', true, 'global', true, 100),
  ('wallet_withdrawals', 'Enable wallet withdrawal functionality', true, 'global', true, 100),
  ('messaging_realtime', 'Enable realtime messaging system', true, 'global', true, 100),
  ('file_uploads', 'Enable file upload functionality', true, 'global', true, 100),
  ('admin_actions', 'Enable admin panel actions', true, 'global', true, 100),
  ('external_integrations', 'Enable external API integrations', true, 'global', true, 100),
  ('escrow_funding', 'Enable escrow funding for projects', true, 'global', true, 100),
  ('user_registration', 'Enable new user registration', true, 'global', true, 90);

INSERT INTO public.schema_versions (version, description, is_active) VALUES
  ('1.0.0', 'Initial production schema with feature flags and schema versioning', true);