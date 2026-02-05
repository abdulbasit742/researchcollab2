// ============================================
// CRISIS COORDINATION TYPES
// Systems 55-62: Civilization-Scale Coordination
// ============================================

// System 55: Collective Mobilization Engine
export type MobilizationPurpose = 
  | "task_force"
  | "expert_panel"
  | "response_team"
  | "advisory_council"
  | "emergency_unit";

export interface MobilizationCriteria {
  requiredCapabilities: string[];
  minTrustScore: number;
  minReadinessLevel: number;
  maxResponseTime: number; // hours
  preferredTimezones?: string[];
  excludedConflicts?: string[];
}

export interface MobilizationCandidate {
  userId: string;
  userName: string;
  matchScore: number;
  capabilityMatch: number;
  trustScore: number;
  readinessLevel: number;
  availabilityStatus: "immediate" | "within_hours" | "within_day" | "unavailable";
  currentCommitments: number;
  lastMobilization?: string;
}

export interface MobilizedUnit {
  id: string;
  purpose: MobilizationPurpose;
  name: string;
  description: string;
  activatedAt: string;
  activatedBy: string;
  members: MobilizationCandidate[];
  objectives: string[];
  expectedDuration: number; // hours
  actualDuration?: number;
  status: "forming" | "active" | "completing" | "disbanded";
  disbandedAt?: string;
  outcomesSummary?: string;
}

// System 56: Crisis Mode
export type CrisisLevel = "advisory" | "elevated" | "critical" | "emergency";

export interface CrisisMode {
  id: string;
  name: string;
  level: CrisisLevel;
  scope: "global" | "regional" | "institutional" | "domain";
  scopeIdentifier?: string;
  activatedAt: string;
  activatedBy: string;
  expiresAt: string;
  reason: string;
  uiOverrides: CrisisUIOverrides;
  auditLog: CrisisAuditEntry[];
  isActive: boolean;
  deactivatedAt?: string;
  deactivatedBy?: string;
  deactivationReason?: string;
}

export interface CrisisUIOverrides {
  hideNonEssentialFeatures: boolean;
  elevateCoordinationTools: boolean;
  showCrisisBanner: boolean;
  bannerMessage?: string;
  prioritizedRoutes: string[];
  reducedAnimations: boolean;
  emergencyContactsVisible: boolean;
}

export interface CrisisAuditEntry {
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
}

// System 57: Real-Time Coordination Graph
export type CoordinationNodeType = "person" | "task" | "resource" | "milestone" | "decision";
export type CoordinationEdgeType = "assigned_to" | "depends_on" | "blocks" | "informs" | "requires";

export interface CoordinationNode {
  id: string;
  type: CoordinationNodeType;
  label: string;
  status: "pending" | "active" | "completed" | "blocked" | "at_risk";
  priority: "low" | "medium" | "high" | "critical";
  assignees?: string[];
  progress?: number;
  deadline?: string;
  metadata: Record<string, unknown>;
}

export interface CoordinationEdge {
  id: string;
  source: string;
  target: string;
  type: CoordinationEdgeType;
  weight?: number;
  metadata?: Record<string, unknown>;
}

export interface CoordinationGraph {
  missionId: string;
  missionName: string;
  nodes: CoordinationNode[];
  edges: CoordinationEdge[];
  bottlenecks: Bottleneck[];
  overallProgress: number;
  criticalPath: string[];
  lastUpdated: string;
}

export interface Bottleneck {
  nodeId: string;
  severity: "low" | "medium" | "high" | "critical";
  reason: string;
  suggestedActions: string[];
  affectedDownstream: string[];
}

// System 58: Decision Traceability Engine
export interface TracedDecision {
  id: string;
  missionId?: string;
  title: string;
  context: string;
  options: DecisionOption[];
  selectedOption: string;
  rationale: string;
  participants: DecisionParticipant[];
  madeAt: string;
  madeBy: string;
  impactLevel: "minor" | "moderate" | "major" | "critical";
  outcomes: DecisionOutcome[];
  linkedDecisions: string[];
  tags: string[];
}

export interface DecisionOption {
  id: string;
  description: string;
  pros: string[];
  cons: string[];
  riskLevel: "low" | "medium" | "high";
  wasSelected: boolean;
}

export interface DecisionParticipant {
  userId: string;
  role: "proposer" | "advisor" | "approver" | "observer";
  vote?: "approve" | "reject" | "abstain";
  feedback?: string;
}

export interface DecisionOutcome {
  id: string;
  description: string;
  measuredAt: string;
  wasSuccessful: boolean;
  lessonsLearned: string;
}

// System 59: Resource & Capability Allocation
export type AllocatableResource = "expertise" | "funding" | "knowledge" | "equipment" | "infrastructure";

export interface AllocationRequest {
  id: string;
  requestedBy: string;
  missionId?: string;
  resourceType: AllocatableResource;
  description: string;
  urgency: "standard" | "urgent" | "critical" | "emergency";
  quantity?: number;
  capabilitiesNeeded?: string[];
  justification: string;
  requestedAt: string;
  status: "pending" | "approved" | "partial" | "denied" | "fulfilled";
  allocations: ResourceAllocation[];
}

export interface ResourceAllocation {
  id: string;
  requestId: string;
  resourceId: string;
  resourceName: string;
  allocatedBy: string;
  allocatedAt: string;
  amount?: number;
  startDate: string;
  endDate?: string;
  utilizationRate?: number;
  status: "allocated" | "in_use" | "released" | "recalled";
}

export interface AllocationConstraints {
  maxConcurrentAllocations: number;
  burnoutPrevention: boolean;
  fairnessEnforced: boolean;
  priorityOverride: boolean;
}

// System 60: Post-Crisis Learning
export interface PostCrisisReview {
  id: string;
  missionId: string;
  missionName: string;
  conductedAt: string;
  facilitatedBy: string;
  participants: string[];
  whatWorked: LearningItem[];
  whatFailed: LearningItem[];
  recommendations: Recommendation[];
  playbookUpdates: PlaybookUpdate[];
  readinessAdjustments: ReadinessAdjustment[];
  status: "in_progress" | "completed" | "archived";
}

export interface LearningItem {
  id: string;
  category: string;
  description: string;
  impact: "low" | "medium" | "high";
  contributors: string[];
  evidence: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  assignedTo?: string;
  targetDate?: string;
  status: "proposed" | "accepted" | "in_progress" | "implemented" | "rejected";
  implementedAt?: string;
}

export interface PlaybookUpdate {
  playbookId: string;
  playbookName: string;
  changeType: "add" | "modify" | "remove";
  section: string;
  description: string;
  approvedBy?: string;
  appliedAt?: string;
}

export interface ReadinessAdjustment {
  targetType: "individual" | "team" | "institution";
  targetId: string;
  previousLevel: number;
  newLevel: number;
  reason: string;
}

// System 61: Ethical & Power Safeguards
export interface PowerSafeguard {
  id: string;
  safeguardType: "time_limit" | "scope_limit" | "review_required" | "auto_sunset" | "escalation_cap";
  description: string;
  isActive: boolean;
  parameters: Record<string, unknown>;
  violationCount: number;
  lastViolation?: string;
}

export interface OverrideLog {
  id: string;
  overrideType: string;
  grantedTo: string;
  grantedBy: string;
  reason: string;
  scope: string;
  grantedAt: string;
  expiresAt: string;
  autoSunset: boolean;
  wasReviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewOutcome?: "upheld" | "revoked" | "modified";
}

export interface SurveillanceCheck {
  id: string;
  checkType: "data_access" | "tracking_scope" | "retention_period" | "purpose_limitation";
  entityChecked: string;
  checkedAt: string;
  result: "compliant" | "warning" | "violation";
  details: string;
  remediation?: string;
}

// System 62: Global Coordination Interoperability
export interface CoordinationPartner {
  id: string;
  name: string;
  type: "country" | "ngo" | "academic" | "government" | "industry";
  region: string;
  capabilities: string[];
  dataPolicy: DataSharingPolicy;
  joinedAt: string;
  status: "active" | "pending" | "suspended";
  trustLevel: number;
}

export interface DataSharingPolicy {
  allowsDataExport: boolean;
  allowsDataImport: boolean;
  requiresAnonymization: boolean;
  retentionLimitDays?: number;
  approvedDataTypes: string[];
  restrictedDataTypes: string[];
  governanceRequirements: string[];
}

export interface CrossBorderMission {
  id: string;
  name: string;
  description: string;
  initiatedBy: string;
  partners: CoordinationPartner[];
  objectives: string[];
  status: "proposed" | "negotiating" | "active" | "completed" | "terminated";
  dataAgreements: DataAgreement[];
  createdAt: string;
  completedAt?: string;
}

export interface DataAgreement {
  id: string;
  partnerId: string;
  dataTypes: string[];
  purpose: string;
  startDate: string;
  endDate?: string;
  anonymizationLevel: "none" | "partial" | "full";
  auditRights: boolean;
  terminationClause: string;
  signedAt: string;
  signedBy: string[];
}
