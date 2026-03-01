import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InstitutionEngagement {
  id: string;
  institution_id: string;
  active_users_7d: number;
  active_projects_7d: number;
  completion_rate: number;
  review_turnaround_avg: number;
  dispute_ratio: number;
  generated_at: string;
}

export function useInstitutionEngagement(institutionId?: string) {
  return useQuery({
    queryKey: ["institution-engagement", institutionId],
    queryFn: async (): Promise<InstitutionEngagement | null> => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("institution_engagement_metrics")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as InstitutionEngagement | null;
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAllInstitutionEngagement() {
  return useQuery({
    queryKey: ["all-institution-engagement"],
    queryFn: async () => {
      const { data } = await supabase
        .from("institution_engagement_metrics")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(50);
      return (data ?? []) as InstitutionEngagement[];
    },
    staleTime: 10 * 60 * 1000,
  });
}
