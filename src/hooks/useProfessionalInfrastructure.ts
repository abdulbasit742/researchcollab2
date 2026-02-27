/**
 * React hooks for LinkedIn-superior professional infrastructure.
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { calculateERS } from "@/lib/professional/executionReputationScore";
import { buildEconomicGraph } from "@/lib/professional/economicGraph";
import type { ERSBreakdown } from "@/lib/professional/executionReputationScore";
import type { EconomicGraphData } from "@/lib/professional/economicGraph";

/**
 * Execution Reputation Score for a user.
 * Replaces LinkedIn endorsements with escrow-verified execution metrics.
 */
export function useExecutionReputationScore(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery<ERSBreakdown>({
    queryKey: ["execution-reputation-score", targetId],
    queryFn: () => calculateERS(targetId!),
    enabled: !!targetId,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

/**
 * Economic Graph — execution-backed relationship network.
 * Replaces LinkedIn's social graph with funding chains and collaboration clusters.
 */
export function useEconomicGraph(scopeType: "user" | "institution" | "global" = "global", scopeId?: string) {
  const { user } = useAuth();
  const effectiveId = scopeType === "user" ? (scopeId || user?.id) : scopeId;

  return useQuery<EconomicGraphData>({
    queryKey: ["economic-graph", scopeType, effectiveId],
    queryFn: () => buildEconomicGraph(scopeType, effectiveId),
    enabled: scopeType === "global" || !!effectiveId,
    staleTime: 10 * 60 * 1000, // 10 min cache
  });
}
