import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRiskIndex(entityType?: string, entityId?: string) {
  const queryClient = useQueryClient();

  const metricsQuery = useQuery({
    queryKey: ["risk-metrics", entityType, entityId],
    queryFn: async () => {
      let query = supabase
        .from("risk_metrics")
        .select("*")
        .order("calculated_at", { ascending: false })
        .limit(1);
      if (entityType) query = query.eq("entity_type", entityType);
      if (entityId) query = query.eq("entity_id", entityId);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const trendsQuery = useQuery({
    queryKey: ["risk-trends", entityType, entityId],
    queryFn: async () => {
      let query = supabase
        .from("risk_trends")
        .select("*")
        .order("recorded_at", { ascending: true })
        .limit(90);
      if (entityType) query = query.eq("entity_type", entityType);
      if (entityId) query = query.eq("entity_id", entityId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const alertsQuery = useQuery({
    queryKey: ["systemic-alerts", entityType, entityId],
    queryFn: async () => {
      let query = supabase
        .from("systemic_alerts")
        .select("*")
        .is("resolved_at", null)
        .order("triggered_at", { ascending: false })
        .limit(50);
      if (entityType) query = query.eq("entity_type", entityType);
      if (entityId) query = query.eq("entity_id", entityId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const computeRisk = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("compute-risk-index", {
        body: { entity_type: entityType || "platform", entity_id: entityId || "global" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["risk-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["risk-trends"] });
      queryClient.invalidateQueries({ queryKey: ["systemic-alerts"] });
    },
  });

  return {
    metrics: metricsQuery.data,
    trends: trendsQuery.data || [],
    alerts: alertsQuery.data || [],
    isLoading: metricsQuery.isLoading || trendsQuery.isLoading,
    computeRisk: computeRisk.mutate,
    isComputing: computeRisk.isPending,
  };
}
