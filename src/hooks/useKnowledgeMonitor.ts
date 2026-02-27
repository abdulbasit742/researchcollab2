/**
 * React hooks for the Autonomous Knowledge Monitoring Engine (AKME).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export function useMonitorProfile(workspaceId?: string) {
  return useQuery({
    queryKey: ["monitor-profile", workspaceId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("knowledge_monitor_profiles")
        .select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(1);
      if (error) throw error;
      return (data as any[])?.[0] ?? null;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateMonitorProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { workspace_id: string; monitoring_scope?: string; frequency?: string; drift_sensitivity_level?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any).from("knowledge_monitor_profiles").insert({
        workspace_id: params.workspace_id,
        user_id: user.id,
        monitoring_scope: params.monitoring_scope || "claims",
        frequency: params.frequency || "weekly",
        drift_sensitivity_level: params.drift_sensitivity_level || "medium",
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["monitor-profile", v.workspace_id] }),
  });
}

export function useDriftEvents(workspaceId?: string) {
  return useQuery({
    queryKey: ["drift-events", workspaceId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("drift_events")
        .select("*").eq("workspace_id", workspaceId).order("detected_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!workspaceId,
  });
}

export function useMonitorAlerts() {
  const qc = useQueryClient();

  // Realtime subscription for new alerts
  useEffect(() => {
    const channel = supabase
      .channel("monitor-alerts-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "monitor_alerts" }, () => {
        qc.invalidateQueries({ queryKey: ["monitor-alerts"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  return useQuery({
    queryKey: ["monitor-alerts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await (supabase as any).from("monitor_alerts")
        .select("*, drift_events(*)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useDismissAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await (supabase as any).from("monitor_alerts")
        .update({ alert_status: "dismissed", viewed_at: new Date().toISOString() }).eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["monitor-alerts"] }),
  });
}

export function useRunDriftScan() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (workspace_id: string) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "knowledge_drift_scan", workspace_id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (d, wsId) => {
      toast({ title: "Drift scan complete", description: `${d.drift_events} drift events detected` });
      qc.invalidateQueries({ queryKey: ["drift-events", wsId] });
      qc.invalidateQueries({ queryKey: ["monitor-alerts"] });
    },
  });
}
