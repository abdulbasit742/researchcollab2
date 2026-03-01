import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Subscription Plans ──
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data } = await supabase
        .from("institution_subscription_plans")
        .select("*")
        .order("monthly_price_pkr");
      return (data ?? []) as any[];
    },
    staleTime: 30 * 60 * 1000,
  });
}

// ── Institution Subscription ──
export function useInstitutionSubscription(institutionId?: string) {
  return useQuery({
    queryKey: ["institution-subscription", institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("institution_subscriptions")
        .select("*, institution_subscription_plans(*)")
        .eq("institution_id", institutionId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any | null;
    },
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Revenue Metrics ──
export function useRevenueMetrics() {
  return useQuery({
    queryKey: ["revenue-metrics"],
    queryFn: async () => {
      const { data } = await supabase
        .from("revenue_metrics_snapshots")
        .select("*")
        .order("snapshot_at", { ascending: false })
        .limit(12);
      return (data ?? []) as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Revenue Forecast ──
export function useRevenueForecast() {
  return useQuery({
    queryKey: ["revenue-forecast"],
    queryFn: async () => {
      const { data } = await supabase
        .from("revenue_forecast_models")
        .select("*")
        .order("forecast_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any | null;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ── Usage Metrics ──
export function useInstitutionUsageMetrics(institutionId?: string) {
  return useQuery({
    queryKey: ["institution-usage-metrics", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("institution_usage_metrics")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(12);
      return (data ?? []) as any[];
    },
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Upgrade Recommendations ──
export function useUpgradeRecommendations(institutionId?: string) {
  return useQuery({
    queryKey: ["upgrade-recommendations", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("upgrade_recommendations")
        .select("*")
        .eq("institution_id", institutionId)
        .order("recommended_at", { ascending: false })
        .limit(5);
      return (data ?? []) as any[];
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

// ── Enterprise Sales Intelligence (all institutions) ──
export function useEnterpriseSalesIntelligence() {
  return useQuery({
    queryKey: ["enterprise-sales-intelligence"],
    queryFn: async () => {
      // Get all active subscriptions with plans
      const { data: subs } = await supabase
        .from("institution_subscriptions")
        .select("*, institution_subscription_plans(*)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(100);

      // Get latest usage metrics per institution
      const { data: usage } = await supabase
        .from("institution_usage_metrics")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(100);

      return { subscriptions: subs ?? [], usage: usage ?? [] };
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ── Feature Access Logs ──
export function useFeatureAccessLogs(institutionId?: string) {
  return useQuery({
    queryKey: ["feature-access-logs", institutionId],
    queryFn: async () => {
      let query = supabase
        .from("feature_access_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data } = await query;
      return (data ?? []) as any[];
    },
    staleTime: 2 * 60 * 1000,
  });
}
