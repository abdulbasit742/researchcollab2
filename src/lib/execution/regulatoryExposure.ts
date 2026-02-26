/**
 * Regulatory Exposure Control Layer — monitors and throttles regulatory risk.
 */

import { supabase } from "@/integrations/supabase/client";
import { deactivatePhase } from "./phaseManager";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("regulatoryExposure");

const RISK_THRESHOLD = 75;

export interface RegulatoryExposure {
  capitalInstrumentsActive: number;
  reserveUnitsIssued: number;
  crossBorderSettlements: number;
  creditIssuanceGrowth: number;
  liquidityGrowth: number;
  regulatoryRiskScore: number;
  thresholdExceeded: boolean;
  recommendedAction: string | null;
}

export async function assessRegulatoryExposure(): Promise<RegulatoryExposure> {
  // Capital instruments
  const { data: bonds } = await (supabase as any).from("research_bonds").select("id").eq("status", "active");
  const capitalActive = (bonds ?? []).length;

  // Reserve units
  const { data: reserves } = await (supabase as any).from("reserve_units").select("id").eq("is_redeemed", false);
  const reserveCount = (reserves ?? []).length;

  // Settlements
  const { data: settlements } = await (supabase as any).from("reserve_settlement_log").select("id").eq("status", "completed");
  const settlementCount = (settlements ?? []).length;

  // Scoring
  const instrumentScore = Math.min(30, capitalActive * 3);
  const reserveScore = Math.min(25, reserveCount * 2.5);
  const settlementScore = Math.min(20, settlementCount * 2);
  const growthScore = Math.min(25, (capitalActive + reserveCount) * 1.5);
  const total = Math.round(instrumentScore + reserveScore + settlementScore + growthScore);

  const exceeded = total > RISK_THRESHOLD;
  let action: string | null = null;
  if (exceeded) {
    action = "Freeze expansion, downgrade phase, alert governance, trigger simulation";
    log.warn("Regulatory risk threshold exceeded", { score: total });
  }

  return {
    capitalInstrumentsActive: capitalActive, reserveUnitsIssued: reserveCount,
    crossBorderSettlements: settlementCount, creditIssuanceGrowth: capitalActive,
    liquidityGrowth: reserveCount, regulatoryRiskScore: total,
    thresholdExceeded: exceeded, recommendedAction: action,
  };
}

export async function enforceRegulatoryLimits(): Promise<void> {
  const exposure = await assessRegulatoryExposure();
  if (exposure.thresholdExceeded) {
    log.warn("Enforcing regulatory limits — deactivating advanced phases");
    await deactivatePhase(7); // Deactivate reserve and above
  }
}
