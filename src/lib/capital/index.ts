/**
 * Capital Pool & Liquidity Module — unified exports.
 */

export { createPoolWallet, getPoolWallet, depositToPool, allocateFromPool, releaseBackToPool, assertPoolBalance } from "./poolWalletService";
export { allocatePoolToDeal } from "./allocationEngine";
export { calculateRiskScore, distributeCapitalAcrossDeals } from "./riskAllocator";
export { recycleCompletedDealCapital, recycleRefundedDealCapital } from "./recyclingEngine";
export { calculatePoolPerformance, snapshotPoolMetrics } from "./performanceTracker";
export { checkPoolHealth, runAllPoolHealthChecks } from "./poolHealth";
export { getLiquidityDashboardData } from "./liquidityDashboardService";

export type { AllocationResult } from "./allocationEngine";
export type { AllocationStrategy, DealRiskProfile } from "./riskAllocator";
export type { RecyclingResult } from "./recyclingEngine";
export type { PoolPerformance } from "./performanceTracker";
export type { PoolHealthIssue } from "./poolHealth";
export type { LiquidityDashboardData, PoolSummary } from "./liquidityDashboardService";
