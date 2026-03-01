import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useExecutionDriftAnalysis(projectId?: string) {
  return useQuery({
    queryKey: ["executionDrift", projectId],
    queryFn: async () => {
      let q = (supabase as any).from("execution_drift_analysis").select("*").order("generated_at", { ascending: false });
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q.limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useDetectExecutionDrift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data, error } = await supabase.functions.invoke("autonomous-execution-intelligence", {
        body: { action: "detect_execution_drift", project_id: projectId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["executionDrift"] });
      const s = data?.analysis?.drift_severity;
      if (s === "critical") toast.error("Critical execution drift detected");
      else if (s === "warning") toast.warning("Execution drift warning");
      else toast.success("Execution within normal parameters");
    },
  });
}

export function useSystemicRiskIndex(institutionId?: string) {
  return useQuery({
    queryKey: ["systemicRisk", institutionId],
    queryFn: async () => {
      let q = (supabase as any).from("systemic_risk_index").select("*").order("generated_at", { ascending: false });
      if (institutionId) q = q.eq("institution_id", institutionId);
      const { data, error } = await q.limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useComputeSystemicRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (institutionId: string) => {
      const { data, error } = await supabase.functions.invoke("autonomous-execution-intelligence", {
        body: { action: "compute_systemic_risk", institution_id: institutionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["systemicRisk"] });
      toast.success("Systemic risk computed");
    },
  });
}

export function useCapitalOptimizationAdvice(projectId?: string) {
  return useQuery({
    queryKey: ["capitalOptimization", projectId],
    queryFn: async () => {
      let q = (supabase as any).from("capital_optimization_advice").select("*").order("generated_at", { ascending: false });
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q.limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useGenerateCapitalOptimization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data, error } = await supabase.functions.invoke("autonomous-execution-intelligence", {
        body: { action: "generate_capital_optimization", project_id: projectId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["capitalOptimization"] });
      toast.success("Capital optimization advice generated");
    },
  });
}

export function useInstitutionalDrift(institutionId?: string) {
  return useQuery({
    queryKey: ["institutionalDrift", institutionId],
    queryFn: async () => {
      let q = (supabase as any).from("institutional_drift_monitor").select("*").order("generated_at", { ascending: false });
      if (institutionId) q = q.eq("institution_id", institutionId);
      const { data, error } = await q.limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useDetectInstitutionalDrift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (institutionId: string) => {
      const { data, error } = await supabase.functions.invoke("autonomous-execution-intelligence", {
        body: { action: "detect_institutional_drift", institution_id: institutionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["institutionalDrift"] });
      const dir = data?.drift?.drift_direction;
      if (dir === "declining") toast.warning("Institutional drift: declining trend");
      else if (dir === "improving") toast.success("Institutional drift: improving trend");
      else toast.success("Institution stable");
    },
  });
}
