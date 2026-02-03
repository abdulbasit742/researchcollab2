import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformEvent {
  id: string;
  event_type: string;
  severity: string;
  user_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  context: Record<string, unknown>;
  created_at: string;
}

export interface PlatformAlert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  context: Record<string, unknown>;
  acknowledged_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface PlatformHealthStatus {
  id: string;
  component: string;
  status: "healthy" | "degraded" | "unhealthy";
  last_check_at: string;
  details: Record<string, unknown>;
}

export interface IntegrityJobRun {
  id: string;
  job_name: string;
  started_at: string;
  completed_at: string | null;
  status: "running" | "completed" | "failed";
  issues_found: number;
  issues_fixed: number;
  issues_flagged: number;
  error_message: string | null;
}

export interface IntegrityLog {
  id: string;
  job_name: string;
  issue_type: string;
  severity: string;
  affected_table: string;
  affected_ids: string[];
  auto_fixed: boolean;
  requires_admin_action: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useObservability() {
  const [healthStatus, setHealthStatus] = useState<PlatformHealthStatus[]>([]);
  const [alerts, setAlerts] = useState<PlatformAlert[]>([]);
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [integrityLogs, setIntegrityLogs] = useState<IntegrityLog[]>([]);
  const [jobRuns, setJobRuns] = useState<IntegrityJobRun[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Use type assertions since these tables are new and not yet in generated types
      const [healthRes, alertsRes, eventsRes, logsRes, jobsRes] = await Promise.all([
        supabase.from("platform_health_status" as any).select("*").order("component"),
        supabase.from("platform_alerts" as any).select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("platform_events" as any).select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("platform_integrity_logs" as any).select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("integrity_job_runs" as any).select("*").order("started_at", { ascending: false }).limit(50),
      ]);

      if (!healthRes.error) setHealthStatus((healthRes.data as unknown as PlatformHealthStatus[]) || []);
      if (!alertsRes.error) setAlerts((alertsRes.data as unknown as PlatformAlert[]) || []);
      if (!eventsRes.error) setEvents((eventsRes.data as unknown as PlatformEvent[]) || []);
      if (!logsRes.error) setIntegrityLogs((logsRes.data as unknown as IntegrityLog[]) || []);
      if (!jobsRes.error) setJobRuns((jobsRes.data as unknown as IntegrityJobRun[]) || []);
    } catch (err) {
      console.error("Observability fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();

    // Subscribe to realtime alerts
    const channel = supabase
      .channel("observability")
      .on("postgres_changes", { event: "*", schema: "public", table: "platform_alerts" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "platform_health_status" }, () => fetchAll())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const acknowledgeAlert = async (alertId: string) => {
    const { error } = await supabase
      .from("platform_alerts" as any)
      .update({ acknowledged_at: new Date().toISOString() })
      .eq("id", alertId);
    if (!error) fetchAll();
    return { error };
  };

  const resolveAlert = async (alertId: string) => {
    const { error } = await supabase
      .from("platform_alerts" as any)
      .update({ resolved_at: new Date().toISOString() })
      .eq("id", alertId);
    if (!error) fetchAll();
    return { error };
  };

  const overallHealth = healthStatus.every(h => h.status === "healthy") 
    ? "healthy" 
    : healthStatus.some(h => h.status === "unhealthy") 
      ? "unhealthy" 
      : "degraded";

  const unresolvedAlerts = alerts.filter(a => !a.resolved_at);
  const criticalAlerts = unresolvedAlerts.filter(a => a.severity === "critical");
  const recentErrors = events.filter(e => e.severity === "error" || e.severity === "critical");

  return {
    healthStatus,
    alerts,
    events,
    integrityLogs,
    jobRuns,
    loading,
    overallHealth,
    unresolvedAlerts,
    criticalAlerts,
    recentErrors,
    acknowledgeAlert,
    resolveAlert,
    refetch: fetchAll,
  };
}
