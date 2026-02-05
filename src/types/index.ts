 // ============================================
 // TYPE EXPORTS
 // ============================================
 
 // Notification context types
 export * from "./notification-context";
 
 // Universal Professional Object Model
 export * from "./upom";
 
 // Economic Engine types (excluding duplicates)
 export type {
   ContributionCategory,
   ValueUnitSource,
   ValueUnitBalance,
   ValueUnitTier,
   ValueUnitDecayConfig,
   PricingContext,
   PricingGuidance,
   PricingFactor,
   MarketDemandLevel,
   ProjectComplexity,
   TimeCommitment,
   RiskProfile,
   RevenueShareContract,
   RevenueModelType,
   ContractParty,
   RevenueTerms,
   ContractSimulation,
   IncentiveRule,
   IncentiveAlignmentScore,
   CostBreakdown,
   CostComponent,
   ValueExplanation,
   InstitutionalBudget,
   BudgetAllocation,
   InstitutionalROI,
   FundingFlow,
   EconomicSafetyProfile,
   SafetyFlag,
   EconomicTrajectory,
   LifetimeEconomicMetrics,
   PeriodMetrics,
   EconomicProjection,
   NationalEconomicInsights,
   PlatformFeeConfig,
   CalculatedFee,
 } from "./economic-engine";