import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// =====================================================
// PROFESSIONAL PROGRESS DASHBOARD DATA
// =====================================================

export interface TrustTrajectory {
  current: number;
  peak: number;
  lowest: number;
  trend: "improving" | "stable" | "declining";
  recentEvents: {
    date: string;
    delta: number;
    reason: string;
  }[];
  projectedNextMonth: number;
}

export interface OpportunityQuality {
  currentTier: "bronze" | "silver" | "gold" | "platinum";
  averageBudget: number;
  averageBudgetTrend: "up" | "stable" | "down";
  matchQuality: number;
  matchQualityTrend: "up" | "stable" | "down";
  opportunitiesThisMonth: number;
  opportunitiesLastMonth: number;
}

export interface EconomicOutcomes {
  totalEarned: number;
  totalEarnedThisMonth: number;
  totalEarnedLastMonth: number;
  escrowCurrently: number;
  escrowReleased: number;
  escrowDisputed: number;
  averageProjectValue: number;
  roi: number; // value gained vs time invested
}

export interface SkillMomentum {
  provenSkills: {
    name: string;
    projectsUsed: number;
    successRate: number;
    lastUsed: string;
  }[];
  emergingSkills: string[];
  skillGaps: string[];
  recommendedNextSkill: string;
}

export interface RelationshipStrength {
  totalConnections: number;
  activeCollaborators: number;
  institutionalTies: number;
  repeatCollaborators: number;
  networkGrowthTrend: "growing" | "stable" | "shrinking";
}

export interface ProfessionalProgress {
  trustTrajectory: TrustTrajectory;
  opportunityQuality: OpportunityQuality;
  economicOutcomes: EconomicOutcomes;
  skillMomentum: SkillMomentum;
  relationshipStrength: RelationshipStrength;
  overallMomentum: "accelerating" | "steady" | "slowing";
  nextMilestone: {
    name: string;
    progress: number;
    estimatedDays: number;
  };
}

export function useProgressDashboard() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["progressDashboard", user?.id],
    queryFn: async (): Promise<ProfessionalProgress | null> => {
      if (!user) return null;

      // Fetch trust data
      const { data: trustProfile } = await supabase
        .from("user_trust_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch trust history
      const { data: trustEvents } = await supabase
        .from("trust_events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch consequence ledger
      const { data: ledger } = await supabase
        .from("consequence_ledgers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch wallet data
      const { data: wallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch work connections
      const { data: connections } = await supabase
        .from("work_connections")
        .select("*")
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);

      // Fetch accountability records for skills analysis
      const { data: records } = await supabase
        .from("accountability_records")
        .select("*")
        .eq("executor_id", user.id)
        .eq("outcome_status", "completed");

      // Calculate trust trajectory
      const currentTrust = trustProfile?.trust_score || 0;
      const recentTrustChanges = (trustEvents || []).slice(0, 5).map((e: any) => ({
        date: e.created_at,
        delta: e.trust_delta,
        reason: e.event_source || "System update",
      }));

      const trustTrend = (() => {
        if (recentTrustChanges.length < 2) return "stable";
        const recentSum = recentTrustChanges.reduce((acc, e) => acc + e.delta, 0);
        if (recentSum > 5) return "improving";
        if (recentSum < -5) return "declining";
        return "stable";
      })();

      // Calculate opportunity quality
      const trustTier = currentTrust >= 80 ? "platinum" : currentTrust >= 60 ? "gold" : currentTrust >= 40 ? "silver" : "bronze";

      // Calculate economic outcomes
      const totalEarned = wallet?.total_earned || 0;
      const escrowBalance = wallet?.escrow_balance || 0;
      const escrowReleased = ledger?.total_escrow_released || 0;
      const escrowDisputed = ledger?.total_escrow_disputed || 0;
      const projectsCompleted = ledger?.projects_completed || 0;
      const avgProjectValue = projectsCompleted > 0 ? totalEarned / projectsCompleted : 0;

      // Calculate skill momentum
      const provenSkills: ProfessionalProgress["skillMomentum"]["provenSkills"] = [];
      const userInterests = profile?.interests || [];
      
      for (const skill of userInterests) {
        const projectsWithSkill = (records || []).filter(r => 
          (r.promised_deliverables || []).some((d: string) => 
            d.toLowerCase().includes(skill.toLowerCase())
          )
        );
        if (projectsWithSkill.length > 0) {
          provenSkills.push({
            name: skill,
            projectsUsed: projectsWithSkill.length,
            successRate: 100, // All records are completed
            lastUsed: projectsWithSkill[0]?.updated_at || new Date().toISOString(),
          });
        }
      }

      // Calculate relationship strength
      const totalConnections = (connections || []).length;
      const activeCollaborators = (connections || []).filter((c: any) => 
        c.last_interaction && 
        new Date(c.last_interaction) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      ).length;

      // Determine overall momentum
      const overallMomentum = (() => {
        const scores = [
          trustTrend === "improving" ? 1 : trustTrend === "declining" ? -1 : 0,
          totalEarned > 0 ? 1 : 0,
          provenSkills.length > 0 ? 1 : 0,
        ];
        const sum = scores.reduce((a, b) => a + b, 0);
        if (sum >= 2) return "accelerating";
        if (sum <= -1) return "slowing";
        return "steady";
      })();

      // Determine next milestone
      const nextMilestone = (() => {
        if (!trustProfile?.is_verified_student && !trustProfile?.is_verified_researcher) {
          return { name: "Get Verified", progress: 0, estimatedDays: 3 };
        }
        if (currentTrust < 40) {
          return { name: "Reach Silver Tier", progress: (currentTrust / 40) * 100, estimatedDays: 14 };
        }
        if (currentTrust < 60) {
          return { name: "Reach Gold Tier", progress: ((currentTrust - 40) / 20) * 100, estimatedDays: 30 };
        }
        if (currentTrust < 80) {
          return { name: "Reach Platinum Tier", progress: ((currentTrust - 60) / 20) * 100, estimatedDays: 60 };
        }
        return { name: "Maintain Excellence", progress: 100, estimatedDays: 0 };
      })();

      return {
        trustTrajectory: {
          current: currentTrust,
          peak: ledger?.trust_score_peak || currentTrust,
          lowest: ledger?.trust_score_lowest || currentTrust,
          trend: trustTrend as "improving" | "stable" | "declining",
          recentEvents: recentTrustChanges,
          projectedNextMonth: Math.min(100, currentTrust + (trustTrend === "improving" ? 5 : trustTrend === "declining" ? -3 : 0)),
        },
        opportunityQuality: {
          currentTier: trustTier as "bronze" | "silver" | "gold" | "platinum",
          averageBudget: avgProjectValue,
          averageBudgetTrend: "stable",
          matchQuality: Math.min(100, currentTrust + 20),
          matchQualityTrend: trustTrend === "improving" ? "up" : trustTrend === "declining" ? "down" : "stable",
          opportunitiesThisMonth: 0, // Would need more data
          opportunitiesLastMonth: 0,
        },
        economicOutcomes: {
          totalEarned,
          totalEarnedThisMonth: 0, // Would need date filtering
          totalEarnedLastMonth: 0,
          escrowCurrently: escrowBalance,
          escrowReleased,
          escrowDisputed,
          averageProjectValue: avgProjectValue,
          roi: projectsCompleted > 0 ? (totalEarned / (projectsCompleted * 10)) : 0, // Simplified
        },
        skillMomentum: {
          provenSkills,
          emergingSkills: [],
          skillGaps: [],
          recommendedNextSkill: provenSkills.length === 0 ? "Complete your first project" : "Expand to related skills",
        },
        relationshipStrength: {
          totalConnections,
          activeCollaborators,
          institutionalTies: ledger?.verified_associations || 0,
          repeatCollaborators: 0,
          networkGrowthTrend: totalConnections > 5 ? "growing" : "stable",
        },
        overallMomentum,
        nextMilestone,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export interface ProfessionalGoal {
  id: string;
  goal_type: string;
  title: string;
  target_value: number;
  current_value: number;
  deadline: string | null;
  is_completed: boolean;
}

export function useProfessionalGoals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["professionalGoals", user?.id],
    queryFn: async (): Promise<ProfessionalGoal[]> => {
      if (!user) return [];

      // Return default goals since the table doesn't exist yet
      // These serve as a starting point for users
      return [
        {
          id: "1",
          goal_type: "trust",
          title: "Reach Silver Trust Tier",
          target_value: 40,
          current_value: 0,
          deadline: null,
          is_completed: false,
        },
        {
          id: "2",
          goal_type: "projects",
          title: "Complete 3 Projects",
          target_value: 3,
          current_value: 0,
          deadline: null,
          is_completed: false,
        },
      ];
    },
    enabled: !!user,
  });
}
