/**
 * AI Predictive Trust Model — forecasts trust degradation risk.
 *
 * Inputs: historical disputes, completion patterns, response delays,
 * wallet instability, network behavior.
 *
 * Output: predictive_trust_risk (0–100), stored separately from trust_score.
 */

import { supabase } from "@/integrations/supabase/client";

export interface PredictiveTrustResult {
  userId: string;
  predictiveRisk: number;
  riskFactors: Record<string, number>;
  recommendation: string;
  computedAt: string;
}

export async function computePredictiveTrustRisk(userId: string): Promise<PredictiveTrustResult> {
  const [trustRes, walletRes, advancesRes] = await Promise.all([
    supabase.from("user_trust_profiles").select("trust_score, dispute_rate, successful_rate, response_time_hours, trust_velocity_24h, decay_applied_at").eq("user_id", userId).maybeSingle(),
    supabase.from("wallets").select("available_balance, escrow_balance, pending_balance").eq("user_id", userId).maybeSingle(),
    supabase.from("capital_advances").select("status").eq("user_id", userId),
  ]);

  const trust = trustRes.data;
  const wallet = walletRes.data;
  const advances = advancesRes.data ?? [];

  const riskFactors: Record<string, number> = {};

  // 1. Dispute trajectory (30%)
  const disputeRate = trust?.dispute_rate ?? 0;
  riskFactors.dispute_trajectory = Math.min(100, disputeRate * 200);

  // 2. Completion decay (20%)
  const successRate = trust?.successful_rate ?? 0;
  riskFactors.completion_decay = Math.max(0, 100 - successRate * 100);

  // 3. Response degradation (15%)
  const responseHours = trust?.response_time_hours ?? 24;
  riskFactors.response_degradation = Math.min(100, Math.max(0, (responseHours - 4) * 5));

  // 4. Wallet instability (15%)
  const balance = wallet?.available_balance ?? 0;
  const escrow = wallet?.escrow_balance ?? 0;
  const walletRatio = balance + escrow > 0 ? escrow / (balance + escrow) : 0;
  riskFactors.wallet_instability = Math.min(100, walletRatio > 0.8 ? walletRatio * 100 : 0);

  // 5. Trust velocity (10%)
  const velocity = trust?.trust_velocity_24h ?? 0;
  riskFactors.trust_velocity_risk = velocity < -2 ? Math.min(100, Math.abs(velocity) * 20) : 0;

  // 6. Capital exposure (10%)
  const activeAdvances = advances.filter(a => ["disbursed", "repaying"].includes(a.status)).length;
  riskFactors.capital_exposure = Math.min(100, activeAdvances * 40);

  // Weighted composite
  const predictiveRisk = Math.round(
    riskFactors.dispute_trajectory * 0.30 +
    riskFactors.completion_decay * 0.20 +
    riskFactors.response_degradation * 0.15 +
    riskFactors.wallet_instability * 0.15 +
    riskFactors.trust_velocity_risk * 0.10 +
    riskFactors.capital_exposure * 0.10
  );

  let recommendation = "Stable";
  if (predictiveRisk > 70) recommendation = "High risk — consider restricting capital access";
  else if (predictiveRisk > 50) recommendation = "Elevated risk — monitor closely";
  else if (predictiveRisk > 30) recommendation = "Moderate — standard monitoring";

  return {
    userId,
    predictiveRisk: Math.min(100, predictiveRisk),
    riskFactors,
    recommendation,
    computedAt: new Date().toISOString(),
  };
}

export async function batchComputeRisk(userIds: string[]): Promise<PredictiveTrustResult[]> {
  const results: PredictiveTrustResult[] = [];
  // Process in chunks of 10 to avoid overwhelming the DB
  for (let i = 0; i < userIds.length; i += 10) {
    const chunk = userIds.slice(i, i + 10);
    const chunkResults = await Promise.all(chunk.map(id => computePredictiveTrustRisk(id)));
    results.push(...chunkResults);
  }
  return results;
}
