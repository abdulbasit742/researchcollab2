import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DealIntelligence {
  session_id: string;
  deal_id: string;
  suggested_price_range: { low: number; high: number; current: number };
  risk_score: number;
  dispute_probability: number;
  trust_impact_projection: number;
  suggested_milestones: { title: string; amount: number; percentage: number }[];
  contributing_factors: Record<string, any>;
  participants: {
    buyer: { trust: number; dispute_rate: number };
    seller: { trust: number; dispute_rate: number };
  };
}

export function useDealIntelligence(dealId?: string) {
  const { user } = useAuth();

  const sessions = useQuery({
    queryKey: ["deal-intelligence", dealId],
    queryFn: async () => {
      if (!dealId) return [];
      const { data, error } = await supabase
        .from("negotiation_sessions")
        .select("*")
        .eq("deal_id", dealId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!dealId,
  });

  const analyze = useMutation({
    mutationFn: async (dId: string): Promise<DealIntelligence> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data, error } = await supabase.functions.invoke("ai-deal-intelligence", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { deal_id: dId },
      });
      if (error) throw error;
      return data as DealIntelligence;
    },
  });

  const latestSession = sessions.data?.[0] ?? null;

  return {
    sessions: sessions.data ?? [],
    sessionsLoading: sessions.isLoading,
    latestSession,
    analyze: analyze.mutateAsync,
    analyzing: analyze.isPending,
    result: analyze.data ?? null,
  };
}
