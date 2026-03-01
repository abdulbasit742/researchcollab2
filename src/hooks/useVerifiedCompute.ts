/**
 * useVerifiedCompute — Hooks for the Verified Research Compute Engine (VRCE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ExperimentSession {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  execution_environment: Record<string, unknown>;
  dataset_signature: string | null;
  status: string;
  started_at: string;
  completed_at: string | null;
  compute_duration_seconds: number | null;
  gpu_type: string | null;
  reproducibility_hash: string | null;
  linked_milestone_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ComputeUsage {
  id: string;
  experiment_session_id: string;
  user_id: string;
  resource_type: string;
  units_consumed: number;
  unit_type: string;
  cost_estimate: number;
  currency: string;
  recorded_at: string;
}

export function useExperimentSessions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["experiments", user?.id],
    queryFn: async (): Promise<ExperimentSession[]> => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("experiment_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useComputeUsage() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["computeUsage", user?.id],
    queryFn: async (): Promise<ComputeUsage[]> => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("compute_usage_ledger")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useCreateExperiment() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      description?: string;
      projectId?: string;
      linkedMilestoneId?: string;
      executionEnvironment?: Record<string, unknown>;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("experiment_sessions")
        .insert({
          user_id: user.id,
          title: params.title,
          description: params.description,
          project_id: params.projectId || null,
          linked_milestone_id: params.linkedMilestoneId || null,
          execution_environment: params.executionEnvironment || {},
          status: "running",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["experiments"] });
      toast.success("Experiment session started");
    },
  });
}

export function useGenerateExperimentHash() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      experimentId: string;
      datasetSignature?: string;
      executionEnvironment?: Record<string, unknown>;
      parameters?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase.functions.invoke("verify-compute", {
        body: {
          action: "generate_experiment_hash",
          experiment_id: params.experimentId,
          dataset_signature: params.datasetSignature,
          execution_environment: params.executionEnvironment,
          parameters: params.parameters,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["experiments"] });
      toast.success("Reproducibility hash generated");
    },
  });
}

export function useVerifyReproducibility() {
  return useMutation({
    mutationFn: async (experimentId: string) => {
      const { data, error } = await supabase.functions.invoke("verify-compute", {
        body: { action: "verify_reproducibility", experiment_id: experimentId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.is_verified) {
        toast.success("Experiment reproducibility verified ✓");
      } else {
        toast.error("Reproducibility verification failed — hash mismatch");
      }
    },
  });
}

export function useCompleteExperiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      experimentId: string;
      computeDurationSeconds: number;
      gpuType?: string;
      resourceType?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("verify-compute", {
        body: {
          action: "complete_experiment",
          experiment_id: params.experimentId,
          compute_duration_seconds: params.computeDurationSeconds,
          gpu_type: params.gpuType,
          resource_type: params.resourceType,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["experiments"] });
      qc.invalidateQueries({ queryKey: ["computeUsage"] });
      toast.success("Experiment completed — usage logged");
    },
  });
}
