/**
 * Economic Graph Engine
 * Replaces LinkedIn's social graph with execution-backed economic relationships.
 * Maps: Sponsor → Student → Institution funding chains, repeat loops, collaboration clusters.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("economicGraph");

export interface EconomicNode {
  id: string;
  type: "student" | "sponsor" | "institution" | "faculty";
  label: string;
  metrics: {
    totalEscrowVolume: number;
    projectCount: number;
    completionRate: number;
  };
}

export interface EconomicEdge {
  source: string;
  target: string;
  relationship: "funded" | "executed" | "supervised" | "collaborated" | "repeat_funded";
  weight: number; // escrow volume or project count
  projectCount: number;
}

export interface EconomicGraphData {
  nodes: EconomicNode[];
  edges: EconomicEdge[];
  clusters: EconomicCluster[];
  summary: {
    totalNodes: number;
    totalEdges: number;
    totalEscrowVolume: number;
    repeatFundingLoops: number;
    crossInstitutionEdges: number;
  };
}

export interface EconomicCluster {
  id: string;
  institutionId: string | null;
  institutionName: string;
  nodeCount: number;
  totalVolume: number;
}

/**
 * Build the economic graph for a given scope (user-centric or institution-centric).
 */
export async function buildEconomicGraph(scopeType: "user" | "institution" | "global", scopeId?: string): Promise<EconomicGraphData> {
  let query = supabase.from("accountability_records").select("*");

  if (scopeType === "user" && scopeId) {
    query = query.or(`executor_id.eq.${scopeId},initiator_id.eq.${scopeId},funder_id.eq.${scopeId}`);
  }
  // institution scope would filter by project_id -> offers -> institution

  const { data: records } = await query.limit(500);
  const all = records ?? [];

  const nodesMap = new Map<string, EconomicNode>();
  const edgesMap = new Map<string, EconomicEdge>();

  for (const record of all) {
    // Add executor node
    ensureNode(nodesMap, record.executor_id, "student");
    // Add initiator node
    ensureNode(nodesMap, record.initiator_id, "sponsor");
    // Add funder if different
    if (record.funder_id && record.funder_id !== record.initiator_id) {
      ensureNode(nodesMap, record.funder_id, "sponsor");
    }

    // Update metrics
    updateNodeMetrics(nodesMap, record.executor_id, record);
    updateNodeMetrics(nodesMap, record.initiator_id, record);

    // Create edges
    const funderId = record.funder_id || record.initiator_id;
    const fundingEdgeKey = `${funderId}->${record.executor_id}`;
    const existing = edgesMap.get(fundingEdgeKey);
    if (existing) {
      existing.weight += record.escrow_amount ?? 0;
      existing.projectCount += 1;
      if (existing.projectCount > 1) existing.relationship = "repeat_funded";
    } else {
      edgesMap.set(fundingEdgeKey, {
        source: funderId,
        target: record.executor_id,
        relationship: "funded",
        weight: record.escrow_amount ?? 0,
        projectCount: 1,
      });
    }
  }

  const nodes = Array.from(nodesMap.values());
  const edges = Array.from(edgesMap.values());
  const repeatFundingLoops = edges.filter((e) => e.relationship === "repeat_funded").length;
  const totalEscrowVolume = edges.reduce((s, e) => s + e.weight, 0);

  // Simple clustering by most connected nodes
  const clusters: EconomicCluster[] = [];

  log.info("Economic graph built", {
    scopeType,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    repeatFundingLoops,
  });

  return {
    nodes,
    edges,
    clusters,
    summary: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      totalEscrowVolume,
      repeatFundingLoops,
      crossInstitutionEdges: 0, // requires institution mapping
    },
  };
}

function ensureNode(map: Map<string, EconomicNode>, id: string, type: EconomicNode["type"]) {
  if (!map.has(id)) {
    map.set(id, {
      id,
      type,
      label: id.substring(0, 8), // placeholder — resolve from profiles
      metrics: { totalEscrowVolume: 0, projectCount: 0, completionRate: 0 },
    });
  }
}

function updateNodeMetrics(map: Map<string, EconomicNode>, id: string, record: any) {
  const node = map.get(id);
  if (!node) return;
  node.metrics.totalEscrowVolume += record.escrow_amount ?? 0;
  node.metrics.projectCount += 1;
  if (record.outcome_status === "completed") {
    node.metrics.completionRate = Math.round(
      ((node.metrics.completionRate * (node.metrics.projectCount - 1) + 100) / node.metrics.projectCount)
    );
  }
}
