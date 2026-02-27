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

export { createLRO, getLRO, searchLROs, updateLROVersion, getLROVersionHistory, createDataset, getDatasets, logDatasetAccess, saveReproducibilityRecord, getReproducibilityRecords, computeRRI, saveRRI, getRRI, submitReplicationAttempt, completeReplication, getReplicationAttempts, computeOpenScienceImpact, saveOpenScienceImpact, detectMissingReproducibility, OPENNESS_LEVELS, LRO_CHANGE_TYPES, GOSLKI_TRANSPARENCY, RRI_WEIGHTS, OPEN_SCIENCE_IMPACT_WEIGHTS, REPRODUCIBILITY_ELEMENTS } from "./openScienceInfrastructure";
export type { OpennessLevel, LROChangeType, LROInput, LROVersionInput, DatasetInput, ReproducibilityInput, RRIInput, ReplicationAttemptInput, OpenScienceImpactInput, MissingReproducibilityElement } from "./openScienceInfrastructure";

export { upsertCareerProfile, getCareerProfile, computeMDRS, saveMDRS, getMDRS, saveExecutionReliability, getExecutionReliability, computeAdaptability, saveAdaptability, getAdaptability, detectCareerRisks, saveCareerRisks, getCareerRisks, saveTrajectorySnapshot, getCareerTrajectory, generateCareerAdvice, exportAcademicIdentity, CAREER_STAGES, ACIRO_TRANSPARENCY, MDRS_WEIGHTS, ADAPTABILITY_WEIGHTS } from "./academicCareerIntelligence";
export type { CareerStage, CareerProfileInput, MDRSInput, ExecutionReliabilityInput, AdaptabilityInput, CareerRiskInput, CareerRiskResult, CareerAdvisorSuggestion } from "./academicCareerIntelligence";

export { computeNIEI, saveNIEI, getNIEI, recordCapitalFlow, getCapitalFlows, saveDomainDominance, getDomainDominance, saveResearchLaborData, getResearchLaborMarket, computeCompetitionIndex, saveCompetitionIndex, getCompetitionIndex, detectMacroRisks, saveMacroRisks, simulateFundingAllocation, saveSimulation, saveNetworkEdge, getNetworkEdges, MACRO_RISK_TYPES, CAPITAL_FLOW_TYPES, GREIIE_TRANSPARENCY, COMPETITION_INDEX_WEIGHTS } from "./researchEconomyIntelligence";
export type { MacroRiskType, NIEIInput, CompetitionIndexInput, CapitalFlowInput, SimulationInput, SimulationResult } from "./researchEconomyIntelligence";

export { saveLongitudinalData, getLongitudinalData, saveDomainLifecycle, getDomainLifecycle, detectDomainPhase, saveParadigmShift, getParadigmShifts, detectParadigmShiftSignals, saveInstitutionalTrajectory, getInstitutionalTrajectory, saveGenerationalInfluence, getGenerationalTree, computeKnowledgeSurvival, saveKnowledgeSurvival, getKnowledgeSurvival, saveInnovationWave, getInnovationWaves, saveFundingRegime, getFundingRegimes, computeSustainability, saveSustainability, getSustainabilityScores, crossDecadeComparison, generateHistoricalInsights, DOMAIN_LIFECYCLE_PHASES, PARADIGM_SHIFT_TYPES, INNOVATION_WAVE_PHASES, TIME_RANGES, SUSTAINABILITY_WEIGHTS, GKEHIE_TRANSPARENCY } from "./knowledgeEvolutionEngine";
export type { DomainLifecyclePhase, ParadigmShiftType, InnovationWavePhase, LongitudinalDataInput, DomainLifecycleInput, ParadigmShiftInput, InstitutionalTrajectoryInput, GenerationalInfluenceInput, KnowledgeSurvivalInput, InnovationWaveInput, FundingRegimeInput, SustainabilityScoreInput } from "./knowledgeEvolutionEngine";

export { detectCitationManipulation as detectCitationManipulationGAIDE, saveCitationFlags, getCitationFlags, saveCoauthorFlags, getCoauthorFlags, detectGrantMisuse, saveGrantMisuseFlags, getGrantMisuseFlags, savePatentInflationFlags, getPatentInflationFlags, computeIIRI, saveIIRI, getIIRI, computeJournalRisk, saveJournalRisk, getJournalRisks, detectReputationVolatility, saveVolatilityEvents, getVolatilityEvents, saveOpenScienceFraudFlags, getOpenScienceFraudFlags, saveCollusionFlags, getCollusionFlags, computeICS, saveICS, getICS, submitAppeal, updateAppealStatus, getAppeals, CITATION_FLAG_TYPES, GRANT_MISUSE_TYPES, PATENT_INFLATION_TYPES, COLLUSION_TYPES, OPEN_SCIENCE_FRAUD_TYPES, ICS_WEIGHTS, IIRI_WEIGHTS, GAIDE_TRANSPARENCY } from "./academicIntegrityEngine";
export type { CitationFlagInput, CoauthorFlagInput, GrantMisuseFlagInput, PatentInflationFlagInput, IIRIInput, JournalRiskInput, ICSInput, AppealInput, CollusionFlagInput, OpenScienceFraudInput, VolatilityEventInput } from "./academicIntegrityEngine";

export { registerApi, getApis, grantApiAccess, getApiAccessGrants, logApiCall, getApiAuditLogs, saveIntegrationConfig, getIntegrationConfigs, updateIntegrationSync, subscribeWebhook, getWebhookSubscriptions, emitEvent, getEvents, logDataExport, getDataExportLogs, requestCrossBorderTransfer, approveCrossBorderTransfer, getCrossBorderTransfers, registerExtension, getExtensions, updateExtensionReview, saveStandardizationMapping, getStandardizationMappings, linkIdentity, getLinkedIdentities, verifyIdentityLink, validateApiEscrowInvariant, API_TYPES, EVENT_TYPES, INTEGRATION_TYPES, EXPORT_FORMATS, EXTENSION_TYPES, GRIIE_TRANSPARENCY } from "./researchInfrastructureEngine";
export type { ApiType, InfraEventType, IntegrationType, ApiRegistryInput, ApiAccessGrantInput, IntegrationConfigInput, WebhookSubscriptionInput, EventEmission, DataExportInput, CrossBorderTransferInput, ExtensionInput, IdentityFederationInput, StandardizationMappingInput } from "./researchInfrastructureEngine";

export { addKnowledgeNode, addKnowledgeEdge, getKnowledgeNodes, getKnowledgeEdges, saveScoringProfile, getScoringProfiles, computeCompositeScore, createGovernanceBoard, getGovernanceBoards, addBoardMember, getBoardMembers, logAIDecision, markAIDecisionReviewed, getAIDecisionAuditLog, saveArchivalPolicy, getArchivalPolicies, submitNationalIntelligenceQuery, getNationalIntelligenceResults, recordPlatformHealth, getPlatformHealthMetrics, validateGRCOSIntegrity, GRCOS_LAYERS, SCORING_DIMENSIONS, DEFAULT_WEIGHTS, GOVERNANCE_BOARD_TYPES, UX_PHILOSOPHY, ARCHIVAL_COMMITMENT, STRATEGIC_POSITIONING, KNOWLEDGE_GRAPH_NODE_TYPES } from "./civilizationOperatingSystem";
export type { ScoringDimension, KnowledgeGraphNodeType, KnowledgeGraphNodeInput, KnowledgeGraphEdgeInput, GRCOSScoringInput, GovernanceBoardInput, AIDecisionAuditInput, NationalIntelligenceQueryInput } from "./civilizationOperatingSystem";

export { createCollaborationRequest, getCollaborationRequests, respondToCollaborationRequest, getDiscoveryCategories, createDiscoveryCategory, createLearningModule, getLearningModules, getUserLearningModules, getAIContentRecommendations, saveAIContentRecommendation, getInnovationMapPoints, addInnovationMapPoint, COLLABORATION_REQUEST_TYPES, DISCOVERY_CATEGORY_TYPES, LEARNING_MODULE_TYPES, INNOVATION_MAP_POINT_TYPES, EXECUTION_NETWORK_PHILOSOPHY } from "./executionVisualNetwork";
export type { CollaborationRequestType, DiscoveryCategoryType, LearningModuleType, CollaborationRequestInput, LearningModuleInput, InnovationMapPointInput } from "./executionVisualNetwork";

export { saveReputationStack, getReputationStack, computeCompositeReputation, addIdentityTimelineEvent, getIdentityTimeline, addSkillMatrixEntry, getSkillMatrix, updateSkillMatrixEntry, awardVerifiedBadge, getUserVerifiedBadges, addGlobalFootprint, getGlobalFootprint, saveStabilityIndex, getStabilityIndex, computeStabilityComposite, submitInstitutionalVerification, approveInstitutionalVerification, getUserInstitutionalVerifications, REPUTATION_DIMENSIONS, IDENTITY_EVENT_TYPES, VERIFIED_BADGE_TYPES, FOOTPRINT_ENGAGEMENT_TYPES, INSTITUTIONAL_VERIFICATION_TYPES, IDENTITY_PHILOSOPHY } from "./verifiedIdentityEngine";
export type { ReputationDimension, IdentityEventType, VerifiedBadgeType, ReputationStackInput, IdentityTimelineEventInput, SkillMatrixEntryInput, VerifiedBadgeInput, GlobalFootprintInput, StabilityIndexInput, InstitutionalVerificationInput } from "./verifiedIdentityEngine";
