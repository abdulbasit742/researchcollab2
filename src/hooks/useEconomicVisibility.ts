import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// =====================================================
// ECONOMIC VISIBILITY: TRUST → MONEY CORRELATION
// =====================================================

export interface EconomicProfile {
  // Capital Account
  capitalAccount: {
    totalLifetimeEarnings: number;
    totalLifetimeSpent: number;
    currentBalance: number;
    escrowBalance: number;
    pendingPayouts: number;
  };
  // Trust Economics
  trustEconomics: {
    currentTrustScore: number;
    trustTier: "bronze" | "silver" | "gold" | "platinum";
    accessLevel: string;
    feeTier: number; // Lower trust = higher fees
    escrowRequirement: number; // Higher trust = lower escrow hold times
  };
  // ROI Metrics
  roi: {
    averageProjectEarnings: number;
    projectSuccessRate: number;
    repeatClientRate: number;
    timeToFirstEarning: number; // days
    earningsGrowthRate: number; // month over month %
  };
  // Cost Analysis
  costs: {
    platformFeesPaid: number;
    disputeLosses: number;
    opportunityCost: number; // Estimated value of missed opportunities due to low trust
  };
  // Value of Reliability
  reliabilityValue: {
    premiumEarned: number; // Extra $ earned due to high trust
    timesSaved: number; // Faster payouts, fewer gates
    opportunitiesUnlocked: number;
  };
}

export interface MarketInsight {
  skill: string;
  demandLevel: "low" | "medium" | "high";
  averageRate: number;
  topEarnerRate: number;
  projectsAvailable: number;
  competitorCount: number;
}

export interface EarningOpportunity {
  type: string;
  title: string;
  potentialEarnings: number;
  trustRequired: number;
  matchScore: number;
  timeCommitment: string;
}

export function useEconomicProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["economicProfile", user?.id],
    queryFn: async (): Promise<EconomicProfile | null> => {
      if (!user) return null;

      // Fetch wallet
      const { data: wallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch trust profile
      const { data: trustProfile } = await supabase
        .from("user_trust_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch consequence ledger
      const { data: ledger } = await supabase
        .from("consequence_ledgers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch transactions for fee analysis
      const { data: transactions } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("wallet_id", wallet?.id)
        .eq("type", "commission_deduction");

      const trustScore = trustProfile?.trust_score || 0;
      const trustTier = trustScore >= 80 ? "platinum" : trustScore >= 60 ? "gold" : trustScore >= 40 ? "silver" : "bronze";
      
      // Fee tier based on trust (lower trust = higher fees)
      const feeTier = trustTier === "platinum" ? 0.05 : trustTier === "gold" ? 0.08 : trustTier === "silver" ? 0.10 : 0.12;
      
      // Escrow hold time based on trust
      const escrowRequirement = trustTier === "platinum" ? 24 : trustTier === "gold" ? 48 : trustTier === "silver" ? 72 : 168;

      const totalFeesPaid = (transactions || []).reduce((acc: number, t: any) => acc + Math.abs(t.amount), 0);
      
      const projectsCompleted = ledger?.projects_completed || 0;
      const totalEarned = wallet?.total_earned || 0;
      const avgProjectEarnings = projectsCompleted > 0 ? totalEarned / projectsCompleted : 0;

      // Calculate reliability premium (extra earnings from high trust)
      const baselineRate = 0.10; // Assume bronze rate
      const currentRate = feeTier;
      const reliabilityPremium = totalEarned * (baselineRate - currentRate);

      return {
        capitalAccount: {
          totalLifetimeEarnings: totalEarned,
          totalLifetimeSpent: wallet?.total_spent || 0,
          currentBalance: wallet?.available_balance || 0,
          escrowBalance: wallet?.escrow_balance || 0,
          pendingPayouts: 0, // Would need pending withdrawals table
        },
        trustEconomics: {
          currentTrustScore: trustScore,
          trustTier,
          accessLevel: trustTier === "platinum" ? "Full Access" : trustTier === "gold" ? "Enhanced Access" : trustTier === "silver" ? "Standard Access" : "Basic Access",
          feeTier: feeTier * 100, // As percentage
          escrowRequirement, // hours
        },
        roi: {
          averageProjectEarnings: avgProjectEarnings,
          projectSuccessRate: ledger?.completion_rate || 0,
          repeatClientRate: 0, // Would need to calculate
          timeToFirstEarning: 0, // Would need account creation date
          earningsGrowthRate: 0, // Would need monthly breakdown
        },
        costs: {
          platformFeesPaid: totalFeesPaid,
          disputeLosses: ledger?.total_escrow_disputed || 0,
          opportunityCost: trustScore < 40 ? (100 - trustScore) * 100 : 0, // Estimated
        },
        reliabilityValue: {
          premiumEarned: Math.max(0, reliabilityPremium),
          timesSaved: trustTier === "platinum" ? 144 : trustTier === "gold" ? 96 : 0, // Hours saved on escrow holds
          opportunitiesUnlocked: trustScore >= 60 ? 5 : trustScore >= 40 ? 2 : 0,
        },
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarketInsights() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["marketInsights", user?.id],
    queryFn: async (): Promise<MarketInsight[]> => {
      const userSkills = profile?.interests || [];
      
      // Analyze market for each skill
      const insights: MarketInsight[] = [];

      for (const skill of userSkills.slice(0, 5)) {
        // Count projects with this skill tag
        const { count: projectCount } = await supabase
          .from("earning_projects")
          .select("*", { count: "exact", head: true })
          .eq("status", "open")
          .contains("tags", [skill]);

        // Get average budget for these projects
        const { data: projects } = await supabase
          .from("earning_projects")
          .select("budget_min, budget_max")
          .eq("status", "open")
          .contains("tags", [skill])
          .limit(20);

        const avgRate = projects && projects.length > 0
          ? (projects as any[]).reduce((acc, p) => acc + ((p.budget_min || 0) + (p.budget_max || 0)) / 2, 0) / projects.length
          : 15000;

        insights.push({
          skill,
          demandLevel: (projectCount || 0) > 10 ? "high" : (projectCount || 0) > 3 ? "medium" : "low",
          averageRate: avgRate,
          topEarnerRate: avgRate * 1.5,
          projectsAvailable: projectCount || 0,
          competitorCount: 0, // Would need to query users with this skill
        });
      }

      return insights;
    },
    enabled: !!user && (profile?.interests?.length || 0) > 0,
    staleTime: 10 * 60 * 1000,
  });
}

export function useEarningOpportunities() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["earningOpportunities", user?.id],
    queryFn: async (): Promise<EarningOpportunity[]> => {
      if (!user) return [];

      // Fetch trust profile for requirements matching
      const { data: trustProfile } = await supabase
        .from("user_trust_profiles")
        .select("trust_score")
        .eq("user_id", user.id)
        .maybeSingle();

      const userTrust = trustProfile?.trust_score || 0;

      // Fetch open projects
      const { data: projects } = await supabase
        .from("earning_projects")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(10);

      return (projects || []).map((p: any) => ({
        type: "project",
        title: p.title,
        potentialEarnings: ((p.budget_min || 0) + (p.budget_max || 0)) / 2,
        trustRequired: p.min_trust_score || 0,
        matchScore: Math.min(100, userTrust + 20),
        timeCommitment: p.deadline_days ? `${p.deadline_days} days` : "Flexible",
      }));
    },
    enabled: !!user,
  });
}

export function useTrustIncomeCorrelation() {
  return useQuery({
    queryKey: ["trustIncomeCorrelation"],
    queryFn: async () => {
      // This would aggregate anonymized platform data
      // For now, return illustrative data
      return {
        correlationCoefficient: 0.73,
        tiers: [
          { tier: "Bronze", avgMonthlyEarning: 15000, avgProjects: 1.2 },
          { tier: "Silver", avgMonthlyEarning: 35000, avgProjects: 2.5 },
          { tier: "Gold", avgMonthlyEarning: 75000, avgProjects: 4.0 },
          { tier: "Platinum", avgMonthlyEarning: 150000, avgProjects: 6.0 },
        ],
        insight: "Users with higher trust scores earn 10x more on average than those in the lowest tier.",
      };
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
