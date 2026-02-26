import { supabase } from "@/integrations/supabase/client";

/**
 * Subscription Guard — checks user subscription tier before gated actions.
 *
 * Free: 3 active deals, 5 offers/month
 * Pro: unlimited offers, 20 deals
 * Institutional: org dashboard access
 * Enterprise: API access, unlimited everything
 */

export interface SubscriptionLimits {
  maxActiveDeals: number;
  maxOffersPerMonth: number;
  canAccessOrgDashboard: boolean;
  canGenerateApiKey: boolean;
  canAccessAdvancedAnalytics: boolean;
  tierName: string;
}

const TIER_LIMITS: Record<string, SubscriptionLimits> = {
  Free: {
    maxActiveDeals: 3,
    maxOffersPerMonth: 5,
    canAccessOrgDashboard: false,
    canGenerateApiKey: false,
    canAccessAdvancedAnalytics: false,
    tierName: "Free",
  },
  Pro: {
    maxActiveDeals: 20,
    maxOffersPerMonth: -1, // unlimited
    canAccessOrgDashboard: false,
    canGenerateApiKey: false,
    canAccessAdvancedAnalytics: true,
    tierName: "Pro",
  },
  Elite: {
    maxActiveDeals: -1,
    maxOffersPerMonth: -1,
    canAccessOrgDashboard: true,
    canGenerateApiKey: false,
    canAccessAdvancedAnalytics: true,
    tierName: "Elite",
  },
  Institutional: {
    maxActiveDeals: -1,
    maxOffersPerMonth: -1,
    canAccessOrgDashboard: true,
    canGenerateApiKey: true,
    canAccessAdvancedAnalytics: true,
    tierName: "Institutional",
  },
  Enterprise: {
    maxActiveDeals: -1,
    maxOffersPerMonth: -1,
    canAccessOrgDashboard: true,
    canGenerateApiKey: true,
    canAccessAdvancedAnalytics: true,
    tierName: "Enterprise",
  },
};

export async function getUserLimits(userId: string): Promise<SubscriptionLimits> {
  const { data } = await supabase
    .from("user_subscriptions")
    .select("*, subscription_tiers(name)")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const tierName = (data as any)?.subscription_tiers?.name ?? "Free";
  return TIER_LIMITS[tierName] ?? TIER_LIMITS.Free;
}

export async function canCreateDeal(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getUserLimits(userId);
  if (limits.maxActiveDeals === -1) return { allowed: true };

  const { count } = await supabase
    .from("deal_rooms")
    .select("id", { count: "exact", head: true })
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .in("status", ["negotiating", "agreed", "in_progress"]);

  if ((count ?? 0) >= limits.maxActiveDeals) {
    return { allowed: false, reason: `${limits.tierName} tier allows max ${limits.maxActiveDeals} active deals. Upgrade to continue.` };
  }
  return { allowed: true };
}

export async function canCreateOffer(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getUserLimits(userId);
  if (limits.maxOffersPerMonth === -1) return { allowed: true };

  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const { count } = await supabase
    .from("offers")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", userId)
    .gte("created_at", monthAgo.toISOString());

  if ((count ?? 0) >= limits.maxOffersPerMonth) {
    return { allowed: false, reason: `${limits.tierName} tier allows max ${limits.maxOffersPerMonth} offers/month. Upgrade to continue.` };
  }
  return { allowed: true };
}

export async function canGenerateApiKey(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getUserLimits(userId);
  if (!limits.canGenerateApiKey) {
    return { allowed: false, reason: "API key generation requires Institutional or Enterprise tier." };
  }
  return { allowed: true };
}

export async function canAccessOrgDashboard(userId: string): Promise<boolean> {
  const limits = await getUserLimits(userId);
  return limits.canAccessOrgDashboard;
}
