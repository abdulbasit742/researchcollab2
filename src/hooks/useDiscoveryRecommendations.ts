import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Recommendation {
  id: string;
  entity_type: string;
  entity_id: string;
  reason: string;
  generated_at: string;
}

export function useDiscoveryRecommendations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["discovery-recommendations", user?.id],
    queryFn: async (): Promise<Recommendation[]> => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("discovery_recommendations")
        .select("*")
        .eq("user_id", user.id)
        .order("generated_at", { ascending: false })
        .limit(10);
      return (data ?? []) as Recommendation[];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });
}
