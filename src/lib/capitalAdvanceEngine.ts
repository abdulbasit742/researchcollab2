import { supabase } from "@/integrations/supabase/client";

/**
 * Capital Advance Engine — eligibility scoring, advance creation, repayment logic.
 *
 * Eligibility formula (weighted):
 *   40% trust score
 *   20% completion rate
 *   20% earnings consistency (revenue_volatility inverse)
 *   20% low dispute rate (inverse)
 *
 * Credit bands determine max advance %:
 *   A2: 80% | A1: 65% | B2: 50% | B1: 35% | C2: 20% | C1: 10%
 */

export interface AdvanceEligibility {
  eligible: boolean;
  eligibility_score: number;
  credit_band: string;
  max_advance_percent: number;
  probability_of_default: number;
  reason?: string;
}

const BAND_MAX_PERCENT: Record<string, number> = {
  A2: 80, A1: 65, B2: 50, B1: 35, C2: 20, C1: 10,
};

export async function computeAdvanceEligibility(userId: string): Promise<AdvanceEligibility> {
  const [creditRes, trustRes, advancesRes] = await Promise.all([
    supabase.from("professional_credit_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("user_trust_profiles").select("trust_score, successful_rate, dispute_rate").eq("user_id", userId).maybeSingle(),
    supabase.from("capital_advances").select("id, status").eq("user_id", userId).in("status", ["requested", "under_review", "approved", "disbursed", "repaying"]),
  ]);

  const credit = creditRes.data;
  const trust = trustRes.data;

  if (!credit || !trust) {
    return { eligible: false, eligibility_score: 0, credit_band: "C1", max_advance_percent: 0, probability_of_default: 1, reason: "Insufficient profile data" };
  }

  // Prevent stacking: max 2 active advances
  if ((advancesRes.data?.length ?? 0) >= 2) {
    return { eligible: false, eligibility_score: 0, credit_band: credit.credit_band, max_advance_percent: 0, probability_of_default: credit.probability_of_default ?? 0.5, reason: "Maximum active advances reached" };
  }

  const trustNorm = Math.min(100, trust.trust_score ?? 0);
  const completionNorm = Math.min(100, (trust.successful_rate ?? 0) * 100);
  const earningsConsistency = Math.max(0, 100 - (credit.revenue_volatility ?? 50) * 100);
  const lowDisputeNorm = Math.max(0, 100 - (trust.dispute_rate ?? 0) * 100);

  const eligibility_score = Math.round(
    trustNorm * 0.4 +
    completionNorm * 0.2 +
    earningsConsistency * 0.2 +
    lowDisputeNorm * 0.2
  );

  const max_advance_percent = BAND_MAX_PERCENT[credit.credit_band] ?? 10;
  const eligible = eligibility_score >= 30 && (credit.probability_of_default ?? 1) < 0.5;

  return {
    eligible,
    eligibility_score,
    credit_band: credit.credit_band,
    max_advance_percent,
    probability_of_default: credit.probability_of_default ?? 0.5,
    reason: eligible ? undefined : "Eligibility score too low or default risk too high",
  };
}

export async function requestAdvance(params: {
  userId: string;
  dealId?: string;
  milestoneId?: string;
  amount: number;
}) {
  if (params.amount <= 0) throw new Error("Amount must be positive");

  const eligibility = await computeAdvanceEligibility(params.userId);
  if (!eligibility.eligible) throw new Error(eligibility.reason ?? "Not eligible for advance");

  const { data, error } = await supabase
    .from("capital_advances")
    .insert({
      user_id: params.userId,
      deal_id: params.dealId ?? null,
      milestone_id: params.milestoneId ?? null,
      requested_amount: params.amount,
      credit_band_at_request: eligibility.credit_band,
      risk_score_at_request: eligibility.probability_of_default,
      status: "requested",
    })
    .select()
    .single();

  if (error) throw error;

  // Log audit
  await supabase.from("admin_audit_logs").insert({
    admin_id: params.userId,
    action: "capital_advance_requested",
    entity_type: "capital_advance",
    entity_id: data.id,
    details: { amount: params.amount, credit_band: eligibility.credit_band },
  });

  return data;
}

export async function processRepayment(advanceId: string, amount: number, userId: string) {
  if (amount <= 0) throw new Error("Repayment amount must be positive");

  const { data: advance, error: fetchErr } = await supabase
    .from("capital_advances")
    .select("*")
    .eq("id", advanceId)
    .single();

  if (fetchErr || !advance) throw new Error("Advance not found");
  if (advance.user_id !== userId) throw new Error("Unauthorized");
  if (!["disbursed", "repaying"].includes(advance.status)) throw new Error("Advance not in repayable state");

  const newRepaid = (advance.repaid_amount ?? 0) + amount;
  const approved = advance.approved_amount ?? advance.requested_amount;
  const fullyRepaid = newRepaid >= approved;

  const { error } = await supabase
    .from("capital_advances")
    .update({
      repaid_amount: newRepaid,
      status: fullyRepaid ? "repaid" : "repaying",
      repaid_at: fullyRepaid ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", advanceId);

  if (error) throw error;
  return { fullyRepaid, newRepaid, outstanding: Math.max(0, approved - newRepaid) };
}

export async function getActiveAdvances(userId: string) {
  const { data, error } = await supabase
    .from("capital_advances")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["requested", "under_review", "approved", "disbursed", "repaying"])
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
