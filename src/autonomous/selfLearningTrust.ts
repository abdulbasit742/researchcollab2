/**
 * Self-Learning Trust Adjustment — adjusts trust weight coefficients
 * based on observed prediction errors and outcome patterns.
 *
 * All adjustments bounded within safe ranges. Fully auditable.
 */

import { supabase } from "@/integrations/supabase/client";

export interface TrustWeightConfig {
  disputeWeight: number;
  completionWeight: number;
  volatilityPenalty: number;
  responseWeight: number;
  endorsementWeight: number;
  updatedAt: string;
  adjustmentReason: string;
}

const DEFAULT_WEIGHTS: TrustWeightConfig = {
  disputeWeight: 0.25,
  completionWeight: 0.30,
  volatilityPenalty: 0.15,
  responseWeight: 0.15,
  endorsementWeight: 0.15,
  updatedAt: new Date().toISOString(),
  adjustmentReason: "default",
};

const BOUNDS = {
  disputeWeight: { min: 0.10, max: 0.40 },
  completionWeight: { min: 0.15, max: 0.45 },
  volatilityPenalty: { min: 0.05, max: 0.25 },
  responseWeight: { min: 0.05, max: 0.25 },
  endorsementWeight: { min: 0.05, max: 0.25 },
};

let currentWeights: TrustWeightConfig = { ...DEFAULT_WEIGHTS };

export function getCurrentWeights(): TrustWeightConfig {
  return { ...currentWeights };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeWeights(w: TrustWeightConfig): TrustWeightConfig {
  const sum = w.disputeWeight + w.completionWeight + w.volatilityPenalty + w.responseWeight + w.endorsementWeight;
  if (Math.abs(sum - 1) > 0.001) {
    w.disputeWeight /= sum;
    w.completionWeight /= sum;
    w.volatilityPenalty /= sum;
    w.responseWeight /= sum;
    w.endorsementWeight /= sum;
  }
  return w;
}

export async function recalibrateWeights(): Promise<{
  previous: TrustWeightConfig;
  updated: TrustWeightConfig;
  adjustments: Record<string, number>;
}> {
  const previous = { ...currentWeights };
  const adjustments: Record<string, number> = {};

  // Fetch prediction vs actual dispute data
  const { data: predictions } = await supabase
    .from("dispute_prediction_logs")
    .select("predicted_risk_score, actual_outcome")
    .order("created_at", { ascending: false })
    .limit(200);

  const preds = predictions ?? [];

  // Compute dispute prediction error
  const disputed = preds.filter((p: any) => p.actual_outcome === "disputed");
  const notDisputed = preds.filter((p: any) => p.actual_outcome === "resolved" || p.actual_outcome === "completed");
  const falseNegatives = disputed.filter((p: any) => (p.predicted_risk_score ?? 0) < 30).length;
  const falsePositives = notDisputed.filter((p: any) => (p.predicted_risk_score ?? 0) > 70).length;

  const errorRate = preds.length > 0 ? (falseNegatives + falsePositives) / preds.length : 0;

  // Fetch trust volatility
  const { data: trusts } = await supabase
    .from("user_trust_profiles")
    .select("trust_velocity_24h")
    .not("trust_velocity_24h", "is", null);

  const velocities = (trusts ?? []).map((t: any) => Math.abs(t.trust_velocity_24h ?? 0));
  const avgVolatility = velocities.length > 0 ? velocities.reduce((a: number, b: number) => a + b, 0) / velocities.length : 0;

  // Adjust weights based on observations
  if (errorRate > 0.2) {
    const delta = Math.min(0.05, errorRate * 0.1);
    currentWeights.disputeWeight += delta;
    adjustments.disputeWeight = delta;
  } else if (errorRate < 0.05 && preds.length > 50) {
    const delta = -0.02;
    currentWeights.disputeWeight += delta;
    adjustments.disputeWeight = delta;
  }

  if (avgVolatility > 3) {
    const delta = Math.min(0.03, avgVolatility * 0.005);
    currentWeights.volatilityPenalty += delta;
    adjustments.volatilityPenalty = delta;
  } else if (avgVolatility < 1) {
    currentWeights.volatilityPenalty -= 0.01;
    adjustments.volatilityPenalty = -0.01;
  }

  // Apply bounds
  currentWeights.disputeWeight = clamp(currentWeights.disputeWeight, BOUNDS.disputeWeight.min, BOUNDS.disputeWeight.max);
  currentWeights.completionWeight = clamp(currentWeights.completionWeight, BOUNDS.completionWeight.min, BOUNDS.completionWeight.max);
  currentWeights.volatilityPenalty = clamp(currentWeights.volatilityPenalty, BOUNDS.volatilityPenalty.min, BOUNDS.volatilityPenalty.max);
  currentWeights.responseWeight = clamp(currentWeights.responseWeight, BOUNDS.responseWeight.min, BOUNDS.responseWeight.max);
  currentWeights.endorsementWeight = clamp(currentWeights.endorsementWeight, BOUNDS.endorsementWeight.min, BOUNDS.endorsementWeight.max);

  currentWeights = normalizeWeights(currentWeights);
  currentWeights.updatedAt = new Date().toISOString();
  currentWeights.adjustmentReason = `error_rate=${Math.round(errorRate * 100)}%, avg_volatility=${Math.round(avgVolatility * 10) / 10}`;

  // Audit log
  await supabase.from("admin_audit_logs").insert({
    admin_id: "system",
    action: "trust_weight_recalibration",
    entity_type: "system",
    entity_id: "trust_weights",
    details: { previous, updated: currentWeights, adjustments } as any,
  });

  return { previous, updated: currentWeights, adjustments };
}
