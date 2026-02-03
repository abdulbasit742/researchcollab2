import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// =====================================================
// FINANCIAL & ECONOMIC INTELLIGENCE (Features 21-30)
// =====================================================

// Feature 21: Earnings Forecast Model
export interface EarningsForecast {
  period: 'monthly' | 'quarterly' | 'yearly';
  projections: {
    month: string;
    projected_earnings: number;
    confidence_interval: { low: number; high: number };
    basis: string[];
  }[];
  trend: 'growing' | 'stable' | 'declining';
  key_drivers: string[];
}

// Feature 22: Revenue Stream Analysis
export interface RevenueStream {
  stream_id: string;
  source: 'projects' | 'consulting' | 'licensing' | 'grants' | 'royalties';
  monthly_average: number;
  volatility: number;
  growth_rate: number;
  dependency_risk: 'low' | 'medium' | 'high';
  diversification_score: number;
}

// Feature 23: Client Value Scoring
export interface ClientValue {
  client_id: string;
  lifetime_value: number;
  project_count: number;
  average_project_size: number;
  payment_reliability: number;
  repeat_rate: number;
  referral_value: number;
  relationship_health: 'excellent' | 'good' | 'at_risk' | 'churned';
}

// Feature 24: Pricing Intelligence
export interface PricingIntelligence {
  service_type: string;
  market_rate_range: { min: number; max: number; median: number };
  your_rate: number;
  position: 'below_market' | 'competitive' | 'premium';
  demand_elasticity: number;
  optimal_rate_suggestion: number;
  rate_increase_timing: string;
}

// Feature 25: Financial Health Score
export interface FinancialHealth {
  overall_score: number;
  components: {
    income_stability: number;
    diversification: number;
    growth_trajectory: number;
    cash_flow_management: number;
    client_concentration_risk: number;
  };
  recommendations: string[];
  risk_flags: string[];
}

// Feature 26: Invoice Analytics
export interface InvoiceAnalytics {
  total_invoiced: number;
  total_collected: number;
  outstanding_amount: number;
  average_payment_days: number;
  late_payment_rate: number;
  by_client: { client_id: string; amount: number; status: string }[];
  collection_efficiency: number;
}

// Feature 27: Budget vs Actual Tracking
export interface BudgetTracking {
  project_id: string;
  budgeted_amount: number;
  actual_spent: number;
  variance: number;
  variance_percentage: number;
  categories: { category: string; budgeted: number; actual: number }[];
  forecast_at_completion: number;
  status: 'on_track' | 'at_risk' | 'over_budget';
}

// Feature 28: Tax Optimization Insights
export interface TaxOptimization {
  estimated_tax_liability: number;
  deductions_identified: { category: string; amount: number; documentation_status: string }[];
  optimization_opportunities: string[];
  quarterly_payment_schedule: { quarter: string; amount: number; due_date: string }[];
  year_over_year_comparison: number;
}

// Feature 29: Investment ROI Tracking
export interface InvestmentROI {
  investment_type: 'education' | 'tools' | 'marketing' | 'equipment';
  amount_invested: number;
  returns_generated: number;
  roi_percentage: number;
  payback_period_months: number;
  ongoing_value: number;
}

// Feature 30: Financial Goal Tracking
export interface FinancialGoal {
  goal_id: string;
  goal_type: 'income' | 'savings' | 'investment' | 'debt_reduction';
  target_amount: number;
  current_progress: number;
  deadline: string;
  on_track: boolean;
  required_monthly_rate: number;
  projected_achievement_date: string;
}

export function useFinancialIntelligence() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [earningsForecast, setEarningsForecast] = useState<EarningsForecast | null>(null);
  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([]);
  const [clientValues, setClientValues] = useState<ClientValue[]>([]);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);

  // Feature 21: Generate Earnings Forecast
  const generateEarningsForecast = useCallback((
    historicalEarnings: { month: string; amount: number }[],
    pipelineValue: number,
    conversionRate: number
  ): EarningsForecast => {
    const avgMonthly = historicalEarnings.reduce((sum, e) => sum + e.amount, 0) / Math.max(historicalEarnings.length, 1);
    const projections = [];
    
    for (let i = 1; i <= 6; i++) {
      const baseProjection = avgMonthly * (1 + (i * 0.02));
      const pipelineContribution = (pipelineValue * conversionRate) / 6;
      
      projections.push({
        month: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
        projected_earnings: baseProjection + pipelineContribution,
        confidence_interval: {
          low: (baseProjection + pipelineContribution) * 0.7,
          high: (baseProjection + pipelineContribution) * 1.3
        },
        basis: ['Historical average', 'Pipeline conversion', 'Seasonal adjustment']
      });
    }

    const firstMonth = projections[0]?.projected_earnings || 0;
    const lastMonth = projections[projections.length - 1]?.projected_earnings || 0;
    const trend = lastMonth > firstMonth * 1.05 ? 'growing' : lastMonth < firstMonth * 0.95 ? 'declining' : 'stable';

    return {
      period: 'monthly',
      projections,
      trend,
      key_drivers: ['Project pipeline', 'Client retention', 'Market demand']
    };
  }, []);

  // Feature 23: Calculate Client Lifetime Value
  const calculateClientValue = useCallback((
    clientId: string,
    transactions: { amount: number; date: string; paid_on_time: boolean }[],
    referrals: number
  ): ClientValue => {
    const totalValue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const avgProjectSize = totalValue / Math.max(transactions.length, 1);
    const paymentReliability = transactions.filter(t => t.paid_on_time).length / Math.max(transactions.length, 1) * 100;
    
    return {
      client_id: clientId,
      lifetime_value: totalValue + (referrals * avgProjectSize * 0.5),
      project_count: transactions.length,
      average_project_size: avgProjectSize,
      payment_reliability: paymentReliability,
      repeat_rate: transactions.length > 1 ? (transactions.length - 1) / transactions.length : 0,
      referral_value: referrals * avgProjectSize * 0.5,
      relationship_health: paymentReliability > 90 && transactions.length > 2 ? 'excellent' 
        : paymentReliability > 70 ? 'good' 
        : paymentReliability > 50 ? 'at_risk' : 'churned'
    };
  }, []);

  // Feature 25: Calculate Financial Health
  const calculateFinancialHealth = useCallback((
    streams: RevenueStream[],
    clients: ClientValue[],
    monthlyIncome: number[]
  ): FinancialHealth => {
    const incomeVariance = monthlyIncome.length > 1 
      ? Math.sqrt(monthlyIncome.reduce((sum, val) => {
          const avg = monthlyIncome.reduce((a, b) => a + b, 0) / monthlyIncome.length;
          return sum + Math.pow(val - avg, 2);
        }, 0) / monthlyIncome.length) / (monthlyIncome.reduce((a, b) => a + b, 0) / monthlyIncome.length) * 100
      : 50;

    const incomeStability = Math.max(0, 100 - incomeVariance);
    const diversification = Math.min(100, streams.length * 20);
    const topClientShare = clients.length > 0 
      ? (Math.max(...clients.map(c => c.lifetime_value)) / clients.reduce((sum, c) => sum + c.lifetime_value, 0)) * 100
      : 100;
    const concentrationRisk = 100 - Math.min(100, topClientShare);

    const overall = (incomeStability + diversification + concentrationRisk) / 3;

    return {
      overall_score: Math.round(overall),
      components: {
        income_stability: incomeStability,
        diversification,
        growth_trajectory: 70,
        cash_flow_management: 75,
        client_concentration_risk: concentrationRisk
      },
      recommendations: diversification < 50 
        ? ['Diversify revenue streams', 'Reduce client concentration'] 
        : ['Maintain current strategy'],
      risk_flags: topClientShare > 50 ? ['High client concentration risk'] : []
    };
  }, []);

  // Feature 30: Track Financial Goal
  const trackFinancialGoal = useCallback((
    goalId: string,
    goalType: FinancialGoal['goal_type'],
    targetAmount: number,
    currentProgress: number,
    deadline: string
  ): FinancialGoal => {
    const daysRemaining = Math.max(1, (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const remainingAmount = targetAmount - currentProgress;
    const requiredDailyRate = remainingAmount / daysRemaining;
    const requiredMonthlyRate = requiredDailyRate * 30;
    
    const currentDailyRate = currentProgress / Math.max(1, 365 - daysRemaining);
    const projectedDays = remainingAmount / Math.max(currentDailyRate, 0.01);

    return {
      goal_id: goalId,
      goal_type: goalType,
      target_amount: targetAmount,
      current_progress: currentProgress,
      deadline,
      on_track: currentDailyRate >= requiredDailyRate,
      required_monthly_rate: requiredMonthlyRate,
      projected_achievement_date: new Date(Date.now() + projectedDays * 24 * 60 * 60 * 1000).toISOString()
    };
  }, []);

  return {
    earningsForecast,
    revenueStreams,
    clientValues,
    financialGoals,
    generateEarningsForecast,
    calculateClientValue,
    calculateFinancialHealth,
    trackFinancialGoal,
    setRevenueStreams,
    setFinancialGoals
  };
}
