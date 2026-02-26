/**
 * Change Governance Protocol — every system change must be validated before deployment.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("changeGovernance");

export type ImpactScope = "escrow" | "ledger" | "credit" | "liquidity" | "governance" | "reserve" | "bond" | "trust" | "compliance" | "ui";

export interface ChangeRequest {
  id: string;
  moduleAffected: ImpactScope[];
  description: string;
  riskScore: number;
  financialImpact: boolean;
  complianceFlag: boolean;
  simulationPassed: boolean;
  rollbackPath: string;
  approved: boolean;
  governanceReviewRequired: boolean;
  createdAt: string;
}

export interface ChangeValidation {
  valid: boolean;
  blockers: string[];
  warnings: string[];
  riskTier: "low" | "medium" | "high" | "critical";
}

const FINANCIAL_MODULES: ImpactScope[] = ["escrow", "ledger", "credit", "liquidity", "reserve", "bond"];
const GOVERNANCE_MODULES: ImpactScope[] = ["governance", "trust", "compliance"];

function classifyRiskTier(score: number): "low" | "medium" | "high" | "critical" {
  if (score <= 20) return "low";
  if (score <= 50) return "medium";
  if (score <= 80) return "high";
  return "critical";
}

/**
 * Validate a change request — blocks deployment if critical checks fail.
 */
export function validateChangeRequest(request: ChangeRequest): ChangeValidation {
  const blockers: string[] = [];
  const warnings: string[] = [];

  // Financial impact requires simulation
  const touchesFinancial = request.moduleAffected.some(m => FINANCIAL_MODULES.includes(m));
  if (touchesFinancial && !request.simulationPassed) {
    blockers.push("Financial module change requires passing simulation");
  }
  if (touchesFinancial && !request.financialImpact) {
    warnings.push("Module is financial but financialImpact not flagged — verify");
  }

  // Governance modules require governance review
  const touchesGovernance = request.moduleAffected.some(m => GOVERNANCE_MODULES.includes(m));
  if (touchesGovernance && !request.governanceReviewRequired) {
    blockers.push("Governance module change requires governance review flag");
  }

  // Compliance flag must be addressed
  if (request.complianceFlag && !request.simulationPassed) {
    blockers.push("Compliance-flagged change requires simulation pass");
  }

  // Rollback path mandatory
  if (!request.rollbackPath || request.rollbackPath.trim().length === 0) {
    blockers.push("Rollback path is required for all changes");
  }

  // High/critical risk requires explicit approval
  const riskTier = classifyRiskTier(request.riskScore);
  if ((riskTier === "high" || riskTier === "critical") && !request.approved) {
    blockers.push(`Risk tier "${riskTier}" requires explicit approval`);
  }

  const valid = blockers.length === 0;

  if (!valid) {
    log.warn("Change request blocked", { id: request.id, blockers });
  } else {
    log.info("Change request validated", { id: request.id, riskTier });
  }

  return { valid, blockers, warnings, riskTier };
}

/**
 * Log a change request to the database for audit trail.
 */
export async function logChangeRequest(request: ChangeRequest): Promise<void> {
  await (supabase as any).from("change_requests").insert({
    id: request.id,
    module_affected: request.moduleAffected,
    description: request.description,
    risk_score: request.riskScore,
    financial_impact: request.financialImpact,
    compliance_flag: request.complianceFlag,
    simulation_passed: request.simulationPassed,
    rollback_path: request.rollbackPath,
    approved: request.approved,
    governance_review_required: request.governanceReviewRequired,
    created_at: request.createdAt,
  });
  log.info("Change request logged", { id: request.id });
}

/**
 * Create a new change request with auto-classification.
 */
export function createChangeRequest(
  id: string,
  modules: ImpactScope[],
  description: string,
  riskScore: number,
  opts: Partial<Pick<ChangeRequest, "financialImpact" | "complianceFlag" | "simulationPassed" | "rollbackPath" | "approved">> = {}
): ChangeRequest {
  const touchesFinancial = modules.some(m => FINANCIAL_MODULES.includes(m));
  const touchesGovernance = modules.some(m => GOVERNANCE_MODULES.includes(m));

  return {
    id,
    moduleAffected: modules,
    description,
    riskScore,
    financialImpact: opts.financialImpact ?? touchesFinancial,
    complianceFlag: opts.complianceFlag ?? false,
    simulationPassed: opts.simulationPassed ?? false,
    rollbackPath: opts.rollbackPath ?? "",
    approved: opts.approved ?? false,
    governanceReviewRequired: touchesGovernance || riskScore > 50,
    createdAt: new Date().toISOString(),
  };
}
