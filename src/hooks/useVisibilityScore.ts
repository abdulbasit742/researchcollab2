import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface VisibilityBreakdownItem {
  raw: number;
  weight: number;
  weighted: number;
}

export interface VisibilityBreakdown {
  trust_score: VisibilityBreakdownItem;
  deal_success_rate: VisibilityBreakdownItem;
  collaboration_consistency: VisibilityBreakdownItem;
  dispute_score: VisibilityBreakdownItem;
  institutional_weight: VisibilityBreakdownItem;
  economic_contribution: VisibilityBreakdownItem;
}

export interface VisibilityResult {
  visibility_score: number;
  breakdown: VisibilityBreakdown;
  computed_at: string;
  top_trusted: boolean;
}

export interface VisibilitySnapshot {
  id: string;
  user_id: string;
  visibility_score: number;
  breakdown: VisibilityBreakdown;
  calculated_at: string;
}

export function useVisibilityScore() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const compute = useMutation({
    mutationFn: async (): Promise<VisibilityResult> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("compute-visibility", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      return data as VisibilityResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visibilityHistory", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["visibilityLatest", user?.id] });
    },
    onError: () => {
      toast.error("Failed to compute visibility score");
    },
  });

  const history = useQuery({
    queryKey: ["visibilityHistory", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("visibility_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("calculated_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      return (data ?? []) as unknown as VisibilitySnapshot[];
    },
    enabled: !!user?.id,
  });

  const latest = useQuery({
    queryKey: ["visibilityLatest", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("visibility_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as VisibilitySnapshot | null;
    },
    enabled: !!user?.id,
  });

  // Determine trend
  const snapshots = history.data ?? [];
  const prev = snapshots[1];
  const curr = snapshots[0];
  const trend: "up" | "down" | "stable" =
    curr && prev
      ? curr.visibility_score > prev.visibility_score
        ? "up"
        : curr.visibility_score < prev.visibility_score
        ? "down"
        : "stable"
      : "stable";

  const scoreIncreased = trend === "up";

  return {
    compute: compute.mutateAsync,
    computing: compute.isPending,
    result: compute.data ?? null,
    latest: latest.data,
    latestLoading: latest.isLoading,
    history: snapshots,
    historyLoading: history.isLoading,
    trend,
    scoreIncreased,
  };
}
