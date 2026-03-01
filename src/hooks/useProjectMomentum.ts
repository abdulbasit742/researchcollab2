import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MomentumLevel = "high" | "stable" | "slowing" | "at_risk";

export interface ProjectMomentum {
  project_id: string;
  weekly_activity_count: number;
  milestone_velocity: number;
  task_completion_velocity: number;
  engagement_score: number;
  last_active_at: string | null;
  generated_at: string;
  level: MomentumLevel;
}

function deriveMomentumLevel(score: number, lastActive: string | null): MomentumLevel {
  if (!lastActive) return "at_risk";
  const daysSince = (Date.now() - new Date(lastActive).getTime()) / 86400000;
  if (daysSince > 7) return "at_risk";
  if (score >= 70) return "high";
  if (score >= 40) return "stable";
  return "slowing";
}

export function useProjectMomentum(projectId?: string) {
  return useQuery({
    queryKey: ["project-momentum", projectId],
    queryFn: async (): Promise<ProjectMomentum | null> => {
      if (!projectId) return null;
      const { data } = await supabase
        .from("project_momentum_metrics")
        .select("*")
        .eq("project_id", projectId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!data) return null;
      return {
        ...data,
        level: deriveMomentumLevel(data.engagement_score ?? 0, data.last_active_at),
      } as ProjectMomentum;
    },
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000,
  });
}
