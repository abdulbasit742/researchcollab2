// ============================================
// KNOWLEDGE CIVILIZATION TYPES
// Systems 37-45: Civilizational Memory Layer
// ============================================

// ============================================
// SYSTEM 37: KNOWLEDGE OBJECT STANDARD (KOS)
// ============================================

export type KnowledgeObjectType =
  | "research"
  | "case_study"
  | "playbook"
  | "policy"
  | "method"
  | "framework"
  | "lesson_learned"
  | "failure_analysis"
  | "best_practice"
  | "hypothesis";

export type KnowledgeLifecycleState =
  | "draft"
  | "under_review"
  | "validated"
  | "contested"
  | "superseded"
  | "legacy"
  | "archived";

export type ValidationLevel =
  | "unvalidated"
  | "peer_reviewed"
  | "institution_endorsed"
  | "field_validated"
  | "consensus";

export interface KnowledgeAuthor {
  userId: string;
  role: "primary" | "contributor" | "reviewer" | "editor";
  contribution: string;
  addedAt: Date;
  verifiedAt?: Date;
}

export interface KnowledgeProvenance {
  originType: "original" | "derived" | "synthesized" | "translated" | "adapted";
  sourceIds: string[];
  derivationMethod?: string;
  createdAt: Date;
  originalContext?: string;
}

export interface KnowledgeVersion {
  version: string;
  createdAt: Date;
  createdBy: string;
  changesSummary: string;
  changes: {
    field: string;
    previousValue: unknown;
    newValue: unknown;
  }[];
  validationStatus: ValidationLevel;
}

export interface UsageOutcome {
  id: string;
  userId: string;
  institutionId?: string;
  usageType: "applied" | "referenced" | "adapted" | "rejected";
  outcomeDescription: string;
  impactScore?: number;
  recordedAt: Date;
  verified: boolean;
}

export interface KnowledgeObject {
  id: string;
  type: KnowledgeObjectType;
  title: string;
  abstract: string;
  content: string;
  
  // Authorship & Provenance
  authors: KnowledgeAuthor[];
  provenance: KnowledgeProvenance;
  
  // Version Control
  currentVersion: string;
  versionHistory: KnowledgeVersion[];
  
  // Validation & Credibility
  validationLevel: ValidationLevel;
  credibilityScore: number; // 0-100, trust-weighted
  validatorCount: number;
  contestationCount: number;
  
  // Lifecycle
  lifecycleState: KnowledgeLifecycleState;
  supersededBy?: string;
  supersedes?: string[];
  
  // Usage & Impact
  usageOutcomes: UsageOutcome[];
  citationCount: number;
  applicationCount: number;
  
  // Metadata
  domain: string;
  subdomains: string[];
  tags: string[];
  keywords: string[];
  
  // Access & Visibility
  visibility: "private" | "institutional" | "field" | "public";
  institutionId?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  validatedAt?: Date;
  archivedAt?: Date;
}

// ============================================
// SYSTEM 38: COLLECTIVE INTELLIGENCE GRAPH
// ============================================

export type GraphNodeType =
  | "person"
  | "knowledge_object"
  | "outcome"
  | "institution"
  | "domain"
  | "time_period";

export type GraphEdgeType =
  | "authored"
  | "derived_from"
  | "enabled"
  | "validated"
  | "contradicts"
  | "supports"
  | "applied"
  | "belongs_to"
  | "collaborated_with"
  | "synthesized_from";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  weight: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: GraphEdgeType;
  weight: number;
  confidence: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface KnowledgeLineage {
  objectId: string;
  ancestors: Array<{
    objectId: string;
    relationship: GraphEdgeType;
    depth: number;
  }>;
  descendants: Array<{
    objectId: string;
    relationship: GraphEdgeType;
    depth: number;
  }>;
}

export interface ImpactTrace {
  sourceObjectId: string;
  impacts: Array<{
    targetId: string;
    targetType: GraphNodeType;
    impactType: string;
    magnitude: number;
    tracedAt: Date;
  }>;
  totalReach: number;
  domains: string[];
}

export interface KnowledgeCluster {
  id: string;
  name: string;
  description: string;
  nodeIds: string[];
  coherenceScore: number;
  emergingPatterns: string[];
  createdAt: Date;
}

// ============================================
// SYSTEM 39: FAILURE & NEGATIVE KNOWLEDGE
// ============================================

export type FailureType =
  | "project_failure"
  | "hypothesis_invalidated"
  | "method_disproven"
  | "approach_abandoned"
  | "experiment_failed"
  | "implementation_failed";

export interface FailureRecord {
  id: string;
  type: FailureType;
  title: string;
  description: string;
  
  // What was attempted
  originalHypothesis: string;
  methodology: string;
  expectedOutcome: string;
  
  // What happened
  actualOutcome: string;
  failureReason: string;
  contributingFactors: string[];
  
  // Lessons
  lessonsLearned: string[];
  recommendationsAgainst: string[];
  conditions: string[]; // Under what conditions this failed
  
  // Credibility
  authorId: string;
  credibilityScore: number;
  verifiedBy: string[];
  replicationAttempts: number;
  
  // Sharing
  visibility: "private" | "team" | "institution" | "field" | "public";
  sharedWith: string[];
  
  // Metadata
  domain: string;
  tags: string[];
  relatedSuccesses?: string[]; // What DID work instead
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SYSTEM 40: INSTITUTIONAL MEMORY VAULTS
// ============================================

export type VaultType =
  | "knowledge"
  | "research"
  | "policy"
  | "decision"
  | "project"
  | "personnel";

export type VaultAccessLevel =
  | "public"
  | "institutional"
  | "department"
  | "restricted"
  | "classified";

export interface VaultEntry {
  id: string;
  vaultId: string;
  objectId: string;
  objectType: string;
  addedBy: string;
  addedAt: Date;
  metadata: Record<string, unknown>;
}

export interface InstitutionalVault {
  id: string;
  institutionId: string;
  name: string;
  description: string;
  type: VaultType;
  
  // Contents
  entries: VaultEntry[];
  entryCount: number;
  
  // Access Control
  accessLevel: VaultAccessLevel;
  accessRoles: string[];
  viewers: string[];
  editors: string[];
  
  // Versioning
  versioningEnabled: boolean;
  retentionPolicy: string;
  
  // Audit
  auditTrail: Array<{
    action: string;
    performedBy: string;
    performedAt: Date;
    details: Record<string, unknown>;
  }>;
  
  // Succession
  successors: string[];
  successionPlan?: string;
  
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}

// ============================================
// SYSTEM 41: KNOWLEDGE VALIDATION & EVOLUTION
// ============================================

export type ValidationAction =
  | "endorse"
  | "question"
  | "contest"
  | "supersede"
  | "merge"
  | "split";

export interface ValidationRecord {
  id: string;
  knowledgeObjectId: string;
  validatorId: string;
  validatorCredibility: number;
  action: ValidationAction;
  rationale: string;
  evidence?: string[];
  
  // If superseding
  supersedingObjectId?: string;
  supersessionReason?: string;
  
  createdAt: Date;
  acknowledged: boolean;
}

export interface KnowledgeEvolution {
  objectId: string;
  evolutionPath: Array<{
    version: string;
    validationLevel: ValidationLevel;
    credibilityScore: number;
    timestamp: Date;
    trigger: string;
  }>;
  currentState: KnowledgeLifecycleState;
  projectedTrajectory: "growing" | "stable" | "declining" | "contested";
}

// ============================================
// SYSTEM 42: AI HISTORIAN & SYNTHESIZER
// ============================================

export type AISynthesisType =
  | "summary"
  | "pattern_detection"
  | "forgotten_insight"
  | "mistake_warning"
  | "cross_domain_connection"
  | "trend_analysis";

export interface AISynthesis {
  id: string;
  type: AISynthesisType;
  title: string;
  content: string;
  
  // Sources
  sourceObjectIds: string[];
  citations: Array<{
    objectId: string;
    relevance: string;
    excerpt?: string;
  }>;
  
  // Confidence
  confidenceScore: number;
  uncertaintyFactors: string[];
  limitations: string[];
  
  // Metadata
  generatedAt: Date;
  generatedFor?: string; // User or institution
  domain: string;
  
  // Feedback
  userRating?: number;
  feedbackNotes?: string;
  wasUseful?: boolean;
}

export interface PatternAlert {
  id: string;
  type: "emerging_pattern" | "repeated_mistake" | "forgotten_insight" | "opportunity";
  title: string;
  description: string;
  confidence: number;
  sources: string[];
  recommendedAction?: string;
  createdAt: Date;
  acknowledgedAt?: Date;
}

// ============================================
// SYSTEM 43: LEGACY & SUCCESSION
// ============================================

export type LegacyStatus =
  | "active"
  | "inactive"
  | "succession_pending"
  | "transferred"
  | "preserved";

export interface LegacyDesignation {
  id: string;
  userId: string;
  
  // Successors
  designatedSuccessors: Array<{
    userId: string;
    priority: number;
    scope: "full" | "partial";
    acceptedAt?: Date;
    domains?: string[];
  }>;
  
  // Preservation Preferences
  preservationLevel: "minimal" | "standard" | "comprehensive";
  deleteAfterTransfer: string[]; // What to delete
  keepPermanently: string[]; // What to preserve forever
  
  // Transfer Rules
  inactivityThresholdDays: number;
  automaticTransfer: boolean;
  requireSuccessorConfirmation: boolean;
  
  // Current Status
  status: LegacyStatus;
  lastActivityAt: Date;
  
  createdAt: Date;
  updatedAt: Date;
  executedAt?: Date;
}

export interface SuccessionEvent {
  id: string;
  legacyDesignationId: string;
  fromUserId: string;
  toUserId: string;
  scope: "full" | "partial";
  transferredItems: string[];
  preservedItems: string[];
  executedAt: Date;
  acknowledgedAt?: Date;
}

// ============================================
// SYSTEM 44: KNOWLEDGE → OPPORTUNITY PIPELINE
// ============================================

export interface KnowledgeOpportunityLink {
  id: string;
  knowledgeObjectId: string;
  opportunityId: string;
  linkType: "enables" | "required" | "recommended" | "context";
  strength: number;
  createdAt: Date;
  utilized: boolean;
}

export interface KnowledgeImpactMetrics {
  objectId: string;
  opportunitiesUnlocked: number;
  trustImpact: number;
  institutionalAdoptions: number;
  policyInfluence: number;
  totalEconomicValue: number;
  measuredAt: Date;
}

// ============================================
// SYSTEM 45: ANTI-CAPTURE SAFEGUARDS
// ============================================

export type AntiCaptureViolationType =
  | "monopoly_attempt"
  | "lock_in_pattern"
  | "history_rewrite"
  | "suppression"
  | "unauthorized_deletion";

export interface AntiCaptureAlert {
  id: string;
  violationType: AntiCaptureViolationType;
  description: string;
  actorId: string;
  affectedObjectIds: string[];
  severity: "low" | "medium" | "high" | "critical";
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

export interface TransparencyRecord {
  id: string;
  objectId: string;
  action: string;
  performedBy: string;
  performedAt: Date;
  rationale: string;
  witnesses: string[]; // Other validators who saw this
  immutableHash: string;
}

export interface MultiInstitutionAnchor {
  id: string;
  knowledgeObjectId: string;
  anchoringInstitutions: Array<{
    institutionId: string;
    anchoredAt: Date;
    endorsementLevel: "witnessed" | "endorsed" | "certified";
  }>;
  consensusStrength: number;
  disputeCount: number;
}

// ============================================
// AGGREGATE TYPES
// ============================================

export interface KnowledgeCivilizationStats {
  totalKnowledgeObjects: number;
  validatedObjects: number;
  contestedObjects: number;
  failureRecords: number;
  activeVaults: number;
  legacyDesignations: number;
  graphNodes: number;
  graphEdges: number;
  aiSyntheses: number;
  antiCaptureAlerts: number;
}
