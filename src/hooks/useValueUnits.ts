/**
 * System 29: Value Units & Contribution Accounting
 * Non-transferable units representing verified contribution weight
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ValueUnitBalance,
  ValueUnitSource,
  ValueUnitTier,
  ValueUnitDecayConfig,
  ContributionCategory,
} from "@/types/economic-engine";

const TIER_THRESHOLDS: Record<ValueUnitTier, number> = {
  emerging: 0,
  established: 100,
  trusted: 500,
  distinguished: 2000,
  exemplary: 10000,
};

const DEFAULT_DECAY_CONFIG: ValueUnitDecayConfig = {
  baseDecayRate: 2, // 2% per month of inactivity
  gracePeriodDays: 30,
  minimumBalance: 10,
  categoryDecayRates: {
    verified_outcome: 1, // Slower decay for verified outcomes
    knowledge_contribution: 3, // Faster decay for knowledge
    mentorship_impact: 1.5,
  },
};

const CONTRIBUTION_VALUES: Record<ContributionCategory, number> = {
  verified_outcome: 50,
  high_quality_collaboration: 25,
  knowledge_contribution: 10,
  mentorship_impact: 35,
  institutional_value: 40,
  peer_validation: 15,
  community_stewardship: 20,
};

export function useValueUnits() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<ValueUnitBalance | null>(null);
  const [sources, setSources] = useState<ValueUnitSource[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate tier from balance
  const calculateTier = useCallback((currentBalance: number): ValueUnitTier => {
    if (currentBalance >= TIER_THRESHOLDS.exemplary) return "exemplary";
    if (currentBalance >= TIER_THRESHOLDS.distinguished) return "distinguished";
    if (currentBalance >= TIER_THRESHOLDS.trusted) return "trusted";
    if (currentBalance >= TIER_THRESHOLDS.established) return "established";
    return "emerging";
  }, []);

  // Calculate next tier threshold
  const getNextTierThreshold = useCallback((currentTier: ValueUnitTier): number => {
    const tiers: ValueUnitTier[] = ["emerging", "established", "trusted", "distinguished", "exemplary"];
    const currentIndex = tiers.indexOf(currentTier);
    if (currentIndex >= tiers.length - 1) return TIER_THRESHOLDS.exemplary;
    return TIER_THRESHOLDS[tiers[currentIndex + 1]];
  }, []);

  // Apply decay based on inactivity
  const calculateDecay = useCallback((
    sources: ValueUnitSource[],
    config: ValueUnitDecayConfig = DEFAULT_DECAY_CONFIG
  ): number => {
    const now = new Date();
    let totalDecay = 0;

    sources.forEach((source) => {
      const daysSinceEarned = Math.floor(
        (now.getTime() - source.earnedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceEarned > config.gracePeriodDays) {
        const monthsInactive = (daysSinceEarned - config.gracePeriodDays) / 30;
        const categoryRate = config.categoryDecayRates[source.category] || config.baseDecayRate;
        const decay = source.amount * (categoryRate / 100) * monthsInactive;
        totalDecay += Math.min(decay, source.amount - config.minimumBalance);
      }
    });

    return Math.max(0, totalDecay);
  }, []);

  // Load user's value unit balance
  useEffect(() => {
    if (!user) {
      setBalance(null);
      setSources([]);
      setLoading(false);
      return;
    }

    // Simulate loading value units (would be from database)
    const loadBalance = async () => {
      setLoading(true);
      
      // Mock data - in production, fetch from database
      const mockSources: ValueUnitSource[] = [
        {
          category: "verified_outcome",
          entityId: "outcome-1",
          entityType: "project",
          amount: 50,
          multiplier: 1.2,
          earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        {
          category: "high_quality_collaboration",
          entityId: "collab-1",
          entityType: "deal",
          amount: 25,
          multiplier: 1.0,
          earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
        {
          category: "mentorship_impact",
          entityId: "mentor-1",
          entityType: "mentorship",
          amount: 35,
          multiplier: 1.1,
          earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      ];

      setSources(mockSources);

      const totalAccumulated = mockSources.reduce(
        (sum, s) => sum + s.amount * s.multiplier,
        0
      );
      const decayedAmount = calculateDecay(mockSources);
      const currentBalance = Math.max(10, totalAccumulated - decayedAmount);
      const tier = calculateTier(currentBalance);

      const categoryBreakdown = mockSources.reduce((acc, source) => {
        acc[source.category] = (acc[source.category] || 0) + source.amount * source.multiplier;
        return acc;
      }, {} as Record<ContributionCategory, number>);

      const nextThreshold = getNextTierThreshold(tier);
      const currentThreshold = TIER_THRESHOLDS[tier];
      const percentToNextTier = tier === "exemplary"
        ? 100
        : ((currentBalance - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

      setBalance({
        userId: user.id,
        totalAccumulated,
        currentBalance,
        decayedAmount,
        lastContributionAt: mockSources[0]?.earnedAt || new Date(),
        categoryBreakdown,
        tier,
        nextTierThreshold: nextThreshold,
        percentToNextTier: Math.min(100, Math.max(0, percentToNextTier)),
      });

      setLoading(false);
    };

    loadBalance();
  }, [user, calculateDecay, calculateTier, getNextTierThreshold]);

  // Record a new contribution
  const recordContribution = useCallback(async (
    category: ContributionCategory,
    entityId: string,
    entityType: string,
    multiplier: number = 1.0
  ): Promise<ValueUnitSource> => {
    const baseAmount = CONTRIBUTION_VALUES[category];
    
    const newSource: ValueUnitSource = {
      category,
      entityId,
      entityType,
      amount: baseAmount,
      multiplier,
      earnedAt: new Date(),
    };

    setSources((prev) => [newSource, ...prev]);

    // Recalculate balance
    setBalance((prev) => {
      if (!prev) return null;
      
      const addedValue = baseAmount * multiplier;
      const newTotal = prev.totalAccumulated + addedValue;
      const newBalance = prev.currentBalance + addedValue;
      const newTier = calculateTier(newBalance);
      const nextThreshold = getNextTierThreshold(newTier);
      const currentThreshold = TIER_THRESHOLDS[newTier];
      
      return {
        ...prev,
        totalAccumulated: newTotal,
        currentBalance: newBalance,
        lastContributionAt: new Date(),
        categoryBreakdown: {
          ...prev.categoryBreakdown,
          [category]: (prev.categoryBreakdown[category] || 0) + addedValue,
        },
        tier: newTier,
        nextTierThreshold: nextThreshold,
        percentToNextTier: newTier === "exemplary"
          ? 100
          : ((newBalance - currentThreshold) / (nextThreshold - currentThreshold)) * 100,
      };
    });

    return newSource;
  }, [calculateTier, getNextTierThreshold]);

  // Get contribution multiplier based on trust and history
  const getContributionMultiplier = useCallback((
    trustScore: number,
    consecutiveContributions: number
  ): number => {
    let multiplier = 1.0;

    // Trust-based multiplier
    if (trustScore >= 80) multiplier += 0.3;
    else if (trustScore >= 60) multiplier += 0.2;
    else if (trustScore >= 40) multiplier += 0.1;

    // Consistency bonus
    if (consecutiveContributions >= 10) multiplier += 0.2;
    else if (consecutiveContributions >= 5) multiplier += 0.1;

    return Math.min(2.0, multiplier); // Cap at 2x
  }, []);

  // Get tier benefits
  const tierBenefits = useMemo(() => {
    if (!balance) return null;

    const benefits: Record<ValueUnitTier, string[]> = {
      emerging: [
        "Access to basic opportunities",
        "Standard platform visibility",
      ],
      established: [
        "5% fee reduction",
        "Priority in matching queue",
        "Access to verified opportunities",
      ],
      trusted: [
        "10% fee reduction",
        "Featured profile visibility",
        "Early access to new features",
        "Mentorship opportunities",
      ],
      distinguished: [
        "15% fee reduction",
        "Premium support access",
        "Institutional partnership eligibility",
        "Governance participation",
      ],
      exemplary: [
        "20% fee reduction",
        "Platform advisory role",
        "Custom opportunity creation",
        "Institutional sponsorship access",
      ],
    };

    return benefits[balance.tier];
  }, [balance]);

  return {
    balance,
    sources,
    loading,
    tierBenefits,
    recordContribution,
    getContributionMultiplier,
    tiers: TIER_THRESHOLDS,
    contributionValues: CONTRIBUTION_VALUES,
  };
}
