import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type BoostType = "profile" | "bid" | "project" | "opportunity";

const BOOST_COSTS: Record<BoostType, number> = {
  profile: 500,
  bid: 300,
  project: 1000,
  opportunity: 200,
};

export function useVisibilityBoosts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const boosts = useQuery({
    queryKey: ["my-visibility-boosts", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visibility_boosts")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const createBoost = useMutation({
    mutationFn: async ({ boostType, targetId }: { boostType: BoostType; targetId?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("visibility_boosts")
        .insert({
          user_id: user.id,
          boost_type: boostType,
          target_id: targetId ?? null,
          cost: BOOST_COSTS[boostType],
          multiplier: 1.5,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-visibility-boosts"] });
      toast({ title: "Boost activated", description: "Your visibility has been boosted." });
    },
    onError: (err: any) => {
      toast({ title: "Boost failed", description: err.message, variant: "destructive" });
    },
  });

  const activeBoosts = (boosts.data ?? []).filter(
    (b: any) => b.status === "active" && new Date(b.expires_at) > new Date()
  );

  return {
    boosts: boosts.data ?? [],
    activeBoosts,
    createBoost,
    isLoading: boosts.isLoading,
    boostCosts: BOOST_COSTS,
  };
}
