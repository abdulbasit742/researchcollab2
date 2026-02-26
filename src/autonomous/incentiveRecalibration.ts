/**
 * Incentive Recalibration Logic — auto-adjusts platform parameters
 * when incentive alignment or systemic stability drops.
 *
 * All changes bounded and logged to audit table.
 */

import { supabase } from "@/integrations/supabase/client";

export interface RecalibrationConfig {
  platformFeeBounds: { min: number; max: number };
  capitalExposureCap: number;
  trustFormulaCoefficients: Record<string, number>;
  riskWeightMultiplier: number;
  updatedAt: string;
}

export interface RecalibrationResult {
  triggered: boolean;
  reason: string;
  previousConfig: RecalibrationConfig;
  newConfig: RecalibrationConfig;
  adjustments: string[];
  computedAt: string;
}

let currentConfig: RecalibrationConfig = {
  platformFeeBounds: { min: 4, max: 15 },
  capitalExposureCap: 500000,
  trustFormulaCoefficients: { dispute: 0.25, completion: 0.30, volatility: 0.15, response: 0.15, endorsement: 0.15 },
  riskWeightMultiplier: 1.0,
  updatedAt: new Date().toISOString(),
};

export function getCurrentConfig(): RecalibrationConfig {
  return JSON.parse(JSON.stringify(currentConfig));
}

export async function evaluateAndRecalibrate(params: {
  incentiveAlignmentScore: number;
  stabilityIndex: number;
  capitalSustainabilityScore: number;
}): Promise<RecalibrationResult> {
  const previousConfig = getCurrentConfig();
  const adjustments: string[] = [];
  let triggered = false;
  const reasons: string[] = [];

  // Trigger conditions
  if (params.incentiveAlignmentScore < 50) {
    triggered = true;
    reasons.push(`Incentive alignment low (${params.incentiveAlignmentScore})`);

    // Widen fee bounds slightly to allow optimization
    currentConfig.platformFeeBounds.min = Math.max(3, currentConfig.platformFeeBounds.min - 0.5);
    adjustments.push("Widened fee floor by 0.5%");
  }

  if (params.stabilityIndex < 40) {
    triggered = true;
    reasons.push(`Stability index critical (${params.stabilityIndex})`);

    // Tighten capital exposure
    currentConfig.capitalExposureCap = Math.round(currentConfig.capitalExposureCap * 0.85);
    adjustments.push(`Reduced capital exposure cap to ${currentConfig.capitalExposureCap}`);

    // Increase risk weight
    currentConfig.riskWeightMultiplier = Math.min(2.0, currentConfig.riskWeightMultiplier + 0.15);
    adjustments.push(`Increased risk weight multiplier to ${currentConfig.riskWeightMultiplier}`);
  }

  if (params.capitalSustainabilityScore < 40) {
    triggered = true;
    reasons.push(`Capital sustainability weak (${params.capitalSustainabilityScore})`);

    // Increase dispute weight in trust formula
    const current = currentConfig.trustFormulaCoefficients.dispute;
    currentConfig.trustFormulaCoefficients.dispute = Math.min(0.40, current + 0.03);
    adjustments.push("Increased dispute weight in trust formula");

    // Tighten capital cap further
    currentConfig.capitalExposureCap = Math.round(currentConfig.capitalExposureCap * 0.9);
    adjustments.push(`Capital cap tightened to ${currentConfig.capitalExposureCap}`);
  }

  // Positive recalibration if all metrics healthy
  if (params.incentiveAlignmentScore > 75 && params.stabilityIndex > 75 && params.capitalSustainabilityScore > 75) {
    if (currentConfig.riskWeightMultiplier > 1.0) {
      currentConfig.riskWeightMultiplier = Math.max(1.0, currentConfig.riskWeightMultiplier - 0.05);
      adjustments.push(`Relaxed risk weight to ${currentConfig.riskWeightMultiplier}`);
      triggered = true;
      reasons.push("System healthy — relaxing constraints");
    }
    if (currentConfig.capitalExposureCap < 500000) {
      currentConfig.capitalExposureCap = Math.min(500000, Math.round(currentConfig.capitalExposureCap * 1.05));
      adjustments.push(`Increased capital cap to ${currentConfig.capitalExposureCap}`);
    }
  }

  currentConfig.updatedAt = new Date().toISOString();

  // Audit log
  if (triggered) {
    await supabase.from("admin_audit_logs").insert({
      admin_id: "system",
      action: "incentive_recalibration",
      entity_type: "system",
      entity_id: "platform_config",
      details: { previousConfig, newConfig: currentConfig, adjustments, reasons } as any,
    });
  }

  return {
    triggered,
    reason: reasons.join("; ") || "No recalibration needed",
    previousConfig,
    newConfig: getCurrentConfig(),
    adjustments,
    computedAt: new Date().toISOString(),
  };
}
