/**
 * System 32: Incentive Alignment Engine
 * Align incentives across individuals, teams, institutions, and platform
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  IncentiveRule,
  IncentiveAlignmentScore,
  ActiveIncentive,
  IncentiveRecommendation,
  StakeholderType,
  IncentiveReward,
  IncentivePenalty,
} from "@/types/economic-engine";

// Define platform incentive rules
const PLATFORM_INCENTIVE_RULES: IncentiveRule[] = [
  // Reward: Better outcomes → lower platform fees
  {
    id: "outcome-fee-reduction",
    name: "Outcome Excellence Discount",
    description: "Consistently successful outcomes reduce platform fees",
    stakeholderType: "individual",
    trigger: {
      event: "outcome_completed",
      conditions: [
        { metric: "success_rate_90d", operator: "gte", value: 90 },
        { metric: "outcomes_count_90d", operator: "gte", value: 3 },
      ],
    },
    reward: {
      type: "fee_reduction",
      percentage: 15,
      durationDays: 30,
      description: "15% fee reduction for 30 days",
    },
    isActive: true,
    priority: 1,
  },

  // Penalty: High dispute rates → higher friction
  {
    id: "dispute-friction",
    name: "Dispute Rate Friction",
    description: "High dispute rates increase platform friction",
    stakeholderType: "individual",
    trigger: {
      event: "dispute_filed",
      conditions: [
        { metric: "dispute_rate_90d", operator: "gt", value: 10 },
      ],
      cooldownHours: 168, // 1 week
    },
    reward: {
      type: "visibility_boost",
      percentage: 0,
      description: "No reward - penalty rule",
    },
    penalty: {
      type: "access_restriction",
      durationDays: 14,
      description: "Limited to 2 active deals for 14 days",
    },
    isActive: true,
    priority: 2,
  },

  // Reward: Long-term reliability → preferential exposure
  {
    id: "reliability-exposure",
    name: "Reliability Reward",
    description: "Long-term reliable users get preferential exposure",
    stakeholderType: "individual",
    trigger: {
      event: "monthly_check",
      conditions: [
        { metric: "months_active", operator: "gte", value: 6 },
        { metric: "on_time_delivery_rate", operator: "gte", value: 95 },
      ],
    },
    reward: {
      type: "visibility_boost",
      percentage: 25,
      description: "25% boost in opportunity matching",
    },
    isActive: true,
    priority: 1,
  },

  // Reward: Mentorship contribution
  {
    id: "mentorship-bonus",
    name: "Mentorship Impact",
    description: "Active mentors receive value unit bonuses",
    stakeholderType: "individual",
    trigger: {
      event: "mentee_outcome",
      conditions: [
        { metric: "mentee_outcomes_30d", operator: "gte", value: 2 },
      ],
    },
    reward: {
      type: "value_units",
      amount: 50,
      description: "50 Value Units for mentorship impact",
    },
    isActive: true,
    priority: 3,
  },

  // Team incentive: Collective success
  {
    id: "team-success-bonus",
    name: "Team Excellence",
    description: "Teams with high collective success get visibility boost",
    stakeholderType: "team",
    trigger: {
      event: "team_project_completed",
      conditions: [
        { metric: "team_satisfaction_score", operator: "gte", value: 4.5 },
      ],
    },
    reward: {
      type: "visibility_boost",
      percentage: 20,
      durationDays: 30,
      description: "Team featured in recommendations",
    },
    isActive: true,
    priority: 2,
  },

  // Institution incentive: Member quality
  {
    id: "institution-quality-discount",
    name: "Institutional Quality Discount",
    description: "Institutions with high-performing members get fee reductions",
    stakeholderType: "institution",
    trigger: {
      event: "quarterly_review",
      conditions: [
        { metric: "member_avg_trust_score", operator: "gte", value: 70 },
        { metric: "member_dispute_rate", operator: "lte", value: 5 },
      ],
    },
    reward: {
      type: "fee_reduction",
      percentage: 10,
      description: "10% institutional fee reduction",
    },
    isActive: true,
    priority: 1,
  },

  // Penalty: Patience reward (anti-gaming)
  {
    id: "rapid-activity-cooldown",
    name: "Activity Pacing",
    description: "Rapid activity triggers cooling period",
    stakeholderType: "individual",
    trigger: {
      event: "any_activity",
      conditions: [
        { metric: "actions_per_hour", operator: "gt", value: 50 },
      ],
      cooldownHours: 24,
    },
    reward: {
      type: "visibility_boost",
      percentage: 0,
      description: "No reward - penalty rule",
    },
    penalty: {
      type: "cooldown",
      durationDays: 1,
      description: "24-hour activity cooldown",
    },
    isActive: true,
    priority: 1,
  },
];

export function useIncentiveAlignment() {
  const { user } = useAuth();
  const [alignmentScore, setAlignmentScore] = useState<IncentiveAlignmentScore | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate alignment score for user
  useEffect(() => {
    if (!user) {
      setAlignmentScore(null);
      setLoading(false);
      return;
    }

    const calculateScore = async () => {
      setLoading(true);

      // Mock metrics - in production, fetch from database
      const mockMetrics = {
        success_rate_90d: 92,
        outcomes_count_90d: 5,
        dispute_rate_90d: 2,
        months_active: 8,
        on_time_delivery_rate: 96,
        mentee_outcomes_30d: 1,
        actions_per_hour: 10,
      };

      // Evaluate rules
      const activeRewards: ActiveIncentive[] = [];
      const activePenalties: ActiveIncentive[] = [];

      PLATFORM_INCENTIVE_RULES.forEach((rule) => {
        if (!rule.isActive || rule.stakeholderType !== "individual") return;

        // Check if all conditions are met
        const conditionsMet = rule.trigger.conditions.every((condition) => {
          const value = mockMetrics[condition.metric as keyof typeof mockMetrics];
          if (value === undefined) return false;

          switch (condition.operator) {
            case "gt": return value > (condition.value as number);
            case "lt": return value < (condition.value as number);
            case "gte": return value >= (condition.value as number);
            case "lte": return value <= (condition.value as number);
            case "eq": return value === condition.value;
            case "between": {
              const [min, max] = condition.value as [number, number];
              return value >= min && value <= max;
            }
            default: return false;
          }
        });

        if (conditionsMet) {
          if (rule.reward && rule.reward.type !== "visibility_boost" || rule.reward?.amount) {
            activeRewards.push({
              ruleId: rule.id,
              ruleName: rule.name,
              type: "reward",
              appliedAt: new Date(),
              expiresAt: rule.reward.durationDays
                ? new Date(Date.now() + rule.reward.durationDays * 24 * 60 * 60 * 1000)
                : undefined,
              impact: rule.reward.description,
            });
          }
        } else if (rule.penalty) {
          // Check if penalty condition is met (inverse logic)
          const penaltyConditionMet = rule.trigger.conditions.some((condition) => {
            const value = mockMetrics[condition.metric as keyof typeof mockMetrics];
            if (value === undefined) return false;
            
            // For penalties, we check the opposite
            switch (condition.operator) {
              case "gt": return value > (condition.value as number);
              default: return false;
            }
          });

          if (penaltyConditionMet) {
            activePenalties.push({
              ruleId: rule.id,
              ruleName: rule.name,
              type: "penalty",
              appliedAt: new Date(),
              expiresAt: rule.penalty.durationDays
                ? new Date(Date.now() + rule.penalty.durationDays * 24 * 60 * 60 * 1000)
                : undefined,
              impact: rule.penalty.description,
            });
          }
        }
      });

      // Calculate stakeholder scores
      const stakeholderScores: Record<StakeholderType, number> = {
        individual: Math.min(100, mockMetrics.success_rate_90d),
        team: 75, // Mock
        institution: 80, // Mock
        platform: 85, // Platform health contribution
      };

      // Overall alignment
      const overallAlignment = Math.round(
        Object.values(stakeholderScores).reduce((a, b) => a + b, 0) / 4
      );

      // Generate recommendations
      const recommendations: IncentiveRecommendation[] = [];

      if (mockMetrics.mentee_outcomes_30d < 2) {
        recommendations.push({
          action: "Mentor one more person to completion",
          potentialReward: "50 Value Units + Mentorship badge",
          difficulty: "moderate",
          timeframe: "30 days",
        });
      }

      if (mockMetrics.success_rate_90d < 95) {
        recommendations.push({
          action: "Complete 2 more projects successfully",
          potentialReward: "15% fee reduction for 30 days",
          difficulty: "easy",
          timeframe: "60 days",
        });
      }

      if (mockMetrics.months_active < 6) {
        recommendations.push({
          action: "Stay active for " + (6 - mockMetrics.months_active) + " more months",
          potentialReward: "25% visibility boost in matching",
          difficulty: "easy",
          timeframe: `${6 - mockMetrics.months_active} months`,
        });
      }

      setAlignmentScore({
        userId: user.id,
        overallAlignment,
        stakeholderScores,
        activeRewards,
        activePenalties,
        recommendations,
      });

      setLoading(false);
    };

    calculateScore();
  }, [user]);

  // Check if a specific incentive is active for user
  const hasActiveIncentive = useCallback((
    ruleId: string
  ): boolean => {
    if (!alignmentScore) return false;
    return alignmentScore.activeRewards.some((r) => r.ruleId === ruleId) ||
           alignmentScore.activePenalties.some((p) => p.ruleId === ruleId);
  }, [alignmentScore]);

  // Get current fee discount
  const getCurrentFeeDiscount = useCallback((): number => {
    if (!alignmentScore) return 0;

    return alignmentScore.activeRewards
      .filter((r) => r.impact.includes("fee reduction"))
      .reduce((total, r) => {
        const match = r.impact.match(/(\d+)%/);
        return total + (match ? parseInt(match[1], 10) : 0);
      }, 0);
  }, [alignmentScore]);

  // Get visibility multiplier
  const getVisibilityMultiplier = useCallback((): number => {
    if (!alignmentScore) return 1.0;

    const boostPercent = alignmentScore.activeRewards
      .filter((r) => r.impact.includes("visibility") || r.impact.includes("boost"))
      .reduce((total, r) => {
        const match = r.impact.match(/(\d+)%/);
        return total + (match ? parseInt(match[1], 10) : 0);
      }, 0);

    return 1 + boostPercent / 100;
  }, [alignmentScore]);

  // Get active restrictions
  const getActiveRestrictions = useCallback((): string[] => {
    if (!alignmentScore) return [];

    return alignmentScore.activePenalties.map((p) => p.impact);
  }, [alignmentScore]);

  return {
    alignmentScore,
    loading,
    rules: PLATFORM_INCENTIVE_RULES,
    hasActiveIncentive,
    getCurrentFeeDiscount,
    getVisibilityMultiplier,
    getActiveRestrictions,
  };
}
