/**
 * Global Infrastructure Layer — failover orchestration, geo-aware routing, multi-cloud abstraction.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("globalInfrastructure");

export interface InfraNode {
  id: string;
  regionId: string;
  cloudProvider: string;
  failoverPriority: number;
  healthStatus: string;
  lastCheckedAt: string;
}

export interface FailoverSimulation {
  downRegionId: string;
  failoverTarget: InfraNode | null;
  affectedTenants: number;
  estimatedRecoveryMinutes: number;
  healthAfterFailover: number;
}

export async function getInfrastructureNodes(): Promise<InfraNode[]> {
  const { data } = await (supabase as any).from("infrastructure_nodes").select("*").order("failover_priority");
  return (data ?? []).map((n: any) => ({
    id: n.id, regionId: n.region_id, cloudProvider: n.cloud_provider,
    failoverPriority: n.failover_priority, healthStatus: n.health_status,
    lastCheckedAt: n.last_checked_at,
  }));
}

export async function simulateRegionShutdown(regionId: string): Promise<FailoverSimulation> {
  const nodes = await getInfrastructureNodes();
  const regionNodes = nodes.filter((n) => n.regionId === regionId);
  const otherHealthy = nodes.filter((n) => n.regionId !== regionId && n.healthStatus === "healthy")
    .sort((a, b) => a.failoverPriority - b.failoverPriority);

  const { data: tenants } = await (supabase as any).from("tenants").select("id").eq("region_id", regionId);
  const affectedTenants = tenants?.length ?? 0;

  const failoverTarget = otherHealthy.length > 0 ? otherHealthy[0] : null;
  const estimatedRecovery = failoverTarget ? 15 + affectedTenants * 0.5 : 120;
  const healthAfter = failoverTarget ? Math.max(40, 85 - affectedTenants * 2) : 20;

  log.info("Region shutdown simulated", { regionId, failoverTarget: failoverTarget?.id, affectedTenants });

  return { downRegionId: regionId, failoverTarget, affectedTenants, estimatedRecoveryMinutes: Math.round(estimatedRecovery), healthAfterFailover: healthAfter };
}

export async function getGeoDistribution(): Promise<Record<string, number>> {
  const { data: tenants } = await (supabase as any).from("tenants").select("region_id");
  const dist: Record<string, number> = {};
  for (const t of tenants ?? []) {
    const rid = t.region_id ?? "unassigned";
    dist[rid] = (dist[rid] ?? 0) + 1;
  }
  return dist;
}
