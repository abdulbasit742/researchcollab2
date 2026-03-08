/**
 * Research Capital Market — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getResearchFunds(status?: string) {
  let q = (supabase as any).from("research_funds").select("*").order("total_size", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createResearchFund(input: {
  fund_name: string; description?: string; fund_type?: string;
  total_size: number; domain?: string; region?: string;
  management_fee_pct?: number; success_fee_pct?: number; created_by: string;
}) {
  const { data, error } = await (supabase as any).from("research_funds")
    .insert({ ...input, available_amount: input.total_size }).select().single();
  if (error) throw error;
  return data;
}

export async function contributeToFund(fund_id: string, contributor_id: string, amount: number) {
  const { data, error } = await (supabase as any).from("fund_contributions")
    .insert({ fund_id, contributor_id, amount }).select().single();
  if (error) throw error;
  return data;
}

export async function getFundAllocations(fund_id: string) {
  const { data, error } = await (supabase as any).from("fund_allocations")
    .select("*").eq("fund_id", fund_id).order("allocated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export const FUND_TYPES = ["research_pool", "challenge_fund", "institutional_grant"];
