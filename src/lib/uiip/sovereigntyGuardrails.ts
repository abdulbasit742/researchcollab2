/**
 * Interoperability Sovereignty Guardrails — enforce constitutional boundaries on all integrations.
 */

import { getExternalInterface, logIntegrationAccess, type AccessScope } from "./sovereignInterface";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("sovereigntyGuardrails");

export interface SovereigntyValidation {
  passed: boolean;
  violations: string[];
  interfaceId: string;
}

const FORBIDDEN_ACTIONS: Record<string, string> = {
  external_voting: "No external system may hold voting rights",
  constitutional_override: "Constitutional invariants cannot be overridden externally",
  escrow_bypass: "Escrow cannot be bypassed by any external integration",
  compliance_bypass: "Compliance gates cannot be bypassed externally",
  tenant_cross_leak: "Cross-tenant data access is prohibited",
  region_override: "Region isolation cannot be overridden externally",
  wallet_mutation: "External systems cannot directly mutate wallets",
};

const SCOPE_PERMISSIONS: Record<AccessScope, string[]> = {
  read_only: ["read_metrics", "read_reports"],
  aggregate_only: ["read_metrics", "read_reports", "read_aggregates"],
  compliance_reporting: ["read_metrics", "read_reports", "read_aggregates", "compliance_export"],
  co_investment: ["read_metrics", "read_reports", "read_aggregates", "pool_visibility"],
  coordination: ["read_metrics", "read_reports", "read_aggregates", "compliance_export", "coordination_data"],
  full_authorized: ["read_metrics", "read_reports", "read_aggregates", "compliance_export", "coordination_data", "pool_visibility"],
};

export async function sovereigntyValidationCheck(interfaceId: string, requestedAction: string): Promise<SovereigntyValidation> {
  const violations: string[] = [];

  // Check forbidden actions
  if (FORBIDDEN_ACTIONS[requestedAction]) {
    violations.push(FORBIDDEN_ACTIONS[requestedAction]);
  }

  const iface = await getExternalInterface(interfaceId);
  if (!iface) {
    violations.push("Interface not registered");
    return { passed: false, violations, interfaceId };
  }

  if (!iface.isActive) {
    violations.push("Interface is deactivated");
  }

  // Check scope permissions
  const allowed = SCOPE_PERMISSIONS[iface.accessScope] ?? [];
  if (!allowed.includes(requestedAction) && !FORBIDDEN_ACTIONS[requestedAction]) {
    // Custom action — verify it's not forbidden
    const isForbidden = Object.keys(FORBIDDEN_ACTIONS).some((f) => requestedAction.includes(f));
    if (isForbidden) violations.push("Requested action violates sovereignty guardrails");
  }

  if (violations.length > 0) {
    await logIntegrationAccess(interfaceId, requestedAction, "sovereignty_check", undefined, true, violations.join("; "));
    log.error("Sovereignty violation detected", { interfaceId, violations });
  }

  return { passed: violations.length === 0, violations, interfaceId };
}
