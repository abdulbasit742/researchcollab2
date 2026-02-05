/**
 * Economic Engine Types
 * Systems 29-36: Value Units, Pricing, Revenue Sharing, Incentives, Safety
 */

// ============================================
// SYSTEM 29: VALUE UNITS & CONTRIBUTION ACCOUNTING
// ============================================

export type ContributionCategory =
  | "verified_outcome"
  | "high_quality_collaboration"
  | "knowledge_contribution"
  | "mentorship_impact"
  | "institutional_value"
  | "peer_validation"
  | "community_stewardship";

export interface ValueUnitSource {
  category: ContributionCategory;
  entityId: string;
  entityType: string;
  amount: number;
  multiplier: number;
  earnedAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface ValueUnitBalance {
  userId: string;
  totalAccumulated: number;
  currentBalance: number;
  decayedAmount: number;
  lastContributionAt: Date;
  categoryBreakdown: Record<ContributionCategory, number>;
  tier: ValueUnitTier;
  nextTierThreshold: number;
  percentToNextTier: number;
}

export type ValueUnitTier = "emerging" | "established" | "trusted" | "distinguished" | "exemplary";

export interface ValueUnitDecayConfig {
  baseDecayRate: number; // % per month of inactivity
  gracePeriodDays: number;
  minimumBalance: number; // Floor - never decays below this
  categoryDecayRates: Partial<Record<ContributionCategory, number>>;
}

// ============================================
// SYSTEM 30: FAIR VALUE EXCHANGE & PRICING ENGINE
// ============================================

export interface PricingContext {
  userId: string;
  trustScore: number;
  valueUnitBalance: number;
  outcomeSuccessRate: number;
  marketDemand: MarketDemandLevel;
  skillCategory: string;
  projectComplexity: ProjectComplexity;
  timeCommitment: TimeCommitment;
  riskProfile: RiskProfile;
}

export type MarketDemandLevel = "low" | "moderate" | "high" | "critical";
export type ProjectComplexity = "simple" | "moderate" | "complex" | "expert";
export type TimeCommitment = "hours" | "days" | "weeks" | "months" | "ongoing";
export type RiskProfile = "minimal" | "standard" | "elevated" | "high";

export interface PricingGuidance {
  suggestedRange: {
    min: number;
    optimal: number;
    max: number;
  };
  currency: string;
  successProbability: {
    atMin: number;
    atOptimal: number;
    atMax: number;
  };
  marketSaturation: number; // 0-100
  saturationWarning?: string;
  factors: PricingFactor[];
  explanation: string;
}

export interface PricingFactor {
  name: string;
  impact: "positive" | "neutral" | "negative";
  weight: number;
  description: string;
}

// ============================================
// SYSTEM 31: REVENUE SHARING & SUCCESS FEES
// ============================================

export type RevenueModelType =
  | "fixed_price"
  | "success_fee"
  | "revenue_share"
  | "milestone_bonus"
  | "institutional_sponsorship"
  | "hybrid";

export interface RevenueShareContract {
  id: string;
  type: RevenueModelType;
  parties: ContractParty[];
  terms: RevenueTerms;
  status: ContractStatus;
  createdAt: Date;
  activatedAt?: Date;
  completedAt?: Date;
  totalValue: number;
  distributedValue: number;
  pendingValue: number;
}

export interface ContractParty {
  userId: string;
  role: "provider" | "client" | "platform" | "institution" | "sponsor";
  sharePercentage: number;
  fixedAmount?: number;
  conditions?: ShareCondition[];
}

export interface ShareCondition {
  type: "milestone_complete" | "outcome_verified" | "time_elapsed" | "metric_achieved";
  target: string;
  threshold?: number;
  met: boolean;
  metAt?: Date;
}

export interface RevenueTerms {
  baseFee: number;
  successFeePercentage?: number;
  revenueSharePercentage?: number;
  milestoneBonuses?: MilestoneBonus[];
  clawbackConditions?: ClawbackCondition[];
  vestingPeriodDays?: number;
  payoutSchedule: PayoutSchedule;
}

export interface MilestoneBonus {
  milestoneId: string;
  bonusAmount: number;
  bonusPercentage?: number;
  conditions: string[];
}

export interface ClawbackCondition {
  trigger: string;
  percentage: number;
  windowDays: number;
}

export type PayoutSchedule = "immediate" | "weekly" | "monthly" | "on_completion" | "vested";
export type ContractStatus = "draft" | "pending" | "active" | "completed" | "disputed" | "cancelled";

export interface ContractSimulation {
  contract: RevenueShareContract;
  scenarios: SimulationScenario[];
  riskAssessment: ContractRiskAssessment;
}

export interface SimulationScenario {
  name: string;
  probability: number;
  outcomes: {
    partyId: string;
    netValue: number;
    timeline: string;
  }[];
}

export interface ContractRiskAssessment {
  overallRisk: "low" | "moderate" | "high";
  factors: {
    factor: string;
    risk: "low" | "moderate" | "high";
    mitigation?: string;
  }[];
}

// ============================================
// SYSTEM 32: INCENTIVE ALIGNMENT ENGINE
// ============================================

export type StakeholderType = "individual" | "team" | "institution" | "platform";

export interface IncentiveRule {
  id: string;
  name: string;
  description: string;
  stakeholderType: StakeholderType;
  trigger: IncentiveTrigger;
  reward: IncentiveReward;
  penalty?: IncentivePenalty;
  isActive: boolean;
  priority: number;
}

export interface IncentiveTrigger {
  event: string;
  conditions: TriggerCondition[];
  cooldownHours?: number;
}

export interface TriggerCondition {
  metric: string;
  operator: "gt" | "lt" | "eq" | "gte" | "lte" | "between";
  value: number | [number, number];
}

export interface IncentiveReward {
  type: "fee_reduction" | "visibility_boost" | "priority_access" | "value_units" | "badge";
  amount?: number;
  percentage?: number;
  durationDays?: number;
  description: string;
}

export interface IncentivePenalty {
  type: "fee_increase" | "visibility_reduction" | "access_restriction" | "cooldown";
  amount?: number;
  percentage?: number;
  durationDays?: number;
  description: string;
}

export interface IncentiveAlignmentScore {
  userId: string;
  overallAlignment: number; // 0-100
  stakeholderScores: Record<StakeholderType, number>;
  activeRewards: ActiveIncentive[];
  activePenalties: ActiveIncentive[];
  recommendations: IncentiveRecommendation[];
}

export interface ActiveIncentive {
  ruleId: string;
  ruleName: string;
  type: "reward" | "penalty";
  appliedAt: Date;
  expiresAt?: Date;
  impact: string;
}

export interface IncentiveRecommendation {
  action: string;
  potentialReward: string;
  difficulty: "easy" | "moderate" | "challenging";
  timeframe: string;
}

// ============================================
// SYSTEM 33: COST TRANSPARENCY & VALUE EXPLANATION
// ============================================

export interface CostBreakdown {
  totalCost: number;
  currency: string;
  components: CostComponent[];
  valueExplanation: ValueExplanation;
  comparisonToMarket?: MarketComparison;
}

export interface CostComponent {
  name: string;
  amount: number;
  percentage: number;
  recipient: string;
  purpose: string;
  ecosystemBenefit: string;
}

export interface ValueExplanation {
  whatThisEnables: string[];
  whoBenefits: BeneficiaryImpact[];
  ecosystemImpact: string;
  trustContribution: number;
}

export interface BeneficiaryImpact {
  beneficiary: string;
  impact: string;
  percentage: number;
}

export interface MarketComparison {
  marketAverage: number;
  ourCost: number;
  savings: number;
  savingsPercentage: number;
  differentiators: string[];
}

// ============================================
// SYSTEM 34: INSTITUTIONAL FUNDING FLOWS
// ============================================

export interface InstitutionalBudget {
  institutionId: string;
  fiscalYear: string;
  totalAllocated: number;
  totalSpent: number;
  totalCommitted: number;
  available: number;
  allocations: BudgetAllocation[];
  roi: InstitutionalROI;
}

export interface BudgetAllocation {
  id: string;
  name: string;
  type: "opportunity_funding" | "learning_sponsorship" | "research_pool" | "collaboration_fund";
  amount: number;
  spent: number;
  committed: number;
  outcomes: AllocationOutcome[];
  startDate: Date;
  endDate?: Date;
  status: "active" | "depleted" | "paused" | "completed";
}

export interface AllocationOutcome {
  outcomeId: string;
  type: string;
  value: number;
  verifiedAt?: Date;
  impactScore: number;
}

export interface InstitutionalROI {
  totalInvested: number;
  measuredReturn: number;
  roiPercentage: number;
  outcomesAchieved: number;
  avgCostPerOutcome: number;
  comparedToMarket: number; // percentage better/worse
  breakdown: ROIBreakdown[];
}

export interface ROIBreakdown {
  category: string;
  invested: number;
  returned: number;
  roi: number;
  topPerformers: string[];
}

export interface FundingFlow {
  id: string;
  sourceId: string;
  sourceType: "institution" | "sponsor" | "grant" | "platform";
  destinationId: string;
  destinationType: "user" | "project" | "pool" | "escrow";
  amount: number;
  purpose: string;
  conditions: FundingCondition[];
  status: "pending" | "active" | "released" | "returned";
  createdAt: Date;
  releasedAt?: Date;
  auditTrail: AuditEntry[];
}

export interface FundingCondition {
  type: "milestone" | "outcome" | "time" | "approval";
  description: string;
  met: boolean;
  metAt?: Date;
}

export interface AuditEntry {
  action: string;
  actor: string;
  timestamp: Date;
  details: string;
}

// ============================================
// SYSTEM 35: ECONOMIC SAFETY & ABUSE DAMPENING
// ============================================

export interface EconomicSafetyProfile {
  userId: string;
  riskScore: number; // 0-100, higher = more risk
  riskLevel: "low" | "moderate" | "elevated" | "high";
  flags: SafetyFlag[];
  cooldowns: ActiveCooldown[];
  throttles: ActiveThrottle[];
  verificationLevel: VerificationLevel;
  manualReviewRequired: boolean;
}

export interface SafetyFlag {
  type: SafetyFlagType;
  severity: "warning" | "moderate" | "severe";
  detectedAt: Date;
  expiresAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  details: string;
}

export type SafetyFlagType =
  | "fee_arbitrage_attempt"
  | "low_effort_farming"
  | "payment_manipulation"
  | "trust_gaming"
  | "rapid_transaction_pattern"
  | "circular_value_transfer"
  | "suspicious_pricing";

export interface ActiveCooldown {
  action: string;
  reason: string;
  startedAt: Date;
  endsAt: Date;
  remainingSeconds: number;
}

export interface ActiveThrottle {
  resource: string;
  limit: number;
  used: number;
  resetsAt: Date;
  reason: string;
}

export type VerificationLevel = "none" | "basic" | "standard" | "enhanced" | "institutional";

export interface EconomicAbusePattern {
  patternId: string;
  name: string;
  description: string;
  detectionRules: DetectionRule[];
  response: AbuseResponse;
}

export interface DetectionRule {
  metric: string;
  window: string;
  threshold: number;
  operator: "gt" | "lt" | "anomaly";
}

export interface AbuseResponse {
  immediate: string[];
  escalation?: string[];
  recovery?: string[];
}

// ============================================
// SYSTEM 36: LONG-TERM ECONOMIC MEMORY
// ============================================

export interface EconomicTrajectory {
  userId: string;
  lifetimeMetrics: LifetimeEconomicMetrics;
  periodMetrics: PeriodMetrics[];
  stabilityScore: number;
  recoveryHistory: RecoveryEvent[];
  projections: EconomicProjection[];
}

export interface LifetimeEconomicMetrics {
  totalEarnings: number;
  totalSpent: number;
  netValue: number;
  outcomesDelivered: number;
  avgEarningsPerOutcome: number;
  peakMonthlyEarnings: number;
  consistencyScore: number;
  firstTransactionAt: Date;
  monthsActive: number;
}

export interface PeriodMetrics {
  period: string; // "2024-Q1", "2024-01", etc.
  earnings: number;
  outcomes: number;
  trustChange: number;
  valueUnitsEarned: number;
  growthRate: number;
}

export interface RecoveryEvent {
  type: "dispute" | "failure" | "inactivity" | "penalty";
  occurredAt: Date;
  recoveredAt?: Date;
  recoveryDays?: number;
  impactAmount: number;
  recoveryPath: string[];
}

export interface EconomicProjection {
  scenario: "conservative" | "moderate" | "optimistic";
  timeframe: string;
  projectedEarnings: number;
  projectedOutcomes: number;
  assumptions: string[];
  confidence: number;
}

export interface NationalEconomicInsights {
  country: string;
  aggregateMetrics: {
    totalPlatformValue: number;
    activeUsers: number;
    avgEarningsPerUser: number;
    topCategories: { category: string; value: number }[];
    growthRate: number;
  };
  anonymized: true;
  generatedAt: Date;
}

// ============================================
// PLATFORM FEE CONFIGURATION
// ============================================

export interface PlatformFeeConfig {
  baseFeePercentage: number;
  trustDiscounts: TrustDiscount[];
  volumeDiscounts: VolumeDiscount[];
  categoryAdjustments: CategoryAdjustment[];
  minimumFee: number;
  maximumFee: number;
}

export interface TrustDiscount {
  minTrustScore: number;
  discountPercentage: number;
}

export interface VolumeDiscount {
  minMonthlyVolume: number;
  discountPercentage: number;
}

export interface CategoryAdjustment {
  category: string;
  adjustmentPercentage: number;
  reason: string;
}

export interface CalculatedFee {
  grossAmount: number;
  baseFee: number;
  trustDiscount: number;
  volumeDiscount: number;
  categoryAdjustment: number;
  netFee: number;
  effectiveRate: number;
  breakdown: CostBreakdown;
}
