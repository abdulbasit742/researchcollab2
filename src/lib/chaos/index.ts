/**
 * Chaos Testing Engine — unified exports.
 *
 * SAFETY: All chaos operations are gated by chaosController.
 * Cannot run in production. Requires explicit enable.
 */

export { isChaosEnabled, enableChaos, disableChaos, chaosProbability } from "./chaosController";
export { simulateConcurrentDeals, simulateConcurrentMessages } from "./concurrencySimulator";
export { simulateWebhookReplay, simulateOutOfOrderWebhooks } from "./stripeReplaySimulator";
export { simulateDoubleMilestoneRelease, simulateFundRefundRace } from "./escrowRaceSimulator";
export { simulateConcurrentWithdrawals } from "./walletCollisionSimulator";
export { simulateTrustStorm } from "./trustStormSimulator";
export { injectLatency, withLatency } from "./latencyInjector";
export { simulatePartialDealFlow } from "./partialFailureSimulator";
export { buildChaosReport, logChaosReport, persistChaosReport } from "./chaosReport";
export type { ChaosResult, ChaosReport } from "./chaosReport";
