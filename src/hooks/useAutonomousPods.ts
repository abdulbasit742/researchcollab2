import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PodConfig {
  pod_id: string;
  execution_probability: number;
  trust_compatibility: number;
  skill_completeness: number;
  members: {
    id: string;
    name: string;
    role: string;
    skill_match: number;
    trust: number;
  }[];
}

export function useAutonomousPods(projectId?: string) {
  const { user } = useAuth();

  const pods = useQuery({
    queryKey: ["pods", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("collaboration_pods")
        .select("*, pod_members(*)")
        .eq("project_id", projectId)
        .order("overall_execution_probability", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!projectId,
  });

  const generate = useMutation({
    mutationFn: async (projId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data, error } = await supabase.functions.invoke("generate-collaboration-pod", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { project_id: projId },
      });
      if (error) throw error;
      return data;
    },
  });

  return {
    pods: pods.data ?? [],
    podsLoading: pods.isLoading,
    generate: generate.mutateAsync,
    generating: generate.isPending,
  };
}
