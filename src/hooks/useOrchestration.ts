import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const STALE = 10 * 60 * 1000;

export function useWorkflowRecommendations(projectId?: string) {
  return useQuery({
    queryKey: ["workflow-recs", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data } = await supabase
        .from("workflow_sequence_recommendations")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(5);
      return (data ?? []) as any[];
    },
    enabled: !!projectId,
    staleTime: STALE,
  });
}

export function useRoleCoordinationSuggestions(projectId?: string) {
  return useQuery({
    queryKey: ["role-coord", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data } = await supabase
        .from("role_coordination_suggestions")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(10);
      return (data ?? []) as any[];
    },
    enabled: !!projectId,
    staleTime: STALE,
  });
}

export function useExecutionBottlenecks(projectId?: string) {
  return useQuery({
    queryKey: ["bottlenecks", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data } = await supabase
        .from("execution_bottlenecks")
        .select("*")
        .eq("project_id", projectId)
        .order("bottleneck_score", { ascending: false })
        .limit(10);
      return (data ?? []) as any[];
    },
    enabled: !!projectId,
    staleTime: STALE,
  });
}

export function useInstitutionBottlenecks(institutionId?: string) {
  return useQuery({
    queryKey: ["inst-bottlenecks", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("execution_bottlenecks")
        .select("*")
        .eq("institution_id", institutionId)
        .order("bottleneck_score", { ascending: false })
        .limit(20);
      return (data ?? []) as any[];
    },
    enabled: !!institutionId,
    staleTime: STALE,
  });
}

export function useOrchestratedTimeline(projectId?: string) {
  return useQuery({
    queryKey: ["orch-timeline", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data } = await supabase
        .from("orchestrated_timeline_models")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any | null;
    },
    enabled: !!projectId,
    staleTime: STALE,
  });
}

export function useCrossProjectInsights(institutionId?: string) {
  return useQuery({
    queryKey: ["cross-proj-insights", institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("cross_project_orchestration_insights")
        .select("*")
        .eq("institution_id", institutionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any | null;
    },
    enabled: !!institutionId,
    staleTime: STALE,
  });
}

export function useOrchestrationFeedback() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      recommendation_id: string;
      recommendation_type: string;
      accepted: boolean;
      outcome_improvement_score?: number;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase.from("orchestration_feedback").insert([{
        ...params,
        user_id: user.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orch-feedback"] }),
  });
}
