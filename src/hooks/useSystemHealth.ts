import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HealthMetric {
  subsystem_name: string;
  health_score: number;
  response_time_ms: number | null;
  error_rate: number;
  last_checked: string;
}

export interface ErrorLog {
  id: string;
  endpoint: string;
  error_message: string;
  stack_trace: string | null;
  occurred_at: string;
  metadata: Record<string, unknown>;
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("compute_health_score");
      if (error) throw error;
      return (data || []) as HealthMetric[];
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useErrorLogs(limit = 50) {
  return useQuery({
    queryKey: ["error-logs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("error_logs")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as ErrorLog[];
    },
    staleTime: 30_000,
  });
}

export function useCachedProjectSummary(projectId?: string) {
  return useQuery({
    queryKey: ["cached-project-summary", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_cached_project_summary", {
        p_project_id: projectId!,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
    staleTime: 60_000,
  });
}

export function useCachedInstitutionSummary(institutionId?: string) {
  return useQuery({
    queryKey: ["cached-institution-summary", institutionId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_cached_institution_summary", {
        p_institution_id: institutionId!,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!institutionId,
    staleTime: 60_000,
  });
}

/** Log a frontend error to the error_logs table */
export async function logError(endpoint: string, errorMessage: string, stackTrace?: string) {
  try {
    await supabase.from("error_logs").insert({
      endpoint,
      error_message: errorMessage,
      stack_trace: stackTrace || null,
    });
  } catch {
    // Silent fail — don't throw on error logging
  }
}
