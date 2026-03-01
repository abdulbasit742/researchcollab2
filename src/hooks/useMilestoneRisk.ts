import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useMilestoneRiskForecasts(dealId?: string) {
  return useQuery({
    queryKey: ["milestoneRiskForecasts", dealId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("milestone_risk_forecasts")
        .select("*")
        .order("generated_at", { ascending: false });
      if (dealId) query = query.eq("deal_id", dealId);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function usePredictMilestoneRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { dealId: string; milestoneId?: string }) => {
      const { data, error } = await supabase.functions.invoke("milestone-risk-predictor", {
        body: {
          action: "predict_milestone_risk",
          deal_id: params.dealId,
          milestone_id: params.milestoneId,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["milestoneRiskForecasts"] });
      const risk = data?.forecast?.risk_score ?? 0;
      if (risk >= 70) toast.error(`Critical risk: ${risk}%`);
      else if (risk >= 40) toast.warning(`Elevated risk: ${risk}%`);
      else toast.success(`Low risk: ${risk}%`);
    },
  });
}

export function useSupervisorIndex() {
  return useQuery({
    queryKey: ["supervisorPerformanceIndex"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("supervisor_performance_index")
        .select("*")
        .order("composite_score", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useComputeSupervisorIndex() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (supervisorId: string) => {
      const { data, error } = await supabase.functions.invoke("milestone-risk-predictor", {
        body: { action: "compute_supervisor_index", supervisor_id: supervisorId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supervisorPerformanceIndex"] });
      toast.success("Supervisor index computed");
    },
  });
}
