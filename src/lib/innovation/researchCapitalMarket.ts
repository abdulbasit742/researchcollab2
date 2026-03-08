/**
 * Research Capital Market — Enhanced service layer.
 * Covers: Research Assets, Bonds, Funds, Contributions, Allocations.
 * Advisory-only. Does NOT mutate core financial systems.
 */
import { supabase } from "@/integrations/supabase/client";

// ── Research Funds (existing) ──

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

export async function getFundContributions(fund_id: string) {
  const { data, error } = await (supabase as any).from("fund_contributions")
    .select("*").eq("fund_id", fund_id).order("contributed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getFundAllocations(fund_id: string) {
  const { data, error } = await (supabase as any).from("fund_allocations")
    .select("*").eq("fund_id", fund_id).order("allocated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Research Assets ──

export async function getResearchAssets(filters?: { asset_type?: string; validation_status?: string }) {
  let q = (supabase as any).from("research_assets").select("*").order("created_at", { ascending: false });
  if (filters?.asset_type) q = q.eq("asset_type", filters.asset_type);
  if (filters?.validation_status) q = q.eq("validation_status", filters.validation_status);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createResearchAsset(input: {
  creator_id: string; title: string; description?: string;
  asset_type?: string; ip_status?: string; valuation_score?: number;
}) {
  const { data, error } = await (supabase as any).from("research_assets")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── Research Bonds ──

export async function getResearchBonds(status?: string) {
  let q = (supabase as any).from("research_bonds").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createResearchBond(input: {
  bond_name: string; issuing_institution: string; total_principal: number;
  coupon_rate?: number; maturity_date: string; backing_asset_ids?: string[];
  region_scope?: string[];
}) {
  const { data, error } = await (supabase as any).from("research_bonds")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── Market Analytics (derived) ──

export async function getMarketAnalytics() {
  const [funds, assets, bonds] = await Promise.all([
    getResearchFunds(),
    getResearchAssets(),
    getResearchBonds(),
  ]);

  const totalCapital = funds.reduce((s: number, f: any) => s + (f.total_size || 0), 0);
  const totalAllocated = funds.reduce((s: number, f: any) => s + (f.allocated_amount || 0), 0);
  const totalBondPrincipal = bonds.reduce((s: number, b: any) => s + (b.total_principal || 0), 0);

  const domainMap: Record<string, number> = {};
  funds.forEach((f: any) => {
    if (f.domain) domainMap[f.domain] = (domainMap[f.domain] || 0) + (f.total_size || 0);
  });
  const topDomains = Object.entries(domainMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([domain, capital]) => ({ domain, capital }));

  return {
    totalFunds: funds.length,
    totalCapital,
    totalAllocated,
    allocationRate: totalCapital > 0 ? Math.round((totalAllocated / totalCapital) * 100) : 0,
    totalAssets: assets.length,
    totalBonds: bonds.length,
    totalBondPrincipal,
    topDomains,
  };
}

export const FUND_TYPES = ["research_pool", "challenge_fund", "institutional_grant"];
export const ASSET_TYPES = ["dataset", "algorithm", "patent", "publication", "prototype", "methodology"];
export const BOND_STATUSES = ["draft", "active", "matured", "defaulted"];
