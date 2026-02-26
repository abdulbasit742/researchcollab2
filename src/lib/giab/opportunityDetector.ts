/**
 * Innovation Opportunity Detection Engine — explainable innovation signals.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("opportunityDetector");

export interface InnovationSignal {
  entityType: "sector" | "region" | "institution";
  entityId: string;
  signalScore: number;
  drivers: string[];
}

export async function detectInnovationOpportunities(): Promise<InnovationSignal[]> {
  const signals: InnovationSignal[] = [];

  const { data: deals } = await supabase.from("deal_rooms").select("status, tenant_id, escrow_amount") as { data: any[] | null };
  const allDeals = deals ?? [];

  // Group by tenant
  const tenantMap: Record<string, { total: number; completed: number; escrow: number }> = {};
  for (const d of allDeals) {
    const tid = d.tenant_id ?? "unknown";
    const entry = tenantMap[tid] ?? { total: 0, completed: 0, escrow: 0 };
    entry.total++;
    if (d.status === "completed") entry.completed++;
    entry.escrow += d.escrow_amount ?? 0;
    tenantMap[tid] = entry;
  }

  for (const [tid, stats] of Object.entries(tenantMap)) {
    const drivers: string[] = [];
    let score = 0;

    const completionRate = stats.total > 0 ? stats.completed / stats.total : 0;
    if (completionRate > 0.7) { score += 30; drivers.push(`High completion rate: ${Math.round(completionRate * 100)}%`); }

    const avgEscrow = stats.total > 0 ? stats.escrow / stats.total : 0;
    if (avgEscrow > 0 && stats.completed > 2) { score += 20; drivers.push("Consistent capital deployment"); }

    if (stats.total > 5) { score += 15; drivers.push(`High activity volume: ${stats.total} projects`); }
    if (stats.completed > 3 && completionRate > 0.6) { score += 15; drivers.push("Strong execution momentum"); }

    if (score > 20) {
      signals.push({ entityType: "institution", entityId: tid, signalScore: Math.min(100, score), drivers });
    }
  }

  // Cross-border signals
  const { data: routes } = await (supabase as any).from("network_capital_routes").select("amount, status, cross_border_agreement_id").eq("status", "completed");
  const crossBorderCount = (routes ?? []).filter((r: any) => r.cross_border_agreement_id).length;
  if (crossBorderCount > 3) {
    signals.push({
      entityType: "region", entityId: "cross_border",
      signalScore: Math.min(100, crossBorderCount * 10),
      drivers: [`${crossBorderCount} completed cross-border capital routes`],
    });
  }

  log.info("Innovation opportunities detected", { signalCount: signals.length });
  return signals;
}
