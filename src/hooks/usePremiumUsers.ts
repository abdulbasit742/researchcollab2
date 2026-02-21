import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PremiumUser {
  user_id: string;
  tier_name: string;
}

export function usePremiumUsers() {
  return useQuery({
    queryKey: ["premium-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(`
          user_id,
          subscription_tiers!inner (name)
        `)
        .eq("status", "active")
        .neq("subscription_tiers.name", "Free");

      if (error) throw error;

      const map = new Map<string, string>();
      for (const row of (data || [])) {
        const tierName = (row as any).subscription_tiers?.name?.toLowerCase() || "";
        if (tierName && tierName !== "free") {
          map.set(row.user_id, tierName);
        }
      }
      return map;
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}

export function useIsPremium(userId: string | undefined) {
  const { data: premiumMap } = usePremiumUsers();
  if (!userId || !premiumMap) return null;
  return premiumMap.get(userId) || null;
}
