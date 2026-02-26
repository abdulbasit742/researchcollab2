/**
 * Founder Decision Logging System — tracks all major founder-level decisions for accountability.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("founderDecisionLog");

export type DecisionType =
  | "strategic_direction"
  | "risk_override"
  | "governance_veto"
  | "emergency_override"
  | "policy_escalation"
  | "capital_activation"
  | "release_gate_bypass"
  | "escrow_override"
  | "reserve_issuance";

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ImpactScope = "escrow" | "ledger" | "governance" | "reserve" | "credit" | "liquidity" | "bond" | "platform_wide";

export interface FounderDecision {
  id: string;
  decisionType: DecisionType;
  riskLevel: RiskLevel;
  impactScope: ImpactScope[];
  overrideFlag: boolean;
  description: string;
  justification: string;
  reviewedByOthers: boolean;
  timestamp: string;
}

/**
 * Log a founder decision to the audit trail.
 */
export async function logFounderDecision(decision: FounderDecision): Promise<void> {
  await (supabase as any).from("founder_decisions").insert({
    id: decision.id,
    decision_type: decision.decisionType,
    risk_level: decision.riskLevel,
    impact_scope: decision.impactScope,
    override_flag: decision.overrideFlag,
    description: decision.description,
    justification: decision.justification,
    reviewed_by_others: decision.reviewedByOthers,
    created_at: decision.timestamp,
  });
  log.info("Founder decision logged", { id: decision.id, type: decision.decisionType, risk: decision.riskLevel });
}

/**
 * Retrieve recent founder decisions for audit review.
 */
export async function getRecentDecisions(limit = 50): Promise<FounderDecision[]> {
  const { data } = await (supabase as any).from("founder_decisions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((d: any) => ({
    id: d.id,
    decisionType: d.decision_type,
    riskLevel: d.risk_level,
    impactScope: d.impact_scope ?? [],
    overrideFlag: d.override_flag ?? false,
    description: d.description ?? "",
    justification: d.justification ?? "",
    reviewedByOthers: d.reviewed_by_others ?? false,
    timestamp: d.created_at,
  }));
}

/**
 * Count override decisions within a time window (hours).
 */
export async function countOverridesInWindow(windowHours = 168): Promise<number> {
  const since = new Date(Date.now() - windowHours * 3600000).toISOString();
  const { data } = await (supabase as any).from("founder_decisions")
    .select("id")
    .eq("override_flag", true)
    .gte("created_at", since);
  return (data ?? []).length;
}
