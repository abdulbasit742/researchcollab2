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

export { calculateInstitutionalTrustScore, buildGovernanceDashboard, generateAccreditationReport, getGovernmentInnovationSnapshot, getGrantFundingRecords, getCrossInstitutionAgreements, generateComplianceAuditPackage, INSTITUTIONAL_GOVERNANCE_TRANSPARENCY } from "./institutionalGovernance";
export type { InstitutionalTrustScore, InstitutionalGovernanceDashboard } from "./institutionalGovernance";

export { getPrivacySettings, updatePrivacySettings, getAlgorithmTransparency, detectIntegrityViolations, getSecurityTransparencyReports, logAntiScrapingEvent, logAccessControlEvent, ZERO_TRUST_TRANSPARENCY } from "./zeroTrustSecurity";
export type { ProfessionalPrivacySettings, AlgorithmTransparencyEntry, IntegritySignal, IntegritySignalType, AntiScrapingEvent, SecurityTransparencyReport } from "./zeroTrustSecurity";

export { predictExecutionRisk, getCapitalAllocationRecommendations, getTalentDevelopmentInsights, getInstitutionalForecast, detectFraudSignals, getSmartMatches, getEscrowHealthAlerts, getInnovationIntelligence, AI_INTELLIGENCE_TRANSPARENCY } from "./intelligenceEngine";
export type { ExecutionRiskPrediction, CapitalRecommendation, TalentDevelopmentInsight, InstitutionalForecast, FraudSignal, FraudSignalType, SmartMatch, EscrowHealthAlert } from "./intelligenceEngine";

export { createPortfolioItem, getUserPortfolio, discoverPortfolio, getProjectStories, createProjectStoryEvent, getInstitutionalChannels, getShowcasePosts, getVisualDiscussions, addVisualDiscussion, getExecutionReels, getUserBadges, calculateVisualImpactScore, VISUAL_INTELLIGENCE_TRANSPARENCY } from "./visualIntelligence";
export type { VisualType, ReelType, BadgeType, StoryEventType, PortfolioItemInput, VisualImpactScore } from "./visualIntelligence";

export { computeUnifiedIdentity, getUnifiedIdentity, createMarketplaceListing, browseMarketplace, applyToListing, intelligentDiscovery, getGrowthAdvisorRecords, getLifecycleEvents, recordLifecycleEvent, CATEGORY_POSITIONING, LIFECYCLE_STAGES } from "./totalDominance";
export type { UnifiedExecutionIdentity, ListingType, MarketplaceListingInput, DiscoveryFilters, LifecycleStage } from "./totalDominance";

export { computeMDII, getMDII, calculateCitationQualityIndex, indexPaper, searchPapers, createGrant, getUserGrants, addLifecycleEvent, getResearchTimeline, getInstitutionalExecutionIndex, trackCommercialization, getUserCommercializations, getGlobalInnovationMap, getIntegrityFlags, computeResearcherReliability, GAEI_CATEGORY, MDII_EXPLANATION, RESEARCH_LIFECYCLE_STAGES } from "./academicExecutionIndex";
export type { MDII, PaperInput, GrantInput, ResearcherReliabilityMetrics, ResearchLifecycleStage } from "./academicExecutionIndex";

export { computeMAIE, getMAIEScores, computeCQI, computeFIS, computeEIS, computeCDII, computeLCI, detectCitationManipulation, getImpactEvolution, getPolicyImpactRecords, addPolicyImpactRecord, getManipulationFlags, applyFieldNormalization, getFieldBaseline, getGlobalEquityWeight, MAIE_TRANSPARENCY } from "./multiLayerImpactEngine";
export type { MAIEScores, CQIInput, ManipulationSignal } from "./multiLayerImpactEngine";

export { recordGrantLifecycleEvent, getGrantLifecycleTimeline, computeGrantPerformance, saveGrantPerformanceMetrics, computeGRS, saveGRS, getGRS, computeFundingEfficiency, forecastGrantImpact, saveGrantForecast, detectGrantAnomalies, saveAnomalyFlags, getGrantDisciplineNorms, applyDisciplineNormalization, getInstitutionalFundingIntel, saveInstitutionalFundingIntel, GRANT_LIFECYCLE_STAGES, GGLIS_TRANSPARENCY, GRS_WEIGHTS, ANOMALY_TYPES } from "./grantLifecycleIntelligence";
export type { GrantLifecycleStage, GrantLifecycleEvent, GrantPerformanceMetrics, GrantReliabilityScore, GrantImpactForecast, GrantAnomalyFlag, GrantAnomalyType, FundingToOutputEfficiency, InstitutionalFundingIntel } from "./grantLifecycleIntelligence";

export { createCollaborationNode, getCollaborationNodes, computeEdgeStrength, saveCollaborationEdge, getCollaborationEdges, computeCTS, saveCTS, getCTS, computeCSI, saveCSI, computeCDI as computeCollabCDI, saveCDI as saveCollabCDI, getCDI as getCollabCDI, recordEvolutionEvent, getCollaborationTimeline, detectCollaborationRisks, saveDomainCluster, getDomainClusters, suggestCollaborations, NODE_TYPES, EVOLUTION_EVENT_TYPES, GACIG_TRANSPARENCY, CTS_WEIGHTS, EDGE_STRENGTH_WEIGHTS } from "./collaborationIntelligenceGraph";
export type { CollaborationNodeType, CollaborationNode, CollaborationEdgeInput, CollaborationTrustScoreInput, CollaborationDiversityInput, CollaborationStabilityInput, CollaborationRiskSignal, DomainCluster, EvolutionEventType } from "./collaborationIntelligenceGraph";

export { createPatent, getPatentsByGrant, getPatentsByInstitution, computePQI, computeRCCI, saveCommercializationMetrics, createStartup, getStartupsByInstitution, computeIYR, computeIIS, saveIIS, recordInnovationFailure, getInnovationClusters, forecastCommercialization, GRCIE_TRANSPARENCY, PQI_WEIGHTS, IIS_WEIGHTS, TRL_LEVELS } from "./researchCommercialization";
export type { PatentInput, CommercializationInput, StartupInput, InnovationFailureInput } from "./researchCommercialization";

export { searchResearchDiscovery, computeCompositeRankScore, indexForDiscovery, predictTrajectory, saveTrajectoryPrediction, getEmergingDomainSignals, saveEmergingSignal, addKnowledgeGraphConnection, getKnowledgeGraphNeighbors, getFundingGaps, saveFundingGap, compareEntities, SEARCH_MODES, IRDPKE_TRANSPARENCY, DEFAULT_RANK_WEIGHTS } from "./researchDiscoveryEngine";
export type { SearchMode, DiscoverySearchParams, DiscoveryResult, TrajectoryPrediction, EmergingDomainSignal, FundingGap } from "./researchDiscoveryEngine";

export { computeInstitutionalRank, saveInstitutionalRanking, getInstitutionalRankings, getInstitutionRankingHistory, applyFieldNormalization as applyRankingFieldNorm, detectRankingManipulation, saveManipulationFlags, getGovernmentRankingExport, GIEIRE_TRANSPARENCY, RANKING_WEIGHTS, MANIPULATION_TYPES } from "./institutionalRanking";
export type { InstitutionalRankingInput, RankingResult, ManipulationFlag } from "./institutionalRanking";

export { createComplianceCheckpoint, getGrantComplianceCheckpoints, verifyCheckpoint, computeCIS, saveCIS, getCIS, createEthicsRecord, getEthicsRecords, flagEthicsRecord, assessCrossBorderCompliance, getCrossBorderAssessments, detectComplianceAnomalies, saveComplianceAnomalies, forecastCompliance, saveComplianceForecast, saveDataGovernanceAssessment, getDataGovernance, getRegulatoryTemplates, getGovernmentOversight, COMPLIANCE_CHECKPOINT_TYPES, ETHICS_RECORD_TYPES, GRGCS_TRANSPARENCY, CIS_WEIGHTS } from "./researchGovernanceCompliance";
export type { ComplianceCheckpointType, EthicsRecordType, ComplianceCheckpoint, ComplianceIntegrityInput, EthicsRecord, CrossBorderAssessment, ComplianceForecast, DataGovernanceAssessment } from "./researchGovernanceCompliance";
