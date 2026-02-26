/**
 * Architecture Drift Detection — monitors for unauthorized coupling, bypass attempts, and invariant drift.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("architectureDrift");

export interface DriftIndicator {
  category: string;
  description: string;
  severity: "info" | "warning" | "critical";
  detectedAt: string;
}

export interface ArchitectureDriftReport {
  score: number;
  indicators: DriftIndicator[];
  healthy: boolean;
  evaluatedAt: string;
}

export interface ModuleDependency {
  source: string;
  target: string;
  allowed: boolean;
}

// Forbidden dependency paths — lower layers must not depend on higher layers
const FORBIDDEN_COUPLINGS: Array<{ from: string; to: string }> = [
  { from: "escrow", to: "reserve" },
  { from: "escrow", to: "bond" },
  { from: "ledger", to: "reserve" },
  { from: "ledger", to: "bond" },
  { from: "ledger", to: "liquidity" },
  { from: "trust", to: "reserve" },
  { from: "wallet", to: "governance" },
];

/**
 * Evaluate architecture drift based on detected module dependencies.
 */
export function evaluateArchitectureDrift(dependencies: ModuleDependency[]): ArchitectureDriftReport {
  const indicators: DriftIndicator[] = [];
  let score = 0;

  // Check for forbidden couplings
  for (const dep of dependencies) {
    const forbidden = FORBIDDEN_COUPLINGS.find(
      f => dep.source.includes(f.from) && dep.target.includes(f.to)
    );
    if (forbidden) {
      indicators.push({
        category: "forbidden_coupling",
        description: `${dep.source} → ${dep.target} violates layer boundary (${forbidden.from} cannot depend on ${forbidden.to})`,
        severity: "critical",
        detectedAt: new Date().toISOString(),
      });
      score += 25;
    }

    if (!dep.allowed) {
      indicators.push({
        category: "unauthorized_dependency",
        description: `Unauthorized dependency: ${dep.source} → ${dep.target}`,
        severity: "warning",
        detectedAt: new Date().toISOString(),
      });
      score += 10;
    }
  }

  score = Math.min(score, 100);
  const healthy = score < 30;

  const report: ArchitectureDriftReport = {
    score,
    indicators,
    healthy,
    evaluatedAt: new Date().toISOString(),
  };

  if (!healthy) {
    log.warn("Architecture drift detected", { score, indicators: indicators.length });
  } else {
    log.info("Architecture drift check passed", { score });
  }

  return report;
}

/**
 * Check for escrow bypass — any financial path that skips escrow validation.
 */
export function detectEscrowBypass(callPaths: string[]): DriftIndicator[] {
  const indicators: DriftIndicator[] = [];
  const escrowKeywords = ["escrow", "milestone", "fund", "release"];
  const guardKeywords = ["validateEscrowInvariants", "guardFinancialMutation", "assertSufficientBalance"];

  for (const path of callPaths) {
    const touchesEscrow = escrowKeywords.some(k => path.toLowerCase().includes(k));
    const hasGuard = guardKeywords.some(k => path.includes(k));

    if (touchesEscrow && !hasGuard) {
      indicators.push({
        category: "escrow_bypass",
        description: `Potential escrow bypass in: ${path}`,
        severity: "critical",
        detectedAt: new Date().toISOString(),
      });
    }
  }

  return indicators;
}
