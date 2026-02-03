import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type OpportunityType = "project" | "grant" | "collaboration" | "institutional";

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  description: string | null;
  budget_min: number | null;
  budget_max: number | null;
  deadline_days: number | null;
  tags: string[];
  owner_id: string;
  owner_name: string | null;
  owner_university: string | null;
  created_at: string;
  status: string;
  match_reason?: string;
  match_score?: number;
}

export interface OpportunityFilters {
  type?: OpportunityType | "all";
  minBudget?: number;
  maxBudget?: number;
  tags?: string[];
  sortBy?: "relevance" | "newest" | "budget_high" | "budget_low";
}

export function useOpportunityEngine(filters: OpportunityFilters = {}) {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["opportunities", filters, user?.id],
    queryFn: async () => {
      // Fetch earning projects (main opportunity source)
      let query = supabase
        .from("earning_projects")
        .select(`
          id,
          title,
          description,
          budget_min,
          budget_max,
          deadline_days,
          tags,
          owner_id,
          created_at,
          status,
          location
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(50);

      if (filters.minBudget) {
        query = query.gte("budget_min", filters.minBudget);
      }
      if (filters.maxBudget) {
        query = query.lte("budget_max", filters.maxBudget);
      }

      const { data: projects, error } = await query;
      if (error) throw error;

      // Enrich with owner data and calculate match scores
      const userSkills = profile?.interests || [];
      const userUniversity = profile?.university || "";

      const enrichedOpportunities: Opportunity[] = await Promise.all(
        (projects || []).map(async (project: any) => {
          // Fetch owner profile
          const { data: ownerProfile } = await supabase
            .from("profiles")
            .select("full_name, university")
            .eq("id", project.owner_id)
            .maybeSingle();

          // Calculate match score based on skills and location
          let matchScore = 0;
          const matchReasons: string[] = [];

          const projectTags = project.tags || [];

          // Skill match
          const skillMatches = userSkills.filter((skill) =>
            projectTags.some((tag: string) =>
              tag.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(tag.toLowerCase())
            )
          );

          if (skillMatches.length > 0) {
            matchScore += skillMatches.length * 20;
            matchReasons.push(`Matches your skills: ${skillMatches.slice(0, 2).join(", ")}`);
          }

          // University match
          if (userUniversity && ownerProfile?.university === userUniversity) {
            matchScore += 15;
            matchReasons.push("Same institution");
          }

          // Location proximity (simplified)
          if (project.location && profile?.location) {
            if (project.location.toLowerCase().includes(profile.location.toLowerCase())) {
              matchScore += 10;
              matchReasons.push("In your area");
            }
          }

          return {
            id: project.id,
            type: "project" as OpportunityType,
            title: project.title,
            description: project.description,
            budget_min: project.budget_min,
            budget_max: project.budget_max,
            deadline_days: project.deadline_days,
            tags: projectTags,
            owner_id: project.owner_id,
            owner_name: ownerProfile?.full_name || null,
            owner_university: ownerProfile?.university || null,
            created_at: project.created_at,
            status: project.status || "open",
            match_score: matchScore,
            match_reason: matchReasons.length > 0 ? matchReasons[0] : undefined,
          };
        })
      );

      // Sort by relevance (match score) or other criteria
      let sorted = [...enrichedOpportunities];

      switch (filters.sortBy) {
        case "relevance":
          sorted.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
          break;
        case "newest":
          sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case "budget_high":
          sorted.sort((a, b) => (b.budget_max || 0) - (a.budget_max || 0));
          break;
        case "budget_low":
          sorted.sort((a, b) => (a.budget_min || 0) - (b.budget_min || 0));
          break;
        default:
          // Default: mix of relevance and recency
          sorted.sort((a, b) => {
            const scoreA = (a.match_score || 0) + (new Date(a.created_at).getTime() / 1e12);
            const scoreB = (b.match_score || 0) + (new Date(b.created_at).getTime() / 1e12);
            return scoreB - scoreA;
          });
      }

      return sorted;
    },
    enabled: true,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useSavedOpportunities() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["savedOpportunities", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10) as any;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useOpportunityStats() {
  return useQuery({
    queryKey: ["opportunityStats"],
    queryFn: async () => {
      const { count: projectCount } = await supabase
        .from("earning_projects")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");

      const { data: recentProjects } = await supabase
        .from("earning_projects")
        .select("budget_min, budget_max")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(20);

      let avgBudget = 0;
      if (recentProjects && recentProjects.length > 0) {
        avgBudget = (recentProjects as any[]).reduce((acc, p) => {
          const avg = ((p.budget_min || 0) + (p.budget_max || 0)) / 2;
          return acc + avg;
        }, 0);
      }

      return {
        totalOpen: projectCount || 0,
        avgBudget: recentProjects?.length ? Math.round(avgBudget / recentProjects.length) : 0,
        newThisWeek: projectCount || 0, // Simplified
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
