import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TenantAnalytics {
  activeUsers7d: number;
  activeUsers30d: number;
  activeProjects: number;
  completionRate: number;
  reviewTurnaround: number;
  disputeRatio: number;
  aiUsage: number;
}

export function useTenantAnalytics(institutionId?: string) {
  return useQuery({
    queryKey: ["tenant-analytics", institutionId],
    queryFn: async (): Promise<TenantAnalytics> => {
      if (!institutionId) return fallback();

      // Fetch institution engagement metrics (latest)
      const { data: engagement } = await supabase
        .from("institution_engagement_metrics")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch tenant activity
      const { data: activity } = await supabase
        .from("tenant_activity_metrics")
        .select("*")
        .eq("institution_id", institutionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        activeUsers7d: engagement?.active_users_7d ?? 0,
        activeUsers30d: (engagement?.active_users_7d ?? 0) * 3, // approximate
        activeProjects: engagement?.active_projects_7d ?? 0,
        completionRate: engagement?.completion_rate ?? 0,
        reviewTurnaround: engagement?.review_turnaround_avg ?? 0,
        disputeRatio: engagement?.dispute_ratio ?? 0,
        aiUsage: (activity as any)?.search_volume ?? 0,
      };
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

function fallback(): TenantAnalytics {
  return { activeUsers7d: 0, activeUsers30d: 0, activeProjects: 0, completionRate: 0, reviewTurnaround: 0, disputeRatio: 0, aiUsage: 0 };
}
