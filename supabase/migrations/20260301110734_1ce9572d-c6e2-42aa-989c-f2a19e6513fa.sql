
-- Create super_admin_activity_log (immutable append-only)
CREATE TABLE IF NOT EXISTS public.super_admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_entity_type TEXT,
  target_entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.super_admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admins_read_activity_log"
  ON public.super_admin_activity_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "super_admins_insert_activity_log"
  ON public.super_admin_activity_log FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') AND super_admin_id = auth.uid());

CREATE INDEX idx_sa_activity_log_admin ON public.super_admin_activity_log(super_admin_id);
CREATE INDEX idx_sa_activity_log_created ON public.super_admin_activity_log(created_at DESC);

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin') $$;
