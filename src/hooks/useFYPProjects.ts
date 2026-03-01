/**
 * useFYPProjects — Real database queries for FYP projects, replacing mock data.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FYPProject {
  id: string;
  project_title: string;
  domain: string | null;
  status: string;
  trust_weight: number | null;
  economic_value: number | null;
  final_score: number | null;
  milestones: FYPMilestone[];
  student_id: string;
  supervisor_id: string | null;
  institution_id: string | null;
  created_at: string | null;
  // Enriched
  student_name?: string;
  supervisor_name?: string;
}

export interface FYPMilestone {
  name: string;
  status: string;
  due: string;
}

export function useFYPProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["fypProjects", user?.id],
    queryFn: async (): Promise<FYPProject[]> => {
      if (!user) return [];

      // Fetch FYPs where user is student or supervisor
      const { data, error } = await supabase
        .from("fyp_projects")
        .select("*")
        .or(`student_id.eq.${user.id},supervisor_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Collect unique user IDs for profile enrichment
      const userIds = new Set<string>();
      data.forEach((fyp: any) => {
        userIds.add(fyp.student_id);
        if (fyp.supervisor_id) userIds.add(fyp.supervisor_id);
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", Array.from(userIds));

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      return data.map((fyp: any) => ({
        id: fyp.id,
        project_title: fyp.project_title,
        domain: fyp.domain,
        status: fyp.status || "proposal",
        trust_weight: fyp.trust_weight,
        economic_value: fyp.economic_value,
        final_score: fyp.final_score,
        milestones: Array.isArray(fyp.milestones) ? fyp.milestones : [],
        student_id: fyp.student_id,
        supervisor_id: fyp.supervisor_id,
        institution_id: fyp.institution_id,
        created_at: fyp.created_at,
        student_name: profileMap.get(fyp.student_id) || "Unknown",
        supervisor_name: fyp.supervisor_id ? (profileMap.get(fyp.supervisor_id) || "Unknown") : null,
      }));
    },
    enabled: !!user,
  });
}

export function useFYPStats(projects: FYPProject[]) {
  const totalFYPs = projects.length;
  const activeProjects = projects.filter(f => f.status === "active").length;
  const completedProjects = projects.filter(f => f.status === "completed").length;
  const totalEconomicValue = projects.reduce((s, f) => s + (f.economic_value || 0), 0);

  const allMilestones = projects.flatMap(f => f.milestones);
  const completedMilestones = allMilestones.filter(m => m.status === "completed").length;
  const totalMilestones = allMilestones.length;
  const completionRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return {
    totalFYPs,
    activeProjects,
    completedProjects,
    totalEconomicValue,
    completionRate,
    completedMilestones,
    totalMilestones,
  };
}
