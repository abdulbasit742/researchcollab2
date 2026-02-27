/**
 * Launch Health Dashboard Hook — provides real-time launch metrics
 * for the controlled institutional launch protocol.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LaunchHealthSnapshot {
  id: string;
  snapshot_date: string;
  active_escrow_volume: number;
  active_deals: number;
  milestones_pending: number;
  avg_approval_time_hours: number | null;
  support_tickets_open: number;
  security_alerts_24h: number;
  avg_transaction_latency_ms: number | null;
  daily_active_users: number;
  dispute_count: number;
  funding_events: number;
  milestone_releases: number;
  failed_transactions: number;
  login_failures: number;
  rate_limit_triggers: number;
  error_rate: number;
}

export interface ScaleGate {
  id: string;
  gate_number: number;
  gate_name: string;
  criteria: Array<{ metric: string; threshold: number | string; operator: string }>;
  status: "locked" | "evaluating" | "passed" | "failed";
  evaluated_at: string | null;
  passed_at: string | null;
  notes: string | null;
}

export interface LaunchConfig {
  config_key: string;
  config_value: Record<string, unknown>;
  description: string | null;
}

export function useLaunchHealthSnapshots(days = 30) {
  return useQuery({
    queryKey: ["launch-health-snapshots", days],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("launch_health_snapshots")
        .select("*")
        .order("snapshot_date", { ascending: false })
        .limit(days);
      if (error) throw error;
      return (data || []) as LaunchHealthSnapshot[];
    },
    refetchInterval: 60_000,
  });
}

export function useScaleGates() {
  return useQuery({
    queryKey: ["scale-gates"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("scale_gates")
        .select("*")
        .order("gate_number", { ascending: true });
      if (error) throw error;
      return (data || []) as ScaleGate[];
    },
  });
}

export function useLaunchConfig() {
  return useQuery({
    queryKey: ["launch-config"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("launch_config")
        .select("config_key, config_value, description");
      if (error) throw error;
      return (data || []) as LaunchConfig[];
    },
  });
}

export function useWhitelistedDomains() {
  return useQuery({
    queryKey: ["whitelisted-domains"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("whitelisted_domains")
        .select("*")
        .order("added_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useEvaluateScaleGate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (gateNumber: number) => {
      const { data, error } = await supabase.rpc("evaluate_scale_gate", {
        p_gate_number: gateNumber,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scale-gates"] });
    },
  });
}

export function useCaptureHealthSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("capture_launch_health_snapshot");
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["launch-health-snapshots"] });
    },
  });
}
