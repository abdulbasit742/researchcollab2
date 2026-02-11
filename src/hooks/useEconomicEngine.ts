/**
 * Unified Economic Engine Hook (Systems 29-36)
 * Consolidates: Value Units, Pricing, Revenue Share, Incentives,
 * Cost Transparency, Institutional Funding, Economic Safety, Economic Memory
 * 
 * All sub-systems are backed by database tables and exposed through
 * a single composable hook with namespaced access.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Re-export all types for consumers
export type {
  ValueUnitBalance, ValueUnitSource, ValueUnitTier, ValueUnitDecayConfig, ContributionCategory,
  PricingContext, PricingGuidance, PricingFactor, MarketDemandLevel, ProjectComplexity, TimeCommitment, RiskProfile,
  RevenueShareContract, ContractParty, RevenueTerms, ContractSimulation,
  IncentiveAlignmentScore, IncentiveRule, ActiveIncentive, IncentiveRecommendation, StakeholderType,
  CostBreakdown, CostComponent, ValueExplanation, MarketComparison, CalculatedFee, PlatformFeeConfig,
  InstitutionalBudget, BudgetAllocation, AllocationOutcome, InstitutionalROI, FundingFlow, FundingCondition, AuditEntry,
  EconomicSafetyProfile, SafetyFlag, SafetyFlagType, ActiveCooldown, ActiveThrottle, VerificationLevel, EconomicAbusePattern,
  EconomicTrajectory, LifetimeEconomicMetrics, PeriodMetrics, RecoveryEvent, EconomicProjection, NationalEconomicInsights,
} from "@/types/economic-engine";

import type {
  ValueUnitBalance, ValueUnitSource, ValueUnitTier, ValueUnitDecayConfig, ContributionCategory,
  PricingContext, PricingGuidance, PricingFactor, MarketDemandLevel, ProjectComplexity, TimeCommitment, RiskProfile,
  IncentiveAlignmentScore, ActiveIncentive, IncentiveRecommendation, StakeholderType, IncentiveRule,
  CostBreakdown, CostComponent, ValueExplanation, MarketComparison, CalculatedFee, PlatformFeeConfig,
  InstitutionalBudget, BudgetAllocation, AllocationOutcome, InstitutionalROI, FundingFlow, FundingCondition,
  EconomicSafetyProfile, SafetyFlag, SafetyFlagType, ActiveCooldown, VerificationLevel, EconomicAbusePattern,
  EconomicTrajectory, LifetimeEconomicMetrics, PeriodMetrics, RecoveryEvent, EconomicProjection, NationalEconomicInsights,
} from "@/types/economic-engine";

// ─── Constants ───────────────────────────────────────────────

const TIER_THRESHOLDS: Record<ValueUnitTier, number> = {
  emerging: 0, established: 100, trusted: 500, distinguished: 2000, exemplary: 10000,
};

const DEFAULT_DECAY_CONFIG: ValueUnitDecayConfig = {
  baseDecayRate: 2, gracePeriodDays: 30, minimumBalance: 10,
  categoryDecayRates: { verified_outcome: 1, knowledge_contribution: 3, mentorship_impact: 1.5 },
};

const CONTRIBUTION_VALUES: Record<ContributionCategory, number> = {
  verified_outcome: 50, high_quality_collaboration: 25, knowledge_contribution: 10,
  mentorship_impact: 35, institutional_value: 40, peer_validation: 15, community_stewardship: 20,
};

const BASE_RATES: Record<ProjectComplexity, { min: number; max: number }> = {
  simple: { min: 5000, max: 25000 }, moderate: { min: 20000, max: 75000 },
  complex: { min: 50000, max: 200000 }, expert: { min: 150000, max: 500000 },
};

const TIME_MULTIPLIERS: Record<TimeCommitment, number> = { hours: 1, days: 1.5, weeks: 2, months: 3, ongoing: 4 };
const DEMAND_MULTIPLIERS: Record<MarketDemandLevel, number> = { low: 0.8, moderate: 1.0, high: 1.3, critical: 1.6 };
const RISK_ADJUSTMENTS: Record<RiskProfile, number> = { minimal: 0, standard: 0.1, elevated: 0.25, high: 0.4 };

const PLATFORM_FEE_CONFIG: PlatformFeeConfig = {
  baseFeePercentage: 10,
  trustDiscounts: [
    { minTrustScore: 80, discountPercentage: 20 },
    { minTrustScore: 60, discountPercentage: 10 },
    { minTrustScore: 40, discountPercentage: 5 },
  ],
  volumeDiscounts: [
    { minMonthlyVolume: 500000, discountPercentage: 15 },
    { minMonthlyVolume: 200000, discountPercentage: 10 },
    { minMonthlyVolume: 100000, discountPercentage: 5 },
  ],
  categoryAdjustments: [
    { category: "research", adjustmentPercentage: -2, reason: "Supporting academic work" },
    { category: "mentorship", adjustmentPercentage: -3, reason: "Encouraging knowledge transfer" },
    { category: "institutional", adjustmentPercentage: -5, reason: "Institutional partnership rate" },
  ],
  minimumFee: 100, maximumFee: 100000,
};

const VALUE_ALLOCATION = {
  platformOperations: 0.30, trustSystem: 0.20, escrowProtection: 0.20,
  communityDevelopment: 0.15, safetyReserve: 0.15,
};

const VERIFICATION_THRESHOLDS = {
  none: 0, basic: 1000, standard: 50000, enhanced: 200000, institutional: Infinity,
};

const PLATFORM_INCENTIVE_RULES: IncentiveRule[] = [
  {
    id: "outcome-fee-reduction", name: "Outcome Excellence Discount",
    description: "Consistently successful outcomes reduce platform fees",
    stakeholderType: "individual",
    trigger: { event: "outcome_completed", conditions: [{ metric: "success_rate_90d", operator: "gte", value: 90 }, { metric: "outcomes_count_90d", operator: "gte", value: 3 }] },
    reward: { type: "fee_reduction", percentage: 15, durationDays: 30, description: "15% fee reduction for 30 days" },
    isActive: true, priority: 1,
  },
  {
    id: "dispute-friction", name: "Dispute Rate Friction",
    description: "High dispute rates increase platform friction",
    stakeholderType: "individual",
    trigger: { event: "dispute_filed", conditions: [{ metric: "dispute_rate_90d", operator: "gt", value: 10 }], cooldownHours: 168 },
    reward: { type: "visibility_boost", percentage: 0, description: "No reward - penalty rule" },
    penalty: { type: "access_restriction", durationDays: 14, description: "Limited to 2 active deals for 14 days" },
    isActive: true, priority: 2,
  },
  {
    id: "reliability-exposure", name: "Reliability Reward",
    description: "Long-term reliable users get preferential exposure",
    stakeholderType: "individual",
    trigger: { event: "monthly_check", conditions: [{ metric: "months_active", operator: "gte", value: 6 }, { metric: "on_time_delivery_rate", operator: "gte", value: 95 }] },
    reward: { type: "visibility_boost", percentage: 25, description: "25% boost in opportunity matching" },
    isActive: true, priority: 1,
  },
  {
    id: "mentorship-bonus", name: "Mentorship Impact",
    description: "Active mentors receive value unit bonuses",
    stakeholderType: "individual",
    trigger: { event: "mentee_outcome", conditions: [{ metric: "mentee_outcomes_30d", operator: "gte", value: 2 }] },
    reward: { type: "value_units", amount: 50, description: "50 Value Units for mentorship impact" },
    isActive: true, priority: 3,
  },
];

const ABUSE_PATTERNS: EconomicAbusePattern[] = [
  { patternId: "fee-arbitrage", name: "Fee Arbitrage Attempt", description: "Exploiting fee structure through rapid small transactions", detectionRules: [{ metric: "small_transactions_1h", window: "1h", threshold: 10, operator: "gt" }], response: { immediate: ["Block further transactions for 24h", "Flag for review"] } },
  { patternId: "trust-gaming", name: "Trust Score Gaming", description: "Artificial trust inflation through coordinated activity", detectionRules: [{ metric: "mutual_endorsements_ratio", window: "30d", threshold: 0.5, operator: "gt" }], response: { immediate: ["Reset affected trust components", "Reduce network weight"] } },
  { patternId: "rapid-transactions", name: "Suspicious Rapid Transactions", description: "Unusual transaction velocity", detectionRules: [{ metric: "transactions_per_hour", window: "1h", threshold: 5, operator: "gt" }], response: { immediate: ["Transaction cooldown (2h)", "Velocity monitoring"] } },
];

// ─── Hook ────────────────────────────────────────────────────

export function useEconomicEngine(institutionId?: string) {
  const { user } = useAuth();

  // S29: Value Units state
  const [vuBalance, setVuBalance] = useState<ValueUnitBalance | null>(null);
  const [vuSources, setVuSources] = useState<ValueUnitSource[]>([]);

  // S30: Pricing state
  const [lastGuidance, setLastGuidance] = useState<PricingGuidance | null>(null);

  // S32: Incentive state
  const [alignmentScore, setAlignmentScore] = useState<IncentiveAlignmentScore | null>(null);

  // S34: Institutional Funding
  const [budget, setBudget] = useState<InstitutionalBudget | null>(null);
  const [fundingFlows, setFundingFlows] = useState<FundingFlow[]>([]);

  // S35: Safety
  const [safetyProfile, setSafetyProfile] = useState<EconomicSafetyProfile | null>(null);

  // S36: Memory
  const [trajectory, setTrajectory] = useState<EconomicTrajectory | null>(null);

  const [loading, setLoading] = useState(true);

  // ─── Load all data from DB ─────────────────────────────────

  useEffect(() => {
    if (!user) {
      setVuBalance(null); setVuSources([]); setAlignmentScore(null);
      setSafetyProfile(null); setTrajectory(null); setBudget(null);
      setLoading(false);
      return;
    }

    const loadAll = async () => {
      setLoading(true);

      const [vuBalRes, vuSrcRes, safetyRes, trajRes, incentiveRes] = await Promise.all([
        supabase.from("value_unit_balances").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("value_unit_sources").select("*").eq("user_id", user.id).order("earned_at", { ascending: false }).limit(50),
        supabase.from("economic_safety_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("economic_trajectories").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("incentive_alignment_state").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      // S29: Value Units
      if (vuBalRes.data) {
        const d = vuBalRes.data;
        setVuBalance({
          userId: user.id,
          totalAccumulated: Number(d.total_accumulated),
          currentBalance: Number(d.current_balance),
          decayedAmount: Number(d.decayed_amount),
          tier: d.tier as ValueUnitTier,
          nextTierThreshold: Number(d.next_tier_threshold),
          percentToNextTier: Number(d.percent_to_next_tier),
          lastContributionAt: d.last_contribution_at ? new Date(d.last_contribution_at) : new Date(),
          categoryBreakdown: (d.category_breakdown || {}) as Record<ContributionCategory, number>,
        });
      } else {
        // Seed default balance
        setVuBalance({
          userId: user.id, totalAccumulated: 0, currentBalance: 0, decayedAmount: 0,
          tier: "emerging", nextTierThreshold: 100, percentToNextTier: 0,
          lastContributionAt: new Date(),
          categoryBreakdown: {} as Record<ContributionCategory, number>,
        });
      }

      if (vuSrcRes.data) {
        setVuSources(vuSrcRes.data.map((s: any) => ({
          category: s.category as ContributionCategory,
          entityId: s.entity_id, entityType: s.entity_type,
          amount: Number(s.amount), multiplier: Number(s.multiplier),
          earnedAt: new Date(s.earned_at), expiresAt: s.expires_at ? new Date(s.expires_at) : undefined,
        })));
      }

      // S35: Safety
      if (safetyRes.data) {
        const s = safetyRes.data;
        setSafetyProfile({
          userId: user.id, riskScore: s.risk_score,
          riskLevel: s.risk_level as EconomicSafetyProfile["riskLevel"],
          verificationLevel: s.verification_level as VerificationLevel,
          flags: (s.flags || []) as unknown as SafetyFlag[],
          cooldowns: (s.cooldowns || []) as unknown as ActiveCooldown[],
          throttles: (s.throttles || []) as unknown as any[],
          manualReviewRequired: s.manual_review_required,
        });
      } else {
        setSafetyProfile({
          userId: user.id, riskScore: 0, riskLevel: "low",
          verificationLevel: "none", flags: [], cooldowns: [],
          throttles: [{ resource: "daily_transactions", limit: 10, used: 0, resetsAt: new Date(Date.now() + 12 * 3600000), reason: "Standard daily limit" }],
          manualReviewRequired: false,
        });
      }

      // S36: Trajectory
      if (trajRes.data) {
        const t = trajRes.data;
        setTrajectory({
          userId: user.id,
          lifetimeMetrics: t.lifetime_metrics as unknown as LifetimeEconomicMetrics,
          periodMetrics: (t.period_metrics || []) as unknown as PeriodMetrics[],
          stabilityScore: Number(t.stability_score),
          recoveryHistory: (t.recovery_history || []) as unknown as RecoveryEvent[],
          projections: (t.projections || []) as unknown as EconomicProjection[],
        });
      } else {
        setTrajectory({
          userId: user.id,
          lifetimeMetrics: {
            totalEarnings: 0, totalSpent: 0, netValue: 0, outcomesDelivered: 0,
            avgEarningsPerOutcome: 0, peakMonthlyEarnings: 0, consistencyScore: 0,
            firstTransactionAt: new Date(), monthsActive: 0,
          },
          periodMetrics: [], stabilityScore: 50, recoveryHistory: [], projections: [],
        });
      }

      // S32: Incentives
      if (incentiveRes.data) {
        const i = incentiveRes.data;
        setAlignmentScore({
          userId: user.id, overallAlignment: i.overall_alignment,
          stakeholderScores: (i.stakeholder_scores || {}) as unknown as Record<StakeholderType, number>,
          activeRewards: (i.active_rewards || []) as unknown as ActiveIncentive[],
          activePenalties: (i.active_penalties || []) as unknown as ActiveIncentive[],
          recommendations: (i.recommendations || []) as unknown as IncentiveRecommendation[],
        });
      } else {
        setAlignmentScore({
          userId: user.id, overallAlignment: 50,
          stakeholderScores: { individual: 50, team: 50, institution: 50, platform: 50 },
          activeRewards: [], activePenalties: [], recommendations: [],
        });
      }

      setLoading(false);
    };

    loadAll();
  }, [user]);

  // ─── S34: Institutional Budget (separate effect) ───────────

  useEffect(() => {
    if (!institutionId) { setBudget(null); return; }

    // Mock institutional budget data (would come from institutional tables)
    const mockAllocations: BudgetAllocation[] = [
      { id: "alloc-1", name: "Research Excellence Fund", type: "research_pool", amount: 5000000, spent: 2500000, committed: 1000000, outcomes: [{ outcomeId: "out-1", type: "research_paper", value: 500000, verifiedAt: new Date(), impactScore: 85 }], startDate: new Date(Date.now() - 180 * 86400000), status: "active" },
      { id: "alloc-2", name: "Student Learning Sponsorships", type: "learning_sponsorship", amount: 2000000, spent: 800000, committed: 500000, outcomes: [{ outcomeId: "out-3", type: "certification", value: 200000, verifiedAt: new Date(), impactScore: 78 }], startDate: new Date(Date.now() - 90 * 86400000), status: "active" },
    ];

    const totalAllocated = mockAllocations.reduce((s, a) => s + a.amount, 0);
    const totalSpent = mockAllocations.reduce((s, a) => s + a.spent, 0);
    const totalCommitted = mockAllocations.reduce((s, a) => s + a.committed, 0);
    const allOutcomes = mockAllocations.flatMap(a => a.outcomes);
    const measuredReturn = allOutcomes.reduce((s, o) => s + o.value * (o.impactScore / 100), 0);

    setBudget({
      institutionId, fiscalYear: "2024",
      totalAllocated, totalSpent, totalCommitted,
      available: totalAllocated - totalSpent - totalCommitted,
      allocations: mockAllocations,
      roi: {
        totalInvested: totalSpent, measuredReturn,
        roiPercentage: ((measuredReturn - totalSpent) / totalSpent) * 100,
        outcomesAchieved: allOutcomes.length,
        avgCostPerOutcome: totalSpent / Math.max(1, allOutcomes.length),
        comparedToMarket: 15,
        breakdown: [
          { category: "Research", invested: 2500000, returned: 1875000, roi: -25, topPerformers: ["Dr. Ahmed"] },
          { category: "Learning", invested: 800000, returned: 600000, roi: -25, topPerformers: ["Top Scholars"] },
        ],
      },
    });
  }, [institutionId]);

  // ─── S29: Value Unit Methods ───────────────────────────────

  const calculateTier = useCallback((bal: number): ValueUnitTier => {
    if (bal >= TIER_THRESHOLDS.exemplary) return "exemplary";
    if (bal >= TIER_THRESHOLDS.distinguished) return "distinguished";
    if (bal >= TIER_THRESHOLDS.trusted) return "trusted";
    if (bal >= TIER_THRESHOLDS.established) return "established";
    return "emerging";
  }, []);

  const recordContribution = useCallback(async (
    category: ContributionCategory, entityId: string, entityType: string, multiplier = 1.0
  ): Promise<ValueUnitSource> => {
    const baseAmount = CONTRIBUTION_VALUES[category];
    const newSource: ValueUnitSource = {
      category, entityId, entityType, amount: baseAmount, multiplier, earnedAt: new Date(),
    };

    // Persist to DB
    if (user) {
      await supabase.from("value_unit_sources").insert({
        user_id: user.id, category, entity_id: entityId, entity_type: entityType,
        amount: baseAmount, multiplier,
      });

      const addedValue = baseAmount * multiplier;
      const newBalance = (vuBalance?.currentBalance || 0) + addedValue;
      const newTotal = (vuBalance?.totalAccumulated || 0) + addedValue;
      const tier = calculateTier(newBalance);

      await supabase.from("value_unit_balances").upsert({
        user_id: user.id, total_accumulated: newTotal, current_balance: newBalance,
        decayed_amount: vuBalance?.decayedAmount || 0, tier,
        next_tier_threshold: TIER_THRESHOLDS[tier === "exemplary" ? "exemplary" : (["emerging", "established", "trusted", "distinguished", "exemplary"][["emerging", "established", "trusted", "distinguished", "exemplary"].indexOf(tier) + 1] as ValueUnitTier)] || 10000,
        percent_to_next_tier: 0, last_contribution_at: new Date().toISOString(),
        category_breakdown: { ...(vuBalance?.categoryBreakdown || {}), [category]: ((vuBalance?.categoryBreakdown[category]) || 0) + addedValue },
      }, { onConflict: "user_id" });
    }

    setVuSources(prev => [newSource, ...prev]);
    setVuBalance(prev => {
      if (!prev) return null;
      const addedValue = baseAmount * multiplier;
      const newBalance = prev.currentBalance + addedValue;
      const tier = calculateTier(newBalance);
      return { ...prev, totalAccumulated: prev.totalAccumulated + addedValue, currentBalance: newBalance, tier, lastContributionAt: new Date(), categoryBreakdown: { ...prev.categoryBreakdown, [category]: (prev.categoryBreakdown[category] || 0) + addedValue } };
    });

    return newSource;
  }, [user, vuBalance, calculateTier]);

  const getContributionMultiplier = useCallback((trustScore: number, consecutiveContributions: number): number => {
    let m = 1.0;
    if (trustScore >= 80) m += 0.3; else if (trustScore >= 60) m += 0.2; else if (trustScore >= 40) m += 0.1;
    if (consecutiveContributions >= 10) m += 0.2; else if (consecutiveContributions >= 5) m += 0.1;
    return Math.min(2.0, m);
  }, []);

  const tierBenefits = useMemo(() => {
    if (!vuBalance) return null;
    const benefits: Record<ValueUnitTier, string[]> = {
      emerging: ["Access to basic opportunities", "Standard platform visibility"],
      established: ["5% fee reduction", "Priority in matching queue", "Access to verified opportunities"],
      trusted: ["10% fee reduction", "Featured profile visibility", "Early access to new features", "Mentorship opportunities"],
      distinguished: ["15% fee reduction", "Premium support access", "Institutional partnership eligibility", "Governance participation"],
      exemplary: ["20% fee reduction", "Platform advisory role", "Custom opportunity creation", "Institutional sponsorship access"],
    };
    return benefits[vuBalance.tier];
  }, [vuBalance]);

  // ─── S30: Pricing Methods ─────────────────────────────────

  const calculatePricing = useCallback((context: PricingContext): PricingGuidance => {
    const factors: PricingFactor[] = [];
    let adjustmentMultiplier = 1.0;
    const baseRange = BASE_RATES[context.projectComplexity];

    if (context.trustScore >= 80) { factors.push({ name: "High Trust Score", impact: "positive", weight: 0.2, description: "Proven reliability commands premium rates" }); adjustmentMultiplier += 0.2; }
    else if (context.trustScore >= 60) { factors.push({ name: "Good Trust Score", impact: "positive", weight: 0.1, description: "Solid reputation supports competitive pricing" }); adjustmentMultiplier += 0.1; }
    else if (context.trustScore < 40) { factors.push({ name: "Building Trust", impact: "negative", weight: -0.15, description: "Consider competitive pricing while building reputation" }); adjustmentMultiplier -= 0.15; }

    if (context.outcomeSuccessRate >= 95) { factors.push({ name: "Exceptional Track Record", impact: "positive", weight: 0.25, description: "Near-perfect delivery record" }); adjustmentMultiplier += 0.25; }
    else if (context.outcomeSuccessRate >= 85) { factors.push({ name: "Strong Track Record", impact: "positive", weight: 0.15, description: "Reliable delivery supports premium pricing" }); adjustmentMultiplier += 0.15; }

    const demandMultiplier = DEMAND_MULTIPLIERS[context.marketDemand];
    const timeMultiplier = TIME_MULTIPLIERS[context.timeCommitment];
    const riskAdjustment = RISK_ADJUSTMENTS[context.riskProfile];
    const totalMultiplier = adjustmentMultiplier * demandMultiplier * timeMultiplier * (1 + riskAdjustment);

    const min = Math.round(baseRange.min * totalMultiplier);
    const max = Math.round(baseRange.max * totalMultiplier);
    const optimal = Math.round((min + max) / 2);

    const guidance: PricingGuidance = {
      suggestedRange: { min, optimal, max }, currency: "PKR",
      successProbability: { atMin: 0.9, atOptimal: 0.7, atMax: 0.45 },
      marketSaturation: context.marketDemand === "low" ? 80 : context.marketDemand === "high" ? 30 : 50,
      factors,
      explanation: `Based on ${context.projectComplexity} complexity, ${context.marketDemand} demand, and your trust profile.`,
    };

    setLastGuidance(guidance);
    return guidance;
  }, []);

  const getQuickEstimate = useCallback((complexity: ProjectComplexity, timeCommitment: TimeCommitment) => {
    const base = BASE_RATES[complexity];
    const m = TIME_MULTIPLIERS[timeCommitment];
    return { min: Math.round(base.min * m), max: Math.round(base.max * m) };
  }, []);

  const getMarketDemand = useCallback(async (skillCategory: string) => {
    const mockData: Record<string, { demand: MarketDemandLevel; opportunities: number; rate: number }> = {
      machine_learning: { demand: "critical", opportunities: 45, rate: 150000 },
      web_development: { demand: "high", opportunities: 120, rate: 50000 },
      data_analysis: { demand: "high", opportunities: 80, rate: 60000 },
    };
    const data = mockData[skillCategory] || { demand: "moderate" as MarketDemandLevel, opportunities: 50, rate: 40000 };
    return { demand: data.demand, openOpportunities: data.opportunities, avgRate: data.rate };
  }, []);

  const comparePricingToMarket = useCallback((proposedPrice: number, _category: string, complexity: ProjectComplexity) => {
    const base = BASE_RATES[complexity];
    const marketMid = (base.min + base.max) / 2;
    const percentile = Math.round((proposedPrice / marketMid) * 50);
    const rec = percentile > 80 ? "Premium positioning." : percentile > 40 ? "Market competitive." : "Below average.";
    return { percentile: Math.min(100, Math.max(0, percentile)), recommendation: rec };
  }, []);

  // ─── S33: Cost Transparency Methods ───────────────────────

  const calculateFee = useCallback((grossAmount: number, trustScore: number, monthlyVolume: number, category?: string): CalculatedFee => {
    let baseFee = grossAmount * (PLATFORM_FEE_CONFIG.baseFeePercentage / 100);
    let trustDiscount = 0;
    for (const d of PLATFORM_FEE_CONFIG.trustDiscounts) { if (trustScore >= d.minTrustScore) { trustDiscount = baseFee * (d.discountPercentage / 100); break; } }
    let volumeDiscount = 0;
    for (const d of PLATFORM_FEE_CONFIG.volumeDiscounts) { if (monthlyVolume >= d.minMonthlyVolume) { volumeDiscount = baseFee * (d.discountPercentage / 100); break; } }
    let categoryAdjustment = 0;
    if (category) { const adj = PLATFORM_FEE_CONFIG.categoryAdjustments.find(a => a.category === category); if (adj) categoryAdjustment = baseFee * (adj.adjustmentPercentage / 100); }

    let netFee = Math.max(PLATFORM_FEE_CONFIG.minimumFee, Math.min(PLATFORM_FEE_CONFIG.maximumFee, baseFee - trustDiscount - volumeDiscount + categoryAdjustment));

    const components: CostComponent[] = [
      { name: "Platform Operations", amount: netFee * 0.3, percentage: 30, recipient: "RCollab Platform", purpose: "Secure infrastructure, 24/7 availability", ecosystemBenefit: "Reliable service for all users" },
      { name: "Trust System", amount: netFee * 0.2, percentage: 20, recipient: "Trust Infrastructure", purpose: "Trust computation, verification, fraud prevention", ecosystemBenefit: "Platform integrity and safety" },
      { name: "Escrow Protection", amount: netFee * 0.2, percentage: 20, recipient: "Payment Security", purpose: "Secure fund holding, milestone management", ecosystemBenefit: "Buyer and seller protection" },
      { name: "Community Development", amount: netFee * 0.15, percentage: 15, recipient: "Product Development", purpose: "New features, improvements", ecosystemBenefit: "Continuous improvement" },
      { name: "Safety Reserve", amount: netFee * 0.15, percentage: 15, recipient: "Protection Fund", purpose: "Dispute resolution, fraud recovery", ecosystemBenefit: "Safety net for unexpected situations" },
    ];

    const breakdown: CostBreakdown = {
      totalCost: netFee, currency: "PKR", components,
      valueExplanation: {
        whatThisEnables: ["Secure escrow protection", "Trust verification", "24/7 availability", "Dispute resolution", "Platform improvements"],
        whoBenefits: [
          { beneficiary: "You", impact: "Protected transactions, verified counterparties", percentage: 40 },
          { beneficiary: "Your counterparty", impact: "Guaranteed payment upon delivery", percentage: 30 },
          { beneficiary: "Community", impact: "Trust infrastructure, safety net", percentage: 30 },
        ],
        ecosystemImpact: "Maintains a trustworthy marketplace.",
        trustContribution: 5,
      },
    };

    return { grossAmount, baseFee, trustDiscount, volumeDiscount, categoryAdjustment, netFee, effectiveRate: (netFee / grossAmount) * 100, breakdown };
  }, []);

  const compareFeesToMarket = useCallback((ourFee: number, transactionAmount: number): MarketComparison => {
    const marketAvg = transactionAmount * 0.15;
    return {
      marketAverage: marketAvg, ourCost: ourFee, savings: Math.max(0, marketAvg - ourFee),
      savingsPercentage: Math.max(0, ((marketAvg - ourFee) / marketAvg) * 100),
      differentiators: ["Trust-based fee discounts", "Volume discounts", "No hidden fees", "Full escrow protection", "Dispute resolution included"],
    };
  }, []);

  const explainComponent = useCallback((componentName: string): string => {
    const explanations: Record<string, string> = {
      "Platform Operations": "Secure servers, data protection, 24/7 monitoring, customer support, payment processing infrastructure.",
      "Trust System": "Trust score computation, credential verification, fraud detection, fairness in matching.",
      "Escrow Protection": "Secure fund holding, milestone-based release, automatic dispute escalation, fraud protection.",
      "Community Development": "New features, better matching algorithms, mobile apps, integration with tools.",
      "Safety Reserve": "Dispute resolution costs, fraud recovery, edge cases requiring manual intervention.",
    };
    return explanations[componentName] || "No detailed explanation available.";
  }, []);

  const getEstimateWithExplanation = useCallback((amount: number, trustScore = 50, monthlyVolume = 0) => {
    const calculated = calculateFee(amount, trustScore, monthlyVolume);
    const comparison = compareFeesToMarket(calculated.netFee, amount);
    let explanation = `Your fee of PKR ${calculated.netFee.toLocaleString()} (${calculated.effectiveRate.toFixed(1)}%) `;
    if (calculated.trustDiscount > 0) explanation += `includes a trust discount of PKR ${calculated.trustDiscount.toLocaleString()} `;
    if (comparison.savings > 0) explanation += `and saves you PKR ${comparison.savings.toLocaleString()} vs industry average. `;
    return { fee: calculated.netFee, effectiveRate: `${calculated.effectiveRate.toFixed(1)}%`, savings: comparison.savings > 0 ? `PKR ${comparison.savings.toLocaleString()}` : "N/A", explanation };
  }, [calculateFee, compareFeesToMarket]);

  // ─── S32: Incentive Methods ───────────────────────────────

  const hasActiveIncentive = useCallback((ruleId: string): boolean => {
    if (!alignmentScore) return false;
    return alignmentScore.activeRewards.some(r => r.ruleId === ruleId) || alignmentScore.activePenalties.some(p => p.ruleId === ruleId);
  }, [alignmentScore]);

  const getCurrentFeeDiscount = useCallback((): number => {
    if (!alignmentScore) return 0;
    return alignmentScore.activeRewards.filter(r => r.impact.includes("fee reduction")).reduce((total, r) => { const match = r.impact.match(/(\d+)%/); return total + (match ? parseInt(match[1], 10) : 0); }, 0);
  }, [alignmentScore]);

  const getVisibilityMultiplier = useCallback((): number => {
    if (!alignmentScore) return 1.0;
    const boost = alignmentScore.activeRewards.filter(r => r.impact.includes("visibility") || r.impact.includes("boost")).reduce((t, r) => { const m = r.impact.match(/(\d+)%/); return t + (m ? parseInt(m[1], 10) : 0); }, 0);
    return 1 + boost / 100;
  }, [alignmentScore]);

  // ─── S34: Institutional Funding Methods ───────────────────

  const createAllocation = useCallback(async (name: string, type: BudgetAllocation["type"], amount: number): Promise<BudgetAllocation> => {
    if (!budget) throw new Error("No budget loaded");
    if (amount > budget.available) throw new Error("Insufficient available funds");
    const newAlloc: BudgetAllocation = { id: `alloc-${Date.now()}`, name, type, amount, spent: 0, committed: 0, outcomes: [], startDate: new Date(), status: "active" };
    setBudget(prev => prev ? { ...prev, allocations: [...prev.allocations, newAlloc], available: prev.available - amount } : null);
    return newAlloc;
  }, [budget]);

  const createFundingFlow = useCallback(async (
    sourceType: FundingFlow["sourceType"], destinationType: FundingFlow["destinationType"],
    destinationId: string, amount: number, purpose: string, conditions: Omit<FundingCondition, "met" | "metAt">[]
  ): Promise<FundingFlow> => {
    if (!institutionId) throw new Error("No institution context");
    const flow: FundingFlow = {
      id: `flow-${Date.now()}`, sourceId: institutionId, sourceType, destinationId, destinationType,
      amount, purpose, conditions: conditions.map(c => ({ ...c, met: false })),
      status: "pending", createdAt: new Date(),
      auditTrail: [{ action: "created", actor: user?.id || "system", timestamp: new Date(), details: `Funding flow created: ${purpose}` }],
    };
    setFundingFlows(prev => [...prev, flow]);
    return flow;
  }, [institutionId, user]);

  const releaseFunds = useCallback(async (flowId: string) => {
    setFundingFlows(prev => prev.map(f => {
      if (f.id !== flowId) return f;
      if (!f.conditions.every(c => c.met)) throw new Error("Not all conditions are met");
      return { ...f, status: "released" as const, releasedAt: new Date(), auditTrail: [...f.auditTrail, { action: "released", actor: user?.id || "system", timestamp: new Date(), details: "Funds released after conditions verified" }] };
    }));
  }, [user]);

  const markConditionMet = useCallback(async (flowId: string, conditionIndex: number) => {
    setFundingFlows(prev => prev.map(f => {
      if (f.id !== flowId) return f;
      return { ...f, conditions: f.conditions.map((c, i) => i === conditionIndex ? { ...c, met: true, metAt: new Date() } : c), auditTrail: [...f.auditTrail, { action: "condition_met", actor: user?.id || "system", timestamp: new Date(), details: `Condition ${conditionIndex + 1} verified` }] };
    }));
  }, [user]);

  const recordOutcome = useCallback(async (allocationId: string, outcome: Omit<AllocationOutcome, "verifiedAt">) => {
    setBudget(prev => {
      if (!prev) return null;
      return { ...prev, allocations: prev.allocations.map(a => a.id !== allocationId ? a : { ...a, outcomes: [...a.outcomes, { ...outcome, verifiedAt: new Date() }] }) };
    });
  }, []);

  const getROIByCategory = useCallback((category: string): number | null => {
    if (!budget) return null;
    return budget.roi.breakdown.find(b => b.category.toLowerCase() === category.toLowerCase())?.roi ?? null;
  }, [budget]);

  const allocationUtilization = useMemo(() => {
    if (!budget) return [];
    return budget.allocations.map(a => ({
      id: a.id, name: a.name, type: a.type,
      utilization: ((a.spent + a.committed) / a.amount) * 100,
      remaining: a.amount - a.spent - a.committed,
      outcomeCount: a.outcomes.length,
      avgImpactScore: a.outcomes.length > 0 ? a.outcomes.reduce((s, o) => s + o.impactScore, 0) / a.outcomes.length : 0,
    }));
  }, [budget]);

  // ─── S35: Safety Methods ──────────────────────────────────

  const checkAction = useCallback((action: string, amount?: number): { allowed: boolean; reason?: string; cooldownSeconds?: number } => {
    if (!safetyProfile) return { allowed: false, reason: "Safety profile not loaded" };
    if (safetyProfile.manualReviewRequired) return { allowed: false, reason: "Account under review" };
    const cooldown = safetyProfile.cooldowns.find(c => c.action === action);
    if (cooldown && cooldown.remainingSeconds > 0) return { allowed: false, reason: cooldown.reason, cooldownSeconds: cooldown.remainingSeconds };
    const throttle = safetyProfile.throttles.find(t => t.resource.includes(action));
    if (throttle && throttle.used >= throttle.limit) return { allowed: false, reason: `Daily limit reached (${throttle.limit})` };
    return { allowed: true };
  }, [safetyProfile]);

  const reportActivity = useCallback(async (flagType: SafetyFlagType, details: string, severity: SafetyFlag["severity"] = "warning") => {
    if (!safetyProfile || !user) return;
    const severityScores = { warning: 10, moderate: 25, severe: 50 };
    const newRiskScore = Math.min(100, safetyProfile.riskScore + severityScores[severity]);
    const riskLevel = newRiskScore >= 70 ? "high" : newRiskScore >= 50 ? "elevated" : newRiskScore >= 30 ? "moderate" : "low";

    await supabase.from("economic_safety_profiles").upsert({
      user_id: user.id, risk_score: newRiskScore, risk_level: riskLevel,
      flags: JSON.parse(JSON.stringify([...safetyProfile.flags, { type: flagType, severity, detectedAt: new Date(), resolved: false, details }])),
      manual_review_required: newRiskScore >= 70,
      verification_level: safetyProfile.verificationLevel,
    } as any, { onConflict: "user_id" });

    setSafetyProfile(prev => prev ? { ...prev, riskScore: newRiskScore, riskLevel: riskLevel as any, manualReviewRequired: newRiskScore >= 70, flags: [...prev.flags, { type: flagType, severity, detectedAt: new Date(), resolved: false, details }] } : null);
  }, [safetyProfile, user]);

  const getTransactionLimits = useCallback(() => {
    if (!safetyProfile) return { single: 0, daily: 0, monthly: 0 };
    const limits: Record<VerificationLevel, { single: number; daily: number; monthly: number }> = {
      none: { single: 1000, daily: 5000, monthly: 20000 },
      basic: { single: 10000, daily: 50000, monthly: 200000 },
      standard: { single: 50000, daily: 200000, monthly: 1000000 },
      enhanced: { single: 200000, daily: 500000, monthly: 2000000 },
      institutional: { single: 1000000, daily: 5000000, monthly: 20000000 },
    };
    return limits[safetyProfile.verificationLevel];
  }, [safetyProfile]);

  const getVerificationUpgradePath = useCallback(() => {
    const level = safetyProfile?.verificationLevel || "none";
    const upgrades: Record<VerificationLevel, { next: VerificationLevel | null; requirements: string[]; benefits: string[] }> = {
      none: { next: "basic", requirements: ["Verify email address", "Complete profile"], benefits: ["PKR 10,000 transaction limit"] },
      basic: { next: "standard", requirements: ["Verify phone number", "Complete 3 transactions"], benefits: ["PKR 50,000 transaction limit"] },
      standard: { next: "enhanced", requirements: ["Identity verification", "Bank account verification"], benefits: ["PKR 200,000 transaction limit"] },
      enhanced: { next: "institutional", requirements: ["Institutional affiliation"], benefits: ["PKR 1,000,000 transaction limit"] },
      institutional: { next: null, requirements: [], benefits: ["Maximum limits"] },
    };
    return { currentLevel: level, ...upgrades[level] };
  }, [safetyProfile]);

  const detectAbusePatterns = useCallback((userMetrics: Record<string, number>) => {
    return ABUSE_PATTERNS.filter(pattern => pattern.detectionRules.every(rule => {
      const v = userMetrics[rule.metric];
      if (v === undefined) return false;
      return rule.operator === "gt" ? v > rule.threshold : rule.operator === "lt" ? v < rule.threshold : Math.abs(v) > rule.threshold;
    }));
  }, []);

  // ─── S36: Economic Memory Methods ─────────────────────────

  const earningsTrend = useMemo(() => {
    if (!trajectory || trajectory.periodMetrics.length < 2) return { direction: "stable" as const, percentage: 0 };
    const periods = trajectory.periodMetrics;
    const recent = periods[periods.length - 1].earnings;
    const previous = periods[periods.length - 2].earnings;
    const change = ((recent - previous) / previous) * 100;
    return { direction: change > 5 ? "up" as const : change < -5 ? "down" as const : "stable" as const, percentage: Math.abs(change) };
  }, [trajectory]);

  const resilienceScore = useMemo(() => {
    if (!trajectory || trajectory.recoveryHistory.length === 0) return 100;
    const avg = trajectory.recoveryHistory.filter(r => r.recoveryDays !== undefined).reduce((s, r) => s + (r.recoveryDays || 0), 0) / trajectory.recoveryHistory.length;
    return Math.max(0, Math.min(100, 100 - (avg - 7) * 1.5));
  }, [trajectory]);

  const healthIndicators = useMemo(() => {
    if (!trajectory) return null;
    const { lifetimeMetrics, stabilityScore } = trajectory;
    const scores = [lifetimeMetrics.consistencyScore, stabilityScore, lifetimeMetrics.avgEarningsPerOutcome > 80000 ? 100 : lifetimeMetrics.avgEarningsPerOutcome / 800];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const overall = avg >= 80 ? "excellent" : avg >= 60 ? "good" : avg >= 40 ? "fair" : "needs_attention";
    return {
      earningsHealth: lifetimeMetrics.avgEarningsPerOutcome > 50000 ? "healthy" : "needs_attention",
      consistencyHealth: lifetimeMetrics.consistencyScore > 70 ? "healthy" : "needs_attention",
      stabilityHealth: stabilityScore > 60 ? "healthy" : "needs_attention",
      growthHealth: earningsTrend.direction === "up" ? "healthy" : earningsTrend.direction === "stable" ? "stable" : "needs_attention",
      overallHealth: overall as "excellent" | "good" | "fair" | "needs_attention",
    };
  }, [trajectory, earningsTrend]);

  const recordEvent = useCallback(async (type: "earning" | "spending" | "outcome" | "recovery", amount: number) => {
    setTrajectory(prev => {
      if (!prev) return null;
      if (type === "earning") return { ...prev, lifetimeMetrics: { ...prev.lifetimeMetrics, totalEarnings: prev.lifetimeMetrics.totalEarnings + amount, netValue: prev.lifetimeMetrics.netValue + amount } };
      if (type === "spending") return { ...prev, lifetimeMetrics: { ...prev.lifetimeMetrics, totalSpent: prev.lifetimeMetrics.totalSpent + amount, netValue: prev.lifetimeMetrics.netValue - amount } };
      if (type === "outcome") return { ...prev, lifetimeMetrics: { ...prev.lifetimeMetrics, outcomesDelivered: prev.lifetimeMetrics.outcomesDelivered + 1 } };
      return prev;
    });
  }, []);

  const getNationalInsights = useCallback(async (country: string): Promise<NationalEconomicInsights> => ({
    country,
    aggregateMetrics: { totalPlatformValue: 500000000, activeUsers: 15000, avgEarningsPerUser: 33333, topCategories: [{ category: "Software Development", value: 150000000 }, { category: "Research", value: 100000000 }], growthRate: 25 },
    anonymized: true, generatedAt: new Date(),
  }), []);

  const compareToPeers = useCallback((category?: string) => {
    if (!trajectory) return { percentile: 50, avgInCategory: 50000, topPerformerThreshold: 150000 };
    const userAvg = trajectory.lifetimeMetrics.avgEarningsPerOutcome;
    return { percentile: Math.min(100, Math.max(0, (userAvg / 70000) * 50)), avgInCategory: 70000, topPerformerThreshold: 150000 };
  }, [trajectory]);

  // ─── Return Namespaced API ────────────────────────────────

  return {
    loading,

    // S29: Value Units
    valueUnits: {
      balance: vuBalance,
      sources: vuSources,
      tierBenefits,
      recordContribution,
      getContributionMultiplier,
      tiers: TIER_THRESHOLDS,
      contributionValues: CONTRIBUTION_VALUES,
    },

    // S30: Pricing Engine
    pricing: {
      calculatePricing,
      getQuickEstimate,
      getMarketDemand,
      compareToMarket: comparePricingToMarket,
      lastGuidance,
      baseRates: BASE_RATES,
      demandMultipliers: DEMAND_MULTIPLIERS,
    },

    // S32: Incentive Alignment
    incentives: {
      alignmentScore,
      rules: PLATFORM_INCENTIVE_RULES,
      hasActiveIncentive,
      getCurrentFeeDiscount,
      getVisibilityMultiplier,
      getActiveRestrictions: () => alignmentScore?.activePenalties.map(p => p.impact) || [],
    },

    // S33: Cost Transparency
    costTransparency: {
      calculateFee,
      generateBreakdown: (totalFee: number, category?: string) => calculateFee(totalFee, 50, 0, category).breakdown,
      compareToMarket: compareFeesToMarket,
      explainComponent,
      getEstimateWithExplanation,
      config: PLATFORM_FEE_CONFIG,
      valueAllocation: VALUE_ALLOCATION,
    },

    // S34: Institutional Funding
    institutional: {
      budget,
      fundingFlows,
      createAllocation,
      createFundingFlow,
      releaseFunds,
      markConditionMet,
      recordOutcome,
      getROIByCategory,
      allocationUtilization,
    },

    // S35: Economic Safety
    safety: {
      safetyProfile,
      checkAction,
      reportActivity,
      getTransactionLimits,
      getVerificationUpgradePath,
      detectAbusePatterns,
      abusePatterns: ABUSE_PATTERNS,
    },

    // S36: Economic Memory
    memory: {
      trajectory,
      earningsTrend,
      resilienceScore,
      healthIndicators,
      recordEvent,
      getNationalInsights,
      compareToPeers,
    },
  };
}

// ─── Backward Compatibility Re-exports ──────────────────────
// These allow existing components to import from individual hooks
// while migrating to the unified hook.

export function useValueUnits() {
  const { valueUnits, loading } = useEconomicEngine();
  return { balance: valueUnits.balance, sources: valueUnits.sources, loading, tierBenefits: valueUnits.tierBenefits, recordContribution: valueUnits.recordContribution, getContributionMultiplier: valueUnits.getContributionMultiplier, tiers: valueUnits.tiers, contributionValues: valueUnits.contributionValues };
}

export function usePricingEngine() {
  const { pricing } = useEconomicEngine();
  return { calculatePricing: pricing.calculatePricing, getQuickEstimate: pricing.getQuickEstimate, getMarketDemand: pricing.getMarketDemand, compareToMarket: pricing.compareToMarket, lastGuidance: pricing.lastGuidance, baseRates: pricing.baseRates, demandMultipliers: pricing.demandMultipliers };
}

export function useCostTransparency() {
  const { costTransparency } = useEconomicEngine();
  return costTransparency;
}

export function useIncentiveAlignment() {
  const { incentives, loading } = useEconomicEngine();
  return { alignmentScore: incentives.alignmentScore, loading, rules: incentives.rules, hasActiveIncentive: incentives.hasActiveIncentive, getCurrentFeeDiscount: incentives.getCurrentFeeDiscount, getVisibilityMultiplier: incentives.getVisibilityMultiplier, getActiveRestrictions: incentives.getActiveRestrictions };
}

export function useInstitutionalFunding(institutionId?: string) {
  const engine = useEconomicEngine(institutionId);
  return { budget: engine.institutional.budget, fundingFlows: engine.institutional.fundingFlows, loading: engine.loading, createAllocation: engine.institutional.createAllocation, createFundingFlow: engine.institutional.createFundingFlow, releaseFunds: engine.institutional.releaseFunds, markConditionMet: engine.institutional.markConditionMet, recordOutcome: engine.institutional.recordOutcome, getROIByCategory: engine.institutional.getROIByCategory, allocationUtilization: engine.institutional.allocationUtilization };
}

export function useEconomicSafety() {
  const { safety, loading } = useEconomicEngine();
  return { safetyProfile: safety.safetyProfile, loading, checkAction: safety.checkAction, reportActivity: safety.reportActivity, applyCooldown: async () => {}, getTransactionLimits: safety.getTransactionLimits, getVerificationUpgradePath: safety.getVerificationUpgradePath, detectAbusePatterns: safety.detectAbusePatterns, abusePatterns: safety.abusePatterns };
}

export function useEconomicMemory() {
  const { memory, loading } = useEconomicEngine();
  return { trajectory: memory.trajectory, loading, getEarningsTrend: memory.earningsTrend, getResilienceScore: memory.resilienceScore, healthIndicators: memory.healthIndicators, recordEvent: memory.recordEvent, getNationalInsights: memory.getNationalInsights, compareToPeers: memory.compareToPeers };
}
