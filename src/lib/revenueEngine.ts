import { supabase } from "@/integrations/supabase/client";

/**
 * Revenue Engine — platform fee computation, commission tracking, earnings analytics.
 *
 * Fee schedule (trust-weighted):
 *   Bronze: 12%
 *   Silver: 10%
 *   Gold:   8%
 *   Platinum: 6%
 *
 * Uses existing tables: platform_fees, platform_fee_rules, platform_revenue_ledger.
 * DB function get_platform_fee(amount, user_id) handles server-side computation.
 */

const TRUST_FEE_MAP: Record<string, number> = {
  bronze: 0.12,
  silver: 0.10,
  gold: 0.08,
  platinum: 0.06,
};

export function calculatePlatformFee(amount: number, trustTier: string): number {
  const rate = TRUST_FEE_MAP[trustTier.toLowerCase()] ?? 0.12;
  return Math.round(amount * rate * 100) / 100;
}

export async function recordPlatformFee(params: {
  dealId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  trustTier: string;
}): Promise<void> {
  const feeAmount = calculatePlatformFee(params.amount, params.trustTier);
  const feePercentage = (TRUST_FEE_MAP[params.trustTier.toLowerCase()] ?? 0.12) * 100;
  const netPayout = params.amount - feeAmount;

  const { error } = await supabase.from("platform_fees").insert({
    deal_id: params.dealId,
    payer_id: params.payerId,
    payee_id: params.payeeId,
    gross_amount: params.amount,
    net_payout: netPayout,
    platform_fee_amount: feeAmount,
    platform_fee_percentage: feePercentage,
    trust_tier: params.trustTier,
  });

  if (error) throw error;
}

export async function getRevenueAnalytics() {
  const { data, error } = await supabase
    .from("platform_revenue_ledger")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}

export async function getRevenueSummary() {
  const { data: fees, error } = await supabase
    .from("platform_fees")
    .select("platform_fee_amount, gross_amount, trust_tier, created_at");

  if (error) throw error;

  const allFees = fees ?? [];
  const totalRevenue = allFees.reduce((s, f) => s + (f.platform_fee_amount ?? 0), 0);
  const totalDealVolume = allFees.reduce((s, f) => s + (f.gross_amount ?? 0), 0);
  const avgFeeRate = totalDealVolume > 0 ? (totalRevenue / totalDealVolume) * 100 : 0;

  // Revenue by tier
  const byTier: Record<string, number> = {};
  for (const f of allFees) {
    const tier = f.trust_tier ?? "unknown";
    byTier[tier] = (byTier[tier] ?? 0) + (f.platform_fee_amount ?? 0);
  }

  // Monthly revenue (last 12 months)
  const monthly: Record<string, number> = {};
  for (const f of allFees) {
    const month = f.created_at.substring(0, 7);
    monthly[month] = (monthly[month] ?? 0) + (f.platform_fee_amount ?? 0);
  }

  return {
    totalRevenue,
    totalDealVolume,
    avgFeeRate: Math.round(avgFeeRate * 100) / 100,
    totalTransactions: allFees.length,
    byTier,
    monthly,
  };
}

export async function getEarningsForUser(userId: string) {
  const { data, error } = await supabase
    .from("profile_proof_metrics")
    .select("total_earnings, projects_completed, escrow_success_rate")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
