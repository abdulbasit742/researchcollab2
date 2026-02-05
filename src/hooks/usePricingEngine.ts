/**
 * System 30: Fair Value Exchange & Pricing Engine
 * Dynamic pricing guidance based on trust, outcomes, market, and risk
 */

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  PricingContext,
  PricingGuidance,
  PricingFactor,
  MarketDemandLevel,
  ProjectComplexity,
  TimeCommitment,
  RiskProfile,
} from "@/types/economic-engine";

// Base rates in PKR
const BASE_RATES: Record<ProjectComplexity, { min: number; max: number }> = {
  simple: { min: 5000, max: 25000 },
  moderate: { min: 20000, max: 75000 },
  complex: { min: 50000, max: 200000 },
  expert: { min: 150000, max: 500000 },
};

// Time multipliers
const TIME_MULTIPLIERS: Record<TimeCommitment, number> = {
  hours: 1,
  days: 1.5,
  weeks: 2,
  months: 3,
  ongoing: 4,
};

// Demand multipliers
const DEMAND_MULTIPLIERS: Record<MarketDemandLevel, number> = {
  low: 0.8,
  moderate: 1.0,
  high: 1.3,
  critical: 1.6,
};

// Risk adjustments
const RISK_ADJUSTMENTS: Record<RiskProfile, number> = {
  minimal: 0,
  standard: 0.1,
  elevated: 0.25,
  high: 0.4,
};

export function usePricingEngine() {
  const { user } = useAuth();
  const [lastGuidance, setLastGuidance] = useState<PricingGuidance | null>(null);

  // Calculate pricing guidance
  const calculatePricing = useCallback((context: PricingContext): PricingGuidance => {
    const factors: PricingFactor[] = [];
    let adjustmentMultiplier = 1.0;

    // Base range from complexity
    const baseRange = BASE_RATES[context.projectComplexity];
    
    // Trust score factor
    if (context.trustScore >= 80) {
      factors.push({
        name: "High Trust Score",
        impact: "positive",
        weight: 0.2,
        description: "Your proven reliability commands premium rates",
      });
      adjustmentMultiplier += 0.2;
    } else if (context.trustScore >= 60) {
      factors.push({
        name: "Good Trust Score",
        impact: "positive",
        weight: 0.1,
        description: "Solid reputation supports competitive pricing",
      });
      adjustmentMultiplier += 0.1;
    } else if (context.trustScore < 40) {
      factors.push({
        name: "Building Trust",
        impact: "negative",
        weight: -0.15,
        description: "Consider competitive pricing while building reputation",
      });
      adjustmentMultiplier -= 0.15;
    }

    // Value unit balance factor
    if (context.valueUnitBalance >= 2000) {
      factors.push({
        name: "Distinguished Contributor",
        impact: "positive",
        weight: 0.15,
        description: "Your contribution history justifies premium positioning",
      });
      adjustmentMultiplier += 0.15;
    } else if (context.valueUnitBalance >= 500) {
      factors.push({
        name: "Trusted Contributor",
        impact: "positive",
        weight: 0.08,
        description: "Consistent contributions support higher rates",
      });
      adjustmentMultiplier += 0.08;
    }

    // Outcome success rate
    if (context.outcomeSuccessRate >= 95) {
      factors.push({
        name: "Exceptional Track Record",
        impact: "positive",
        weight: 0.25,
        description: "Near-perfect delivery record commands top rates",
      });
      adjustmentMultiplier += 0.25;
    } else if (context.outcomeSuccessRate >= 85) {
      factors.push({
        name: "Strong Track Record",
        impact: "positive",
        weight: 0.15,
        description: "Reliable delivery supports premium pricing",
      });
      adjustmentMultiplier += 0.15;
    } else if (context.outcomeSuccessRate < 70) {
      factors.push({
        name: "Improving Track Record",
        impact: "negative",
        weight: -0.1,
        description: "Focus on delivery to unlock higher rates",
      });
      adjustmentMultiplier -= 0.1;
    }

    // Market demand
    const demandMultiplier = DEMAND_MULTIPLIERS[context.marketDemand];
    if (context.marketDemand === "critical") {
      factors.push({
        name: "Critical Skill Demand",
        impact: "positive",
        weight: 0.6,
        description: "Your skills are in urgent demand",
      });
    } else if (context.marketDemand === "high") {
      factors.push({
        name: "High Market Demand",
        impact: "positive",
        weight: 0.3,
        description: "Strong demand for your skill category",
      });
    } else if (context.marketDemand === "low") {
      factors.push({
        name: "Competitive Market",
        impact: "negative",
        weight: -0.2,
        description: "Many providers available; differentiation matters",
      });
    }

    // Time commitment
    const timeMultiplier = TIME_MULTIPLIERS[context.timeCommitment];
    if (context.timeCommitment === "ongoing" || context.timeCommitment === "months") {
      factors.push({
        name: "Extended Commitment",
        impact: "positive",
        weight: timeMultiplier - 1,
        description: "Long-term engagement justifies premium rates",
      });
    }

    // Risk profile
    const riskAdjustment = RISK_ADJUSTMENTS[context.riskProfile];
    if (context.riskProfile === "high" || context.riskProfile === "elevated") {
      factors.push({
        name: "Risk Premium",
        impact: "positive",
        weight: riskAdjustment,
        description: "Higher risk warrants risk premium",
      });
    }

    // Calculate final ranges
    const totalMultiplier = adjustmentMultiplier * demandMultiplier * timeMultiplier * (1 + riskAdjustment);
    
    const min = Math.round(baseRange.min * totalMultiplier);
    const max = Math.round(baseRange.max * totalMultiplier);
    const optimal = Math.round((min + max) / 2);

    // Calculate success probabilities (simplified model)
    const baseSuccessRate = 0.7;
    const successAtMin = Math.min(0.95, baseSuccessRate + 0.2);
    const successAtOptimal = baseSuccessRate;
    const successAtMax = Math.max(0.3, baseSuccessRate - 0.25);

    // Market saturation (mock - would be from real data)
    const saturationLevels: Record<MarketDemandLevel, number> = {
      low: 80,
      moderate: 50,
      high: 30,
      critical: 15,
    };
    const marketSaturation = saturationLevels[context.marketDemand];

    let saturationWarning: string | undefined;
    if (marketSaturation > 70) {
      saturationWarning = "High competition in this category. Consider differentiating your offering or expanding skills.";
    } else if (marketSaturation > 50) {
      saturationWarning = "Moderate competition. Strong positioning and trust score will help you stand out.";
    }

    // Generate explanation
    const explanation = generatePricingExplanation(factors, context);

    const guidance: PricingGuidance = {
      suggestedRange: { min, optimal, max },
      currency: "PKR",
      successProbability: {
        atMin: successAtMin,
        atOptimal: successAtOptimal,
        atMax: successAtMax,
      },
      marketSaturation,
      saturationWarning,
      factors,
      explanation,
    };

    setLastGuidance(guidance);
    return guidance;
  }, []);

  // Generate human-readable explanation
  const generatePricingExplanation = (
    factors: PricingFactor[],
    context: PricingContext
  ): string => {
    const positiveFactors = factors.filter((f) => f.impact === "positive");
    const negativeFactors = factors.filter((f) => f.impact === "negative");

    let explanation = `Based on your profile and current market conditions, `;

    if (positiveFactors.length > negativeFactors.length) {
      explanation += `you have strong positioning for premium pricing. `;
      explanation += `Key strengths: ${positiveFactors.slice(0, 2).map((f) => f.name.toLowerCase()).join(", ")}. `;
    } else if (negativeFactors.length > positiveFactors.length) {
      explanation += `competitive pricing may help you win opportunities while building your reputation. `;
    } else {
      explanation += `the suggested range balances competitiveness with fair value. `;
    }

    explanation += `For ${context.projectComplexity} complexity projects requiring ${context.timeCommitment} commitment, `;
    explanation += `market demand is ${context.marketDemand}.`;

    return explanation;
  };

  // Quick pricing estimate without full context
  const getQuickEstimate = useCallback((
    complexity: ProjectComplexity,
    timeCommitment: TimeCommitment
  ): { min: number; max: number } => {
    const base = BASE_RATES[complexity];
    const multiplier = TIME_MULTIPLIERS[timeCommitment];
    
    return {
      min: Math.round(base.min * multiplier),
      max: Math.round(base.max * multiplier),
    };
  }, []);

  // Get market demand for a skill category
  const getMarketDemand = useCallback(async (
    skillCategory: string
  ): Promise<{ demand: MarketDemandLevel; openOpportunities: number; avgRate: number }> => {
    // Mock implementation - would query real market data
    const mockData: Record<string, { demand: MarketDemandLevel; opportunities: number; rate: number }> = {
      "machine_learning": { demand: "critical", opportunities: 45, rate: 150000 },
      "web_development": { demand: "high", opportunities: 120, rate: 50000 },
      "data_analysis": { demand: "high", opportunities: 80, rate: 60000 },
      "content_writing": { demand: "moderate", opportunities: 200, rate: 25000 },
      "graphic_design": { demand: "moderate", opportunities: 90, rate: 35000 },
    };

    const data = mockData[skillCategory] || { demand: "moderate" as MarketDemandLevel, opportunities: 50, rate: 40000 };

    return {
      demand: data.demand,
      openOpportunities: data.opportunities,
      avgRate: data.rate,
    };
  }, []);

  // Compare pricing to market
  const compareToMarket = useCallback((
    proposedPrice: number,
    category: string,
    complexity: ProjectComplexity
  ): { percentile: number; recommendation: string } => {
    const base = BASE_RATES[complexity];
    const marketMid = (base.min + base.max) / 2;

    const percentile = Math.round((proposedPrice / marketMid) * 50);

    let recommendation: string;
    if (percentile > 80) {
      recommendation = "Premium positioning. Ensure your profile and outcomes justify this rate.";
    } else if (percentile > 60) {
      recommendation = "Above average. Good positioning with strong credentials.";
    } else if (percentile > 40) {
      recommendation = "Market competitive. Balanced approach for steady opportunities.";
    } else if (percentile > 20) {
      recommendation = "Below average. May attract more volume but consider value perception.";
    } else {
      recommendation = "Significantly below market. Consider if this undervalues your work.";
    }

    return {
      percentile: Math.min(100, Math.max(0, percentile)),
      recommendation,
    };
  }, []);

  return {
    calculatePricing,
    getQuickEstimate,
    getMarketDemand,
    compareToMarket,
    lastGuidance,
    baseRates: BASE_RATES,
    demandMultipliers: DEMAND_MULTIPLIERS,
  };
}
