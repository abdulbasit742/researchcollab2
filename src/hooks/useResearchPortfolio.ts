/**
 * React hooks for the Research Portfolio Optimization Engine (RPOE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useResearchPortfolios() {
  return useQuery({
    queryKey: ["research-portfolios"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await (supabase as any).from("research_portfolios")
        .select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreatePortfolio() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: { title: string; owner_type: string; total_budget: number; description?: string; strategy_profile?: Record<string, any> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any).from("research_portfolios").insert({
        ...params, owner_id: user.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Portfolio created" });
      qc.invalidateQueries({ queryKey: ["research-portfolios"] });
    },
  });
}

export function usePortfolioAllocations(portfolioId?: string) {
  return useQuery({
    queryKey: ["portfolio-allocations", portfolioId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("portfolio_allocations")
        .select("*").eq("portfolio_id", portfolioId).order("created_at");
      if (error) throw error;
      return data as any[];
    },
    enabled: !!portfolioId,
  });
}

export function useAddAllocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { portfolio_id: string; project_title: string; allocated_budget: number; risk_score?: number; expected_impact_score?: number; trust_score?: number; region?: string; sector?: string; stage?: string }) => {
      const { data, error } = await (supabase as any).from("portfolio_allocations").insert(params).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["portfolio-allocations", v.portfolio_id] }),
  });
}

export function usePortfolioSnapshots(portfolioId?: string) {
  return useQuery({
    queryKey: ["portfolio-snapshots", portfolioId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("portfolio_snapshots")
        .select("*").eq("portfolio_id", portfolioId).order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!portfolioId,
  });
}

export function useOptimizePortfolio() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (portfolio_id: string) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "portfolio_optimize", portfolio_id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, pid) => {
      toast({ title: "Optimization complete" });
      qc.invalidateQueries({ queryKey: ["portfolio-allocations", pid] });
      qc.invalidateQueries({ queryKey: ["portfolio-snapshots", pid] });
    },
  });
}

export function useStressTestPortfolio() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: { portfolio_id: string; stress_type?: string }) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "portfolio_stress_test", ...params },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => {
      toast({ title: "Stress test complete" });
      qc.invalidateQueries({ queryKey: ["portfolio-snapshots", v.portfolio_id] });
    },
  });
}
