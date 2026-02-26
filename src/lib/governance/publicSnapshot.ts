/**
 * Public Transparency Snapshot — anonymized public metrics, no PII.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("publicSnapshot");

export interface PublicTransparencySnapshot {
  totalFundedProjects: number;
  totalUniversitiesOnboarded: number;
  totalCapitalDeployed: number;
  nationalCompletionRate: number;
  innovationGrowthRate: number;
  activeRegions: number;
  timestamp: string;
}

export async function generatePublicSnapshot(): Promise<PublicTransparencySnapshot> {
  // Total funded projects
  const { data: deals } = await supabase.from("deal_rooms").select("status, escrow_amount");
  const allDeals = deals ?? [];
  const funded = allDeals.filter((d) => ["funded", "active", "completed"].includes(d.status ?? ""));
  const completed = allDeals.filter((d) => d.status === "completed");

  // Universities onboarded
  const { data: tenants } = await (supabase as any).from("tenants").select("id");
  const totalUniversities = tenants?.length ?? 0;

  // Capital deployed
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_allocated");
  const totalCapital = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);

  // Grant capital
  const { data: grants } = await (supabase as any).from("public_grant_pools").select("total_allocated");
  const grantCapital = (grants ?? []).reduce((s: number, g: any) => s + (g.total_allocated ?? 0), 0);

  const totalCapitalDeployed = totalCapital + grantCapital;

  // Completion rate
  const completionRate = allDeals.length > 0 ? Math.round((completed.length / allDeals.length) * 100) : 0;

  // Active regions
  const { data: regions } = await (supabase as any).from("regions").select("id").eq("status", "active");

  log.info("Public transparency snapshot generated");

  return {
    totalFundedProjects: funded.length,
    totalUniversitiesOnboarded: totalUniversities,
    totalCapitalDeployed,
    nationalCompletionRate: completionRate,
    innovationGrowthRate: 0,
    activeRegions: regions?.length ?? 0,
    timestamp: new Date().toISOString(),
  };
}
