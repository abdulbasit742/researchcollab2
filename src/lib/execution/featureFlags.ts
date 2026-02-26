/**
 * Feature Flag Governance Engine — region, institution-tier, governance, risk-based control.
 */

import { supabase } from "@/integrations/supabase/client";
import { isPhaseActive } from "./phaseManager";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("executionFeatureFlags");

export interface FeatureGate {
  featureKey: string;
  requiredPhase: number;
  requiredTier: number;
  regionRestrictions: string[];
  riskAutoDisable: boolean;
  emergencyShutdown: boolean;
}

// Registry of gated features
const FEATURE_REGISTRY: Record<string, FeatureGate> = {
  "credit_scoring": { featureKey: "credit_scoring", requiredPhase: 2, requiredTier: 2, regionRestrictions: [], riskAutoDisable: false, emergencyShutdown: false },
  "capital_pools": { featureKey: "capital_pools", requiredPhase: 2, requiredTier: 3, regionRestrictions: [], riskAutoDisable: false, emergencyShutdown: false },
  "research_bonds": { featureKey: "research_bonds", requiredPhase: 3, requiredTier: 4, regionRestrictions: [], riskAutoDisable: true, emergencyShutdown: false },
  "giab_advisory": { featureKey: "giab_advisory", requiredPhase: 4, requiredTier: 3, regionRestrictions: [], riskAutoDisable: false, emergencyShutdown: false },
  "liquidity_pools": { featureKey: "liquidity_pools", requiredPhase: 5, requiredTier: 5, regionRestrictions: [], riskAutoDisable: true, emergencyShutdown: false },
  "market_index": { featureKey: "market_index", requiredPhase: 5, requiredTier: 1, regionRestrictions: [], riskAutoDisable: false, emergencyShutdown: false },
  "interoperability": { featureKey: "interoperability", requiredPhase: 6, requiredTier: 3, regionRestrictions: [], riskAutoDisable: false, emergencyShutdown: false },
  "reserve_units": { featureKey: "reserve_units", requiredPhase: 7, requiredTier: 6, regionRestrictions: [], riskAutoDisable: true, emergencyShutdown: false },
  "cross_border_settlement": { featureKey: "cross_border_settlement", requiredPhase: 8, requiredTier: 5, regionRestrictions: [], riskAutoDisable: true, emergencyShutdown: false },
  "global_capital_index": { featureKey: "global_capital_index", requiredPhase: 9, requiredTier: 1, regionRestrictions: [], riskAutoDisable: false, emergencyShutdown: false },
};

export async function isFeatureEnabled(featureKey: string, context?: {
  institutionTier?: number; region?: string;
}): Promise<boolean> {
  const gate = FEATURE_REGISTRY[featureKey];
  if (!gate) return true; // Ungated features are allowed

  // Emergency shutdown
  if (gate.emergencyShutdown) {
    log.warn("Feature emergency shutdown active", { featureKey });
    return false;
  }

  // Phase check
  const phaseActive = await isPhaseActive(gate.requiredPhase);
  if (!phaseActive) return false;

  // Institution tier check
  if (context?.institutionTier != null && context.institutionTier < gate.requiredTier) return false;

  // Region check
  if (gate.regionRestrictions.length > 0 && context?.region) {
    if (!gate.regionRestrictions.includes(context.region)) return false;
  }

  return true;
}

export function setEmergencyShutdown(featureKey: string, shutdown: boolean): void {
  const gate = FEATURE_REGISTRY[featureKey];
  if (gate) {
    gate.emergencyShutdown = shutdown;
    log.warn("Emergency shutdown toggled", { featureKey, shutdown });
  }
}

export function getFeatureRegistry(): Record<string, FeatureGate> {
  return { ...FEATURE_REGISTRY };
}
