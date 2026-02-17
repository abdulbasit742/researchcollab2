import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFYPTopics(filters?: { status?: string; institutionId?: string; facultyId?: string }) {
  return useQuery({
    queryKey: ["fyp-topics", filters],
    queryFn: async () => {
      let query = (supabase as any)
        .from("fyp_topics")
        .select("*")
        .order("created_at", { ascending: false });
      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.institutionId) query = query.eq("institution_id", filters.institutionId);
      if (filters?.facultyId) query = query.eq("faculty_id", filters.facultyId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useFYPTopic(topicId?: string) {
  return useQuery({
    queryKey: ["fyp-topic", topicId],
    enabled: !!topicId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("fyp_topics")
        .select("*")
        .eq("id", topicId)
        .single();
      if (error) throw error;
      return data as any;
    },
  });
}

export function useFYPMilestoneTemplates(topicId?: string) {
  return useQuery({
    queryKey: ["fyp-milestone-templates", topicId],
    enabled: !!topicId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("fyp_milestones_template")
        .select("*")
        .eq("topic_id", topicId)
        .order("milestone_order", { ascending: true });
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useFYPTeams(topicId?: string) {
  return useQuery({
    queryKey: ["fyp-teams", topicId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("fyp_teams")
        .select("*")
        .order("created_at", { ascending: false });
      if (topicId) query = query.eq("topic_id", topicId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useFYPTeamMembers(teamId?: string) {
  return useQuery({
    queryKey: ["fyp-team-members", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("fyp_team_members")
        .select("*")
        .eq("team_id", teamId);
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useFYPApplications(topicId?: string) {
  return useQuery({
    queryKey: ["fyp-applications", topicId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("fyp_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (topicId) query = query.eq("topic_id", topicId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useFYPSponsorships(topicId?: string) {
  return useQuery({
    queryKey: ["fyp-sponsorships", topicId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("fyp_sponsorships")
        .select("*")
        .order("created_at", { ascending: false });
      if (topicId) query = query.eq("topic_id", topicId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useFYPExecutionTracks(topicId?: string, teamId?: string) {
  return useQuery({
    queryKey: ["fyp-execution-tracks", topicId, teamId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("fyp_execution_tracks")
        .select("*")
        .order("milestone_order", { ascending: true });
      if (topicId) query = query.eq("topic_id", topicId);
      if (teamId) query = query.eq("team_id", teamId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useFYPImpactMetrics(userId?: string) {
  return useQuery({
    queryKey: ["fyp-impact-metrics", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("fyp_impact_metrics")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
}

export function useFYPInstitutionStats(institutionId?: string) {
  return useQuery({
    queryKey: ["fyp-institution-stats", institutionId],
    queryFn: async () => {
      let topicsQuery = (supabase as any).from("fyp_topics").select("*", { count: "exact" });
      if (institutionId) topicsQuery = topicsQuery.eq("institution_id", institutionId);
      const { data: topics, count: topicCount } = await topicsQuery;

      let sponsorQuery = (supabase as any).from("fyp_sponsorships").select("*");
      const { data: sponsorships } = await sponsorQuery;

      let execQuery = (supabase as any).from("fyp_execution_tracks").select("*");
      const { data: execTracks } = await execQuery;

      const totalTopics = topicCount || (topics?.length || 0);
      const sponsorFunded = sponsorships?.filter((s: any) => s.status === 'active' || s.status === 'released')?.length || 0;
      const totalPledged = sponsorships?.reduce((s: number, sp: any) => s + Number(sp.pledge_amount || 0), 0) || 0;
      const totalFunded = sponsorships?.reduce((s: number, sp: any) => s + Number(sp.funded_amount || 0), 0) || 0;
      const completedMilestones = execTracks?.filter((t: any) => t.status === 'approved' || t.status === 'released')?.length || 0;
      const totalMilestones = execTracks?.length || 0;
      const totalReleased = execTracks?.reduce((s: number, t: any) => s + Number(t.released_amount || 0), 0) || 0;
      const sponsorReadyTopics = topics?.filter((t: any) => t.funding_type === 'sponsor_ready')?.length || 0;

      return {
        totalTopics,
        sponsorReadyTopics,
        sponsorFundedPct: totalTopics > 0 ? ((sponsorFunded / totalTopics) * 100) : 0,
        totalPledged,
        totalFunded,
        completedMilestones,
        totalMilestones,
        completionRate: totalMilestones > 0 ? ((completedMilestones / totalMilestones) * 100) : 0,
        totalRevenue: totalReleased,
      };
    },
  });
}
