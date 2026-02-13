import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSupervisorReviews(projectId?: string) {
  return useQuery({
    queryKey: ["supervisor-reviews", projectId],
    queryFn: async () => {
      let query = supabase
        .from("supervisor_reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (projectId) query = query.eq("project_id", projectId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useStudentMetrics(studentId?: string) {
  return useQuery({
    queryKey: ["student-metrics", studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const { data, error } = await supabase
        .from("student_performance_metrics")
        .select("*")
        .eq("student_id", studentId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

export function useFYPRiskFlags(projectId?: string) {
  return useQuery({
    queryKey: ["fyp-risk-flags", projectId],
    queryFn: async () => {
      let query = supabase
        .from("fyp_risk_flags")
        .select("*")
        .order("created_at", { ascending: false });
      if (projectId) query = query.eq("project_id", projectId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useAcademicTasks(filters?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: ["academic-tasks", filters],
    queryFn: async () => {
      let query = supabase
        .from("micro_academic_tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.type) query = query.eq("task_type", filters.type);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useSupervisorMetrics(supervisorId?: string) {
  return useQuery({
    queryKey: ["supervisor-metrics", supervisorId],
    queryFn: async () => {
      if (!supervisorId) return null;
      const { data, error } = await supabase
        .from("supervisor_performance_metrics")
        .select("*")
        .eq("supervisor_id", supervisorId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!supervisorId,
  });
}

export function useEmployabilityReport(userId?: string) {
  return useQuery({
    queryKey: ["employability-report", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("employability_reports")
        .select("*")
        .eq("user_id", userId)
        .order("generated_at", { ascending: false })
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// Rankings queries
export function useTopStudents(limit = 10) {
  return useQuery({
    queryKey: ["top-students", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_performance_metrics")
        .select("*")
        .order("trust_growth", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}

export function useTopSupervisors(limit = 10) {
  return useQuery({
    queryKey: ["top-supervisors", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supervisor_performance_metrics")
        .select("*")
        .order("student_completion_rate", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}
