/**
 * Economic Impact Model — estimates real-world outcomes from platform activity.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("economicImpactModel");

export interface EconomicImpact {
  estimatedJobsCreated: number;
  researchOutputGrowth: number;
  crossBorderCollaborationGrowth: number;
  institutionalCapitalEfficiency: number;
  innovationIndex: number;
  timestamp: string;
}

export async function calculateEconomicImpact(): Promise<EconomicImpact> {
  const { data: deals } = await supabase.from("deal_rooms").select("status, escrow_amount");
  const allDeals = deals ?? [];
  const completed = allDeals.filter((d) => d.status === "completed");
  const totalGMV = allDeals.reduce((s, d) => s + (d.escrow_amount ?? 0), 0);

  // Jobs estimate: 1 job per $10k GMV in completed deals
  const completedGMV = completed.reduce((s, d) => s + (d.escrow_amount ?? 0), 0);
  const estimatedJobs = Math.round(completedGMV / 10000);

  // Research output: completed deals as proxy
  const researchOutputGrowth = completed.length;

  // Cross-border collaboration
  const { data: agreements } = await (supabase as any).from("cross_border_agreements").select("id").eq("active", true);
  const crossBorderGrowth = agreements?.length ?? 0;

  // Capital efficiency
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const totalCommitted = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const totalAllocated = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);
  const efficiency = totalCommitted > 0 ? Math.round((totalAllocated / totalCommitted) * 100) : 0;

  // Innovation index composite
  const completionRate = allDeals.length > 0 ? (completed.length / allDeals.length) * 100 : 0;
  const innovationIndex = Math.min(100, Math.round(
    completionRate * 0.3 + efficiency * 0.3 + Math.min(50, crossBorderGrowth * 5) * 0.2 + Math.min(50, estimatedJobs) * 0.2
  ));

  log.info("Economic impact calculated", { innovationIndex, estimatedJobs });

  return {
    estimatedJobsCreated: estimatedJobs,
    researchOutputGrowth: researchOutputGrowth,
    crossBorderCollaborationGrowth: crossBorderGrowth,
    institutionalCapitalEfficiency: efficiency,
    innovationIndex,
    timestamp: new Date().toISOString(),
  };
}
