import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SimilarProject {
  id: string;
  project_id: string;
  similar_project_id: string;
  similarity_score: number;
  generated_at: string;
}

export function useProjectSimilarity(projectId?: string) {
  return useQuery({
    queryKey: ["project-similarity", projectId],
    queryFn: async (): Promise<SimilarProject[]> => {
      if (!projectId) return [];
      const { data } = await supabase
        .from("project_similarity_index")
        .select("*")
        .eq("project_id", projectId)
        .order("similarity_score", { ascending: false })
        .limit(5);
      return (data ?? []) as SimilarProject[];
    },
    enabled: !!projectId,
    staleTime: 15 * 60 * 1000,
  });
}
