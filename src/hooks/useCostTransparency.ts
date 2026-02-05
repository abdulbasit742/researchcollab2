/**
 * System 33: Cost Transparency & Value Explanation
 * Replace "Platform fee" with "What this enables"
 */

import { useCallback, useMemo } from "react";
import {
  CostBreakdown,
  CostComponent,
  ValueExplanation,
  MarketComparison,
  CalculatedFee,
  PlatformFeeConfig,
  TrustDiscount,
  VolumeDiscount,
} from "@/types/economic-engine";

// Platform fee configuration
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
  minimumFee: 100,
  maximumFee: 100000,
};

// Value allocation breakdown
const VALUE_ALLOCATION = {
  platformOperations: 0.30, // 30% - Infrastructure, security, support
  trustSystem: 0.20, // 20% - Trust computation, verification
  escrowProtection: 0.20, // 20% - Escrow management, dispute resolution
  communityDevelopment: 0.15, // 15% - Features, improvements
  safetyReserve: 0.15, // 15% - Safety net for disputes, fraud protection
};

export function useCostTransparency() {
  // Calculate fee with full transparency
  const calculateFee = useCallback((
    grossAmount: number,
    trustScore: number,
    monthlyVolume: number,
    category?: string
  ): CalculatedFee => {
    let baseFee = grossAmount * (PLATFORM_FEE_CONFIG.baseFeePercentage / 100);

    // Apply trust discount
    let trustDiscount = 0;
    for (const discount of PLATFORM_FEE_CONFIG.trustDiscounts) {
      if (trustScore >= discount.minTrustScore) {
        trustDiscount = baseFee * (discount.discountPercentage / 100);
        break;
      }
    }

    // Apply volume discount
    let volumeDiscount = 0;
    for (const discount of PLATFORM_FEE_CONFIG.volumeDiscounts) {
      if (monthlyVolume >= discount.minMonthlyVolume) {
        volumeDiscount = baseFee * (discount.discountPercentage / 100);
        break;
      }
    }

    // Apply category adjustment
    let categoryAdjustment = 0;
    if (category) {
      const adjustment = PLATFORM_FEE_CONFIG.categoryAdjustments.find(
        (a) => a.category === category
      );
      if (adjustment) {
        categoryAdjustment = baseFee * (adjustment.adjustmentPercentage / 100);
      }
    }

    // Calculate net fee
    let netFee = baseFee - trustDiscount - volumeDiscount + categoryAdjustment;
    netFee = Math.max(PLATFORM_FEE_CONFIG.minimumFee, netFee);
    netFee = Math.min(PLATFORM_FEE_CONFIG.maximumFee, netFee);

    const effectiveRate = (netFee / grossAmount) * 100;

    // Generate breakdown
    const breakdown = generateBreakdown(netFee, category);

    return {
      grossAmount,
      baseFee,
      trustDiscount,
      volumeDiscount,
      categoryAdjustment,
      netFee,
      effectiveRate,
      breakdown,
    };
  }, []);

  // Generate detailed cost breakdown
  const generateBreakdown = useCallback((
    totalFee: number,
    category?: string
  ): CostBreakdown => {
    const components: CostComponent[] = [
      {
        name: "Platform Operations",
        amount: totalFee * VALUE_ALLOCATION.platformOperations,
        percentage: VALUE_ALLOCATION.platformOperations * 100,
        recipient: "RCollab Platform",
        purpose: "Secure infrastructure, 24/7 availability, customer support",
        ecosystemBenefit: "Ensures reliable service for all users",
      },
      {
        name: "Trust System",
        amount: totalFee * VALUE_ALLOCATION.trustSystem,
        percentage: VALUE_ALLOCATION.trustSystem * 100,
        recipient: "Trust Infrastructure",
        purpose: "Trust score computation, verification processes, fraud prevention",
        ecosystemBenefit: "Maintains platform integrity and user safety",
      },
      {
        name: "Escrow Protection",
        amount: totalFee * VALUE_ALLOCATION.escrowProtection,
        percentage: VALUE_ALLOCATION.escrowProtection * 100,
        recipient: "Payment Security",
        purpose: "Secure fund holding, milestone management, payment processing",
        ecosystemBenefit: "Protects both buyers and sellers in every transaction",
      },
      {
        name: "Community Development",
        amount: totalFee * VALUE_ALLOCATION.communityDevelopment,
        percentage: VALUE_ALLOCATION.communityDevelopment * 100,
        recipient: "Product Development",
        purpose: "New features, platform improvements, user-requested enhancements",
        ecosystemBenefit: "Continuous improvement based on user feedback",
      },
      {
        name: "Safety Reserve",
        amount: totalFee * VALUE_ALLOCATION.safetyReserve,
        percentage: VALUE_ALLOCATION.safetyReserve * 100,
        recipient: "Protection Fund",
        purpose: "Dispute resolution, fraud recovery, exceptional case handling",
        ecosystemBenefit: "Provides safety net for unexpected situations",
      },
    ];

    const valueExplanation: ValueExplanation = {
      whatThisEnables: [
        "Secure escrow protection for your payment",
        "Trust verification of counterparties",
        "24/7 platform availability and support",
        "Dispute resolution if issues arise",
        "Continuous platform improvements",
      ],
      whoBenefits: [
        { beneficiary: "You (the user)", impact: "Protected transactions, verified counterparties", percentage: 40 },
        { beneficiary: "Your counterparty", impact: "Guaranteed payment upon delivery", percentage: 30 },
        { beneficiary: "Platform community", impact: "Trust infrastructure, safety net", percentage: 30 },
      ],
      ecosystemImpact: "This fee maintains a trustworthy marketplace where professionals can transact safely.",
      trustContribution: 5, // Fee contributes to trust system maintenance
    };

    return {
      totalCost: totalFee,
      currency: "PKR",
      components,
      valueExplanation,
    };
  }, []);

  // Compare to market rates
  const compareToMarket = useCallback((
    ourFee: number,
    transactionAmount: number
  ): MarketComparison => {
    // Industry average platform fees (approximate)
    const marketAverageRate = 0.15; // 15%
    const marketAverage = transactionAmount * marketAverageRate;
    const savings = marketAverage - ourFee;
    const savingsPercentage = (savings / marketAverage) * 100;

    return {
      marketAverage,
      ourCost: ourFee,
      savings: Math.max(0, savings),
      savingsPercentage: Math.max(0, savingsPercentage),
      differentiators: [
        "Trust-based fee discounts (up to 20% off)",
        "Volume discounts for regular users",
        "No hidden fees or surprise charges",
        "Full escrow protection included",
        "Dispute resolution at no extra cost",
      ],
    };
  }, []);

  // Explain a specific cost component
  const explainComponent = useCallback((componentName: string): string => {
    const explanations: Record<string, string> = {
      "Platform Operations": `
        This covers the fundamental infrastructure that keeps RCollab running:
        • Secure servers and data protection
        • 24/7 monitoring and uptime
        • Customer support team
        • Payment processing infrastructure
        
        Without this, the platform couldn't exist as a trusted space for professionals.
      `,
      "Trust System": `
        Your trust score is computed using sophisticated algorithms that:
        • Analyze outcome history and reliability
        • Verify credentials and claims
        • Detect and prevent fraud
        • Maintain fairness in matching
        
        This system ensures you only work with verified, trustworthy counterparties.
      `,
      "Escrow Protection": `
        Every transaction is protected by our escrow system:
        • Funds held securely until work is approved
        • Milestone-based release for complex projects
        • Automatic dispute escalation
        • Fraud protection and recovery
        
        This protects both parties in every transaction.
      `,
      "Community Development": `
        This funds ongoing platform improvements:
        • New features based on user feedback
        • Better matching algorithms
        • Mobile apps and accessibility
        • Integration with tools you use
        
        Your fees directly fund making the platform better.
      `,
      "Safety Reserve": `
        This reserve handles exceptional situations:
        • Dispute resolution costs
        • Fraud recovery for victims
        • Edge cases requiring manual intervention
        • Emergency platform maintenance
        
        This ensures RCollab can handle any situation that arises.
      `,
    };

    return explanations[componentName] || "No detailed explanation available.";
  }, []);

  // Get fee estimate with explanation
  const getEstimateWithExplanation = useCallback((
    amount: number,
    trustScore: number = 50,
    monthlyVolume: number = 0
  ): {
    fee: number;
    effectiveRate: string;
    savings: string;
    explanation: string;
  } => {
    const calculated = calculateFee(amount, trustScore, monthlyVolume);
    const comparison = compareToMarket(calculated.netFee, amount);

    let explanation = `Your fee of PKR ${calculated.netFee.toLocaleString()} (${calculated.effectiveRate.toFixed(1)}%) `;
    
    if (calculated.trustDiscount > 0) {
      explanation += `includes a trust discount of PKR ${calculated.trustDiscount.toLocaleString()} `;
    }
    
    if (comparison.savings > 0) {
      explanation += `and saves you PKR ${comparison.savings.toLocaleString()} compared to industry average. `;
    }

    explanation += "This fee enables secure escrow, trust verification, and dispute protection.";

    return {
      fee: calculated.netFee,
      effectiveRate: `${calculated.effectiveRate.toFixed(1)}%`,
      savings: comparison.savings > 0 ? `PKR ${comparison.savings.toLocaleString()}` : "N/A",
      explanation,
    };
  }, [calculateFee, compareToMarket]);

  return {
    calculateFee,
    generateBreakdown,
    compareToMarket,
    explainComponent,
    getEstimateWithExplanation,
    config: PLATFORM_FEE_CONFIG,
    valueAllocation: VALUE_ALLOCATION,
  };
}
