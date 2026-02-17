import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Layer 17: Global Infrastructure Synchronization

export function useInfrastructureRegistry(regionCode?: string) {
  return useQuery({
    queryKey: ["infrastructure-registry", regionCode],
    queryFn: async () => {
      let query = supabase
        .from("infrastructure_registry")
        .select("*")
        .eq("status", "active");
      if (regionCode) query = query.eq("region_code", regionCode);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useProductionCapacityMetrics() {
  return useQuery({
    queryKey: ["production-capacity-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_capacity_metrics")
        .select("*")
        .order("measured_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useDevelopmentTransparencyLedger(infraId?: string) {
  return useQuery({
    queryKey: ["development-transparency-ledger", infraId],
    queryFn: async () => {
      let query = supabase.from("development_transparency_ledger").select("*");
      if (infraId) query = query.eq("infrastructure_id", infraId);
      const { data, error } = await query.order("logged_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useInfrastructureRiskSignals() {
  return useQuery({
    queryKey: ["infrastructure-risk-signals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("infrastructure_risk_signals")
        .select("*")
        .is("resolved_at", null)
        .order("detected_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}
