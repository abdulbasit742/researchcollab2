/**
 * React hooks for the Global Research & Execution Matching Engine (GREME).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useExecutionOpportunities(filters?: { type?: string; region?: string }) {
  return useQuery({
    queryKey: ["execution-opportunities", filters],
    queryFn: async () => {
      let q = (supabase as any).from("execution_opportunities").select("*").eq("status", "open").eq("is_public", true).order("created_at", { ascending: false });
      if (filters?.type) q = q.eq("opportunity_type", filters.type);
      if (filters?.region) q = q.eq("region_scope", filters.region);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useMyOpportunities() {
  return useQuery({
    queryKey: ["my-opportunities"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await (supabase as any).from("execution_opportunities").select("*").eq("created_by", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: { title: string; opportunity_type: string; description?: string; required_skills?: string[]; budget_range_min?: number; budget_range_max?: number; region_scope?: string; trust_threshold?: number; cross_border_allowed?: boolean; team_formation_enabled?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any).from("execution_opportunities").insert({ ...params, created_by: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Opportunity posted" });
      qc.invalidateQueries({ queryKey: ["execution-opportunities"] });
      qc.invalidateQueries({ queryKey: ["my-opportunities"] });
    },
  });
}

export function useOpportunityApplications(opportunityId?: string) {
  return useQuery({
    queryKey: ["opportunity-applications", opportunityId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("opportunity_applications").select("*").eq("opportunity_id", opportunityId).order("matching_score", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!opportunityId,
  });
}

export function useApplyToOpportunity() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: { opportunity_id: string; application_text: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any).from("opportunity_applications").insert({ ...params, applicant_id: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => {
      toast({ title: "Application submitted" });
      qc.invalidateQueries({ queryKey: ["opportunity-applications", v.opportunity_id] });
    },
  });
}

export function useRunMatching() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (opportunity_id: string) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "match_opportunity", opportunity_id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, oid) => {
      toast({ title: "Matching complete" });
      qc.invalidateQueries({ queryKey: ["opportunity-applications", oid] });
    },
  });
}

export function useRunTeamFormation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (opportunity_id: string) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "team_formation", opportunity_id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => toast({ title: "Team formation complete" }),
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; status: string; opportunity_id: string }) => {
      const { error } = await (supabase as any).from("opportunity_applications").update({ status: params.status }).eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["opportunity-applications", v.opportunity_id] }),
  });
}
