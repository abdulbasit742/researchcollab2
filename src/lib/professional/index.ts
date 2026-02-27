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

export { searchTalent, searchInstitutions, suggestMatches, SEARCH_TRANSPARENCY } from "./executionSearch";
export type { IndividualSearchIndex, InstitutionSearchIndex, SponsorSearchIndex, TalentSearchFilters, InstitutionSearchFilters, SponsorSearchFilters, SearchContext, MatchSuggestion } from "./executionSearch";

export { compareCandidates } from "./recruiterIntelligence";
export type { CandidateComparison, ComparisonReport } from "./recruiterIntelligence";

export { createContextualThread, calculateCommunicationAnalytics, detectDisputeSignals, createNegotiationRecord, validateMessageContext, updateThreadPriority, COMMUNICATION_BADGES } from "./executionCommunication";
export type { ThreadContextType, ThreadPriority, IntroductionReason, ContextualThreadRequest, CommunicationAnalytics, CommunicationBadge, DisputePreventionSignal, NegotiationProposal } from "./executionCommunication";

export { buildExecutionResume, calculateTalentReadinessScore, generateHiringPrediction, generateInstitutionalTalentReport, TRS_TRANSPARENCY } from "./talentIntelligence";
export type { ExecutionResume, ExecutionResumeProject, SkillEvidenceBlock, FacultyAssessment, TalentReadinessScore, CareerTrajectoryPoint, EconomicFootprint, HiringPrediction } from "./talentIntelligence";

export { publishExecutionContent, searchExecutionContent, calculateAuthorCredibility, calculateSubstanceRank, detectHypeContent, detectUnsupportedClaims, CONTENT_RANKING_TRANSPARENCY } from "./knowledgeContentEngine";
export type { ExecutionContentType, ExecutionContentInput, CaseStudyTemplate, KnowledgeBadgeType, AuthorCredibility, ContentSearchFilters } from "./knowledgeContentEngine";

export { calculateReputationIndex, calculateTrustEdgeScore, detectNetworkGaming, detectCollaborationClusters, queryEconomicGraph, TRUST_GRAPH_TRANSPARENCY } from "./economicTrustGraph";
export type { TrustRelationshipType, TrustEdge, ReputationIndex, NetworkGamingSignal } from "./economicTrustGraph";

export { calculateEconomicHealthIndex, calculateSponsorCapitalIntelligence, detectFinancialRisks, getCapitalFlowSummary, getInstitutionalFinancialDashboard, FINANCIAL_TRANSPARENCY } from "./financialInfrastructure";
export type { EconomicHealthIndex, SponsorCapitalIntelligence, FinancialRiskSignal } from "./financialInfrastructure";
