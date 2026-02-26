/**
 * Institutional SLA Enforcement — tracks and scores service level compliance.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("institutionalSLA");

export interface SLADefinition {
  name: string;
  targetMs: number;
  description: string;
}

export interface SLABreach {
  slaName: string;
  actualMs: number;
  targetMs: number;
  breachedAt: string;
  entityId?: string;
}

export interface SLAReport {
  definitions: SLADefinition[];
  breaches: SLABreach[];
  complianceScore: number; // 0–100
  reportedAt: string;
}

const SLA_DEFINITIONS: SLADefinition[] = [
  { name: "escrow_processing", targetMs: 5000, description: "Escrow lock/release within 5 seconds" },
  { name: "settlement_time", targetMs: 30000, description: "Settlement completion within 30 seconds" },
  { name: "bond_issuance", targetMs: 60000, description: "Bond issuance within 60 seconds" },
  { name: "credit_update", targetMs: 10000, description: "Credit score update within 10 seconds" },
  { name: "compliance_review", targetMs: 86400000, description: "Compliance review within 24 hours" },
];

// In-memory breach tracking (production would persist)
const breaches: SLABreach[] = [];

export function getSLADefinitions(): SLADefinition[] {
  return [...SLA_DEFINITIONS];
}

export function recordSLAMeasurement(slaName: string, actualMs: number, entityId?: string): void {
  const def = SLA_DEFINITIONS.find(s => s.name === slaName);
  if (!def) return;

  if (actualMs > def.targetMs) {
    const breach: SLABreach = { slaName, actualMs, targetMs: def.targetMs, breachedAt: new Date().toISOString(), entityId };
    breaches.push(breach);
    log.warn("SLA breach", { slaName, actual: actualMs, target: def.targetMs });
  }
}

export function generateSLAReport(): SLAReport {
  const recentBreaches = breaches.filter(b => {
    const age = Date.now() - new Date(b.breachedAt).getTime();
    return age < 7 * 86400000; // Last 7 days
  });

  // Score: 100 - (breaches per SLA * penalty)
  const penalty = Math.min(100, recentBreaches.length * 5);
  const score = Math.max(0, 100 - penalty);

  log.info("SLA report generated", { score, breaches: recentBreaches.length });

  return {
    definitions: SLA_DEFINITIONS,
    breaches: recentBreaches,
    complianceScore: score,
    reportedAt: new Date().toISOString(),
  };
}
