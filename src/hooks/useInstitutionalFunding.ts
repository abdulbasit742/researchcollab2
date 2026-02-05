/**
 * System 34: Institutional Funding Flows
 * Budget allocation, sponsorship tracking, outcome-linked funding
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  InstitutionalBudget,
  BudgetAllocation,
  AllocationOutcome,
  InstitutionalROI,
  FundingFlow,
  FundingCondition,
  AuditEntry,
} from "@/types/economic-engine";

export function useInstitutionalFunding(institutionId?: string) {
  const { user } = useAuth();
  const [budget, setBudget] = useState<InstitutionalBudget | null>(null);
  const [fundingFlows, setFundingFlows] = useState<FundingFlow[]>([]);
  const [loading, setLoading] = useState(true);

  // Load institutional budget
  useEffect(() => {
    if (!institutionId) {
      setBudget(null);
      setLoading(false);
      return;
    }

    const loadBudget = async () => {
      setLoading(true);

      // Mock data - in production, fetch from database
      const mockAllocations: BudgetAllocation[] = [
        {
          id: "alloc-1",
          name: "Research Excellence Fund",
          type: "research_pool",
          amount: 5000000,
          spent: 2500000,
          committed: 1000000,
          outcomes: [
            { outcomeId: "out-1", type: "research_paper", value: 500000, verifiedAt: new Date(), impactScore: 85 },
            { outcomeId: "out-2", type: "research_paper", value: 750000, verifiedAt: new Date(), impactScore: 92 },
          ],
          startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          status: "active",
        },
        {
          id: "alloc-2",
          name: "Student Learning Sponsorships",
          type: "learning_sponsorship",
          amount: 2000000,
          spent: 800000,
          committed: 500000,
          outcomes: [
            { outcomeId: "out-3", type: "certification", value: 200000, verifiedAt: new Date(), impactScore: 78 },
          ],
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          status: "active",
        },
        {
          id: "alloc-3",
          name: "Industry Collaboration Pool",
          type: "collaboration_fund",
          amount: 3000000,
          spent: 1200000,
          committed: 800000,
          outcomes: [
            { outcomeId: "out-4", type: "project", value: 600000, verifiedAt: new Date(), impactScore: 88 },
            { outcomeId: "out-5", type: "project", value: 400000, verifiedAt: new Date(), impactScore: 75 },
          ],
          startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          status: "active",
        },
      ];

      const totalAllocated = mockAllocations.reduce((sum, a) => sum + a.amount, 0);
      const totalSpent = mockAllocations.reduce((sum, a) => sum + a.spent, 0);
      const totalCommitted = mockAllocations.reduce((sum, a) => sum + a.committed, 0);

      // Calculate ROI
      const allOutcomes = mockAllocations.flatMap((a) => a.outcomes);
      const measuredReturn = allOutcomes.reduce((sum, o) => sum + o.value * (o.impactScore / 100), 0);
      const roiPercentage = ((measuredReturn - totalSpent) / totalSpent) * 100;

      const roi: InstitutionalROI = {
        totalInvested: totalSpent,
        measuredReturn,
        roiPercentage,
        outcomesAchieved: allOutcomes.length,
        avgCostPerOutcome: totalSpent / Math.max(1, allOutcomes.length),
        comparedToMarket: 15, // 15% better than market average
        breakdown: [
          { category: "Research", invested: 2500000, returned: 1875000, roi: -25, topPerformers: ["Dr. Ahmed", "Prof. Khan"] },
          { category: "Learning", invested: 800000, returned: 600000, roi: -25, topPerformers: ["Top 10 Scholars"] },
          { category: "Collaboration", invested: 1200000, returned: 1100000, roi: -8, topPerformers: ["Industry Partner A"] },
        ],
      };

      setBudget({
        institutionId,
        fiscalYear: "2024",
        totalAllocated,
        totalSpent,
        totalCommitted,
        available: totalAllocated - totalSpent - totalCommitted,
        allocations: mockAllocations,
        roi,
      });

      setLoading(false);
    };

    loadBudget();
  }, [institutionId]);

  // Create new budget allocation
  const createAllocation = useCallback(async (
    name: string,
    type: BudgetAllocation["type"],
    amount: number
  ): Promise<BudgetAllocation> => {
    if (!budget) throw new Error("No budget loaded");
    if (amount > budget.available) throw new Error("Insufficient available funds");

    const newAllocation: BudgetAllocation = {
      id: `alloc-${Date.now()}`,
      name,
      type,
      amount,
      spent: 0,
      committed: 0,
      outcomes: [],
      startDate: new Date(),
      status: "active",
    };

    setBudget((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        allocations: [...prev.allocations, newAllocation],
        available: prev.available - amount,
      };
    });

    return newAllocation;
  }, [budget]);

  // Create funding flow (traceable fund movement)
  const createFundingFlow = useCallback(async (
    sourceType: FundingFlow["sourceType"],
    destinationType: FundingFlow["destinationType"],
    destinationId: string,
    amount: number,
    purpose: string,
    conditions: Omit<FundingCondition, "met" | "metAt">[]
  ): Promise<FundingFlow> => {
    if (!institutionId) throw new Error("No institution context");

    const flow: FundingFlow = {
      id: `flow-${Date.now()}`,
      sourceId: institutionId,
      sourceType,
      destinationId,
      destinationType,
      amount,
      purpose,
      conditions: conditions.map((c) => ({ ...c, met: false })),
      status: "pending",
      createdAt: new Date(),
      auditTrail: [
        {
          action: "created",
          actor: user?.id || "system",
          timestamp: new Date(),
          details: `Funding flow created: ${purpose}`,
        },
      ],
    };

    setFundingFlows((prev) => [...prev, flow]);
    return flow;
  }, [institutionId, user]);

  // Release funds (after conditions met)
  const releaseFunds = useCallback(async (flowId: string): Promise<void> => {
    setFundingFlows((prev) =>
      prev.map((f) => {
        if (f.id !== flowId) return f;

        const allConditionsMet = f.conditions.every((c) => c.met);
        if (!allConditionsMet) {
          throw new Error("Not all conditions are met");
        }

        return {
          ...f,
          status: "released" as const,
          releasedAt: new Date(),
          auditTrail: [
            ...f.auditTrail,
            {
              action: "released",
              actor: user?.id || "system",
              timestamp: new Date(),
              details: "Funds released after conditions verified",
            },
          ],
        };
      })
    );
  }, [user]);

  // Mark condition as met
  const markConditionMet = useCallback(async (
    flowId: string,
    conditionIndex: number
  ): Promise<void> => {
    setFundingFlows((prev) =>
      prev.map((f) => {
        if (f.id !== flowId) return f;

        const updatedConditions = f.conditions.map((c, i) => {
          if (i !== conditionIndex) return c;
          return { ...c, met: true, metAt: new Date() };
        });

        return {
          ...f,
          conditions: updatedConditions,
          auditTrail: [
            ...f.auditTrail,
            {
              action: "condition_met",
              actor: user?.id || "system",
              timestamp: new Date(),
              details: `Condition ${conditionIndex + 1} verified`,
            },
          ],
        };
      })
    );
  }, [user]);

  // Record outcome for allocation
  const recordOutcome = useCallback(async (
    allocationId: string,
    outcome: Omit<AllocationOutcome, "verifiedAt">
  ): Promise<void> => {
    setBudget((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        allocations: prev.allocations.map((a) => {
          if (a.id !== allocationId) return a;

          return {
            ...a,
            outcomes: [
              ...a.outcomes,
              { ...outcome, verifiedAt: new Date() },
            ],
          };
        }),
      };
    });
  }, []);

  // Get ROI by category
  const getROIByCategory = useCallback((category: string): number | null => {
    if (!budget) return null;

    const categoryBreakdown = budget.roi.breakdown.find(
      (b) => b.category.toLowerCase() === category.toLowerCase()
    );

    return categoryBreakdown?.roi ?? null;
  }, [budget]);

  // Get allocation utilization
  const getAllocationUtilization = useMemo(() => {
    if (!budget) return [];

    return budget.allocations.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      utilization: ((a.spent + a.committed) / a.amount) * 100,
      remaining: a.amount - a.spent - a.committed,
      outcomeCount: a.outcomes.length,
      avgImpactScore: a.outcomes.length > 0
        ? a.outcomes.reduce((sum, o) => sum + o.impactScore, 0) / a.outcomes.length
        : 0,
    }));
  }, [budget]);

  return {
    budget,
    fundingFlows,
    loading,
    createAllocation,
    createFundingFlow,
    releaseFunds,
    markConditionMet,
    recordOutcome,
    getROIByCategory,
    allocationUtilization: getAllocationUtilization,
  };
}
