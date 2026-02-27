/**
 * Institutional Operations Dominance — hooks for ops control panel.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OpsDailyMetric {
  id: string;
  metric_date: string;
  total_escrow_locked: number;
  total_escrow_released: number;
  funding_attempts: number;
  failed_funding_attempts: number;
  api_error_rate: number;
  avg_transaction_latency_ms: number;
  concurrency_retries: number;
  rate_limit_triggers: number;
  security_alerts: number;
  active_institutions: number;
  active_sponsors: number;
  project_completion_pct: number;
  sla_compliance_pct: number;
  dispute_rate_pct: number;
  open_tickets: number;
  avg_resolution_hours: number | null;
  escalated_cases: number;
  max_institution_exposure: number;
  max_sponsor_exposure: number;
  total_platform_exposure: number;
  funding_concentration_hhi: number;
  escrow_reliability_pct: number;
  ledger_integrity_pct: number;
  sponsor_repeat_pct: number;
  institutional_retention_pct: number;
  trust_health_index: number;
}

export interface FraudSignal {
  id: string;
  signal_type: string;
  severity: string;
  user_id: string | null;
  description: string;
  evidence: Record<string, unknown>;
  status: string;
  created_at: string;
}

export interface DisputeClassification {
  id: string;
  deal_id: string | null;
  risk_level: string;
  classification_reason: string;
  escrow_frozen: boolean;
  sla_deadline: string | null;
  resolved_at: string | null;
  created_at: string;
}

export function useOpsDailyMetrics(days = 30) {
  return useQuery({
    queryKey: ["ops-daily-metrics", days],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("ops_daily_metrics")
        .select("*")
        .order("metric_date", { ascending: false })
        .limit(days);
      if (error) throw error;
      return (data || []) as OpsDailyMetric[];
    },
    refetchInterval: 60_000,
  });
}

export function useFraudSignals() {
  return useQuery({
    queryKey: ["fraud-signals"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("fraud_signals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as FraudSignal[];
    },
    refetchInterval: 30_000,
  });
}

export function useDisputeClassifications() {
  return useQuery({
    queryKey: ["dispute-classifications"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("dispute_classifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as DisputeClassification[];
    },
  });
}

export function useCaptureOpsMetrics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("capture_ops_daily_metrics");
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ops-daily-metrics"] }),
  });
}

export function useDetectFraud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("detect_fraud_signals");
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fraud-signals"] }),
  });
}

export function useOpsReadinessGate() {
  return useQuery({
    queryKey: ["ops-readiness-gate"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("check_ops_readiness_gate");
      if (error) throw error;
      return data as {
        ready: boolean;
        critical_incidents_60d: number;
        sla_compliance_pct: number;
        unresolved_disputes: number;
      };
    },
  });
}
