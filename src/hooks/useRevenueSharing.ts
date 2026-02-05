/**
 * System 31: Revenue Sharing & Success Fees
 * Transparent, simulatable, auditable revenue models
 */

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  RevenueShareContract,
  RevenueModelType,
  ContractParty,
  RevenueTerms,
  ContractSimulation,
  SimulationScenario,
  ContractRiskAssessment,
  MilestoneBonus,
  PayoutSchedule,
  ContractStatus,
} from "@/types/economic-engine";

// Platform fee configuration
const PLATFORM_FEE_CONFIG = {
  baseFee: 0.10, // 10%
  successFeeShare: 0.05, // 5% of success fees
  minPlatformFee: 500, // PKR
};

export function useRevenueSharing() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<RevenueShareContract[]>([]);
  const [loading, setLoading] = useState(false);

  // Create a new revenue share contract
  const createContract = useCallback(async (
    type: RevenueModelType,
    parties: Omit<ContractParty, "conditions">[],
    terms: Partial<RevenueTerms>,
    totalValue: number
  ): Promise<RevenueShareContract> => {
    // Validate share percentages sum to 100
    const totalShare = parties.reduce((sum, p) => sum + p.sharePercentage, 0);
    if (Math.abs(totalShare - 100) > 0.01) {
      throw new Error(`Share percentages must sum to 100%, got ${totalShare}%`);
    }

    const contract: RevenueShareContract = {
      id: `contract-${Date.now()}`,
      type,
      parties: parties.map((p) => ({ ...p, conditions: [] })),
      terms: {
        baseFee: terms.baseFee || totalValue,
        successFeePercentage: terms.successFeePercentage,
        revenueSharePercentage: terms.revenueSharePercentage,
        milestoneBonuses: terms.milestoneBonuses || [],
        clawbackConditions: terms.clawbackConditions || [],
        vestingPeriodDays: terms.vestingPeriodDays,
        payoutSchedule: terms.payoutSchedule || "on_completion",
      },
      status: "draft",
      createdAt: new Date(),
      totalValue,
      distributedValue: 0,
      pendingValue: totalValue,
    };

    setContracts((prev) => [...prev, contract]);
    return contract;
  }, []);

  // Simulate contract outcomes before agreement
  const simulateContract = useCallback((
    contract: RevenueShareContract
  ): ContractSimulation => {
    const scenarios: SimulationScenario[] = [];

    // Best case scenario
    const bestCase: SimulationScenario = {
      name: "Best Case",
      probability: 0.25,
      outcomes: contract.parties.map((party) => {
        const baseShare = (contract.totalValue * party.sharePercentage) / 100;
        const bonuses = contract.terms.milestoneBonuses?.reduce(
          (sum, b) => sum + b.bonusAmount,
          0
        ) || 0;
        const partyBonus = party.role === "provider" ? bonuses : 0;
        
        return {
          partyId: party.userId,
          netValue: baseShare + partyBonus,
          timeline: "4 weeks (early completion)",
        };
      }),
    };
    scenarios.push(bestCase);

    // Expected case scenario
    const expectedCase: SimulationScenario = {
      name: "Expected Case",
      probability: 0.50,
      outcomes: contract.parties.map((party) => ({
        partyId: party.userId,
        netValue: (contract.totalValue * party.sharePercentage) / 100,
        timeline: "6 weeks",
      })),
    };
    scenarios.push(expectedCase);

    // Delayed case scenario
    const delayedCase: SimulationScenario = {
      name: "Delayed Completion",
      probability: 0.20,
      outcomes: contract.parties.map((party) => {
        const baseShare = (contract.totalValue * party.sharePercentage) / 100;
        // Apply potential penalty for delay
        const penalty = party.role === "provider" ? baseShare * 0.1 : 0;
        
        return {
          partyId: party.userId,
          netValue: baseShare - penalty,
          timeline: "10 weeks",
        };
      }),
    };
    scenarios.push(delayedCase);

    // Failure case scenario
    const failureCase: SimulationScenario = {
      name: "Project Failure",
      probability: 0.05,
      outcomes: contract.parties.map((party) => {
        const clawback = contract.terms.clawbackConditions?.[0];
        const clawbackPercent = clawback?.percentage || 50;
        
        if (party.role === "client") {
          return {
            partyId: party.userId,
            netValue: (contract.totalValue * clawbackPercent) / 100,
            timeline: "Refund within 14 days",
          };
        }
        
        return {
          partyId: party.userId,
          netValue: 0,
          timeline: "No payout",
        };
      }),
    };
    scenarios.push(failureCase);

    // Risk assessment
    const riskAssessment = assessContractRisk(contract);

    return {
      contract,
      scenarios,
      riskAssessment,
    };
  }, []);

  // Assess contract risk
  const assessContractRisk = (contract: RevenueShareContract): ContractRiskAssessment => {
    const factors: ContractRiskAssessment["factors"] = [];

    // Check for high success fee percentage
    if (contract.terms.successFeePercentage && contract.terms.successFeePercentage > 30) {
      factors.push({
        factor: "High success fee",
        risk: "moderate",
        mitigation: "Consider capping success fee at 25% or adding milestone gates",
      });
    }

    // Check for no clawback protection
    if (!contract.terms.clawbackConditions || contract.terms.clawbackConditions.length === 0) {
      factors.push({
        factor: "No clawback protection",
        risk: "moderate",
        mitigation: "Add clawback conditions for non-delivery",
      });
    }

    // Check for very short vesting
    if (contract.terms.vestingPeriodDays && contract.terms.vestingPeriodDays < 7) {
      factors.push({
        factor: "Short vesting period",
        risk: "low",
        mitigation: "Consider extending to 14+ days for quality assurance",
      });
    }

    // Check for immediate payout on high-value contracts
    if (
      contract.terms.payoutSchedule === "immediate" &&
      contract.totalValue > 100000
    ) {
      factors.push({
        factor: "Immediate payout on large contract",
        risk: "high",
        mitigation: "Use milestone-based or vested payouts for large contracts",
      });
    }

    // Check party count
    if (contract.parties.length > 4) {
      factors.push({
        factor: "Many stakeholders",
        risk: "moderate",
        mitigation: "Ensure clear role definitions and communication plan",
      });
    }

    // Calculate overall risk
    const riskScores = { low: 1, moderate: 2, high: 3 };
    const avgRisk = factors.length > 0
      ? factors.reduce((sum, f) => sum + riskScores[f.risk], 0) / factors.length
      : 1;

    let overallRisk: "low" | "moderate" | "high";
    if (avgRisk >= 2.5) overallRisk = "high";
    else if (avgRisk >= 1.5) overallRisk = "moderate";
    else overallRisk = "low";

    return { overallRisk, factors };
  };

  // Calculate platform fee for a contract
  const calculatePlatformFee = useCallback((
    totalValue: number,
    type: RevenueModelType,
    providerTrustScore: number
  ): { fee: number; effectiveRate: number; discount: number } => {
    let baseRate = PLATFORM_FEE_CONFIG.baseFee;

    // Trust-based discount
    let discount = 0;
    if (providerTrustScore >= 80) discount = 0.20; // 20% off fees
    else if (providerTrustScore >= 60) discount = 0.10;
    else if (providerTrustScore >= 40) discount = 0.05;

    // Type-based adjustment
    if (type === "success_fee" || type === "revenue_share") {
      baseRate = PLATFORM_FEE_CONFIG.successFeeShare;
    }

    const effectiveRate = baseRate * (1 - discount);
    const fee = Math.max(PLATFORM_FEE_CONFIG.minPlatformFee, totalValue * effectiveRate);

    return { fee, effectiveRate, discount };
  }, []);

  // Create standard contract templates
  const getContractTemplate = useCallback((
    type: RevenueModelType,
    totalValue: number
  ): Partial<RevenueTerms> => {
    switch (type) {
      case "fixed_price":
        return {
          baseFee: totalValue,
          payoutSchedule: "on_completion",
          clawbackConditions: [
            { trigger: "non_delivery", percentage: 100, windowDays: 30 },
          ],
        };

      case "success_fee":
        return {
          baseFee: totalValue * 0.7, // 70% base
          successFeePercentage: 30,
          payoutSchedule: "vested",
          vestingPeriodDays: 14,
          clawbackConditions: [
            { trigger: "non_delivery", percentage: 100, windowDays: 30 },
            { trigger: "quality_failure", percentage: 50, windowDays: 14 },
          ],
        };

      case "revenue_share":
        return {
          baseFee: 0,
          revenueSharePercentage: 20,
          payoutSchedule: "monthly",
          vestingPeriodDays: 30,
        };

      case "milestone_bonus":
        return {
          baseFee: totalValue * 0.8,
          milestoneBonuses: [
            { milestoneId: "early", bonusAmount: totalValue * 0.1, conditions: ["delivered_early"] },
            { milestoneId: "quality", bonusAmount: totalValue * 0.1, conditions: ["exceeds_expectations"] },
          ],
          payoutSchedule: "on_completion",
        };

      case "institutional_sponsorship":
        return {
          baseFee: totalValue,
          payoutSchedule: "monthly",
          vestingPeriodDays: 0,
          clawbackConditions: [
            { trigger: "misconduct", percentage: 100, windowDays: 90 },
          ],
        };

      default:
        return {
          baseFee: totalValue,
          payoutSchedule: "on_completion",
        };
    }
  }, []);

  // Update contract status
  const updateContractStatus = useCallback(async (
    contractId: string,
    status: ContractStatus
  ): Promise<void> => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        
        const updates: Partial<RevenueShareContract> = { status };
        
        if (status === "active") {
          updates.activatedAt = new Date();
        } else if (status === "completed") {
          updates.completedAt = new Date();
        }

        return { ...c, ...updates };
      })
    );
  }, []);

  // Record payout
  const recordPayout = useCallback(async (
    contractId: string,
    amount: number,
    partyId: string
  ): Promise<void> => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        
        return {
          ...c,
          distributedValue: c.distributedValue + amount,
          pendingValue: c.pendingValue - amount,
        };
      })
    );
  }, []);

  // Get user's contracts
  const userContracts = useMemo(() => {
    if (!user) return [];
    return contracts.filter((c) =>
      c.parties.some((p) => p.userId === user.id)
    );
  }, [contracts, user]);

  return {
    contracts: userContracts,
    loading,
    createContract,
    simulateContract,
    calculatePlatformFee,
    getContractTemplate,
    updateContractStatus,
    recordPayout,
    platformFeeConfig: PLATFORM_FEE_CONFIG,
  };
}
