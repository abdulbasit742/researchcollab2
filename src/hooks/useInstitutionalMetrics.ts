import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useInstitutionalMetrics(institutionId: string) {
  return useQuery({
    queryKey: ["institutional-metrics", institutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institutional_metrics")
        .select("*")
        .eq("institution_id", institutionId)
        .order("period_start", { ascending: false })
        .limit(12);

      if (error) throw error;
      return data || [];
    },
    enabled: !!institutionId,
    staleTime: 300_000,
  });
}
