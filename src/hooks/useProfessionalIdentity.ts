import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PrimaryRole = "researcher" | "student" | "freelancer" | "mentor" | "institution_rep" | "unknown";

export interface ProfessionalIdentity {
  userId: string;
  primaryRole: PrimaryRole;
  headline: string;
  capabilityTags: string[];
  trustScore: number;
  trustTier: "bronze" | "silver" | "gold" | "platinum";
  projectsCompleted: number;
  escrowSuccess: number;
  institutionsWorkedWith: string[];
  isVerified: boolean;
  lastActive: string | null;
}

export interface ProfileReadiness {
  score: number; // 0-100
  missingItems: {
    key: string;
    label: string;
    action: string;
    priority: "high" | "medium" | "low";
    unlocksFeature?: string;
  }[];
  nextAction: string | null;
}

export function useProfessionalIdentity(userId?: string) {
  const { user, profile } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ["professionalIdentity", targetId],
    queryFn: async (): Promise<ProfessionalIdentity | null> => {
      if (!targetId) return null;

      // Fetch base profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetId)
        .maybeSingle();

      if (!profileData) return null;

      // Fetch trust profile
      const { data: trustProfile } = await supabase
        .from("user_trust_profiles")
        .select("trust_score, trust_tier, verification_level, is_verified_researcher, is_verified_student")
        .eq("user_id", targetId)
        .maybeSingle();

      // Fetch proof metrics
      const { data: proofMetrics } = await supabase
        .from("profile_proof_metrics")
        .select("*")
        .eq("user_id", targetId)
        .maybeSingle();

      // Fetch user skills for capability tags
      const { data: userSkills } = await supabase
        .from("user_skills")
        .select("skill_name, proficiency_level")
        .eq("user_id", targetId)
        .order("proficiency_level", { ascending: false })
        .limit(5);

      // Get skill names
      let capabilityTags: string[] = [];
      if (userSkills && userSkills.length > 0) {
        capabilityTags = userSkills.map((s: any) => s.skill_name);
      }

      // Fall back to interests if no skills
      if (capabilityTags.length === 0 && profileData.interests) {
        capabilityTags = profileData.interests.slice(0, 5);
      }

      // Determine primary role from profile data and activity
      const primaryRole = determinePrimaryRole(profileData, proofMetrics);

      // Generate headline
      const headline = generateHeadline(profileData, primaryRole, proofMetrics);

      const trustScore = (trustProfile as any)?.trust_score || 0;
      const trustTier = getTrustTier(trustScore);
      const isVerified = (trustProfile as any)?.verification_level === "verified" ||
                         (trustProfile as any)?.is_verified_researcher ||
                         (trustProfile as any)?.is_verified_student;

      return {
        userId: targetId,
        primaryRole,
        headline,
        capabilityTags,
        trustScore,
        trustTier,
        projectsCompleted: proofMetrics?.projects_completed || 0,
        escrowSuccess: proofMetrics?.escrow_success_rate || 0,
        institutionsWorkedWith: proofMetrics?.institutions_worked_with || [],
        isVerified: !!isVerified,
        lastActive: proofMetrics?.last_activity_at || null,
      };
    },
    enabled: !!targetId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useProfileReadiness() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["profileReadiness", user?.id],
    queryFn: async (): Promise<ProfileReadiness> => {
      if (!user || !profile) {
        return { score: 0, missingItems: [], nextAction: "Sign in to continue" };
      }

      const missingItems: ProfileReadiness["missingItems"] = [];
      let score = 0;

      // Check profile basics (30 points)
      if (profile.full_name) {
        score += 10;
      } else {
        missingItems.push({
          key: "name",
          label: "Add your full name",
          action: "/profile",
          priority: "high",
        });
      }

      if (profile.university) {
        score += 10;
      } else {
        missingItems.push({
          key: "university",
          label: "Add your institution",
          action: "/profile",
          priority: "high",
          unlocksFeature: "Institution-based matching",
        });
      }

      if (profile.interests && profile.interests.length > 0) {
        score += 10;
      } else {
        missingItems.push({
          key: "interests",
          label: "Add your research interests",
          action: "/profile",
          priority: "high",
          unlocksFeature: "Personalized opportunities",
        });
      }

      // Check verification (20 points)
      const { data: trustProfile } = await supabase
        .from("user_trust_profiles")
        .select("verification_level, trust_score")
        .eq("user_id", user.id)
        .maybeSingle();

      if ((trustProfile as any)?.verification_level === "verified") {
        score += 20;
      } else {
        missingItems.push({
          key: "verification",
          label: "Verify your identity",
          action: "/verification",
          priority: "high",
          unlocksFeature: "Higher trust tier + bidding priority",
        });
      }

      // Check profile header (15 points)
      const { data: header } = await supabase
        .from("profile_headers")
        .select("headline")
        .eq("user_id", user.id)
        .maybeSingle();

      if (header?.headline) {
        score += 15;
      } else {
        missingItems.push({
          key: "headline",
          label: "Add a professional headline",
          action: "/profile",
          priority: "medium",
        });
      }

      // Check work history (20 points)
      const { data: proofMetrics } = await supabase
        .from("profile_proof_metrics")
        .select("projects_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (proofMetrics?.projects_completed && proofMetrics.projects_completed > 0) {
        score += 20;
      } else {
        missingItems.push({
          key: "project",
          label: "Complete your first project",
          action: "/offers",
          priority: "medium",
          unlocksFeature: "Trust score boost + visibility",
        });
      }

      // Check skills (15 points)
      const { count: skillCount } = await supabase
        .from("user_skills")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (skillCount && skillCount > 0) {
        score += 15;
      } else {
        missingItems.push({
          key: "skills",
          label: "Add your skills",
          action: "/profile",
          priority: "medium",
          unlocksFeature: "Skill-based matching",
        });
      }

      // Sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      missingItems.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      return {
        score: Math.min(100, score),
        missingItems,
        nextAction: missingItems[0]?.label || null,
      };
    },
    enabled: !!user,
  });
}

function determinePrimaryRole(profile: any, metrics: any): PrimaryRole {
  // Check education level for student
  if (profile.education_level && ["undergraduate", "masters", "phd_candidate"].includes(profile.education_level)) {
    return "student";
  }

  // Check role field
  if (profile.role) {
    const role = profile.role.toLowerCase();
    if (role.includes("researcher") || role.includes("professor") || role.includes("scientist")) {
      return "researcher";
    }
    if (role.includes("student")) {
      return "student";
    }
    if (role.includes("mentor") || role.includes("advisor")) {
      return "mentor";
    }
  }

  // Check project completion for freelancer
  if (metrics?.projects_completed && metrics.projects_completed >= 3) {
    return "freelancer";
  }

  // Default based on research level
  if (profile.research_level === "senior" || profile.research_level === "principal") {
    return "researcher";
  }

  return "unknown";
}

function generateHeadline(profile: any, role: PrimaryRole, metrics: any): string {
  const parts: string[] = [];

  // Role-based prefix
  switch (role) {
    case "researcher":
      parts.push("Researcher");
      break;
    case "student":
      if (profile.education_level === "phd_candidate") {
        parts.push("PhD Candidate");
      } else if (profile.education_level === "masters") {
        parts.push("Graduate Student");
      } else {
        parts.push("Student");
      }
      break;
    case "freelancer":
      parts.push("Professional");
      break;
    case "mentor":
      parts.push("Mentor");
      break;
    default:
      parts.push("Member");
  }

  // Add department/field
  if (profile.department) {
    parts.push(`in ${profile.department}`);
  }

  // Add institution
  if (profile.university) {
    parts.push(`at ${profile.university}`);
  }

  // Add track record if notable
  if (metrics?.projects_completed && metrics.projects_completed >= 5) {
    parts.push(`• ${metrics.projects_completed} projects delivered`);
  }

  return parts.join(" ");
}

function getTrustTier(score: number): "bronze" | "silver" | "gold" | "platinum" {
  if (score >= 80) return "platinum";
  if (score >= 60) return "gold";
  if (score >= 40) return "silver";
  return "bronze";
}
