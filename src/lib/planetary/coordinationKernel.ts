/**
 * Planetary Coordination Kernel — global invariant enforcement, boundary validation.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("coordinationKernel");

export interface PlanetaryInvariant {
  id: string;
  invariantName: string;
  invariantDefinition: string;
  enforcementLevel: "hard" | "soft";
  category: string;
  version: number;
  active: boolean;
}

const CORE_PLANETARY_INVARIANTS: { name: string; definition: string; enforcement: "hard" | "soft"; category: string }[] = [
  { name: "escrow_absolute_integrity", definition: "No capital movement may bypass escrow under any scenario including crisis, failover, or governance override.", enforcement: "hard", category: "escrow" },
  { name: "capital_conservation_law", definition: "Total system capital is conserved across all operations. No creation or destruction of value outside defined mint/burn.", enforcement: "hard", category: "capital" },
  { name: "sovereign_boundary_inviolability", definition: "Region boundaries cannot be breached without bilateral intergovernmental agreement.", enforcement: "hard", category: "sovereignty" },
  { name: "tenant_hermetic_isolation", definition: "Tenant data, capital, and governance are hermetically isolated. No cross-tenant leakage permitted.", enforcement: "hard", category: "isolation" },
  { name: "compliance_gate_mandatory", definition: "All financial operations must pass compliance validation. No exemptions during crisis.", enforcement: "hard", category: "compliance" },
  { name: "trust_outcome_derivation", definition: "Trust scores derive exclusively from verified outcomes. No external injection or manual override.", enforcement: "hard", category: "trust" },
  { name: "governance_constitutional_supremacy", definition: "Constitutional principles supersede all governance decisions. No vote may violate invariants.", enforcement: "hard", category: "governance" },
  { name: "audit_trail_immutability", definition: "All audit logs are append-only and immutable. No deletion or modification permitted.", enforcement: "hard", category: "audit" },
  { name: "crisis_read_only_simulation", definition: "All crisis and stress simulations must be read-only. No production state mutation.", enforcement: "hard", category: "simulation" },
  { name: "concentration_limit_enforcement", definition: "No single entity may control >25% of governance weight or >30% of capital concentration.", enforcement: "soft", category: "governance" },
  { name: "liquidity_minimum_reserve", definition: "System must maintain minimum 5% liquid reserves across all capital pools.", enforcement: "soft", category: "capital" },
  { name: "cross_border_agreement_required", definition: "Cross-border capital routing requires active bilateral agreement with compliance alignment.", enforcement: "hard", category: "sovereignty" },
];

export async function seedPlanetaryInvariants(): Promise<void> {
  for (const inv of CORE_PLANETARY_INVARIANTS) {
    await (supabase as any).from("planetary_invariants").upsert({
      invariant_name: inv.name, invariant_definition: inv.definition,
      enforcement_level: inv.enforcement, category: inv.category, version: 1, active: true,
    }, { onConflict: "invariant_name" });
  }
  log.info("Planetary invariants seeded", { count: CORE_PLANETARY_INVARIANTS.length });
}

export async function getPlanetaryInvariants(): Promise<PlanetaryInvariant[]> {
  const { data } = await (supabase as any).from("planetary_invariants").select("*").eq("active", true).order("category");
  return (data ?? []).map((p: any) => ({
    id: p.id, invariantName: p.invariant_name, invariantDefinition: p.invariant_definition,
    enforcementLevel: p.enforcement_level, category: p.category, version: p.version, active: p.active,
  }));
}

export async function validatePlanetaryInvariants(context: Record<string, unknown>): Promise<{ valid: boolean; hardViolations: string[]; softViolations: string[] }> {
  const hardViolations: string[] = [];
  const softViolations: string[] = [];

  if (context.bypassEscrow) hardViolations.push("escrow_absolute_integrity");
  if (typeof context.resultingBalance === "number" && context.resultingBalance < 0) hardViolations.push("capital_conservation_law");
  if (context.crossRegion && !context.intergovAgreement) hardViolations.push("sovereign_boundary_inviolability");
  if (context.crossTenant && !context.sovereignAgreement) hardViolations.push("tenant_hermetic_isolation");
  if (context.skipCompliance) hardViolations.push("compliance_gate_mandatory");
  if (context.manualTrustOverride) hardViolations.push("trust_outcome_derivation");
  if (context.mutateProduction && context.isSimulation) hardViolations.push("crisis_read_only_simulation");
  if (typeof context.concentrationPercent === "number" && context.concentrationPercent > 25) softViolations.push("concentration_limit_enforcement");
  if (typeof context.reservePercent === "number" && context.reservePercent < 5) softViolations.push("liquidity_minimum_reserve");

  if (hardViolations.length > 0) log.error("Hard planetary violations", { hardViolations });
  if (softViolations.length > 0) log.warn("Soft planetary violations", { softViolations });

  return { valid: hardViolations.length === 0, hardViolations, softViolations };
}
