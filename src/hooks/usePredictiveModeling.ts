import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ── Milestone Delay Predictions ──
export function useMilestoneDelayPredictions(milestoneId?: string) {
  return useQuery({
    queryKey: ["milestone-delay-pred", milestoneId],
    queryFn: async () => {
      if (!milestoneId) return null;
      const { data } = await supabase
        .from("milestone_delay_predictions")
        .select("*")
        .eq("milestone_id", milestoneId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any | null;
    },
    enabled: !!milestoneId,
    staleTime: 10 * 60 * 1000,
  });
}

// ── Project Completion Predictions ──
export function useProjectCompletionPredictions(projectId?: string) {
  return useQuery({
    queryKey: ["project-completion-pred", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data } = await supabase
        .from("project_completion_predictions")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any | null;
    },
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000,
  });
}

// ── Dispute Risk Forecasts ──
export function useDisputeRiskForecasts(milestoneId?: string) {
  return useQuery({
    queryKey: ["dispute-risk-forecast", milestoneId],
    queryFn: async () => {
      if (!milestoneId) return null;
      const { data } = await supabase
        .from("dispute_risk_forecasts")
        .select("*")
        .eq("milestone_id", milestoneId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any | null;
    },
    enabled: !!milestoneId,
    staleTime: 10 * 60 * 1000,
  });
}

// ── Institution Stability ──
export function useInstitutionStabilityPrediction(institutionId?: string) {
  return useQuery({
    queryKey: ["institution-stability-pred", institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("institution_stability_predictions")
        .select("*")
        .eq("institution_id", institutionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any | null;
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

// ── Institution Stability History ──
export function useStabilityHistory(institutionId?: string) {
  return useQuery({
    queryKey: ["stability-history", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("institution_stability_predictions")
        .select("*")
        .eq("institution_id", institutionId)
        .order("created_at", { ascending: false })
        .limit(10);
      return (data ?? []) as any[];
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

// ── Engagement Dropout ──
export function useEngagementDropoutPredictions(institutionId?: string) {
  return useQuery({
    queryKey: ["dropout-predictions", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("engagement_dropout_predictions")
        .select("*")
        .eq("institution_id", institutionId)
        .order("dropout_risk_probability", { ascending: false })
        .limit(20);
      return (data ?? []) as any[];
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

// ── Risk Simulations ──
export function useRiskSimulations() {
  return useQuery({
    queryKey: ["risk-simulations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("risk_simulation_results")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSimulation() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      simulation_type: string;
      entity_id: string;
      institution_id?: string;
      simulated_parameters: Record<string, any>;
      projected_outcome: string;
      risk_shift: number;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase.from("risk_simulation_results").insert([{
        ...params,
        created_by: user.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["risk-simulations"] }),
  });
}

// ── Prediction Accuracy ──
export function usePredictionAccuracy(type?: string) {
  return useQuery({
    queryKey: ["prediction-accuracy", type],
    queryFn: async () => {
      let query = supabase
        .from("prediction_accuracy_tracking")
        .select("*")
        .order("evaluated_at", { ascending: false })
        .limit(20);
      if (type) query = query.eq("prediction_type", type);
      const { data } = await query;
      return (data ?? []) as any[];
    },
    staleTime: 10 * 60 * 1000,
  });
}
