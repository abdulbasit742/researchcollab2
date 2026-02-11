import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useConstitutionalGuardian() {
  const queryClient = useQueryClient();

  const { data: invariants, isLoading: loadingInvariants } = useQuery({
    queryKey: ["constitutional-invariants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("constitutional_invariants")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: violations, isLoading: loadingViolations } = useQuery({
    queryKey: ["constitutional-violations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("constitutional_violations")
        .select("*, constitutional_invariants(invariant_name, monitoring_metric)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: auditLogs, isLoading: loadingAudits } = useQuery({
    queryKey: ["guardian-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guardian_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: biasRecords } = useQuery({
    queryKey: ["bias-monitoring"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bias_monitoring_records")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: concentrationData } = useQuery({
    queryKey: ["concentration-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("concentration_metrics")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

  const runAudit = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("run-constitutional-audit");
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["constitutional-violations"] });
      queryClient.invalidateQueries({ queryKey: ["guardian-audit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["bias-monitoring"] });
      queryClient.invalidateQueries({ queryKey: ["concentration-metrics"] });
    },
  });

  const resolveViolation = useMutation({
    mutationFn: async (violationId: string) => {
      const { error } = await supabase
        .from("constitutional_violations")
        .update({ resolved_at: new Date().toISOString() })
        .eq("id", violationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["constitutional-violations"] });
    },
  });

  const activeViolations = violations?.filter((v: any) => !v.resolved_at) || [];
  const healthScore = Math.max(0, 100 - activeViolations.length * 15);

  return {
    invariants,
    violations,
    activeViolations,
    auditLogs,
    biasRecords,
    concentrationData,
    healthScore,
    runAudit,
    resolveViolation,
    loading: loadingInvariants || loadingViolations || loadingAudits,
  };
}
