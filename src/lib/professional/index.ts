/**
 * Professional Infrastructure — unified exports.
 * Execution-backed professional identity, economic graph, and feed algorithm.
 */

export { calculateERS } from "./executionReputationScore";
export type { ERSBreakdown } from "./executionReputationScore";

export { buildEconomicGraph } from "./economicGraph";
export type { EconomicNode, EconomicEdge, EconomicGraphData, EconomicCluster } from "./economicGraph";

export { scoreFeedItem, rankFeed } from "./executionFeedAlgorithm";
export type { FeedItem, ScoredFeedItem, FeedItemType } from "./executionFeedAlgorithm";
