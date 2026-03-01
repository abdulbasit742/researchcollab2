/**
 * useIntegrityChecks — Admin hook to run and view platform integrity checks.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useIntegrityChecks() {
  return useQuery({
    queryKey: ["integrity-checks"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("system_integrity_checks")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Array<{
        id: string;
        check_type: string;
        entity_type: string | null;
        entity_id: string | null;
        status: "pass" | "fail" | "warning";
        description: string | null;
        detected_at: string;
      }>;
    },
  });
}

export function useRunIntegrityChecks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("run_integrity_checks" as any);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrity-checks"] });
    },
  });
}

export function useRlsValidation() {
  return useQuery({
    queryKey: ["rls-validation"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("rls_validation_results")
        .select("*")
        .order("checked_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Array<{
        id: string;
        table_name: string;
        rls_enabled: boolean;
        policy_count: number;
        validation_status: string;
        checked_at: string;
      }>;
    },
  });
}

export function useRunRlsValidation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("validate_rls_policies" as any);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rls-validation"] });
    },
  });
}

export function useExecutionFlowAudit() {
  return useQuery({
    queryKey: ["execution-flow-audit"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("execution_flow_audit")
        .select("*")
        .eq("anomaly_detected", true)
        .order("checked_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Array<{
        id: string;
        project_id: string | null;
        milestone_id: string | null;
        flow_state_valid: boolean;
        anomaly_detected: boolean;
        anomaly_description: string | null;
        checked_at: string;
      }>;
    },
  });
}

export function useFrontendErrors() {
  return useQuery({
    queryKey: ["frontend-errors"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("frontend_error_logs")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Array<{
        id: string;
        user_id: string | null;
        route: string | null;
        error_message: string;
        stack_trace: string | null;
        occurred_at: string;
      }>;
    },
  });
}

export function useReconciliationReports() {
  return useQuery({
    queryKey: ["reconciliation-reports"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("reconciliation_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as Array<{
        id: string;
        report_date: string;
        check_type: string;
        status: string;
        issues_found: number;
        created_at: string;
      }>;
    },
  });
}
