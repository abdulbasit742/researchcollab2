
-- Create missing observability tables referenced by useObservability hook

-- 1. Platform Health Status
CREATE TABLE public.platform_health_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  component TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
  last_check_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_health_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage health status" ON public.platform_health_status
  FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Anyone can read health status" ON public.platform_health_status
  FOR SELECT USING (true);

-- 2. Platform Alerts
CREATE TABLE public.platform_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage alerts" ON public.platform_alerts
  FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can read alerts" ON public.platform_alerts
  FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_health_status;

-- 3. Platform Events
CREATE TABLE public.platform_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  user_id UUID,
  entity_type TEXT,
  entity_id TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage events" ON public.platform_events
  FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_platform_events_created ON platform_events(created_at DESC);
CREATE INDEX idx_platform_events_severity ON platform_events(severity);

-- 4. Platform Integrity Logs
CREATE TABLE public.platform_integrity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  affected_table TEXT NOT NULL,
  affected_ids TEXT[] DEFAULT '{}',
  auto_fixed BOOLEAN DEFAULT false,
  requires_admin_action BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_integrity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage integrity logs" ON public.platform_integrity_logs
  FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_integrity_logs_created ON platform_integrity_logs(created_at DESC);
