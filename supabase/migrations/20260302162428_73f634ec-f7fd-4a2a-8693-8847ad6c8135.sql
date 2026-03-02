
-- Deep Observability Tables
CREATE TABLE public.system_event_telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  entity_type text,
  entity_id text,
  user_id uuid,
  institution_id text,
  node_id text,
  severity_level text NOT NULL DEFAULT 'info',
  trace_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.request_traces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id text NOT NULL,
  route text NOT NULL,
  method text NOT NULL DEFAULT 'GET',
  user_id uuid,
  institution_id text,
  response_status int,
  duration_ms int,
  error_flag boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.endpoint_latency_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  avg_response_ms int,
  p95_ms int,
  p99_ms int,
  error_rate numeric(5,2) DEFAULT 0,
  request_count int DEFAULT 0,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.error_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_hash text NOT NULL,
  error_type text NOT NULL,
  route text,
  frequency int DEFAULT 1,
  last_seen timestamptz DEFAULT now(),
  severity text DEFAULT 'error',
  stack_trace_sanitized text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.system_alert_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  threshold_value numeric NOT NULL,
  severity_level text NOT NULL DEFAULT 'warning',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.storage_operation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id text,
  upload_duration_ms int,
  file_size bigint,
  mime_type text,
  success_flag boolean DEFAULT true,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Stress Resilience Tables
CREATE TABLE public.adaptive_rate_limits_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  base_limit_per_minute int NOT NULL DEFAULT 60,
  burst_limit int NOT NULL DEFAULT 100,
  cooldown_seconds int DEFAULT 30,
  dynamic_adjustment_enabled boolean DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.request_processing_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL,
  entity_id text,
  status text NOT NULL DEFAULT 'queued',
  priority int DEFAULT 5,
  result_data jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE public.system_load_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  current_load_level text NOT NULL DEFAULT 'normal',
  detected_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE public.cached_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_key text NOT NULL UNIQUE,
  entity_type text,
  entity_id text,
  snapshot_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.realtime_connection_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  institution_id text,
  channel_name text,
  connection_started timestamptz NOT NULL DEFAULT now(),
  connection_ended timestamptz,
  duration_seconds int
);

CREATE TABLE public.node_load_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id text NOT NULL,
  active_connections int DEFAULT 0,
  request_throughput int DEFAULT 0,
  cpu_estimate numeric(5,2),
  memory_estimate numeric(5,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.system_event_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endpoint_latency_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alert_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_operation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_rate_limits_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_load_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_connection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_load_metrics ENABLE ROW LEVEL SECURITY;

-- Super admin read access
CREATE POLICY "Super admins read telemetry" ON public.system_event_telemetry FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins read traces" ON public.request_traces FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins read latency" ON public.endpoint_latency_metrics FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins read errors" ON public.error_registry FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins manage alerts" ON public.system_alert_thresholds FOR ALL TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins read storage logs" ON public.storage_operation_logs FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins manage rate limits" ON public.adaptive_rate_limits_config FOR ALL TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins read queue" ON public.request_processing_queue FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins read load state" ON public.system_load_state FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins read snapshots" ON public.cached_snapshots FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins read connections" ON public.realtime_connection_logs FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins read node metrics" ON public.node_load_metrics FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));

-- Insert policies for system writes
CREATE POLICY "System insert telemetry" ON public.system_event_telemetry FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "System insert traces" ON public.request_traces FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "System insert latency" ON public.endpoint_latency_metrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "System insert errors" ON public.error_registry FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "System insert storage logs" ON public.storage_operation_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "System insert queue" ON public.request_processing_queue FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "System insert load state" ON public.system_load_state FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "System insert snapshots" ON public.cached_snapshots FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "System insert connections" ON public.realtime_connection_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "System insert node metrics" ON public.node_load_metrics FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_telemetry_created ON public.system_event_telemetry(created_at DESC);
CREATE INDEX idx_telemetry_event_type ON public.system_event_telemetry(event_type);
CREATE INDEX idx_telemetry_trace ON public.system_event_telemetry(trace_id);
CREATE INDEX idx_traces_created ON public.request_traces(created_at DESC);
CREATE INDEX idx_traces_trace_id ON public.request_traces(trace_id);
CREATE INDEX idx_latency_recorded ON public.endpoint_latency_metrics(recorded_at DESC);
CREATE INDEX idx_errors_last_seen ON public.error_registry(last_seen DESC);
CREATE INDEX idx_queue_status ON public.request_processing_queue(status);
CREATE INDEX idx_snapshots_key ON public.cached_snapshots(snapshot_key);
CREATE INDEX idx_node_metrics_created ON public.node_load_metrics(created_at DESC);
