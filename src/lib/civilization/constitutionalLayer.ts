/**
 * Constitutional Infrastructure Layer — immutable invariants that constrain all system operations.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("constitutionalLayer");

export interface ConstitutionalPrinciple {
  id: string;
  principleName: string;
  invariantDefinition: string;
  category: string;
  version: number;
  immutable: boolean;
}

export type InvariantCategory =
  | "escrow"
  | "capital_integrity"
  | "trust"
  | "compliance"
  | "tenant_isolation"
  | "region_sovereignty"
  | "governance";

const CORE_INVARIANTS: { name: string; definition: string; category: InvariantCategory }[] = [
  { name: "escrow_no_bypass", definition: "All capital movements must route through escrow. Direct wallet-to-wallet transfers bypassing escrow are forbidden.", category: "escrow" },
  { name: "escrow_atomic_settlement", definition: "Escrow lock/release/refund operations must be atomic with double-entry ledger recording.", category: "escrow" },
  { name: "capital_non_negative", definition: "No wallet or pool balance may become negative under any operation.", category: "capital_integrity" },
  { name: "capital_conservation", definition: "Total system capital must remain constant across all internal transfers. Capital is neither created nor destroyed.", category: "capital_integrity" },
  { name: "trust_non_gameable", definition: "Trust scores must be derived from verified outcomes only. Velocity caps prevent manipulation.", category: "trust" },
  { name: "trust_decay_bound", definition: "Trust decay rate must be bounded to prevent catastrophic trust collapse.", category: "trust" },
  { name: "compliance_gate", definition: "All financial operations must pass compliance checks before execution. No bypass allowed.", category: "compliance" },
  { name: "kyc_aml_required", definition: "KYC/AML verification required before capital pool participation or large transactions.", category: "compliance" },
  { name: "tenant_data_isolation", definition: "No tenant may access, modify, or observe another tenant's data. Cross-tenant queries are forbidden.", category: "tenant_isolation" },
  { name: "tenant_financial_isolation", definition: "Tenant capital pools are isolated. Cross-tenant capital flow requires explicit sovereign agreement.", category: "tenant_isolation" },
  { name: "region_data_sovereignty", definition: "Data must reside within its designated region. Cross-region data transfer requires intergovernmental agreement.", category: "region_sovereignty" },
  { name: "region_compliance_autonomy", definition: "Each region maintains independent compliance rules. No region may override another's regulatory profile.", category: "region_sovereignty" },
  { name: "governance_constitutional_supremacy", definition: "The Platform Constitution is supreme. No governance action may violate constitutional invariants.", category: "governance" },
  { name: "governance_no_single_control", definition: "No single entity may hold >25% governance voting weight.", category: "governance" },
];

export async function seedConstitutionalPrinciples(): Promise<void> {
  for (const inv of CORE_INVARIANTS) {
    await (supabase as any).from("constitutional_principles").upsert({
      principle_name: inv.name,
      invariant_definition: inv.definition,
      category: inv.category,
      version: 1,
      immutable: true,
    }, { onConflict: "principle_name" });
  }
  log.info("Constitutional principles seeded", { count: CORE_INVARIANTS.length });
}

export async function getConstitutionalPrinciples(): Promise<ConstitutionalPrinciple[]> {
  const { data } = await (supabase as any).from("constitutional_principles").select("*").order("category");
  return (data ?? []).map((p: any) => ({
    id: p.id, principleName: p.principle_name, invariantDefinition: p.invariant_definition,
    category: p.category, version: p.version, immutable: p.immutable,
  }));
}

export async function validateAgainstConstitution(action: string, context: Record<string, unknown>): Promise<{ valid: boolean; violations: string[] }> {
  const principles = await getConstitutionalPrinciples();
  const violations: string[] = [];

  // Escrow bypass check
  if (context.bypassEscrow) violations.push("escrow_no_bypass");
  // Negative balance check
  if (typeof context.resultingBalance === "number" && context.resultingBalance < 0) violations.push("capital_non_negative");
  // Cross-tenant check
  if (context.crossTenant && !context.sovereignAgreement) violations.push("tenant_financial_isolation");
  // Cross-region without agreement
  if (context.crossRegion && !context.intergovAgreement) violations.push("region_data_sovereignty");
  // Compliance bypass
  if (context.skipCompliance) violations.push("compliance_gate");

  if (violations.length > 0) {
    log.warn("Constitutional violations detected", { action, violations });
  }

  return { valid: violations.length === 0, violations };
}
