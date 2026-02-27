/**
 * React hooks for the Policy Simulation & Impact Modeling Engine (PSIME).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function usePolicyModels(workspaceId?: string) {
  return useQuery({
    queryKey: ["policy-models", workspaceId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("policy_models")
        .select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!workspaceId,
  });
}

export function useCreatePolicyModel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: { workspace_id: string; title: string; description?: string; policy_type: string; region_scope?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any).from("policy_models").insert({
        ...params, created_by: user.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => {
      toast({ title: "Policy model created" });
      qc.invalidateQueries({ queryKey: ["policy-models", v.workspace_id] });
    },
  });
}

export function usePolicyAssumptions(modelId?: string) {
  return useQuery({
    queryKey: ["policy-assumptions", modelId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("policy_assumptions")
        .select("*").eq("policy_model_id", modelId).order("created_at");
      if (error) throw error;
      return data as any[];
    },
    enabled: !!modelId,
  });
}

export function usePolicyScenarios(modelId?: string) {
  return useQuery({
    queryKey: ["policy-scenarios", modelId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("policy_scenarios")
        .select("*, policy_simulation_results(*)").eq("policy_model_id", modelId).order("created_at");
      if (error) throw error;
      return data as any[];
    },
    enabled: !!modelId,
  });
}

export function useCreateScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { policy_model_id: string; scenario_name: string; parameter_set?: Record<string, any> }) => {
      const { data, error } = await (supabase as any).from("policy_scenarios").insert(params).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["policy-scenarios", v.policy_model_id] }),
  });
}

export function useExtractAssumptions() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: { policy_model_id: string; workspace_id: string }) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "extract_policy_assumptions", ...params },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (d, v) => {
      toast({ title: "Assumptions extracted", description: `${d.count} assumptions found` });
      qc.invalidateQueries({ queryKey: ["policy-assumptions", v.policy_model_id] });
    },
  });
}

export function useRunPolicySimulation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (policy_model_id: string) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "simulate_policy", policy_model_id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => {
      toast({ title: "Simulation complete", description: `${d.results?.length} scenarios simulated` });
      qc.invalidateQueries({ queryKey: ["policy-scenarios"] });
      qc.invalidateQueries({ queryKey: ["policy-models"] });
    },
  });
}

export function usePolicyTrajectory(modelId?: string) {
  return useQuery({
    queryKey: ["policy-trajectory", modelId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("policy_trajectory")
        .select("*").eq("policy_model_id", modelId).order("measurement_date");
      if (error) throw error;
      return data as any[];
    },
    enabled: !!modelId,
  });
}
