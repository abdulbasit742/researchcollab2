import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminProject {
  id: string;
  title: string;
  description: string | null;
  budget_min: number | null;
  budget_max: number | null;
  deadline_days: number | null;
  status: string | null;
  tags: string[] | null;
  location: string | null;
  owner_id: string;
  created_at: string;
  owner_name?: string;
  bids_count?: number;
}

export function useAdminProjects() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data: projectsData, error } = await supabase
        .from("earning_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch owner names and bid counts
      const enrichedProjects = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: owner } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", project.owner_id)
            .maybeSingle();

          const { count: bidsCount } = await supabase
            .from("earning_bids")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id);

          return {
            ...project,
            owner_name: owner?.full_name || "Unknown",
            bids_count: bidsCount || 0,
          };
        })
      );

      setProjects(enrichedProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId: string, updates: Partial<AdminProject>) => {
    try {
      const { error } = await supabase
        .from("earning_projects")
        .update(updates)
        .eq("id", projectId);
      if (error) throw error;
      await fetchProjects();
      return { success: true };
    } catch (err: any) {
      console.error("Error updating project:", err);
      return { success: false, error: err.message };
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      // First delete related bids
      await supabase
        .from("earning_bids")
        .delete()
        .eq("project_id", projectId);

      const { error } = await supabase
        .from("earning_projects")
        .delete()
        .eq("id", projectId);
      if (error) throw error;
      await fetchProjects();
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting project:", err);
      return { success: false, error: err.message };
    }
  };

  const createProject = async (project: {
    title: string;
    description?: string;
    budget_min?: number;
    budget_max?: number;
    deadline_days?: number;
    tags?: string[];
    location?: string;
    owner_id: string;
  }) => {
    try {
      const { error } = await supabase
        .from("earning_projects")
        .insert({
          ...project,
          status: "open",
        });
      if (error) throw error;
      await fetchProjects();
      return { success: true };
    } catch (err: any) {
      console.error("Error creating project:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    projects,
    loading,
    refetch: fetchProjects,
    updateProject,
    deleteProject,
    createProject,
  };
}
