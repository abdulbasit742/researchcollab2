/**
 * Innovation Output Maximizer — sector analysis and optimization recommendations.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("innovationMaximizer");

export interface InnovationOptimization {
  action: string;
  sector: string;
  projectedImpact: number;
  capitalRequired: number;
  priority: "critical" | "high" | "medium" | "low";
}

export interface InnovationMaximizerResult {
  sectorProductivity: Record<string, number>;
  capitalToOutputRatio: number;
  completionEfficiency: number;
  crossBorderImpact: number;
  recommendations: InnovationOptimization[];
  timestamp: string;
}

export async function analyzeInnovationOutput(): Promise<InnovationMaximizerResult> {
  const { data: deals } = await supabase.from("deal_rooms").select("status, category") as { data: any[] | null };
  const total = (deals ?? []).length;
  const completed = (deals ?? []).filter((d) => d.status === "completed").length;
  const completionEff = total > 0 ? Math.round((completed / total) * 100) : 0;

  const capitalToOutput = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Sector productivity
  const sectors: Record<string, { total: number; completed: number }> = {};
  for (const d of deals ?? []) {
    const cat = d.category ?? "general";
    if (!sectors[cat]) sectors[cat] = { total: 0, completed: 0 };
    sectors[cat].total++;
    if (d.status === "completed") sectors[cat].completed++;
  }
  const sectorProductivity: Record<string, number> = {};
  for (const [k, v] of Object.entries(sectors)) {
    sectorProductivity[k] = v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0;
  }

  // Cross-border impact
  const { data: routes } = await (supabase as any).from("network_capital_routes").select("amount, cross_border_agreement_id").eq("status", "completed");
  const crossBorder = (routes ?? []).filter((r: any) => r.cross_border_agreement_id).length;
  const crossBorderImpact = (routes ?? []).length > 0 ? Math.round((crossBorder / routes.length) * 100) : 0;

  const recommendations: InnovationOptimization[] = [];

  // Low-performing sectors
  for (const [sector, prod] of Object.entries(sectorProductivity)) {
    if (prod < 30 && (sectors[sector]?.total ?? 0) > 2) {
      recommendations.push({ action: `Increase mentorship and milestone support for ${sector}`, sector, projectedImpact: 15, capitalRequired: 0, priority: "high" });
    }
  }

  if (crossBorderImpact < 20) {
    recommendations.push({ action: "Incentivize cross-border collaboration via reduced fees", sector: "global", projectedImpact: 10, capitalRequired: 0, priority: "medium" });
  }
  if (capitalToOutput < 40) {
    recommendations.push({ action: "Improve milestone-based release cadence to reduce capital stagnation", sector: "global", projectedImpact: 20, capitalRequired: 0, priority: "high" });
  }

  log.info("Innovation analysis complete", { completionEff, recommendations: recommendations.length });

  return { sectorProductivity, capitalToOutputRatio: capitalToOutput, completionEfficiency: completionEff, crossBorderImpact, recommendations, timestamp: new Date().toISOString() };
}
