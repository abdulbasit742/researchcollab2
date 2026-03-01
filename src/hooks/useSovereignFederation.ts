import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSovereignNodes() {
  return useQuery({
    queryKey: ["sovereignNodes"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("sovereign_nodes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useSovereignMetrics(nodeId?: string) {
  return useQuery({
    queryKey: ["sovereignMetrics", nodeId],
    queryFn: async () => {
      let query = (supabase as any).from("sovereign_metrics").select("*").order("updated_at", { ascending: false });
      if (nodeId) query = query.eq("node_id", nodeId);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useComputeSovereignMetrics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nodeId: string) => {
      const { data, error } = await supabase.functions.invoke("sovereign-federation-engine", {
        body: { action: "compute_sovereign_metrics", node_id: nodeId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sovereignMetrics"] });
      toast.success("Sovereign metrics computed");
    },
  });
}

export function useCrossBorderProjects() {
  return useQuery({
    queryKey: ["crossBorderProjects"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("cross_border_projects").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useGovernanceAnomalies() {
  return useQuery({
    queryKey: ["governanceAnomalies"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("governance_anomalies").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useGovernanceHealthIndex() {
  return useQuery({
    queryKey: ["governanceHealthIndex"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("governance_health_index").select("*").order("governance_composite_score", { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useDetectGovernanceAnomaly() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { entityType: string; entityId: string }) => {
      const { data, error } = await supabase.functions.invoke("sovereign-federation-engine", {
        body: { action: "detect_governance_anomaly", entity_type: params.entityType, entity_id: params.entityId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["governanceAnomalies"] });
      if (data?.anomaly_score >= 50) toast.warning(`Governance risk: ${data.anomaly_score}%`);
      else toast.success("No significant anomalies detected");
    },
  });
}

export function useComputeGovernanceHealth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { entityId: string; entityType?: string }) => {
      const { data, error } = await supabase.functions.invoke("sovereign-federation-engine", {
        body: { action: "compute_governance_health", entity_id: params.entityId, entity_type: params.entityType },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["governanceHealthIndex"] });
      toast.success("Governance health index computed");
    },
  });
}

export function useHumanCapitalIndex(institutionId?: string) {
  return useQuery({
    queryKey: ["humanCapitalIndex", institutionId],
    queryFn: async () => {
      let query = (supabase as any).from("human_capital_index").select("*").order("updated_at", { ascending: false });
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useComputeHumanCapital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (institutionId: string) => {
      const { data, error } = await supabase.functions.invoke("sovereign-federation-engine", {
        body: { action: "compute_human_capital", institution_id: institutionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["humanCapitalIndex"] });
      toast.success("Human capital index computed");
    },
  });
}
