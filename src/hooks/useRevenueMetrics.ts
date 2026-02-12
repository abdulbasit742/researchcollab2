import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RevenueLedgerEntry {
  id: string;
  user_id: string | null;
  institution_id: string | null;
  revenue_type: string;
  source_id: string | null;
  gross_amount: number;
  platform_cut: number;
  net_amount: number;
  currency: string;
  created_at: string;
}

export interface DailyMetrics {
  id: string;
  date: string;
  total_revenue: number;
  subscription_revenue: number;
  transaction_revenue: number;
  enterprise_revenue: number;
  ai_revenue: number;
  affiliate_revenue: number;
  boost_revenue: number;
  active_users: number;
}

export interface RevenueForecast {
  id: string;
  forecast_date: string;
  projected_mrr: number;
  projected_transaction_volume: number;
  projected_enterprise_revenue: number;
  projected_ai_revenue: number;
  churn_risk: number;
  enterprise_pipeline_value: number;
  confidence_score: number;
}

export function useRevenueMetrics(days = 30) {
  const dailyMetrics = useQuery({
    queryKey: ["revenue-metrics-daily", days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue_metrics_daily")
        .select("*")
        .order("date", { ascending: false })
        .limit(days);
      if (error) throw error;
      return (data ?? []) as DailyMetrics[];
    },
  });

  const ledger = useQuery({
    queryKey: ["revenue-ledger-recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_revenue_ledger")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as RevenueLedgerEntry[];
    },
  });

  const forecasts = useQuery({
    queryKey: ["revenue-forecasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue_forecasts")
        .select("*")
        .order("forecast_date", { ascending: true })
        .limit(12);
      if (error) throw error;
      return (data ?? []) as RevenueForecast[];
    },
  });

  const leakageAlerts = useQuery({
    queryKey: ["leakage-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leakage_detection")
        .select("*")
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Compute summary from daily metrics
  const latest = dailyMetrics.data?.[0];
  const summary = {
    mrr: latest?.total_revenue ?? 0,
    subscriptionRevenue: latest?.subscription_revenue ?? 0,
    transactionRevenue: latest?.transaction_revenue ?? 0,
    enterpriseRevenue: latest?.enterprise_revenue ?? 0,
    aiRevenue: latest?.ai_revenue ?? 0,
    affiliateRevenue: latest?.affiliate_revenue ?? 0,
    boostRevenue: latest?.boost_revenue ?? 0,
    activeUsers: latest?.active_users ?? 0,
    revenuePerUser: latest && latest.active_users > 0 
      ? latest.total_revenue / latest.active_users 
      : 0,
  };

  return {
    dailyMetrics: dailyMetrics.data ?? [],
    ledger: ledger.data ?? [],
    forecasts: forecasts.data ?? [],
    leakageAlerts: leakageAlerts.data ?? [],
    summary,
    isLoading: dailyMetrics.isLoading || ledger.isLoading,
  };
}

export function useCommissionRules() {
  return useQuery({
    queryKey: ["commission-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_rules")
        .select("*")
        .order("min_trust_score", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useEnterpriseContracts() {
  return useQuery({
    queryKey: ["enterprise-contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enterprise_contracts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useInstitutionUsage(institutionId?: string) {
  return useQuery({
    queryKey: ["institution-usage", institutionId],
    enabled: !!institutionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institution_usage_metrics")
        .select("*")
        .eq("institution_id", institutionId!)
        .order("period", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });
}
