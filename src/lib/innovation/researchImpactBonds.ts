import { supabase } from "@/integrations/supabase/client";

export interface ImpactBond {
  id: string;
  title: string;
  description: string | null;
  issuer_id: string;
  institution_id: string | null;
  research_domain: string;
  target_outcome: string;
  bond_amount: number;
  funded_amount: number;
  min_investment: number;
  max_return_rate: number;
  outcome_metrics: any[];
  status: string;
  maturity_date: string | null;
  created_at: string;
}

export async function fetchImpactBonds(status?: string) {
  let query = supabase.from("research_impact_bonds").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data as ImpactBond[];
}

export async function createImpactBond(bond: Omit<ImpactBond, "id" | "created_at" | "funded_amount">) {
  const { data, error } = await supabase.from("research_impact_bonds").insert(bond).select().single();
  if (error) throw error;
  return data;
}

export async function investInBond(bondId: string, investorId: string, amount: number) {
  const { data, error } = await supabase.from("bond_investments").insert({
    bond_id: bondId,
    investor_id: investorId,
    amount,
    expected_return: amount * 1.15,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function fetchMyInvestments(userId: string) {
  const { data, error } = await supabase.from("bond_investments").select("*").eq("investor_id", userId);
  if (error) throw error;
  return data;
}

export function getBondAnalytics(bonds: ImpactBond[]) {
  const totalCapital = bonds.reduce((s, b) => s + Number(b.bond_amount), 0);
  const totalFunded = bonds.reduce((s, b) => s + Number(b.funded_amount), 0);
  const byDomain = bonds.reduce((acc, b) => {
    acc[b.research_domain] = (acc[b.research_domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return { totalCapital, totalFunded, fundingRate: totalCapital > 0 ? totalFunded / totalCapital : 0, byDomain };
}
