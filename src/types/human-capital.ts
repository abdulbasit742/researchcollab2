// ============================================
// HUMAN CAPITAL OS TYPES
// Systems 46-54: Civilization-Scale Workforce Layer
// ============================================

// ============================================
// SYSTEM 46: CAPABILITY GRAPH
// ============================================

export type CapabilityCategory =
  | "technical_skill"
  | "applied_competence"
  | "contextual_mastery"
  | "decision_quality"
  | "execution_reliability"
  | "leadership_readiness";

export type ProofType =
  | "outcome_verified"
  | "peer_endorsed"
  | "institution_certified"
  | "project_demonstrated"
  | "assessment_passed";

export interface CapabilityProof {
  proofType: ProofType;
  sourceId: string;
  sourceType: string;
  verifiedAt: Date;
  strength: number; // 0-100
  context: string;
}

export interface Capability {
  id: string;
  userId: string;
  name: string;
  category: CapabilityCategory;
  domain: string;
  
  // Proven, not self-declared
  proofs: CapabilityProof[];
  proofCount: number;
  strongestProof: ProofType | null;
  
  // Context-dependent
  contexts: CapabilityContext[];
  primaryContext: string | null;
  
  // Time-evolving
  firstDemonstrated: Date;
  lastDemonstrated: Date;
  growthTrajectory: "emerging" | "developing" | "established" | "mastery" | "declining";
  
  // Computed scores
  overallStrength: number; // 0-100
  consistencyScore: number; // 0-100
  depthScore: number; // 0-100
}

export interface CapabilityContext {
  context: string;
  strength: number;
  outcomeCount: number;
  lastApplied: Date;
}

export interface CapabilityNode {
  capability: Capability;
  connections: CapabilityEdge[];
  clusterId: string | null;
}

export interface CapabilityEdge {
  fromCapabilityId: string;
  toCapabilityId: string;
  relationship: "enables" | "requires" | "complements" | "synergizes";
  strength: number;
}

// ============================================
// SYSTEM 47: READINESS & RESPONSIBILITY
// ============================================

export type ResponsibilityLevel =
  | "individual_execution"
  | "team_leadership"
  | "project_ownership"
  | "institutional_responsibility"
  | "policy_influence";

export interface ReadinessScore {
  level: ResponsibilityLevel;
  readinessRange: [number, number]; // Min-max range, not single score
  confidence: number;
  factors: ReadinessFactor[];
  contexts: string[];
  explanation: string;
}

export interface ReadinessFactor {
  factor: string;
  contribution: number; // Can be negative
  source: "outcomes" | "failure_handling" | "trust_consistency" | "peer_signals" | "institutional_signals";
  evidence: string;
}

export interface ReadinessProfile {
  userId: string;
  computedAt: Date;
  scores: ReadinessScore[];
  overallTrajectory: "ascending" | "stable" | "transitioning" | "recovering";
  nextLevelRequirements: NextLevelRequirement[];
  blockers: ReadinessBlocker[];
}

export interface NextLevelRequirement {
  level: ResponsibilityLevel;
  requirements: string[];
  estimatedTimeToReady: string;
  suggestedActions: string[];
}

export interface ReadinessBlocker {
  blocker: string;
  severity: "minor" | "moderate" | "significant";
  remediation: string;
}

// ============================================
// SYSTEM 48: TALENT ALLOCATION
// ============================================

export interface AllocationRequest {
  id: string;
  requesterId: string;
  requesterType: "team" | "institution" | "government" | "crisis_response";
  
  // What's needed
  requiredCapabilities: CapabilityRequirement[];
  responsibilityLevel: ResponsibilityLevel;
  riskTolerance: "low" | "medium" | "high";
  
  // Constraints
  maxCandidates: number;
  urgency: "standard" | "urgent" | "critical";
  duration: string;
  
  // Context
  projectContext: string;
  teamContext: string;
}

export interface CapabilityRequirement {
  capability: string;
  minimumStrength: number;
  preferredContext: string | null;
  isRequired: boolean;
}

export interface AllocationCandidate {
  userId: string;
  matchScore: number;
  capabilityMatch: CapabilityMatchDetail[];
  readinessMatch: number;
  riskAssessment: AllocationRisk;
  availabilityStatus: "available" | "partial" | "overloaded";
  recommendation: "strong" | "suitable" | "stretch" | "risk";
}

export interface CapabilityMatchDetail {
  requirement: string;
  candidateStrength: number;
  gap: number;
  contextMatch: boolean;
}

export interface AllocationRisk {
  overallRisk: "low" | "medium" | "high";
  factors: RiskFactor[];
  mitigations: string[];
}

export interface RiskFactor {
  factor: string;
  severity: number;
  explanation: string;
}

export interface AllocationResult {
  requestId: string;
  candidates: AllocationCandidate[];
  warnings: string[];
  alternativeSuggestions: string[];
}

// ============================================
// SYSTEM 49: SKILL GAP & RESKILLING
// ============================================

export type GapLevel = "individual" | "team" | "institution" | "national";

export interface SkillGap {
  id: string;
  level: GapLevel;
  entityId: string;
  capability: string;
  currentStrength: number;
  requiredStrength: number;
  gapSeverity: "minor" | "moderate" | "critical";
  detectedAt: Date;
  trend: "widening" | "stable" | "narrowing";
}

export interface GapAnalysis {
  level: GapLevel;
  entityId: string;
  gaps: SkillGap[];
  criticalGaps: SkillGap[];
  emergingRisks: EmergingRisk[];
  recommendations: GapRecommendation[];
}

export interface EmergingRisk {
  capability: string;
  projectedGapIn: string;
  confidence: number;
  drivers: string[];
}

export interface GapRecommendation {
  type: "learning_path" | "mentorship" | "rotation" | "institutional_intervention" | "hiring";
  priority: "high" | "medium" | "low";
  description: string;
  estimatedImpact: number;
  estimatedTime: string;
  resources: string[];
}

export interface ReskillingPath {
  userId: string;
  targetCapability: string;
  currentLevel: number;
  targetLevel: number;
  steps: ReskillingStep[];
  estimatedDuration: string;
  mentorRecommendations: string[];
}

export interface ReskillingStep {
  order: number;
  type: "learning" | "practice" | "project" | "assessment" | "mentorship";
  description: string;
  resources: string[];
  estimatedTime: string;
  completionCriteria: string;
}

// ============================================
// SYSTEM 50: PERFORMANCE WITHOUT SURVEILLANCE
// ============================================

export interface PerformanceProfile {
  userId: string;
  computedAt: Date;
  
  // Outcome-based metrics only
  outcomeMetrics: OutcomeMetrics;
  reliabilityMetrics: ReliabilityMetrics;
  recoveryMetrics: RecoveryMetrics;
  collaborationMetrics: CollaborationMetrics;
  
  // Aggregate score
  overallPerformance: number; // 0-100
  performanceTrend: "improving" | "stable" | "declining";
  
  // What we explicitly DON'T track
  excludedMetrics: string[];
}

export interface OutcomeMetrics {
  completedOutcomes: number;
  successRate: number;
  impactScore: number;
  qualityConsistency: number;
}

export interface ReliabilityMetrics {
  onTimeDelivery: number;
  commitmentHonoring: number;
  responsiveness: number; // Based on outcome timing, not message speed
  predictability: number;
}

export interface RecoveryMetrics {
  failureCount: number;
  recoveryRate: number;
  avgRecoveryTime: string;
  learningDemonstrated: number;
}

export interface CollaborationMetrics {
  teamOutcomes: number;
  peerEndorsements: number;
  mentorshipImpact: number;
  conflictResolution: number;
}

// ============================================
// SYSTEM 51: INSTITUTIONAL TALENT STRATEGY
// ============================================

export interface TalentStrategyDashboard {
  institutionId: string;
  generatedAt: Date;
  
  capabilityDistribution: CapabilityDistribution;
  readinessHeatmap: ReadinessHeatmap;
  successionRisks: SuccessionRisk[];
  talentBottlenecks: TalentBottleneck[];
  workforceProjections: WorkforceProjection[];
  
  // Governance controls
  accessLevel: "full" | "aggregated" | "anonymized";
  dataScope: string;
}

export interface CapabilityDistribution {
  byCategory: Record<CapabilityCategory, number>;
  byStrength: Record<string, number>; // emerging, developing, etc.
  gaps: string[];
  surpluses: string[];
}

export interface ReadinessHeatmap {
  byLevel: Record<ResponsibilityLevel, ReadinessDistribution>;
  criticalRoles: CriticalRole[];
}

export interface ReadinessDistribution {
  ready: number;
  developing: number;
  notReady: number;
  avgTimeToReady: string;
}

export interface CriticalRole {
  role: string;
  currentFilled: number;
  required: number;
  successorCount: number;
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface SuccessionRisk {
  role: string;
  currentHolder: string | null; // Anonymized ID
  riskLevel: "low" | "medium" | "high" | "critical";
  successorReadiness: number;
  timeToRisk: string;
  mitigationOptions: string[];
}

export interface TalentBottleneck {
  capability: string;
  demand: number;
  supply: number;
  bottleneckSeverity: number;
  impact: string;
  resolution: string;
}

export interface WorkforceProjection {
  timeframe: string;
  scenario: "baseline" | "growth" | "contraction";
  projectedCapabilities: Record<string, number>;
  projectedGaps: string[];
  recommendedActions: string[];
}

// ============================================
// SYSTEM 52: CAREER EVOLUTION & TRANSITION
// ============================================

export type CareerPhase =
  | "early_career"
  | "growth"
  | "peak"
  | "transition"
  | "late_career"
  | "post_retirement";

export interface CareerEvolutionProfile {
  userId: string;
  currentPhase: CareerPhase;
  trajectory: CareerTrajectory;
  pivotHistory: CareerPivot[];
  transitionReadiness: TransitionReadiness;
  mentorshipProfile: MentorshipProfile;
}

export interface CareerTrajectory {
  direction: "ascending" | "lateral" | "pivoting" | "winding_down";
  velocity: "rapid" | "steady" | "slow" | "paused";
  projectedPhases: ProjectedPhase[];
}

export interface ProjectedPhase {
  phase: CareerPhase;
  estimatedStart: string;
  likelyFocus: string[];
  preparationNeeded: string[];
}

export interface CareerPivot {
  id: string;
  fromDomain: string;
  toDomain: string;
  pivotedAt: Date;
  success: "successful" | "partial" | "ongoing";
  transferredCapabilities: string[];
  newCapabilities: string[];
  lessonsLearned: string[];
}

export interface TransitionReadiness {
  readyForPivot: boolean;
  pivotOptions: PivotOption[];
  blockers: string[];
  supportNeeded: string[];
}

export interface PivotOption {
  targetDomain: string;
  feasibility: number;
  capabilityTransferRate: number;
  estimatedTransitionTime: string;
  suggestedPath: string[];
}

export interface MentorshipProfile {
  canMentor: string[];
  seeksMentorshipIn: string[];
  mentorshipStyle: string;
  availability: "active" | "limited" | "unavailable";
  impactScore: number;
}

// ============================================
// SYSTEM 53: FAIRNESS, BIAS & ACCESS
// ============================================

export interface FairnessAudit {
  auditId: string;
  auditedAt: Date;
  scope: "opportunity_allocation" | "trust_propagation" | "visibility" | "institutional_access";
  
  findings: FairnessFinding[];
  biasIndicators: BiasIndicator[];
  recommendations: FairnessRecommendation[];
  
  overallScore: number; // 0-100
  trend: "improving" | "stable" | "concerning";
}

export interface FairnessFinding {
  finding: string;
  severity: "info" | "warning" | "concern" | "critical";
  affectedDimension: string;
  evidence: string;
  suggestedAction: string;
}

export interface BiasIndicator {
  dimension: string; // e.g., "institution_type", "career_phase", "domain"
  observedDisparity: number;
  expectedBaseline: number;
  significance: "low" | "medium" | "high";
  explanation: string;
}

export interface FairnessRecommendation {
  recommendation: string;
  priority: "high" | "medium" | "low";
  implementationType: "automatic" | "review_required" | "policy_change";
  expectedImpact: string;
}

export interface AccessEqualization {
  userId: string;
  currentAccessLevel: number;
  fairAccessLevel: number;
  adjustments: AccessAdjustment[];
  appliedAt: Date | null;
}

export interface AccessAdjustment {
  dimension: string;
  adjustment: number;
  reason: string;
}

// ============================================
// SYSTEM 54: NATIONAL & GLOBAL VIEWS
// ============================================

export interface NationalHumanCapitalView {
  countryCode: string;
  generatedAt: Date;
  aggregationLevel: "national" | "regional" | "sector";
  
  workforceTrends: WorkforceTrend[];
  strategicShortages: StrategicShortage[];
  educationAlignment: EducationAlignment;
  crisisReadiness: CrisisReadiness;
  
  // Privacy guarantees
  minimumAggregation: number;
  identifiabilityRisk: "none" | "minimal";
}

export interface WorkforceTrend {
  capability: string;
  currentLevel: number;
  trend: "growing" | "stable" | "declining";
  projectedChange: number;
  drivers: string[];
}

export interface StrategicShortage {
  capability: string;
  severityLevel: "emerging" | "moderate" | "critical";
  affectedSectors: string[];
  projectedImpact: string;
  recommendedInterventions: string[];
}

export interface EducationAlignment {
  overallScore: number;
  gaps: EducationGap[];
  surpluses: EducationSurplus[];
  recommendations: string[];
}

export interface EducationGap {
  capability: string;
  industryDemand: number;
  educationSupply: number;
  gapSeverity: number;
}

export interface EducationSurplus {
  capability: string;
  educationSupply: number;
  industryDemand: number;
  underutilization: number;
}

export interface CrisisReadiness {
  overallScore: number;
  criticalCapabilities: CriticalCapability[];
  vulnerabilities: string[];
  strengthenedAreas: string[];
}

export interface CriticalCapability {
  capability: string;
  availableNow: number;
  requiredForCrisis: number;
  readinessLevel: "ready" | "partial" | "insufficient";
  mobilizationTime: string;
}
