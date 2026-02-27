import { useQuery } from "@tanstack/react-query";
import { computeDealHealthScore, computeAllDealHealthScores, type DealHealthResult } from "@/domain/deal/dealHealthEngine";

/**
 * Hook to fetch deal health score for a single deal.
 */
export function useDealHealthScore(dealId?: string) {
  return useQuery<DealHealthResult>({
    queryKey: ["deal-health-score", dealId],
    enabled: !!dealId,
    queryFn: () => computeDealHealthScore(dealId!),
    staleTime: 300_000, // 5 min cache
  });
}

/**
 * Hook to fetch health scores for all active deals.
 */
export function useAllDealHealthScores() {
  return useQuery<DealHealthResult[]>({
    queryKey: ["deal-health-scores-all"],
    queryFn: computeAllDealHealthScores,
    staleTime: 600_000, // 10 min cache
  });
}
