import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ─── Skill Liquidity ────────────────────────────────────────
export interface SkillLiquidity {
  id: string;
  skill_name: string;
  total_active_projects: number;
  total_active_bids: number;
  avg_bid_price: number;
  avg_project_budget: number;
  deal_conversion_rate: number;
  trust_weighted_success_rate: number;
  liquidity_score: number;
  liquidity_category: string | null;
  fill_rate: number | null;
  avg_deal_time_hours: number | null;
  abandonment_rate: number | null;
  region: string | null;
  updated_at: string;
}

export function useSkillLiquidity(region?: string) {
  return useQuery({
    queryKey: ["limse-skills", region],
    queryFn: async () => {
      let q = supabase
        .from("skill_market_metrics")
        .select("*")
        .order("liquidity_score", { ascending: false })
        .limit(100);
      if (region) q = q.eq("region", region);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as SkillLiquidity[];
    },
  });
}

// ─── Institutional Health ───────────────────────────────────
export interface InstitutionHealth {
  id: string;
  institution_id: string;
  revenue_per_member: number;
  avg_trust_growth: number;
  deal_completion_rate: number;
  skill_utilization_ratio: number;
  idle_talent_percent: number;
  health_grade: string;
  health_score: number;
  early_warnings: string[];
  intervention_suggestions: string[];
  computed_at: string;
}

export function useInstitutionHealth() {
  return useQuery({
    queryKey: ["limse-institution-health"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institution_economic_health")
        .select("*")
        .order("health_score", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as InstitutionHealth[];
    },
  });
}

// ─── Skill Forecasts ────────────────────────────────────────
export interface SkillForecast {
  id: string;
  skill_name: string;
  forecast_period: string;
  predicted_demand_change: number;
  predicted_supply_change: number;
  predicted_price_change: number;
  confidence_score: number;
  signal: string;
  ai_reasoning: string | null;
  computed_at: string;
}

export function useSkillForecasts() {
  return useQuery({
    queryKey: ["limse-forecasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skill_forecasts")
        .select("*")
        .order("computed_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as SkillForecast[];
    },
  });
}

// ─── Global Flows ───────────────────────────────────────────
export interface LiquidityFlow {
  id: string;
  source_region: string;
  target_region: string;
  skill_name: string | null;
  deal_volume: number;
  total_value: number;
  currency: string;
  flow_period: string;
  period_start: string;
  period_end: string;
}

export function useGlobalFlows() {
  return useQuery({
    queryKey: ["limse-flows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_liquidity_flows")
        .select("*")
        .order("total_value", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as LiquidityFlow[];
    },
  });
}

// ─── Market Adjustments ─────────────────────────────────────
export interface MarketAdjustment {
  id: string;
  adjustment_type: string;
  skill_name: string | null;
  region: string | null;
  trigger_condition: string;
  action_taken: string;
  parameters: Record<string, unknown>;
  is_reversible: boolean;
  reversed_at: string | null;
  applied_by: string;
  ai_confidence: number | null;
  created_at: string;
}

export function useMarketAdjustments() {
  return useQuery({
    queryKey: ["limse-adjustments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("market_adjustments_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as MarketAdjustment[];
    },
  });
}

// ─── Aggregate Stats ────────────────────────────────────────
export function useLIMSEStats() {
  const skills = useSkillLiquidity();
  const metrics = skills.data ?? [];

  const scarce = metrics.filter(m => m.liquidity_score < 20);
  const balanced = metrics.filter(m => m.liquidity_score >= 20 && m.liquidity_score <= 60);
  const oversupplied = metrics.filter(m => m.liquidity_score > 60 && m.total_active_bids > m.total_active_projects * 3);
  const avgLiquidity = metrics.length
    ? Math.round(metrics.reduce((s, m) => s + m.liquidity_score, 0) / metrics.length * 10) / 10
    : 0;

  return {
    metrics,
    loading: skills.isLoading,
    scarce,
    balanced,
    oversupplied,
    avgLiquidity,
    totalSkills: metrics.length,
    topSkill: metrics[0] ?? null,
  };
}
