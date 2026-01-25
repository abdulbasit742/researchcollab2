-- Create admin audit logs table
CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Only admins can create audit logs
CREATE POLICY "Admins can create audit logs"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Enable realtime for admin-relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE verification_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
ALTER PUBLICATION supabase_realtime ADD TABLE tool_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE disputes;