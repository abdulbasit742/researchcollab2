/**
 * Capital Scarcity Detector — CAPITAL_SCARCITY_INDEX.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("scarcityDetector");

export interface ScarcitySignal {
  entityType: "region" | "institution" | "sector";
  entityId: string;
  scarcityLevel: "none" | "mild" | "moderate" | "severe" | "critical";
  utilizationRate: number;
  availableCapital: number;
}

export interface CapitalScarcityResult {
  signals: ScarcitySignal[];
  capitalScarcityIndex: number;
}

export async function detectCapitalScarcity(): Promise<CapitalScarcityResult> {
  const { data: pools } = await (supabase as any).from("capital_pools").select("tenant_id, total_committed, total_allocated");
  const signals: ScarcitySignal[] = [];

  const tenantAgg: Record<string, { committed: number; allocated: number }> = {};
  for (const p of pools ?? []) {
    const tid = p.tenant_id ?? "unknown";
    const entry = tenantAgg[tid] ?? { committed: 0, allocated: 0 };
    entry.committed += p.total_committed ?? 0;
    entry.allocated += p.total_allocated ?? 0;
    tenantAgg[tid] = entry;
  }

  let severeCount = 0;
  for (const [tid, agg] of Object.entries(tenantAgg)) {
    const util = agg.committed > 0 ? agg.allocated / agg.committed : 0;
    const available = Math.max(0, agg.committed - agg.allocated);

    let level: ScarcitySignal["scarcityLevel"] = "none";
    if (util > 0.95) { level = "critical"; severeCount++; }
    else if (util > 0.85) { level = "severe"; severeCount++; }
    else if (util > 0.7) level = "moderate";
    else if (util > 0.5) level = "mild";

    if (level !== "none") {
      signals.push({ entityType: "institution", entityId: tid, scarcityLevel: level, utilizationRate: Math.round(util * 100), availableCapital: available });
    }
  }

  const totalInstitutions = Object.keys(tenantAgg).length;
  const scarcityIndex = totalInstitutions > 0 ? Math.min(100, Math.round((severeCount / totalInstitutions) * 100 + signals.length * 3)) : 0;

  log.info("Capital scarcity detected", { signalCount: signals.length, index: scarcityIndex });
  return { signals, capitalScarcityIndex: scarcityIndex };
}
