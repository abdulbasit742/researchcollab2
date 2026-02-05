/**
 * System 36: Long-Term Economic Memory
 * Track lifetime earnings, stability, recovery, and trajectory
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  EconomicTrajectory,
  LifetimeEconomicMetrics,
  PeriodMetrics,
  RecoveryEvent,
  EconomicProjection,
  NationalEconomicInsights,
} from "@/types/economic-engine";

export function useEconomicMemory() {
  const { user } = useAuth();
  const [trajectory, setTrajectory] = useState<EconomicTrajectory | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user's economic trajectory
  useEffect(() => {
    if (!user) {
      setTrajectory(null);
      setLoading(false);
      return;
    }

    const loadTrajectory = async () => {
      setLoading(true);

      // Mock data - in production, aggregate from transaction history
      const mockLifetimeMetrics: LifetimeEconomicMetrics = {
        totalEarnings: 2500000,
        totalSpent: 500000,
        netValue: 2000000,
        outcomesDelivered: 28,
        avgEarningsPerOutcome: 89285,
        peakMonthlyEarnings: 450000,
        consistencyScore: 78,
        firstTransactionAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        monthsActive: 12,
      };

      const mockPeriodMetrics: PeriodMetrics[] = [
        { period: "2024-Q1", earnings: 550000, outcomes: 6, trustChange: 5, valueUnitsEarned: 180, growthRate: 0 },
        { period: "2024-Q2", earnings: 620000, outcomes: 7, trustChange: 8, valueUnitsEarned: 210, growthRate: 12.7 },
        { period: "2024-Q3", earnings: 580000, outcomes: 6, trustChange: 3, valueUnitsEarned: 170, growthRate: -6.5 },
        { period: "2024-Q4", earnings: 750000, outcomes: 9, trustChange: 10, valueUnitsEarned: 280, growthRate: 29.3 },
      ];

      const mockRecoveryEvents: RecoveryEvent[] = [
        {
          type: "dispute",
          occurredAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          recoveredAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
          recoveryDays: 30,
          impactAmount: -50000,
          recoveryPath: ["Mediation completed", "Partial refund issued", "Trust stabilized"],
        },
      ];

      const mockProjections: EconomicProjection[] = [
        {
          scenario: "conservative",
          timeframe: "Next 6 months",
          projectedEarnings: 1200000,
          projectedOutcomes: 12,
          assumptions: ["Current pace maintained", "No market changes", "Same skill focus"],
          confidence: 0.8,
        },
        {
          scenario: "moderate",
          timeframe: "Next 6 months",
          projectedEarnings: 1500000,
          projectedOutcomes: 15,
          assumptions: ["10% growth rate", "Skill expansion", "Network growth"],
          confidence: 0.6,
        },
        {
          scenario: "optimistic",
          timeframe: "Next 6 months",
          projectedEarnings: 2000000,
          projectedOutcomes: 20,
          assumptions: ["25% growth rate", "Premium opportunities", "Institutional clients"],
          confidence: 0.3,
        },
      ];

      // Calculate stability score
      const earningsVariance = calculateVariance(mockPeriodMetrics.map((p) => p.earnings));
      const avgEarnings = mockPeriodMetrics.reduce((sum, p) => sum + p.earnings, 0) / mockPeriodMetrics.length;
      const coefficientOfVariation = Math.sqrt(earningsVariance) / avgEarnings;
      const stabilityScore = Math.max(0, Math.min(100, 100 - coefficientOfVariation * 100));

      setTrajectory({
        userId: user.id,
        lifetimeMetrics: mockLifetimeMetrics,
        periodMetrics: mockPeriodMetrics,
        stabilityScore,
        recoveryHistory: mockRecoveryEvents,
        projections: mockProjections,
      });

      setLoading(false);
    };

    loadTrajectory();
  }, [user]);

  // Helper: Calculate variance
  const calculateVariance = (values: number[]): number => {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;
  };

  // Get earnings trend
  const getEarningsTrend = useMemo(() => {
    if (!trajectory || trajectory.periodMetrics.length < 2) {
      return { direction: "stable" as const, percentage: 0 };
    }

    const periods = trajectory.periodMetrics;
    const recent = periods[periods.length - 1].earnings;
    const previous = periods[periods.length - 2].earnings;
    const change = ((recent - previous) / previous) * 100;

    return {
      direction: change > 5 ? "up" as const : change < -5 ? "down" as const : "stable" as const,
      percentage: Math.abs(change),
    };
  }, [trajectory]);

  // Get recovery resilience score
  const getResilienceScore = useMemo(() => {
    if (!trajectory || trajectory.recoveryHistory.length === 0) {
      return 100; // No failures = perfect resilience
    }

    const avgRecoveryDays = trajectory.recoveryHistory
      .filter((r) => r.recoveryDays !== undefined)
      .reduce((sum, r) => sum + (r.recoveryDays || 0), 0) / trajectory.recoveryHistory.length;

    // Score based on recovery speed (faster = higher score)
    // 7 days = 100, 30 days = 70, 90 days = 40
    return Math.max(0, Math.min(100, 100 - (avgRecoveryDays - 7) * 1.5));
  }, [trajectory]);

  // Get economic health indicators
  const getHealthIndicators = useMemo(() => {
    if (!trajectory) return null;

    const { lifetimeMetrics, stabilityScore } = trajectory;
    
    return {
      earningsHealth: lifetimeMetrics.avgEarningsPerOutcome > 50000 ? "healthy" : "needs_attention",
      consistencyHealth: lifetimeMetrics.consistencyScore > 70 ? "healthy" : "needs_attention",
      stabilityHealth: stabilityScore > 60 ? "healthy" : "needs_attention",
      growthHealth: getEarningsTrend.direction === "up" ? "healthy" : 
                    getEarningsTrend.direction === "stable" ? "stable" : "needs_attention",
      overallHealth: calculateOverallHealth(lifetimeMetrics, stabilityScore),
    };
  }, [trajectory, getEarningsTrend]);

  const calculateOverallHealth = (
    metrics: LifetimeEconomicMetrics,
    stability: number
  ): "excellent" | "good" | "fair" | "needs_attention" => {
    const scores = [
      metrics.consistencyScore,
      stability,
      metrics.avgEarningsPerOutcome > 80000 ? 100 : metrics.avgEarningsPerOutcome / 800,
    ];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (avg >= 80) return "excellent";
    if (avg >= 60) return "good";
    if (avg >= 40) return "fair";
    return "needs_attention";
  };

  // Record economic event
  const recordEvent = useCallback(async (
    type: "earning" | "spending" | "outcome" | "recovery",
    amount: number,
    details?: Record<string, unknown>
  ): Promise<void> => {
    // In production, this would write to the database
    console.log("Recording economic event:", { type, amount, details });

    // Update local state optimistically
    setTrajectory((prev) => {
      if (!prev) return null;

      if (type === "earning") {
        return {
          ...prev,
          lifetimeMetrics: {
            ...prev.lifetimeMetrics,
            totalEarnings: prev.lifetimeMetrics.totalEarnings + amount,
            netValue: prev.lifetimeMetrics.netValue + amount,
          },
        };
      }

      if (type === "spending") {
        return {
          ...prev,
          lifetimeMetrics: {
            ...prev.lifetimeMetrics,
            totalSpent: prev.lifetimeMetrics.totalSpent + amount,
            netValue: prev.lifetimeMetrics.netValue - amount,
          },
        };
      }

      if (type === "outcome") {
        return {
          ...prev,
          lifetimeMetrics: {
            ...prev.lifetimeMetrics,
            outcomesDelivered: prev.lifetimeMetrics.outcomesDelivered + 1,
            avgEarningsPerOutcome: 
              prev.lifetimeMetrics.totalEarnings / (prev.lifetimeMetrics.outcomesDelivered + 1),
          },
        };
      }

      return prev;
    });
  }, []);

  // Get national/aggregate insights (anonymized)
  const getNationalInsights = useCallback(async (
    country: string
  ): Promise<NationalEconomicInsights> => {
    // Mock aggregate data - in production, query anonymized aggregates
    return {
      country,
      aggregateMetrics: {
        totalPlatformValue: 500000000, // 500M PKR
        activeUsers: 15000,
        avgEarningsPerUser: 33333,
        topCategories: [
          { category: "Software Development", value: 150000000 },
          { category: "Research", value: 100000000 },
          { category: "Design", value: 80000000 },
          { category: "Content", value: 60000000 },
        ],
        growthRate: 25,
      },
      anonymized: true,
      generatedAt: new Date(),
    };
  }, []);

  // Compare to peers (anonymized)
  const compareToPeers = useCallback((
    category?: string
  ): {
    percentile: number;
    avgInCategory: number;
    topPerformerThreshold: number;
  } => {
    if (!trajectory) {
      return { percentile: 50, avgInCategory: 50000, topPerformerThreshold: 150000 };
    }

    // Mock peer comparison - in production, query anonymized aggregates
    const userAvg = trajectory.lifetimeMetrics.avgEarningsPerOutcome;
    const categoryAvg = 70000; // Mock
    const topThreshold = 150000; // Mock

    const percentile = Math.min(100, Math.max(0, (userAvg / categoryAvg) * 50));

    return {
      percentile,
      avgInCategory: categoryAvg,
      topPerformerThreshold: topThreshold,
    };
  }, [trajectory]);

  return {
    trajectory,
    loading,
    getEarningsTrend,
    getResilienceScore,
    healthIndicators: getHealthIndicators,
    recordEvent,
    getNationalInsights,
    compareToPeers,
  };
}
