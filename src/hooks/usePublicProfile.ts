import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AccountabilityRecord } from "@/hooks/useAccountability";

export interface PublicProfileData {
  // Basic profile
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: string | null;
  university: string | null;
  department: string | null;
  location: string | null;
  bio: string | null;
  interests: string[];
  
  // Trust data
  trustScore: number;
  trustTier: "bronze" | "silver" | "gold" | "platinum";
  verificationLevel: string | null;
  isVerified: boolean;
  
  // Work metrics
  projectsCompleted: number;
  projectsPosted: number;
  successRate: number;
  escrowSuccessRate: number;
  onTimeRate: number;
  disputeRate: number;
  trustTrajectory: "rising" | "falling" | "stable";
  
  // Work history
  workHistory: AccountabilityRecord[];
  
  // Skills
  provenSkills: { name: string; projectCount: number; isProven: boolean }[];
  claimedSkills: string[];
  
  // Portfolio
  portfolioProjects: {
    id: string;
    title: string;
    description: string | null;
    link: string | null;
    thumbnail_url: string | null;
  }[];
}

export function usePublicProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["publicProfile", userId],
    queryFn: async (): Promise<PublicProfileData | null> => {
      if (!userId) return null;

      // Fetch all data in parallel
      const [
        profileResult,
        trustProfileResult,
        consequenceLedgerResult,
        accountabilityResult,
        userSkillsResult,
        portfolioResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("user_trust_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("consequence_ledgers")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("accountability_records")
          .select("*")
          .or(`initiator_id.eq.${userId},executor_id.eq.${userId}`)
          .eq("is_public", true)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("user_skills")
          .select("*")
          .eq("user_id", userId)
          .order("proficiency_level", { ascending: false }),
        supabase
          .from("portfolio_projects")
          .select("*")
          .eq("user_id", userId)
          .order("display_order", { ascending: true }),
      ]);

      if (!profileResult.data) return null;

      const profile = profileResult.data;
      const trustProfile = trustProfileResult.data;
      const ledger = consequenceLedgerResult.data;
      const accountabilityRecords = accountabilityResult.data || [];
      const userSkills = userSkillsResult.data || [];
      const portfolio = portfolioResult.data || [];

      // Enrich accountability records with names
      const enrichedRecords = await Promise.all(
        accountabilityRecords.map(async (record: any) => {
          const [initiatorResult, executorResult] = await Promise.all([
            supabase
              .from("profiles")
              .select("full_name")
              .eq("id", record.initiator_id)
              .maybeSingle(),
            supabase
              .from("profiles")
              .select("full_name")
              .eq("id", record.executor_id)
              .maybeSingle(),
          ]);
          return {
            ...record,
            initiator_name: initiatorResult.data?.full_name || "Unknown",
            executor_name: executorResult.data?.full_name || "Unknown",
          };
        })
      );

      // Calculate proven skills from completed work
      const completedRecords = enrichedRecords.filter(
        (r: any) => r.outcome_status === "completed"
      );
      
      // Extract skills from completed projects (using deliverables as proxy)
      const skillCounts: Record<string, number> = {};
      completedRecords.forEach((record: any) => {
        if (record.promised_deliverables) {
          // Simple skill extraction from deliverables
          record.promised_deliverables.forEach((deliverable: string) => {
            const words = deliverable.toLowerCase().split(/\s+/);
            words.forEach(word => {
              if (word.length > 3) {
                skillCounts[word] = (skillCounts[word] || 0) + 1;
              }
            });
          });
        }
      });

      // Build proven skills list
      const provenSkills = userSkills.map((skill: any) => ({
        name: skill.skill_name,
        projectCount: completedRecords.length, // Simplified
        isProven: completedRecords.length > 0,
      }));

      // Get claimed skills from interests
      const claimedSkills = profile.interests || [];

      // Determine trust tier
      const trustScore = trustProfile?.trust_score || 0;
      let trustTier: "bronze" | "silver" | "gold" | "platinum" = "bronze";
      if (trustScore >= 80) trustTier = "platinum";
      else if (trustScore >= 60) trustTier = "gold";
      else if (trustScore >= 40) trustTier = "silver";

      // Determine trajectory
      let trustTrajectory: "rising" | "falling" | "stable" = ledger?.trust_trajectory as any || "stable";

      return {
        id: profile.id,
        fullName: profile.full_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User",
        avatarUrl: null, // Avatar URL not in current schema
        role: profile.role,
        university: profile.university,
        department: profile.department,
        location: profile.location,
        bio: null, // Bio not in current schema
        interests: profile.interests || [],
        
        trustScore,
        trustTier,
        verificationLevel: trustProfile?.verification_level || null,
        isVerified: 
          trustProfile?.verification_level === "verified" ||
          trustProfile?.is_verified_researcher ||
          trustProfile?.is_verified_student,
        
        projectsCompleted: ledger?.projects_completed || trustProfile?.total_projects_completed || 0,
        projectsPosted: trustProfile?.total_projects_posted || 0,
        successRate: ledger?.completion_rate || trustProfile?.successful_rate || 0,
        escrowSuccessRate: ledger?.escrow_success_rate || 0,
        onTimeRate: ledger?.on_time_rate || 0,
        disputeRate: trustProfile?.dispute_rate || 0,
        trustTrajectory,
        
        workHistory: enrichedRecords,
        provenSkills,
        claimedSkills,
        portfolioProjects: portfolio,
      };
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
