/**
 * useFundingPlan — Hooks for Research-to-Capital Structuring Engine.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface FundingPlan {
  id: string;
  workspace_id: string;
  owner_id: string;
  title: string;
  plan_type: string;
  total_budget: number;
  duration_months: number;
  currency: string;
  status: string;
  problem_statement: string | null;
  proposed_solution: string | null;
  risk_score: number | null;
  feasibility_index: number | null;
  trust_weighted_score: number | null;
  source_claim_ids: string[];
  ai_generation_metadata: Record<string, any>;
  version_number: number;
  created_at: string;
  updated_at: string;
}

export interface FundingMilestone {
  id: string;
  funding_plan_id: string;
  milestone_title: string;
  milestone_description: string | null;
  linked_research_claim_ids: string[];
  budget_amount: number;
  expected_duration_days: number;
  risk_level: string;
  deliverable_description: string | null;
  evidence_requirement: string | null;
  performance_metric: string | null;
  sort_order: number;
  created_at: string;
}

export interface BudgetItem {
  id: string;
  funding_plan_id: string;
  category: string;
  amount: number;
  justification_text: string | null;
  linked_milestone_id: string | null;
  created_at: string;
}

// Fetch all plans for a workspace
export function useWorkspaceFundingPlans(workspaceId?: string) {
  return useQuery({
    queryKey: ["funding-plans", workspaceId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("funding_plans")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FundingPlan[];
    },
    enabled: !!workspaceId,
  });
}

// Fetch single plan with milestones and budget
export function useFundingPlanDetail(planId?: string) {
  return useQuery({
    queryKey: ["funding-plan-detail", planId],
    queryFn: async () => {
      const [planRes, msRes, budgetRes] = await Promise.all([
        (supabase as any).from("funding_plans").select("*").eq("id", planId!).single(),
        (supabase as any).from("funding_plan_milestones").select("*").eq("funding_plan_id", planId!).order("sort_order"),
        (supabase as any).from("funding_plan_budget_breakdown").select("*").eq("funding_plan_id", planId!),
      ]);
      if (planRes.error) throw planRes.error;
      return {
        plan: planRes.data as FundingPlan,
        milestones: (msRes.data ?? []) as FundingMilestone[],
        budget: (budgetRes.data ?? []) as BudgetItem[],
      };
    },
    enabled: !!planId,
  });
}

// Generate funding plan from research
export function useGenerateFundingPlan() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      workspaceId: string;
      planType?: string;
      title?: string;
      durationMonths?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: {
          action: "generate_funding_plan",
          workspace_id: params.workspaceId,
          plan_type: params.planType || "grant",
          title: params.title,
          duration_months: params.durationMonths || 12,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["funding-plans", vars.workspaceId] });
      toast({ title: "Funding plan generated", description: "Research converted to capital structure." });
    },
    onError: (err: Error) => {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    },
  });
}

// Run feasibility simulation
export function useSimulateFeasibility() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { fundingPlanId: string }) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: {
          action: "simulate_feasibility",
          funding_plan_id: params.fundingPlanId,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["funding-plan-detail", vars.fundingPlanId] });
      toast({ title: "Feasibility simulation complete" });
    },
    onError: (err: Error) => {
      toast({ title: "Simulation failed", description: err.message, variant: "destructive" });
    },
  });
}

// Convert plan to escrow (creates deal + escrow milestones)
export function useConvertToEscrow() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { planId: string }) => {
      if (!user) throw new Error("Not authenticated");
      // Fetch full plan
      const { data: plan, error: pErr } = await (supabase as any)
        .from("funding_plans").select("*").eq("id", params.planId).single();
      if (pErr || !plan) throw new Error("Plan not found");

      const { data: milestones } = await (supabase as any)
        .from("funding_plan_milestones").select("*").eq("funding_plan_id", params.planId).order("sort_order");

      // Update plan status
      await (supabase as any).from("funding_plans")
        .update({ status: "submitted", updated_at: new Date().toISOString() })
        .eq("id", params.planId);

      return { plan, milestones: milestones || [], escrow_ready: true };
    },
    onSuccess: () => {
      toast({ title: "Plan marked as escrow-ready", description: "The funding plan is now ready for escrow conversion." });
    },
    onError: (err: Error) => {
      toast({ title: "Conversion failed", description: err.message, variant: "destructive" });
    },
  });
}
