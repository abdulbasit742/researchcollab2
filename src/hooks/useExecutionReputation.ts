import { useQuery } from "@tanstack/react-query";
import { computeERS, computeBatchERS, type ExecutionReputationScore } from "@/domain/user/executionReputationEngine";

/**
 * Hook to compute Execution Reputation Score for a user.
 */
export function useExecutionReputation(userId?: string) {
  return useQuery<ExecutionReputationScore>({
    queryKey: ["execution-reputation", userId],
    enabled: !!userId,
    queryFn: () => computeERS(userId!),
    staleTime: 600_000, // 10 min cache
  });
}

/**
 * Hook for ERS leaderboard — batch compute for multiple users.
 */
export function useERSLeaderboard(userIds: string[]) {
  return useQuery<ExecutionReputationScore[]>({
    queryKey: ["ers-leaderboard", userIds],
    enabled: userIds.length > 0,
    queryFn: () => computeBatchERS(userIds),
    staleTime: 600_000,
  });
}
