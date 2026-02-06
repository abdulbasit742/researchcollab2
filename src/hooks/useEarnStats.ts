import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EarnStats {
  activeProjects: number;
  totalEarners: number;
  completedDeals: number;
}

export function useEarnStats() {
  return useQuery({
    queryKey: ["earnStats"],
    queryFn: async (): Promise<EarnStats> => {
      const [projectsRes, profilesRes, dealsRes] = await Promise.all([
        supabase
          .from("earning_projects")
          .select("id", { count: "exact", head: true })
          .eq("status", "open"),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("accountability_records")
          .select("id", { count: "exact", head: true })
          .eq("outcome_status", "completed"),
      ]);

      return {
        activeProjects: projectsRes.count ?? 0,
        totalEarners: profilesRes.count ?? 0,
        completedDeals: dealsRes.count ?? 0,
      };
    },
    staleTime: 60_000,
  });
}
